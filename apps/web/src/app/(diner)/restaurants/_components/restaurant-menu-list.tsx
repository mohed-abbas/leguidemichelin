import type { DishResponseShapeType } from "@repo/shared-schemas";

function formatPriceEUR(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

interface RestaurantMenuListProps {
  dishes: DishResponseShapeType[];
}

export function RestaurantMenuList({ dishes }: RestaurantMenuListProps) {
  if (dishes.length === 0) {
    return (
      <p style={{ color: "var(--color-ink-muted)", margin: 0 }}>
        Aucun plat disponible pour le moment.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
      {dishes.map((dish) => (
        <div
          key={dish.id}
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "var(--space-md)",
            padding: "var(--space-md)",
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
            <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{dish.name}</span>
            {dish.description && (
              <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-ink-muted)" }}>
                {dish.description}
              </span>
            )}
          </div>
          <span style={{ fontWeight: "var(--font-weight-semibold)", flexShrink: 0 }}>
            {formatPriceEUR(dish.priceCents)}
          </span>
        </div>
      ))}
    </div>
  );
}
