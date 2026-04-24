"use client";

/**
 * useFavoriteToggle — shared optimistic-toggle hook for the three heart surfaces:
 *   1. /restaurants/[id] Favori action card
 *   2. /map info card heart button
 *   3. /favorites card heart
 *
 * Phase 04.1 D-C2. Centralizes:
 *   - Reading `favorited` from the Zustand store (reactive to external toggles)
 *   - Exposing `hydrated` so consumers can fall back to server-injected initial
 *     state until the client store hydrates (flicker-free first paint)
 *   - Dispatching the optimistic toggle (store handles flip + rollback)
 *   - 401 → router.push("/login?next=<pathname>") (consistent sign-in redirect)
 *   - Non-401 error → sonner error toast with fixed French copy
 *   - `isPending` flag for UI opacity/pointer-events during the in-flight call
 *
 * Return shape is { favorited, toggle, isPending, hydrated }. Consumers should destructure
 * whichever subset they need from this one hook call — NEVER add a second
 * useFavoritesStore subscription for `hydrated` in the same component.
 */

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { useFavoritesStore } from "../_stores/useFavoritesStore";

export interface UseFavoriteToggleReturn {
  favorited: boolean;
  toggle: () => Promise<void>;
  isPending: boolean;
  hydrated: boolean;
}

export function useFavoriteToggle(restaurantId: string): UseFavoriteToggleReturn {
  const router = useRouter();
  const pathname = usePathname();
  const favorited = useFavoritesStore((s) =>
    s.favoritesSet.has(restaurantId),
  );
  const hydrated = useFavoritesStore((s) => s.hydrated);
  const storeToggle = useFavoritesStore((s) => s.toggle);
  const [isPending, setIsPending] = useState(false);

  async function toggle() {
    if (isPending) return;
    setIsPending(true);
    try {
      await storeToggle(restaurantId);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        const next = encodeURIComponent(pathname ?? "/");
        router.push(`/login?next=${next}`);
        return;
      }
      toast.error("Impossible de mettre à jour vos favoris. Réessayez.");
    } finally {
      setIsPending(false);
    }
  }

  return { favorited, toggle, isPending, hydrated };
}
