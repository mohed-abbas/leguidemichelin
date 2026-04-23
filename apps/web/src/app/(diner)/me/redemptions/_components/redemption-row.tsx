import type { RedemptionResponseType } from "@repo/shared-schemas";

function relativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const rtf = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  const seconds = Math.round(diff / 1000);
  if (Math.abs(seconds) < 60) return rtf.format(-seconds, "second");
  const minutes = Math.round(seconds / 60);
  if (Math.abs(minutes) < 60) return rtf.format(-minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(-hours, "hour");
  const days = Math.round(hours / 24);
  return rtf.format(-days, "day");
}

interface RedemptionRowProps {
  redemption: RedemptionResponseType;
}

export function RedemptionRow({ redemption: r }: RedemptionRowProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-xs)",
        padding: "var(--space-md)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-sm)",
        }}
      >
        <span style={{ fontWeight: "var(--font-weight-semibold)" }}>{r.reward.title}</span>
        <span
          style={{
            color: "var(--color-ink-muted)",
            fontSize: "var(--font-size-sm)",
            flexShrink: 0,
          }}
        >
          −{r.pointsSpent} pts
        </span>
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)", flexWrap: "wrap" }}
      >
        <code
          style={{
            fontFamily: "monospace",
            background: "var(--color-surface-muted)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            padding: "2px var(--space-xs)",
            fontSize: "var(--font-size-sm)",
            letterSpacing: "0.05em",
          }}
        >
          {r.code}
        </code>
        <span
          style={{
            background: "var(--color-surface-muted)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-sm)",
            padding: "2px var(--space-xs)",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-ink-muted)",
          }}
        >
          Démo
        </span>
      </div>
      <time
        dateTime={r.createdAt}
        style={{ fontSize: "var(--font-size-xs)", color: "var(--color-ink-muted)" }}
      >
        {relativeTime(r.createdAt)}
      </time>
    </div>
  );
}
