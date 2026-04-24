import { Coins, Gift, ImageIcon, ShieldCheck, Store, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AdminStatsResponseType } from "@repo/shared-schemas";

interface Props {
  stats: AdminStatsResponseType;
}

interface KpiTile {
  label: string;
  value: string;
  trend?: string;
  trendTone?: "neutral" | "positive";
  hint?: string;
  Icon: LucideIcon;
  accent: string;
}

function fr(n: number): string {
  return n.toLocaleString("fr-FR");
}

export function StatsCards({ stats }: Props) {
  const totalUsers = stats.users.diners + stats.users.staff + stats.users.admins;

  const kpis: KpiTile[] = [
    {
      label: "Restaurants actifs",
      value: fr(stats.restaurants.active),
      hint: `${fr(stats.restaurants.disabled)} désactivé${stats.restaurants.disabled > 1 ? "s" : ""}`,
      Icon: Store,
      accent: "var(--color-primary)",
    },
    {
      label: "Membres",
      value: fr(totalUsers),
      hint: `${fr(stats.users.diners)} dîneurs · ${fr(stats.users.staff)} staff · ${fr(stats.users.admins)} admin`,
      Icon: Users,
      accent: "var(--color-info)",
    },
    {
      label: "Souvenirs collectés",
      value: fr(stats.souvenirs.total),
      trend: `+${fr(stats.souvenirs.last7d)} cette semaine`,
      trendTone: stats.souvenirs.last7d > 0 ? "positive" : "neutral",
      Icon: ImageIcon,
      accent: "var(--color-accent-gold)",
    },
    {
      label: "Récompenses échangées",
      value: fr(stats.redemptions.total),
      trend: `+${fr(stats.redemptions.last7d)} cette semaine`,
      trendTone: stats.redemptions.last7d > 0 ? "positive" : "neutral",
      Icon: Gift,
      accent: "var(--color-success)",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
      <div
        style={{
          display: "grid",
          gap: "var(--space-md)",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        {kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
          gap: "var(--space-md)",
        }}
      >
        <Panel
          title="Économie de points"
          description="Solde global des points en circulation, mis à jour à chaque souvenir minté ou récompense échangée."
          Icon={Coins}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "var(--space-md)",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: "var(--font-size-h1)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--color-ink)",
                lineHeight: 1,
              }}
            >
              {fr(stats.totalPointsOutstanding)}
            </span>
            <span
              style={{
                fontSize: "var(--font-size-sm)",
                color: "var(--color-ink-muted)",
              }}
            >
              points en circulation
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontSize: "var(--font-size-sm)",
              color: "var(--color-ink-muted)",
            }}
          >
            Net = points mintés (Σ Souvenir.pointsAwarded) − points échangés (Σ
            Redemption.pointsSpent).
          </p>
        </Panel>

        <Panel title="Couverture" description="Santé du catalogue." Icon={ShieldCheck}>
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-sm)",
            }}
          >
            <CoverageRow
              label="Restaurants en ligne"
              total={stats.restaurants.active + stats.restaurants.disabled}
              part={stats.restaurants.active}
              tone="var(--color-success)"
            />
            <CoverageRow
              label="Comptes actifs"
              total={totalUsers}
              part={totalUsers}
              tone="var(--color-info)"
            />
            <CoverageRow
              label="Souvenirs / récompense"
              total={Math.max(stats.souvenirs.total, 1)}
              part={Math.min(stats.redemptions.total, stats.souvenirs.total)}
              tone="var(--color-accent-gold)"
              hint={`${stats.souvenirs.total} : ${stats.redemptions.total}`}
            />
          </ul>
        </Panel>
      </div>
    </div>
  );
}

function KpiCard({ label, value, trend, trendTone, hint, Icon, accent }: KpiTile) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-md)",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-sm)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: accent,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-sm)",
        }}
      >
        <span
          style={{
            color: "var(--color-ink-muted)",
            fontSize: "var(--font-size-xs)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            fontWeight: "var(--font-weight-semibold)",
          }}
        >
          {label}
        </span>
        <span
          aria-hidden
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
            background: "var(--color-surface-muted)",
            color: accent,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Icon size={16} aria-hidden />
        </span>
      </div>
      <span
        style={{
          fontSize: "var(--font-size-h1)",
          fontWeight: "var(--font-weight-bold)",
          color: "var(--color-ink)",
          lineHeight: 1.05,
        }}
      >
        {value}
      </span>
      {trend ? (
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            fontWeight: "var(--font-weight-semibold)",
            color: trendTone === "positive" ? "var(--color-success)" : "var(--color-ink-muted)",
          }}
        >
          {trend}
        </span>
      ) : null}
      {hint ? (
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-ink-muted)" }}>
          {hint}
        </span>
      ) : null}
    </div>
  );
}

function Panel({
  title,
  description,
  Icon,
  children,
}: {
  title: string;
  description?: string;
  Icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-lg)",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        minHeight: 200,
      }}
    >
      <header style={{ display: "flex", gap: "var(--space-sm)", alignItems: "flex-start" }}>
        <span
          aria-hidden
          style={{
            width: 32,
            height: 32,
            borderRadius: "var(--radius-md)",
            background: "var(--color-surface-muted)",
            color: "var(--color-primary)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto",
          }}
        >
          <Icon size={16} aria-hidden />
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <h2
            style={{
              fontSize: "var(--font-size-base)",
              fontWeight: "var(--font-weight-semibold)",
              margin: 0,
              color: "var(--color-ink)",
            }}
          >
            {title}
          </h2>
          {description ? (
            <p
              style={{
                margin: 0,
                fontSize: "var(--font-size-sm)",
                color: "var(--color-ink-muted)",
              }}
            >
              {description}
            </p>
          ) : null}
        </div>
      </header>
      {children}
    </section>
  );
}

function CoverageRow({
  label,
  total,
  part,
  tone,
  hint,
}: {
  label: string;
  total: number;
  part: number;
  tone: string;
  hint?: string;
}) {
  const ratio = total > 0 ? Math.min(1, part / total) : 0;
  return (
    <li style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "var(--space-sm)",
        }}
      >
        <span style={{ fontSize: "var(--font-size-sm)", color: "var(--color-ink)" }}>{label}</span>
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--color-ink-muted)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {hint ?? `${fr(part)} / ${fr(total)}`}
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: "var(--color-surface-muted)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            width: `${Math.round(ratio * 100)}%`,
            height: "100%",
            background: tone,
            borderRadius: "var(--radius-full)",
            transition: "width var(--duration-base) var(--ease-standard)",
          }}
        />
      </div>
    </li>
  );
}
