"use client";

/**
 * DishPicker — responsive grid of dish tiles for the MintForm.
 *
 * Controlled component: the selected dishId is owned by the parent form.
 * Notifies the parent when the selected dish gains/loses a `defaultImageKey`
 * so MintForm can enable/disable the "Utiliser la photo du plat" secondary CTA.
 *
 * Layout:
 *   - Mobile (< 640 px): 2 columns
 *   - ≥ 640 px: 3 columns (CSS media query via <style> tag approach)
 *
 * Canonical refs:
 *   - 04-03-PLAN.md task 2
 *   - BACKEND-CONTRACT.md §Diner — Restaurants (GET /:id/menu)
 */

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
      {/* Inject responsive grid columns via a scoped style tag */}
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
                display: "flex",
                flexDirection: "column",
                borderRadius: "12px",
                overflow: "hidden",
                background: "var(--color-surface)",
                boxShadow: isSelected
                  ? "0 0 0 2px var(--color-primary)"
                  : "0 0 0 1px var(--color-border)",
                cursor: "pointer",
                textAlign: "left",
                transition: "box-shadow 0.15s ease",
              }}
              data-selected={isSelected}
            >
              {/* Dish photo */}
              {dish.defaultImageKey ? (
                <img
                  src={`/api/images/${dish.defaultImageKey}`}
                  alt={dish.name}
                  loading="lazy"
                  style={{
                    aspectRatio: "1 / 1",
                    objectFit: "cover",
                    width: "100%",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  aria-hidden="true"
                  style={{
                    aspectRatio: "1 / 1",
                    width: "100%",
                    background: "var(--color-surface-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "var(--font-size-xl)",
                  }}
                >
                  🍽️
                </div>
              )}

              {/* Dish info */}
              <div
                style={{
                  padding: "var(--space-xs) var(--space-sm) var(--space-sm)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--space-xs)",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "var(--color-ink)",
                    lineHeight: 1.3,
                  }}
                >
                  {dish.name}
                </span>
                {dish.priceCents > 0 && (
                  <span
                    style={{
                      fontSize: "var(--font-size-sm)",
                      color: "var(--color-ink-muted)",
                    }}
                  >
                    {priceFormatter.format(dish.priceCents / 100)}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
