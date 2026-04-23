"use client";

/**
 * MapCanvas — full Mapbox GL canvas for the diner /map surface.
 *
 * Responsibilities:
 *  - Geolocation on mount (3s timeout, silent Paris fallback) — D-18
 *  - Clustered GeoJSON source (cluster:true, clusterMaxZoom:14, clusterRadius:50) — D-19
 *  - Visited vs un-visited symbol layer via pin-visited / pin-unvisited images — D-19/D-21
 *  - MoveEnd fetches GET /api/restaurants?bbox=... debounced 300ms — D-20
 *  - Bbox results cached in useMapStore via quantizeBbox keys — D-20
 *  - visitedSet hydrates once on mount when visitedDirty — D-21
 *  - Pin click opens RestaurantPopover; cluster click eases in — D-22
 *  - Missing NEXT_PUBLIC_MAPBOX_TOKEN → dev fallback card (no silent grey tiles)
 *
 * Canonical refs:
 *   - 04-07-PLAN.md task 2
 *   - 04-CONTEXT.md D-17 through D-22
 *   - CLAUDE.md PITFALL #1 (iOS), #5 (SW), #8 (Mapbox pk. token)
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, { type MapRef, Source, Layer, Popup } from "react-map-gl/mapbox";
import type { MapMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { api } from "@/lib/api";
import { useMapStore, quantizeBbox } from "../_stores/useMapStore";
import type { RestaurantResponseType } from "@repo/shared-schemas";
import { RestaurantPopover } from "./RestaurantPin";
import { RecenterButton } from "./RecenterButton";

// ─── Types ─────────────────────────────────────────────────────────────────

interface PopupState {
  lng: number;
  lat: number;
  restaurant: RestaurantResponseType;
}

// ─── Token-missing fallback (pure presentational, no hooks) ────────────────

function MissingTokenCard() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "grid",
        placeItems: "center",
        background: "var(--color-surface-muted)",
        padding: "var(--space-lg)",
      }}
    >
      <p
        style={{
          color: "var(--color-ink-muted)",
          textAlign: "center",
          fontSize: "var(--font-size-sm)",
        }}
      >
        Mapbox non configuré. Définissez <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> dans{" "}
        <code>apps/web/.env.local</code>.
      </p>
    </div>
  );
}

// ─── MapCanvas ─────────────────────────────────────────────────────────────

export function MapCanvas() {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  // ── Refs ─────────────────────────────────────────────────────────────────
  const mapRef = useRef<MapRef>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── State ─────────────────────────────────────────────────────────────────
  const [pins, setPins] = useState<RestaurantResponseType[]>([]);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [center, setCenter] = useState<{ lng: number; lat: number; zoom: number }>({
    lng: 2.3522,
    lat: 48.8566,
    zoom: 11,
  });
  // Cluster circle color read from CSS token once on mount — Mapbox paint
  // objects are plain JS data; they do not resolve CSS custom properties.
  // Initialize to empty string; the useEffect resolves the token before any
  // clusters appear (clusters require panning to low zoom).
  const [clusterColor, setClusterColor] = useState<string>("");

  // ── Store hooks ───────────────────────────────────────────────────────────
  const visitedSet = useMapStore((s) => s.visitedSet);
  const visitedDirty = useMapStore((s) => s.visitedDirty);

  // ── Mount effects ─────────────────────────────────────────────────────────

  // 1. Resolve cluster color from CSS token.
  useEffect(() => {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--color-primary").trim();
    if (v) setClusterColor(v);
  }, []);

  // 2. Hydrate visitedSet when dirty.
  useEffect(() => {
    if (visitedDirty) {
      useMapStore
        .getState()
        .refreshVisited()
        .catch(() => {
          // Swallow — map renders with un-visited pins if the session call fails
        });
    }
  }, [visitedDirty]);

  // 3. Geolocation (3s timeout, silent Paris fallback per D-18).
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        setCenter({ lng: longitude, lat: latitude, zoom: 13 });
        // Re-center map if already loaded.
        mapRef.current?.easeTo({ center: [longitude, latitude], zoom: 13, duration: 800 });
      },
      () => {
        // Error / denied / timeout — keep Paris default. No modal per D-18.
      },
      { timeout: 3000, maximumAge: 60_000 },
    );
  }, []);

  // ── Layer configs ─────────────────────────────────────────────────────────
  // The "#ffffff" literals below are Mapbox GL paint values — not component
  // style literals. They live in plain JS objects consumed by the GL engine
  // which has no CSS-var-resolving context. The hex-guard eslint-disable
  // is scoped to the single offending line.

  const CLUSTER_LAYER = useMemo(
    () => ({
      id: "clusters",
      type: "circle" as const,
      filter: ["has", "point_count"],
      paint: {
        "circle-color": clusterColor,
        "circle-radius": ["step", ["get", "point_count"], 20, 10, 30, 50, 40] as unknown as number,
        // eslint-disable-next-line no-restricted-syntax -- Mapbox paint expects color literals; GL has no CSS-var context
        "circle-stroke-color": "#ffffff",
        "circle-stroke-width": 2,
      },
    }),
    [clusterColor],
  );

  const CLUSTER_COUNT_LAYER = useMemo(
    () => ({
      id: "cluster-count",
      type: "symbol" as const,
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"] as unknown as string,
        "text-size": 14,
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
      id: "unclustered-pin",
      type: "symbol" as const,
      filter: ["!", ["has", "point_count"]],
      layout: {
        "icon-image": [
          "case",
          ["get", "visited"],
          "pin-visited",
          "pin-unvisited",
        ] as unknown as string,
        "icon-size": 0.6,
        "icon-allow-overlap": true,
      },
    }),
    [],
  );

  // ── Register pin images on map load ───────────────────────────────────────
  const onLoad = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    (["visited", "unvisited"] as const).forEach((variant) => {
      const img = new Image(48, 48);
      img.onload = () => {
        if (!map.hasImage(`pin-${variant}`)) {
          map.addImage(`pin-${variant}`, img);
          // Force a repaint so symbol layers referencing the just-registered
          // image render on the next frame — avoids a blank-square flash when
          // the bbox fetch resolves before the SVG finishes decoding.
          map.triggerRepaint();
        }
      };
      img.src = `/pins/${variant}.svg`; // static assets from 04-01
    });
  }, []);

  // ── MoveEnd with 300ms debounce ───────────────────────────────────────────
  const onMoveEnd = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
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
        const result = await api.get<{ items: RestaurantResponseType[] }>(
          `/restaurants?bbox=${key}`,
        );
        useMapStore.getState().putBbox(key, result.items);
        setPins(result.items);
      } catch {
        // Swallow — keep current pins on network error
      }
    }, 300);
  }, []);

  // ── Click handler ─────────────────────────────────────────────────────────
  const handleClick = useCallback(
    (e: MapMouseEvent) => {
      const features = e.features;
      if (!features || features.length === 0) return;
      const feature = features[0];
      if (!feature) return;

      if (feature.layer?.id === "clusters") {
        const map = mapRef.current?.getMap();
        if (!map) return;
        const currentZoom = map.getZoom();
        map.easeTo({ center: [e.lngLat.lng, e.lngLat.lat], zoom: currentZoom + 2, duration: 500 });
        return;
      }

      if (feature.layer?.id === "unclustered-pin") {
        const id = feature.properties?.id as string | undefined;
        if (!id) return;
        const restaurant = pins.find((r) => r.id === id);
        if (!restaurant) return;
        setPopup({ lng: e.lngLat.lng, lat: e.lngLat.lat, restaurant });
      }
    },
    [pins],
  );

  // ── GeoJSON source (memoized) ─────────────────────────────────────────────
  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: pins.map((r) => ({
        type: "Feature" as const,
        id: r.id,
        properties: { id: r.id, visited: visitedSet.has(r.id) },
        geometry: { type: "Point" as const, coordinates: [r.lng, r.lat] },
      })),
    }),
    [pins, visitedSet],
  );

  // ── Token guard (after all hooks — rules of hooks) ────────────────────────
  if (!token) {
    return <MissingTokenCard />;
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={token}
      initialViewState={{ longitude: center.lng, latitude: center.lat, zoom: center.zoom }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      onLoad={onLoad}
      onMoveEnd={onMoveEnd}
      interactiveLayerIds={["clusters", "unclustered-pin"]}
      onClick={handleClick}
      style={{ width: "100%", height: "100%" }}
    >
      <Source
        id="restos"
        type="geojson"
        data={geojson}
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={50}
      >
        <Layer {...CLUSTER_LAYER} />
        <Layer {...CLUSTER_COUNT_LAYER} />
        <Layer {...PIN_LAYER} />
      </Source>

      {popup && (
        <Popup
          longitude={popup.lng}
          latitude={popup.lat}
          onClose={() => setPopup(null)}
          closeOnClick={false}
          anchor="bottom"
        >
          <RestaurantPopover
            restaurant={popup.restaurant}
            visited={visitedSet.has(popup.restaurant.id)}
          />
        </Popup>
      )}

      <RecenterButton
        onRecenter={(lng, lat) =>
          mapRef.current?.easeTo({ center: [lng, lat], zoom: 13, duration: 800 })
        }
      />
    </Map>
  );
}
