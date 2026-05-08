import type { IsoTimestamp, League, SourceTier } from "./types";

export const LEAGUE_KEYWORDS: Record<League, string[]> = {
  "Premier League": ["premier league", "arsenal", "manchester", "liverpool", "chelsea", "tottenham", "newcastle", "aston villa"],
  "La Liga": ["la liga", "barcelona", "real madrid", "atletico", "sevilla", "athletic club"],
  "Serie A": ["serie a", "juventus", "inter", "ac milan", "napoli", "roma", "atalanta"],
  "Bundesliga": ["bundesliga", "bayern", "dortmund", "leverkusen", "rb leipzig", "stuttgart"],
  "Ligue 1": ["ligue 1", "psg", "marseille", "monaco", "lyon", "lille"],
  "Champions League": ["champions league", "ucl"],
};

export const CLUB_NAMES = [
  "Arsenal",
  "Aston Villa",
  "Atletico Madrid",
  "Barcelona",
  "Bayer Leverkusen",
  "Bayern Munich",
  "Borussia Dortmund",
  "Chelsea",
  "Inter",
  "Juventus",
  "Liverpool",
  "Manchester City",
  "Manchester United",
  "Marseille",
  "Monaco",
  "Napoli",
  "Newcastle",
  "Paris Saint-Germain",
  "PSG",
  "Real Madrid",
  "Roma",
  "Sevilla",
  "Tottenham",
];

export function detectLeague(text: string, fallback: League = "Premier League"): League {
  const lowerText = text.toLowerCase();
  for (const [league, keywords] of Object.entries(LEAGUE_KEYWORDS) as Array<[League, string[]]>) {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      return league;
    }
  }
  return fallback;
}

export function detectClub(text: string, fallback = "Unknown"): string {
  const lowerText = text.toLowerCase();
  const match = CLUB_NAMES.find((club) => lowerText.includes(club.toLowerCase()));
  return match ?? fallback;
}

export function extractPlayer(text: string): string | undefined {
  const match = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/);
  return match ? match[1] : undefined;
}

export function toIsoTimestamp(dateValue: string | number | Date): IsoTimestamp {
  return new Date(dateValue).toISOString() as IsoTimestamp;
}

export function toDisplayTime(dateValue: string | number | Date): string {
  const date = new Date(dateValue);
  return `${date.getUTCHours().toString().padStart(2, "0")}:${date.getUTCMinutes().toString().padStart(2, "0")}`;
}

export function inferSourceTier(text: string): SourceTier {
  const lowerText = text.toLowerCase();
  if (lowerText.includes("official") || lowerText.includes("confirmed") || lowerText.includes("here we go")) {
    return "Tier 1";
  }
  if (lowerText.includes("report") || lowerText.includes("talks") || lowerText.includes("interest")) {
    return "Tier 2";
  }
  return "Tier 3";
}
