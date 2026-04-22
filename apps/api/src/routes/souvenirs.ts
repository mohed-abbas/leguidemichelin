import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma } from "@repo/db";
import { SouvenirMintInput } from "@repo/shared-schemas";
import { requireAuth, requireRole, type AuthedRequest } from "../middleware/auth.js";
import { imageUploadSingle } from "../images/multer.js";
import { processToFullAndThumb, thumbKeyFor } from "../images/pipeline.js";
import { storage } from "../storage.js";
import { ValidationError, BusinessError } from "../errors.js";
import { awardPoints } from "../services/points.js";

export const souvenirsRouter = Router();

/**
 * Build the wire SouvenirResponse (Plan 02 shape) from the Prisma row join.
 */
function toResponse(
  souvenir: {
    id: string;
    userId: string;
    restaurantId: string;
    dishId: string;
    note: string | null;
    imageKey: string;
    usedDefaultImage: boolean;
    pointsAwarded: number;
    createdAt: Date;
  },
  restaurant: { name: string; city: string; michelinRating: "BIB" | "ONE" | "TWO" | "THREE" },
  dish: { name: string },
) {
  return {
    id: souvenir.id,
    userId: souvenir.userId,
    restaurantId: souvenir.restaurantId,
    restaurantName: restaurant.name,
    restaurantCity: restaurant.city,
    michelinRating: restaurant.michelinRating,
    dishId: souvenir.dishId,
    dishName: dish.name,
    note: souvenir.note,
    imageKey: souvenir.imageKey,
    thumbKey: thumbKeyFor(souvenir.imageKey),
    usedDefaultImage: souvenir.usedDefaultImage,
    pointsAwarded: souvenir.pointsAwarded,
    createdAt: souvenir.createdAt.toISOString(),
  };
}

/**
 * POST /api/souvenirs — atomic mint (Phase 3 success criterion #3).
 *
 * Multipart body:
 *   image: file (optional — if absent, dish.defaultImageKey is used; if that's
 *          also null → 400 validation)
 *   dishId: string
 *   note: optional string ≤280
 *
 * requireAuth + requireRole('DINER'). PITFALL #7: userId from req.user.id only.
 */
souvenirsRouter.post(
  "/",
  requireAuth,
  requireRole("DINER"),
  imageUploadSingle("image"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthedRequest).user;

      // Multer populated req.body.dishId / req.body.note from multipart form-data
      const parsed = SouvenirMintInput.safeParse({
        dishId: typeof req.body?.dishId === "string" ? req.body.dishId : undefined,
        note:
          typeof req.body?.note === "string" && req.body.note.length > 0
            ? req.body.note
            : undefined,
      });
      if (!parsed.success) throw new ValidationError(parsed.error);
      const { dishId, note } = parsed.data;

      // Resolve dish + its restaurant (so we can fall back to defaultImageKey + learn restaurantId)
      const dish = await prisma.dish.findUnique({
        where: { id: dishId },
        select: { id: true, restaurantId: true, defaultImageKey: true },
      });
      if (!dish) throw new BusinessError("not_found", 404, "dish not found");

      // Determine image key: uploaded file → process + store; else dish default.
      let imageKey: string;
      let usedDefaultImage: boolean;

      const uploaded = (req as Request & { file?: Express.Multer.File }).file;
      if (uploaded && uploaded.buffer && uploaded.buffer.length > 0) {
        const processed = await processToFullAndThumb(uploaded.buffer);
        await storage.put(processed.fullKey, processed.fullBuffer, { contentType: "image/jpeg" });
        await storage.put(processed.thumbKey, processed.thumbBuffer, { contentType: "image/jpeg" });
        imageKey = processed.fullKey;
        usedDefaultImage = false;
      } else if (dish.defaultImageKey) {
        imageKey = dish.defaultImageKey;
        usedDefaultImage = true;
      } else {
        throw new BusinessError("validation", 400, "image required (dish has no defaultImageKey)");
      }

      const result = await awardPoints({
        userId: user.id, // PITFALL #7: session-derived
        restaurantId: dish.restaurantId,
        dishId: dish.id,
        note: note ?? null,
        imageKey,
        usedDefaultImage,
      });

      res.status(201).json(toResponse(result.souvenir, result.restaurant, result.dish));
    } catch (err) {
      next(err);
    }
  },
);

/**
 * GET /api/souvenirs/:id — owner-only read.
 *
 * Returns 404 if the souvenir does not exist OR is owned by a different user
 * (don't leak existence to a non-owner).
 */
souvenirsRouter.get(
  "/:id",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = (req as AuthedRequest).user;
      const row = await prisma.souvenir.findFirst({
        where: { id: String(req.params.id) },
        include: {
          restaurant: { select: { name: true, city: true, michelinRating: true } },
          dish: { select: { name: true } },
        },
      });
      if (!row || row.userId !== user.id) {
        throw new BusinessError("not_found", 404, "souvenir not found");
      }
      res.json(toResponse(row, row.restaurant, row.dish));
    } catch (err) {
      next(err);
    }
  },
);
