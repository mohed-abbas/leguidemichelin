"use client";

import Image from "next/image";

export function ExperiencesSearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div
      style={{
        position: "relative",
        marginInline: 16,
        height: 57,
        background: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-search)",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "50%",
          left: 19,
          width: 28,
          height: 28,
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      >
        <Image src="/images/chasseur/icon-search.svg" alt="" width={28} height={28} />
      </div>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Pimpan le 14 Mai 2024..."
        aria-label="Rechercher une expérience"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          paddingLeft: 54,
          paddingRight: 16,
          border: "none",
          outline: "none",
          background: "transparent",
          borderRadius: "var(--radius-lg)",
          fontFamily: "var(--font-sans)",
          fontSize: "var(--font-size-md)",
          fontWeight: "var(--font-weight-regular)",
          color: "var(--color-ink)",
        }}
      />
    </div>
  );
}
