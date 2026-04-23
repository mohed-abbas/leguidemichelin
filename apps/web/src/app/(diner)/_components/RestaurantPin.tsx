"use client";

/**
 * RestaurantPin — popover content rendered inside a react-map-gl <Popup>.
 *
 * Not a Mapbox icon — pin SVGs live in /pins/ and are registered as GL images
 * via MapCanvas.onLoad. This component is the HTML popover shown after a
 * tap on an unclustered-pin feature.
 *
 * Props:
 *  - restaurant: RestaurantResponseType — full restaurant object from pins[]
 *  - visited: boolean — derived from useMapStore.visitedSet.has(id) at call-site
 *
 * CTA contract (D-22):
 *  - Visited  → "Voir le souvenir" → /collection (best-effort; linking directly
 *    to the latest souvenir would require Map<restaurantId, latestSouvenirId>
 *    which is feasible but out of scope for this plan — noted in SUMMARY)
 *  - Unvisited → "Scanner ici" → /scan
 *
 * The Button component uses @base-ui/react which exposes a `render` prop
 * (not `asChild`) to swap the rendered element — we pass a Next.js <Link>.
 *
 * Canonical refs:
 *   - 04-07-PLAN.md task 3
 *   - 04-CONTEXT.md D-22 (popover contract)
 */

import Link from "next/link";
import { Star } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import type { RestaurantResponseType } from "@repo/shared-schemas";
import { cn } from "@/lib/utils";

// ─── MichelinStars helper ─────────────────────────────────────────────────
// Inline duplicate of MintForm's sub-component — acceptable for now.
// If a shared helper is needed later, extract to a shared util.

function MichelinStars({ rating }: { rating: RestaurantResponseType["michelinRating"] }) {
  if (rating === "BIB") {
    return (
      <span
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--color-accent-gold)",
          fontWeight: "var(--font-weight-semibold)",
        }}
      >
        Bib Gourmand
      </span>
    );
  }

  const count = rating === "ONE" ? 1 : rating === "TWO" ? 2 : 3;
  return (
    <span style={{ display: "inline-flex", gap: "2px", alignItems: "center" }}>
      {Array.from({ length: count }).map((_, i) => (
        <Star
          key={i}
          size={14}
          fill="var(--color-accent-gold)"
          color="var(--color-accent-gold)"
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

// ─── RestaurantPopover ────────────────────────────────────────────────────

interface RestaurantPopoverProps {
  restaurant: RestaurantResponseType;
  visited: boolean;
}

export function RestaurantPopover({ restaurant, visited }: RestaurantPopoverProps) {
  // @base-ui/react Button uses `render` prop to swap the element (not asChild).
  const ctaClass = cn(buttonVariants({ variant: "default", size: "sm" }));

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-xs)",
        minWidth: "180px",
        maxWidth: "240px",
        padding: "var(--space-sm)",
      }}
    >
      {/* Restaurant name */}
      <h3
        style={{
          fontSize: "var(--font-size-base)",
          fontWeight: "var(--font-weight-semibold)",
          color: "var(--color-ink)",
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        {restaurant.name}
      </h3>

      {/* Star rating row */}
      <MichelinStars rating={restaurant.michelinRating} />

      {/* Cuisine or city subtitle */}
      {restaurant.cuisine ? (
        <p
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-ink-muted)",
            margin: 0,
          }}
        >
          {restaurant.cuisine}
        </p>
      ) : (
        <p
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-ink-muted)",
            margin: 0,
          }}
        >
          {restaurant.city}
        </p>
      )}

      {/* Contextual CTA — use render prop to render as Next.js Link */}
      <Button
        render={
          visited ? (
            <Link
              href="/collection"
              aria-label="Voir le souvenir de ce restaurant"
              className={ctaClass}
              style={{
                marginTop: "var(--space-xs)",
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            />
          ) : (
            <Link
              href="/scan"
              aria-label="Scanner le QR code de ce restaurant"
              className={ctaClass}
              style={{
                marginTop: "var(--space-xs)",
                width: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            />
          )
        }
      >
        {visited ? "Voir le souvenir" : "Scanner ici"}
      </Button>
    </div>
  );
}
