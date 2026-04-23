"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const STAR_OPTIONS = [
  { value: "BIB", label: "Bib Gourmand" },
  { value: "ONE", label: "1 ⭐" },
  { value: "TWO", label: "2 ⭐⭐" },
  { value: "THREE", label: "3 ⭐⭐⭐" },
] as const;

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

  function toggleStar(value: string) {
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
      <Input
        placeholder="Filtrer par ville…"
        value={city}
        onChange={handleCityChange}
        aria-label="Filtrer par ville"
      />
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
            >
              {opt.label}
            </Button>
          );
        })}
        {(city || activeStars.length > 0) && (
          <Button type="button" variant="ghost" size="sm" onClick={handleReset}>
            Réinitialiser
          </Button>
        )}
      </div>
    </div>
  );
}
