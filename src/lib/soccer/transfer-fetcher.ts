import { externalApiConfig, externalApiRevalidate } from "../env";
import type { TransferMarketMover } from "./types";
import { detectClub, detectLeague, extractPlayer, inferSourceTier, toDisplayTime, toIsoTimestamp } from "./entity-mapper";
import { fetchJson } from "./http";

const TRANSFER_KEYWORDS = [
  "transfer",
  "signing",
  "deal",
  "bid",
  "offer",
  "medical",
  "agreement",
  "approaching",
  "negotiations",
  "verbal",
  "done deal",
  "here we go",
];

const SUBREDDITS = ["soccer", "transfers"];

function containsTransferKeyword(title: string): boolean {
  const lowerTitle = title.toLowerCase();
  return TRANSFER_KEYWORDS.some((kw) => lowerTitle.includes(kw));
}

function extractPlayerAndClubs(title: string): { player?: string; club: string; linkedClubs: string[] } {
  const player = extractPlayer(title);
  const club = detectClub(title, "Unknown");
  const linkedClubs = [club];
  return { player, club, linkedClubs };
}

interface RedditPost {
  id: string;
  title: string;
  ups: number;
  num_comments: number;
  permalink: string;
  subreddit: string;
  created_utc: number;
  url: string;
  link_flair_text?: string;
}

interface RedditResponse {
  data: {
    children: Array<{ data: RedditPost }>;
  };
}

type NewsApiResponse = {
  articles?: Array<{
    title?: string;
    publishedAt?: string;
  }>;
};

export type TransferData = {
  transferMovers: TransferMarketMover[];
  fetchedAt: number;
  source: "reddit" | "mixed" | "sample";
};

function mentionsInNewsApi(title: string, articles: NewsApiResponse["articles"]): boolean {
  if (!articles || articles.length === 0) return false;
  const lower = title.toLowerCase();
  const tokens = lower.split(/\s+/).filter((token) => token.length > 4).slice(0, 6);
  if (tokens.length === 0) return false;
  return articles.some((article) => {
    const headline = article.title?.toLowerCase() ?? "";
    return tokens.some((token) => headline.includes(token));
  });
}

async function fetchNewsApiTransferArticles(): Promise<NewsApiResponse["articles"]> {
  if (!externalApiConfig.newsApiKey) return [];

  const endpoint = `${externalApiConfig.newsApiBaseUrl}/everything?q=(soccer OR football) AND (transfer OR signing OR bid OR medical)&language=en&pageSize=40&sortBy=publishedAt&apiKey=${externalApiConfig.newsApiKey}`;
  const payload = await fetchJson<NewsApiResponse>(endpoint, {
    revalidateSeconds: externalApiRevalidate.news,
  });
  return payload.articles ?? [];
}

export async function fetchTransferRumors(): Promise<TransferData> {
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
        hypothesisId: "H1",
        location: "transfer-fetcher.ts:91",
        message: "transfer fetch start",
        data: { subreddits: SUBREDDITS },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    const newsApiArticles = await fetchNewsApiTransferArticles().catch(() => []);
    const results: TransferMarketMover[] = [];

    for (const subreddit of SUBREDDITS) {
      const data = await fetchJson<RedditResponse>(
        `${externalApiConfig.redditBaseUrl}/r/${subreddit}/hot.json?limit=30`,
        {
          headers: {
            "User-Agent": "SoccerMonitor/1.0 (soccer-situation-monitor prototype)",
          },
          revalidateSeconds: externalApiRevalidate.reddit,
        },
      ).catch((error) => {
        console.error(`Reddit API error for r/${subreddit}:`, error);
        return { data: { children: [] } };
      });

      const transferPosts = data.data.children
        .filter((post) => containsTransferKeyword(post.data.title))
        .slice(0, 10);

      for (const post of transferPosts) {
        const { player, club, linkedClubs } = extractPlayerAndClubs(post.data.title);
        const league = detectLeague(post.data.title);
        const timestamp = toIsoTimestamp(post.data.created_utc * 1000);
        const displayTime = toDisplayTime(timestamp);

        const upvotes = post.data.ups;
        const crossSourceConfirmed = mentionsInNewsApi(post.data.title, newsApiArticles);
        const tierBoost = crossSourceConfirmed ? 15 : 0;
        const likelihood = Math.min(88, 18 + Math.floor(upvotes / 900) * 4 + tierBoost);
        const likelihoodBefore = Math.max(5, likelihood - (crossSourceConfirmed ? 8 : 5));
        const sourceTier = crossSourceConfirmed
          ? "Tier 1"
          : inferSourceTier(post.data.title) === "Tier 1"
            ? "Tier 2"
            : "Tier 3";
        const severity: TransferMarketMover["severity"] =
          likelihood >= 60 ? "Move" : likelihood >= 35 ? "Monitor" : "Noise";
        const impactTag = crossSourceConfirmed
          ? "cross-source confirmation"
          : "reddit-only momentum";

        const mover: TransferMarketMover = {
          id: `transfer-${post.data.id}`,
          title: post.data.title,
          summary: `Trending on r/${post.data.subreddit} with ${post.data.ups.toLocaleString()} upvotes`,
          league,
          club: club || "Unknown",
          player,
          marketType: "transfer",
          severity,
          sourceTier,
          region: "Europe",
          timestamp,
          displayTime,
          impact: `Likelihood at ${likelihood}% (${impactTag})`,
          relatedSource: crossSourceConfirmed ? `r/${post.data.subreddit} + NewsAPI` : `r/${post.data.subreddit}`,
          linkedClubs,
          likelihoodBefore,
          likelihoodAfter: likelihood,
          feeRange: crossSourceConfirmed ? "EUR45m-EUR90m (reported)" : "Subject to negotiation",
        };

        results.push(mover);
      }
    }

    const sortedByRelevance = results
      .sort((a, b) => b.likelihoodAfter - a.likelihoodAfter)
      .slice(0, 8);

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
        hypothesisId: "H1",
        location: "transfer-fetcher.ts:168",
        message: "transfer fetch result summary",
        data: {
          total: sortedByRelevance.length,
          top: sortedByRelevance.slice(0, 3).map((item) => ({
            id: item.id,
            summary: item.summary,
            likelihoodAfter: item.likelihoodAfter,
          })),
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return {
      transferMovers: sortedByRelevance,
      fetchedAt: Date.now(),
      source: newsApiArticles.length > 0 ? "mixed" : "reddit",
    };
  } catch (error) {
    console.error("Failed to fetch transfer rumors:", error);
    return getSampleTransferData();
  }
}

export function getSampleTransferData(): TransferData {
  return {
    transferMovers: [],
    fetchedAt: Date.now(),
    source: "sample",
  };
}