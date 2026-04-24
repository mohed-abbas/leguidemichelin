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
 * Clicking the card body navigates to /restaurants/:slug so this surface is
 * the single entry-point into the detail page from the map.
 *
 * The card reads `selectedRestaurant` from useMapStore — the map click handler
 * writes the full object. A close "×" button clears selection.
 */

import Link from "next/link";
import { Bookmark, Check, ClipboardList, Heart, X } from "lucide-react";
import { EMBLEM_SRC, emblemFromRating, mockVisits, targetFromRating } from "./PinScoreBadge";
import type { RestaurantResponseType } from "@repo/shared-schemas";
import { useMapStore } from "../../_stores/useMapStore";

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
}

export function RestaurantInfoCard({ restaurant, showScore = false, closable = true }: Props) {
  const setSelected = useMapStore((s) => s.setSelectedRestaurant);
  const emblem = emblemFromRating(restaurant.michelinRating);
  const emblemSrc = EMBLEM_SRC[emblem];
  const multiplier = targetFromRating(restaurant.michelinRating);
  const priceBand = restaurant.michelinRating === "THREE" ? "€€€" : "€€";
  const target = multiplier;
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
          without tapping a new pin. Hidden in list-view (closable=false). */}
      {closable ? (
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
        href={`/restaurants/${restaurant.slug}`}
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
        style={{ position: "absolute", top: 18, left: 16, display: "block" }}
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
        }}
      >
        {restaurant.heroImageKey ? (
          <img
            src={`/api/images/${restaurant.heroImageKey}`}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : null}
        {/* "Coup de cœur des gourmands" caption pill — rendered for BIB
            restaurants per the Figma example (Pimpan was BIB in the mock). */}
        {restaurant.michelinRating === "BIB" ? (
          <div
            style={{
              position: "absolute",
              top: 4,
              left: 4,
              right: 4,
              background: "var(--color-surface)",
              borderRadius: 3,
              paddingBlock: 4,
              paddingInline: 6,
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              lineHeight: "10px",
              color: "var(--color-ink)",
              fontWeight: "var(--font-weight-regular)",
              textAlign: "center",
            }}
          >
            Coup de cœur des gourmands
          </div>
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
        {/* Score slot — toggles meaning with chasseur mode:
             ▪ chasseur OFF → "Nx" + emblem (points multiplier)
             ▪ chasseur ON  → "visits/target" + emblem (user progress) */}
        <div
          aria-label={
            showScore ? `${visits} visites sur ${target}` : `Multiplicateur ${multiplier}×`
          }
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
          <span>{showScore ? `${visits}/${target}` : `${multiplier}x`}</span>
          <img src={emblemSrc} alt="" width={14} height={16} style={{ display: "block" }} />
        </div>

        {/* Action icons (visual-only for now — wiring lands with Bookmarks /
            Favorites / Notes features). */}
        <div style={{ display: "inline-flex", gap: 18, color: "var(--color-ink)" }}>
          <button type="button" aria-label="Ajouter une note" style={actionBtnStyle}>
            <ClipboardList size={18} aria-hidden />
          </button>
          <button type="button" aria-label="Marquer comme visité" style={actionBtnStyle}>
            <Check size={18} aria-hidden />
          </button>
          <button type="button" aria-label="Ajouter aux signets" style={actionBtnStyle}>
            <Bookmark size={18} aria-hidden />
          </button>
          <button type="button" aria-label="Ajouter aux favoris" style={actionBtnStyle}>
            <Heart size={18} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

const actionBtnStyle: React.CSSProperties = {
  display: "inline-grid",
  placeItems: "center",
  width: 24,
  height: 24,
  border: "none",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
  padding: 0,
};
