"use client";

import Link from "next/link";

export interface MapPreviewProps {
  className?: string;
}

export function MapPreview(_props: MapPreviewProps) {
  return (
    <Link
      href="/map"
      aria-label="Ouvrir la carte"
      style={{
        display: "block",
        width: "100%",
        height: "200px",
        borderRadius: "var(--radius-lg)",
        background: "var(--color-surface-muted)",
        border: "1px dashed var(--color-border)",
        color: "var(--color-ink-muted)",
        textAlign: "center",
        lineHeight: "200px",
        textDecoration: "none",
      }}
    >
      Carte autour de moi — Tout voir
    </Link>
  );
}
