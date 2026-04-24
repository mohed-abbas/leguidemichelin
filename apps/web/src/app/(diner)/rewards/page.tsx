import { getServerSession } from "@/lib/get-server-session";
import { serverApi } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { RewardsHeader } from "./_components/rewards-header";
import { RewardsList } from "./_components/rewards-list";
import type { RewardResponseType, MePointsResponseType } from "@repo/shared-schemas";

export default async function RewardsPage() {
  const session = await getServerSession();
  if (!session || session.user.role !== "DINER") {
    redirect("/login");
  }

  const [rewardsResult, pointsResult] = await Promise.allSettled([
    serverApi.get<{ items: RewardResponseType[] }>("/rewards"),
    serverApi.get<MePointsResponseType>("/me/points"),
  ]);

  const rewards = rewardsResult.status === "fulfilled" ? rewardsResult.value.items : [];
  const balance = pointsResult.status === "fulfilled" ? pointsResult.value.balance : 0;

  return (
    <div style={{ background: "var(--color-bg)", minHeight: "100dvh" }}>
      <RewardsHeader />
      <RewardsList rewards={rewards} initialBalance={balance} />
    </div>
  );
}

export const metadata = { title: "Récompenses — Guide Foodie Journey" };
