import type { MarketMover } from "@/lib/soccer/types";
import { SeverityBadge, SourceTierBadge } from "./signal-badge";

type Props = {
  signal: MarketMover | null;
};

export function DetailPanel({ signal }: Props) {
  if (!signal) {
    return (
      <div className="flex flex-col gap-2 rounded border border-[#30363d] bg-[#161b22] p-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#6e7681]" />
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6e7681]">Signal Detail</span>
        </div>
        <p className="text-sm text-[#6e7681]">Select a signal to view intelligence</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded border border-[#2ea67f] bg-[#161b22] p-4">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-[#2ea67f] animate-pulse" />
        <span className="text-xs font-semibold uppercase tracking-wider text-[#2ea67f]">Signal Detail</span>
        <span className="ml-auto font-mono text-[10px] text-[#6e7681]">ID: {signal.id}</span>
      </div>
      <div className="flex items-center gap-2">
        <SeverityBadge severity={signal.severity} />
        <SourceTierBadge tier={signal.sourceTier} />
        <span className="rounded bg-[#21262d] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#8b949e]">{signal.marketType}</span>
        <span className="ml-auto text-[10px] text-[#6e7681]">{signal.league}</span>
      </div>
      <h3 className="text-base font-semibold text-[#e6edf3]">{signal.title}</h3>
      <p className="text-sm leading-relaxed text-[#8b949e]">{signal.summary}</p>
      <div className="flex flex-col gap-1.5 rounded bg-[#0d1117] p-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6e7681]">Impact Assessment</span>
        </div>
        <p className="text-xs text-[#2ea67f]">{signal.impact}</p>
      </div>
      <div className="flex flex-col gap-1.5 rounded bg-[#0d1117] p-2">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6e7681]">Source</span>
        <p className="text-xs text-[#8b949e]">{signal.relatedSource}</p>
      </div>
      {"fixture" in signal && (
        <div className="flex flex-col gap-1.5 rounded bg-[#0d1117] p-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6e7681]">Fixture</span>
          <p className="text-xs text-[#e6edf3]">{signal.fixture}</p>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-[#6e7681]">Before: <span className="text-[#e6edf3]">{signal.probabilityBefore}%</span></span>
            <span className="text-[#6e7681]">After: <span className="text-[#2ea67f]">{signal.probabilityAfter}%</span></span>
            <span className="ml-auto rounded bg-[#21262d] px-1.5 py-0.5 text-[10px] text-[#d29922]">{signal.oddsDirection}</span>
          </div>
        </div>
      )}
      {"linkedClubs" in signal && (
        <div className="flex flex-col gap-1.5 rounded bg-[#0d1117] p-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6e7681]">Linked Clubs</span>
          <p className="text-xs text-[#e6edf3]">{signal.linkedClubs.join(" → ")}</p>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="text-[#6e7681]">Before: <span className="text-[#e6edf3]">{signal.likelihoodBefore}%</span></span>
            <span className="text-[#6e7681]">After: <span className="text-[#d29922]">{signal.likelihoodAfter}%</span></span>
          </div>
          <span className="text-[10px] text-[#8b949e]">Fee: {signal.feeRange}</span>
        </div>
      )}
      <div className="flex items-center gap-2 pt-1 text-[10px] text-[#6e7681] border-t border-[#30363d]">
        <span>{signal.club}</span>
        {signal.player && <><span className="text-[#484f58]">/</span><span>{signal.player}</span></>}
        <span className="ml-auto">{signal.region}</span>
        <span className="font-mono">{signal.displayTime}</span>
      </div>
    </div>
  );
}