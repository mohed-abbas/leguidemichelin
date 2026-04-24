"use client";

/**
 * /scan — primary entry route for the souvenir loop (REQ SOUV-01, SOUV-02).
 *
 * Two entry paths stacked top-to-bottom: the camera scan CTA (primary) and
 * the paste-URL fallback (always visible, not hidden behind a toggle). iOS
 * installed-PWA diners whose camera silently fails (PITFALL #1) need the
 * URL fallback immediately in view, not one tap deeper.
 *
 * The page is `"use client"` because the children rely on `useRouter`,
 * `useState`, and browser-only APIs. The route-group layout
 * (`app/(diner)/layout.tsx`) provides the 768px main container, bottom nav,
 * and footer — this page renders inside that shell.
 *
 * Canonical refs:
 *   - 04-CONTEXT.md D-01, D-03, D-04.
 *   - 04-02-PLAN.md.
 */

import { QrScanner } from "../_components/QrScanner";
import { QrPasteUrl } from "../_components/QrPasteUrl";

export default function ScanPage() {
  return (
    <div style={{ paddingTop: "88px" }}>
      <h1
        style={{
          margin: 0,
          paddingInline: "14px",
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--font-weight-regular)",
          fontSize: "var(--font-size-h1)",
          lineHeight: "var(--line-height-tight)",
          color: "var(--color-ink)",
        }}
      >
        Scanner un QR code
      </h1>

      <p
        style={{
          margin: 0,
          marginTop: "var(--space-sm)",
          paddingInline: "14px",
          fontFamily: "var(--font-sans)",
          fontWeight: "var(--font-weight-regular)",
          fontSize: "var(--font-size-md)",
          lineHeight: "var(--line-height-base)",
          color: "var(--color-ink-muted)",
        }}
      >
        Scannez le QR affiché à votre table pour commencer votre souvenir.
      </p>

      <section
        style={{
          marginTop: "24px",
          paddingInline: "var(--space-md)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-md)",
        }}
      >
        <QrScanner />
        <QrPasteUrl />
      </section>
    </div>
  );
}
