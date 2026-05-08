# Soccer Situation Monitor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished Next.js + TypeScript prototype for an analyst/trader soccer situation monitor using realistic sample data.

**Architecture:** Scaffold a Next.js App Router app in the existing repository. Keep sample soccer data typed and accessed through helper functions, with Server Components loading the initial dashboard data and focused Client Components handling filters, selected signals, and map interactions.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, React, lucide-react, Vitest, Testing Library, jsdom.

---

## File Structure

- Create scaffolded Next.js files with `create-next-app` using `src/`, App Router, TypeScript, Tailwind, ESLint, npm, and Turbopack.
- Modify `src/app/page.tsx` to send users to the dashboard.
- Create `src/app/(app)/dashboard/page.tsx` as the server-loaded dashboard route.
- Create `src/lib/soccer/types.ts` for shared dashboard data types.
- Create `src/lib/soccer/sample-data.ts` for sample alerts, market movers, news, injuries, and geographic hotspots.
- Create `src/lib/soccer/filters.ts` for filter option derivation, filtering, sorting, and dashboard summary helpers.
- Create `src/components/dashboard/dashboard-client.tsx` as the main interactive Client Component.
- Create focused dashboard components under `src/components/dashboard/`: controls, geographic map, signal badges, alert list, market sections, news feed, and detail panel.
- Create tests in `src/lib/soccer/filters.test.ts` and `src/components/dashboard/signal-badge.test.tsx`.

---

### Task 1: Scaffold The Next.js App

**Files:**
- Create: Next.js scaffold in repository root
- Modify: `package.json`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Scaffold Next.js**

Run:

```bash
npx create-next-app@latest . --yes --force --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-npm
```

Expected: Next.js app files are created in the existing repository. The existing `docs/` folder remains.

- [ ] **Step 2: Install UI and test dependencies**

Run:

```bash
npm install lucide-react
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
```

Expected: `package.json` includes `lucide-react` and test dependencies.

- [ ] **Step 3: Add test scripts**

Modify `package.json` scripts to include:

```json
{
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Keep existing `dev`, `build`, `start`, and `lint` scripts.

- [ ] **Step 4: Fix font placement for Tailwind v4**

In `src/app/layout.tsx`, put Geist font variables on `<html>` and keep `<body>` simple:

```tsx
<html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
  <body className="antialiased">{children}</body>
</html>
```

- [ ] **Step 5: Commit scaffold**

Run:

```bash
git add package.json package-lock.json next.config.* tsconfig.json eslint.config.* postcss.config.* src
git commit -m "chore: scaffold soccer monitor app"
```

---

### Task 2: Add Typed Soccer Sample Data

**Files:**
- Create: `src/lib/soccer/types.ts`
- Create: `src/lib/soccer/sample-data.ts`
- Test: `src/lib/soccer/filters.test.ts` in the next task

- [ ] **Step 1: Create shared types**

Create `src/lib/soccer/types.ts`:

```ts
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
```

- [ ] **Step 2: Create realistic sample data**

Create `src/lib/soccer/sample-data.ts` with at least:

```ts
import type {
  DashboardData,
  DashboardSignal,
  Hotspot,
  InjuryItem,
  MatchMarketMover,
  NewsItem,
  TransferMarketMover,
} from "./types";

const matchMovers: MatchMarketMover[] = [
  {
    id: "match-mci-rma-rodri",
    title: "City midfield injury shock moves Madrid price",
    summary: "A late training absence pushes the Madrid draw-no-bet market into heavier demand.",
    league: "Champions League",
    club: "Manchester City",
    player: "Rodri",
    marketType: "match",
    severity: "Shock",
    sourceTier: "Tier 1",
    region: "England",
    timestamp: "10:42",
    impact: "Model win probability moved from 54% to 48% after availability risk.",
    relatedSource: "Club availability briefing",
    fixture: "Manchester City vs Real Madrid",
    probabilityBefore: 54,
    probabilityAfter: 48,
    oddsDirection: "drifting",
    driver: "Late midfield availability concern",
  },
  {
    id: "match-psg-bay-form",
    title: "PSG price shortens after Bayern defensive rotation",
    summary: "Projected Bayern back line changes create a fresh attacking mismatch signal.",
    league: "Champions League",
    club: "Paris Saint-Germain",
    marketType: "match",
    severity: "Move",
    sourceTier: "Tier 2",
    region: "France",
    timestamp: "09:58",
    impact: "PSG implied probability rose four points in the sample model.",
    relatedSource: "Team news desk",
    fixture: "Paris Saint-Germain vs Bayern Munich",
    probabilityBefore: 41,
    probabilityAfter: 45,
    oddsDirection: "shortening",
    driver: "Bayern defensive rotation reports",
  },
];

const transferMovers: TransferMarketMover[] = [
  {
    id: "transfer-wirtz-arsenal",
    title: "Wirtz links escalate from rumor to direct talks",
    summary: "Multiple reports move the Arsenal link from speculative to active negotiation watch.",
    league: "Bundesliga",
    club: "Bayer Leverkusen",
    player: "Florian Wirtz",
    marketType: "transfer",
    severity: "Move",
    sourceTier: "Tier 1",
    region: "Germany",
    timestamp: "11:06",
    impact: "Likelihood jumps from 22% to 38% after source-tier upgrade.",
    relatedSource: "Tier 1 transfer reporter",
    linkedClubs: ["Arsenal", "Real Madrid", "Bayern Munich"],
    likelihoodBefore: 22,
    likelihoodAfter: 38,
    feeRange: "EUR110m-EUR135m",
  },
  {
    id: "transfer-osimhen-chelsea",
    title: "Chelsea striker watch returns after Napoli fee signal",
    summary: "Fee-range chatter reopens a monitored transfer situation without confirmation.",
    league: "Serie A",
    club: "Napoli",
    player: "Victor Osimhen",
    marketType: "transfer",
    severity: "Monitor",
    sourceTier: "Tier 3",
    region: "Italy",
    timestamp: "08:34",
    impact: "Market stays watched until a stronger source confirms negotiations.",
    relatedSource: "Aggregator rumor stack",
    linkedClubs: ["Chelsea", "Paris Saint-Germain"],
    likelihoodBefore: 18,
    likelihoodAfter: 24,
    feeRange: "EUR85m-EUR105m",
  },
];

const signals: DashboardSignal[] = [...matchMovers, ...transferMovers];

const news: NewsItem[] = [
  {
    id: "news-barca-yamal",
    headline: "Barcelona expected to protect Lamine Yamal minutes before Europe",
    league: "La Liga",
    club: "Barcelona",
    player: "Lamine Yamal",
    marketType: "match",
    sourceTier: "Tier 2",
    timestamp: "10:15",
    impactTag: "rotation risk",
  },
  {
    id: "news-liverpool-salah",
    headline: "Liverpool training images reduce Salah availability concern",
    league: "Premier League",
    club: "Liverpool",
    player: "Mohamed Salah",
    marketType: "match",
    sourceTier: "Tier 1",
    timestamp: "09:21",
    impactTag: "price support",
  },
];

const injuries: InjuryItem[] = [
  {
    id: "injury-rodri",
    player: "Rodri",
    club: "Manchester City",
    league: "Champions League",
    status: "Late fitness check",
    expectedAbsence: "Matchday decision",
    severity: "Shock",
    marketImpact: "City win probability drifting in sample model",
  },
];

const hotspots: Hotspot[] = [
  { id: "hot-london", city: "London", country: "England", region: "England", league: "Premier League", x: 40, y: 40, intensity: 82, dominantMarketType: "transfer", topEntity: "Arsenal", activeSignals: 5 },
  { id: "hot-manchester", city: "Manchester", country: "England", region: "England", league: "Champions League", x: 38, y: 34, intensity: 95, dominantMarketType: "match", topEntity: "Manchester City", activeSignals: 4 },
  { id: "hot-madrid", city: "Madrid", country: "Spain", region: "Spain", league: "La Liga", x: 34, y: 66, intensity: 68, dominantMarketType: "match", topEntity: "Real Madrid", activeSignals: 3 },
  { id: "hot-munich", city: "Munich", country: "Germany", region: "Germany", league: "Bundesliga", x: 57, y: 51, intensity: 74, dominantMarketType: "transfer", topEntity: "Bayern Munich", activeSignals: 4 },
  { id: "hot-milan", city: "Milan", country: "Italy", region: "Italy", league: "Serie A", x: 55, y: 62, intensity: 61, dominantMarketType: "transfer", topEntity: "Inter", activeSignals: 2 },
  { id: "hot-paris", city: "Paris", country: "France", region: "France", league: "Ligue 1", x: 47, y: 49, intensity: 70, dominantMarketType: "match", topEntity: "Paris Saint-Germain", activeSignals: 3 },
];

export function getDashboardData(): DashboardData {
  return { signals, matchMovers, transferMovers, news, injuries, hotspots };
}
```

- [ ] **Step 3: Run type check**

Run:

```bash
npm run lint
```

Expected: no TypeScript or lint errors from the new data modules.

- [ ] **Step 4: Commit typed data**

Run:

```bash
git add src/lib/soccer
git commit -m "feat: add soccer monitor sample data"
```

---

### Task 3: Add Filter Logic With Tests

**Files:**
- Create: `src/lib/soccer/filters.ts`
- Create: `src/lib/soccer/filters.test.ts`

- [ ] **Step 1: Write failing filter tests**

Create `src/lib/soccer/filters.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { filterSignals, getSeverityRank, getTopSignals } from "./filters";
import { getDashboardData } from "./sample-data";

describe("soccer dashboard filters", () => {
  const data = getDashboardData();

  it("filters signals by market type and league", () => {
    const result = filterSignals(data.signals, {
      league: "Champions League",
      marketType: "match",
      severity: "all",
      watchlist: "all",
    });

    expect(result.every((signal) => signal.league === "Champions League")).toBe(true);
    expect(result.every((signal) => signal.marketType === "match")).toBe(true);
  });

  it("sorts severe signals before lower priority signals", () => {
    const result = getTopSignals(data.signals);

    expect(getSeverityRank(result[0].severity)).toBeGreaterThanOrEqual(
      getSeverityRank(result[result.length - 1].severity),
    );
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
npm test -- src/lib/soccer/filters.test.ts
```

Expected: FAIL because `filters.ts` does not exist.

- [ ] **Step 3: Implement filter helpers**

Create `src/lib/soccer/filters.ts`:

```ts
import type { DashboardSignal, League, MarketType, SignalSeverity } from "./types";

export type DashboardFilters = {
  league: League | "all";
  marketType: MarketType | "all";
  severity: SignalSeverity | "all";
  watchlist: string | "all";
};

const severityRank: Record<SignalSeverity, number> = {
  Noise: 1,
  Monitor: 2,
  Move: 3,
  Shock: 4,
};

export function getSeverityRank(severity: SignalSeverity): number {
  return severityRank[severity];
}

export function filterSignals(
  signals: DashboardSignal[],
  filters: DashboardFilters,
): DashboardSignal[] {
  return signals.filter((signal) => {
    const leagueMatches = filters.league === "all" || signal.league === filters.league;
    const marketMatches = filters.marketType === "all" || signal.marketType === filters.marketType;
    const severityMatches = filters.severity === "all" || signal.severity === filters.severity;
    const watchlistMatches = filters.watchlist === "all" || signal.club === filters.watchlist || signal.player === filters.watchlist;

    return leagueMatches && marketMatches && severityMatches && watchlistMatches;
  });
}

export function getTopSignals(signals: DashboardSignal[], limit = 6): DashboardSignal[] {
  return [...signals]
    .sort((a, b) => getSeverityRank(b.severity) - getSeverityRank(a.severity))
    .slice(0, limit);
}

export function getWatchlistOptions(signals: DashboardSignal[]): string[] {
  return Array.from(new Set(signals.flatMap((signal) => [signal.club, signal.player].filter(Boolean) as string[]))).sort();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run:

```bash
npm test -- src/lib/soccer/filters.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit filter logic**

Run:

```bash
git add src/lib/soccer/filters.ts src/lib/soccer/filters.test.ts
git commit -m "feat: add soccer monitor filters"
```

---

### Task 4: Build Dashboard Route And Styling Foundation

**Files:**
- Modify: `src/app/page.tsx`
- Create: `src/app/(app)/dashboard/page.tsx`
- Create: `src/components/dashboard/dashboard-client.tsx`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Route root into dashboard**

Replace `src/app/page.tsx` with:

```tsx
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
```

- [ ] **Step 2: Create dashboard server page**

Create `src/app/(app)/dashboard/page.tsx`:

```tsx
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { getDashboardData } from "@/lib/soccer/sample-data";

export default function DashboardPage() {
  const data = getDashboardData();

  return <DashboardClient data={data} />;
}
```

- [ ] **Step 3: Set dashboard global styling**

In `src/app/globals.css`, keep Tailwind imports and set a restrained app theme:

```css
@import "tailwindcss";

:root {
  --background: #f3f5f1;
  --foreground: #111f1a;
}

body {
  background: var(--background);
  color: var(--foreground);
}

button,
select {
  font: inherit;
}
```

- [ ] **Step 4: Add a compiling dashboard shell**

Create `src/components/dashboard/dashboard-client.tsx`:

```tsx
"use client";

import type { DashboardData } from "@/lib/soccer/types";

export function DashboardClient({ data }: { data: DashboardData }) {
  return (
    <main className="min-h-screen p-6 text-zinc-950">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Soccer Situation Monitor</p>
        <h1 className="mt-2 text-3xl font-bold tracking-normal">European market operations board</h1>
        <p className="mt-3 text-sm text-zinc-600">{data.signals.length} sample signals loaded.</p>
      </div>
    </main>
  );
}
```

- [ ] **Step 5: Run route verification**

Run:

```bash
npm run lint
npm run build
```

Expected: PASS.

---

### Task 5: Build Interactive Dashboard Components

**Files:**
- Modify: `src/components/dashboard/dashboard-client.tsx`
- Create: `src/components/dashboard/dashboard-controls.tsx`
- Create: `src/components/dashboard/geographic-market-map.tsx`
- Create: `src/components/dashboard/signal-badge.tsx`
- Create: `src/components/dashboard/alert-list.tsx`
- Create: `src/components/dashboard/market-sections.tsx`
- Create: `src/components/dashboard/news-feed.tsx`
- Create: `src/components/dashboard/detail-panel.tsx`

- [ ] **Step 1: Create signal badge component**

Create `src/components/dashboard/signal-badge.tsx`:

```tsx
import type { SignalSeverity, SourceTier } from "@/lib/soccer/types";

const severityClass: Record<SignalSeverity, string> = {
  Noise: "border-slate-300 bg-slate-100 text-slate-700",
  Monitor: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Move: "border-amber-200 bg-amber-50 text-amber-700",
  Shock: "border-red-200 bg-red-50 text-red-700",
};

export function SeverityBadge({ severity }: { severity: SignalSeverity }) {
  return (
    <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${severityClass[severity]}`}>
      {severity}
    </span>
  );
}

export function SourceTierBadge({ tier }: { tier: SourceTier }) {
  return (
    <span className="rounded-full border border-zinc-300 bg-white px-2 py-1 text-xs font-semibold text-zinc-700">
      {tier}
    </span>
  );
}
```

- [ ] **Step 2: Replace the dashboard shell with the interactive client**

Replace `src/components/dashboard/dashboard-client.tsx` with state for filters and selected signal:

```tsx
"use client";

import { Activity, useMemo, useState } from "react";
import type { DashboardData, DashboardSignal } from "@/lib/soccer/types";
import { filterSignals, getTopSignals, type DashboardFilters } from "@/lib/soccer/filters";
import { AlertList } from "./alert-list";
import { DashboardControls } from "./dashboard-controls";
import { DetailPanel } from "./detail-panel";
import { GeographicMarketMap } from "./geographic-market-map";
import { MarketSections } from "./market-sections";
import { NewsFeed } from "./news-feed";

export function DashboardClient({ data }: { data: DashboardData }) {
  const [filters, setFilters] = useState<DashboardFilters>({
    league: "all",
    marketType: "all",
    severity: "all",
    watchlist: "all",
  });
  const [selectedSignal, setSelectedSignal] = useState<DashboardSignal | null>(data.signals[0] ?? null);

  const filteredSignals = useMemo(() => filterSignals(data.signals, filters), [data.signals, filters]);
  const topSignals = useMemo(() => getTopSignals(filteredSignals), [filteredSignals]);

  return (
    <main className="min-h-screen p-4 text-zinc-950 md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="flex flex-col gap-3 border-b border-zinc-300 pb-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Soccer Situation Monitor</p>
            <h1 className="text-3xl font-bold tracking-normal">European market operations board</h1>
          </div>
          <DashboardControls data={data} filters={filters} onChange={setFilters} />
        </header>

        <GeographicMarketMap hotspots={data.hotspots} signals={filteredSignals} onSelectSignal={setSelectedSignal} />

        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="flex flex-col gap-4">
            <AlertList signals={topSignals} onSelectSignal={setSelectedSignal} selectedId={selectedSignal?.id} />
            <MarketSections data={data} onSelectSignal={setSelectedSignal} />
          </div>
          <div className="flex flex-col gap-4">
            <Activity mode={selectedSignal ? "visible" : "hidden"}>
              <DetailPanel signal={selectedSignal} />
            </Activity>
            <NewsFeed news={data.news} />
          </div>
        </section>
      </div>
    </main>
  );
}
```

- [ ] **Step 3: Implement remaining components**

Use these required behaviors:

- `DashboardControls` renders four `<select>` controls for league, market type, severity, and watchlist, each with an accessible label.
- `GeographicMarketMap` renders a stable-height Europe panel with hotspot buttons absolutely positioned by `x` and `y`; clicking a hotspot selects the highest-severity signal from that hotspot region when one exists.
- `AlertList` renders signal cards with severity badge, source tier badge, title, summary, timestamp, and impact.
- `MarketSections` renders separate match and transfer sections, never mixing their labels.
- `NewsFeed` renders compact news rows.
- `DetailPanel` renders title, severity, source tier, market type, impact, related source, and summary for the selected signal.

- [ ] **Step 4: Run build checks**

Run:

```bash
npm run lint
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit dashboard UI**

Run:

```bash
git add src/app src/components src/lib
git commit -m "feat: build soccer monitor dashboard"
```

---

### Task 6: Add Component Tests

**Files:**
- Create: `src/components/dashboard/signal-badge.test.tsx`

- [ ] **Step 1: Write badge rendering tests**

Create `src/components/dashboard/signal-badge.test.tsx`:

```tsx
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SeverityBadge, SourceTierBadge } from "./signal-badge";

describe("signal badges", () => {
  it("renders market-style severity labels", () => {
    render(<SeverityBadge severity="Shock" />);
    expect(screen.getByText("Shock")).toBeInTheDocument();
  });

  it("renders source tier labels", () => {
    render(<SourceTierBadge tier="Tier 1" />);
    expect(screen.getByText("Tier 1")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run component tests**

Run:

```bash
npm test -- src/components/dashboard/signal-badge.test.tsx
```

Expected: PASS.

- [ ] **Step 3: Commit tests**

Run:

```bash
git add src/components/dashboard/signal-badge.test.tsx
git commit -m "test: cover dashboard signal badges"
```

---

### Task 7: Verify Responsive Dashboard In Browser

**Files:**
- Modify only if verification finds layout defects.

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev
```

Expected: app starts on a local URL, usually `http://localhost:3000`.

- [ ] **Step 2: Open dashboard**

Open:

```text
http://localhost:3000/dashboard
```

Expected: dashboard loads without accounts, environment variables, or external services.

- [ ] **Step 3: Desktop checks**

Verify at desktop width:

- Map spans the top dashboard area and is readable.
- Alerts below the map are immediately scannable.
- `Shock` and `Move` cards are visually stronger than `Monitor` and `Noise`.
- Match and transfer market areas are separate.
- Selecting cards updates the detail panel.
- Filters visibly change the alert list.

- [ ] **Step 4: Mobile checks**

Verify at mobile width:

- Header controls wrap cleanly.
- Map remains readable and does not overlap labels.
- Cards stack without text overflow.
- Detail panel and news feed remain accessible below the main alerts.

- [ ] **Step 5: Run final verification**

Run:

```bash
npm test
npm run lint
npm run build
```

Expected: all commands pass.

- [ ] **Step 6: Commit verification fixes**

If edits were needed, run:

```bash
git add src
git commit -m "fix: polish soccer monitor responsive layout"
```

If no edits were needed, do not create an empty commit.

---

## Self-Review Checklist

- The plan implements every approved spec requirement: prototype data, top European leagues, match and transfer markets, alert-led dashboard, geographic map, market-style severity, source tiers, auth-ready/no-auth stance, and verification.
- There are no live API, database, scraping, payments, or auth tasks.
- Tests cover filter logic and severity/source-tier rendering.
- The file structure gives future API replacement a clear path through typed data helpers.
- The dashboard is tool-first and does not include a marketing landing page.
