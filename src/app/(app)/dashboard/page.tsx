import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDashboardData } from "@/lib/soccer/sample-data";

export default function DashboardPage() {
  const data = getDashboardData();

  return <DashboardClient data={data} />;
}