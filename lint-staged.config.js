/**
 * lint-staged config — ESM default export.
 *
 * Per CONTEXT D-14:
 *   - ESLint --fix + Prettier on staged TS/TSX/JS/JSX inside workspaces
 *   - Prettier on staged JSON/MD/CSS anywhere
 *   - tsc is NOT run on pre-commit (too slow; CI / dev loop catches type errors)
 *
 * ESLint runs only on files under `apps/` and `packages/` because those
 * workspaces ship flat-config (`apps/web/eslint.config.js`,
 * `apps/api/eslint.config.js`). Root-level scripts (scripts/*.mjs,
 * lint-staged.config.js itself, tools/*) are Prettier-only — they have no
 * ESLint config at that level and don't need one.
 */
export default {
  "{apps,packages}/**/*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{ts,tsx,js,jsx,mjs,cjs}": ["prettier --write"],
  "*.{json,md,css}": ["prettier --write"],
};
