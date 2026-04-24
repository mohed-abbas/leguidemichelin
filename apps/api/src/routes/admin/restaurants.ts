import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "@repo/db";
import {
  AdminRestaurantCreate,
  AdminRestaurantPatch,
  DishCreate,
  DishPatch,
  DishReorder,
} from "@repo/shared-schemas";
import { ValidationError, BusinessError } from "../../errors.js";
import { dishService } from "../../services/dish.js";

export const adminRestaurantsRouter = Router();

/**
 * Admin restaurant response: extends public response with disabledAt (D-08).
 *
 * Shape mirrors `RestaurantResponse` from @repo/shared-schemas + `disabledAt`
 * so the admin UI can render a "disabled since ..." banner without a second
 * round-trip. We serialize Decimal → number and Date → ISO string here so the
 * wire format matches AdminRestaurantResponse verbatim.
 */
function decimalToNumber(d: unknown): number {
  if (typeof d === "number") return d;
  if (typeof d === "string") return Number(d);
  if (
    d &&
    typeof d === "object" &&
    typeof (d as { toNumber?: () => number }).toNumber === "function"
  ) {
    return (d as { toNumber: () => number }).toNumber();
  }
  return Number(d);
}

function toAdminResponse(r: {
  id: string;
  slug: string;
  michelinSlug: string;
  name: string;
  city: string;
  address: string;
  lat: unknown;
  lng: unknown;
  michelinRating: "BIB" | "ONE" | "TWO" | "THREE";
  cuisine: string | null;
  description: string | null;
  heroImageKey: string | null;
  disabledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: r.id,
    slug: r.slug,
    michelinSlug: r.michelinSlug,
    name: r.name,
    city: r.city,
    address: r.address,
    lat: decimalToNumber(r.lat),
    lng: decimalToNumber(r.lng),
    michelinRating: r.michelinRating,
    cuisine: r.cuisine,
    description: r.description,
    heroImageKey: r.heroImageKey,
    disabledAt: r.disabledAt ? r.disabledAt.toISOString() : null,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

function toDishResponse(d: {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  priceCents: number;
  defaultImageKey: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: d.id,
    restaurantId: d.restaurantId,
    name: d.name,
    description: d.description,
    priceCents: d.priceCents,
    defaultImageKey: d.defaultImageKey,
    sortOrder: d.sortOrder,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

/**
 * GET /api/admin/restaurants — ALL restaurants incl. disabled (D-08).
 * No `where: { disabledAt: null }` filter: admin must see everything.
 */
adminRestaurantsRouter.get("/", async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const rows = await prisma.restaurant.findMany({
      orderBy: [{ disabledAt: "asc" }, { michelinRating: "desc" }, { name: "asc" }],
    });
    res.json({ items: rows.map(toAdminResponse) });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/restaurants — create new Michelin row.
 * Zod-parses body → AdminRestaurantCreate; Prisma handles uniqueness.
 */
adminRestaurantsRouter.post("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = AdminRestaurantCreate.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error);
    const row = await prisma.restaurant.create({ data: parsed.data });
    res.status(201).json(toAdminResponse(row));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/restaurants/:id — incl. disabled (D-08).
 */
adminRestaurantsRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const row = await prisma.restaurant.findUnique({ where: { id: String(req.params.id) } });
    if (!row) throw new BusinessError("not_found", 404, "restaurant not found");
    res.json(toAdminResponse(row));
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/admin/restaurants/:id — any subset of fields; `disabledAt` toggle.
 *
 * D-11: `disabledAt: null` un-disables; a Date ISO string disables.
 * `disabledAt: undefined` (field absent) → leave unchanged.
 */
adminRestaurantsRouter.patch("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = AdminRestaurantPatch.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error);
    const existing = await prisma.restaurant.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) throw new BusinessError("not_found", 404, "restaurant not found");

    const { disabledAt, ...rest } = parsed.data;
    const updated = await prisma.restaurant.update({
      where: { id: existing.id },
      data: {
        ...rest,
        ...(disabledAt !== undefined
          ? { disabledAt: disabledAt === null ? null : new Date(disabledAt) }
          : {}),
      },
    });
    res.json(toAdminResponse(updated));
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/admin/restaurants/:id — soft-disable (D-11). NEVER hard-deletes.
 * Returns the updated row so admin UI can render "disabled since ..." immediately.
 *
 * Rejects any query parameter (e.g. ?hard=1) with 400 — no hard-delete path
 * exists at the API layer, and silently ignoring a flag that looks meaningful
 * is a correctness trap for future tooling (H-02).
 */
adminRestaurantsRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (Object.keys(req.query).length > 0) {
      throw new BusinessError("validation", 400, "hard-delete is not supported; soft-disable only");
    }
    const existing = await prisma.restaurant.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) throw new BusinessError("not_found", 404, "restaurant not found");
    const updated = await prisma.restaurant.update({
      where: { id: existing.id },
      data: { disabledAt: new Date() },
    });
    res.json(toAdminResponse(updated));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/admin/restaurants/:id/menu — dishes (admin sees all; disabledAt is
 * on the restaurant, not on dishes).
 */
adminRestaurantsRouter.get("/:id/menu", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await prisma.restaurant.findUnique({ where: { id: String(req.params.id) } });
    if (!existing) throw new BusinessError("not_found", 404, "restaurant not found");
    const rows = await dishService.listForRestaurant(existing.id);
    res.json({
      restaurant: toAdminResponse(existing),
      dishes: rows.map(toDishResponse),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/admin/restaurants/:id/dishes — admin dish create.
 * D-03: delegates to shared dishService using URL-derived restaurantId as scope.
 */
adminRestaurantsRouter.post(
  "/:id/dishes",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = DishCreate.safeParse(req.body);
      if (!parsed.success) throw new ValidationError(parsed.error);
      const existing = await prisma.restaurant.findUnique({ where: { id: String(req.params.id) } });
      if (!existing) throw new BusinessError("not_found", 404, "restaurant not found");
      const dish = await dishService.create(existing.id, parsed.data);
      res.status(201).json(toDishResponse(dish));
    } catch (err) {
      next(err);
    }
  },
);

/**
 * PATCH /api/admin/restaurants/:id/dishes/reorder — atomic reorder.
 * Rewrites sortOrder as 0..N-1 in a single $transaction so a partial failure
 * cannot leave the list with duplicate or gap values. M-01 + M-02 fix.
 *
 * MUST be registered BEFORE the `/:id/dishes/:dishId` route below — otherwise
 * Express matches `:dishId = "reorder"` first and this handler becomes dead code.
 */
adminRestaurantsRouter.patch(
  "/:id/dishes/reorder",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = DishReorder.safeParse(req.body);
      if (!parsed.success) throw new ValidationError(parsed.error);
      const existing = await prisma.restaurant.findUnique({ where: { id: String(req.params.id) } });
      if (!existing) throw new BusinessError("not_found", 404, "restaurant not found");
      await dishService.reorder(existing.id, parsed.data.orderedIds);
      const rows = await dishService.listForRestaurant(existing.id);
      res.json({ dishes: rows.map(toDishResponse) });
    } catch (err) {
      next(err);
    }
  },
);

/**
 * PATCH /api/admin/restaurants/:id/dishes/:dishId — admin dish update (D-03).
 * dishService.update enforces dishId.restaurantId === URL restaurantId (scope guard).
 */
adminRestaurantsRouter.patch(
  "/:id/dishes/:dishId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = DishPatch.safeParse(req.body);
      if (!parsed.success) throw new ValidationError(parsed.error);
      const updated = await dishService.update(
        String(req.params.id),
        String(req.params.dishId),
        parsed.data,
      );
      res.json(toDishResponse(updated));
    } catch (err) {
      next(err);
    }
  },
);

/**
 * DELETE /api/admin/restaurants/:id/dishes/:dishId — admin dish delete (D-03).
 * dishService.remove enforces the same scope guard.
 */
adminRestaurantsRouter.delete(
  "/:id/dishes/:dishId",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await dishService.remove(String(req.params.id), String(req.params.dishId));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
);
