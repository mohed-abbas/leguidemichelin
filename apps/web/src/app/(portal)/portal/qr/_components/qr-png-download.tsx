"use client";

import { useState } from "react";
import QRCode from "qrcode";
import { Download, FileImage } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QrPngDownloadProps {
  url: string;
  slug: string;
}

export function QrPngDownload({ url, slug }: QrPngDownloadProps) {
  const [loading, setLoading] = useState<"png" | "svg" | null>(null);

  async function handlePng() {
    setLoading("png");
    try {
      const canvas = document.createElement("canvas");
      // 600px → ~6cm at 254dpi
      await new Promise<void>((resolve, reject) => {
        QRCode.toCanvas(canvas, url, { width: 600, margin: 2 }, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("canvas.toBlob returned null");
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `qr-${slug}.png`;
      a.click();
      URL.revokeObjectURL(href);
    } finally {
      setLoading(null);
    }
  }

  async function handleSvg() {
    setLoading("svg");
    try {
      const svg = await QRCode.toString(url, { type: "svg", margin: 2 });
      const blob = new Blob([svg], { type: "image/svg+xml" });
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `qr-${slug}.svg`;
      a.click();
      URL.revokeObjectURL(href);
    } finally {
      setLoading(null);
    }
  }

  return (
    <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap" }}>
      <Button type="button" onClick={handlePng} disabled={loading !== null}>
        <Download size={14} aria-hidden style={{ marginRight: "var(--space-xs)" }} />
        {loading === "png" ? "Préparation…" : "PNG (6×6 cm)"}
      </Button>
      <Button type="button" onClick={handleSvg} disabled={loading !== null} variant="outline">
        <FileImage size={14} aria-hidden style={{ marginRight: "var(--space-xs)" }} />
        {loading === "svg" ? "Préparation…" : "SVG"}
      </Button>
    </div>
  );
}
