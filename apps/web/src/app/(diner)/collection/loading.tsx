/**
 * /collection loading state — keeps the bottom-nav responsive while the
 * server component awaits the /api/me/souvenirs fetch. Because the page
 * is `cache: "no-store"`, Next cannot serve a static shell — without this
 * file the nav would appear to hang for the duration of the fetch.
 *
 * Six square skeletons mirror the grid's default 2-col layout at ≥2 rows.
 * We don't try to match the responsive breakpoints of SouvenirGrid here —
 * the skeleton's job is "show progress", not "pixel-match the final grid".
 *
 * Canonical refs:
 *   - 04-05-PLAN.md §Implementation task 5.
 */

import { Skeleton } from "@/components/ui/skeleton";

const PLACEHOLDER_COUNT = 6;

export default function CollectionLoading() {
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
          Ma collection
        </h1>
        <p
          style={{
            color: "var(--color-ink-muted)",
            marginTop: "var(--space-xs)",
            marginBottom: 0,
            fontSize: "var(--font-size-base)",
          }}
        >
          Tous les souvenirs de vos visites étoilées.
        </p>
      </header>
      <div
        aria-hidden
        style={{
          display: "grid",
          gap: "var(--space-sm)",
          gridTemplateColumns: "repeat(2, 1fr)",
        }}
      >
        {Array.from({ length: PLACEHOLDER_COUNT }, (_, i) => (
          <Skeleton key={i} style={{ aspectRatio: "1 / 1", borderRadius: "var(--radius-md)" }} />
        ))}
      </div>
    </section>
  );
}
