import { headers } from "next/headers";
import type { AdminStatsResponseType } from "@repo/shared-schemas";
import { PageHeader } from "../../_components/page-header";
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
    <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
      <PageHeader
        eyebrow="Vue d'ensemble"
        title="Tableau de bord"
        description="État de la plateforme — restaurants, membres, souvenirs, économie de points."
      />
      <StatsCards stats={stats} />
    </section>
  );
}
