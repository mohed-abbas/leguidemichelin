import Image from "next/image";

import { BADGES } from "../_data";

export function BadgeRow() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        paddingInline: 16,
      }}
    >
      <h2
        style={{
          margin: 0,
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          fontWeight: "var(--font-weight-bold)",
          color: "var(--color-placeholder)",
          lineHeight: "16.2px",
        }}
      >
        Mes badges
      </h2>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
        }}
      >
        {BADGES.map((badge) => (
          <li key={badge.id} style={{ flex: "0 0 auto" }}>
            <Image
              src={badge.asset}
              alt={badge.alt}
              width={79}
              height={79}
              style={{ display: "block" }}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
