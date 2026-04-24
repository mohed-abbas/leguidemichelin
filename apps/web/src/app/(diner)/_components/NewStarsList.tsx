"use client";

import { useEffect, useState } from "react";
import type { RestaurantResponseType } from "@repo/shared-schemas";
import { RestaurantInfoCard } from "../map/_components/RestaurantInfoCard";

interface Props {
  restaurants: RestaurantResponseType[];
}

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function NewStarsList({ restaurants }: Props) {
  const [ordered, setOrdered] = useState(restaurants);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const sorted = [...restaurants].sort((a, b) => haversineKm(here, a) - haversineKm(here, b));
        setOrdered(sorted);
      },
      () => {
        // denied / timeout — keep server order (rating desc, name asc)
      },
      { timeout: 3000, maximumAge: 60_000 },
    );
  }, [restaurants]);

  if (ordered.length === 0) {
    return (
      <p
        style={{
          marginTop: "var(--space-md)",
          color: "var(--color-ink-muted)",
          fontSize: "var(--font-size-sm)",
        }}
      >
        Aucun restaurant étoilé pour le moment.
      </p>
    );
  }

  return (
    <ul
      style={{
        listStyle: "none",
        margin: 0,
        marginTop: "var(--space-md)",
        padding: 0,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
      }}
    >
      {ordered.map((r) => (
        <li key={r.id}>
          <RestaurantInfoCard restaurant={r} closable={false} />
        </li>
      ))}
    </ul>
  );
}
