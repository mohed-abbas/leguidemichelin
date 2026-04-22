import { z } from "zod";
import { DishResponseShape } from "./restaurants.js";

/**
 * POST /api/portal/dishes body. Staff is scoped to their restaurant via
 * session (req.user.restaurantId) — NEVER from body.
 */
export const DishCreate = z.object({
  name: z.string().min(1).max(160),
  description: z.string().max(400).nullable().optional(),
  priceCents: z.number().int().nonnegative(),
  sortOrder: z.number().int().optional(),
});
export type DishCreateType = z.infer<typeof DishCreate>;

/**
 * PATCH /api/portal/dishes/:id body. Any subset; must have at least one key.
 */
export const DishPatch = z
  .object({
    name: z.string().min(1).max(160).optional(),
    description: z.string().max(400).nullable().optional(),
    priceCents: z.number().int().nonnegative().optional(),
    sortOrder: z.number().int().optional(),
    defaultImageKey: z.string().nullable().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "at least one field required" });
export type DishPatchType = z.infer<typeof DishPatch>;

/** Re-export dish response as DishResponse so portal consumers have a stable name. */
export const DishResponse = DishResponseShape;
export type DishResponseType = z.infer<typeof DishResponse>;

/** GET /api/portal/qr response. */
export const PortalQrResponse = z.object({
  url: z.string().url(),
  restaurantId: z.string(),
  restaurantSlug: z.string(),
});
export type PortalQrResponseType = z.infer<typeof PortalQrResponse>;
