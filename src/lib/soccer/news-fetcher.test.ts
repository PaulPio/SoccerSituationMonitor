import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const originalEnv = { ...process.env };

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("fetchNewsFeed", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
  });

  it("merges reddit + newsapi and deduplicates headlines", async () => {
    process.env.NEWS_API_KEY = "test-news-key";
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = input.toString();
      if (url.includes("/r/") && url.includes("/new.json")) {
        return jsonResponse({
          data: {
            children: [
              {
                data: {
                  id: "r1",
                  title: "Liverpool open talks for striker signing",
                  permalink: "/r/soccer/r1",
                  created_utc: 1715178000,
                },
              },
            ],
          },
        });
      }
      if (url.includes("/everything?")) {
        return jsonResponse({
          articles: [
            {
              title: "Liverpool open talks for striker signing",
              publishedAt: "2026-05-08T11:00:00Z",
            },
            {
              title: "Arsenal injury update ahead of derby",
              publishedAt: "2026-05-08T12:00:00Z",
            },
          ],
        });
      }
      return new Response("not found", { status: 404 });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { fetchNewsFeed } = await import("./news-fetcher");
    const result = await fetchNewsFeed(10);

    expect(result.source).toBe("mixed");
    expect(result.news.length).toBeGreaterThanOrEqual(2);
    const headlines = result.news.map((item) => item.headline);
    expect(headlines.filter((headline) => headline === "Liverpool open talks for striker signing")).toHaveLength(1);
  });

  it("falls back to sample when providers return no items", async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        data: { children: [] },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { fetchNewsFeed } = await import("./news-fetcher");
    const result = await fetchNewsFeed(5);

    expect(result.source).toBe("sample");
    expect(result.news.length).toBeGreaterThan(0);
  });
});
