/**
 * /scan/[restaurantId] — Souvenir mint page (server component).
 *
 * Fetches restaurant details + menu server-side (cookie-forwarded to the
 * internal Express API) and hands off to the `MintForm` client child.
 * No auth duplication needed here — the diner proxy middleware (02-07)
 * redirects unauthenticated requests to /login before this page renders.
 *
 * Canonical refs:
 *   - 04-03-PLAN.md task 1
 *   - BACKEND-CONTRACT.md §Diner — Restaurants + Souvenirs
 *   - CLAUDE.md PITFALL #5 (no app/api/* handlers; /api/* rewrites to Express)
 */

import { headers } from "next/headers";
import { notFound } from "next/navigation";
import type { RestaurantResponseType, RestaurantMenuResponseType } from "@repo/shared-schemas";
import { MintForm } from "../../_components/MintForm";

const API_INTERNAL = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

async function fetchJson<T>(path: string): Promise<T | null> {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  try {
    const res = await fetch(`${API_INTERNAL}${path}`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export default async function ScanRestaurantPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;

  const [restaurant, menu] = await Promise.all([
    fetchJson<RestaurantResponseType>(`/api/restaurants/${restaurantId}`),
    fetchJson<RestaurantMenuResponseType>(`/api/restaurants/${restaurantId}/menu`),
  ]);

  if (!restaurant || !menu) return notFound();

  return <MintForm restaurant={restaurant} menu={menu} />;
}
