import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { withSerwist } from "@serwist/turbopack";

const monorepoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");

const nextConfig: NextConfig = {
  // Pin Turbopack to guide-dev/ so Next stops guessing when multiple
  // lockfiles exist above us in the tree.
  turbopack: {
    root: monorepoRoot,
  },

  // Business logic lives in Express. Next has ZERO app/api/* handlers.
  // Browser always sees /api/* on the same origin as the Next app →
  // Better Auth session cookie is same-origin → no CORS headaches.
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.API_INTERNAL_URL ?? "http://localhost:3001"}/api/:path*`,
      },
    ];
  },

};

// PITFALLS #8 + UI-SPEC: Service worker is OFF in dev (non-negotiable).
//   - Dev: rewrites work, SW never registers.
//   - Prod: Serwist wraps with skipWaiting + clientsClaim.
export default process.env.NODE_ENV === "development"
  ? nextConfig
  : withSerwist(nextConfig);
