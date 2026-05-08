# Soccer Situation Monitor Design

## Summary

Build a Next.js + TypeScript prototype for a soccer situation monitor aimed at analysts and traders. Version 1 uses realistic sample data, not live APIs, and covers the top European leagues plus Champions League.

The app separates match markets and transfer markets while presenting them through one fast triage dashboard. The home screen uses an alert-led layout: a geographic European market map at the top, followed by urgent alerts, odds and prediction movers, transfer heat, injury context, and latest news.

## Product Design

- Audience: analysts/traders who need to identify soccer market changes quickly.
- Coverage: Premier League, La Liga, Serie A, Bundesliga, Ligue 1, and Champions League.
- Data mode: prototype-only sample data, structured to be replaced by real providers later.
- Market areas: match markets and transfer markets remain visually and semantically distinct.
- Severity model: `Noise`, `Monitor`, `Move`, `Shock`.
- Source confidence model: `Tier 1`, `Tier 2`, `Tier 3`.
- Auth stance: auth-ready structure, but no real login, accounts, or access control in v1.

## Architecture

- Use Next.js App Router with TypeScript.
- Main app route: `src/app/(app)/dashboard/page.tsx`.
- Root route: `src/app/page.tsx` should send users into the dashboard or provide a minimal entry link.
- Server components load typed sample data through local data-access helpers.
- Client components handle interactive filtering, selected cards, map hotspot interactions, and detail-panel state.
- Centralize sample data in typed modules for alerts, match market movers, transfer market movers, news, injuries, and geographic hotspots.
- Wrap sample data access behind simple functions so live APIs can replace the sample data without reshaping UI components.

The interface should feel like a professional operations board: dense, scannable, restrained, and tool-first. Do not build a marketing landing page.

## Dashboard Behavior

- Top controls include league filter, market type filter, signal severity filter, and compact watchlist selector.
- Geographic market map shows Europe-focused hotspot intensity by city or region.
- Hotspots expose concise details such as active signal count, dominant market type, and top related club/player.
- Alert modules emphasize `Shock` and `Move` signals over `Monitor` and `Noise`.
- Match market cards show probability movement, odds direction, injury/form drivers, source tier, and why the signal matters.
- Transfer market cards show rumor heat, likelihood movement, linked clubs, source tier, and estimated valuation or fee range.
- News feed items show headline, source tier, timestamp, related club/player, and market impact tag.
- Selecting a card updates a detail panel with a short impact summary, related sample sources, and affected market.

## Sample Scenarios

The prototype data should demonstrate:

- A shock injury before a Champions League match.
- Odds movement tied to team news.
- Transfer rumor escalation from `Tier 3` to `Tier 1`.
- Regional hotspot activity across England, Spain, Germany, Italy, and France.
- Both match-market and transfer-market signals visible on the dashboard at the same time.

## Testing And Acceptance

Success means a user can run the app locally and immediately understand the soccer market situation without setup, accounts, or external services.

Acceptance criteria:

- Dashboard loads with realistic sample data.
- Filters visibly change dashboard content.
- Map hotspots are readable and connect to alert/detail content.
- Signal severity and source-tier labels are consistently rendered.
- Desktop layout is polished and scannable.
- Mobile layout remains usable without text overlap.

Verification should include:

- Type checking and lint/build verification.
- Unit tests for sample data helpers and filter logic.
- Component tests for severity/source-tier rendering and dashboard filtering when a test runner is available.
- Browser checks for desktop and mobile viewport sizes.

## Constraints

- Do not wire live APIs in v1.
- Do not implement real auth, payments, databases, or scraping.
- Do not require environment variables for the prototype.
- Use Next.js App Router and TypeScript.
- Use icons in controls and buttons where appropriate.
- Keep UI dimensions stable for the map, tiles, cards, and controls.
- Avoid decorative landing-page patterns; the first screen is the working monitor.
