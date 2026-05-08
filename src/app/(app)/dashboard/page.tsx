import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDashboardData } from "@/lib/soccer/sample-data";
import { fetchTopMemes } from "@/lib/soccer/meme-fetcher";
import { fetchNewsFeed } from "@/lib/soccer/news-fetcher";
import { fetchMatchMarkets } from "@/lib/soccer/match-markets-fetcher";
import { fetchTransferRumors } from "@/lib/soccer/transfer-fetcher";
import { fetchPredictionMarkets } from "@/lib/soccer/polymarket-fetcher";

export default async function DashboardPage() {
  const runId = `pre-fix-${Date.now()}`;
  const [data, memesData, newsData, matchData, transferData, predictionData] = await Promise.all([
    Promise.resolve(getDashboardData()),
    fetchTopMemes(10),
    fetchNewsFeed(14),
    fetchMatchMarkets(8),
    fetchTransferRumors(),
    fetchPredictionMarkets(),
  ]);

  const liveData = {
    ...data,
    signals: [...matchData.matchMovers, ...transferData.transferMovers],
    matchMovers: matchData.matchMovers,
    transferMovers: transferData.transferMovers,
    predictionMarkets: predictionData.predictionMarkets,
    news: newsData.news,
  };

  // #region agent log
  fetch("http://127.0.0.1:7395/ingest/224fc749-6bae-4e3a-8df7-85eee278d16f", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "d4b56d",
    },
    body: JSON.stringify({
      sessionId: "d4b56d",
      runId,
      hypothesisId: "H1",
      location: "dashboard/page.tsx:30",
      message: "server live data snapshot",
      data: {
        signalCount: liveData.signals.length,
        topSignals: liveData.signals.slice(0, 3).map((signal) => ({
          id: signal.id,
          summary: signal.summary,
        })),
        transferFetchedAt: transferData.fetchedAt,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return (
    <DashboardClient
      data={liveData}
      memesData={memesData}
      dataSource={{
        transfers: transferData.source,
        predictions: predictionData.source,
        memes: memesData.source,
        news: newsData.source,
        matches: matchData.source,
      }}
    />
  );
}