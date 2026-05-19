import { redirect } from "next/navigation";
import { getManagerSession } from "@/lib/manager-auth";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const managerSession = await getManagerSession();

  if (!managerSession) {
    redirect("/login");
  }

  return <DashboardClient />;
}
