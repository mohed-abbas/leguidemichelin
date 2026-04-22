import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { adminRestaurantsRouter } from "./restaurants.js";
import { adminUsersRouter } from "./users.js";
import { adminStatsRouter } from "./stats.js";

/**
 * Admin aggregator (D-05).
 *
 *   adminRouter.use(requireAuth, requireRole('ADMIN'))  ← ONE guard
 *       ↓ inherited by every sub-route below
 *   /restaurants  — CRUD + soft-disable + admin dishes
 *   /users        — list + patch (role + disabled) with self-demote guard
 *   /stats        — dashboard counts
 *
 * The guard is applied at the Router level so a future admin endpoint CANNOT
 * skip the ADMIN check by accident — every sub-router below inherits
 * requireAuth + requireRole('ADMIN') automatically. This is the structural
 * correctness property behind ADMIN-07 + T-03-09-01 in the plan's threat
 * register.
 */
export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("ADMIN"));

adminRouter.use("/restaurants", adminRestaurantsRouter);
adminRouter.use("/users", adminUsersRouter);
adminRouter.use("/stats", adminStatsRouter);
