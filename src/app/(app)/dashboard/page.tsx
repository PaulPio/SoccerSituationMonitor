import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDashboardData } from "@/lib/soccer/sample-data";
import { fetchTopMemes } from "@/lib/soccer/meme-fetcher";

export default async function DashboardPage() {
  const data = getDashboardData();
  const memesData = await fetchTopMemes(10);

  return <DashboardClient data={data} memesData={memesData} />;
}