/**
 * /favorites — diner favorites list (Phase 04.1 Req 9).
 *
 * Server component: forwards the incoming Cookie to the internal Express
 * origin and hands the authoritative list to <FavoritesList /> ("use client").
 * Distinguishes 401 → logged-out empty state from ok → list/empty rendering;
 * any other non-ok falls through with empty items (matches /collection's
 * graceful degrade).
 *
 * Canonical refs:
 *   - 04.1-SPEC.md Req 9, 04.1-UI-SPEC.md §3 /favorites Page + Accessibility.
 *   - 04.1-09-PLAN.md §Implementation tasks.
 *   - BACKEND-CONTRACT — GET /api/me/favorites.
 */

import { headers } from "next/headers";
import type { MeFavoritesResponseType } from "@repo/shared-schemas";
import { FavoritesList } from "./_components/FavoritesList";

const API_INTERNAL = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const h = await headers();
  const cookie = h.get("cookie") ?? "";
  const res = await fetch(`${API_INTERNAL}/api/me/favorites`, {
    headers: { cookie },
    cache: "no-store",
  });

  const loggedOut = res.status === 401;
  const data: MeFavoritesResponseType = res.ok
    ? ((await res.json()) as MeFavoritesResponseType)
    : { items: [] };

  return (
    <section
      data-auth-surface
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
        paddingBlock: "var(--space-md)",
        paddingInline: "var(--space-md)",
      }}
    >
      <style>{`[data-auth-surface] :where(button,a,input):focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }`}</style>
      <header>
        <h1
          style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-ink)",
            margin: 0,
          }}
        >
          Mes favoris
        </h1>
      </header>
      <FavoritesList initial={data.items} loggedOut={loggedOut} />
    </section>
  );
}
