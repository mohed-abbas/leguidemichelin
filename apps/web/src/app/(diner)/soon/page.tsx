import Link from "next/link";

export default function SoonPage() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-md)",
        paddingBlock: "var(--space-2xl)",
        paddingInline: "var(--space-lg)",
        minHeight: "60vh",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: "var(--font-size-h2)",
          fontWeight: "var(--font-weight-regular)",
          color: "var(--color-ink)",
        }}
      >
        Bientôt disponible
      </h1>
      <p
        style={{
          margin: 0,
          fontSize: "var(--font-size-base)",
          color: "var(--color-ink-muted)",
        }}
      >
        Cette page arrive dans une prochaine version.
      </p>
      <Link
        href="/me"
        style={{
          marginTop: "var(--space-sm)",
          fontSize: "var(--font-size-base)",
          color: "var(--color-primary)",
          textDecoration: "none",
        }}
      >
        Retour au compte
      </Link>
    </section>
  );
}

export const metadata = { title: "Bientôt — Guide Foodie Journey" };
