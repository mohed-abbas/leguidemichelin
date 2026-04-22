import { prisma } from "@repo/db";
import type { PrismaClient, MichelinRating as PrismaMichelinRating } from "@prisma/client";
import { BusinessError } from "../errors.js";

type TxClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

/**
 * Point awards by Michelin tier (v1 spec).
 * Bib Gourmand = 50, ★ = 100, ★★ = 300, ★★★ = 1000.
 */
export function pointsForRating(rating: PrismaMichelinRating): number {
  switch (rating) {
    case "BIB":
      return 50;
    case "ONE":
      return 100;
    case "TWO":
      return 300;
    case "THREE":
      return 1000;
  }
}

export interface AwardPointsInput {
  userId: string;
  restaurantId: string;
  dishId: string;
  note?: string | null;
  imageKey: string;
  usedDefaultImage: boolean;
}

/**
 * Atomic souvenir mint (Phase 3 success criterion #3).
 *
 *   - Verify restaurant exists and is NOT disabled (D-08).
 *   - Verify dish exists AND belongs to that restaurant.
 *   - In ONE prisma.$transaction:
 *       1) insert Souvenir (denormalized fields: pointsAwarded, usedDefaultImage)
 *       2) insert PointTransaction (source=SOUVENIR_MINT, delta=+pointsAwarded, souvenirId)
 *       3) increment User.totalPoints by pointsAwarded
 *
 * Returns the souvenir JOINED with restaurant + dish so the caller can
 * build the Plan 02 SouvenirResponse (with denormalized restaurantName etc.)
 * without a follow-up query.
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

  const pointsAwarded = pointsForRating(restaurant.michelinRating);

  const result = await prisma.$transaction(async (tx: TxClient) => {
    const souvenir = await tx.souvenir.create({
      data: {
        userId,
        restaurantId: restaurant.id,
        dishId: dish.id,
        note: note ?? null,
        imageKey,
        usedDefaultImage,
        pointsAwarded,
      },
    });
    await tx.pointTransaction.create({
      data: {
        userId,
        delta: pointsAwarded,
        source: "SOUVENIR_MINT",
        souvenirId: souvenir.id,
      },
    });
    const user = await tx.user.update({
      where: { id: userId },
      data: { totalPoints: { increment: pointsAwarded } },
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
