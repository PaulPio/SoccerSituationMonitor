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

function cleanLabel(label: string | undefined): string | undefined {
  const trimmedLabel = label?.trim();

  return trimmedLabel ? trimmedLabel : undefined;
}

export function filterSignals(signals: MarketMover[], filters: DashboardFilters): MarketMover[] {
  return signals.filter((signal) => {
    const matchesLeague = filters.league === "all" || signal.league === filters.league;
    const matchesMarketType =
      filters.marketType === "all" || signal.marketType === filters.marketType;
    const matchesSeverity = filters.severity === "all" || signal.severity === filters.severity;
    const matchesWatchlist =
      filters.watchlist === "all" ||
      cleanLabel(signal.club) === filters.watchlist ||
      cleanLabel(signal.player) === filters.watchlist;

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

      const timestampDifference = Date.parse(right.timestamp) - Date.parse(left.timestamp);

      if (timestampDifference !== 0) {
        return timestampDifference;
      }

      return left.id.localeCompare(right.id);
    })
    .slice(0, limit);
}

export function getWatchlistOptions(signals: MarketMover[]): WatchlistOptions {
  const clubs = new Set<string>();
  const players = new Set<string>();

  for (const signal of signals) {
    const club = cleanLabel(signal.club);
    const player = cleanLabel(signal.player);

    if (club) {
      clubs.add(club);
    }

    if (player) {
      players.add(player);
    }
  }

  return {
    clubs: [...clubs].sort(),
    players: [...players].sort(),
  };
}
