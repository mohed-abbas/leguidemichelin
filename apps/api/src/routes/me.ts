import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "@repo/db";
import { requireAuth, type AuthedRequest } from "../middleware/auth.js";
import { thumbKeyFor } from "../images/pipeline.js";

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
      } else {
        label = t.source === "SOUVENIR_MINT" ? "Souvenir" : "Redemption";
      }
      return {
        id: t.id,
        userId: t.userId,
        delta: t.delta,
        source: t.source,
        souvenirId: t.souvenirId,
        redemptionId: t.redemptionId,
        label,
        createdAt: t.createdAt.toISOString(),
      };
    });

    res.json({ balance: userRow.totalPoints, ledger });
  } catch (err) {
    next(err);
  }
});
