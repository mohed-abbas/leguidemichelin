"use client";

/**
 * RecenterButton — fixed bottom-right control that re-requests geolocation
 * and calls `onRecenter(lng, lat)` on success.
 *
 * Accessibility: aria-label on the button covers screen-reader semantics.
 * The tooltip is omitted here because @base-ui/react's TooltipTrigger does
 * not support `asChild` — it uses a `render` prop API, and composing with
 * the shadcn Button variant would require an additional wrapper element.
 * The aria-label already satisfies the a11y requirement.
 *
 * On geolocation failure, fires a toast.error with French copy.
 *
 * Canonical refs:
 *   - 04-07-PLAN.md task 4
 *   - CLAUDE.md PITFALL #1 (iOS geolocation — called synchronously inside onClick)
 */

import { LocateFixed } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface RecenterButtonProps {
  onRecenter: (lng: number, lat: number) => void;
}

export function RecenterButton({ onRecenter }: RecenterButtonProps) {
  function handleClick() {
    if (!navigator.geolocation) {
      toast.error("Géolocalisation non disponible sur cet appareil.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onRecenter(pos.coords.longitude, pos.coords.latitude);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          toast.error("Autorisez la géolocalisation dans les réglages du navigateur.");
        } else if (err.code === err.TIMEOUT) {
          toast.error("Géolocalisation trop lente. Réessayez.");
        } else {
          toast.error("Impossible de vous localiser.");
        }
      },
      { timeout: 3000 },
    );
  }

  return (
    <Button
      aria-label="Recentrer sur ma position"
      title="Recentrer sur ma position"
      size="icon"
      onClick={handleClick}
      style={{
        position: "absolute",
        bottom: "calc(var(--space-md) + env(safe-area-inset-bottom, 0px))",
        right: "var(--space-md)",
        zIndex: 2,
        width: "var(--touch-target-min)",
        height: "var(--touch-target-min)",
        borderRadius: "var(--radius-full)",
        background: "var(--color-surface)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
      }}
    >
      <LocateFixed size={20} color="var(--color-primary)" aria-hidden="true" />
    </Button>
  );
}
