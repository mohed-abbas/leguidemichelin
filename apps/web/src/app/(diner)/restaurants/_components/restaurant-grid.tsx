import { RestaurantInfoCard } from "@/app/(diner)/map/_components/RestaurantInfoCard";
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
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
      }}
    >
      {restaurants.map((r) => (
        <RestaurantInfoCard
          key={r.id}
          restaurant={r}
          closable={false}
          isFavorited={r.isFavorited ?? false}
        />
      ))}
    </div>
  );
}
