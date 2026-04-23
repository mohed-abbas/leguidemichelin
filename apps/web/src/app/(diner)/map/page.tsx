"use client";

/**
 * /map — diner restaurant map (client component shell).
 *
 * Next.js 16 + Turbopack does not allow `dynamic({ ssr: false })` inside a
 * Server Component (build error). Converted to a Client Component — the `"use
 * client"` directive enables `next/dynamic` with `ssr: false` on Turbopack.
 *
 * The (diner)/layout.tsx wraps children in a 768px-capped <main>.
 * The map surface must be full-bleed viewport (D-17). We escape the cap
 * by using `position: fixed; inset: 0` on a container that takes itself
 * out of the normal flow while still living inside the layout.
 *
 * Bottom offset accounts for the 56px DinerBottomNav + safe area.
 * z-index 1 lifts the canvas above the layout's background but below the
 * nav's z-nav (20) — the nav has position:sticky so it always renders on top.
 *
 * Canonical refs:
 *   - 04-07-PLAN.md task 1
 *   - 04-CONTEXT.md D-17 (standalone route full-bleed)
 */

import dynamic from "next/dynamic";

const MapCanvas = dynamic(() => import("../_components/MapCanvas").then((m) => m.MapCanvas), {
  ssr: false,
  loading: () => (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: "var(--color-surface-muted)",
      }}
    >
      <p style={{ color: "var(--color-ink-muted)" }}>Chargement de la carte…</p>
    </div>
  ),
});

export default function MapPage() {
  return (
    <div
      aria-label="Carte des restaurants étoilés"
      style={{
        position: "fixed",
        inset: 0,
        top: "env(safe-area-inset-top, 0px)",
        // leave room for the bottom nav (56px) + safe area
        bottom: "calc(56px + env(safe-area-inset-bottom, 0px))",
        zIndex: 1,
      }}
    >
      <MapCanvas />
    </div>
  );
}
