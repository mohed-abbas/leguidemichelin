"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";

interface QrRendererProps {
  url: string;
  size?: number;
}

export function QrRenderer({ url, size = 300 }: QrRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    QRCode.toCanvas(canvas, url, { width: size, margin: 2 }, (err) => {
      if (err) setError(true);
    });
  }, [url, size]);

  if (error) {
    return <p style={{ color: "var(--color-destructive)" }}>Erreur de génération du QR code.</p>;
  }

  return (
    <canvas
      ref={canvasRef}
      aria-label={`QR code pour ${url}`}
      style={{ borderRadius: "var(--radius-md)" }}
    />
  );
}
