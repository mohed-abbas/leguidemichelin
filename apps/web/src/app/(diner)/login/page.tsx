import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-server-session";
import { LoginChooserClient } from "./LoginChooserClient";

export default async function LoginChooserPage() {
  const session = await getServerSession();
  if (session) redirect("/");
  return <LoginChooserClient />;
}
