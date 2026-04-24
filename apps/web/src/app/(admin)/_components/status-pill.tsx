import type { ReactNode } from "react";

type Tone = "success" | "muted" | "warning" | "info" | "destructive";

const TONE: Record<Tone, { bg: string; fg: string; dot: string }> = {
  success: {
    bg: "var(--color-success-bg)",
    fg: "var(--color-success)",
    dot: "var(--color-success)",
  },
  muted: {
    bg: "var(--color-chip-muted-bg)",
    fg: "var(--color-ink-muted)",
    dot: "var(--color-ink-subtle)",
  },
  warning: {
    bg: "var(--color-warning-bg)",
    fg: "var(--color-warning)",
    dot: "var(--color-warning)",
  },
  info: { bg: "var(--color-info-bg)", fg: "var(--color-info)", dot: "var(--color-info)" },
  destructive: {
    bg: "var(--color-destructive-bg)",
    fg: "var(--color-destructive)",
    dot: "var(--color-destructive)",
  },
};

interface Props {
  tone?: Tone;
  children: ReactNode;
  showDot?: boolean;
}

export function StatusPill({ tone = "muted", children, showDot = true }: Props) {
  const t = TONE[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "2px 10px",
        borderRadius: "var(--radius-full)",
        background: t.bg,
        color: t.fg,
        fontSize: "var(--font-size-xs)",
        fontWeight: "var(--font-weight-semibold)",
        lineHeight: 1.4,
        whiteSpace: "nowrap",
      }}
    >
      {showDot ? (
        <span
          aria-hidden
          style={{
            width: 6,
            height: 6,
            borderRadius: "var(--radius-full)",
            background: t.dot,
            flex: "0 0 auto",
          }}
        />
      ) : null}
      {children}
    </span>
  );
}
