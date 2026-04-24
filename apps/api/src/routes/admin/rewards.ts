import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "@repo/db";
import { AdminRewardCreate, AdminRewardPatch } from "@repo/shared-schemas";
import { ValidationError, BusinessError } from "../../errors.js";

export const adminRewardsRouter = Router();

function toAdminRewardResponse(r: {
  id: string;
  title: string;
  description: string | null;
  pointsCost: number;
  imageKey: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: { redemptions: number };
}) {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    pointsCost: r.pointsCost,
    imageKey: r.imageKey,
    active: r.active,
    redemptionCount: r._count?.redemptions ?? 0,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

adminRewardsRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await prisma.reward.findMany({
      orderBy: [{ active: "desc" }, { pointsCost: "asc" }, { title: "asc" }],
      include: { _count: { select: { redemptions: true } } },
    });
    res.json({ items: rows.map(toAdminRewardResponse) });
  } catch (err) {
    next(err);
  }
});

adminRewardsRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = AdminRewardCreate.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error);
    const created = await prisma.reward.create({
      data: {
        title: parsed.data.title,
        description: parsed.data.description ?? null,
        pointsCost: parsed.data.pointsCost,
        imageKey: parsed.data.imageKey ?? null,
        active: parsed.data.active ?? true,
      },
      include: { _count: { select: { redemptions: true } } },
    });
    res.status(201).json(toAdminRewardResponse(created));
  } catch (err) {
    next(err);
  }
});

adminRewardsRouter.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = AdminRewardPatch.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error);
    const existing = await prisma.reward.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) throw new BusinessError("not_found", 404, "reward not found");
    const updated = await prisma.reward.update({
      where: { id: existing.id },
      data: parsed.data,
      include: { _count: { select: { redemptions: true } } },
    });
    res.json(toAdminRewardResponse(updated));
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/rewards/:id — soft-disable (active = false). NEVER hard-deletes:
 * existing Redemption rows reference rewardId; preserving history matters.
 * Same shape contract as DELETE /api/admin/restaurants/:id.
 */
adminRewardsRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (Object.keys(req.query).length > 0) {
      throw new BusinessError("validation", 400, "hard-delete is not supported; soft-disable only");
    }
    const existing = await prisma.reward.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) throw new BusinessError("not_found", 404, "reward not found");
    const updated = await prisma.reward.update({
      where: { id: existing.id },
      data: { active: false },
      include: { _count: { select: { redemptions: true } } },
    });
    res.json(toAdminRewardResponse(updated));
  } catch (err) {
    next(err);
  }
});
