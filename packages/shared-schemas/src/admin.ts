import { z } from "zod";
import { AdminRestaurantResponse, MichelinRating } from "./restaurants.js";

export const UserRole = z.enum(["DINER", "RESTAURANT_STAFF", "ADMIN"]);
export type UserRoleType = z.infer<typeof UserRole>;

/**
 * POST /api/admin/restaurants body.
 * Creates a new Michelin restaurant row. `michelinSlug` + `slug` are both
 * uniquely-indexed in Prisma; supplying the same slug twice → 409-equivalent
 * Prisma error (handler translates to validation with field hint).
 */
export const AdminRestaurantCreate = z.object({
  michelinSlug: z.string().min(1).max(160),
  slug: z.string().min(1).max(160),
  name: z.string().min(1).max(160),
  city: z.string().min(1).max(80),
  address: z.string().min(1).max(400),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  michelinRating: MichelinRating,
  cuisine: z.string().max(80).nullable().optional(),
  heroImageKey: z.string().max(400).nullable().optional(),
});
export type AdminRestaurantCreateType = z.infer<typeof AdminRestaurantCreate>;

/**
 * PATCH /api/admin/restaurants/:id body (D-11).
 * Every field optional; at least one must be present.
 * `disabledAt: null` un-disables; a Date ISO string disables.
 */
export const AdminRestaurantPatch = z
  .object({
    slug: z.string().min(1).max(160).optional(),
    name: z.string().min(1).max(160).optional(),
    city: z.string().min(1).max(80).optional(),
    address: z.string().min(1).max(400).optional(),
    lat: z.number().min(-90).max(90).optional(),
    lng: z.number().min(-180).max(180).optional(),
    michelinRating: MichelinRating.optional(),
    cuisine: z.string().max(80).nullable().optional(),
    heroImageKey: z.string().max(400).nullable().optional(),
    disabledAt: z.union([z.string().datetime(), z.null()]).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "at least one field required" });
export type AdminRestaurantPatchType = z.infer<typeof AdminRestaurantPatch>;

/**
 * PATCH /api/admin/users/:id body (D-12).
 * role? + disabledAt? — at least one required.
 * Self-demote guard is enforced in the handler (can't PATCH self).
 */
export const AdminUserPatch = z
  .object({
    role: UserRole.optional(),
    disabledAt: z.union([z.string().datetime(), z.null()]).optional(),
  })
  .refine((v) => v.role !== undefined || v.disabledAt !== undefined, {
    message: "at least one of role, disabledAt required",
  });
export type AdminUserPatchType = z.infer<typeof AdminUserPatch>;

/** GET /api/admin/stats response — dashboard top-line counts. */
export const AdminStatsResponse = z.object({
  restaurants: z.object({
    active: z.number().int().nonnegative(),
    disabled: z.number().int().nonnegative(),
  }),
  users: z.object({
    diners: z.number().int().nonnegative(),
    staff: z.number().int().nonnegative(),
    admins: z.number().int().nonnegative(),
  }),
  souvenirs: z.object({
    total: z.number().int().nonnegative(),
    last7d: z.number().int().nonnegative(),
  }),
  redemptions: z.object({
    total: z.number().int().nonnegative(),
    last7d: z.number().int().nonnegative(),
  }),
  totalPointsOutstanding: z.number().int().nonnegative(),
});
export type AdminStatsResponseType = z.infer<typeof AdminStatsResponse>;

/** GET /api/admin/restaurants response. */
export const AdminRestaurantsListResponse = z.object({
  items: z.array(AdminRestaurantResponse),
});
export type AdminRestaurantsListResponseType = z.infer<typeof AdminRestaurantsListResponse>;

/** GET /api/admin/users response item (includes denormalized counts). */
export const AdminUserResponse = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: UserRole,
  totalPoints: z.number().int(),
  restaurantId: z.string().nullable(),
  souvenirCount: z.number().int().nonnegative(),
  disabledAt: z.string().nullable(),
  createdAt: z.string(),
});
export type AdminUserResponseType = z.infer<typeof AdminUserResponse>;

export const AdminUsersListResponse = z.object({
  items: z.array(AdminUserResponse),
  total: z.number().int().nonnegative(),
});
export type AdminUsersListResponseType = z.infer<typeof AdminUsersListResponse>;

// ─── Rewards admin (CRUD over Reward model) ─────────────────────────────

export const AdminRewardResponse = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  pointsCost: z.number().int().nonnegative(),
  imageKey: z.string().nullable(),
  active: z.boolean(),
  redemptionCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type AdminRewardResponseType = z.infer<typeof AdminRewardResponse>;

export const AdminRewardsListResponse = z.object({
  items: z.array(AdminRewardResponse),
});
export type AdminRewardsListResponseType = z.infer<typeof AdminRewardsListResponse>;

export const AdminRewardCreate = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(800).nullable().optional(),
  pointsCost: z.number().int().min(0).max(1_000_000),
  imageKey: z.string().max(400).nullable().optional(),
  active: z.boolean().optional(),
});
export type AdminRewardCreateType = z.infer<typeof AdminRewardCreate>;

export const AdminRewardPatch = z
  .object({
    title: z.string().min(1).max(160).optional(),
    description: z.string().max(800).nullable().optional(),
    pointsCost: z.number().int().min(0).max(1_000_000).optional(),
    imageKey: z.string().max(400).nullable().optional(),
    active: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "at least one field required" });
export type AdminRewardPatchType = z.infer<typeof AdminRewardPatch>;
