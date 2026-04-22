import { z } from "zod";

/**
 * Canonical error codes (D-15). Additive-only after Phase 3 close.
 *
 * Every Express error-middleware response body (apps/api/src/middleware/error.ts)
 * uses one of these codes. Frontend pattern-matches with full type safety:
 *
 *   switch (err.error) {
 *     case ErrorCode.enum.insufficient_balance: ...
 *   }
 */
export const ErrorCode = z.enum([
  "unauthenticated",
  "forbidden",
  "not_found",
  "validation",
  "insufficient_balance",
  "account_disabled",
  "already_redeemed",
  "invalid_image",
  "payload_too_large",
  "unsupported_media_type",
  "internal",
]);
export type ErrorCodeType = z.infer<typeof ErrorCode>;

/**
 * Canonical error body shape (D-13).
 *
 *   {
 *     error: ErrorCode,
 *     message?: string,                          // human-readable for toasts
 *     fields?: Record<string, string>            // Zod path → human msg
 *   }
 *
 * Extends the Phase 2 `{ error: code }` additively: old clients keep working.
 */
export const ErrorBody = z.object({
  error: ErrorCode,
  message: z.string().optional(),
  fields: z.record(z.string(), z.string()).optional(),
});
export type ErrorBodyType = z.infer<typeof ErrorBody>;
