export type League =
  | "Premier League"
  | "La Liga"
  | "Serie A"
  | "Bundesliga"
  | "Ligue 1"
  | "Champions League";

export type MarketType = "match" | "transfer";
export type SignalSeverity = "Noise" | "Monitor" | "Move" | "Shock";
export type SourceTier = "Tier 1" | "Tier 2" | "Tier 3";

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
  timestamp: string;
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

export type NewsItem = {
  id: string;
  headline: string;
  league: League;
  club: string;
  player?: string;
  marketType: MarketType;
  sourceTier: SourceTier;
  timestamp: string;
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
  signals: DashboardSignal[];
  matchMovers: MatchMarketMover[];
  transferMovers: TransferMarketMover[];
  news: NewsItem[];
  injuries: InjuryItem[];
  hotspots: Hotspot[];
};
