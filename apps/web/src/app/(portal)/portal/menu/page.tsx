import { getServerSession } from "@/lib/get-server-session";
import { serverApi } from "@/lib/server-api";
import { DishList } from "./_components/dish-list";
import { redirect } from "next/navigation";
import type { DishResponseType } from "@repo/shared-schemas";

export default async function PortalMenuPage() {
  const session = await getServerSession();
  if (!session || session.user.role !== "RESTAURANT_STAFF") {
    redirect("/portal/login");
  }

  let dishes: DishResponseType[] = [];
  try {
    const data = await serverApi.get<{ items: DishResponseType[] }>("/portal/dishes");
    dishes = data.items;
  } catch {
    // Empty list on error — DishList shows empty state
  }

  return <DishList initialDishes={dishes} />;
}
