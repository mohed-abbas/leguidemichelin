import type { RestaurantResponseType } from "@repo/shared-schemas";

const STAR_LABELS: Record<string, string> = {
  BIB: "Bib Gourmand 🍽",
  ONE: "1 étoile ⭐",
  TWO: "2 étoiles ⭐⭐",
  THREE: "3 étoiles ⭐⭐⭐",
};

interface RestaurantDetailHeroProps {
  restaurant: RestaurantResponseType;
}

export function RestaurantDetailHero({ restaurant: r }: RestaurantDetailHeroProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      <div
        style={{
          height: "220px",
          background: "var(--color-surface-muted)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        {r.heroImageKey ? (
          <img
            src={`/api/images/${r.heroImageKey}`}
            alt={`Photo de ${r.name}`}
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
              fontSize: "var(--font-size-xl)",
              color: "var(--color-ink-muted)",
            }}
          >
            {r.name[0]}
          </div>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-sm)",
          }}
        >
          <h1
            style={{
              fontSize: "var(--font-size-xl)",
              fontWeight: "var(--font-weight-semibold)",
              margin: 0,
            }}
          >
            {r.name}
          </h1>
          <span
            style={{
              background: "var(--color-surface-muted)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-xs) var(--space-sm)",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-semibold)",
              flexShrink: 0,
            }}
          >
            {STAR_LABELS[r.michelinRating]}
          </span>
        </div>
        {r.cuisine && (
          <span style={{ color: "var(--color-ink-muted)", fontSize: "var(--font-size-sm)" }}>
            {r.cuisine}
          </span>
        )}
        <address
          style={{
            fontStyle: "normal",
            color: "var(--color-ink-muted)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          {r.address}, {r.city}
        </address>
      </div>
    </div>
  );
}
