import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function RestaurantNotFound() {
  return (
    <section
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-xl)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        alignItems: "flex-start",
      }}
    >
      <h1
        style={{
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-semibold)",
          margin: 0,
        }}
      >
        Restaurant introuvable
      </h1>
      <p style={{ margin: 0, color: "var(--color-ink-muted)" }}>
        Cet identifiant ne correspond à aucun restaurant connu.
      </p>
      <Link
        href="/admin/restaurants"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "var(--space-xs)",
          color: "var(--color-ink)",
          textDecoration: "underline",
        }}
      >
        <ArrowLeft size={14} aria-hidden /> Retour à la liste
      </Link>
    </section>
  );
}
