import type { ReactNode } from "react";

/**
 * Surface wrapper for table-like content. Standard 1px warm border,
 * white surface, large radius. Inline styles to match the project convention.
 */
export function DataCard({ children, padding = "0" }: { children: ReactNode; padding?: string }) {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-card)",
        overflow: "hidden",
        padding,
      }}
    >
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        padding: "var(--space-2xl) var(--space-xl)",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-sm)",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "var(--color-ink)",
          fontWeight: "var(--font-weight-semibold)",
          fontSize: "var(--font-size-base)",
        }}
      >
        {title}
      </p>
      {hint ? (
        <p
          style={{
            margin: 0,
            color: "var(--color-ink-muted)",
            fontSize: "var(--font-size-sm)",
            maxWidth: "44ch",
          }}
        >
          {hint}
        </p>
      ) : null}
      {action ? <div style={{ marginTop: "var(--space-xs)" }}>{action}</div> : null}
    </div>
  );
}
