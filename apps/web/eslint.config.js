import baseRules from "@repo/config/eslint/base.js";
import nextPlugin from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";

/** @type {import("eslint").Linter.Config[]} */
export default [
  // TypeScript + JSX parsing
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
    },
  },
  // Hex guardrail (PLAT-05) — scoped to apps/web component code
  {
    files: ["src/**/*.{ts,tsx}"],
    ...baseRules[0],
  },
  // Next.js recommended rules
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "@next/next": nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  // Ignore generated + build output
  {
    ignores: [".next/**", "node_modules/**", "dist/**", "public/**"],
  },
];
