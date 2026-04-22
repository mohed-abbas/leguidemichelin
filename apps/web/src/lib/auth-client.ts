"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

/**
 * Additional user fields defined server-side in apps/api/src/auth.ts.
 * Inlined here because apps/web has no tsconfig path to @repo/api/src.
 * Must stay in sync with the `user.additionalFields` block in auth.ts.
 */
type AdditionalUserFields = {
  role: { type: "string" };
  totalPoints: { type: "number" };
  restaurantId: { type: "string" };
};

/**
 * Better Auth React client (CONTEXT.md D-10).
 *
 * baseURL is the SAME-ORIGIN /api/auth path — Next.js rewrites this to the
 * Express instance (see apps/web/next.config.ts). Cookies flow automatically.
 *
 * inferAdditionalFields lifts the custom User columns (role, totalPoints,
 * restaurantId) so TS knows about them client-side without duplicating logic.
 */
export const authClient = createAuthClient({
  baseURL: "/api/auth",
  plugins: [inferAdditionalFields<{ user: { additionalFields: AdditionalUserFields } }>()],
});

/**
 * Re-export top-level hooks/helpers so consumers import from one place:
 *   import { useSession, signIn, signOut, signUp } from "@/lib/auth-client"
 */
export const { useSession, signIn, signOut, signUp } = authClient;
