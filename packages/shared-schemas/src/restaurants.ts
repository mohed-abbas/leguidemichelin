import { z } from "zod";

/** Mirrors Prisma MichelinRating enum. */
export const MichelinRating = z.enum(["BIB", "ONE", "TWO", "THREE"]);
export type MichelinRatingType = z.infer<typeof MichelinRating>;

/**
 * bbox query param — comma-separated `minLng,minLat,maxLng,maxLat` (GeoJSON order).
 * Transform + refine to a 4-tuple of finite numbers within valid lat/lng ranges.
 */
const BboxParam = z.string().transform((s, ctx) => {
  const parts = s.split(",").map((p) => Number(p.trim()));
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
    ctx.addIssue({ code: "custom", message: "bbox must be 4 comma-separated finite numbers" });
    return z.NEVER;
  }
  const [minLng, minLat, maxLng, maxLat] = parts as [number, number, number, number];
  if (
    minLng < -180 ||
    maxLng > 180 ||
    minLat < -90 ||
    maxLat > 90 ||
    minLng > maxLng ||
    minLat > maxLat
  ) {
    ctx.addIssue({ code: "custom", message: "bbox out of range" });
    return z.NEVER;
  }
  return [minLng, minLat, maxLng, maxLat] as [number, number, number, number];
});

/** stars comma-list transform: "ONE,TWO" → ["ONE","TWO"]. */
const StarsListParam = z.string().transform((s, ctx) => {
  const items = s
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const parsed = items.map((i) => MichelinRating.safeParse(i));
  if (parsed.some((r) => !r.success)) {
    ctx.addIssue({ code: "custom", message: "stars must be BIB|ONE|TWO|THREE list" });
    return z.NEVER;
  }
  return parsed.map((r) => (r as { success: true; data: MichelinRatingType }).data);
});

/**
 * GET /api/restaurants query. All optional, AND-combined.
 * strict() — reject unknown keys so typos surface as 400.
 */
export const RestaurantListQuery = z
  .object({
    city: z.string().min(1).max(80).optional(),
    stars: StarsListParam.optional(),
    bbox: BboxParam.optional(),
    lat: z.coerce.number().min(-90).max(90).optional(),
    lng: z.coerce.number().min(-180).max(180).optional(),
    radiusKm: z.coerce.number().positive().max(500).optional(),
  })
  .strict();
export type RestaurantListQueryType = z.infer<typeof RestaurantListQuery>;

/** On-wire restaurant shape (public). lat/lng are numbers, not Decimal strings. */
export const RestaurantResponse = z.object({
  id: z.string(),
  slug: z.string(),
  michelinSlug: z.string(),
  name: z.string(),
  city: z.string(),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  michelinRating: MichelinRating,
  cuisine: z.string().nullable(),
  heroImageKey: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  isFavorited: z.boolean().optional(),
});
export type RestaurantResponseType = z.infer<typeof RestaurantResponse>;

/** Dish response (shared with menu + portal). */
export const DishResponseShape = z.object({
  id: z.string(),
  restaurantId: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  priceCents: z.number().int().nonnegative(),
  defaultImageKey: z.string().nullable(),
  sortOrder: z.number().int(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type DishResponseShapeType = z.infer<typeof DishResponseShape>;

/** GET /api/restaurants/:id/menu response. */
export const RestaurantMenuResponse = z.object({
  restaurant: RestaurantResponse,
  dishes: z.array(DishResponseShape),
});
export type RestaurantMenuResponseType = z.infer<typeof RestaurantMenuResponse>;

/** Admin variant also including disabledAt — for admin/restaurants list. */
export const AdminRestaurantResponse = RestaurantResponse.extend({
  disabledAt: z.string().nullable(),
});
export type AdminRestaurantResponseType = z.infer<typeof AdminRestaurantResponse>;
