"use client";

/**
 * DinerNavShell — client wrapper that renders the fixed bottom-nav chrome
 * plus `<DinerBottomNav />`. Hides itself on `/map` because that route runs
 * edge-to-edge and owns its own bottom controls (map/list toggle, chasseur
 * switch). Keeping the nav mounted there would both steal vertical space and
 * duplicate navigation UI.
 */

import { usePathname } from "next/navigation";
import { DinerBottomNav } from "./diner-bottom-nav";

export function DinerNavShell() {
  const pathname = usePathname();
  if (pathname === "/map") return null;
  // Review pages render their own pinned CTAs at the bottom; hide the nav
  // chrome so the questionnaire and thank-you screens match the Figma layout.
  if (pathname?.startsWith("/review")) return null;
  return (
    <nav
      aria-label="Primary"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: "calc(85px + env(safe-area-inset-bottom))",
        paddingBottom: "env(safe-area-inset-bottom)",
        background: "var(--color-bg)",
        boxShadow: "var(--shadow-nav-top)",
        zIndex: "var(--z-nav)",
      }}
    >
      <DinerBottomNav />
    </nav>
  );
}
