import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { prisma } from "@repo/db";
import { auth } from "../auth.js";

/**
 * Authenticated request — `req.user` is attached by requireAuth.
 *
 * PITFALL #7 enforcement: userId is ONLY read from req.user.id in any handler
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
 * Phase 3 addition (D-07): if the authenticated user's `disabledAt` is
 * non-null, returns 401 { error: "account_disabled" } even though the
 * session cookie itself is valid. The extra DB roundtrip is intentional —
 * adding `disabledAt` to Better Auth additionalFields would bloat every
 * session object and was not part of the Phase 1 auth.ts contract.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session?.user) {
    res.status(401).json({ error: "unauthenticated" });
    return;
  }

  // D-07: verify the user is not soft-disabled. One indexed-by-PK lookup.
  const disabledRow = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { disabledAt: true },
  });
  if (!disabledRow) {
    // Session references a deleted user — treat as unauthenticated.
    res.status(401).json({ error: "unauthenticated" });
    return;
  }
  if (disabledRow.disabledAt !== null) {
    res.status(401).json({ error: "account_disabled" });
    return;
  }

  (req as AuthedRequest).user = {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    role: (session.user as { role?: string }).role as "DINER" | "RESTAURANT_STAFF" | "ADMIN",
    restaurantId: (session.user as { restaurantId?: string | null }).restaurantId ?? null,
  };
  next();
}

/**
 * requireRole — runs AFTER requireAuth. Returns 403 on role mismatch.
 * ADMIN does NOT bypass (Phase 2 D-12 strict equality). Each endpoint
 * binds explicitly to its required role.
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
