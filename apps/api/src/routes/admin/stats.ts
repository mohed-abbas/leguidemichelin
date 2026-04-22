import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "@repo/db";

export const adminStatsRouter = Router();

/**
 * GET /api/admin/stats — dashboard aggregator.
 *
 * 5 groups per AdminStatsResponse:
 *   - restaurants: { active, disabled }
 *   - users:       { diners, staff, admins }
 *   - souvenirs:   { total, last7d }
 *   - redemptions: { total, last7d }
 *   - totalPointsOutstanding: sum of User.totalPoints
 *
 * All 10 counts run in parallel via Promise.all. Each is a Prisma count()
 * over a small indexed filter + one aggregate for the points sum — cheap at
 * demo scale (< 500 rows across all tables).
 */
adminStatsRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      activeRestaurants,
      disabledRestaurants,
      diners,
      staff,
      admins,
      souvenirsTotal,
      souvenirsLast7d,
      redemptionsTotal,
      redemptionsLast7d,
      pointsAgg,
    ] = await Promise.all([
      prisma.restaurant.count({ where: { disabledAt: null } }),
      prisma.restaurant.count({ where: { disabledAt: { not: null } } }),
      prisma.user.count({ where: { role: "DINER" } }),
      prisma.user.count({ where: { role: "RESTAURANT_STAFF" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.souvenir.count(),
      prisma.souvenir.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.redemption.count(),
      prisma.redemption.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.aggregate({ _sum: { totalPoints: true } }),
    ]);

    res.json({
      restaurants: { active: activeRestaurants, disabled: disabledRestaurants },
      users: { diners, staff, admins },
      souvenirs: { total: souvenirsTotal, last7d: souvenirsLast7d },
      redemptions: { total: redemptionsTotal, last7d: redemptionsLast7d },
      totalPointsOutstanding: pointsAgg._sum.totalPoints ?? 0,
    });
  } catch (err) {
    next(err);
  }
});
