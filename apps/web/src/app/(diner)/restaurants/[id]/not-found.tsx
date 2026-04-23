import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function RestaurantNotFound() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-lg)",
        padding: "var(--space-xl) 0",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-semibold)",
          margin: 0,
        }}
      >
        Ce restaurant est momentanément indisponible.
      </h1>
      <Link href="/restaurants">
        <Button type="button" variant="outline">
          Retour aux restaurants
        </Button>
      </Link>
    </section>
  );
}
