import { z } from "zod";
import { MichelinRating } from "./restaurants.js";

/** Raw Favorite row (matches Prisma Favorite model from Plan 01). */
export const FavoriteResponse = z.object({
  id: z.string(),
  userId: z.string(),
  restaurantId: z.string(),
  createdAt: z.string(),
});
export type FavoriteResponseType = z.infer<typeof FavoriteResponse>;

/** POST + DELETE /api/me/favorites/:restaurantId response. favorite is null when favorited=false. */
export const ToggleFavoriteResponse = z.object({
  favorited: z.boolean(),
  favorite: FavoriteResponse.nullable(),
});
export type ToggleFavoriteResponseType = z.infer<typeof ToggleFavoriteResponse>;

/** Denormalized card for /favorites list (Phase 3 D-10 pattern; soft-disabled filtered out server-side). */
export const FavoriteRestaurantCard = z.object({
  id: z.string(),
  restaurantId: z.string(),
  restaurantName: z.string(),
  restaurantCity: z.string(),
  michelinRating: MichelinRating,
  cuisine: z.string().nullable(),
  heroImageKey: z.string().nullable(),
  favoritedAt: z.string(),
});
export type FavoriteRestaurantCardType = z.infer<typeof FavoriteRestaurantCard>;

/** GET /api/me/favorites — newest-first. */
export const MeFavoritesResponse = z.object({
  items: z.array(FavoriteRestaurantCard),
});
export type MeFavoritesResponseType = z.infer<typeof MeFavoritesResponse>;
