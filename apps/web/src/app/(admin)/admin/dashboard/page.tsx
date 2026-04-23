import { headers } from "next/headers";
import type { AdminStatsResponseType } from "@repo/shared-schemas";
import { StatsCards } from "../../_components/stats-cards";

async function getStats(): Promise<AdminStatsResponseType> {
  const apiInternalUrl = process.env.API_INTERNAL_URL ?? "http://localhost:3001";
  const cookie = (await headers()).get("cookie") ?? "";
  const res = await fetch(`${apiInternalUrl}/api/admin/stats`, {
    headers: { cookie },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`stats fetch failed: ${res.status}`);
  }
  return (await res.json()) as AdminStatsResponseType;
}

export default async function DashboardPage() {
  const stats = await getStats();
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
      }}
    >
      <header>
        <h1
          style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-semibold)",
            margin: 0,
          }}
        >
          Tableau de bord
        </h1>
        <p style={{ color: "var(--color-ink-muted)", margin: "var(--space-xs) 0 0" }}>
          Vue d&apos;ensemble de la plateforme.
        </p>
      </header>
      <StatsCards stats={stats} />
    </section>
  );
}
