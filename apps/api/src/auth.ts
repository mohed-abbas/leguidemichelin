import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/db";

/**
 * Better Auth configuration.
 *
 * Phase 2 wires the session cookie flags (D-12 + ROADMAP Phase 2 SC #1):
 *   httpOnly, SameSite=Lax, 7-day expiry, Secure in production.
 *
 * Phase 1 security-critical fields preserved (D-01 enforcement):
 *   - emailAndPassword.enabled: true
 *   - additionalFields.role.input: false + defaultValue: "DINER"
 *   - additionalFields.totalPoints.input: false
 *   - additionalFields.restaurantId.input: false
 *
 * Removing any `input: false` would let a crafted signup body claim
 * RESTAURANT_STAFF / mint points / self-assign to a restaurant.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET ?? "insecure-dev-fallback-replace-via-env-in-prod",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Phase 1 simplicity; Phase 2 keeps
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days (ROADMAP SC #1)
    updateAge: 60 * 60 * 24, // refresh session row every 24h on activity
  },
  advanced: {
    cookiePrefix: "gfj",
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      // path defaults to "/"; do not set `domain` in dev (same-origin via Next rewrite).
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "DINER",
        input: false,
      },
      totalPoints: {
        type: "number",
        required: false,
        defaultValue: 0,
        input: false,
      },
      restaurantId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
});
