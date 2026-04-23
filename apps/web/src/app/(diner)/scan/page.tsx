"use client";

/**
 * /scan — primary entry route for the souvenir loop (REQ SOUV-01, SOUV-02).
 *
 * Stacks the three fallback tiers top-to-bottom. All three are always
 * visible — no accordion hides the upload or paste-URL on first render —
 * because iOS installed-PWA diners whose camera silently fails need the
 * next step immediately in view, not one tap deeper (CONTEXT.md D-04,
 * PITFALL #1).
 *
 * The page is `"use client"` because all three children rely on
 * `useRouter`, `useState`, and browser-only APIs. The route-group layout
 * (`app/(diner)/layout.tsx`) already provides the 768px main container,
 * bottom nav, and footer-disclaimer — this page renders inside that shell.
 *
 * Canonical refs:
 *   - 04-CONTEXT.md D-01, D-03, D-04, D-05.
 *   - 04-02-PLAN.md.
 */

import { QrScanner } from "../_components/QrScanner";
import { QrUpload } from "../_components/QrUpload";
import { QrPasteUrl } from "../_components/QrPasteUrl";

export default function ScanPage() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
        paddingBlock: "var(--space-md)",
      }}
    >
      <header>
        <h1
          style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-ink)",
            margin: 0,
          }}
        >
          Scanner un QR code
        </h1>
        <p
          style={{
            color: "var(--color-ink-muted)",
            marginTop: "var(--space-xs)",
            marginBottom: 0,
            fontSize: "var(--font-size-base)",
          }}
        >
          Scannez le QR affiché à votre table pour commencer votre souvenir.
        </p>
      </header>
      <QrScanner />
      <QrUpload />
      <QrPasteUrl />
    </section>
  );
}
