/**
 * PinScoreBadge — the small "visits/target" + emblem chip shown on map
 * pins in Chasseur d'Étoiles mode and in the list view.
 *
 * Figma spec (nodes 24:492 / 24:498 / 24:504 + selected variant 24:641):
 *   - 56×31 rounded-11 pill with a 1px border
 *   - Roboto Bold 14 "N/M" label
 *   - Small emblem icon on the right side, mirroring the pin variant:
 *       • starred restaurants (ONE/TWO/THREE) → flower
 *       • Bib Gourmand                         → bib (spoon/utensil)
 *       • other recommended                    → face
 *   - Unselected: white bg, red border, dark text, red emblem
 *   - Selected (24:641): red bg, white border, white text, white emblem
 *
 * Pure presentational component. Callers pass `visits` (completed) and
 * `target` (goal); rendered label is `${visits}/${target}`.
 */

export type EmblemKey = "flower" | "bib" | "face";

export function PinScoreBadge({
  visits,
  target,
  icon = "flower",
  selected = false,
}: {
  visits: number;
  target: number;
  icon?: EmblemKey;
  selected?: boolean;
}) {
  const emblemSrc = EMBLEM_SRC[icon];
  return (
    <div
      aria-label={`${visits} visites sur ${target}`}
      style={{
        width: 56,
        height: 31,
        borderRadius: 11,
        background: selected ? "var(--color-primary)" : "var(--color-surface)",
        border: selected ? "1px solid var(--color-surface)" : "1px solid var(--color-primary)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        paddingInline: 8,
        fontFamily: "var(--font-sans)",
        fontWeight: "var(--font-weight-bold)",
        fontSize: 14,
        lineHeight: "16.2px",
        color: selected ? "var(--color-surface)" : "var(--color-ink)",
        whiteSpace: "nowrap",
      }}
    >
      <span>
        {visits}/{target}
      </span>
      <img
        src={emblemSrc}
        alt=""
        width={16}
        height={18}
        style={{
          display: "block",
          // When selected the emblem needs to be white; the emblem SVGs use a
          // red literal, so invert-brightness flips them to white.
          filter: selected ? "brightness(0) invert(1)" : undefined,
        }}
      />
    </div>
  );
}

/**
 * Visit target derived from the Michelin rating.
 * Demo heuristic: more prestigious distinction → higher target.
 */
export function targetFromRating(
  rating: "BIB" | "ONE" | "TWO" | "THREE" | null | undefined,
): number {
  switch (rating) {
    case "THREE":
      return 5;
    case "TWO":
      return 3;
    case "ONE":
    case "BIB":
    default:
      return 2;
  }
}

/**
 * Deterministic mock visit count for the chasseur badge until the backend
 * exposes real visits-per-restaurant data. Hashes the restaurant id so the
 * same pin always shows the same fake count — avoids the UI re-rolling on
 * every render / pan.
 *
 * Returns an integer in [0, target].
 */
export function mockVisits(restaurantId: string, target: number): number {
  let h = 0;
  for (let i = 0; i < restaurantId.length; i++) {
    h = (h * 31 + restaurantId.charCodeAt(i)) >>> 0;
  }
  return h % (target + 1);
}

/**
 * Derive pin/emblem variant from the restaurant type. Mirrors the three map
 * pin designs exactly and is visit-agnostic:
 *   • Bib Gourmand                    → bib (spoon/utensil)
 *   • Starred (ONE / TWO / THREE)     → flower
 *   • Anything else / null / unknown  → face (generic "recommended")
 */
export function emblemFromRating(
  rating: "BIB" | "ONE" | "TWO" | "THREE" | null | undefined,
): EmblemKey {
  if (rating === "BIB") return "bib";
  if (rating === "ONE" || rating === "TWO" || rating === "THREE") return "flower";
  return "face";
}

/** Map emblem keys to their public asset paths — single source of truth. */
export const EMBLEM_SRC: Record<EmblemKey, string> = {
  flower: "/icons/map/flower-emblem.svg",
  bib: "/icons/map/bib-emblem.svg",
  face: "/icons/map/face-emblem.svg",
};

/** Map emblem keys to their full pin SVG paths (dark teardrop + glyph). */
export const PIN_SRC: Record<EmblemKey, string> = {
  flower: "/pins/pin-starred.svg",
  bib: "/pins/pin-bib.svg",
  face: "/pins/pin-recommended.svg",
};
