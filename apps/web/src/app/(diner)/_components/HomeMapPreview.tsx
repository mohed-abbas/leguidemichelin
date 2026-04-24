"use client";

/**
 * HomeMapPreview — real Mapbox GL preview for the diner home (/accueil).
 *
 * Behavior:
 *  - Geolocation on mount (3s timeout, silent Paris fallback) — matches MapCanvas D-18.
 *  - Pan + zoom enabled so the user can look around without leaving home.
 *  - User-location marker (blue dot) always pinned at the latest known position.
 *  - Restaurant pins fetched via bbox (cached through useMapStore) and rendered
 *    with the same clustered Source + Layer setup as MapCanvas, so the preview
 *    mirrors the full /map surface visually. Tap behaviour is intentionally
 *    omitted — the parent "Tout Voir" link routes to /map for interaction.
 *  - Missing NEXT_PUBLIC_MAPBOX_TOKEN → muted fallback card (no broken state).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, Source, Layer, type MapRef } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import { api } from "@/lib/api";
import { useMapStore, quantizeBbox } from "../_stores/useMapStore";
import type { RestaurantResponseType } from "@repo/shared-schemas";
import { emblemFromRating } from "../map/_components/PinScoreBadge";

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
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [userPos, setUserPos] = useState<{ lng: number; lat: number }>({
    lng: 2.3522,
    lat: 48.8566,
  });
  const [clusterColor, setClusterColor] = useState<string>("");
  const pins = useMapStore((s) => s.pins);
  const setPins = useMapStore((s) => s.setPins);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        setUserPos({ lng: longitude, lat: latitude });
        mapRef.current?.easeTo({ center: [longitude, latitude], zoom: 12, duration: 600 });
      },
      () => {
        // denied / timeout — keep Paris fallback
      },
      { timeout: 3000, maximumAge: 60_000 },
    );
  }, []);

  useEffect(() => {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim();
    if (v) setClusterColor(v);
  }, []);

  const fetchPinsForCurrentBbox = useCallback(async () => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const b = map.getBounds();
    if (!b) return;
    const key = quantizeBbox([b.getWest(), b.getSouth(), b.getEast(), b.getNorth()]);
    const cached = useMapStore.getState().getBbox(key);
    if (cached) {
      setPins(cached);
      return;
    }
    try {
      const result = await api.get<{ items: RestaurantResponseType[] }>(`/restaurants?bbox=${key}`);
      useMapStore.getState().putBbox(key, result.items);
      setPins(result.items);
    } catch {
      // Swallow — keep current pins on network error
    }
  }, [setPins]);

  const onLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    const variants = ["bib", "starred", "recommended"] as const;
    variants.forEach((variant) => {
      const img = new Image(63, 74);
      img.onload = () => {
        if (!map.hasImage(`pin-${variant}`)) {
          map.addImage(`pin-${variant}`, img);
          map.triggerRepaint();
        }
      };
      img.src = `/pins/pin-${variant}.svg`;
    });
    fetchPinsForCurrentBbox();
  }, [fetchPinsForCurrentBbox]);

  const onMoveEnd = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchPinsForCurrentBbox, 300);
  }, [fetchPinsForCurrentBbox]);

  const CLUSTER_LAYER = useMemo(
    () => ({
      id: "home-clusters",
      type: "circle" as const,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": clusterColor,
        "circle-radius": ["step", ["get", "point_count"], 16, 10, 22, 50, 28] as unknown as number,
        // eslint-disable-next-line no-restricted-syntax -- Mapbox paint expects color literals; GL has no CSS-var context
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2,
      },
    }),
    [clusterColor],
  );

  const CLUSTER_COUNT_LAYER = useMemo(
    () => ({
      id: "home-cluster-count",
      type: "symbol" as const,
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"] as unknown as string,
        "text-size": 12,
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
      },
      paint: {
        // eslint-disable-next-line no-restricted-syntax -- Mapbox paint expects color literals; GL has no CSS-var context
        "text-color": "#ffffff",
      },
    }),
    [],
  );

  const PIN_LAYER = useMemo(
    () => ({
      id: "home-unclustered-pin",
      type: "symbol" as const,
      filter: ["!", ["has", "point_count"]],
      layout: {
        "icon-image": [
          "case",
          ["==", ["get", "variant"], "bib"],
          "pin-bib",
          ["==", ["get", "variant"], "flower"],
          "pin-starred",
          "pin-recommended",
        ] as unknown as string,
        "icon-size": 0.45,
        "icon-allow-overlap": true,
        "icon-anchor": "bottom" as const,
      },
    }),
    [],
  );

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: pins.map((r) => ({
        type: "Feature" as const,
        id: r.id,
        properties: {
          id: r.id,
          variant: emblemFromRating(r.michelinRating),
        },
        geometry: { type: "Point" as const, coordinates: [r.lng, r.lat] },
      })),
    }),
    [pins],
  );

  if (!token) return <MissingTokenCard />;

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={token}
      initialViewState={{ longitude: userPos.lng, latitude: userPos.lat, zoom: 12 }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      attributionControl={false}
      onLoad={onLoad}
      onMoveEnd={onMoveEnd}
      style={{ width: "100%", height: "100%" }}
    >
      <Source
        id="home-restos"
        type="geojson"
        data={geojson}
        cluster={true}
        clusterMaxZoom={9}
        clusterRadius={50}
      >
        <Layer {...CLUSTER_LAYER} />
        <Layer {...CLUSTER_COUNT_LAYER} />
        <Layer {...PIN_LAYER} />
      </Source>

      <Marker longitude={userPos.lng} latitude={userPos.lat} anchor="center">
        <UserDot />
      </Marker>
    </Map>
  );
}
