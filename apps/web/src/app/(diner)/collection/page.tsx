/**
 * /collection — diner souvenir list (REQ SOUV-06, SOUV-10).
 *
 * Server component: forwards the incoming Cookie to the internal Express
 * origin and hydrates the grid with the diner's souvenirs. Rendering of
 * the tiles + empty state is delegated to <SouvenirGrid /> ("use client")
 * so the iconography / overlay can co-locate with the consumer that needs
 * them without dragging lucide imports into the RSC layer.
 *
 * Canonical refs:
 *   - 04-CONTEXT.md D-12 (2/3/4-col grid), D-13 (newest-first from API,
 *     no client regroup), D-14 (French empty-state copy).
 *   - 04-05-PLAN.md §Implementation tasks.
 *   - BACKEND-CONTRACT.md §Diner — Souvenirs (GET /api/me/souvenirs).
 */

import { headers } from "next/headers";
import type { MeSouvenirsResponseType } from "@repo/shared-schemas";

import { SouvenirGrid } from "../_components/SouvenirGrid";

const API_INTERNAL = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

export const dynamic = "force-dynamic";

export default async function CollectionPage() {
  const h = await headers();
  const res = await fetch(`${API_INTERNAL}/api/me/souvenirs`, {
    headers: { cookie: h.get("cookie") ?? "" },
    cache: "no-store",
  });

  const data: MeSouvenirsResponseType = res.ok
    ? ((await res.json()) as MeSouvenirsResponseType)
    : { items: [], visitedRestaurantIds: [] };

  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
        paddingBlock: "var(--space-md)",
      }}
    >
      <header>
        <h1
          style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-ink)",
            margin: 0,
          }}
        >
          Ma collection
        </h1>
        <p
          style={{
            color: "var(--color-ink-muted)",
            marginTop: "var(--space-xs)",
            marginBottom: 0,
            fontSize: "var(--font-size-base)",
          }}
        >
          Tous les souvenirs de vos visites étoilées.
        </p>
      </header>
      <SouvenirGrid items={data.items} />
    </section>
  );
}
