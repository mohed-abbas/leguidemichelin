/**
 * Tailwind v4 preset (minimal).
 *
 * Tailwind v4's CSS-first `@theme` block in apps/web/src/app/globals.css does
 * the heavy lifting — it maps packages/tokens/tokens.css CSS vars to Tailwind
 * utility name sources. This preset exists as a placeholder in case a second
 * consumer (e.g. a future admin app) needs to share config.
 *
 * For now: empty config; the real Tailwind v4 wiring is in globals.css.
 */
export default {
  content: [],
  theme: {},
  plugins: [],
};
