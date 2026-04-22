import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../auth.js";

/**
 * Authenticated request — `req.user` is attached by requireAuth.
 *
 * PITFALL #21 enforcement: userId is ONLY read from req.user.id in any handler
 * that follows requireAuth. NEVER read userId from req.body or req.params or
 * query string.
 */
export interface AuthedRequest extends Request {
  user: {
    id: string;
    email: string;
    name: string;
    role: "DINER" | "RESTAURANT_STAFF" | "ADMIN";
    restaurantId: string | null;
  };
}

/**
 * requireAuth — attaches req.user from the Better Auth session cookie.
 * Returns 401 { error: "unauthenticated" } if no valid session.
 * Error shape is consistent with the 404 handler in index.ts ({ error: string_code }).
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session?.user) {
    res.status(401).json({ error: "unauthenticated" });
    return;
  }
  (req as AuthedRequest).user = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    // Better Auth types additionalFields as `unknown`; narrow explicitly.
    role: (session.user as { role?: string }).role as "DINER" | "RESTAURANT_STAFF" | "ADMIN",
    restaurantId: (session.user as { restaurantId?: string | null }).restaurantId ?? null,
  };
  next();
}

/**
 * requireRole — runs AFTER requireAuth. Returns 403 on role mismatch.
 * ADMIN does NOT bypass here (v1 has no ADMIN users; CONTEXT.md D-12 does not
 * grant ADMIN elevation). Keep the check strict: role must equal the argument.
 */
export function requireRole(role: "DINER" | "RESTAURANT_STAFF" | "ADMIN") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthedRequest).user;
    if (!user) {
      res.status(401).json({ error: "unauthenticated" });
      return;
    }
    if (user.role !== role) {
      res.status(403).json({ error: "forbidden" });
      return;
    }
    next();
  };
}
