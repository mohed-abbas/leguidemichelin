import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { RestaurantMenuResponseType } from "@repo/shared-schemas";
import { DishManager } from "../../../_components/dish-manager";
import { RATING_LABEL } from "../../../_components/rating";

async function getMenu(id: string): Promise<RestaurantMenuResponseType | null> {
  const apiInternalUrl = process.env.API_INTERNAL_URL ?? "http://localhost:3001";
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await fetch(`${apiInternalUrl}/api/admin/restaurants/${id}/menu`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`menu fetch failed: ${res.status}`);
  return (await res.json()) as RestaurantMenuResponseType;
}

export default async function AdminRestaurantMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const menu = await getMenu(id);
  if (!menu) notFound();

  const { restaurant, dishes } = menu;
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
      }}
    >
      <Link
        href="/admin/restaurants"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--space-xs)",
          color: "var(--color-ink-muted)",
          textDecoration: "none",
          fontSize: "var(--font-size-sm)",
        }}
      >
        <ArrowLeft size={14} aria-hidden /> Retour à la liste
      </Link>

      <header
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-xs)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-sm)",
            color: "var(--color-ink-muted)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          <span>{RATING_LABEL[restaurant.michelinRating]}</span>
          <span>·</span>
          <span>{restaurant.city}</span>
          {restaurant.cuisine ? (
            <>
              <span>·</span>
              <span>{restaurant.cuisine}</span>
            </>
          ) : null}
        </div>
        <h1
          style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-semibold)",
            margin: 0,
          }}
        >
          {restaurant.name}
        </h1>
        <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>{restaurant.address}</p>
      </header>

      <DishManager restaurantId={restaurant.id} initialDishes={dishes} />
    </section>
  );
}
