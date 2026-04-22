import type { ErrorRequestHandler } from "express";
import { ValidationError, BusinessError } from "../errors.js";

/**
 * Global Express error handler (D-17).
 *
 * Mount LAST in index.ts (after every router + the 404 catch-all — Express
 * looks for 4-arg (err, req, res, next) functions explicitly). Any thrown
 * error in an async handler must be forwarded via `next(err)` OR use Express 5's
 * native async error propagation (we rely on the latter; Express 5.x awaits
 * route-handler promises and routes rejections here).
 *
 * Never leaks stack traces to the client. Server-side console.error keeps the
 * stack for debugging.
 */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // ValidationError → 400 { error:'validation', fields }
  if (err instanceof ValidationError) {
    const fields: Record<string, string> = {};
    for (const issue of err.zodError.issues) {
      // Join Zod path segments with '.' to form the field key (D-14)
      const key = issue.path.map(String).join(".") || "_root";
      if (!fields[key]) fields[key] = issue.message;
    }
    res.status(400).json({ error: "validation", fields });
    return;
  }

  // BusinessError → {status, error:code, message?}
  if (err instanceof BusinessError) {
    const body: { error: string; message?: string } = { error: err.code };
    if (err.message && err.message !== err.code) body.message = err.message;
    res.status(err.status).json(body);
    return;
  }

  // Anything else → 500 internal; NEVER include stack in response body.
  console.error("[api] unhandled error:", err);
  res.status(500).json({ error: "internal" });
};
