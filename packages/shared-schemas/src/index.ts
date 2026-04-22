/**
 * @repo/shared-schemas — shared Zod DTOs for request/response validation.
 *
 * Ownership (per guide-dev/docs/MODEL-OWNERSHIP.md, D-17):
 *   - Ilia owns this package in Phase 2+.
 *   - Server endpoints (apps/api) and client forms (apps/web + react-hook-form)
 *     validate from a single source of truth.
 */

// Re-export zod so consumers import `z` from @repo/shared-schemas for consistency.
export { z } from "zod";

// Phase 2 — auth DTOs (D-18)
export * from "./auth.js";
