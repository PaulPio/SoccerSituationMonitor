import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("fetchMatchMarkets", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  it("maps fixtures and odds into deterministic match movers", async () => {
    process.env.FOOTBALL_DATA_API_KEY = "football-key";
    process.env.ODDS_API_KEY = "odds-key";

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes("/competitions/")) {
        return jsonResponse({
          matches: [
            {
              id: 101,
              utcDate: "2026-05-08T12:00:00Z",
              competition: { name: "Premier League" },
              homeTeam: { name: "Liverpool" },
              awayTeam: { name: "Arsenal" },
            },
          ],
        });
      }
      if (url.includes("/sports/soccer_epl/odds/")) {
        return jsonResponse([
          {
            home_team: "Liverpool",
            away_team: "Arsenal",
            bookmakers: [
              {
                title: "Bookmaker A",
                markets: [
                  {
                    key: "h2h",
                    outcomes: [
                      { name: "Liverpool", price: 2.0 },
                      { name: "Arsenal", price: 3.0 },
                    ],
                  },
                ],
              },
            ],
          },
        ]);
      }
      return new Response("not found", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { fetchMatchMarkets } = await import("./match-markets-fetcher");
    const result = await fetchMatchMarkets(5);

    expect(result.source).toBe("mixed");
    expect(result.matchMovers.length).toBeGreaterThan(0);
    expect(result.matchMovers[0].probabilityAfter).toBe(50);
    expect(result.matchMovers[0].probabilityBefore).toBe(48);
    expect(result.matchMovers[0].oddsDirection).toBe("shortening");
  });

  it("falls back to sample without provider keys", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const { fetchMatchMarkets } = await import("./match-markets-fetcher");
    const result = await fetchMatchMarkets(4);
    expect(result.source).toBe("sample");
    expect(result.matchMovers.length).toBeGreaterThan(0);
  });
});
