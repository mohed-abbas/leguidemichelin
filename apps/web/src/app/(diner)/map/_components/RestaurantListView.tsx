"use client";

/**
 * RestaurantListView — in-overlay list shown when the map/list toggle is
 * flipped to list. Reuses `<RestaurantInfoCard>` for each row.
 *
 * Intentionally headerless: the map/list toggle button + Chasseur switch
 * remain visible in `<MapOverlay>`'s floating control bar in *both* view
 * modes, so this surface only owns the scrollable list. It slots in above
 * the control bar and below the filter chips.
 *
 * Responsiveness:
 *  - `position: absolute` with `inset` so it tracks the overlay container.
 *  - Cards are width: 100% up to `--container-max` (768) so they stretch
 *    on tablets instead of being pinned to the mobile 358px bottom-sheet
 *    width.
 *
 * Data source: `pins` from `useMapStore` — the same set `<MapCanvas>` most
 * recently fetched. No independent fetch. When `chasseurMode` is on each
 * row's info card toggles its bottom-row score to visits/target.
 */

import { RestaurantInfoCard } from "./RestaurantInfoCard";
import { useMapStore } from "../../_stores/useMapStore";

export function RestaurantListView() {
  const pins = useMapStore((s) => s.pins);
  const chasseurMode = useMapStore((s) => s.chasseurMode);

  return (
    <div
      role="region"
      aria-label="Liste des restaurants"
      style={{
        position: "absolute",
        inset: 0,
        overflowY: "auto",
        WebkitOverflowScrolling: "touch",
        paddingTop: "calc(env(safe-area-inset-top, 0px) + 92px + 37px + var(--space-md))",
        paddingBottom:
          "calc(env(safe-area-inset-bottom, 0px) + 44px + var(--space-md) + var(--space-md))",
        paddingLeft: "var(--space-md)",
        paddingRight: "var(--space-md)",
        pointerEvents: "auto",
        background: "var(--color-surface-muted)",
      }}
    >
      {pins.length === 0 ? (
        <p
          style={{
            marginTop: "var(--space-xl)",
            textAlign: "center",
            color: "var(--color-ink-muted)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          Aucun restaurant dans cette zone. Déplacez la carte pour explorer.
        </p>
      ) : (
        <ul
          aria-label={`${pins.length} restaurant${pins.length > 1 ? "s" : ""}`}
          style={{
            listStyle: "none",
            margin: 0,
            padding: "var(--space-md) 0 0",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-md)",
            width: "100%",
            maxWidth: 768,
            marginInline: "auto",
          }}
        >
          {pins.map((r) => (
            // `data-testid="map-pin"` is the stable Playwright hook for the
            // /map surface pin entries (Phase 04.1 Plan 11 Sub-task 3.1).
            // The map's actual pins are WebGL features inside the Mapbox
            // canvas — not DOM — so the list-view row is the DOM-addressable
            // equivalent for e2e selection. Test IDs carry no behaviour.
            <li key={r.id} data-testid="map-pin">
              <RestaurantInfoCard restaurant={r} showScore={chasseurMode} closable={false} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
