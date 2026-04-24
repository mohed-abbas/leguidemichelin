import { headers } from "next/headers";
import type {
  MeSouvenirsResponseType,
  RestaurantMenuResponseType,
  SouvenirResponseType,
} from "@repo/shared-schemas";

import { ChasseurHeader } from "./_components/ChasseurHeader";
import { ChasseurTabs } from "./_components/ChasseurTabs";
import { priceTierFromRating, type CollectionItem } from "./_data";

const API_INTERNAL = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

export const dynamic = "force-dynamic";

async function fetchMenu(id: string, cookie: string): Promise<RestaurantMenuResponseType | null> {
  const res = await fetch(`${API_INTERNAL}/api/restaurants/${id}/menu`, {
    headers: { cookie },
    cache: "no-store",
  });
  return res.ok ? ((await res.json()) as RestaurantMenuResponseType) : null;
}

function buildCollectionItems(
  souvenirs: SouvenirResponseType[],
  menus: Map<string, RestaurantMenuResponseType | null>,
): CollectionItem[] {
  const byRestaurant = new Map<string, SouvenirResponseType[]>();
  for (const s of souvenirs) {
    const list = byRestaurant.get(s.restaurantId) ?? [];
    list.push(s);
    byRestaurant.set(s.restaurantId, list);
  }

  const items: CollectionItem[] = [];
  for (const [restaurantId, list] of byRestaurant.entries()) {
    // Newest first within each group (API already returns newest-first overall).
    list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const newest = list[0]!;
    const distinctDishes = new Set(list.map((s) => s.dishId)).size;
    const menu = menus.get(restaurantId) ?? null;
    const totalDishes = menu?.dishes.length ?? distinctDishes;
    const cuisine = menu?.restaurant.cuisine ?? "Cuisine à découvrir";

    items.push({
      id: restaurantId,
      name: newest.restaurantName,
      city: newest.restaurantCity,
      priceTier: priceTierFromRating(newest.michelinRating),
      cuisine,
      progressCurrent: distinctDishes,
      progressTotal: Math.max(totalDishes, distinctDishes),
      thumbnail: `/api/images/${newest.thumbKey}`,
      coupDeCoeur: newest.michelinRating === "BIB",
      href: `/souvenirs/${newest.id}`,
    });
  }
  return items;
}

export default async function ChasseurPage() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";

  const souvenirsRes = await fetch(`${API_INTERNAL}/api/me/souvenirs`, {
    headers: { cookie },
    cache: "no-store",
  });
  const data: MeSouvenirsResponseType = souvenirsRes.ok
    ? ((await souvenirsRes.json()) as MeSouvenirsResponseType)
    : { items: [], visitedRestaurantIds: [] };

  const uniqueRestaurantIds = Array.from(new Set(data.items.map((s) => s.restaurantId)));
  const menuResults = await Promise.all(uniqueRestaurantIds.map((id) => fetchMenu(id, cookie)));
  const menus = new Map(uniqueRestaurantIds.map((id, i) => [id, menuResults[i] ?? null]));

  const items = buildCollectionItems(data.items, menus);
  const starCount = data.items.length;

  return (
    <div
      style={{
        background: "var(--color-bg)",
        minHeight: "100dvh",
      }}
    >
      <ChasseurHeader />
      <ChasseurTabs items={items} starCount={starCount} />
    </div>
  );
}

export const metadata = { title: "Chasseur d’étoiles — Guide Foodie Journey" };
