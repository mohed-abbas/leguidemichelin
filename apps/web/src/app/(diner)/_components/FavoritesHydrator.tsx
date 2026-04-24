"use client";

/**
 * FavoritesHydrator — no-render client island.
 *
 * Phase 04.1 D-C3. Mounted once in app/(diner)/layout.tsx for logged-in DINERs.
 * On mount, triggers useFavoritesStore.hydrate() if the store is unhydrated or dirty.
 *
 * Logged-out users: the layout does not mount this component; the store stays empty.
 * Detail-page isFavorited then comes from the server response (always false for
 * logged-out, per Plan 04 role gate).
 */

import { useEffect } from "react";
import { useFavoritesStore } from "../_stores/useFavoritesStore";

interface FavoritesHydratorProps {
  /** True when the RSC layout detected a DINER session. */
  hasSession: boolean;
}

export function FavoritesHydrator({ hasSession }: FavoritesHydratorProps) {
  useEffect(() => {
    if (!hasSession) return;
    const { hydrated, dirty, hydrate } = useFavoritesStore.getState();
    if (!hydrated || dirty) {
      void hydrate().catch(() => {
        // Hydration failures are non-fatal — UI falls back to empty set +
        // server-injected isFavorited on detail pages. Re-hydrate on next nav.
        useFavoritesStore.getState().markDirty();
      });
    }
  }, [hasSession]);

  return null;
}
