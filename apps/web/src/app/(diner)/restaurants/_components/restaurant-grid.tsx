import { RestaurantCard } from "./restaurant-card";
import type { RestaurantResponseType } from "@repo/shared-schemas";

interface RestaurantGridProps {
  restaurants: RestaurantResponseType[];
}

export function RestaurantGrid({ restaurants }: RestaurantGridProps) {
  if (restaurants.length === 0) {
    return (
      <p style={{ color: "var(--color-ink-muted)", margin: 0 }}>
        Aucun restaurant ne correspond aux filtres.
      </p>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: "var(--space-md)",
      }}
    >
      {restaurants.map((r) => (
        <RestaurantCard key={r.id} restaurant={r} />
      ))}
    </div>
  );
}
