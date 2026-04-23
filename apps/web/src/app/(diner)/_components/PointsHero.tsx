"use client";

/**
 * PointsHero — balance hero card for /points (REQ POINTS-02).
 *
 * Giant FR-locale-formatted number with the Michelin-gold accent token,
 * small label above ("Mes points"), sourced copy below ("Depuis votre
 * inscription"). Token-only styling (no raw hex) per ESLint hex-guard.
 *
 * Canonical refs:
 *   - 04-CONTEXT.md D-15 (hero layout + gold accent).
 *   - 04-06-PLAN.md §Implementation tasks #2.
 */

import { Card, CardContent } from "@/components/ui/card";

const numberFormatter = new Intl.NumberFormat("fr-FR");

export interface PointsHeroProps {
  balance: number;
}

export function PointsHero({ balance }: PointsHeroProps) {
  return (
    <Card
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <CardContent
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-xs)",
          paddingBlock: "var(--space-lg)",
        }}
      >
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-semibold)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-ink-muted)",
          }}
        >
          Mes points
        </span>
        <strong
          style={{
            color: "var(--color-accent-gold)",
            fontSize: "clamp(2.5rem, 8vw, 4rem)",
            fontWeight: "var(--font-weight-semibold)",
            lineHeight: 1,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {numberFormatter.format(balance)}
        </strong>
        <span
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-ink-muted)",
          }}
        >
          Depuis votre inscription
        </span>
      </CardContent>
    </Card>
  );
}
