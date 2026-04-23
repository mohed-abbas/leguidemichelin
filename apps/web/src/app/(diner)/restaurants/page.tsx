import { Suspense } from "react";
import { serverApi } from "@/lib/server-api";
import { RestaurantGrid } from "./_components/restaurant-grid";
import { RestaurantFilters } from "./_components/restaurant-filters";
import { Skeleton } from "@/components/ui/skeleton";
import type { RestaurantResponseType } from "@repo/shared-schemas";

interface PageProps {
  searchParams: Promise<{ city?: string; stars?: string }>;
}

export default async function RestaurantsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.city) qs.set("city", params.city);
  if (params.stars) qs.set("stars", params.stars);

  let restaurants: RestaurantResponseType[] = [];
  try {
    const data = await serverApi.get<{ items: RestaurantResponseType[] }>(
      `/restaurants${qs.size ? `?${qs}` : ""}`,
    );
    restaurants = data.items;
  } catch {
    // handled below with empty list
  }

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
      <h1
        style={{
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-semibold)",
          margin: 0,
        }}
      >
        Restaurants
      </h1>
      <Suspense
        fallback={<Skeleton style={{ height: "80px", borderRadius: "var(--radius-md)" }} />}
      >
        <RestaurantFilters />
      </Suspense>
      <RestaurantGrid restaurants={restaurants} />
    </section>
  );
}
