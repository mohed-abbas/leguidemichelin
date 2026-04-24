import { Router, type Request, type Response, type NextFunction } from "express";
import { prisma, type Prisma } from "@repo/db";
import { RestaurantListQuery } from "@repo/shared-schemas";
import { ValidationError, BusinessError } from "../errors.js";
import { optionalAuth, type AuthedRequest } from "../middleware/auth.js";
import { isFavoritedBy } from "../services/favorites.js";

/**
 * Public restaurants router. ALL reads filter disabledAt: null (D-08).
 * Admin router (Plan 09) exposes the full table including disabled rows.
 *
 * Authentication: NONE. Michelin directory is public.
 */
export const restaurantsRouter = Router();

/**
 * Convert a Prisma Decimal (or string/number) to a plain number for JSON
 * wire serialization. Our schema uses `Decimal(9,6)` which arrives as Decimal
 * (Prisma-returned) at runtime; JSON.stringify would emit a string otherwise.
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

type RestaurantRow = Awaited<ReturnType<typeof prisma.restaurant.findFirst>>;

function toResponse(r: NonNullable<RestaurantRow>) {
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
    heroImageKey: r.heroImageKey,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

/**
 * GET /api/restaurants
 *
 * Query (all optional, combined AND):
 *   - city
 *   - stars  (comma-separated MichelinRating list)
 *   - bbox   (minLng,minLat,maxLng,maxLat)
 *   - lat+lng+radiusKm (square bounding approximation; v1 demo scale)
 *
 * Always filters disabledAt:null.
 */
restaurantsRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = RestaurantListQuery.safeParse(req.query);
    if (!parsed.success) throw new ValidationError(parsed.error);
    const { city, stars, bbox, lat, lng, radiusKm } = parsed.data;

    const where: Prisma.RestaurantWhereInput = { disabledAt: null };
    if (city) where.city = city;
    // michelinRating: { in: stars }  — filter to rows whose rating is in the list.
    if (stars && stars.length > 0) where.michelinRating = { in: stars };

    // bbox takes precedence over lat/lng/radius when both are supplied.
    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = bbox;
      where.lat = { gte: minLat, lte: maxLat };
      where.lng = { gte: minLng, lte: maxLng };
    } else if (lat !== undefined && lng !== undefined && radiusKm !== undefined) {
      // Crude bounding box from radius. Accurate enough for v1 demo.
      const latDelta = radiusKm / 111; // ~111 km per deg latitude
      const lngDelta = radiusKm / (111 * Math.max(Math.cos((lat * Math.PI) / 180), 0.01));
      where.lat = { gte: lat - latDelta, lte: lat + latDelta };
      where.lng = { gte: lng - lngDelta, lte: lng + lngDelta };
    }

    const rows = await prisma.restaurant.findMany({
      where,
      orderBy: [{ michelinRating: "desc" }, { name: "asc" }],
    });
    res.json({ items: rows.map(toResponse) });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/restaurants/:id — public detail.
 * 404 if the restaurant does not exist OR is disabled (D-10).
 */
restaurantsRouter.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = String(req.params.id);
    const r = await prisma.restaurant.findFirst({
      where: { id, disabledAt: null },
    });
    if (!r) throw new BusinessError("not_found", 404, "restaurant not found");
    res.json(toResponse(r));
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/restaurants/:id/menu — restaurant + dishes ordered by sortOrder.
 * 404 if the restaurant is missing or disabled.
 *
 * Phase 04.1: optionalAuth attaches req.user when a valid DINER session is present,
 * enabling opportunistic isFavorited injection. Logged-out, non-DINER, or any
 * lookup failure → isFavorited: false (never null, never missing, never 500).
 * Scoped per-handler (not router-wide) — other public reads stay uncostly.
 */
restaurantsRouter.get(
  "/:id/menu",
  optionalAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = String(req.params.id);
      const r = await prisma.restaurant.findFirst({
        where: { id, disabledAt: null },
        include: { dishes: { orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] } },
      });
      if (!r) throw new BusinessError("not_found", 404, "restaurant not found");

      // Phase 04.1: opportunistically inject isFavorited for authenticated DINERs.
      // Logged-out, non-DINER roles, or any lookup failure → false (never null/missing).
      const authed = (req as Partial<AuthedRequest>).user;
      let isFavorited = false;
      if (authed && authed.role === "DINER") {
        try {
          isFavorited = await isFavoritedBy({
            userId: authed.id,
            restaurantId: id,
          });
        } catch {
          isFavorited = false;
        }
      }

      const { dishes, ...restaurant } = r;
      res.json({
        restaurant: { ...toResponse(restaurant), isFavorited },
        dishes: dishes.map((d) => ({
          id: d.id,
          restaurantId: d.restaurantId,
          name: d.name,
          description: d.description,
          priceCents: d.priceCents,
          defaultImageKey: d.defaultImageKey,
          sortOrder: d.sortOrder,
          createdAt: d.createdAt.toISOString(),
          updatedAt: d.updatedAt.toISOString(),
        })),
      });
    } catch (err) {
      next(err);
    }
  },
);
