"use client";

/**
 * HomeMapPreview — real Mapbox GL preview for the diner home (/accueil).
 *
 * Behavior:
 *  - Geolocation on mount (3s timeout, silent Paris fallback) — matches MapCanvas D-18.
 *  - Pan + zoom enabled so the user can look around without leaving home.
 *  - User-location marker (blue dot) always pinned at the latest known position.
 *  - Navigation to full /map canvas is via the "Tout Voir" link in the parent section.
 *  - No pin fetching yet — restaurant pins land with /map polish.
 *  - Missing NEXT_PUBLIC_MAPBOX_TOKEN → muted fallback card (no broken state).
 */

import { useEffect, useRef, useState } from "react";
import Map, { Marker, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";

function MissingTokenCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        background: "var(--color-surface-muted)",
        padding: "var(--space-md)",
      }}
    >
      <p
        style={{
          color: "var(--color-ink-muted)",
          textAlign: "center",
          fontSize: "var(--font-size-sm)",
        }}
      >
        Mapbox non configuré.
      </p>
    </div>
  );
}

function UserDot() {
  return (
    <span
      aria-label="Votre position"
      style={{
        display: "block",
        width: "22px",
        height: "22px",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
    >
      <img
        src="/images/accueil/map/user-dot.svg"
        alt=""
        width={22}
        height={22}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </span>
  );
}

export function HomeMapPreview() {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  const mapRef = useRef<MapRef>(null);
  const [userPos, setUserPos] = useState<{ lng: number; lat: number }>({
    lng: 2.3522,
    lat: 48.8566,
  });

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        setUserPos({ lng: longitude, lat: latitude });
        mapRef.current?.easeTo({ center: [longitude, latitude], zoom: 14, duration: 600 });
      },
      () => {
        // denied / timeout — keep Paris fallback
      },
      { timeout: 3000, maximumAge: 60_000 },
    );
  }, []);

  if (!token) return <MissingTokenCard />;

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={token}
      initialViewState={{ longitude: userPos.lng, latitude: userPos.lat, zoom: 13 }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      attributionControl={false}
      style={{ width: "100%", height: "100%" }}
    >
      <Marker longitude={userPos.lng} latitude={userPos.lat} anchor="center">
        <UserDot />
      </Marker>
    </Map>
  );
}
