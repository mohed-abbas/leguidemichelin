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
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        paddingBottom: "24px",
        background: "var(--color-bg)",
        minHeight: "100%",
      }}
    >
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

      <RestaurantActionCards />

      <RestaurantReviewersRow likes={43} reviewers={12} />

      <p
        style={{
          margin: 0,
          paddingInline: "16px",
          fontFamily: "var(--font-sans)",
          fontSize: "17px",
          lineHeight: "22px",
          color: "var(--color-ink)",
        }}
      >
        Ce restaurant d’hôtel de charme au cœur du Quartier latin propose une comfort food créative
        servie dans un havre de calme : murs lambrissés, mobilier chiné, éclairage tamisé. La carte
        courte change au fil des saisons et met en valeur les produits du marché.
      </p>

      <RestaurantScanCta restaurantId={restaurant.id} />
    </div>
  );
}

export function generateMetadata() {
  return { title: "Restaurant — Guide Foodie Journey" };
}
