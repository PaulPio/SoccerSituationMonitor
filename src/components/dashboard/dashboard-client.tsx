"use client";

import { useEffect, useMemo, useState } from "react";
import type { DashboardData, MarketMover } from "@/lib/soccer/types";
import type { MemesData } from "@/lib/soccer/meme-types";
import { filterSignals, getTopSignals, type DashboardFilters } from "@/lib/soccer/filters";
import { AlertList } from "./alert-list";
import { DashboardControls } from "./dashboard-controls";
import { DetailPanel } from "./detail-panel";
import { SoccerMap } from "./soccer-map";
import { MarketSections } from "./market-sections";
import { MemesSection } from "./memes-section";
import { NewsFeed } from "./news-feed";
import { PredictionMarkets } from "./prediction-markets";
import { SortableWidgets } from "./sortable-widgets";

type DataSource = {
  transfers: "reddit" | "mixed" | "sample";
  predictions: "polymarket" | "sample";
  memes: "reddit" | "sample";
  news: "reddit" | "newsapi" | "mixed" | "sample";
  matches: "football_data" | "odds_api" | "mixed" | "sample";
};

type Props = {
  data: DashboardData;
  memesData: MemesData;
  dataSource?: DataSource;
};

export function DashboardClient({ data, memesData, dataSource }: Props) {
  const [filters, setFilters] = useState<DashboardFilters>({
    league: "all",
    marketType: "all",
    severity: "all",
    watchlist: "all",
  });
  const [selectedSignal, setSelectedSignal] = useState<MarketMover | null>(data.signals[0] ?? null);

  const filteredSignals = useMemo(() => filterSignals(data.signals, filters), [data.signals, filters]);
  const topSignals = useMemo(() => getTopSignals(filteredSignals, 8), [filteredSignals]);

  // #region agent log
  useEffect(() => {
    fetch("http://127.0.0.1:7395/ingest/224fc749-6bae-4e3a-8df7-85eee278d16f", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "d4b56d",
      },
      body: JSON.stringify({
        sessionId: "d4b56d",
        runId: `pre-fix-${Date.now()}`,
        hypothesisId: "H2",
        location: "dashboard-client.tsx:44",
        message: "client render snapshot",
        data: {
          signalCount: data.signals.length,
          uniqueSignalIds: new Set(data.signals.map((signal) => signal.id)).size,
          topSignals: data.signals.slice(0, 3).map((signal) => ({
            id: signal.id,
            summary: signal.summary,
          })),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
  }, [data.signals]);
  // #endregion

  return (
    <main className="min-h-screen bg-[#0a0e14] p-4 text-[#e6edf3] md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="flex flex-col gap-4 border-b border-[#30363d] pb-4 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#2ea67f] bg-[#2ea67f]/10">
              <svg className="h-5 w-5 text-[#2ea67f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#2ea67f] animate-pulse" />
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[#2ea67f]">Live Monitor</p>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#e6edf3]">European Soccer Intelligence</h1>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#8b949e]">
            <div className="flex items-center gap-2">
              <span className="text-[#6e7681]">Signals:</span>
              <span className="font-mono text-[#2ea67f]">{filteredSignals.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#6e7681]">Markets:</span>
              <span className="font-mono text-[#d29922]">{data.matchMovers.length + data.transferMovers.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#6e7681]">Zones:</span>
              <span className="font-mono text-[#58a6ff]">{data.hotspots.length}</span>
            </div>
          </div>
        </header>

        <DashboardControls data={data} filters={filters} onChange={setFilters} />

        <SoccerMap hotspots={data.hotspots} signals={filteredSignals} onSelectSignal={setSelectedSignal} />

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="flex flex-col gap-4">
            <AlertList signals={topSignals} onSelectSignal={setSelectedSignal} selectedId={selectedSignal?.id} />
            <MarketSections data={data} onSelectSignal={setSelectedSignal} />
          </div>
          <SortableWidgets
            storageKey="soccer-dashboard-widgets"
            widgets={[
              {
                id: "detail-panel",
                title: "Signal Detail",
                component: selectedSignal ? (
                  <DetailPanel signal={selectedSignal} />
                ) : (
                  <div className="rounded border border-[#30363d] bg-[#161b22] p-4">
                    <p className="text-sm text-[#6e7681]">Select a signal to view details</p>
                  </div>
                ),
              },
              {
                id: "news-feed",
                title: "Intelligence Feed",
                component: <NewsFeed news={data.news} />,
              },
              {
                id: "prediction-markets",
                title: "Prediction Markets",
                component: <PredictionMarkets predictionMarkets={data.predictionMarkets} />,
              },
              {
                id: "memes-section",
                title: "Memes",
                component: <MemesSection memesData={memesData} />,
              },
            ]}
          />
        </section>

        <footer className="flex items-center justify-between border-t border-[#30363d] pt-4 text-[10px] text-[#6e7681]">
          <span>Soccer Situation Monitor v1.0</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${dataSource?.transfers && dataSource.transfers !== "sample" ? "bg-[#2ea67f]" : "bg-[#d29922]"}`} />
              <span>Transfers: {dataSource?.transfers && dataSource.transfers !== "sample" ? "Live" : "N/A"}</span>
            </span>
            <span className="flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${dataSource?.predictions === "polymarket" ? "bg-[#2ea67f]" : "bg-[#d29922]"}`} />
              <span>Odds: {dataSource?.predictions === "polymarket" ? "Live" : "N/A"}</span>
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}