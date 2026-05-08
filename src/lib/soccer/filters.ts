import { SIGNAL_SEVERITIES, type League, type MarketMover, type MarketType, type SignalSeverity } from "./types";

type AllOption = "all";

export type DashboardFilters = {
  league: League | AllOption;
  marketType: MarketType | AllOption;
  severity: SignalSeverity | AllOption;
  watchlist: string | AllOption;
};

export type WatchlistOptions = {
  clubs: string[];
  players: string[];
};

export function getSeverityRank(severity: SignalSeverity): number {
  return SIGNAL_SEVERITIES.indexOf(severity);
}

export function filterSignals(signals: MarketMover[], filters: DashboardFilters): MarketMover[] {
  return signals.filter((signal) => {
    const matchesLeague = filters.league === "all" || signal.league === filters.league;
    const matchesMarketType =
      filters.marketType === "all" || signal.marketType === filters.marketType;
    const matchesSeverity = filters.severity === "all" || signal.severity === filters.severity;
    const matchesWatchlist =
      filters.watchlist === "all" ||
      signal.club === filters.watchlist ||
      signal.player === filters.watchlist;

    return matchesLeague && matchesMarketType && matchesSeverity && matchesWatchlist;
  });
}

export function getTopSignals(signals: MarketMover[], limit = signals.length): MarketMover[] {
  return [...signals]
    .sort((left, right) => {
      const severityDifference = getSeverityRank(right.severity) - getSeverityRank(left.severity);

      if (severityDifference !== 0) {
        return severityDifference;
      }

      return Date.parse(right.timestamp) - Date.parse(left.timestamp);
    })
    .slice(0, limit);
}

export function getWatchlistOptions(signals: MarketMover[]): WatchlistOptions {
  const clubs = new Set<string>();
  const players = new Set<string>();

  for (const signal of signals) {
    clubs.add(signal.club);

    if (signal.player) {
      players.add(signal.player);
    }
  }

  return {
    clubs: [...clubs].sort(),
    players: [...players].sort(),
  };
}
