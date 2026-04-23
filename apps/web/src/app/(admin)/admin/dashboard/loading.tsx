import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
      }}
    >
      <Skeleton style={{ height: "32px", width: "240px" }} />
      <div
        style={{
          display: "grid",
          gap: "var(--space-md)",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        }}
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} style={{ height: "120px" }} />
        ))}
      </div>
      <Skeleton style={{ height: "60px" }} />
    </section>
  );
}
