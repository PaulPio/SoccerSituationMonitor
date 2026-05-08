import type { MarketMover } from "@/lib/soccer/types";
import { SeverityBadge, SourceTierBadge } from "./signal-badge";

type Props = {
  signals: MarketMover[];
  onSelectSignal: (signal: MarketMover) => void;
  selectedId?: string;
};

export function AlertList({ signals, onSelectSignal, selectedId }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full bg-[#2ea67f]" />
        <h2 className="text-xs font-semibold uppercase tracking-wider text-[#8b949e]">Signal Feed</h2>
        <span className="ml-auto text-[10px] text-[#6e7681]">{signals.length} active</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {signals.map((signal) => (
          <button
            key={signal.id}
            onClick={() => onSelectSignal(signal)}
            className={`group flex flex-col gap-2 rounded border p-3 text-left transition-all ${
              selectedId === signal.id
                ? "border-[#2ea67f] bg-[#2ea67f]/5"
                : "border-[#30363d] bg-[#161b22] hover:border-[#484f58]"
            }`}
          >
            <div className="flex items-center gap-2">
              <SeverityBadge severity={signal.severity} />
              <SourceTierBadge tier={signal.sourceTier} />
              <span className="ml-auto font-mono text-[10px] text-[#6e7681]">{signal.displayTime}</span>
            </div>
            <h3 className="text-sm font-medium text-[#e6edf3]">{signal.title}</h3>
            <p className="text-xs text-[#8b949e] line-clamp-2">{signal.summary}</p>
            <div className="flex items-center gap-2 text-[10px] text-[#6e7681]">
              <span className="rounded bg-[#21262d] px-1.5 py-0.5">{signal.league}</span>
              <span>{signal.club}</span>
              <span className="ml-auto uppercase">{signal.marketType}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}