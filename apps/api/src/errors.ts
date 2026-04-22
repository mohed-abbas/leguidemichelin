import type { ZodError } from "zod";
import type { ErrorCodeType } from "@repo/shared-schemas";

/**
 * ValidationError — thrown by route handlers when Zod safeParse fails.
 * Translated by error middleware to: 400 { error: 'validation', fields: { path: msg } }
 */
export class ValidationError extends Error {
  readonly zodError: ZodError;
  constructor(zodError: ZodError) {
    super("validation");
    this.name = "ValidationError";
    this.zodError = zodError;
  }
}

/**
 * BusinessError — thrown for domain-rule violations with a typed error code.
 *
 * @param code   one of the 11 D-15 codes (enforced by ErrorCodeType)
 * @param status HTTP status from the D-16 map (400, 401, 403, 404, 409, 413, 415)
 * @param message optional human-readable string (surfaces in UI toasts)
 */
export class BusinessError extends Error {
  readonly code: ErrorCodeType;
  readonly status: number;
  constructor(code: ErrorCodeType, status: number, message?: string) {
    super(message ?? code);
    this.name = "BusinessError";
    this.code = code;
    this.status = status;
  }
}
