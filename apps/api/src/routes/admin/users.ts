import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "@repo/db";
import { AdminUserPatch } from "@repo/shared-schemas";
import { ValidationError, BusinessError } from "../../errors.js";
import type { AuthedRequest } from "../../middleware/auth.js";

export const adminUsersRouter = Router();

/**
 * GET /api/admin/users — list every user with denormalized counts.
 * Demo scale (< 100 users) — no pagination in v1. Sorted newest-first.
 *
 * `_count.souvenirs` is the only join; everything else is on User directly.
 */
adminUsersRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        totalPoints: true,
        restaurantId: true,
        disabledAt: true,
        createdAt: true,
        _count: { select: { souvenirs: true } },
      },
    });
    res.json({
      items: rows.map((u) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        totalPoints: u.totalPoints,
        restaurantId: u.restaurantId,
        souvenirCount: u._count.souvenirs,
        disabledAt: u.disabledAt ? u.disabledAt.toISOString() : null,
        createdAt: u.createdAt.toISOString(),
      })),
      total: rows.length,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/users/:id — update role and/or disabledAt (D-12).
 *
 * ADMIN-07: self-demote guard. The acting admin cannot touch their own row.
 * Without this guard, the last admin could lock the platform out of admin
 * access. Returns 403 (forbidden) — consistent with D-16 HTTP status map.
 */
adminUsersRouter.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const acting = (req as AuthedRequest).user;
    if (req.params.id === acting.id) {
      throw new BusinessError("forbidden", 403, "admin cannot modify own role or status");
    }
    const parsed = AdminUserPatch.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error);

    const existing = await prisma.user.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) throw new BusinessError("not_found", 404, "user not found");

    const { role, disabledAt } = parsed.data;
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        ...(role !== undefined ? { role } : {}),
        ...(disabledAt !== undefined
          ? { disabledAt: disabledAt === null ? null : new Date(disabledAt) }
          : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        totalPoints: true,
        restaurantId: true,
        disabledAt: true,
        createdAt: true,
        _count: { select: { souvenirs: true } },
      },
    });
    res.json({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      totalPoints: updated.totalPoints,
      restaurantId: updated.restaurantId,
      souvenirCount: updated._count.souvenirs,
      disabledAt: updated.disabledAt ? updated.disabledAt.toISOString() : null,
      createdAt: updated.createdAt.toISOString(),
    });
  } catch (err) {
    next(err);
  }
});
