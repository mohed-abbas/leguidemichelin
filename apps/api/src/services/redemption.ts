import { prisma } from "@repo/db";
import type { PrismaClient } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { BusinessError } from "../errors.js";

type TxClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

/**
 * Generate a mock redemption code: REDEEM-<8 hex chars>.
 * The Redemption.code column is @unique — a re-seed + collision path can retry.
 * For v1 demo scale, collisions are effectively impossible; no retry loop.
 */
function generateCode(): string {
  const uuid = randomUUID().replace(/-/g, "");
  return `REDEEM-${uuid.slice(0, 8).toUpperCase()}`;
}

export interface RedeemRewardInput {
  userId: string;
  rewardId: string;
}

/**
 * Atomic reward redemption (Phase 3 success criterion #3).
 *
 *   1) Load + validate the reward (exists, active:true).
 *   2) In ONE prisma.$transaction:
 *        a) Guarded decrement: updateMany({ where: { id: userId, totalPoints: { gte: cost } }, decrement }).
 *           If count === 0, the balance was insufficient (atomic — Postgres handles the lock
 *           within the single UPDATE). Throw BusinessError('insufficient_balance', 409).
 *        b) Insert Redemption with mock code.
 *        c) Insert negative PointTransaction (source=REDEMPTION, delta=-cost, redemptionId).
 *
 * Returns { redemption, reward, newBalance } for the HTTP handler.
 *
 * Why updateMany vs SELECT FOR UPDATE? updateMany with a WHERE clause that
 * includes the balance check resolves the full atomic compare-and-swap in a
 * single SQL statement (UPDATE user SET totalPoints = totalPoints - X
 * WHERE id = Y AND totalPoints >= X). Postgres acquires a row lock for the
 * UPDATE; the lock is held for the duration of the $transaction. Two
 * concurrent calls race through the SQL engine; exactly one succeeds
 * (count=1); the other gets count=0 → throws. No SELECT FOR UPDATE
 * boilerplate, no Prisma extension needed.
 */
export async function redeemReward(input: RedeemRewardInput) {
  const { userId, rewardId } = input;

  const reward = await prisma.reward.findFirst({
    where: { id: rewardId, active: true },
  });
  if (!reward) throw new BusinessError("not_found", 404, "reward not found");

  const code = generateCode();

  const result = await prisma.$transaction(async (tx: TxClient) => {
    // Atomic balance guard — the ONLY place User.totalPoints is decremented.
    const updated = await tx.user.updateMany({
      where: { id: userId, totalPoints: { gte: reward.pointsCost } },
      data: { totalPoints: { decrement: reward.pointsCost } },
    });
    if (updated.count === 0) {
      throw new BusinessError("insufficient_balance", 409, `needs ${reward.pointsCost} points`);
    }

    // Guard: each reward can only be redeemed once per user (WR-04).
    const existing = await tx.redemption.findFirst({
      where: { userId, rewardId: reward.id },
      select: { id: true },
    });
    if (existing) {
      throw new BusinessError("already_redeemed", 409, "reward already redeemed");
    }

    const redemption = await tx.redemption.create({
      data: {
        userId,
        rewardId: reward.id,
        code,
        pointsSpent: reward.pointsCost,
      },
    });

    await tx.pointTransaction.create({
      data: {
        userId,
        delta: -reward.pointsCost,
        source: "REDEMPTION",
        redemptionId: redemption.id,
      },
    });

    // Read the new balance to return in the response (WR-05: guard null).
    const after = await tx.user.findUnique({
      where: { id: userId },
      select: { totalPoints: true },
    });
    if (!after) throw new BusinessError("internal", 500, "could not read updated balance");
    return { redemption, newBalance: after.totalPoints };
  });

  return { redemption: result.redemption, reward, newBalance: result.newBalance };
}
