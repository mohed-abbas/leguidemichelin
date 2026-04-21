import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@repo/db";

/**
 * Better Auth configuration.
 *
 * - Email/password is the only v1 auth method (Phase 2 ships the UI flows).
 * - `additionalFields` maps our custom User columns (role, totalPoints,
 *   restaurantId) onto Better Auth's User record. All three have
 *   `input: false` so a malicious client CANNOT set them via signup body.
 *   The server writes them (e.g. points service on mint).
 * - `role` is a string at the Better Auth layer; it's validated against
 *   the Prisma `UserRole` enum at insert/update. Downstream code should
 *   cast via the Prisma type to prevent drift.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret:
    process.env.BETTER_AUTH_SECRET ??
    "insecure-dev-fallback-replace-via-env-in-prod",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Phase 1 simplicity; Phase 2 decides
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
