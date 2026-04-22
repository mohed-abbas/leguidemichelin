import { Skeleton } from "@/components/ui/skeleton";

export default function CollectionStubPage() {
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
        Ma collection
      </h1>
      <p
        style={{
          margin: 0,
          color: "var(--color-ink-muted)",
          fontSize: "var(--font-size-sm)",
        }}
      >
        Disponible en Phase 4.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "var(--space-sm)",
        }}
      >
        <Skeleton style={{ aspectRatio: "1 / 1", borderRadius: "var(--radius-md)" }} />
        <Skeleton style={{ aspectRatio: "1 / 1", borderRadius: "var(--radius-md)" }} />
        <Skeleton style={{ aspectRatio: "1 / 1", borderRadius: "var(--radius-md)" }} />
        <Skeleton style={{ aspectRatio: "1 / 1", borderRadius: "var(--radius-md)" }} />
      </div>
    </section>
  );
}
