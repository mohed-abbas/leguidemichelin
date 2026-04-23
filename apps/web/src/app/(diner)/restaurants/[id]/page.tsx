import { notFound } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { RestaurantDetailHero } from "../_components/restaurant-detail-hero";
import { RestaurantMenuList } from "../_components/restaurant-menu-list";
import type { RestaurantMenuResponseType } from "@repo/shared-schemas";
import { ApiError } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RestaurantDetailPage({ params }: PageProps) {
  const { id } = await params;

  let data: RestaurantMenuResponseType | null = null;
  try {
    data = await api.get<RestaurantMenuResponseType>(`/restaurants/${id}/menu`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  if (!data) notFound();

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>
      <RestaurantDetailHero restaurant={data.restaurant} />

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
        <h2
          style={{
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--font-weight-semibold)",
            margin: 0,
          }}
        >
          Menu
        </h2>
        <RestaurantMenuList dishes={data.dishes} />
      </div>

      <Link href={`/scan/${id}`}>
        <Button type="button" style={{ width: "100%" }}>
          Scanner ici
        </Button>
      </Link>
    </section>
  );
}

export function generateMetadata() {
  return { title: "Restaurant — Guide Foodie Journey" };
}
