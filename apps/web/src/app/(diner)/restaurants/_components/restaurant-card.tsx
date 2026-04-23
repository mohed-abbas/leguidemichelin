import Link from "next/link";
import type { RestaurantResponseType } from "@repo/shared-schemas";

const STAR_LABELS: Record<string, string> = {
  BIB: "Bib Gourmand",
  ONE: "1 étoile",
  TWO: "2 étoiles",
  THREE: "3 étoiles",
};

const STAR_SYMBOLS: Record<string, string> = {
  BIB: "🍽",
  ONE: "⭐",
  TWO: "⭐⭐",
  THREE: "⭐⭐⭐",
};

interface RestaurantCardProps {
  restaurant: RestaurantResponseType;
}

export function RestaurantCard({ restaurant: r }: RestaurantCardProps) {
  return (
    <Link
      href={`/restaurants/${r.id}`}
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        color: "inherit",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "160px",
          background: "var(--color-surface-muted)",
          overflow: "hidden",
          position: "relative",
        }}
      >
        {r.heroImageKey ? (
          <img
            src={`/api/images/${r.heroImageKey}`}
            alt={r.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-ink-muted)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            {r.name[0]}
          </div>
        )}
      </div>
      <div
        style={{
          padding: "var(--space-md)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xs)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-xs)",
          }}
        >
          <span
            style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-base)" }}
          >
            {r.name}
          </span>
          <span
            title={STAR_LABELS[r.michelinRating]}
            aria-label={STAR_LABELS[r.michelinRating]}
            style={{ flexShrink: 0 }}
          >
            {STAR_SYMBOLS[r.michelinRating]}
          </span>
        </div>
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-ink-muted)" }}>
          {r.city}
          {r.cuisine ? ` · ${r.cuisine}` : ""}
        </span>
      </div>
    </Link>
  );
}
