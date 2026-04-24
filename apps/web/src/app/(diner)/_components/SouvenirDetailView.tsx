"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SouvenirResponseType } from "@repo/shared-schemas";

import { Button } from "@/components/ui/button";

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

function badgeFor(id: string): { src: string; alt: string } {
  const isVegan = id.charCodeAt(0) % 2 === 0;
  return isVegan
    ? { src: "/images/chasseur/badge-vegan-delices-figma.svg", alt: "VEGAN délices" }
    : { src: "/images/chasseur/badge-smiley.svg", alt: "Expérience validée" };
}

export function SouvenirDetailView({ souvenir }: { souvenir: SouvenirResponseType }) {
  const router = useRouter();
  const caption = souvenir.note?.trim() || souvenir.dishName;
  const badge = badgeFor(souvenir.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", paddingBottom: 32 }}>
      {/* Header */}
      <header style={{ position: "relative", height: 78 }}>
        <button
          type="button"
          aria-label="Retour"
          onClick={() => router.back()}
          style={{
            position: "absolute",
            top: 49,
            left: 16,
            width: 29,
            height: 29,
            padding: 0,
            background: "transparent",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image src="/icons/map/arrow-back.svg" alt="" width={29} height={29} priority />
        </button>
        <h1
          style={{
            position: "absolute",
            top: 51,
            left: "50%",
            transform: "translateX(-50%)",
            margin: 0,
            fontFamily: "var(--font-sans)",
            fontSize: 16,
            fontWeight: "var(--font-weight-bold)",
            color: "var(--color-ink)",
            lineHeight: "26px",
            whiteSpace: "nowrap",
          }}
        >
          Mon souvenir
        </h1>
      </header>

      {/* Polaroid article — mirrors ExperienceCard */}
      <article
        style={{
          paddingInline: 15,
          paddingTop: 32,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Restaurant title row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <h2
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
            {souvenir.restaurantName}
          </h2>
          <Image
            src="/images/chasseur/icon-fork-knife-emblem.svg"
            alt=""
            width={14}
            height={22}
            style={{ flexShrink: 0 }}
          />
        </div>

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
          {formatFrenchDate(souvenir.createdAt)} · {souvenir.restaurantCity}
        </span>

        {/* Polaroid card */}
        <div
          style={{
            position: "relative",
            marginTop: 24,
            height: 380,
            background: "var(--color-surface)",
            borderRadius: 2,
            boxShadow: "var(--shadow-card)",
          }}
        >
          {/* Tape */}
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

          {/* Photo */}
          <div
            style={{
              position: "absolute",
              top: 13,
              left: 16,
              right: 15,
              height: 260,
              overflow: "hidden",
              borderRadius: 2,
            }}
          >
            <img
              src={`/api/images/${souvenir.imageKey}`}
              alt={souvenir.dishName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>

          {/* Handwritten caption */}
          <div
            style={{
              position: "absolute",
              top: 288,
              left: 25,
              right: 18,
              maxHeight: 66,
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
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {caption}
            </p>
          </div>

          {/* Floating themed badge */}
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
              src={badge.src}
              alt={badge.alt}
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Points line */}
        <div
          style={{
            marginTop: 28,
            background: "var(--color-surface)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "var(--space-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--font-size-base)",
              color: "var(--color-ink-muted)",
            }}
          >
            Points gagnés
          </span>
          <strong
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
              color: "var(--color-accent-gold)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            +{souvenir.pointsAwarded}
          </strong>
        </div>

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-sm)",
            marginTop: 20,
          }}
        >
          <Button
            style={{ width: "100%" }}
            nativeButton={false}
            render={<Link href={`/review/${souvenir.restaurantId}?souvenirId=${souvenir.id}`} />}
          >
            Donner mon avis
          </Button>
          <div style={{ display: "flex", gap: "var(--space-md)" }}>
            <Button
              variant="outline"
              style={{ flex: 1 }}
              nativeButton={false}
              render={<Link href="/chasseur" />}
            >
              Mes expériences
            </Button>
            <Button
              variant="outline"
              style={{ flex: 1 }}
              nativeButton={false}
              render={<Link href="/scan" />}
            >
              Scanner à nouveau
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}
