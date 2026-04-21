export default function PortalLandingPage() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-xl)",
        maxWidth: "640px",
      }}
    >
      <h1
        style={{
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-semibold)",
          lineHeight: "var(--line-height-xl)",
          margin: 0,
        }}
      >
        Portail restaurateur
      </h1>
      <p
        style={{
          fontSize: "var(--font-size-base)",
          color: "var(--color-ink-muted)",
          margin: 0,
        }}
      >
        Connexion disponible prochainement.
      </p>
    </section>
  );
}
