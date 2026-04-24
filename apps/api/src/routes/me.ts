import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "@repo/db";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { thumbKeyFor } from "../images/pipeline.js";
import {
  toggleFavorite,
  listUserFavorites,
  removeFavorite,
} from "../services/favorites.js";

export const meRouter = Router();

meRouter.use(requireAuth);

/**
 * GET /api/me/souvenirs — all souvenirs for the authenticated diner, newest first.
 *
 * Includes:
 *   - denormalized restaurantName / restaurantCity / michelinRating (D-10)
 *     so the diner's history renders even after a restaurant is soft-disabled.
 *   - visitedRestaurantIds (distinct) — powers the map "filled gold star" branch
 *     in Phase 4 Track A without requiring a per-pin fetch.
 */
meRouter.get("/souvenirs", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthedRequest).user;
    const rows = await prisma.souvenir.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        restaurant: { select: { name: true, city: true, michelinRating: true } },
        dish: { select: { name: true } },
      },
    });
    const visitedRestaurantIds = Array.from(new Set(rows.map((r) => r.restaurantId)));
    res.json({
      items: rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        restaurantId: r.restaurantId,
        restaurantName: r.restaurant.name,
        restaurantCity: r.restaurant.city,
        michelinRating: r.restaurant.michelinRating,
        dishId: r.dishId,
        dishName: r.dish.name,
        note: r.note,
        imageKey: r.imageKey,
        thumbKey: thumbKeyFor(r.imageKey),
        usedDefaultImage: r.usedDefaultImage,
        pointsAwarded: r.pointsAwarded,
        createdAt: r.createdAt.toISOString(),
      })),
      visitedRestaurantIds,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/me/points — balance + ledger.
 *   balance from denormalized User.totalPoints (O(1) — authoritative post-mint/redeem).
 *   ledger from PointTransaction joined with souvenir/reward for human labels.
 */
meRouter.get("/points", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthedRequest).user;
    const [userRow, txns] = await Promise.all([
      prisma.user.findUnique({ where: { id: user.id }, select: { totalPoints: true } }),
      prisma.pointTransaction.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          souvenir: { include: { restaurant: { select: { name: true } } } },
          redemption: { include: { reward: { select: { title: true } } } },
          review: { include: { restaurant: { select: { name: true } } } },
        },
      }),
    ]);
    if (!userRow) {
      // requireAuth blocks deleted users already, but stay defensive.
      res.status(401).json({ error: "unauthenticated" });
      return;
    }

    const ledger = txns.map((t) => {
      let label: string;
      if (t.source === "SOUVENIR_MINT" && t.souvenir) {
        label = `Souvenir @ ${t.souvenir.restaurant.name}`;
      } else if (t.source === "REDEMPTION" && t.redemption) {
        label = `Redeemed ${t.redemption.reward.title}`;
      } else if (t.source === "REVIEW_BONUS" && t.review) {
        label = `Avis @ ${t.review.restaurant.name}`;
      } else if (t.source === "SOUVENIR_MINT") {
        label = "Souvenir";
      } else if (t.source === "REDEMPTION") {
        label = "Redemption";
      } else {
        label = "Avis";
      }
      return {
        id: t.id,
        userId: t.userId,
        delta: t.delta,
        source: t.source,
        souvenirId: t.souvenirId,
        redemptionId: t.redemptionId,
        reviewId: t.reviewId,
        label,
        createdAt: t.createdAt.toISOString(),
      };
    });

    res.json({ balance: userRow.totalPoints, ledger });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/me/redemptions — newest-first redemption history.
 * requireAuth already applied at router level (Plan 06).
 */
meRouter.get("/redemptions", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as AuthedRequest).user;
    const rows = await prisma.redemption.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { reward: true },
    });
    res.json({
      items: rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        rewardId: r.rewardId,
        code: r.code,
        pointsSpent: r.pointsSpent,
        reward: {
          id: r.reward.id,
          title: r.reward.title,
          description: r.reward.description,
          pointsCost: r.reward.pointsCost,
          imageKey: r.reward.imageKey,
          active: r.reward.active,
          createdAt: r.reward.createdAt.toISOString(),
          updatedAt: r.reward.updatedAt.toISOString(),
        },
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// ─── Phase 04.1: Favorites ─────────────────────────────────────────────
// All three use session-derived userId (requireAuth at router level).
// No body parsing needed — path param + session is sufficient.
// PITFALL #7 / T-04.1-13: userId ONLY from (req as AuthedRequest).user.id —
// never from body/params/query.

meRouter.post(
  "/favorites/:restaurantId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthedRequest).user;
      const restaurantId = String(req.params.restaurantId);
      const result = await toggleFavorite({ userId: user.id, restaurantId });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

meRouter.get(
  "/favorites",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthedRequest).user;
      const result = await listUserFavorites({ userId: user.id });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);

meRouter.delete(
  "/favorites/:restaurantId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthedRequest).user;
      const restaurantId = String(req.params.restaurantId);
      const result = await removeFavorite({ userId: user.id, restaurantId });
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
);
