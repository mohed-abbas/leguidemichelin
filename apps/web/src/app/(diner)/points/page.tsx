import { Skeleton } from "@/components/ui/skeleton";

export default function PointsStubPage() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        padding: "var(--space-lg) 0",
      }}
    >
      <h1
        style={{
          fontSize: "var(--font-size-lg)",
          fontWeight: "var(--font-weight-semibold)",
          margin: 0,
        }}
      >
        Mes points
      </h1>
      <p
        style={{
          margin: 0,
          color: "var(--color-ink-muted)",
          fontSize: "var(--font-size-sm)",
        }}
      >
        Disponible en Phase 5.
      </p>
      <Skeleton style={{ height: "64px", borderRadius: "var(--radius-md)" }} />
      <Skeleton style={{ height: "48px", borderRadius: "var(--radius-md)" }} />
      <Skeleton style={{ height: "48px", borderRadius: "var(--radius-md)" }} />
    </section>
  );
}
