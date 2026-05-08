import type { DashboardData } from "@/lib/soccer/types";
import { SourceTierBadge } from "./signal-badge";

type Props = {
  news: DashboardData["news"];
};

export function NewsFeed({ news }: Props) {
  return (
    <div className="flex flex-col gap-2 rounded border border-[#30363d] bg-[#161b22] p-3">
      <div className="flex items-center gap-2 border-b border-[#30363d] pb-2">
        <div className="h-2 w-2 rounded-full bg-[#58a6ff]" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#e6edf3]">Intelligence Feed</h2>
        <span className="ml-auto text-[10px] text-[#6e7681]">{news.length} items</span>
      </div>
      <div className="flex flex-col gap-2 pt-2">
        {news.map((item) => (
          <div key={item.id} className="flex flex-col gap-1.5 rounded bg-[#0d1117] p-2">
            <div className="flex items-center gap-2">
              <SourceTierBadge tier={item.sourceTier} />
              <span className="font-mono text-[10px] text-[#6e7681]">{item.displayTime}</span>
              <span className="ml-auto rounded bg-[#2ea67f]/10 px-1.5 py-0.5 text-[10px] text-[#2ea67f]">{item.impactTag}</span>
            </div>
            <p className="text-xs leading-relaxed text-[#e6edf3]">{item.headline}</p>
            <div className="flex items-center gap-2 text-[10px] text-[#6e7681]">
              <span className="rounded bg-[#21262d] px-1.5 py-0.5">{item.league}</span>
              <span>{item.club}</span>
              {item.player && <span>/ {item.player}</span>}
              <span className="ml-auto uppercase">{item.marketType}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}