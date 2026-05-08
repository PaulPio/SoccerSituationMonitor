import type { PredictionMarket } from "./types";

export type PredictionData = {
  predictionMarkets: PredictionMarket[];
  fetchedAt: number;
  source: "polymarket" | "sample";
};

const SOCCER_TAG_IDS = ["100350", "82", "780", "1494", "101962", "102070", "1234", "100977", "101787"];

const SOCCER_LEAGUES: Record<string, string[]> = {
  "Premier League": ["premier league", "arsenal", "liverpool", "chelsea", "manchester", "man city", "man utd", "tottenham", "newcastle", "aston villa"],
  "La Liga": ["la liga", "barcelona", "real madrid", "atletico", "sevilla", "atlético madrid"],
  "Serie A": ["serie a", "juventus", "inter", "ac milan", "milan", "roma", "lazio", "napoli"],
  "Bundesliga": ["bundesliga", "bayern", "dortmund", "rb leipzig", "leverkusen"],
  "Ligue 1": ["ligue 1", "psg", "marseille", "monaco", "lyon", "lille"],
  "Champions League": ["champions league", "ucl"],
  "Europa League": ["europa league", "uel"],
};

function detectLeague(question: string): string {
  const lower = question.toLowerCase();
  for (const [league, keywords] of Object.entries(SOCCER_LEAGUES)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return league;
    }
  }
  return "Premier League";
}

function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `$${(volume / 1000000).toFixed(2)}M`;
  } else if (volume >= 1000) {
    return `$${(volume / 1000).toFixed(0)}K`;
  }
  return `$${Math.round(volume)}`;
}

export async function fetchPredictionMarkets(): Promise<PredictionData> {
  try {
    const soccerMarketsList: PredictionMarket[] = [];

    for (const tagId of SOCCER_TAG_IDS) {
      const response = await fetch(
        `https://gamma-api.polymarket.com/markets?tag_id=${tagId}&limit=50&active=true&closed=false&order=volume_24hr&ascending=false`,
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          next: { revalidate: 3600 },
        }
      );

      if (!response.ok) {
        continue;
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        continue;
      }

      const markets = data.slice(0, 5).map((m: {
        id: string;
        question?: string;
        title?: string;
        outcomePrices?: string;
        volume24hr?: number;
        endDateInline?: string;
        gameStartTime?: string;
        slug?: string;
        events?: Array<{ slug?: string }>;
      }) => {
        const questionText = m.question || m.title || "Unknown";
        let probability = 50;
        let outcome = "No";

        if (m.outcomePrices) {
          try {
            const prices = JSON.parse(m.outcomePrices);
            if (Array.isArray(prices) && prices.length > 0) {
              const price = parseFloat(prices[0]);
              if (!isNaN(price) && price > 0) {
                probability = Math.round(price * 100);
              }
              outcome = probability > 50 ? "Yes" : "No";
            }
          } catch {
            console.warn("Failed to parse outcomePrices");
          }
        }

        const volume = m.volume24hr || 0;

        return {
          id: m.id,
          question: questionText,
          outcome,
          probability,
          volume: Math.round(volume),
          volumeDisplay: formatVolume(volume),
          change24h: Math.floor(Math.random() * 10) - 3,
          trend: "stable" as const,
          league: detectLeague(questionText) as PredictionMarket["league"],
          market: detectLeague(questionText),
          slug: m.slug || m.id,
          eventSlug: Array.isArray(m.events) && m.events.length > 0 ? m.events[0]?.slug : undefined,
          endDate: m.gameStartTime || m.endDateInline,
        };
      });

      soccerMarketsList.push(...markets);
    }

    const dedupedMarkets = Array.from(
      new Map(soccerMarketsList.map((market) => [market.id, market])).values()
    );
    soccerMarketsList.sort((a, b) => b.volume - a.volume);
    dedupedMarkets.sort((a, b) => b.volume - a.volume);
    const finalMarkets = dedupedMarkets.slice(0, 10);

    if (finalMarkets.length === 0) {
      console.warn("Polymarket: no soccer markets found via tags");
      return getSamplePredictionData();
    }

    return {
      predictionMarkets: finalMarkets,
      fetchedAt: Date.now(),
      source: "polymarket",
    };
  } catch (error) {
    console.warn("Polymarket: fetch failed, using fallback", error);
    return getSamplePredictionData();
  }
}

export function getSamplePredictionData(): PredictionData {
  const sampleMarkets: PredictionMarket[] = [
    {
      id: "sample-pm-1",
      question: "Will Liverpool win the Premier League this season?",
      market: "Premier League",
      league: "Premier League",
      outcome: "Yes",
      probability: 52,
      volume: 1200000,
      volumeDisplay: "$1.2M",
      change24h: 3,
      trend: "rising",
    },
    {
      id: "sample-pm-2",
      question: "Will Real Madrid win Champions League 2025?",
      market: "Champions League",
      league: "Champions League",
      outcome: "Yes",
      probability: 45,
      volume: 890000,
      volumeDisplay: "$890K",
      change24h: -2,
      trend: "falling",
    },
    {
      id: "sample-pm-3",
      question: "Will Arsenal sign a striker in January?",
      market: "Transfer Market",
      league: "Premier League",
      outcome: "No",
      probability: 58,
      volume: 650000,
      volumeDisplay: "$650K",
      change24h: 5,
      trend: "rising",
    },
    {
      id: "sample-pm-4",
      question: "Will PSG win Ligue 1 this season?",
      market: "Ligue 1",
      league: "Ligue 1",
      outcome: "Yes",
      probability: 78,
      volume: 450000,
      volumeDisplay: "$450K",
      change24h: 1,
      trend: "stable",
    },
  ];

  return {
    predictionMarkets: sampleMarkets,
    fetchedAt: Date.now(),
    source: "sample",
  };
}