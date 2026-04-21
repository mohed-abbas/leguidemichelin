export default function DinerHomePage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-md)",
        padding: "var(--space-xl) var(--space-md)",
        background: "var(--color-surface)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        margin: "var(--space-xl) 0",
      }}
    >
      <h1
        style={{
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-semibold)",
          lineHeight: "var(--line-height-xl)",
          textAlign: "center",
          margin: 0,
        }}
      >
        Guide Foodie Journey
      </h1>
      <p
        style={{
          fontSize: "var(--font-size-base)",
          color: "var(--color-ink-muted)",
          textAlign: "center",
          margin: 0,
        }}
      >
        La plateforme arrive bientôt.
      </p>
    </div>
  );
}
