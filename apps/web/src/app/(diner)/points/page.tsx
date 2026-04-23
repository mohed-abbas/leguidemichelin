/**
 * /points — Points balance + ledger (REQ POINTS-02, POINTS-03, SOUV-07).
 *
 * Server component: forwards the incoming Cookie to the internal Express
 * origin and hydrates the hero + ledger client components. Rendering of
 * the actual cards/rows is delegated to <PointsHero /> and <PointsLedger />
 * ("use client") so Intl formatting and row links stay on the client
 * where they belong.
 *
 * 401 inside the (diner)/ layout should be impossible — the layout/proxy
 * already gates DINER-only routes — but we guard anyway per the plan's
 * defensive-redirect rule, which matches what /collection does on failure
 * (fail-soft empty state) adapted here to a login redirect so the user
 * doesn't see a zero-balance card.
 *
 * Canonical refs:
 *   - 04-CONTEXT.md D-15 (hero + ledger layout), D-16 (denormalized labels).
 *   - 04-06-PLAN.md §Implementation tasks #1.
 *   - BACKEND-CONTRACT.md §Diner — Points (GET /api/me/points).
 */

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { MePointsResponseType } from "@repo/shared-schemas";

import { PointsHero } from "../_components/PointsHero";
import { PointsLedger } from "../_components/PointsLedger";

const API_INTERNAL = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

export const dynamic = "force-dynamic";

export default async function PointsPage() {
  const h = await headers();
  const res = await fetch(`${API_INTERNAL}/api/me/points`, {
    headers: { cookie: h.get("cookie") ?? "" },
    cache: "no-store",
  });

  if (res.status === 401) {
    redirect("/login");
  }

  const data: MePointsResponseType = res.ok
    ? ((await res.json()) as MePointsResponseType)
    : { balance: 0, ledger: [] };

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
          Mes points
        </h1>
        <p
          style={{
            color: "var(--color-ink-muted)",
            marginTop: "var(--space-xs)",
            marginBottom: 0,
            fontSize: "var(--font-size-base)",
          }}
        >
          Solde et historique de vos transactions.
        </p>
      </header>
      <PointsHero balance={data.balance} />
      <PointsLedger balance={data.balance} entries={data.ledger} />
    </section>
  );
}
