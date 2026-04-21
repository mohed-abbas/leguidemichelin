import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

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

  // Turbopack is the Next 16 default; no explicit flag needed.
  //
  // Plan 5 (01-05-pwa-chrome) edits this file to wrap the export with
  // `@serwist/turbopack`'s `withSerwist`, gated on NODE_ENV !== 'development'
  // per UI-SPEC's non-negotiable dev-disable rule (PITFALLS #8).
};

export default nextConfig;
