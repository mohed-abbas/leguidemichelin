"use client";

/**
 * RestaurantInfoCard — the bottom sheet shown on /map when a restaurant pin
 * is selected (Figma node 24:768 inside frame 24:612).
 *
 * Layout (358×168 card, 16px padding):
 *  ┌──────────────────────────────────────────────────────┐
 *  │  [emblem]   Name (24px)              ┌──────────┐    │
 *  │             City (13px gray)         │  photo   │    │
 *  │             Price • Cuisine (13px)   │  93×93   │    │
 *  │  ─────────────────────────────────── └──────────┘    │
 *  │  [2x flower]                    [notes][✓][bkm][♥]  │
 *  └──────────────────────────────────────────────────────┘
 *
 * Clicking the card body navigates to /restaurants/:id so this surface is
 * the single entry-point into the detail page from the map.
 *
 * The card reads `selectedRestaurant` from useMapStore — the map click handler
 * writes the full object. A close "×" button clears selection.
 */

import Link from "next/link";
import Image from "next/image";
import { X } from "lucide-react";
import { EMBLEM_SRC, emblemFromRating, mockVisits, targetFromRating } from "./PinScoreBadge";
import type { RestaurantResponseType } from "@repo/shared-schemas";
import { useMapStore } from "../../_stores/useMapStore";
import { useFavoriteToggle } from "../../_hooks/useFavoriteToggle";

interface Props {
  restaurant: RestaurantResponseType;
  /**
   * When true, render the `<PinScoreBadge>` (visits / target) in the top-left
   * of the card. Driven by `chasseurMode` at the call-site — only visible in
   * Chasseur d'Étoiles mode, hidden otherwise.
   */
  showScore?: boolean;
  /**
   * When true, render the close "×" button. Used on the map surface where
   * the card is a single selection; hidden in the list view where the card
   * is part of a scrollable list (the list has its own back button).
   */
  closable?: boolean;
  /**
   * Informational / SSR-seed flag for the favorited state. The store
   * (useFavoriteToggle -> useFavoritesStore) remains the source of truth at
   * runtime; this prop exists so that server-rendered surfaces can pass an
   * initial hint without forcing a store subscription pre-hydration.
   */
  isFavorited?: boolean;
  /**
   * Surface variant (D-F2):
   *  - "map"        (default) — full map info card with close button, Notes /
   *    Visited / Bookmark action buttons and the PinScoreBadge slot.
   *  - "favorites"  — reused on `/favorites` (Plan 09). Only the heart button
   *    remains; close button + Notes / Visited / Bookmark are hidden; writes
   *    to `useMapStore` are skipped.
   */
  variant?: "map" | "favorites";
}

export function RestaurantInfoCard({
  restaurant,
  showScore = false,
  closable = true,
  isFavorited,
  variant = "map",
}: Props) {
  // Hooks rules: call useMapStore unconditionally. Ignore the returned setter
  // when variant === "favorites" (favorites surface must not write map state —
  // D-F2).
  const setSelected = useMapStore((s) => s.setSelectedRestaurant);
  // Single subscription for favorite state via the shared hook. `hydrated`
  // gates the flicker-free fallback for SSR surfaces that pass `isFavorited`
  // (e.g. /restaurants/[id] — SPEC Req 7). Never add a second
  // useFavoritesStore subscription here — funnel everything through
  // useFavoriteToggle.
  const { favorited, toggle, isPending, hydrated } = useFavoriteToggle(restaurant.id);
  // Until the client store hydrates, fall back to the server-seeded
  // `isFavorited` (if provided). Prevents the false→true flicker on the
  // detail page when a diner refreshes a restaurant they've favorited.
  const displayFavorited = hydrated ? favorited : (isFavorited ?? favorited);
  const emblem = emblemFromRating(restaurant.michelinRating);
  const emblemSrc = EMBLEM_SRC[emblem];
  const priceBand = restaurant.michelinRating === "THREE" ? "€€€" : "€€";
  const target = targetFromRating(restaurant.michelinRating);
  const visits = showScore ? mockVisits(restaurant.id, target) : 0;

  return (
    <div
      role="group"
      aria-label={`Informations sur ${restaurant.name}`}
      style={{
        position: "relative",
        width: "100%",
        height: 168,
        // Guard the fixed height against flex-shrink when the card is a row
        // in `<RestaurantListView>`'s scrollable column — without this the
        // 168px collapses to the action-row's content height and every
        // absolutely-positioned child spills into the next card.
        flexShrink: 0,
        background: "var(--color-surface)",
        borderRadius: 11,
        boxShadow: "0 0 9px 0 rgb(0 0 0 / 0.07)",
        pointerEvents: "auto",
      }}
    >
      {/* Close button — the sole exit when the user wants the card gone
          without tapping a new pin. Hidden in list-view (closable=false) and
          on the /favorites variant (D-F2 — favorites surface must not write
          map state). */}
      {closable && variant !== "favorites" ? (
        <button
          type="button"
          aria-label="Fermer"
          onClick={() => setSelected(null)}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 28,
            height: 28,
            display: "grid",
            placeItems: "center",
            border: "none",
            background: "transparent",
            color: "var(--color-ink-muted)",
            cursor: "pointer",
            zIndex: 2,
          }}
        >
          <X size={18} aria-hidden />
        </button>
      ) : null}

      {/* Tap-through target: the text block + photo link to the detail page.
          Excludes the action-row (owned by its own interactive children). */}
      <Link
        href={`/restaurants/${restaurant.id}`}
        aria-label={`Voir ${restaurant.name}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 42, // above divider + action row
          display: "block",
          textDecoration: "none",
          color: "inherit",
        }}
      />

      {/* ── Top-left emblem ───────────────────────────────────────────── */}
      <img
        src={emblemSrc}
        alt=""
        width={18}
        height={21}
        style={{ position: "absolute", top: 18, left: 16, display: "block", pointerEvents: "none" }}
      />

      {/* ── Text block ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: 16,
          top: 42,
          right: 132, // leaves room for 93px photo at right + gap
          display: "flex",
          flexDirection: "column",
          gap: 2,
          pointerEvents: "none",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontSize: 24,
            fontWeight: "var(--font-weight-regular)",
            color: "var(--color-ink)",
            lineHeight: "28px",
            letterSpacing: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {restaurant.name}
        </h2>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: "var(--font-weight-regular)",
            color: "var(--color-ink-muted)",
            lineHeight: "17px",
          }}
        >
          {restaurant.city}
        </p>
        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: "var(--font-weight-regular)",
            color: "var(--color-ink-muted)",
            lineHeight: "17px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {priceBand}
          {restaurant.cuisine ? ` • ${restaurant.cuisine}` : ""}
        </p>
      </div>

      {/* ── Right photo (93×93) ────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: 17,
          right: 16,
          width: 93,
          height: 93,
          borderRadius: 7,
          overflow: "hidden",
          background: "var(--color-surface-muted)",
          pointerEvents: "none",
        }}
      >
        {restaurant.heroImageKey ? (
          <img
            src={`/api/images/${restaurant.heroImageKey}`}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : null}
      </div>

      {/* ── Divider ────────────────────────────────────────────────────── */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 41,
          height: 1,
          background: "var(--color-border)",
        }}
      />

      {/* ── Bottom action row ──────────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 0,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Score slot — only shown when chasseur mode is active (D-M2-a /
            Figma node 64:571). Rendered empty otherwise — no "Nx" fallback
            per Figma node 65:611 (chasseur OFF leaves the left slot blank). */}
        {showScore ? (
          <div
            aria-label={`${visits} visites sur ${target}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: "var(--font-weight-bold)",
              color: "var(--color-ink)",
            }}
          >
            <span>{`${visits}/${target}`}</span>
            <Image
              src="/images/chasseur/icon-star-mini-red.svg"
              alt=""
              width={18}
              height={21}
              style={{ display: "block" }}
            />
          </div>
        ) : null}

        {/* Action icons — chasseur-SVG set (see CollectionCard). Notes /
            Visited / Bookmark are visual-only per SPEC Req 8. Heart is fully
            interactive through useFavoriteToggle. On the /favorites variant
            only the heart shows (D-F2). `marginLeft: auto` pins them right
            regardless of whether the score slot is rendered. */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 16,
            marginLeft: "auto",
          }}
        >
          {variant !== "favorites" && (
            <>
              <Image
                src="/images/chasseur/icon-card-notebook.svg"
                alt="Notes"
                width={17}
                height={21}
                style={{ display: "block", objectFit: "contain" }}
              />
              <Image
                src="/images/chasseur/icon-card-check.svg"
                alt="Visité"
                width={21}
                height={21}
                style={{ display: "block", objectFit: "contain" }}
              />
              <Image
                src="/images/chasseur/icon-card-bookmark.svg"
                alt="Sauvegarder"
                width={18}
                height={21}
                style={{ display: "block", objectFit: "contain" }}
              />
            </>
          )}
          <button
            type="button"
            onClick={toggle}
            aria-label={displayFavorited ? "Retirer des favoris" : "Ajouter aux favoris"}
            aria-pressed={displayFavorited}
            aria-busy={isPending || undefined}
            style={{
              display: "inline-grid",
              placeItems: "center",
              width: 24,
              height: 21,
              border: "none",
              background: "transparent",
              padding: 0,
              cursor: "pointer",
              opacity: isPending ? 0.6 : 1,
              pointerEvents: isPending ? "none" : "auto",
            }}
          >
            <span
              aria-hidden
              style={{
                display: "block",
                width: 24,
                height: 21,
                WebkitMaskImage: "url(/images/chasseur/icon-card-heart.svg)",
                maskImage: "url(/images/chasseur/icon-card-heart.svg)",
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskSize: "contain",
                maskSize: "contain",
                WebkitMaskPosition: "center",
                maskPosition: "center",
                background: displayFavorited ? "var(--color-primary)" : "var(--color-ink)",
              }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
