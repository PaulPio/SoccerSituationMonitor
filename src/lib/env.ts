const readEnv = (name: string): string | undefined => {
  const value = process.env[name];
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const parseRevalidate = (value: string | undefined, fallbackSeconds: number): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallbackSeconds;
  }
  return parsed;
};

export const externalApiConfig = {
  redditBaseUrl: readEnv("SOCCER_REDDIT_BASE_URL") ?? "https://www.reddit.com",
  newsApiBaseUrl: readEnv("NEWS_API_BASE_URL") ?? "https://newsapi.org/v2",
  footballDataBaseUrl: readEnv("FOOTBALL_DATA_BASE_URL") ?? "https://api.football-data.org/v4",
  oddsApiBaseUrl: readEnv("ODDS_API_BASE_URL") ?? "https://api.the-odds-api.com/v4",
  newsApiKey: readEnv("NEWS_API_KEY"),
  footballDataApiKey: readEnv("FOOTBALL_DATA_API_KEY"),
  oddsApiKey: readEnv("ODDS_API_KEY"),
};

export const externalApiRevalidate = {
  reddit: parseRevalidate(readEnv("SOCCER_REVALIDATE_REDDIT"), 900),
  news: parseRevalidate(readEnv("SOCCER_REVALIDATE_NEWS"), 900),
  football: parseRevalidate(readEnv("SOCCER_REVALIDATE_FOOTBALL"), 1800),
  odds: parseRevalidate(readEnv("SOCCER_REVALIDATE_ODDS"), 900),
};
