"use client";

/**
 * QrScanner — primary tier of the /scan entry flow.
 *
 * Renders a full-bleed CTA ("Appuyez pour scanner") until the diner taps it.
 * Tap transitions `active: false → true` which mounts the
 * `@yudiel/react-qr-scanner` <Scanner /> — lazy-loaded via `next/dynamic`
 * with `ssr: false` because the underlying component touches `navigator` and
 * the DOM `video` element at module-eval time (Next 16 SSR would crash with
 * "window is not defined").
 *
 * iOS-PWA gesture invariant (PITFALL #1 + CONTEXT.md D-03):
 *   - The onClick handler is **synchronous** — no `async`, no awaits, no
 *     IIFEs between the tap and `setActive(true)`. The getUserMedia call
 *     inside <Scanner /> fires within the same user-gesture tick, so iOS
 *     Safari's permission prompt actually appears instead of silently
 *     failing with NotAllowedError.
 *
 * Shape of a successful decode: onScan receives `IDetectedBarcode[]`; we
 * read `codes[0].rawValue` (the QR payload URL), run it through
 * `extractRestaurantId`, and push to `/scan/:id`. Unrecognized payloads toast
 * the user toward the upload or paste-URL fallbacks — we never land the user
 * on a broken `/scan/undefined` route.
 *
 * Canonical refs:
 *   - .planning/phases/04-frontend-parallel-wave/04-CONTEXT.md D-01, D-03.
 *   - .planning/research/PITFALLS.md §1 (iOS getUserMedia synchronous gesture).
 */

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { extractRestaurantId } from "./scan-url";

// Module-scope dynamic import per Next 16 rules — invoking `dynamic()` inside
// the component body would re-lazy-load on every render.
const Scanner = dynamic(() => import("@yudiel/react-qr-scanner").then((m) => m.Scanner), {
  ssr: false,
});

export function QrScanner() {
  const router = useRouter();
  const [active, setActive] = useState(false);

  function onScan(codes: IDetectedBarcode[]) {
    const raw = codes[0]?.rawValue;
    if (!raw) return;
    const id = extractRestaurantId(raw);
    if (id) {
      router.push(`/scan/${id}`);
      return;
    }
    toast.error("QR non reconnu — essayez l'upload ou l'URL.");
  }

  function onError(err: unknown) {
    // Scanner surfaces NotAllowedError, NotFoundError, etc. here; we log for
    // dev diagnostics and fall the user back to the upload tier below.
    console.warn("scanner", err);
    toast.error("Caméra indisponible. Utilisez l'upload.");
  }

  if (!active) {
    return (
      <button
        type="button"
        // CRITICAL: synchronous handler — do NOT make this `async`, do NOT
        // await anything before `setActive(true)`. iOS Safari / installed PWA
        // needs the camera request to fire inside the same user-gesture tick.
        onClick={() => setActive(true)}
        style={{
          width: "100%",
          minHeight: "280px",
          background: "var(--color-primary)",
          color: "var(--color-primary-fg)",
          borderRadius: "var(--radius-lg)",
          border: "none",
          fontSize: "var(--font-size-lg)",
          fontWeight: "var(--font-weight-semibold)",
          cursor: "pointer",
          padding: "var(--space-lg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow-md)",
        }}
      >
        Appuyez pour scanner
      </button>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "280px",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        background: "var(--color-ink)",
      }}
    >
      <Scanner
        onScan={onScan}
        onError={onError}
        constraints={{ facingMode: "environment" }}
        formats={["qr_code"]}
        scanDelay={500}
        paused={false}
      />
    </div>
  );
}
