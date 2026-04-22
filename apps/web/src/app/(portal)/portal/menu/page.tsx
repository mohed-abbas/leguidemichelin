import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Phase 3 replaces this with a real API fetch (WILSON-TASKS.md Phase 3).
const dishes = [
  { id: "1", name: "Duck à l'orange", priceCents: 4800 },
  { id: "2", name: "Bouillabaisse", priceCents: 3600 },
];

function formatPriceEUR(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export default function PortalMenuPage() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
      }}
    >
      <header
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <h1
          style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-semibold)",
            margin: 0,
          }}
        >
          Menu
        </h1>
        <Button type="button" disabled>
          Ajouter un plat (Phase 3)
        </Button>
      </header>
      <div style={{ display: "grid", gap: "var(--space-md)" }}>
        {dishes.map((d) => (
          <Card key={d.id}>
            <CardHeader>
              <CardTitle>{d.name}</CardTitle>
            </CardHeader>
            <CardContent
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ color: "var(--color-ink-muted)" }}>
                {formatPriceEUR(d.priceCents)}
              </span>
              <div style={{ display: "flex", gap: "var(--space-xs)" }}>
                <Button type="button" variant="outline" disabled>
                  Modifier
                </Button>
                <Button type="button" variant="outline" disabled>
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
