"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";

type StarKey = "BIB" | "ONE" | "TWO" | "THREE";

interface StarOption {
  value: StarKey;
  label: string;
  emblem: "bib" | "flower";
  count: number;
}

const STAR_OPTIONS: StarOption[] = [
  { value: "BIB", label: "Bib Gourmand", emblem: "bib", count: 1 },
  { value: "ONE", label: "1 étoile", emblem: "flower", count: 1 },
  { value: "TWO", label: "2 étoiles", emblem: "flower", count: 2 },
  { value: "THREE", label: "3 étoiles", emblem: "flower", count: 3 },
];

const EMBLEM_SRC: Record<"bib" | "flower", string> = {
  bib: "/icons/map/bib-emblem.svg",
  flower: "/icons/map/flower-emblem.svg",
};

function EmblemRow({
  emblem,
  count,
  active,
}: {
  emblem: "bib" | "flower";
  count: number;
  active: boolean;
}) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 2,
        // Active pill flips to primary background (white fg), so emblems need
        // to become white. Inactive pill keeps their original red/dark art.
        filter: active ? "brightness(0) invert(1)" : undefined,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Image
          key={i}
          src={EMBLEM_SRC[emblem]}
          alt=""
          width={14}
          height={16}
          style={{ display: "block" }}
        />
      ))}
    </span>
  );
}

export function RestaurantFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const city = searchParams.get("city") ?? "";
  const starsRaw = searchParams.get("stars") ?? "";
  const activeStars = starsRaw ? starsRaw.split(",").filter(Boolean) : [];

  const push = useCallback(
    (city: string, stars: string[]) => {
      const params = new URLSearchParams();
      if (city) params.set("city", city);
      if (stars.length) params.set("stars", stars.join(","));
      router.push(`/restaurants${params.size ? `?${params}` : ""}`);
    },
    [router],
  );

  function toggleStar(value: StarKey) {
    const next = activeStars.includes(value)
      ? activeStars.filter((s) => s !== value)
      : [...activeStars, value];
    push(city, next);
  }

  function handleCityChange(e: React.ChangeEvent<HTMLInputElement>) {
    push(e.target.value, activeStars);
  }

  function handleReset() {
    router.push("/restaurants");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-md)" }}>
      {/* Search bar — mirrors the diner-home pattern: 57px white pill,
          shadow-search elevation, search icon + labelled input. */}
      <div
        style={{
          height: "57px",
          background: "var(--color-surface)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-search)",
          display: "flex",
          alignItems: "center",
          paddingInline: "19px",
          gap: "12px",
        }}
      >
        <span
          aria-hidden
          style={{
            flex: "0 0 28px",
            width: "28px",
            height: "28px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Image src="/icons/search.svg" alt="" width={28} height={28} />
        </span>
        <label
          htmlFor="restaurants-city-filter"
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0 0 0 0)",
            whiteSpace: "nowrap",
            border: 0,
          }}
        >
          Filtrer par ville
        </label>
        <input
          id="restaurants-city-filter"
          type="text"
          value={city}
          onChange={handleCityChange}
          placeholder="Filtrer par ville…"
          style={{
            flex: 1,
            minWidth: 0,
            height: "100%",
            border: "none",
            outline: "none",
            background: "transparent",
            fontFamily: "var(--font-sans)",
            fontSize: "var(--font-size-md)",
            color: "var(--color-ink)",
          }}
        />
      </div>

      {/* Rating chips — flower / bib emblems replace ⭐ emoji. */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-xs)" }}>
        {STAR_OPTIONS.map((opt) => {
          const active = activeStars.includes(opt.value);
          return (
            <Button
              key={opt.value}
              type="button"
              variant={active ? "default" : "outline"}
              size="sm"
              onClick={() => toggleStar(opt.value)}
              aria-pressed={active}
              aria-label={opt.label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                borderRadius: "var(--radius-full)",
              }}
            >
              <EmblemRow emblem={opt.emblem} count={opt.count} active={active} />
              {opt.value === "BIB" ? <span>Bib Gourmand</span> : null}
            </Button>
          );
        })}
        {(city || activeStars.length > 0) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            style={{ borderRadius: "var(--radius-full)" }}
          >
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
}
