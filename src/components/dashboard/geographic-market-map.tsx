import type { DashboardData, Hotspot, MarketMover } from "@/lib/soccer/types";
import { getSeverityRank } from "@/lib/soccer/filters";

type Props = {
  hotspots: DashboardData["hotspots"];
  signals: MarketMover[];
  onSelectSignal: (signal: MarketMover) => void;
};

const intensityColors: Record<string, string> = {
  match: "bg-emerald-500/20 border-emerald-500 text-emerald-400",
  transfer: "bg-amber-500/20 border-amber-500 text-amber-400",
};

export function GeographicMarketMap({ hotspots, signals, onSelectSignal }: Props) {
  const getSignalForHotspot = (hotspot: Hotspot) => {
    const regionSignals = signals.filter((s) => s.region === hotspot.region);
    if (regionSignals.length === 0) return null;
    return regionSignals.sort((a, b) => getSeverityRank(b.severity) - getSeverityRank(a.severity))[0];
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-[#30363d] bg-[#0d1117]">
      <div className="absolute inset-0 bg-[radial-gradient(#2ea67f10_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="relative flex h-72 flex-col p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#2ea67f]" />
              <span className="text-sm font-medium text-[#e6edf3]">European Market Monitor</span>
            </div>
            <div className="h-4 w-px bg-[#30363d]" />
            <span className="text-xs text-[#8b949e]">{hotspots.length} active zones</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-[#2ea67f]" />
              <span className="text-[#8b949e]">Match</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-[#d29922]" />
              <span className="text-[#8b949e]">Transfer</span>
            </div>
          </div>
        </div>
        <div className="relative flex-1">
          <svg className="absolute inset-0 h-full w-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,30 50,50 T100,50" stroke="#2ea67f" strokeWidth="0.3" fill="none" />
            <path d="M0,60 Q30,40 60,60 T100,60" stroke="#2ea67f" strokeWidth="0.2" fill="none" />
            <path d="M20,0 Q40,50 20,100" stroke="#2ea67f" strokeWidth="0.2" fill="none" />
            <path d="M50,0 Q70,50 50,100" stroke="#2ea67f" strokeWidth="0.2" fill="none" />
            <path d="M80,0 Q60,50 80,100" stroke="#2ea67f" strokeWidth="0.2" fill="none" />
          </svg>
          {hotspots.map((hotspot) => {
            const signal = getSignalForHotspot(hotspot);
            const size = 8 + (hotspot.intensity / 100) * 12;
            const colorClass = intensityColors[hotspot.dominantMarketType];
            const pulseSize = size + (hotspot.intensity / 100) * 8;
            return (
              <button
                key={hotspot.id}
                onClick={() => signal && onSelectSignal(signal)}
                disabled={!signal}
                className="group absolute flex flex-col items-center transition-transform disabled:cursor-default disabled:opacity-40 hover:scale-110"
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%`, transform: "translate(-50%, -50%)" }}
              >
                <div
                  className={`relative flex items-center justify-center rounded-full border-2 ${colorClass}`}
                  style={{ width: size, height: size }}
                >
                  <div
                    className="absolute rounded-full border border-current opacity-30 animate-pulse"
                    style={{ width: pulseSize, height: pulseSize }}
                  />
                </div>
                <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center gap-1">
                  <div className="rounded border border-[#30363d] bg-[#161b22] px-2 py-1 text-xs whitespace-nowrap">
                    <span className="font-medium text-[#e6edf3]">{hotspot.city}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#8b949e]">
                    <span>{hotspot.activeSignals} signals</span>
                    <span className="uppercase">{hotspot.dominantMarketType}</span>
                  </div>
                </div>
                <span className="absolute top-full mt-1 text-[10px] font-medium text-[#8b949e] whitespace-nowrap">{hotspot.city}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-[#8b949e]">
          <span>LAT 35°N - 60°N</span>
          <span>LON 10°W - 30°E</span>
        </div>
      </div>
    </div>
  );
}