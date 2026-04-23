import { getServerSession } from "@/lib/get-server-session";
import { api } from "@/lib/api";
import { redirect } from "next/navigation";
import { RewardsList } from "./_components/rewards-list";
import type { RewardResponseType, MePointsResponseType } from "@repo/shared-schemas";

export default async function RewardsPage() {
  const session = await getServerSession();
  if (!session || session.user.role !== "DINER") {
    redirect("/login");
  }

  const [rewardsResult, pointsResult] = await Promise.allSettled([
    api.get<RewardResponseType[]>("/rewards"),
    api.get<MePointsResponseType>("/me/points"),
  ]);

  const rewards = rewardsResult.status === "fulfilled" ? rewardsResult.value : [];
  const balance = pointsResult.status === "fulfilled" ? pointsResult.value.balance : 0;

  return (
    <section style={{ display: "flex", flexDirection: "column", gap: "var(--space-lg)" }}>
      <h1
        style={{
          fontSize: "var(--font-size-xl)",
          fontWeight: "var(--font-weight-semibold)",
          margin: 0,
        }}
      >
        Récompenses
      </h1>
      <RewardsList rewards={rewards} initialBalance={balance} />
    </section>
  );
}
