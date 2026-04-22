/**
 * Root ESLint flat-config for the guide-dev monorepo.
 *
 * ESLint 9 looks for a config in the CWD (project root). This root config
 * delegates to each workspace's own config via file-glob scoping, so that
 * lint-staged (which runs from root) picks up the right rules per package.
 */

import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import baseRules from "@repo/config/eslint/base.js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** @type {import("eslint").Linter.Config[]} */
export default [
  // ── apps/api ────────────────────────────────────────────────────────────
  {
    files: ["apps/api/src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 2022, sourceType: "module" },
    },
    plugins: { "@typescript-eslint": tsPlugin },
    rules: {
      ...baseRules[0].rules,
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },

  // ── apps/web ────────────────────────────────────────────────────────────
  {
    files: ["apps/web/src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      ...baseRules[0].rules,
    },
  },

  // ── packages/shared-schemas ─────────────────────────────────────────────
  {
    files: ["packages/shared-schemas/src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 2022, sourceType: "module" },
    },
    rules: {
      ...baseRules[0].rules,
    },
  },

  // ── packages/db ─────────────────────────────────────────────────────────
  {
    files: ["packages/db/src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 2022, sourceType: "module" },
    },
    rules: {
      ...baseRules[0].rules,
    },
  },

  // ── Global ignores ───────────────────────────────────────────────────────
  {
    ignores: ["**/dist/**", "**/node_modules/**", "**/.next/**", "**/public/**"],
  },
];
