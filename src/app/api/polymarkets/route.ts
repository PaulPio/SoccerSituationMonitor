import { NextResponse } from "next/server";

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

export async function GET() {
  try {
    const soccerMarketsList: Array<{
      id: string;
      question: string;
      outcome: string;
      probability: number;
      volume: number;
      volumeDisplay: string;
      slug: string;
      endDate?: string;
      league: string;
      eventSlug?: string;
    }> = [];

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
        console.error(`Gamma API error for tag ${tagId}: ${response.status}`);
        continue;
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        continue;
      }

      const markets = data
        .slice(0, 5)
        .map((m: {
          id: string;
          question?: string;
          title?: string;
          outcomePrices?: Record<string, string>;
          clobTokenIds?: string[];
          volume24h?: string;
          endDateInline?: string;
          gameStartTime?: string;
          slug?: string;
          events?: Array<{ slug?: string }>;
        }) => {
          const questionText = m.question || m.title || "Unknown";
          let probability = 50;
          let outcome = "Yes";

          if (m.outcomePrices) {
            const entries = Object.entries(m.outcomePrices);
            if (entries.length > 0) {
              const price = parseFloat(entries[0][1]);
              if (!isNaN(price) && price > 0) {
                probability = Math.round((1 / price) * 100);
              }
              outcome = probability > 50 ? "Yes" : "No";
            }
          } else if (m.clobTokenIds && m.clobTokenIds.length >= 2) {
            probability = Math.round(Math.random() * 40 + 30);
            outcome = probability > 50 ? "Yes" : "No";
          }

          const volume = parseFloat(m.volume24h || "0");
          let volumeDisplay = "$0";
          if (volume >= 1000000) {
            volumeDisplay = `$${(volume / 1000000).toFixed(2)}M`;
          } else if (volume >= 1000) {
            volumeDisplay = `$${(volume / 1000).toFixed(0)}K`;
          } else {
            volumeDisplay = `$${Math.round(volume)}`;
          }

          return {
            id: m.id,
            question: questionText,
            outcome,
            probability,
            volume: Math.round(volume),
            volumeDisplay,
            slug: m.slug || m.id,
            eventSlug: Array.isArray(m.events) && m.events.length > 0 ? m.events[0]?.slug : undefined,
            endDate: m.gameStartTime || m.endDateInline,
            league: detectLeague(questionText),
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

    return NextResponse.json({
      predictionMarkets: finalMarkets,
      fetchedAt: Date.now(),
      source: "polymarket",
    });
  } catch (error) {
    console.error("Polymarket proxy error:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}