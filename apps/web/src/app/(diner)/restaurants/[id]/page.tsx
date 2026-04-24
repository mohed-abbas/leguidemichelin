import { notFound } from "next/navigation";
import { serverApi } from "@/lib/server-api";
import { RestaurantDetailHero } from "../_components/restaurant-detail-hero";
import { RestaurantActionCards } from "../_components/restaurant-action-cards";
import { RestaurantReviewersRow } from "../_components/restaurant-reviewers-row";
import { RestaurantScanCta } from "../_components/restaurant-scan-cta";
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

  const { restaurant } = data;

  return (
    <div
      data-auth-surface
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        paddingBottom: "24px",
        background: "var(--color-bg)",
        minHeight: "100%",
      }}
    >
      <style>
        {`[data-auth-surface] :where(button,a,input):focus-visible{outline:2px solid var(--color-primary);outline-offset:2px;border-radius:inherit;}`}
      </style>
      <RestaurantDetailHero restaurant={restaurant} />

      <header
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2px",
          paddingInline: "16px",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontSize: "24px",
            fontWeight: "var(--font-weight-regular)",
            color: "var(--color-ink)",
            lineHeight: "normal",
          }}
        >
          {restaurant.name}
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            lineHeight: "17px",
            color: "var(--color-ink)",
          }}
        >
          {restaurant.address}, {restaurant.city}
        </p>
        {restaurant.cuisine && (
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              lineHeight: "17px",
              color: "var(--color-ink)",
            }}
          >
            {restaurant.cuisine}
          </p>
        )}
      </header>

      <RestaurantActionCards
        initialFavorited={restaurant.isFavorited ?? false}
        restaurantId={restaurant.id}
      />

      <RestaurantReviewersRow />

      <RestaurantScanCta restaurantId={restaurant.id} />
    </div>
  );
}

export function generateMetadata() {
  return { title: "Restaurant — Guide Foodie Journey" };
}
