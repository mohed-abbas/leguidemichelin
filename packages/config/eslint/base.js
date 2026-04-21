// Shared ESLint flat-config base. Consumers (apps/web) compose this with
// Next.js + TypeScript configs. The core contribution here is the
// Token-Enforcement Guardrail rule — UI-SPEC LOCKED.
//
// Applied to: apps/web/**/*.{ts,tsx}
// NOT applied to: packages/tokens/tokens.css (the one place hex is allowed),
// apps/web/public/manifest.webmanifest (JSON — not linted),
// apps/web/src/app/layout.tsx <meta theme-color> value (use
// eslint-disable-next-line with REGENERATE-ON-CHANGE justification).

export default [
  {
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/^#(?:[0-9a-fA-F]{3}){1,2}$|^#(?:[0-9a-fA-F]{4}){1,2}$/]",
          message:
            "Raw hex color is forbidden in component code. Use a token from packages/tokens/tokens.css (e.g. var(--color-primary) or the Tailwind utility bg-primary).",
        },
        {
          selector: "Literal[value=/^rgba?\\(|^hsla?\\(/]",
          message:
            "Raw rgb()/hsl() color is forbidden in component code. Use a token from packages/tokens/tokens.css.",
        },
        {
          selector: "TemplateElement[value.raw=/#(?:[0-9a-fA-F]{3}){1,2}\\b/]",
          message:
            "Raw hex color in template literal is forbidden. Use a token.",
        },
      ],
    },
  },
];
