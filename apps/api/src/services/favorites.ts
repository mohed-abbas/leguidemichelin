import { prisma } from "@repo/db";
import type { PrismaClient } from "@prisma/client";
import { BusinessError } from "../errors.js";

type TxClient = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export interface ToggleFavoriteInput {
  userId: string;
  restaurantId: string;
}

/**
 * Idempotent toggle. Inside a $transaction:
 *   - if (userId, restaurantId) row exists → delete, return { favorited: false, favorite: null }
 *   - else → create, return { favorited: true, favorite: row }
 * Pre-flight 404 if the restaurant is missing OR soft-disabled (D-08).
 * DB-level @@unique([userId, restaurantId]) catches any P2002 race fallback.
 *
 * PITFALL #7 / T-04.1-07 / T-04.1-11: userId must be derived from the session
 * by the route handler — NEVER accept a userId from body/query/params. This
 * service trusts its input caller to have done so.
 */
export async function toggleFavorite(input: ToggleFavoriteInput) {
  const { userId, restaurantId } = input;

  const restaurant = await prisma.restaurant.findFirst({
    where: { id: restaurantId, disabledAt: null },
    select: { id: true },
  });
  if (!restaurant) {
    throw new BusinessError("not_found", 404, "restaurant not found");
  }

  return prisma.$transaction(async (tx: TxClient) => {
    const existing = await tx.favorite.findUnique({
      where: { userId_restaurantId: { userId, restaurantId } },
      select: { id: true },
    });

    if (existing) {
      await tx.favorite.delete({
        where: { userId_restaurantId: { userId, restaurantId } },
      });
      return { favorited: false as const, favorite: null };
    }

    const row = await tx.favorite.create({
      data: { userId, restaurantId },
      select: { id: true, userId: true, restaurantId: true, createdAt: true },
    });
    return {
      favorited: true as const,
      favorite: {
        id: row.id,
        userId: row.userId,
        restaurantId: row.restaurantId,
        createdAt: row.createdAt.toISOString(),
      },
    };
  });
}

/**
 * Idempotent delete. Returns { favorited: false, favorite: null } whether or not a row existed.
 * Pre-flight 404 ONLY for non-existent/disabled restaurants — never 404 for missing favorite.
 */
export async function removeFavorite(input: ToggleFavoriteInput) {
  const { userId, restaurantId } = input;
  const restaurant = await prisma.restaurant.findFirst({
    where: { id: restaurantId, disabledAt: null },
    select: { id: true },
  });
  if (!restaurant) {
    throw new BusinessError("not_found", 404, "restaurant not found");
  }
  await prisma.favorite.deleteMany({
    where: { userId, restaurantId },
  });
  return { favorited: false as const, favorite: null };
}

/**
 * List favorites for a user, newest-first. Filters out favorites whose restaurant is soft-disabled (D-08).
 * Returns denormalized cards (Phase 3 D-10 convention — flat fields, no nested restaurant object).
 */
export async function listUserFavorites(input: { userId: string }) {
  const rows = await prisma.favorite.findMany({
    where: {
      userId: input.userId,
      restaurant: { disabledAt: null },
    },
    orderBy: { createdAt: "desc" },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          city: true,
          michelinRating: true,
          cuisine: true,
          heroImageKey: true,
        },
      },
    },
  });
  return {
    items: rows.map((r) => ({
      id: r.id,
      restaurantId: r.restaurant.id,
      restaurantName: r.restaurant.name,
      restaurantCity: r.restaurant.city,
      michelinRating: r.restaurant.michelinRating,
      cuisine: r.restaurant.cuisine,
      heroImageKey: r.restaurant.heroImageKey,
      favoritedAt: r.createdAt.toISOString(),
    })),
  };
}

/**
 * Returns true if the user has favorited the restaurant.
 * Used by GET /api/restaurants/:id/menu when optionalAuth attaches req.user.
 * Never throws for "not found" — a missing row is simply false.
 */
export async function isFavoritedBy(input: ToggleFavoriteInput): Promise<boolean> {
  const row = await prisma.favorite.findUnique({
    where: {
      userId_restaurantId: { userId: input.userId, restaurantId: input.restaurantId },
    },
    select: { id: true },
  });
  return row !== null;
}
