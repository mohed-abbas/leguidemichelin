import type { ReactNode } from "react";
import { Search } from "lucide-react";

/**
 * Standardized filter surface — search input on the left (with leading icon),
 * filter chips on the right, optional trailing widget.
 */
export function FilterBar({
  search,
  chips,
  trailing,
}: {
  search?: ReactNode;
  chips?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: search ? "minmax(220px, 320px) 1fr auto" : "1fr auto",
        gap: "var(--space-md)",
        alignItems: "center",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-sm) var(--space-md)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      {search ? <div style={{ minWidth: 0 }}>{search}</div> : null}
      <div
        style={{
          display: "flex",
          gap: "var(--space-xs)",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {chips}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
        {trailing}
      </div>
    </div>
  );
}

/**
 * Search input with leading icon — keep visual parity with the diner shell.
 */
export function SearchInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  ariaLabel: string;
}) {
  return (
    <label
      style={{
        position: "relative",
        display: "block",
        width: "100%",
      }}
    >
      <Search
        size={14}
        aria-hidden
        style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          color: "var(--color-ink-subtle)",
          pointerEvents: "none",
        }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        style={{
          width: "100%",
          height: 34,
          paddingInline: "32px var(--space-sm)",
          borderRadius: "var(--radius-md)",
          border: "1px solid var(--color-border)",
          background: "var(--color-bg)",
          color: "var(--color-ink)",
          fontSize: "var(--font-size-sm)",
          fontFamily: "inherit",
          outline: "none",
          transition: "border-color var(--duration-fast) var(--ease-standard)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--color-ink-muted)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--color-border)";
        }}
      />
    </label>
  );
}
