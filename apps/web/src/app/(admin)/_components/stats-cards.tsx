import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminStatsResponseType } from "@repo/shared-schemas";

interface Props {
  stats: AdminStatsResponseType;
}

export function StatsCards({ stats }: Props) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
      }}
    >
      <div
        style={{
          display: "grid",
          gap: "var(--space-md)",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        <Card>
          <CardHeader>
            <CardDescription>Restaurants</CardDescription>
            <CardTitle>{stats.restaurants.active}</CardTitle>
          </CardHeader>
          <CardContent style={{ color: "var(--color-ink-muted)" }}>
            {stats.restaurants.disabled} désactivé
            {stats.restaurants.disabled > 1 ? "s" : ""}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Utilisateurs</CardDescription>
            <CardTitle>{stats.users.diners + stats.users.staff + stats.users.admins}</CardTitle>
          </CardHeader>
          <CardContent style={{ color: "var(--color-ink-muted)" }}>
            {stats.users.diners} dîneurs · {stats.users.staff} staff · {stats.users.admins} admin
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Souvenirs</CardDescription>
            <CardTitle>{stats.souvenirs.total}</CardTitle>
          </CardHeader>
          <CardContent style={{ color: "var(--color-ink-muted)" }}>
            +{stats.souvenirs.last7d} sur 7 jours
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Échanges récompenses</CardDescription>
            <CardTitle>{stats.redemptions.total}</CardTitle>
          </CardHeader>
          <CardContent style={{ color: "var(--color-ink-muted)" }}>
            +{stats.redemptions.last7d} sur 7 jours
          </CardContent>
        </Card>
      </div>

      <footer
        style={{
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-lg)",
          padding: "var(--space-md) var(--space-lg)",
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <span style={{ color: "var(--color-ink-muted)" }}>Points en circulation</span>
        <span
          style={{
            fontSize: "var(--font-size-lg)",
            fontWeight: "var(--font-weight-semibold)",
          }}
        >
          {stats.totalPointsOutstanding.toLocaleString("fr-FR")}
        </span>
      </footer>
    </div>
  );
}
