"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-lg)",
      }}
    >
      <h2 style={{ margin: 0 }}>Impossible de charger les statistiques.</h2>
      <p style={{ color: "var(--color-ink-muted)", margin: 0 }}>
        Vérifiez votre connexion et réessayez.
      </p>
      <div>
        <Button onClick={reset} type="button">
          Réessayer
        </Button>
      </div>
    </section>
  );
}
