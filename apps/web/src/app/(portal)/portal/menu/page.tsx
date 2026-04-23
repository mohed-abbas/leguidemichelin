import { getServerSession } from "@/lib/get-server-session";
import { api } from "@/lib/api";
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
    dishes = await api.get<DishResponseType[]>("/portal/dishes");
  } catch {
    // Empty list on error — DishList shows empty state
  }

  return <DishList initialDishes={dishes} />;
}
