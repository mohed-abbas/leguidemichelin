import Image from "next/image";
import Link from "next/link";

import type { CollectionItem } from "../_data";

const CARD_ACTION_ICONS = [
  { src: "/images/chasseur/icon-card-notebook.svg", alt: "Notes", size: 17 },
  { src: "/images/chasseur/icon-card-check.svg", alt: "Visité", size: 21 },
  { src: "/images/chasseur/icon-card-bookmark.svg", alt: "Sauvegarder", size: 18 },
  { src: "/images/chasseur/icon-card-heart.svg", alt: "Favori", size: 24 },
] as const;

export function CollectionCard({ item }: { item: CollectionItem }) {
  return (
    <Link
      href={item.href}
      style={{
        position: "relative",
        display: "block",
        width: "100%",
        height: 168,
        background: "var(--color-surface)",
        borderRadius: 11,
        boxShadow: "0 0 9px 0 rgba(0, 0, 0, 0.07)",
        textDecoration: "none",
        color: "inherit",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 17,
          left: 15,
          width: 12,
          height: 20,
        }}
      >
        <Image src="/images/chasseur/icon-fork-knife-emblem.svg" alt="" width={12} height={20} />
      </div>

      <div
        style={{
          position: "absolute",
          top: 35,
          left: 15,
          right: 132,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 24,
            fontWeight: "var(--font-weight-regular)",
            color: "var(--color-ink)",
            lineHeight: "normal",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.name}
        </span>
        <span
          style={{
            marginTop: 6,
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: "var(--font-weight-regular)",
            color: "var(--color-ink-muted)",
            lineHeight: "17px",
          }}
        >
          {item.city}
        </span>
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 13,
            fontWeight: "var(--font-weight-regular)",
            color: "var(--color-ink-muted)",
            lineHeight: "17px",
          }}
        >
          {item.priceTier} • {item.cuisine}
        </span>
      </div>

      <div
        style={{
          position: "absolute",
          top: 17,
          right: 18,
          width: 93,
          height: 93,
          borderRadius: 7,
          overflow: "hidden",
          background: "var(--color-surface-muted)",
        }}
      >
        <img
          src={item.thumbnail}
          alt=""
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
        {item.coupDeCoeur ? (
          <div
            style={{
              position: "absolute",
              top: 4,
              left: 4,
              width: 85,
              height: 27,
              background: "var(--color-surface)",
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingInline: 6,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 10,
                fontWeight: "var(--font-weight-regular)",
                color: "var(--color-ink)",
                lineHeight: "10px",
                textAlign: "center",
              }}
            >
              Coup de cœur
              <br />
              des gourmands
            </span>
          </div>
        ) : null}
      </div>

      <div
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          top: 123,
          height: 0,
          borderTop: "0.5px solid var(--color-border)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 15,
          top: 137,
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 14,
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-ink)",
            lineHeight: "16.2px",
          }}
        >
          {item.progressCurrent}/{item.progressTotal}
        </span>
        <Image src="/images/chasseur/icon-star-mini-red.svg" alt="" width={18} height={21} />
      </div>

      <div
        style={{
          position: "absolute",
          right: 14,
          top: 139,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        {CARD_ACTION_ICONS.map((icon) => (
          <Image
            key={icon.src}
            src={icon.src}
            alt={icon.alt}
            width={icon.size}
            height={21}
            style={{ display: "block", objectFit: "contain" }}
          />
        ))}
      </div>
    </Link>
  );
}
