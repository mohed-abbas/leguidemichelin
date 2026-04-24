import { defineConfig } from "@playwright/test";

/**
 * Minimal Playwright config for Phase 04.1 Plan 11 smoke.
 *
 * Prerequisites (one-time, not runtime):
 *   cd guide-dev/apps/web && npx playwright install
 *
 * Local dev: starts `npm run -w apps/web dev` on :3000 (reuses existing
 * server if one is already running). In CI, the webServer is omitted —
 * the CI job is expected to start web + api + db before invoking Playwright.
 */
export default defineConfig({
  testDir: "./tests/playwright",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
  },
  webServer: process.env.CI
    ? undefined
    : {
        command: "npm run -w apps/web dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
