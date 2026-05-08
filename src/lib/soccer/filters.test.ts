import { describe, expect, it } from "vitest";

import {
  filterSignals,
  getSeverityRank,
  getTopSignals,
  getWatchlistOptions,
  type DashboardFilters,
} from "./filters";
import { getDashboardData } from "./sample-data";

const { signals } = getDashboardData();

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

  it("returns unique sorted watchlist clubs and players", () => {
    const options = getWatchlistOptions(signals);

    expect(options.clubs).toEqual([
      "AC Milan",
      "Barcelona",
      "Bayer Leverkusen",
      "Liverpool",
      "Manchester City",
      "Napoli",
      "Paris Saint-Germain",
    ]);
    expect(options.players).toEqual([
      "Florian Wirtz",
      "Lamine Yamal",
      "Mike Maignan",
      "Mohamed Salah",
      "Nico Williams",
      "Ousmane Dembele",
      "Rodri",
      "Victor Osimhen",
    ]);
  });
});
