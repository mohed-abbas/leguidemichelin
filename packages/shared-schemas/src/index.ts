/**
 * @repo/shared-schemas — shared Zod DTOs for request/response validation.
 *
 * Ownership (Phase 3 onward): Murx. Additive-only after Phase 3 close.
 * Server endpoints (apps/api) and client forms (apps/web + react-hook-form)
 * validate from a single source of truth.
 */

// Re-export zod so consumers import `z` from @repo/shared-schemas for consistency.
export { z } from "zod";

// Phase 2 — auth DTOs (D-18)
export * from "./auth.js";

// Phase 3 feature modules
export * from "./errors.js";
export * from "./restaurants.js";
export * from "./souvenirs.js";
export * from "./favorites.js";
export * from "./points.js";
export * from "./redemption.js";
export * from "./admin.js";
export * from "./portal.js";
export * from "./reviews.js";
