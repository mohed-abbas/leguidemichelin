"use client";

/**
 * FavoritesList — client island for /favorites (Phase 04.1 Plan 09, Req 9).
 *
 * Renders one of three states:
 *  1. loggedOut === true          → <LoggedOutEmpty /> with /login?next=/favorites CTA
 *  2. items.length === 0          → <LoggedInEmpty /> with "Parcourir les restaurants" CTA
 *  3. otherwise                   → vertical <ul> of <RestaurantInfoCard variant="favorites" />
 *
 * Unfavorite flow (single coherent path — D-C2):
 *  - The heart button lives INSIDE RestaurantInfoCard (via useFavoriteToggle → useFavoritesStore).
 *  - This component NEVER issues HTTP mutations directly; it subscribes to useFavoritesStore
 *    and reacts when a restaurantId that was in the SSR-seeded initial list leaves favoritesSet.
 *  - On that transition it removes the card optimistically, fires the sonner undo toast;
 *    the Annuler closure re-toggles via useFavoritesStore.getState().toggle(id).
 *
 * First-paint flicker fix:
 *  - On mount we call useFavoritesStore.getState().seedFromList(initial.map(i => i.restaurantId)).
 *    This flips `hydrated` true synchronously so RestaurantInfoCard's heart (reactively
 *    reading favoritesSet.has(id)) renders filled on first paint instead of flickering
 *    unfavorited → favorited once the async hydrate() resolves.
 */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { FavoriteRestaurantCardType, RestaurantResponseType } from "@repo/shared-schemas";
import { RestaurantInfoCard } from "../../map/_components/RestaurantInfoCard";
import { useFavoritesStore } from "../../_stores/useFavoritesStore";

interface FavoritesListProps {
  initial: FavoriteRestaurantCardType[];
  loggedOut: boolean;
}

export function FavoritesList({ initial, loggedOut }: FavoritesListProps) {
  const [items, setItems] = useState(initial);

  // seed store from SSR so RestaurantInfoCard hearts render filled on first paint
  useEffect(() => {
    if (loggedOut) return;
    useFavoritesStore.getState().seedFromList(initial.map((i) => i.restaurantId));
    // mount-only — do not re-seed if parent rerenders with a different list
    // (store toggles already handle incremental updates)
  }, []);

  // Track which restaurantIds started in the list so we only react to removals
  // that originated from user actions on THIS list (heart clicks inside cards).
  const initialIdsRef = useRef<Set<string>>(new Set(initial.map((i) => i.restaurantId)));

  useEffect(() => {
    if (loggedOut) return;
    const unsub = useFavoritesStore.subscribe((state, prevState) => {
      for (const id of prevState.favoritesSet) {
        if (!state.favoritesSet.has(id) && initialIdsRef.current.has(id)) {
          // The user just unfavorited a restaurant that was in our initial list.
          // Capture the full card for the undo closure, remove optimistically,
          // and fire the undo toast. Remove the id from initialIdsRef so a
          // subsequent Annuler → re-toggle cycle doesn't fire a second toast.
          const removed = items.find((x) => x.restaurantId === id);
          if (!removed) continue;
          const snapshot = items;
          setItems((prev) => prev.filter((x) => x.restaurantId !== id));
          initialIdsRef.current.delete(id);

          toast("Retiré des favoris.", {
            duration: 5000,
            action: {
              label: "Annuler",
              onClick: async () => {
                try {
                  // Route the undo through the store toggle — consistent with
                  // D-C2 (all surfaces mutate through useFavoritesStore.toggle).
                  // This re-POSTs /me/favorites/:id and re-adds the id to the
                  // store's favoritesSet.
                  await useFavoritesStore.getState().toggle(id);
                  setItems(snapshot);
                  initialIdsRef.current.add(id);
                } catch {
                  toast.error("Impossible de mettre à jour vos favoris. Réessayez.");
                }
              },
            },
          });
        }
      }
    });
    return unsub;
  }, [items, loggedOut]);

  if (loggedOut) return <LoggedOutEmpty />;
  if (items.length === 0) return <LoggedInEmpty />;

  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
      }}
    >
      {items.map((item) => {
        // Synthesize a RestaurantResponseType for the reused card. Unused fields
        // (address/slug/lat/lng) are placeholders — /favorites variant doesn't render them.
        const restaurant: RestaurantResponseType = {
          id: item.restaurantId,
          slug: "",
          michelinSlug: "",
          name: item.restaurantName,
          city: item.restaurantCity,
          address: "",
          lat: 0,
          lng: 0,
          michelinRating: item.michelinRating,
          cuisine: item.cuisine,
          description: null,
          heroImageKey: item.heroImageKey,
          createdAt: item.favoritedAt,
          updatedAt: item.favoritedAt,
          isFavorited: true,
        };
        return (
          <li key={item.id}>
            <RestaurantInfoCard
              restaurant={restaurant}
              variant="favorites"
              closable={false}
              showScore={false}
              isFavorited={true}
            />
          </li>
        );
      })}
    </ul>
  );
}

function LoggedInEmpty() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-md)",
        paddingBlock: "var(--space-2xl)",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "block",
          width: 48,
          height: 42,
          WebkitMaskImage: "url(/images/chasseur/icon-card-heart.svg)",
          maskImage: "url(/images/chasseur/icon-card-heart.svg)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          background: "var(--color-ink-muted)",
        }}
      />
      <h2
        style={{
          fontSize: "var(--font-size-lg)",
          fontWeight: "var(--font-weight-semibold)",
          color: "var(--color-ink)",
          margin: 0,
          textAlign: "center",
        }}
      >
        Aucun favori pour l&apos;instant.
      </h2>
      <p
        style={{
          fontSize: 17,
          fontWeight: "var(--font-weight-regular)",
          color: "var(--color-ink-muted)",
          textAlign: "center",
          maxWidth: 280,
          margin: 0,
        }}
      >
        Parcourez les restaurants Michelin et tapez sur le cœur.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: "var(--touch-target-min)",
          maxWidth: 280,
          width: "100%",
          background: "var(--color-primary)",
          color: "var(--color-primary-fg)",
          borderRadius: "var(--radius-full)",
          fontSize: 17,
          fontWeight: "var(--font-weight-semibold)",
          textDecoration: "none",
          paddingInline: "var(--space-lg)",
        }}
      >
        Parcourir les restaurants
      </Link>
    </div>
  );
}

function LoggedOutEmpty() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-md)",
        paddingBlock: "var(--space-2xl)",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "block",
          width: 48,
          height: 42,
          WebkitMaskImage: "url(/images/chasseur/icon-card-heart.svg)",
          maskImage: "url(/images/chasseur/icon-card-heart.svg)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskPosition: "center",
          maskPosition: "center",
          background: "var(--color-ink-muted)",
        }}
      />
      <h2
        style={{
          fontSize: "var(--font-size-lg)",
          fontWeight: "var(--font-weight-semibold)",
          color: "var(--color-ink)",
          margin: 0,
          textAlign: "center",
        }}
      >
        Connectez-vous pour voir vos favoris.
      </h2>
      <Link
        href="/login?next=/favorites"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: "var(--touch-target-min)",
          maxWidth: 280,
          width: "100%",
          background: "var(--color-primary)",
          color: "var(--color-primary-fg)",
          borderRadius: "var(--radius-full)",
          fontSize: 17,
          fontWeight: "var(--font-weight-semibold)",
          textDecoration: "none",
          paddingInline: "var(--space-lg)",
        }}
      >
        Se connecter
      </Link>
    </div>
  );
}
