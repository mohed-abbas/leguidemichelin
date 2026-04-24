"use client";

/**
 * useFavoritesStore — Zustand cache of the current diner's favorited restaurant IDs.
 *
 * Phase 04.1 D-C1. Mirrors useMapStore's visitedSet slice shape.
 *
 * Lifecycle:
 *   1. Diner layout mounts <FavoritesHydrator /> on session present → calls hydrate()
 *   2. /favorites RSC passes its server-authoritative list to seedFromList() on mount,
 *      avoiding first-paint flicker for hearts rendered via useFavoriteToggle
 *   3. UI components read `favoritesSet.has(restaurantId)` reactively
 *   4. Toggles go through toggle(id): optimistic flip + API call + rollback on throw
 *   5. Logout → reset() clears the set so another user signing in on the same
 *      browser doesn't inherit state (security_threat_model: "Logout sanitization")
 *
 * Discipline: always construct `new Set(prev)` before mutating. In-place .add()/.delete()
 * on the existing Set does NOT trigger Zustand subscribers.
 */

import { create } from "zustand";
import type {
  MeFavoritesResponseType,
  ToggleFavoriteResponseType,
} from "@repo/shared-schemas";
import { api } from "@/lib/api";

interface FavoritesState {
  favoritesSet: Set<string>;
  hydrated: boolean;
  dirty: boolean;
  hydrate: () => Promise<void>;
  seedFromList: (ids: string[]) => void;
  toggle: (restaurantId: string) => Promise<ToggleFavoriteResponseType>;
  markDirty: () => void;
  reset: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favoritesSet: new Set<string>(),
  hydrated: false,
  dirty: true,

  hydrate: async () => {
    const r = await api.get<MeFavoritesResponseType>("/me/favorites");
    set({
      favoritesSet: new Set(r.items.map((i) => i.restaurantId)),
      hydrated: true,
      dirty: false,
    });
  },

  /**
   * Synchronous seed from a server-authoritative list (e.g. /favorites RSC).
   * Flips `hydrated` true without an HTTP call so that components consuming
   * `useFavoriteToggle` (which reads favoritesSet.has(...) reactively) render
   * filled hearts on first paint instead of flickering unfavorited → favorited
   * once the async hydrate() resolves.
   *
   * Safe to call multiple times; it simply replaces the set with the provided ids.
   */
  seedFromList: (ids: string[]) => {
    set({
      favoritesSet: new Set(ids),
      hydrated: true,
      dirty: false,
    });
  },

  /**
   * Optimistic toggle:
   *   1. Snapshot current set
   *   2. Flip locally (new Set)
   *   3. POST /me/favorites/:id
   *   4. On throw → restore snapshot, re-throw (hook surfaces error)
   * The server response is returned to the caller (never trusted over local state —
   * the server is authoritative, but we've already applied the expected flip locally).
   */
  toggle: async (restaurantId: string) => {
    const prev = get().favoritesSet;
    const next = new Set(prev);
    const wasPresent = next.has(restaurantId);
    if (wasPresent) next.delete(restaurantId);
    else next.add(restaurantId);
    set({ favoritesSet: next });

    try {
      const result = await api.post<ToggleFavoriteResponseType>(
        `/me/favorites/${encodeURIComponent(restaurantId)}`,
      );
      // Reconcile with server truth (in case of concurrent writes from another tab/device).
      // Only re-align if server disagrees with our optimistic state.
      const serverSaysFavorited = result.favorited;
      const localSaysFavorited = next.has(restaurantId);
      if (serverSaysFavorited !== localSaysFavorited) {
        const reconciled = new Set(next);
        if (serverSaysFavorited) reconciled.add(restaurantId);
        else reconciled.delete(restaurantId);
        set({ favoritesSet: reconciled });
      }
      return result;
    } catch (err) {
      // Rollback to pre-toggle snapshot. Reconstruct a new Set so subscribers fire.
      set({ favoritesSet: new Set(prev) });
      throw err;
    }
  },

  markDirty: () => set({ dirty: true }),

  /**
   * Logout sanitization — clear cache + mark dirty so next session re-hydrates.
   * Called from the logout flow (AccountList handleSignOut — wired in Plan 07).
   */
  reset: () =>
    set({
      favoritesSet: new Set<string>(),
      hydrated: false,
      dirty: true,
    }),
}));
