import { externalApiConfig, externalApiRevalidate } from "../env";
import type { NewsItem } from "./types";
import { detectClub, detectLeague, extractPlayer, inferSourceTier, toDisplayTime, toIsoTimestamp } from "./entity-mapper";
import { fetchJson } from "./http";
import { getDashboardData } from "./sample-data";

const NEWS_SUBREDDITS = ["soccer", "PremierLeague", "transfers", "championsleague"];

type RedditListingResponse = {
  data?: {
    children?: Array<{
      data?: {
        id: string;
        title: string;
        permalink: string;
        created_utc: number;
      };
    }>;
  };
};

type NewsApiResponse = {
  articles?: Array<{
    title?: string;
    description?: string;
    publishedAt?: string;
    source?: { name?: string };
    url?: string;
  }>;
};

export type NewsData = {
  news: NewsItem[];
  fetchedAt: number;
  source: "reddit" | "newsapi" | "mixed" | "sample";
};

const normalizeHeadlineKey = (headline: string): string =>
  headline.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();

function buildNewsItem(args: {
  id: string;
  headline: string;
  publishedAt: string | number;
  marketType: "match" | "transfer";
  sourceTier: NewsItem["sourceTier"];
  impactTag: string;
}): NewsItem {
  const league = detectLeague(args.headline);
  const club = detectClub(args.headline);
  const player = extractPlayer(args.headline);
  const timestamp = toIsoTimestamp(args.publishedAt);

  return {
    id: args.id,
    headline: args.headline,
    league,
    club,
    player,
    marketType: args.marketType,
    sourceTier: args.sourceTier,
    timestamp,
    displayTime: toDisplayTime(timestamp),
    impactTag: args.impactTag,
  };
}

async function fetchRedditNews(): Promise<NewsItem[]> {
  const allItems: NewsItem[] = [];
  for (const subreddit of NEWS_SUBREDDITS) {
    const endpoint = `${externalApiConfig.redditBaseUrl}/r/${subreddit}/new.json?limit=20`;
    const payload = await fetchJson<RedditListingResponse>(endpoint, {
      headers: {
        "User-Agent": "SoccerMonitor/1.0 (soccer-situation-monitor)",
      },
      revalidateSeconds: externalApiRevalidate.reddit,
    });

    const posts = payload.data?.children ?? [];
    for (const child of posts) {
      const post = child.data;
      if (!post?.title) continue;
      const lowerTitle = post.title.toLowerCase();
      const marketType: "match" | "transfer" =
        /(transfer|bid|deal|sign|agreement|medical)/.test(lowerTitle) ? "transfer" : "match";
      allItems.push(
        buildNewsItem({
          id: `reddit-${post.id}`,
          headline: post.title,
          publishedAt: post.created_utc * 1000,
          marketType,
          sourceTier: "Tier 2",
          impactTag: marketType === "transfer" ? "reddit transfer buzz" : "reddit match update",
        }),
      );
    }
  }
  return allItems;
}

async function fetchNewsApiItems(): Promise<NewsItem[]> {
  if (!externalApiConfig.newsApiKey) return [];

  const endpoint = `${externalApiConfig.newsApiBaseUrl}/everything?q=(soccer OR football) AND (transfer OR injury OR lineup OR odds)&language=en&pageSize=40&sortBy=publishedAt&apiKey=${externalApiConfig.newsApiKey}`;
  const payload = await fetchJson<NewsApiResponse>(endpoint, {
    revalidateSeconds: externalApiRevalidate.news,
  });

  const articles = payload.articles ?? [];
  return articles
    .filter((article) => article.title && article.publishedAt)
    .map((article, index) => {
      const headline = article.title!;
      const lowerHeadline = headline.toLowerCase();
      const marketType: "match" | "transfer" =
        /(transfer|sign|bid|fee|clause)/.test(lowerHeadline) ? "transfer" : "match";
      return buildNewsItem({
        id: `newsapi-${index}-${normalizeHeadlineKey(headline).slice(0, 24)}`,
        headline,
        publishedAt: article.publishedAt!,
        marketType,
        sourceTier: inferSourceTier(`${headline} ${article.description ?? ""}`),
        impactTag: marketType === "transfer" ? "press transfer report" : "press match signal",
      });
    });
}

export async function fetchNewsFeed(limit = 14): Promise<NewsData> {
  try {
    const runId = `pre-fix-${Date.now()}`;
    // #region agent log
    fetch("http://127.0.0.1:7395/ingest/224fc749-6bae-4e3a-8df7-85eee278d16f", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "d4b56d",
      },
      body: JSON.stringify({
        sessionId: "d4b56d",
        runId,
        hypothesisId: "N1",
        location: "news-fetcher.ts:130",
        message: "news fetch start",
        data: {
          limit,
          hasNewsApiKey: Boolean(externalApiConfig.newsApiKey),
          newsApiBaseUrl: externalApiConfig.newsApiBaseUrl,
          redditBaseUrl: externalApiConfig.redditBaseUrl,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    const [redditNews, newsApiNews] = await Promise.allSettled([fetchRedditNews(), fetchNewsApiItems()]);
    const redditItems = redditNews.status === "fulfilled" ? redditNews.value : [];
    const apiItems = newsApiNews.status === "fulfilled" ? newsApiNews.value : [];

    const deduped = new Map<string, NewsItem>();
    for (const item of [...redditItems, ...apiItems]) {
      const key = normalizeHeadlineKey(item.headline);
      if (!deduped.has(key)) {
        deduped.set(key, item);
      }
    }

    const news = [...deduped.values()]
      .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
      .slice(0, limit);

    // #region agent log
    fetch("http://127.0.0.1:7395/ingest/224fc749-6bae-4e3a-8df7-85eee278d16f", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "d4b56d",
      },
      body: JSON.stringify({
        sessionId: "d4b56d",
        runId,
        hypothesisId: "N2",
        location: "news-fetcher.ts:169",
        message: "news provider counts",
        data: {
          redditStatus: redditNews.status,
          redditCount: redditItems.length,
          newsApiStatus: newsApiNews.status,
          newsApiCount: apiItems.length,
          dedupedCount: deduped.size,
          finalCount: news.length,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    if (news.length === 0) {
      // #region agent log
      fetch("http://127.0.0.1:7395/ingest/224fc749-6bae-4e3a-8df7-85eee278d16f", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "d4b56d",
        },
        body: JSON.stringify({
          sessionId: "d4b56d",
          runId,
          hypothesisId: "N3",
          location: "news-fetcher.ts:195",
          message: "news fallback to sample",
          data: { reason: "empty_after_merge" },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      return {
        news: getDashboardData().news,
        fetchedAt: Date.now(),
        source: "sample",
      };
    }

    const source: NewsData["source"] =
      redditItems.length > 0 && apiItems.length > 0 ? "mixed" : apiItems.length > 0 ? "newsapi" : "reddit";

    return {
      news,
      fetchedAt: Date.now(),
      source,
    };
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7395/ingest/224fc749-6bae-4e3a-8df7-85eee278d16f", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "d4b56d",
      },
      body: JSON.stringify({
        sessionId: "d4b56d",
        runId: `pre-fix-${Date.now()}`,
        hypothesisId: "N4",
        location: "news-fetcher.ts:216",
        message: "news fetch exception",
        data: { error: String(error) },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    console.error("Failed to fetch news feed:", error);
    return {
      news: getDashboardData().news,
      fetchedAt: Date.now(),
      source: "sample",
    };
  }
}
