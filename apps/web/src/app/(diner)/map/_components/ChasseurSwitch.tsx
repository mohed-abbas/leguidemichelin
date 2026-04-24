"use client";

/**
 * ChasseurSwitch — the "Mode Chasseur d'Étoiles" toggle strip.
 *
 * OFF (Figma node 0:190):
 *   - Gray (#bbb) pill 296×44 rounded-35 with a drop shadow
 *   - 65×38 white rounded-rect panel (always present, always on the left)
 *   - 34×34 gray #bbb thumb circle at the LEFT edge of the white panel
 *
 * ON (Figma node 0:304):
 *   - Track turns red (--color-primary #ba0b2f)
 *   - White panel stays in place
 *   - Thumb slides from left → right edge of the white panel and turns red
 *
 * Both states: Roboto label ("Mode" light + "Chasseur d'Étoiles" bold), white star icon
 * at the right edge. Click toggles the value.
 */

interface Props {
  active: boolean;
  onToggle: () => void;
}

export function ChasseurSwitch({ active, onToggle }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label="Mode Chasseur d'Étoiles"
      onClick={onToggle}
      style={{
        position: "relative",
        width: 296,
        height: 44,
        flex: "0 1 296px",
        borderRadius: 35,
        border: "none",
        background: active ? "var(--color-primary)" : "var(--color-chasseur-track)",
        boxShadow: "0 4px 16px 0 rgb(0 0 0 / 0.25)",
        cursor: "pointer",
        padding: 0,
        transition: "background var(--duration-base) var(--ease-standard)",
      }}
    >
      {/* White rounded panel — fixed on the LEFT in both states */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 4,
          top: 3,
          width: 65,
          height: 38,
          borderRadius: 35,
          background: "var(--color-surface)",
        }}
      />
      {/* Thumb — slides inside the 65-wide white panel.
          OFF: left=7 (flush left), thumb = gray
          ON:  left=33 (flush right, 7 + 26 travel), thumb = red */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: active ? 33 : 7,
          top: 5,
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: active ? "var(--color-primary)" : "var(--color-chasseur-track)",
          transition:
            "left var(--duration-base) var(--ease-standard), background var(--duration-base) var(--ease-standard)",
        }}
      />

      {/* Label — centered in the right portion of the pill */}
      <span
        style={{
          position: "absolute",
          left: 74,
          right: 36,
          top: "50%",
          transform: "translateY(-50%)",
          textAlign: "center",
          color: "var(--color-surface)",
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          lineHeight: "16.2px",
          letterSpacing: 0,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ fontWeight: "var(--font-weight-regular)" }}>Mode</span>
        <span style={{ fontWeight: "var(--font-weight-bold)" }}> Chasseur d&rsquo;Étoiles</span>
      </span>

      {/* Star icon — right edge */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          right: 9,
          top: "50%",
          transform: "translateY(-50%)",
          width: 21,
          height: 24,
          display: "grid",
          placeItems: "center",
        }}
      >
        <img
          src="/icons/map/star-outline.svg"
          alt=""
          width={21}
          height={24}
          style={{ display: "block" }}
        />
      </span>
    </button>
  );
}
