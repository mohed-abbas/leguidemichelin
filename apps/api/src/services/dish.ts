import { prisma } from "@repo/db";
import type { DishCreateType, DishPatchType } from "@repo/shared-schemas";
import { BusinessError } from "../errors.js";

/**
 * Shared dish CRUD service (D-03). Used by /api/portal/dishes (scoped via
 * session.restaurantId) AND /api/admin/restaurants/:id/dishes (scoped via URL).
 *
 * Every mutation requires a restaurantId SCOPE — the service enforces that the
 * dishId being mutated actually belongs to that scope. Cross-restaurant
 * attempts return 404 not_found (don't leak "dish exists but not yours").
 */
export const dishService = {
  async listForRestaurant(restaurantId: string) {
    return prisma.dish.findMany({
      where: { restaurantId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
  },

  async create(restaurantId: string, input: DishCreateType) {
    return prisma.dish.create({
      data: {
        restaurantId,
        name: input.name,
        description: input.description ?? null,
        priceCents: input.priceCents,
        sortOrder: input.sortOrder ?? 0,
      },
    });
  },

  async update(restaurantId: string, dishId: string, patch: DishPatchType) {
    const existing = await prisma.dish.findUnique({
      where: { id: dishId },
      select: { id: true, restaurantId: true },
    });
    if (!existing || existing.restaurantId !== restaurantId) {
      throw new BusinessError("not_found", 404, "dish not found");
    }
    return prisma.dish.update({
      where: { id: dishId },
      data: {
        ...(patch.name !== undefined ? { name: patch.name } : {}),
        ...(patch.description !== undefined ? { description: patch.description } : {}),
        ...(patch.priceCents !== undefined ? { priceCents: patch.priceCents } : {}),
        ...(patch.sortOrder !== undefined ? { sortOrder: patch.sortOrder } : {}),
        ...(patch.defaultImageKey !== undefined ? { defaultImageKey: patch.defaultImageKey } : {}),
      },
    });
  },

  /** Set defaultImageKey without Zod (used when multer uploaded a new image). */
  async setDefaultImageKey(restaurantId: string, dishId: string, key: string) {
    const existing = await prisma.dish.findUnique({
      where: { id: dishId },
      select: { id: true, restaurantId: true },
    });
    if (!existing || existing.restaurantId !== restaurantId) {
      throw new BusinessError("not_found", 404, "dish not found");
    }
    return prisma.dish.update({
      where: { id: dishId },
      data: { defaultImageKey: key },
    });
  },

  /**
   * Atomic reorder: accept an ordered list of dish ids belonging to restaurantId,
   * and rewrite `sortOrder` as 0..N-1 in a single transaction.
   *
   * Contract:
   *   - Rejects if any id in the list does not belong to restaurantId.
   *   - Rejects if the list is not a complete permutation of the restaurant's
   *     current dishes (length + set must match exactly). This prevents a
   *     client-side stale list from silently dropping or duplicating rows.
   *   - Normalizes `sortOrder` to dense 0..N-1 indices — eliminates drift from
   *     duplicate or gap-filled values left by any earlier single-field PATCH.
   */
  async reorder(restaurantId: string, orderedIds: string[]) {
    const current = await prisma.dish.findMany({
      where: { restaurantId },
      select: { id: true },
    });
    if (current.length !== orderedIds.length) {
      throw new BusinessError(
        "validation",
        400,
        "ordered list length does not match restaurant dish count",
      );
    }
    const currentSet = new Set(current.map((d) => d.id));
    for (const id of orderedIds) {
      if (!currentSet.has(id)) {
        throw new BusinessError("not_found", 404, "dish not found");
      }
    }
    const orderedSet = new Set(orderedIds);
    if (orderedSet.size !== orderedIds.length) {
      throw new BusinessError("validation", 400, "ordered list contains duplicates");
    }
    return prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.dish.update({ where: { id }, data: { sortOrder: index } }),
      ),
    );
  },

  /**
   * Hard delete. Dish → Souvenir FK has no cascade; Prisma P2003 if referenced.
   * Phase 5 UI should warn; Phase 3 accepts the default Prisma error path.
   */
  async remove(restaurantId: string, dishId: string) {
    const existing = await prisma.dish.findUnique({
      where: { id: dishId },
      select: { id: true, restaurantId: true },
    });
    if (!existing || existing.restaurantId !== restaurantId) {
      throw new BusinessError("not_found", 404, "dish not found");
    }
    await prisma.dish.delete({ where: { id: dishId } });
  },
};
