"use client";

/**
 * DishPicker — polaroid-lite dish tiles for the MintForm.
 *
 * Controlled component: selected dishId is owned by the parent form.
 * Notifies the parent when the selected dish gains/loses a `defaultImageKey`
 * so MintForm can enable/disable the "Utiliser la photo du plat" secondary CTA.
 *
 * Visual language: tiles match the polaroid/carnet-de-voyage treatment of
 * the main photo well — white paper surface, warm hairline, inset photo mat
 * in `--color-surface-muted`, ink typography. Selected tiles get a red ring
 * + a red check badge in the top-right corner of the photo. Empty photo
 * placeholder uses the fork-knife emblem (shared with MintForm hero).
 *
 * Layout:
 *   - Mobile (< 640 px): 2 columns
 *   - ≥ 640 px: 3 columns
 *
 * Canonical refs:
 *   - 04-03-PLAN.md task 2
 *   - BACKEND-CONTRACT.md §Diner — Restaurants (GET /:id/menu)
 */

import Image from "next/image";
import { Check } from "lucide-react";

import type { DishResponseShapeType } from "@repo/shared-schemas";

interface DishPickerProps {
  dishes: DishResponseShapeType[];
  value: string;
  onChange: (dishId: string) => void;
  /** Notifies parent whether the currently selected dish has a defaultImageKey. */
  onDefaultImageAvailable?: (hasDefault: boolean) => void;
}

const priceFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
});

export function DishPicker({ dishes, value, onChange, onDefaultImageAvailable }: DishPickerProps) {
  if (dishes.length === 0) {
    return (
      <p
        style={{
          color: "var(--color-ink-muted)",
          fontSize: "var(--font-size-base)",
          textAlign: "center",
          padding: "var(--space-lg) var(--space-md)",
        }}
      >
        Le menu n&apos;est pas encore disponible pour ce restaurant.
      </p>
    );
  }

  return (
    <>
      <style>{`
        .dish-picker-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--space-sm);
        }
        @media (min-width: 640px) {
          .dish-picker-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
      `}</style>

      <div className="dish-picker-grid" role="listbox" aria-label="Choisissez un plat">
        {dishes.map((dish) => {
          const isSelected = value === dish.id;
          return (
            <button
              key={dish.id}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                onChange(dish.id);
                onDefaultImageAvailable?.(Boolean(dish.defaultImageKey));
              }}
              style={{
                all: "unset",
                boxSizing: "border-box",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                borderRadius: 12,
                overflow: "hidden",
                background: "var(--color-surface)",
                boxShadow: "var(--shadow-card)",
                border: isSelected
                  ? "2px solid var(--color-primary)"
                  : "1px solid var(--color-border)",
                cursor: "pointer",
                textAlign: "left",
                transition:
                  "border-color var(--duration-base) var(--ease-standard), box-shadow var(--duration-base) var(--ease-standard)",
              }}
              data-selected={isSelected}
            >
              {/* Photo mat — mirrors MintForm polaroid well (surface-muted inside surface card) */}
              <div
                style={{
                  position: "relative",
                  padding: "var(--space-xs) var(--space-xs) 0",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    aspectRatio: "1 / 1",
                    width: "100%",
                    borderRadius: 6,
                    overflow: "hidden",
                    background: "var(--color-surface-muted)",
                  }}
                >
                  {dish.defaultImageKey ? (
                    <img
                      src={`/api/images/${dish.defaultImageKey}`}
                      alt={dish.name}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  ) : (
                    <div
                      aria-hidden
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        src="/images/chasseur/icon-fork-knife-emblem.svg"
                        alt=""
                        width={18}
                        height={28}
                        style={{ opacity: 0.55 }}
                      />
                    </div>
                  )}

                  {/* Selected check badge — red disc, top-right */}
                  {isSelected ? (
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: "var(--color-primary)",
                        display: "grid",
                        placeItems: "center",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.18)",
                      }}
                    >
                      <Check size={13} color="var(--color-primary-fg)" strokeWidth={3} />
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Caption strip */}
              <div
                style={{
                  padding: "10px var(--space-sm) 12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--color-ink)",
                    lineHeight: 1.25,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {dish.name}
                </span>
                {dish.priceCents > 0 ? (
                  <span
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "var(--font-size-xs)",
                      color: "var(--color-ink-muted)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {priceFormatter.format(dish.priceCents / 100)}
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
