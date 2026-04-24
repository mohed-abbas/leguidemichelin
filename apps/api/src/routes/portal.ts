import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "@repo/db";
import { DishCreate, DishPatch } from "@repo/shared-schemas";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import { imageUploadSingle } from "../images/multer.js";
import { processToFullAndThumb } from "../images/pipeline.js";
import { storage } from "../storage.js";
import { ValidationError, BusinessError } from "../errors.js";
import { dishService } from "../services/dish.js";

export const portalRouter = Router();

// ALL portal routes require a RESTAURANT_STAFF session (D-04 strict).
portalRouter.use(requireAuth, requireRole("RESTAURANT_STAFF"));

/**
 * Guard — the staff session MUST carry a restaurantId. Phase 2 seed + admin
 * user-patch both enforce this, but defend against a dangling staff account.
 */
function requireStaffRestaurant(req: Request): string {
  const u = (req as AuthedRequest).user;
  if (!u.restaurantId) {
    throw new BusinessError("forbidden", 403, "staff account not bound to a restaurant");
  }
  return u.restaurantId;
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
 * GET /api/portal/dishes — list staff's own restaurant's dishes.
 */
portalRouter.get("/dishes", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const restaurantId = requireStaffRestaurant(req);
    const rows = await dishService.listForRestaurant(restaurantId);
    res.json({ items: rows.map(toDishResponse) });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/portal/dishes — create a dish for the staff's own restaurant.
 *
 * Accepts JSON OR multipart. If multipart with `defaultImage` file:
 *   multer → sharp → storage.put(fullKey + thumbKey) → dish.defaultImageKey = fullKey.
 * If JSON or multipart-without-image: dish.defaultImageKey stays null.
 *
 * PITFALL #7: restaurantId derived from session NEVER from body.
 */
portalRouter.post(
  "/dishes",
  imageUploadSingle("defaultImage"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurantId = requireStaffRestaurant(req);

      // Multer populates req.body from multipart form-data fields.
      // Coerce priceCents (multipart sends strings) before Zod parse.
      const rawBody = req.body ?? {};
      const normalized = {
        name: typeof rawBody.name === "string" ? rawBody.name : undefined,
        description:
          typeof rawBody.description === "string" && rawBody.description.length > 0
            ? rawBody.description
            : undefined,
        priceCents: rawBody.priceCents !== undefined ? Number(rawBody.priceCents) : undefined,
        sortOrder: rawBody.sortOrder !== undefined ? Number(rawBody.sortOrder) : undefined,
      };
      const parsed = DishCreate.safeParse(normalized);
      if (!parsed.success) throw new ValidationError(parsed.error);

      const dish = await dishService.create(restaurantId, parsed.data);

      const uploaded = (req as Request & { file?: Express.Multer.File }).file;
      if (uploaded && uploaded.buffer && uploaded.buffer.length > 0) {
        const processed = await processToFullAndThumb(uploaded.buffer);
        await storage.put(processed.fullKey, processed.fullBuffer, {
          contentType: "image/jpeg",
        });
        await storage.put(processed.thumbKey, processed.thumbBuffer, {
          contentType: "image/jpeg",
        });
        const updated = await dishService.setDefaultImageKey(
          restaurantId,
          dish.id,
          processed.fullKey,
        );
        res.status(201).json(toDishResponse(updated));
        return;
      }

      res.status(201).json(toDishResponse(dish));
    } catch (err) {
      next(err);
    }
  },
);

/**
 * PATCH /api/portal/dishes/:id — update own restaurant's dish.
 * Cross-restaurant attempts → 404 via dishService scope guard.
 */
portalRouter.patch("/dishes/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const restaurantId = requireStaffRestaurant(req);
    const parsed = DishPatch.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error);
    const updated = await dishService.update(restaurantId, String(req.params.id), parsed.data);
    res.json(toDishResponse(updated));
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/portal/dishes/:id/image — replace the dish photo.
 *
 * Multipart only. Expects `defaultImage` field. Runs the same sharp pipeline
 * as POST /dishes (full + thumb), then updates dish.defaultImageKey.
 * Scope-guarded via dishService — cross-restaurant attempts → 404.
 */
portalRouter.post(
  "/dishes/:id/image",
  imageUploadSingle("defaultImage"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const restaurantId = requireStaffRestaurant(req);
      const uploaded = (req as Request & { file?: Express.Multer.File }).file;
      if (!uploaded || !uploaded.buffer || uploaded.buffer.length === 0) {
        throw new BusinessError("validation", 400, "image required");
      }
      const processed = await processToFullAndThumb(uploaded.buffer);
      await storage.put(processed.fullKey, processed.fullBuffer, { contentType: "image/jpeg" });
      await storage.put(processed.thumbKey, processed.thumbBuffer, { contentType: "image/jpeg" });
      const updated = await dishService.setDefaultImageKey(
        restaurantId,
        String(req.params.id),
        processed.fullKey,
      );
      res.json(toDishResponse(updated));
    } catch (err) {
      next(err);
    }
  },
);

/**
 * DELETE /api/portal/dishes/:id — hard delete (scope-guarded).
 */
portalRouter.delete("/dishes/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const restaurantId = requireStaffRestaurant(req);
    await dishService.remove(restaurantId, String(req.params.id));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/portal/qr — returns the scan URL for the staff's restaurant.
 *
 * Response: { url, restaurantId, restaurantSlug }
 * Portal UI (Phase 4 Track C) renders the QR via qrcode.react; no
 * server-side PNG generation (keeps backend dependency-light).
 */
portalRouter.get("/qr", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const restaurantId = requireStaffRestaurant(req);
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
      select: { id: true, slug: true },
    });
    if (!restaurant) {
      throw new BusinessError("not_found", 404, "restaurant not found");
    }
    const webOrigin = process.env.WEB_ORIGIN ?? "http://localhost:3000";
    res.json({
      url: `${webOrigin}/scan/${restaurant.id}`,
      restaurantId: restaurant.id,
      restaurantSlug: restaurant.slug,
    });
  } catch (err) {
    next(err);
  }
});
