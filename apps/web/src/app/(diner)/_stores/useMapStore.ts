"use client";

/**
 * useMapStore — single Zustand store for the diner map surfaces.
 *
 * Holds:
 *  - `visitedSet<restaurantId>` — hydrated from GET /api/me/souvenirs on `/map`
 *    (and `<MapPreview />`) mount, flipped dirty after a successful mint (04-03).
 *    RESERVED for the visited-vs-unvisited pin badge layer (D-21) — MapCanvas
 *    currently renders type-only pins (bib/starred/recommended); the visited
 *    overlay is tracked for re-enablement (see review PR-6 H-1). Keeping the
 *    slice hot in the store means the badge layer can be stacked without
 *    re-plumbing the hydrate + dirty-flag dance.
 *  - `visitedDirty` flag — consumers dedupe `refreshVisited()` by checking this
 *    before calling. Flipped true by `markVisitedDirty()` (post-mint) and reset
 *    to false after a successful refetch.
 *  - `bboxCache` — cache of `GET /api/restaurants?bbox=...` results keyed by a
 *    quantized bbox hash so rapid moveend pans don't spam the API (D-20). LRU
 *    eviction at `MAX_BBOX_ENTRIES` (by insertion order, oldest first).
 *
 * SSR safety: the module is imported only by `"use client"` consumers — no
 * persisted state, no localStorage, no SSR serialization, no Provider needed.
 *
 * Canonical refs:
 *  - 04-CONTEXT.md D-20 (bbox cache), D-21 (visited dirty flag).
 *  - 04-PATTERNS.md §State management (first Zustand use in the project).
 *  - 04-09-PLAN.md.
 */

import { create } from "zustand";
import type { MeSouvenirsResponseType, RestaurantResponseType } from "@repo/shared-schemas";
import { api } from "@/lib/api";

/**
 * Quantize a Mapbox bbox tuple `[west, south, east, north]` to ~111m precision
 * (3 decimals ≈ 0.001°). Rapid micro-pans collapse onto the same cache key so
 * the bbox cache actually hits. Callers MUST use this helper to build keys —
 * passing a raw stringified bbox bypasses the quantization and defeats the
 * cache.
 */
export function quantizeBbox(bbox: [number, number, number, number]): string {
  return bbox.map((n) => n.toFixed(3)).join(",");
}

interface MapState {
  /** Chasseur d'Étoiles mode — when true, pins show their score multiplier badge. */
  chasseurMode: boolean;
  /** Toggle chasseur mode. */
  setChasseurMode: (v: boolean) => void;

  /**
   * Restaurant selected from the map — drives the bottom info card in
   * `<MapOverlay>` and the selected-pin highlight in `<MapCanvas>`. `null`
   * means no selection (card hidden). Full object stored so the overlay can
   * render without re-fetching or needing access to the MapCanvas pins list.
   */
  selectedRestaurant: RestaurantResponseType | null;
  setSelectedRestaurant: (r: RestaurantResponseType | null) => void;

  /**
   * Currently-visible restaurants (result of the most recent bbox fetch).
   * Lifted out of `<MapCanvas>` local state so `<RestaurantListView>` can
   * render the same set without a second fetch or prop drill.
   */
  pins: RestaurantResponseType[];
  setPins: (pins: RestaurantResponseType[]) => void;

  /**
   * Whether the bottom list view is open. Toggled by the list button in
   * `<MapOverlay>`; the view overlays the map and reuses
   * `<RestaurantInfoCard>` for each row.
   */
  listViewOpen: boolean;
  setListViewOpen: (v: boolean) => void;

  /** Restaurant IDs the user has minted at least one souvenir for. */
  visitedSet: Set<string>;
  /**
   * True when the visitedSet needs a refetch. Defaults to true so the first
   * consumer mount hydrates. Mint success handler in 04-03 calls
   * `markVisitedDirty()` to flip it back.
   */
  visitedDirty: boolean;
  /** Quantized-bbox → restaurants list (see `quantizeBbox`). */
  bboxCache: Map<string, RestaurantResponseType[]>;

  /**
   * Fetch GET /api/me/souvenirs once and replace visitedSet. Callers dedupe
   * by checking `visitedDirty` before calling — this action does not guard
   * internally. Resets `visitedDirty` to false on success.
   */
  refreshVisited: () => Promise<void>;

  /**
   * MintForm calls this after a successful POST /api/souvenirs 201 so the
   * next `/map` or `<MapPreview />` mount refetches the visited set. Safe to
   * call imperatively from a non-component context via
   * `useMapStore.getState().markVisitedDirty()`.
   */
  markVisitedDirty: () => void;

  /**
   * Read a cached bbox slice by pre-quantized key. Returns `undefined` if
   * absent — callers should fire the network request and `putBbox` the
   * result.
   */
  getBbox: (key: string) => RestaurantResponseType[] | undefined;

  /**
   * Write a bbox slice by pre-quantized key. Enforces LRU cap of
   * `MAX_BBOX_ENTRIES`; evicts the oldest-inserted key when full. Always
   * constructs a new Map so React subscribers re-render (Zustand bails out of
   * in-place mutations).
   */
  putBbox: (key: string, items: RestaurantResponseType[]) => void;
}

/** Cap bbox cache so long map sessions don't unbound-grow memory. */
const MAX_BBOX_ENTRIES = 20;

export const useMapStore = create<MapState>((set, get) => ({
  chasseurMode: false,
  setChasseurMode: (v) => set({ chasseurMode: v }),

  selectedRestaurant: null,
  setSelectedRestaurant: (r) => set({ selectedRestaurant: r }),

  pins: [],
  setPins: (pins) => set({ pins }),

  listViewOpen: false,
  setListViewOpen: (v) => set({ listViewOpen: v }),

  visitedSet: new Set<string>(),
  visitedDirty: true,
  bboxCache: new Map<string, RestaurantResponseType[]>(),

  refreshVisited: async () => {
    const r = await api.get<MeSouvenirsResponseType>("/me/souvenirs");
    set({
      visitedSet: new Set(r.visitedRestaurantIds),
      visitedDirty: false,
    });
  },

  markVisitedDirty: () => set({ visitedDirty: true }),

  getBbox: (key) => get().bboxCache.get(key),

  putBbox: (key, items) => {
    const next = new Map(get().bboxCache);
    next.set(key, items);
    if (next.size > MAX_BBOX_ENTRIES) {
      const oldestKey = next.keys().next().value;
      if (oldestKey !== undefined) next.delete(oldestKey);
    }
    set({ bboxCache: next });
  },
}));
