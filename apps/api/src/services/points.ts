import { prisma } from "@repo/db";
import type { PrismaClient } from "@prisma/client";
import { BusinessError } from "../errors.js";

type TxClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export interface AwardPointsInput {
  userId: string;
  restaurantId: string;
  dishId: string;
  note?: string | null;
  imageKey: string;
  usedDefaultImage: boolean;
}

/** Base star awarded by a souvenir mint (one per visit). */
export const SOUVENIR_BASE_STARS = 1;

/**
 * Atomic souvenir mint — star-based ledger.
 *   - Always +1 star per visit (SOUVENIR_MINT).
 *   - The +1 review bonus is awarded SEPARATELY by createReview()
 *     (source=REVIEW_BONUS), never by this service.
 *
 * Insert Souvenir + PointTransaction (+1) + increment User.totalPoints, all
 * inside one prisma.$transaction.
 */
export async function awardPoints(input: AwardPointsInput) {
  const { userId, restaurantId, dishId, note, imageKey, usedDefaultImage } = input;

  const restaurant = await prisma.restaurant.findFirst({
    where: { id: restaurantId, disabledAt: null },
    select: { id: true, michelinRating: true, name: true, city: true },
  });
  if (!restaurant) throw new BusinessError("not_found", 404, "restaurant not found");

  const dish = await prisma.dish.findFirst({
    where: { id: dishId, restaurantId: restaurant.id },
    select: { id: true, name: true },
  });
  if (!dish) throw new BusinessError("not_found", 404, "dish not found");

  const starsAwarded = SOUVENIR_BASE_STARS;

  const result = await prisma.$transaction(async (tx: TxClient) => {
    const souvenir = await tx.souvenir.create({
      data: {
        userId,
        restaurantId: restaurant.id,
        dishId: dish.id,
        note: note ?? null,
        imageKey,
        usedDefaultImage,
        pointsAwarded: starsAwarded,
      },
    });
    await tx.pointTransaction.create({
      data: {
        userId,
        delta: starsAwarded,
        source: "SOUVENIR_MINT",
        souvenirId: souvenir.id,
      },
    });
    const user = await tx.user.update({
      where: { id: userId },
      data: { totalPoints: { increment: starsAwarded } },
      select: { totalPoints: true },
    });
    return { souvenir, newBalance: user.totalPoints };
  });

  return {
    souvenir: result.souvenir,
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      city: restaurant.city,
      michelinRating: restaurant.michelinRating,
    },
    dish: { id: dish.id, name: dish.name },
    newBalance: result.newBalance,
  };
}
