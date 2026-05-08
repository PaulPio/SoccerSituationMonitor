import type { DashboardData, MarketMover } from "@/lib/soccer/types";
import { SeverityBadge, SourceTierBadge } from "./signal-badge";

type Props = {
  data: DashboardData;
  onSelectSignal: (signal: MarketMover) => void;
};

export function MarketSections({ data, onSelectSignal }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5 rounded border border-[#30363d] bg-[#161b22] p-3">
        <div className="flex items-center gap-2 border-b border-[#30363d] pb-2">
          <div className="h-2 w-2 rounded-full bg-[#2ea67f]" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#e6edf3]">Match Markets</h2>
          <span className="ml-auto text-[10px] text-[#6e7681]">{data.matchMovers.length} movers</span>
        </div>
        <div className="flex flex-col gap-1.5 pt-2">
          {data.matchMovers.map((mover) => (
            <button
              key={mover.id}
              onClick={() => onSelectSignal(mover)}
              className="flex flex-col gap-1.5 rounded bg-[#0d1117] p-2 text-left transition-colors hover:bg-[#21262d]"
            >
              <div className="flex items-center gap-2">
                <SeverityBadge severity={mover.severity} />
                <span className="text-[10px] text-[#6e7681]">{mover.displayTime}</span>
                <span className="ml-auto rounded bg-[#21262d] px-1.5 py-0.5 text-[10px] text-[#8b949e]">{mover.oddsDirection}</span>
              </div>
              <span className="text-xs font-medium text-[#e6edf3]">{mover.title}</span>
              <div className="flex items-center gap-3 text-[10px] text-[#6e7681]">
                <span>{mover.fixture}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-[#2ea67f]">{mover.probabilityAfter}%</span>
                <span className="text-[#6e7681]">from {mover.probabilityBefore}%</span>
                <span className="ml-auto text-[#8b949e]">{mover.driver}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 rounded border border-[#30363d] bg-[#161b22] p-3">
        <div className="flex items-center gap-2 border-b border-[#30363d] pb-2">
          <div className="h-2 w-2 rounded-full bg-[#d29922]" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-[#e6edf3]">Transfer Markets</h2>
          <span className="ml-auto text-[10px] text-[#6e7681]">{data.transferMovers.length} movers</span>
        </div>
        {data.transferMovers.length > 0 ? (
          <div className="flex flex-col gap-1.5 pt-2">
            {data.transferMovers.map((mover) => (
              <button
                key={mover.id}
                onClick={() => onSelectSignal(mover)}
                className="flex flex-col gap-1.5 rounded bg-[#0d1117] p-2 text-left transition-colors hover:bg-[#21262d]"
              >
                <div className="flex items-center gap-2">
                  <SeverityBadge severity={mover.severity} />
                  <SourceTierBadge tier={mover.sourceTier} />
                  <span className="ml-auto text-[10px] text-[#6e7681]">{mover.displayTime}</span>
                </div>
                <span className="text-xs font-medium text-[#e6edf3]">{mover.title}</span>
                <div className="flex items-center gap-2 text-[10px] text-[#6e7681]">
                  <span>{mover.player}</span>
                  <span className="text-[#484f58]">→</span>
                  <span>{mover.linkedClubs.slice(0, 2).join(", ")}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-[#d29922]">{mover.likelihoodAfter}%</span>
                  <span className="text-[#6e7681]">from {mover.likelihoodBefore}%</span>
                  <span className="ml-auto rounded bg-[#21262d] px-1.5 py-0.5 text-[10px] text-[#8b949e]">{mover.feeRange}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-4 text-xs text-[#6e7681]">
            Transfer rumors unavailable
          </div>
        )}
      </div>
    </div>
  );
}