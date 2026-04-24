"use client";

/**
 * MapOverlay — floating UI (header, filter chips, Chasseur d'Étoiles bar)
 * rendered ABOVE the MapCanvas on /map.
 *
 * Container uses pointer-events:none so the Mapbox canvas below stays
 * pan/zoomable everywhere the overlay is transparent. Interactive children
 * opt back in with pointer-events:auto.
 *
 * Filters + Chasseur toggle are visual-only for this iteration — wiring
 * lands when the next Figma selection for "Mode chasseur d'étoile" arrives.
 */

import Link from "next/link";
import { Map as MapIcon } from "lucide-react";
import { ChasseurSwitch } from "./ChasseurSwitch";
import { RestaurantInfoCard } from "./RestaurantInfoCard";
import { RestaurantListView } from "./RestaurantListView";
import { useMapStore } from "../../_stores/useMapStore";

type FilterKey = "tous" | "nouveau" | "distinctions" | "ideal";

const FILTERS: { key: FilterKey; label: string; icon?: "sparkle" | "thumbs" }[] = [
  { key: "tous", label: "Tous" },
  { key: "nouveau", label: "Nouveau" },
  { key: "distinctions", label: "Distinctions", icon: "sparkle" },
  { key: "ideal", label: "Idéal pour", icon: "thumbs" },
];

export function MapOverlay() {
  const activeKey: FilterKey = "tous";
  const chasseurMode = useMapStore((s) => s.chasseurMode);
  const setChasseurMode = useMapStore((s) => s.setChasseurMode);
  const selectedRestaurant = useMapStore((s) => s.selectedRestaurant);
  const listViewOpen = useMapStore((s) => s.listViewOpen);
  const setListViewOpen = useMapStore((s) => s.setListViewOpen);

  return (
    <div
      aria-hidden={false}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: "var(--z-sticky)",
      }}
    >
      {/* List view — inlined above the map canvas but *below* the floating
          controls so the map/list toggle + Chasseur switch stay visible in
          both modes. RestaurantListView handles its own scroll. */}
      {listViewOpen ? <RestaurantListView /> : null}
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header
        style={{
          position: "absolute",
          top: "env(safe-area-inset-top, 0px)",
          left: 0,
          right: 0,
          height: 92,
          display: "grid",
          gridTemplateColumns: "44px 1fr 44px",
          alignItems: "center",
          padding: "0 var(--space-md)",
          pointerEvents: "none",
        }}
      >
        <Link
          href="/accueil"
          aria-label="Retour"
          style={{
            pointerEvents: "auto",
            width: 29,
            height: 29,
            display: "inline-grid",
            placeItems: "center",
            borderRadius: "var(--radius-full)",
            background: "var(--color-surface)",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <img src="/icons/map/arrow-back.svg" alt="" width={29} height={29} />
        </Link>
        <h1
          style={{
            margin: 0,
            textAlign: "center",
            fontSize: "var(--font-size-base)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-ink)",
            letterSpacing: 0,
          }}
        >
          Autour de moi
        </h1>
        <span aria-hidden />
      </header>

      {/* ── Filter chips ────────────────────────────────────────────────── */}
      <div
        role="toolbar"
        aria-label="Filtres"
        style={{
          position: "absolute",
          top: "calc(env(safe-area-inset-top, 0px) + 86px)",
          left: 0,
          right: 0,
          pointerEvents: "auto",
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            gap: "var(--space-sm)",
            padding: "0 var(--space-md)",
            whiteSpace: "nowrap",
          }}
        >
          {FILTERS.map((f) => {
            const isActive = f.key === activeKey;
            const isMuted = f.key === "nouveau";
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={isActive}
                style={{
                  height: 37,
                  padding: "0 16px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  borderRadius: "var(--radius-md)",
                  background: isMuted ? "var(--color-chip-muted-bg)" : "var(--color-surface)",
                  border: isActive ? "1px solid #000" : "1px solid transparent",
                  color: isMuted ? "var(--color-chip-muted-fg)" : "var(--color-ink)",
                  fontFamily: "var(--font-sans)",
                  fontWeight: "var(--font-weight-bold)",
                  fontSize: "var(--font-size-sm)",
                  lineHeight: 1,
                  cursor: "pointer",
                  flex: "0 0 auto",
                }}
              >
                {f.icon === "sparkle" ? (
                  <img
                    src="/icons/map/sparkle.svg"
                    alt=""
                    width={16}
                    height={18}
                    style={{ display: "block" }}
                  />
                ) : null}
                {f.icon === "thumbs" ? (
                  <img
                    src="/icons/map/thumbs-up.svg"
                    alt=""
                    width={16}
                    height={16}
                    style={{ display: "block", color: "var(--color-ink)" }}
                  />
                ) : null}
                <span>{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Restaurant info card (selected pin) — map mode only ─────────── */}
      {selectedRestaurant && !listViewOpen ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom:
              "calc(44px + env(safe-area-inset-bottom, 0px) + var(--space-md) + var(--space-sm))",
            display: "flex",
            justifyContent: "center",
            padding: "0 var(--space-md)",
            pointerEvents: "none",
            zIndex: "var(--z-modal)",
          }}
        >
          <div style={{ width: "100%", maxWidth: 358 }}>
            <RestaurantInfoCard restaurant={selectedRestaurant} showScore={chasseurMode} />
          </div>
        </div>
      ) : null}

      {/* ── Chasseur d'Étoiles control bar ──────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: "calc(env(safe-area-inset-bottom, 0px) + var(--space-md))",
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: "var(--z-modal)",
        }}
      >
        <div
          style={{
            pointerEvents: "auto",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-sm)",
            padding: "0 var(--space-md)",
            width: "100%",
            maxWidth: 390,
          }}
        >
          <button
            type="button"
            aria-label={listViewOpen ? "Retour à la carte" : "Liste des restaurants"}
            aria-pressed={listViewOpen}
            onClick={() => setListViewOpen(!listViewOpen)}
            style={{
              width: 53,
              height: 44,
              borderRadius: 35,
              background: "var(--color-ink)",
              border: "none",
              display: "inline-grid",
              placeItems: "center",
              boxShadow: "0 4px 16px 0 rgb(0 0 0 / 0.25)",
              cursor: "pointer",
              flex: "0 0 auto",
            }}
          >
            {listViewOpen ? (
              <MapIcon size={22} color="white" aria-hidden />
            ) : (
              <img
                src="/icons/map/list-menu.svg"
                alt=""
                width={27}
                height={14}
                style={{ display: "block" }}
              />
            )}
          </button>

          <ChasseurSwitch active={chasseurMode} onToggle={() => setChasseurMode(!chasseurMode)} />
        </div>
      </div>
    </div>
  );
}
