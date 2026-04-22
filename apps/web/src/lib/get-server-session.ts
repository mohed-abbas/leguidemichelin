import "server-only";
import { headers } from "next/headers";

/**
 * Server-component session helper (CONTEXT.md D-10).
 *
 * Calls Better Auth's /api/auth/get-session server-side, forwarding the
 * incoming Cookie header. Uses the SAME internal URL that Next.js rewrites
 * to — we cannot rely on relative /api/* on the server (no base origin).
 *
 * Return shape matches Better Auth: { user, session } | null.
 */

export interface ServerSessionUser {
  id: string;
  email: string;
  name: string;
  role: "DINER" | "RESTAURANT_STAFF" | "ADMIN";
  restaurantId: string | null;
}

export interface ServerSession {
  user: ServerSessionUser;
  session: { id: string; expiresAt: string | Date };
}

export async function getServerSession(): Promise<ServerSession | null> {
  const apiInternalUrl = process.env.API_INTERNAL_URL ?? "http://localhost:3001";
  const incoming = await headers();
  const cookie = incoming.get("cookie") ?? "";
  try {
    const res = await fetch(`${apiInternalUrl}/api/auth/get-session`, {
      method: "GET",
      headers: { cookie },
      // Server-to-server; no need for credentials flag.
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as ServerSession | null;
    return data && data.user ? data : null;
  } catch {
    // API unreachable, malformed response, etc. → treat as unauthenticated.
    return null;
  }
}
