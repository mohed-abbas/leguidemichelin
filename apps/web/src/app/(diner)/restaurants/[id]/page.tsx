import { notFound } from "next/navigation";
import { serverApi } from "@/lib/server-api";
import { RestaurantDetailHero } from "../_components/restaurant-detail-hero";
import { RestaurantReviewersRow } from "../_components/restaurant-reviewers-row";
import { RestaurantScanCta } from "../_components/restaurant-scan-cta";
import { RestaurantMenuList } from "../_components/restaurant-menu-list";
import { RestaurantInfoCard } from "@/app/(diner)/map/_components/RestaurantInfoCard";
import type { RestaurantMenuResponseType } from "@repo/shared-schemas";
import { ApiError } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RestaurantDetailPage({ params }: PageProps) {
  const { id } = await params;

  let data: RestaurantMenuResponseType | null = null;
  try {
    data = await serverApi.get<RestaurantMenuResponseType>(`/restaurants/${id}/menu`);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) {
      notFound();
    }
    throw err;
  }

  if (!data) notFound();

  const { restaurant, dishes } = data;

  return (
    <div
      data-auth-surface
      style={{
        display: "flex",
        flexDirection: "column",
        paddingBottom: "24px",
        background: "var(--color-bg)",
        minHeight: "100%",
      }}
    >
      <style>
        {`[data-auth-surface] :where(button,a,input):focus-visible{outline:2px solid var(--color-primary);outline-offset:2px;border-radius:inherit;}`}
      </style>

      <RestaurantDetailHero restaurant={restaurant} />

      {/* Floating summary card overlapping the hero's bottom edge.
          Reuses the map surface's RestaurantInfoCard as-is — emblem, name,
          city/cuisine, thumbnail, and the 4-icon action row replace the
          previous h1 block + RestaurantActionCards tiles. */}
      <div
        style={{
          paddingInline: "16px",
          marginTop: "-60px",
          position: "relative",
          zIndex: 1,
        }}
      >
        <RestaurantInfoCard
          restaurant={restaurant}
          closable={false}
          isFavorited={restaurant.isFavorited ?? false}
        />
      </div>

      <div style={{ marginTop: "20px" }}>
        <RestaurantReviewersRow />
      </div>

      <section
        style={{
          marginTop: "24px",
          paddingInline: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontSize: "var(--font-size-h2)",
            fontWeight: "var(--font-weight-medium)",
            color: "var(--color-ink)",
            lineHeight: "var(--line-height-lg)",
          }}
        >
          Menu
        </h2>
        <RestaurantMenuList dishes={dishes} />
      </section>

      <RestaurantScanCta restaurantId={restaurant.id} />
    </div>
  );
}

export function generateMetadata() {
  return { title: "Restaurant — Guide Foodie Journey" };
}
