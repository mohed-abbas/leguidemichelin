# tools/scrape — Michelin one-shot scraper

**NEVER called at runtime.** This is a developer tool that produces a JSON fixture committed to git. The Prisma seed (`npm run db:seed`) reads the committed fixture. There is no scrape-to-runtime path anywhere in the app.

## Policy (PITFALLS #4, #15, T-01-SCRAPE-ABUSE)

- 1 request per ~1.5 seconds.
- Descriptive User-Agent (`GuideFoodieJourneyBot/0.1`).
- Hard-stop on HTTP 403 / 429 (Cloudflare anti-bot) — no retry loops.
- On failure: no `restaurants.json` is written. The seed falls back to `restaurants.fallback.json` (≥20 hand-curated entries).
- **Never commit a broken or partial `restaurants.json`.** If the scrape fails midway, delete any partial output and rely on the fallback.

## One-time setup

```bash
cd guide-dev
npm install
# Install the headless Chromium browser binary (once per dev machine)
npx playwright install chromium
```

## Run the scrape

```bash
cd guide-dev
npm run scrape:michelin
# → writes tools/scrape/seed-data/restaurants.json on success
# → exits non-zero + prints a failure message on HTTP 403/429 or zero-results
```

Dry-run (prints URLs it would fetch, no network calls):

```bash
cd guide-dev/tools/scrape
npm run scrape:dry
```

## Disclaimer

Not affiliated with or endorsed by Le Guide Michelin. This project uses public listings solely for an educational hackathon demo. Do NOT run this scraper in CI or production.

## Scope (Phase 1)

Paris + Lyon only (CONTEXT D-16). The scraper accepts `--cities=<csv>`, but seeds outside Paris+Lyon are not committed in v1.

## Fallback JSON (DATA-02)

`seed-data/restaurants.fallback.json` ships 20 hand-curated entries across all four Michelin tiers (5 BIB / 7 ONE / 4 TWO / 3 THREE + 1 ONE for Paul Bocuse Collonges). The demo is always bootable without network access.
