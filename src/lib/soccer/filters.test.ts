import { describe, expect, it } from "vitest";

import {
  filterSignals,
  getSeverityRank,
  getTopSignals,
  getWatchlistOptions,
  type DashboardFilters,
} from "./filters";
import { getDashboardData } from "./sample-data";
import type { MatchMarketMover } from "./types";

const { signals } = getDashboardData();

function makeSignal(overrides: Partial<MatchMarketMover>): MatchMarketMover {
  return {
    id: "signal-base",
    title: "Signal",
    summary: "A market signal",
    league: "Premier League",
    club: "Arsenal",
    player: "Bukayo Saka",
    marketType: "match",
    severity: "Monitor",
    sourceTier: "Tier 1",
    region: "England",
    timestamp: "2026-05-08T10:00:00Z",
    displayTime: "10:00",
    impact: "Sample impact",
    relatedSource: "Sample source",
    fixture: "Arsenal vs Chelsea",
    probabilityBefore: 50,
    probabilityAfter: 52,
    oddsDirection: "shortening",
    driver: "Sample driver",
    ...overrides,
  };
}

describe("soccer signal filters", () => {
  it("filters signals by market type and league", () => {
    const filters: DashboardFilters = {
      league: "Bundesliga",
      marketType: "transfer",
      severity: "all",
      watchlist: "all",
    };

    const result = filterSignals(signals, filters);

    expect(result.map((signal) => signal.id)).toEqual(["transfer-wirtz-arsenal"]);
  });

  it("sorts top signals by severity rank descending", () => {
    const topSignals = getTopSignals(signals, 4);

    expect(topSignals.map((signal) => signal.severity)).toEqual([
      "Shock",
      "Move",
      "Move",
      "Monitor",
    ]);
    expect(getSeverityRank("Shock")).toBeGreaterThan(getSeverityRank("Move"));
  });

  it("uses newest timestamp first when top signal severities tie", () => {
    const topMoveSignals = getTopSignals(
      signals.filter((signal) => signal.severity === "Move"),
      2,
    );

    expect(topMoveSignals.map((signal) => signal.id)).toEqual([
      "transfer-wirtz-arsenal",
      "match-psg-bay-form",
    ]);
  });

  it("uses id ascending when severity and timestamp tie", () => {
    const tiedSignals = [
      makeSignal({ id: "signal-b", severity: "Move", timestamp: "2026-05-08T12:00:00Z" }),
      makeSignal({ id: "signal-a", severity: "Move", timestamp: "2026-05-08T12:00:00Z" }),
    ];

    expect(getTopSignals(tiedSignals).map((signal) => signal.id)).toEqual([
      "signal-a",
      "signal-b",
    ]);
  });

  it("matches watchlist filters by club or player", () => {
    const clubFilters: DashboardFilters = {
      league: "all",
      marketType: "all",
      severity: "all",
      watchlist: "Paris Saint-Germain",
    };
    const playerFilters: DashboardFilters = {
      league: "all",
      marketType: "all",
      severity: "all",
      watchlist: "Mohamed Salah",
    };

    expect(filterSignals(signals, clubFilters).map((signal) => signal.id)).toEqual([
      "match-psg-bay-form",
      "match-psg-om-dembele",
      "transfer-nico-psg",
    ]);
    expect(filterSignals(signals, playerFilters).map((signal) => signal.id)).toEqual([
      "match-liv-ars-salah",
    ]);
  });

  it("returns unique sorted clean watchlist clubs and players", () => {
    const options = getWatchlistOptions([
      makeSignal({ id: "one", club: " Arsenal ", player: " Bukayo Saka " }),
      makeSignal({ id: "two", club: "Arsenal", player: "Bukayo Saka" }),
      makeSignal({ id: "three", club: "Chelsea", player: undefined }),
      makeSignal({ id: "four", club: "   ", player: "   " }),
      makeSignal({ id: "five", club: "Brighton", player: "Evan Ferguson" }),
    ]);

    expect(options.clubs).toEqual(["Arsenal", "Brighton", "Chelsea"]);
    expect(options.players).toEqual(["Bukayo Saka", "Evan Ferguson"]);
  });
});
