import { Router, type Request, type Response, type NextFunction } from "express";
import { ReviewCreateInput } from "@repo/shared-schemas";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import { ValidationError } from "../errors.js";
import { createReview } from "../services/review.js";

export const reviewsRouter = Router();

/**
 * POST /api/reviews — atomic review submission (Figma node 59:475).
 *
 * Body (JSON):
 *   {
 *     restaurantId, souvenirId?, productsQuality, cookingAccuracy,
 *     worthTheVisit, experienceSmooth, valueForMoney, consistency
 *   }
 *
 * Diner-only. Awards REVIEW_BONUS_POINTS in one transaction.
 */
reviewsRouter.post(
  "/",
  requireAuth,
  requireRole("DINER"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthedRequest).user;
      const parsed = ReviewCreateInput.safeParse(req.body);
      if (!parsed.success) throw new ValidationError(parsed.error);

      const { review, newBalance } = await createReview({
        userId: user.id,
        ...parsed.data,
      });

      res.status(201).json({
        id: review.id,
        userId: review.userId,
        restaurantId: review.restaurantId,
        souvenirId: review.souvenirId,
        productsQuality: review.productsQuality,
        cookingAccuracy: review.cookingAccuracy,
        worthTheVisit: review.worthTheVisit,
        experienceSmooth: review.experienceSmooth,
        valueForMoney: review.valueForMoney,
        consistency: review.consistency,
        bonusPointsAwarded: review.bonusPointsAwarded,
        newBalance,
        createdAt: review.createdAt.toISOString(),
      });
    } catch (err) {
      next(err);
    }
  },
);
