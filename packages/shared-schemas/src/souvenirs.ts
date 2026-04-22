import { z } from "zod";
import { MichelinRating } from "./restaurants.js";

/**
 * POST /api/souvenirs body (JSON portion of multipart).
 * Image file is under multer field "image"; this schema covers dishId + note only.
 */
export const SouvenirMintInput = z.object({
  dishId: z.string().min(1),
  note: z.string().max(280).optional(),
});
export type SouvenirMintInputType = z.infer<typeof SouvenirMintInput>;

/**
 * Souvenir response shape.
 * Denormalized restaurantName / restaurantCity / michelinRating per D-10:
 * if the restaurant is later disabled, the diner's history keeps displaying.
 */
export const SouvenirResponse = z.object({
  id: z.string(),
  userId: z.string(),
  restaurantId: z.string(),
  restaurantName: z.string(),
  restaurantCity: z.string(),
  michelinRating: MichelinRating,
  dishId: z.string(),
  dishName: z.string(),
  note: z.string().nullable(),
  imageKey: z.string(),
  thumbKey: z.string(),
  usedDefaultImage: z.boolean(),
  pointsAwarded: z.number().int(),
  createdAt: z.string(),
});
export type SouvenirResponseType = z.infer<typeof SouvenirResponse>;

/**
 * GET /api/me/souvenirs response. `visitedRestaurantIds` lets the map surface
 * one-shot-query "which pins are filled gold star?" without scanning items.
 */
export const MeSouvenirsResponse = z.object({
  items: z.array(SouvenirResponse),
  visitedRestaurantIds: z.array(z.string()),
});
export type MeSouvenirsResponseType = z.infer<typeof MeSouvenirsResponse>;
