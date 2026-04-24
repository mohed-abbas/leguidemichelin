import { z } from "zod";

/**
 * Rating domain — 1 to 3 Michelin-flower marks (Figma node 59:475).
 * Each question renders 3 StarNote buttons; the user picks one.
 */
export const ReviewRating = z.number().int().min(1).max(3);
export type ReviewRatingType = z.infer<typeof ReviewRating>;

/**
 * POST /api/reviews body.
 * Six fixed questions from the Figma questionnaire, plus the restaurant and
 * optional souvenir that anchor the review to a visit.
 */
export const ReviewCreateInput = z.object({
  restaurantId: z.string().min(1),
  souvenirId: z.string().min(1).optional(),
  productsQuality: ReviewRating,
  cookingAccuracy: ReviewRating,
  worthTheVisit: ReviewRating,
  experienceSmooth: ReviewRating,
  valueForMoney: ReviewRating,
  consistency: ReviewRating,
});
export type ReviewCreateInputType = z.infer<typeof ReviewCreateInput>;

/** POST /api/reviews response. */
export const ReviewResponse = z.object({
  id: z.string(),
  userId: z.string(),
  restaurantId: z.string(),
  souvenirId: z.string().nullable(),
  productsQuality: ReviewRating,
  cookingAccuracy: ReviewRating,
  worthTheVisit: ReviewRating,
  experienceSmooth: ReviewRating,
  valueForMoney: ReviewRating,
  consistency: ReviewRating,
  bonusPointsAwarded: z.number().int().nonnegative(),
  newBalance: z.number().int().nonnegative(),
  createdAt: z.string(),
});
export type ReviewResponseType = z.infer<typeof ReviewResponse>;
