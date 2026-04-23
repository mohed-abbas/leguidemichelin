"use client";

/**
 * QrUpload — secondary tier of the /scan entry flow.
 *
 * `<input type="file" accept="image/jpeg,image/png" capture="environment">`
 * decoded via `qr-scanner`'s static `scanImage()`. On iOS installed PWAs
 * where `getUserMedia` silently fails (PITFALL #1), this path is the only
 * way a diner can complete a scan — always visible, never behind an
 * accordion (CONTEXT.md D-04: "all three fallback tiers visible at once").
 *
 * Why `image/jpeg,image/png` (not `image/*`):
 *   - D-05: HEIC doesn't route through this path — iOS HEICs cannot be
 *     decoded by the wasm QR engine reliably. The mint-photo upload path
 *     (Plan 04-03) accepts HEIC because sharp server-side normalises it.
 *     This path needs JPEG/PNG to parse.
 *
 * Why `capture="environment"`:
 *   - On mobile Safari + Chrome Android, this hint opens the rear camera
 *     picker directly instead of the full photo library. On desktop it's
 *     ignored, so the input still behaves as a standard file picker.
 *
 * Canonical refs:
 *   - .planning/phases/04-frontend-parallel-wave/04-CONTEXT.md D-04, D-05.
 *   - PITFALL #1 (iOS installed-PWA getUserMedia fallback).
 */

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import QrScanner from "qr-scanner";
import { extractRestaurantId } from "./scan-url";

export function QrUpload() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const result = await QrScanner.scanImage(file, {
        returnDetailedScanResult: true,
      });
      const id = extractRestaurantId(result.data);
      if (!id) {
        toast.error("QR non reconnu. Essayez une autre photo ou collez l'URL.");
        return;
      }
      router.push(`/scan/${id}`);
    } catch {
      // qr-scanner throws "No QR code found" when the decoder bails. We hide
      // the raw error from the user and surface the next-step copy.
      toast.error("Impossible de lire ce QR. Essayez une autre photo.");
    } finally {
      setBusy(false);
      // Reset the input so re-uploading the same file re-fires onChange.
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <label
      style={{
        display: "flex",
        gap: "var(--space-sm)",
        padding: "var(--space-md)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        cursor: busy ? "progress" : "pointer",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-surface)",
        color: "var(--color-ink)",
        fontSize: "var(--font-size-base)",
        opacity: busy ? 0.7 : 1,
      }}
    >
      <Upload size={18} aria-hidden />
      <span>{busy ? "Analyse en cours…" : "Envoyer une photo du QR"}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        capture="environment"
        hidden
        onChange={handleFile}
        disabled={busy}
      />
    </label>
  );
}
