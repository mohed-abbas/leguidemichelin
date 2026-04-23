import { getServerSession } from "@/lib/get-server-session";
import { serverApi } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { RedemptionRow } from "./_components/redemption-row";
import type { RedemptionResponseType } from "@repo/shared-schemas";

export default async function RedemptionsPage() {
  const session = await getServerSession();
  if (!session || session.user.role !== "DINER") {
    redirect("/login");
  }

  let redemptions: RedemptionResponseType[] = [];
  try {
    const data = await serverApi.get<{ items: RedemptionResponseType[] }>("/me/redemptions");
    // Ensure newest first
    redemptions = [...data.items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch {
    // handled below
  }

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
      <h1
        style={{
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-semibold)",
          margin: 0,
        }}
      >
        Mes récompenses utilisées
      </h1>

      {redemptions.length === 0 ? (
        <p style={{ color: "var(--color-ink-muted)", margin: 0 }}>
          Aucune récompense utilisée pour le moment.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          {redemptions.map((r) => (
            <RedemptionRow key={r.id} redemption={r} />
          ))}
        </div>
      )}

      <footer
        style={{
          marginTop: "var(--space-md)",
          padding: "var(--space-md)",
          background: "var(--color-surface-muted)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          fontSize: "var(--font-size-sm)",
          color: "var(--color-ink-muted)",
          textAlign: "center",
        }}
      >
        Démo uniquement — codes non utilisables chez de vrais restaurants.
      </footer>
    </section>
  );
}
