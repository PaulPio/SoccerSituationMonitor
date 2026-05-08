import { externalApiConfig, externalApiRevalidate } from "../env";
import type { MatchMarketMover } from "./types";
import { detectLeague, inferSourceTier, toDisplayTime, toIsoTimestamp } from "./entity-mapper";
import { fetchJson } from "./http";
import { getDashboardData } from "./sample-data";

type FootballDataMatch = {
  id: number;
  utcDate: string;
  status: string;
  competition?: { name?: string };
  homeTeam?: { name?: string };
  awayTeam?: { name?: string };
};

type FootballDataResponse = {
  matches?: FootballDataMatch[];
};

type OddsBookmakerMarket = {
  key?: string;
  outcomes?: Array<{ name?: string; price?: number }>;
};

type OddsBookmaker = {
  title?: string;
  markets?: OddsBookmakerMarket[];
};

type OddsEvent = {
  id?: string;
  home_team?: string;
  away_team?: string;
  bookmakers?: OddsBookmaker[];
};

export type MatchMarketsData = {
  matchMovers: MatchMarketMover[];
  fetchedAt: number;
  source: "football_data" | "odds_api" | "mixed" | "sample";
};

const COMPETITION_CODES = ["PL", "PD", "SA", "BL1", "FL1", "CL"];

function toPercent(price: number): number {
  const value = Math.round((1 / Math.max(price, 1.01)) * 100);
  return Math.max(5, Math.min(95, value));
}

function toDirection(before: number, after: number): MatchMarketMover["oddsDirection"] {
  if (after > before) return "shortening";
  if (after < before) return "drifting";
  return "stable";
}

async function fetchFixtures(): Promise<FootballDataMatch[]> {
  if (!externalApiConfig.footballDataApiKey) return [];

  const calls = COMPETITION_CODES.map((code) =>
    fetchJson<FootballDataResponse>(`${externalApiConfig.footballDataBaseUrl}/competitions/${code}/matches?status=SCHEDULED`, {
      headers: {
        "X-Auth-Token": externalApiConfig.footballDataApiKey!,
      },
      revalidateSeconds: externalApiRevalidate.football,
    }).catch(() => ({ matches: [] })),
  );

  const responses = await Promise.all(calls);
  return responses.flatMap((res) => res.matches ?? []).slice(0, 40);
}

async function fetchOddsEvents(): Promise<OddsEvent[]> {
  if (!externalApiConfig.oddsApiKey) return [];

  const endpoint = `${externalApiConfig.oddsApiBaseUrl}/sports/soccer_epl/odds/?apiKey=${externalApiConfig.oddsApiKey}&regions=uk&markets=h2h&oddsFormat=decimal`;
  return fetchJson<OddsEvent[]>(endpoint, {
    revalidateSeconds: externalApiRevalidate.odds,
  }).catch(() => []);
}

function pickPriceForTeam(event: OddsEvent, teamName: string): number | undefined {
  const firstBookmaker = event.bookmakers?.[0];
  const market = firstBookmaker?.markets?.find((entry) => entry.key === "h2h");
  const outcome = market?.outcomes?.find((entry) => entry.name === teamName);
  return outcome?.price;
}

export async function fetchMatchMarkets(limit = 8): Promise<MatchMarketsData> {
  try {
    const [fixtures, oddsEvents] = await Promise.all([fetchFixtures(), fetchOddsEvents()]);
    const results: MatchMarketMover[] = [];

    for (const match of fixtures) {
      const home = match.homeTeam?.name ?? "Unknown";
      const away = match.awayTeam?.name ?? "Unknown";
      const fixtureLabel = `${home} vs ${away}`;
      const league = detectLeague(match.competition?.name ?? fixtureLabel);

      const mappedOddsEvent = oddsEvents.find(
        (event) =>
          event.home_team?.toLowerCase() === home.toLowerCase() &&
          event.away_team?.toLowerCase() === away.toLowerCase(),
      );
      const homePrice = mappedOddsEvent ? pickPriceForTeam(mappedOddsEvent, mappedOddsEvent.home_team ?? "") : undefined;

      const probabilityAfter = homePrice ? toPercent(homePrice) : 50;
      const probabilityBefore = Math.max(5, Math.min(95, probabilityAfter - (homePrice ? 2 : 0)));
      const timestamp = toIsoTimestamp(match.utcDate);

      results.push({
        id: `match-live-${match.id}`,
        title: `${fixtureLabel} market movement watch`,
        summary: mappedOddsEvent
          ? `Odds snapshot from ${mappedOddsEvent.bookmakers?.[0]?.title ?? "bookmaker"} aligned with fixture feed.`
          : "Fixture pulled from football-data without live odds overlay.",
        league,
        club: home,
        marketType: "match",
        severity: mappedOddsEvent ? "Monitor" : "Noise",
        sourceTier: inferSourceTier(mappedOddsEvent ? "official odds feed" : "fixture feed"),
        region: "Europe",
        timestamp,
        displayTime: toDisplayTime(timestamp),
        impact: `Home win model at ${probabilityAfter}% (${mappedOddsEvent ? "odds-backed" : "fixture-only"}).`,
        relatedSource: mappedOddsEvent ? "odds-api + football-data" : "football-data",
        fixture: fixtureLabel,
        probabilityBefore,
        probabilityAfter,
        oddsDirection: toDirection(probabilityBefore, probabilityAfter),
        driver: mappedOddsEvent ? "bookmaker odds update" : "scheduled fixture update",
      });
    }

    const matchMovers = results
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
      .slice(0, limit);

    if (matchMovers.length === 0) {
      return {
        matchMovers: getDashboardData().matchMovers,
        fetchedAt: Date.now(),
        source: "sample",
      };
    }

    const source: MatchMarketsData["source"] =
      fixtures.length > 0 && oddsEvents.length > 0 ? "mixed" : oddsEvents.length > 0 ? "odds_api" : "football_data";

    return {
      matchMovers,
      fetchedAt: Date.now(),
      source,
    };
  } catch (error) {
    console.error("Failed to fetch match markets:", error);
    return {
      matchMovers: getDashboardData().matchMovers,
      fetchedAt: Date.now(),
      source: "sample",
    };
  }
}
