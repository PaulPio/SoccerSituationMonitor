"use client";

import { LEAGUES, MARKET_TYPES, SIGNAL_SEVERITIES, type DashboardData } from "@/lib/soccer/types";
import { type DashboardFilters, getWatchlistOptions } from "@/lib/soccer/filters";

type Props = {
  data: DashboardData;
  filters: DashboardFilters;
  onChange: (filters: DashboardFilters) => void;
};

export function DashboardControls({ data, filters, onChange }: Props) {
  const { clubs, players } = getWatchlistOptions(data.signals);
  const watchlistOptions = [...clubs, ...players].sort();

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="league-filter" className="text-[10px] font-semibold uppercase tracking-wider text-[#8b949e]">League</label>
        <select
          id="league-filter"
          value={filters.league}
          onChange={(e) => onChange({ ...filters, league: e.target.value as DashboardFilters["league"] })}
          className="h-9 rounded border border-[#30363d] bg-[#161b22] px-3 text-sm text-[#e6edf3] transition-colors hover:border-[#2ea67f] focus:border-[#2ea67f] focus:outline-none"
        >
          <option value="all">All Leagues</option>
          {LEAGUES.map((league) => (
            <option key={league} value={league}>{league}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="market-type-filter" className="text-[10px] font-semibold uppercase tracking-wider text-[#8b949e]">Market</label>
        <select
          id="market-type-filter"
          value={filters.marketType}
          onChange={(e) => onChange({ ...filters, marketType: e.target.value as DashboardFilters["marketType"] })}
          className="h-9 rounded border border-[#30363d] bg-[#161b22] px-3 text-sm text-[#e6edf3] transition-colors hover:border-[#2ea67f] focus:border-[#2ea67f] focus:outline-none"
        >
          <option value="all">All Markets</option>
          {MARKET_TYPES.map((type) => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="severity-filter" className="text-[10px] font-semibold uppercase tracking-wider text-[#8b949e]">Severity</label>
        <select
          id="severity-filter"
          value={filters.severity}
          onChange={(e) => onChange({ ...filters, severity: e.target.value as DashboardFilters["severity"] })}
          className="h-9 rounded border border-[#30363d] bg-[#161b22] px-3 text-sm text-[#e6edf3] transition-colors hover:border-[#2ea67f] focus:border-[#2ea67f] focus:outline-none"
        >
          <option value="all">All Severities</option>
          {SIGNAL_SEVERITIES.map((severity) => (
            <option key={severity} value={severity}>{severity}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="watchlist-filter" className="text-[10px] font-semibold uppercase tracking-wider text-[#8b949e]">Watchlist</label>
        <select
          id="watchlist-filter"
          value={filters.watchlist}
          onChange={(e) => onChange({ ...filters, watchlist: e.target.value as DashboardFilters["watchlist"] })}
          className="h-9 rounded border border-[#30363d] bg-[#161b22] px-3 text-sm text-[#e6edf3] transition-colors hover:border-[#2ea67f] focus:border-[#2ea67f] focus:outline-none"
        >
          <option value="all">All</option>
          {watchlistOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    </div>
  );
}