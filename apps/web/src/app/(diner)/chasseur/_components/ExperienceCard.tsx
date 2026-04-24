import Image from "next/image";
import Link from "next/link";

export type ExperienceCardData = {
  souvenirId: string;
  restaurantName: string;
  createdAt: string;
  photo: string;
  note: string | null;
  dishName: string;
  progressCurrent: number;
  progressTotal: number;
  badge: "vegan" | "smiley";
  href: string;
};

const MONTHS_FR = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

function formatFrenchDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

export function ExperienceCard({ data }: { data: ExperienceCardData }) {
  const caption = data.note?.trim() || data.dishName;
  const badgeSrc =
    data.badge === "vegan"
      ? "/images/chasseur/badge-vegan-delices-figma.svg"
      : "/images/chasseur/badge-smiley.svg";
  const badgeAlt = data.badge === "vegan" ? "VEGAN délices" : "Expérience validée";

  return (
    <article
      style={{
        paddingInline: 15,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Restaurant title row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontSize: 24,
            fontWeight: "var(--font-weight-regular)",
            lineHeight: "normal",
            color: "var(--color-ink)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {data.restaurantName}
        </h3>
        <Image
          src="/images/chasseur/icon-fork-knife-emblem.svg"
          alt=""
          width={14}
          height={22}
          style={{ flexShrink: 0 }}
        />
        <div style={{ flex: 1 }} />
        <button
          type="button"
          aria-label="Partager cette expérience"
          style={{
            width: 18,
            height: 22,
            border: "none",
            background: "transparent",
            padding: 0,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image src="/images/chasseur/icon-share-experience.svg" alt="" width={18} height={22} />
        </button>
      </div>

      {/* Date */}
      <span
        style={{
          marginTop: 4,
          fontFamily: "var(--font-sans)",
          fontSize: "var(--font-size-sm)",
          fontWeight: "var(--font-weight-regular)",
          lineHeight: "var(--line-height-card)",
          color: "var(--color-ink)",
        }}
      >
        {formatFrenchDate(data.createdAt)}
      </span>

      {/* Polaroid card */}
      <Link
        href={data.href}
        style={{
          position: "relative",
          marginTop: 14,
          display: "block",
          height: 325,
          background: "var(--color-surface)",
          borderRadius: 2,
          boxShadow: "var(--shadow-card)",
          color: "inherit",
          textDecoration: "none",
        }}
      >
        {/* Masking tape decoration */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translate(-50%, -11px)",
            width: 171,
            height: 33,
            zIndex: 2,
            pointerEvents: "none",
          }}
        >
          <img
            src="/images/chasseur/polaroid-tape.png"
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Dish photo */}
        <div
          style={{
            position: "absolute",
            top: 13,
            left: 16,
            right: 15,
            height: 219,
            overflow: "hidden",
            borderRadius: 2,
          }}
        >
          <img
            src={data.photo}
            alt=""
            loading="lazy"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        {/* Handwritten caption — clipped to 2 lines to keep the action row clear */}
        <div
          style={{
            position: "absolute",
            top: 238,
            left: 25,
            right: 18,
            maxHeight: 44,
            overflow: "hidden",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-handwriting), cursive",
              fontSize: 20,
              fontWeight: 400,
              lineHeight: "22px",
              color: "var(--color-ink)",
              whiteSpace: "pre-wrap",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {caption}
          </p>
        </div>

        {/* Personnaliser link — hidden via CSS (toggle in globals.css to reveal) */}
        <span
          className="chasseur-personnaliser-link"
          style={{
            position: "absolute",
            left: 25,
            bottom: 14,
            fontFamily: "var(--font-sans)",
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-regular)",
            lineHeight: "var(--line-height-card)",
            color: "var(--color-primary)",
            textDecoration: "underline",
          }}
        >
          Personnaliser
        </span>

        {/* Progress counter + flower stamp */}
        <div
          style={{
            position: "absolute",
            right: 14,
            bottom: 14,
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
              lineHeight: "var(--line-height-card)",
              color: "var(--color-ink)",
            }}
          >
            {data.progressCurrent}/{data.progressTotal}
          </span>
          <Image src="/images/chasseur/icon-flower-stamp.svg" alt="" width={18} height={20} />
        </div>

        {/* Floating themed badge (top-right, overflowing card edge) */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: -35,
            right: -10,
            width: 93,
            height: 93,
            zIndex: 3,
            pointerEvents: "none",
          }}
        >
          <img
            src={badgeSrc}
            alt={badgeAlt}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>
      </Link>
    </article>
  );
}
