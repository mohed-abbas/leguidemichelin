"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

/**
 * Additional user fields defined server-side in apps/api/src/auth.ts.
 * Inlined here because apps/web has no tsconfig path to @repo/api/src.
 * Must stay in sync with the `user.additionalFields` block in auth.ts.
 *
 * `input: false` mirrors the server — the fields are **output-only** on the
 * User shape (readable in session.user) but are NOT accepted on signup bodies.
 * Without `input: false`, the inferred signup params would demand role /
 * totalPoints / restaurantId from the client, which contradicts the server
 * (D-01: server forces role='DINER', totalPoints=0, restaurantId=null on
 * public signup).
 */
type AdditionalUserFields = {
  role: { type: "string"; input: false };
  totalPoints: { type: "number"; input: false };
  restaurantId: { type: "string"; input: false };
};

/**
 * Better Auth React client (CONTEXT.md D-10).
 *
 * baseURL is the SAME-ORIGIN /api/auth path — Next.js rewrites this to the
 * Express instance (see apps/web/next.config.ts). Cookies flow automatically.
 *
 * Build-time safety: `createAuthClient` validates baseURL with `new URL(...)`
 * at module-eval, which rejects bare relative paths like "/api/auth" during
 * Next.js static prerendering. On the browser we want relative (so same-origin
 * cookies + Next rewrite work); on the server (prerender/SSR) we fall back to
 * an absolute placeholder built from NEXT_PUBLIC_APP_URL (with a localhost
 * dev default). Requests never actually fire during prerender — this is pure
 * module-eval URL validation.
 *
 * inferAdditionalFields lifts the custom User columns (role, totalPoints,
 * restaurantId) so TS knows about them client-side without duplicating logic.
 */
const baseURL =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/auth`
    : `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/auth`;

export const authClient = createAuthClient({
  baseURL,
  plugins: [inferAdditionalFields<{ user: { additionalFields: AdditionalUserFields } }>()],
});

/**
 * Re-export top-level hooks/helpers so consumers import from one place:
 *   import { useSession, signIn, signOut, signUp } from "@/lib/auth-client"
 */
export const { useSession, signIn, signOut, signUp } = authClient;
