/**
 * /points loading state — keeps the bottom-nav responsive while the
 * server component awaits the /api/me/points fetch. Because the page is
 * `cache: "no-store"`, Next cannot serve a static shell — without this
 * file the nav would appear to hang for the duration of the fetch.
 *
 * Mirrors the final layout structure: header → hero card skeleton → 5
 * ledger row skeletons. Not a pixel match — the skeleton's job is "show
 * progress", not "identical layout to the populated page".
 *
 * Canonical refs:
 *   - 04-06-PLAN.md §Implementation tasks #5.
 */

import { Skeleton } from "@/components/ui/skeleton";

const LEDGER_ROW_COUNT = 5;

export default function PointsLoading() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
        paddingBlock: "var(--space-md)",
      }}
    >
      <header>
        <h1
          style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-semibold)",
            color: "var(--color-ink)",
            margin: 0,
          }}
        >
          Mes points
        </h1>
        <p
          style={{
            color: "var(--color-ink-muted)",
            marginTop: "var(--space-xs)",
            marginBottom: 0,
            fontSize: "var(--font-size-base)",
          }}
        >
          Solde et historique de vos transactions.
        </p>
      </header>
      <Skeleton aria-hidden style={{ height: "160px", borderRadius: "var(--radius-lg)" }} />
      <div
        aria-hidden
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-sm)",
        }}
      >
        {Array.from({ length: LEDGER_ROW_COUNT }, (_, i) => (
          <Skeleton key={i} style={{ height: "48px", borderRadius: "var(--radius-md)" }} />
        ))}
      </div>
    </section>
  );
}
