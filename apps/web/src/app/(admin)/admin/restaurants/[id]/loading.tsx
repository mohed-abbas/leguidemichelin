import { Skeleton } from "@/components/ui/skeleton";

export default function RestaurantMenuLoading() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-lg)",
      }}
    >
      <Skeleton style={{ height: "16px", width: "120px" }} />
      <Skeleton style={{ height: "120px" }} />
      <Skeleton style={{ height: "32px", width: "180px" }} />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} style={{ height: "72px" }} />
      ))}
    </section>
  );
}
