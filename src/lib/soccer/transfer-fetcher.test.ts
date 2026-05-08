import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("fetchTransferRumors", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  it("marks source mixed and boosts confidence when NewsAPI confirms rumor", async () => {
    process.env.NEWS_API_KEY = "news-key";

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes("/everything?")) {
        return jsonResponse({
          articles: [
            {
              title: "Liverpool open talks for striker signing",
              publishedAt: "2026-05-08T12:00:00Z",
            },
          ],
        });
      }
      if (url.includes("/hot.json")) {
        return jsonResponse({
          data: {
            children: [
              {
                data: {
                  id: "post-1",
                  title: "Liverpool open talks for striker signing",
                  ups: 4200,
                  num_comments: 350,
                  permalink: "/r/soccer/post-1",
                  subreddit: "soccer",
                  created_utc: 1715178000,
                  url: "https://reddit.com/post-1",
                },
              },
            ],
          },
        });
      }
      return new Response("not found", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { fetchTransferRumors } = await import("./transfer-fetcher");
    const result = await fetchTransferRumors();

    expect(result.source).toBe("mixed");
    expect(result.transferMovers.length).toBeGreaterThan(0);
    expect(result.transferMovers[0].sourceTier).toBe("Tier 1");
    expect(result.transferMovers[0].likelihoodAfter).toBeGreaterThan(result.transferMovers[0].likelihoodBefore);
  });
});
