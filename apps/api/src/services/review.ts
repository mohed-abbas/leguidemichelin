import { prisma } from "@repo/db";
import type { PrismaClient } from "@prisma/client";
import { BusinessError } from "../errors.js";

type TxClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

/** Bonus awarded for submitting a restaurant review (Figma 59:555 — "1 étoile"). */
export const REVIEW_BONUS_POINTS = 1;

export interface CreateReviewInput {
  userId: string;
  restaurantId: string;
  souvenirId?: string;
  productsQuality: number;
  cookingAccuracy: number;
  worthTheVisit: number;
  experienceSmooth: number;
  valueForMoney: number;
  consistency: number;
}

/**
 * Atomic review submission.
 *
 *  - Verify restaurant exists and is NOT soft-disabled.
 *  - If souvenirId provided: verify it belongs to this user AND to this restaurant.
 *    Enforce one-review-per-souvenir (@unique on souvenirId).
 *  - In one prisma.$transaction:
 *     1) insert Review (6 ratings + bonus)
 *     2) insert PointTransaction (source=REVIEW_BONUS, delta=+1, reviewId)
 *     3) increment User.totalPoints by REVIEW_BONUS_POINTS
 */
export async function createReview(input: CreateReviewInput) {
  const { userId, restaurantId, souvenirId, ...ratings } = input;

  const restaurant = await prisma.restaurant.findFirst({
    where: { id: restaurantId, disabledAt: null },
    select: { id: true, name: true },
  });
  if (!restaurant) throw new BusinessError("not_found", 404, "restaurant not found");

  if (souvenirId) {
    const souvenir = await prisma.souvenir.findFirst({
      where: { id: souvenirId, userId, restaurantId: restaurant.id },
      select: { id: true, review: { select: { id: true } } },
    });
    if (!souvenir) throw new BusinessError("not_found", 404, "souvenir not found");
    if (souvenir.review)
      throw new BusinessError("already_redeemed", 409, "review already submitted");
  }

  const result = await prisma.$transaction(async (tx: TxClient) => {
    const review = await tx.review.create({
      data: {
        userId,
        restaurantId: restaurant.id,
        souvenirId: souvenirId ?? null,
        ...ratings,
        bonusPointsAwarded: REVIEW_BONUS_POINTS,
      },
    });
    await tx.pointTransaction.create({
      data: {
        userId,
        delta: REVIEW_BONUS_POINTS,
        source: "REVIEW_BONUS",
        reviewId: review.id,
      },
    });
    const user = await tx.user.update({
      where: { id: userId },
      data: { totalPoints: { increment: REVIEW_BONUS_POINTS } },
      select: { totalPoints: true },
    });
    return { review, newBalance: user.totalPoints };
  });

  return result;
}
