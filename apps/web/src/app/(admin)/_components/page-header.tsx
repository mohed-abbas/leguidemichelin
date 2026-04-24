import type { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, actions }: Props) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "var(--space-md)",
        paddingBottom: "var(--space-md)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
        {eyebrow ? (
          <span
            style={{
              color: "var(--color-primary)",
              fontSize: "var(--font-size-xs)",
              fontWeight: "var(--font-weight-semibold)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            {eyebrow}
          </span>
        ) : null}
        <h1
          style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-semibold)",
            margin: 0,
            color: "var(--color-ink)",
            lineHeight: "var(--line-height-xl)",
          }}
        >
          {title}
        </h1>
        {description ? (
          <p
            style={{
              color: "var(--color-ink-muted)",
              margin: 0,
              fontSize: "var(--font-size-sm)",
            }}
          >
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div style={{ display: "flex", gap: "var(--space-sm)", alignItems: "center" }}>
          {actions}
        </div>
      ) : null}
    </header>
  );
}
