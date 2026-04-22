import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "@repo/db";

/**
 * GET /api/rewards — PUBLIC list of currently-active rewards.
 * No session required (anonymous diners browsing perks is fine; redemption
 * itself requires DINER role in POST /api/redeem).
 */
export const rewardsRouter = Router();

function toRewardResponse(r: {
  id: string;
  title: string;
  description: string | null;
  pointsCost: number;
  imageKey: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    pointsCost: r.pointsCost,
    imageKey: r.imageKey,
    active: r.active,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

rewardsRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await prisma.reward.findMany({
      where: { active: true },
      orderBy: [{ pointsCost: "asc" }, { title: "asc" }],
    });
    res.json({ items: rows.map(toRewardResponse) });
  } catch (err) {
    next(err);
  }
});
