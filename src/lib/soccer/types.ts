export const LEAGUES = [
  "Premier League",
  "La Liga",
  "Serie A",
  "Bundesliga",
  "Ligue 1",
  "Champions League",
] as const;

export const MARKET_TYPES = ["match", "transfer"] as const;
export const SIGNAL_SEVERITIES = ["Noise", "Monitor", "Move", "Shock"] as const;
export const SOURCE_TIERS = ["Tier 1", "Tier 2", "Tier 3"] as const;

export type League = (typeof LEAGUES)[number];
export type MarketType = (typeof MARKET_TYPES)[number];
export type SignalSeverity = (typeof SIGNAL_SEVERITIES)[number];
export type SourceTier = (typeof SOURCE_TIERS)[number];
export type IsoTimestamp = `${number}-${number}-${number}T${number}:${number}:${number}Z`;

export type DashboardSignal = {
  id: string;
  title: string;
  summary: string;
  league: League;
  club: string;
  player?: string;
  marketType: MarketType;
  severity: SignalSeverity;
  sourceTier: SourceTier;
  region: string;
  timestamp: IsoTimestamp;
  displayTime: string;
  impact: string;
  relatedSource: string;
};

export type MatchMarketMover = DashboardSignal & {
  marketType: "match";
  fixture: string;
  probabilityBefore: number;
  probabilityAfter: number;
  oddsDirection: "shortening" | "drifting" | "stable";
  driver: string;
};

export type TransferMarketMover = DashboardSignal & {
  marketType: "transfer";
  linkedClubs: string[];
  likelihoodBefore: number;
  likelihoodAfter: number;
  feeRange: string;
};

export type MarketMover = MatchMarketMover | TransferMarketMover;

export type NewsItem = {
  id: string;
  headline: string;
  league: League;
  club: string;
  player?: string;
  marketType: MarketType;
  sourceTier: SourceTier;
  timestamp: IsoTimestamp;
  displayTime: string;
  impactTag: string;
};

export type InjuryItem = {
  id: string;
  player: string;
  club: string;
  league: League;
  status: string;
  expectedAbsence: string;
  severity: SignalSeverity;
  marketImpact: string;
};

export type Hotspot = {
  id: string;
  city: string;
  country: string;
  region: string;
  league: League;
  x: number;
  y: number;
  intensity: number;
  dominantMarketType: MarketType;
  topEntity: string;
  activeSignals: number;
};

export type DashboardData = {
  signals: MarketMover[];
  matchMovers: MatchMarketMover[];
  transferMovers: TransferMarketMover[];
  news: NewsItem[];
  injuries: InjuryItem[];
  hotspots: Hotspot[];
};
