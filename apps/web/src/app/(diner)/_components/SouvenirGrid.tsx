"use client";

/**
 * SouvenirGrid — responsive thumb grid for /collection (REQ SOUV-06, SOUV-10).
 *
 * Renders either the empty-state nudge ("Scanner maintenant" → /scan) or a
 * responsive grid of square thumbnails. Each tile:
 *   - uses the API-supplied `thumbKey` (no client-side derivation — Phase 3
 *     D-19/D-20 pipeline already emits a 256x256 WebP thumb and the key is
 *     returned verbatim on every SouvenirResponse).
 *   - overlays the Michelin rating bottom-right as a small dark pill with a
 *     gold accent — token-safe background (`var(--color-ink)`) to dodge the
 *     ESLint hex/rgba guard.
 *   - links to `/souvenirs/[id]` for the GSAP reveal surface.
 *
 * Canonical refs:
 *   - 04-CONTEXT.md D-12 (breakpoints 2/3/4), D-13 (newest first, no regroup),
 *     D-14 (French empty-state copy + "Scanner maintenant" CTA).
 *   - 04-05-PLAN.md §Implementation tasks.
 *   - BACKEND-CONTRACT.md §Diner — Souvenirs (GET /api/me/souvenirs shape).
 *
 * NOTE: the star overlay uses the lucide `Star` icon with `fill="var(--color-accent-gold)"`
 * on a neutral pill. Rating → pill content mapping lives in `ratingContent()` below.
 */

import Link from "next/link";
import { Images, Star } from "lucide-react";
import type { MeSouvenirsResponseType } from "@repo/shared-schemas";

import { Button } from "@/components/ui/button";
import styles from "./SouvenirGrid.module.css";

type SouvenirItem = MeSouvenirsResponseType["items"][number];
type Rating = SouvenirItem["michelinRating"];

interface SouvenirGridProps {
  items: SouvenirItem[];
}

export function SouvenirGrid({ items }: SouvenirGridProps) {
  if (items.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={styles.grid}>
      {items.map((item) => (
        <SouvenirTile key={item.id} item={item} />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-md)",
        padding: "var(--space-xl)",
        textAlign: "center",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
      }}
    >
      <Images size={48} color="var(--color-ink-muted)" aria-hidden />
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
        <h2
          style={{
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-ink)",
            margin: 0,
          }}
        >
          Pas encore de souvenirs
        </h2>
        <p
          style={{
            fontSize: "var(--font-size-base)",
            color: "var(--color-ink-muted)",
            margin: 0,
            maxWidth: "32ch",
          }}
        >
          Scannez un QR code dans un restaurant étoilé pour créer le premier.
        </p>
      </div>
      <Button render={<Link href="/scan">Scanner maintenant</Link>} />
    </div>
  );
}

function SouvenirTile({ item }: { item: SouvenirItem }) {
  const rating = item.michelinRating;
  return (
    <Link
      href={`/souvenirs/${item.id}`}
      aria-label={`Souvenir ${item.dishName} au ${item.restaurantName}, ${ratingLabel(rating)}`}
      style={{
        position: "relative",
        display: "block",
        aspectRatio: "1 / 1",
        overflow: "hidden",
        borderRadius: "var(--radius-md)",
        background: "var(--color-surface-muted)",
      }}
    >
      {/* Intentional <img>: the API serves /api/images/<key> with long-cache
          headers (Phase 3 D-22) and we want native lazy loading without
          Next/Image's optimizer pipeline (which would re-encode the thumb). */}
      <img
        src={`/api/images/${item.thumbKey}`}
        alt={item.dishName}
        loading="lazy"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          right: "var(--space-xs)",
          bottom: "var(--space-xs)",
          padding: "2px 6px",
          borderRadius: "var(--radius-full)",
          background: "var(--color-ink)",
          color: "var(--color-accent-gold)",
          fontSize: "var(--font-size-sm)",
          fontWeight: "var(--font-weight-semibold)",
          display: "inline-flex",
          alignItems: "center",
          gap: "2px",
          lineHeight: 1,
        }}
      >
        {ratingContent(rating)}
      </span>
    </Link>
  );
}

function ratingContent(rating: Rating) {
  if (rating === "BIB") {
    return <span aria-hidden>Bib</span>;
  }
  const count = rating === "ONE" ? 1 : rating === "TWO" ? 2 : 3;
  return Array.from({ length: count }, (_, i) => (
    <Star
      key={i}
      size={12}
      fill="var(--color-accent-gold)"
      stroke="var(--color-accent-gold)"
      aria-hidden
    />
  ));
}

function ratingLabel(rating: Rating): string {
  switch (rating) {
    case "BIB":
      return "Bib Gourmand";
    case "ONE":
      return "1 étoile";
    case "TWO":
      return "2 étoiles";
    case "THREE":
      return "3 étoiles";
  }
}
