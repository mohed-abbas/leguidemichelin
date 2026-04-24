"use client";

/**
 * MyContentList — "Mes contenus" section on /me that re-surfaces content routes
 * after the Favoris bottom-nav tab was rewired away from /collection.
 *
 * Phase 04.1 D-M1/M2/M3. Row style matches AccountList rowBaseStyle exactly.
 * Trailing chevron ">" via span (not a lucide icon — matches AccountList's iconless style).
 *
 * Pure presentational component. No imports from @repo/shared-schemas, no store,
 * no hook, no data fetch. Safe to ship in Wave 1 independently of any other plan.
 */

import Link from "next/link";
import type { CSSProperties } from "react";

const rowBaseStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  height: 54,
  paddingInline: 16,
  fontFamily: "var(--font-sans)",
  fontWeight: "var(--font-weight-regular)",
  fontSize: 17,
  lineHeight: "normal",
  color: "var(--color-ink)",
  textDecoration: "none",
  background: "transparent",
  border: "none",
  borderTop: "0.5px solid var(--color-border)",
  width: "100%",
  textAlign: "left",
  cursor: "pointer",
};

const chevronStyle: CSSProperties = {
  marginLeft: "auto",
  color: "var(--color-ink-muted)",
  fontSize: 17,
};

const ROWS: Array<{ label: string; href: string }> = [
  { label: "Mes souvenirs", href: "/collection" },
  { label: "Mes points", href: "/points" },
  { label: "Mes redemptions", href: "/me/redemptions" },
];

export function MyContentList() {
  return (
    <section style={{ marginBottom: "var(--space-lg)" }}>
      <h2
        style={{
          fontSize: "var(--font-size-h2)",
          fontWeight: "var(--font-weight-regular)",
          color: "var(--color-ink)",
          paddingInline: 16,
          paddingBlock: 12,
          margin: 0,
        }}
      >
        Mes contenus
      </h2>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {ROWS.map((row) => (
          <li key={row.href} style={{ display: "block" }}>
            <Link href={row.href} style={rowBaseStyle}>
              <span>{row.label}</span>
              <span aria-hidden style={chevronStyle}>
                {">"}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
