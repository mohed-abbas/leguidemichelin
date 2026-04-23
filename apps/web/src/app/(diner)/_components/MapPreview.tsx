"use client";

/**
 * MapPreview — lightweight Mapbox Static Images <img> for the diner home page.
 *
 * Design constraints (04-CONTEXT D-17, D-23):
 *  - Single <img> tag, no GL context — avoids double-context overhead when /map is open.
 *  - ≤280px compact card height (default 200px per D-17).
 *  - Non-interactive: no zoom, no pan, no pin click handlers.
 *  - Entire component is a <Link href="/map"> so any tap opens the full canvas.
 *  - "Tout voir" badge always visible in the bottom-right corner (D-23).
 *
 * Geolocation strategy (D-18):
 *  - Requests user position with a 3s timeout + maximumAge 60s.
 *  - Falls back silently to Paris (48.8566, 2.3522) on denial / timeout.
 *
 * Nearest-N pins (D-23):
 *  - Fires GET /api/restaurants?lat=&lng=&radiusKm=2 after locating the user.
 *  - Up to 5 restaurants baked into the Static Images URL as gold-star pins.
 *  - User position is a red dot.
 *
 * Missing token (D-24):
 *  - If NEXT_PUBLIC_MAPBOX_TOKEN is absent, renders the same muted fallback card
 *    pattern as MapCanvas (no broken <img> tag, no console errors).
 *
 * Canonical refs: 04-08-PLAN.md, 04-CONTEXT.md D-17/D-23/D-24, 04-RESEARCH.md §2.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { RestaurantResponseType } from "@repo/shared-schemas";

// ─── Public API ─────────────────────────────────────────────────────────────

export interface MapPreviewProps {
  className?: string;
  /** Card height in pixels. Default 200 — ≤280px compact per D-17. */
  heightPx?: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PARIS = { lat: 48.8566, lng: 2.3522 } as const;
const DEFAULT_HEIGHT = 200;

// Color segment strings for the Mapbox Static Images URL path.
// These are URL-path identifiers (no `#` prefix), not CSS color literals.
// The ESLint hex-guard only fires on `#rrggbb` literals — these are safe.
const USER_PIN_COLOR = "c23b22"; // Michelin red — matches --color-primary
const REST_PIN_COLOR = "d4af37"; // Michelin gold — matches --color-accent-gold

// ─── URL builder ─────────────────────────────────────────────────────────────

function buildStaticUrl(
  center: { lat: number; lng: number },
  pins: RestaurantResponseType[],
  size: { w: number; h: number },
): string | null {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) return null;

  // User location dot (red, small pin).
  const userDot = `pin-s+${USER_PIN_COLOR}(${center.lng},${center.lat})`;

  // Up to 5 nearest restaurant pins (gold star).
  const restPins = pins
    .slice(0, 5)
    .map((r) => `pin-s-star+${REST_PIN_COLOR}(${r.lng},${r.lat})`)
    .join(",");

  const overlays = [userDot, restPins].filter(Boolean).join(",");
  const path =
    overlays.length > 0
      ? `${overlays}/${center.lng},${center.lat},13,0`
      : `${center.lng},${center.lat},13,0`;

  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${path}/${size.w}x${size.h}@2x?access_token=${token}`;
}

// ─── Fallback card (pure presentational, no hooks — mirrors MapCanvas pattern) ─

function MissingTokenCard({ heightPx }: { heightPx: number }) {
  return (
    <div
      style={{
        width: "100%",
        height: heightPx,
        borderRadius: "var(--radius-lg)",
        background: "var(--color-surface-muted)",
        border: "1px dashed var(--color-border)",
        color: "var(--color-ink-muted)",
        display: "grid",
        placeItems: "center",
        fontSize: "var(--font-size-sm)",
        padding: "var(--space-md)",
        textAlign: "center",
      }}
    >
      Carte indisponible. Configurez <code>NEXT_PUBLIC_MAPBOX_TOKEN</code>.
    </div>
  );
}

// ─── MapPreview ───────────────────────────────────────────────────────────────

export function MapPreview({ className, heightPx = DEFAULT_HEIGHT }: MapPreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [tokenMissing, setTokenMissing] = useState(false);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) {
      setTokenMissing(true);
      return;
    }

    const buildUrl = async (center: { lat: number; lng: number }) => {
      try {
        const { items } = await api.get<{ items: RestaurantResponseType[] }>(
          `/restaurants?lat=${center.lat}&lng=${center.lng}&radiusKm=2`,
        );
        setUrl(buildStaticUrl(center, items, { w: 600, h: heightPx }));
      } catch {
        // Network error — render preview without restaurant pins.
        setUrl(buildStaticUrl(center, [], { w: 600, h: heightPx }));
      }
    };

    if (!navigator.geolocation) {
      // Feature unavailable (older WebView / privacy-hardened browser) —
      // fall back to Paris silently so the preview still renders (D-18).
      void buildUrl(PARIS);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        buildUrl({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        // Denied or timed out — fall back to Paris silently (D-18).
        buildUrl(PARIS);
      },
      { timeout: 3000, maximumAge: 60_000 },
    );
  }, [heightPx]);

  // Token-missing guard — rendered as a sub-component to avoid
  // conditional hook issues (rules of hooks, same pattern as MapCanvas).
  if (tokenMissing) {
    return <MissingTokenCard heightPx={heightPx} />;
  }

  return (
    <Link
      href="/map"
      aria-label="Ouvrir la carte"
      className={className}
      style={{
        display: "block",
        position: "relative",
        width: "100%",
        height: heightPx,
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        background: "var(--color-surface-muted)",
        textDecoration: "none",
      }}
    >
      {url ? (
        <img
          src={url}
          alt="Carte des restaurants étoilés autour de vous"
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "grid",
            placeItems: "center",
            color: "var(--color-ink-muted)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          Chargement de la carte…
        </div>
      )}

      {/* "Tout voir" badge — always visible, bottom-right (D-23). */}
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          right: "var(--space-sm)",
          bottom: "var(--space-sm)",
          padding: "2px 10px",
          background: "var(--color-ink)",
          color: "var(--color-bg)",
          borderRadius: "999px",
          fontSize: "var(--font-size-sm)",
          fontWeight: "var(--font-weight-semibold)",
          pointerEvents: "none",
        }}
      >
        Tout voir
      </span>
    </Link>
  );
}
