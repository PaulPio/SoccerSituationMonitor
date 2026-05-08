"use client";

import type { DashboardData } from "@/lib/soccer/types";

type Props = {
  predictionMarkets: DashboardData["predictionMarkets"];
};

function getPolymarketUrl(slug: string | undefined, eventSlug: string | undefined): string {
  if (eventSlug && eventSlug.length > 3) {
    return `https://polymarket.com/event/${eventSlug}?utm_source=soccer-monitor`;
  }
  if (slug && slug.length > 5) {
    return `https://polymarket.com/market/${slug}?utm_source=soccer-monitor`;
  }
  return "";
}

export function PredictionMarkets({ predictionMarkets }: Props) {
  const sortedByVolume = [...predictionMarkets].sort((a, b) => b.volume - a.volume);
  const marketsWithUrl = sortedByVolume.filter((market) => getPolymarketUrl(market.slug, market.eventSlug) !== "");

  if (sortedByVolume.length === 0) {
    return (
      <div className="flex flex-col gap-2 rounded border border-[#30363d] bg-[#161b22] p-3">
        <div className="flex items-center gap-2 border-b border-[#30363d] pb-2">
          <div className="h-2 w-2 rounded-full bg-[#58a6ff]" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#e6edf3]">Prediction Markets</h2>
        </div>
        <div className="flex items-center justify-center py-6 text-xs text-[#6e7681]">
          Prediction markets unavailable
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded border border-[#30363d] bg-[#161b22] p-3">
      <div className="flex items-center gap-2 border-b border-[#30363d] pb-2">
        <div className="h-2 w-2 rounded-full bg-[#58a6ff]" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#e6edf3]">Polymarket Trending</h2>
        <span className="ml-auto text-[10px] text-[#6e7681]">Top 5 by volume</span>
      </div>
      <div className="flex flex-col gap-1.5 pt-2">
        {marketsWithUrl
          .map((market, index) => {
            const url = getPolymarketUrl(market.slug, market.eventSlug);

          return (
            <a
              key={market.id}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded bg-[#0d1117] p-2.5 transition-colors hover:bg-[#21262d]"
            >
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded bg-[#21262d] text-[10px] font-semibold text-[#8b949e]">
                {index + 1}
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-xs font-medium text-[#e6edf3] leading-tight group-hover:text-[#58a6ff]">
                  {market.question}
                </span>
                <div className="flex items-center gap-2 text-[10px] text-[#6e7681]">
                  <span className="rounded bg-[#21262d] px-1.5 py-0.5">{market.market}</span>
                  <span className="text-[#484f58]">•</span>
                  <span>{market.outcome}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-[#2ea67f]">{market.probability}%</span>
                  <span className={`text-[10px] ${market.trend === "rising" ? "text-[#2ea67f]" : market.trend === "falling" ? "text-[#f85149]" : "text-[#8b949e]"}`}>
                    {market.trend === "rising" ? "↑" : market.trend === "falling" ? "↓" : "→"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-[#6e7681]">
                  <span className="font-mono">{market.volumeDisplay}</span>
                  {market.change24h !== 0 && (
                    <span className={market.change24h > 0 ? "text-[#2ea67f]" : "text-[#f85149]"}>
                      {market.change24h > 0 ? "+" : ""}{market.change24h}%
                    </span>
                  )}
                </div>
              </div>
              <svg className="h-4 w-4 flex-shrink-0 text-[#6e7681] transition-colors group-hover:text-[#58a6ff]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          );
        })}
      </div>
      <div className="mt-1 flex items-center justify-between border-t border-[#30363d] pt-2 text-[10px] text-[#6e7681]">
        <span>Powered by Polymarket</span>
        <span>Click to bet</span>
      </div>
    </div>
  );
}