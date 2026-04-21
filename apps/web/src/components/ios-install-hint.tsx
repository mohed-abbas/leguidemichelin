"use client";

import { useEffect, useState } from "react";
import { Share, PlusSquare, X } from "lucide-react";
import { shouldShowIOSInstallHint } from "@/lib/pwa";

const DISMISS_KEY = "ios-install-hint-dismissed-at";
const DISMISS_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

/**
 * iOS "Add to Home Screen" hint banner.
 * UI-SPEC: built in Phase 1, NOT mounted until Phase 2 home page wiring.
 */
export function IOSInstallHint() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!shouldShowIOSInstallHint()) return;
    const raw = localStorage.getItem(DISMISS_KEY);
    if (raw) {
      const dismissedAt = Number(raw);
      if (Date.now() - dismissedAt < DISMISS_TTL_MS) return;
    }
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Installer Foodie Journey"
      style={{
        position: "fixed",
        left: "var(--space-md)",
        right: "var(--space-md)",
        bottom: "calc(env(safe-area-inset-bottom) + var(--space-md))",
        zIndex: "var(--z-install-hint)",
        background: "var(--color-surface)",
        color: "var(--color-ink)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-lg)",
        padding: "var(--space-md)",
        fontSize: "var(--font-size-sm)",
      }}
    >
      <button
        type="button"
        aria-label="Fermer"
        onClick={() => {
          localStorage.setItem(DISMISS_KEY, String(Date.now()));
          setVisible(false);
        }}
        style={{
          position: "absolute",
          top: "var(--space-sm)",
          right: "var(--space-sm)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--color-ink-muted)",
        }}
      >
        <X size={16} aria-hidden />
      </button>
      <p style={{ margin: 0, paddingRight: "var(--space-lg)" }}>
        Installez Foodie Journey sur votre écran d’accueil : appuyez sur{" "}
        <Share size={14} aria-hidden style={{ display: "inline", verticalAlign: "middle" }} />{" "}
        <strong>Partager</strong> puis{" "}
        <PlusSquare size={14} aria-hidden style={{ display: "inline", verticalAlign: "middle" }} />{" "}
        <strong>Sur l’écran d’accueil</strong>.
      </p>
    </div>
  );
}
