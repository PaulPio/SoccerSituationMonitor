"use client";

import dynamic from "next/dynamic";
import type { DashboardData, MarketMover } from "@/lib/soccer/types";

type Props = {
  hotspots: DashboardData["hotspots"];
  signals: MarketMover[];
  onSelectSignal: (signal: MarketMover) => void;
};

const MapContainer = dynamic(() => import("./map-inner").then((mod) => mod.MapInner), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 items-center justify-center rounded-lg border border-[#30363d] bg-[#161b22]">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#2ea67f] border-t-transparent" />
        <span className="text-sm text-[#8b949e]">Loading map...</span>
      </div>
    </div>
  ),
});

export function SoccerMap(props: Props) {
  return <MapContainer {...props} />;
}