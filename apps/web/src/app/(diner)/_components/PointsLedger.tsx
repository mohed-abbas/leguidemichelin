"use client";

/**
 * PointsLedger — chronological transaction list for /points (REQ POINTS-03, SOUV-07).
 *
 * Rows walk top-down (newest first). `runningAfter` is computed client-side
 * by subtracting each entry's delta from the current balance — yields the
 * balance immediately AFTER that transaction was applied, which is the copy
 * UX expects.
 *
 * Row link rules (CONTEXT.md D-15, plan §Implementation tasks #3):
 *   - source === "SOUVENIR_MINT" && souvenirId → /souvenirs/<id>
 *   - source === "REDEMPTION"                  → /me/redemptions
 *   - defensive fallback                       → plain <div> (no link)
 *
 * Empty state branches to /scan with a primary CTA per D-14 sibling pattern.
 *
 * Canonical refs:
 *   - 04-CONTEXT.md D-15 (ledger row shape), D-16 (denormalized labels).
 *   - 04-06-PLAN.md §Implementation tasks #3.
 *   - BACKEND-CONTRACT.md §Diner — Points.
 *   - packages/shared-schemas/src/points.ts (MePointsResponseType shape).
 */

import Link from "next/link";
import type { PointTransactionResponseType } from "@repo/shared-schemas";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const numberFormatter = new Intl.NumberFormat("fr-FR");
const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export interface PointsLedgerProps {
  balance: number;
  entries: PointTransactionResponseType[];
}

type LedgerRow = PointTransactionResponseType & { runningAfter: number };

function withRunningBalance(balance: number, entries: PointTransactionResponseType[]): LedgerRow[] {
  // Entries arrive newest-first. Top row's runningAfter is the CURRENT balance;
  // walk down subtracting delta to reconstruct post-transaction balances.
  let running = balance;
  const rows: LedgerRow[] = [];
  for (const entry of entries) {
    rows.push({ ...entry, runningAfter: running });
    running = running - entry.delta;
  }
  return rows;
}

function hrefFor(entry: PointTransactionResponseType): string | null {
  if (entry.source === "SOUVENIR_MINT" && entry.souvenirId) {
    return `/souvenirs/${entry.souvenirId}`;
  }
  if (entry.source === "REDEMPTION") {
    return "/chasseur";
  }
  return null;
}

export function PointsLedger({ balance, entries }: PointsLedgerProps) {
  if (entries.length === 0) {
    return (
      <section
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--space-md)",
          paddingBlock: "var(--space-xl)",
          textAlign: "center",
          color: "var(--color-ink-muted)",
        }}
      >
        <p style={{ margin: 0, maxWidth: "28ch" }}>
          Votre historique est vide. Créez votre premier souvenir pour gagner des points.
        </p>
        <Button nativeButton={false} render={<Link href="/scan">Scanner</Link>} />
      </section>
    );
  }

  const rows = withRunningBalance(balance, entries);

  return (
    <section
      aria-label="Historique des transactions"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}
    >
      <h2
        style={{
          fontSize: "var(--font-size-lg)",
          fontWeight: "var(--font-weight-semibold)",
          color: "var(--color-ink)",
          margin: 0,
          marginBottom: "var(--space-md)",
        }}
      >
        Historique
      </h2>
      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {rows.map((row, index) => (
          <li key={row.id}>
            {index > 0 ? <Separator /> : null}
            <LedgerRow row={row} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function LedgerRow({ row }: { row: LedgerRow }) {
  const href = hrefFor(row);
  const dateLabel = formatDate(row.createdAt);
  const deltaLabel = formatDelta(row.delta);
  const deltaColor = row.delta >= 0 ? "var(--color-accent-gold)" : "var(--color-destructive)";
  const runningLabel = numberFormatter.format(row.runningAfter);

  const body = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "max-content 1fr max-content max-content",
        columnGap: "var(--space-md)",
        alignItems: "baseline",
        paddingBlock: "var(--space-md)",
        color: "var(--color-ink)",
      }}
    >
      <span
        style={{
          fontSize: "var(--font-size-sm)",
          color: "var(--color-ink-muted)",
          whiteSpace: "nowrap",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {dateLabel}
      </span>
      <span
        style={{
          fontSize: "var(--font-size-base)",
          fontWeight: "var(--font-weight-regular)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {row.label}
      </span>
      <span
        style={{
          color: deltaColor,
          fontWeight: "var(--font-weight-semibold)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {deltaLabel}
      </span>
      <span
        style={{
          color: "var(--color-ink-muted)",
          fontSize: "var(--font-size-sm)",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {runningLabel}
      </span>
    </div>
  );

  if (!href) return body;
  return (
    <Link
      href={href}
      style={{
        display: "block",
        color: "inherit",
        textDecoration: "none",
      }}
    >
      {body}
    </Link>
  );
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return dateFormatter.format(date);
}

function formatDelta(delta: number): string {
  if (delta > 0) return `+${numberFormatter.format(delta)}`;
  // Intl already emits a leading hyphen-minus for negatives.
  return numberFormatter.format(delta);
}
