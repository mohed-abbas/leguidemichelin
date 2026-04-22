import { Skeleton } from "@/components/ui/skeleton";

export default function PortalQrStubPage() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-md)",
        maxWidth: "480px",
      }}
    >
      <h1
        style={{
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-semibold)",
          margin: 0,
        }}
      >
        QR Code
      </h1>
      <p
        style={{
          margin: 0,
          color: "var(--color-ink-muted)",
          fontSize: "var(--font-size-sm)",
        }}
      >
        Disponible en Phase 3.
      </p>
      <Skeleton
        style={{
          width: "240px",
          height: "240px",
          borderRadius: "var(--radius-md)",
        }}
      />
    </section>
  );
}
