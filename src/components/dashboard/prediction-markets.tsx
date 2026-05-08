"use client";

import type { DashboardData } from "@/lib/soccer/types";

type Props = {
  predictionMarkets: DashboardData["predictionMarkets"];
};

export function PredictionMarkets({ predictionMarkets }: Props) {
  const sortedByVolume = [...predictionMarkets].sort((a, b) => b.volume - a.volume);

  return (
    <div className="flex flex-col gap-2 rounded border border-[#30363d] bg-[#161b22] p-3">
      <div className="flex items-center gap-2 border-b border-[#30363d] pb-2">
        <div className="h-2 w-2 rounded-full bg-[#58a6ff]" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#e6edf3]">Polymarket Trending</h2>
        <span className="ml-auto text-[10px] text-[#6e7681]">Top 5 by volume</span>
      </div>
      <div className="flex flex-col gap-1.5 pt-2">
        {sortedByVolume.map((market, index) => (
          <div
            key={market.id}
            className="flex items-center gap-3 rounded bg-[#0d1117] p-2.5"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#21262d] text-[10px] font-semibold text-[#8b949e]">
              {index + 1}
            </div>
            <div className="flex flex-1 flex-col gap-0.5">
              <span className="text-xs font-medium text-[#e6edf3] leading-tight">{market.question}</span>
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
          </div>
        ))}
      </div>
      <div className="mt-1 flex items-center justify-between border-t border-[#30363d] pt-2 text-[10px] text-[#6e7681]">
        <span>Powered by Polymarket</span>
        <span>Live data</span>
      </div>
    </div>
  );
}