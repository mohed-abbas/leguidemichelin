"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";

interface QrPngDownloadProps {
  url: string;
  slug: string;
}

export function QrPngDownload({ url, slug }: QrPngDownloadProps) {
  const [loading, setLoading] = useState(false);

  async function handlePng() {
    setLoading(true);
    try {
      const canvas = document.createElement("canvas");
      // 600px → ~6cm at 254dpi
      await new Promise<void>((resolve, reject) => {
        QRCode.toCanvas(canvas, url, { width: 600, margin: 2 }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `qr-${slug}.png`;
        a.click();
        URL.revokeObjectURL(a.href);
      }, "image/png");
    } finally {
      setLoading(false);
    }
  }

  async function handleSvg() {
    setLoading(true);
    try {
      const svg = await QRCode.toString(url, { type: "svg", margin: 2 });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `qr-${slug}.svg`;
      a.click();
      URL.revokeObjectURL(a.href);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap" }}>
      <Button type="button" onClick={handlePng} disabled={loading} variant="outline">
        Télécharger PNG (6×6 cm)
      </Button>
      <Button type="button" onClick={handleSvg} disabled={loading} variant="outline">
        Télécharger SVG
      </Button>
    </div>
  );
}
