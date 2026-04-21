# Guide Foodie Journey

Michelin-inspired souvenir PWA (hackathon). Diners scan a QR at a Michelin-listed restaurant, mint a "souvenir" (photo + note), earn points scaled to the restaurant's Michelin stars, and redeem for mocked rewards. Restaurant staff manage their menu via a separate portal.

> **Not affiliated with or endorsed by Le Guide Michelin.** This project uses publicly listed restaurant metadata for a 5-day educational hackathon only. Michelin is a registered trademark of Compagnie Générale des Établissements Michelin.

## Status

- Phase 1 — Foundation (current) — monorepo + Prisma schema + PWA shell + scrape + compose
- Phase 2 — Auth + App Shells
- Phase 3 — Restaurant Portal (menu CRUD + QR)
- Phase 4 — Souvenir Loop (DEMO-CRITICAL)
- Phase 5 — Discovery + Redemption
- Phase 6 — Demo Hardening & Deployment

## Prerequisites

- **Docker Engine 29+** and **Docker Compose v2+** (`docker compose version`)
- **Node.js 22 LTS** (`.nvmrc` pins this; `nvm use` recommended)
- **npm 10+** (`npm --version`)
- macOS / Linux / Windows 11 with WSL2

## Boot (3 commands)

```bash
# 1. Copy env template (first-time only). .env is gitignored.
cp .env.example .env

# 2. Boot the full stack — postgres, one-shot migrate, api, web.
docker compose -f compose.dev.yaml up -d

# 3. Seed the database with Michelin restaurants + per-tier dishes.
# Idempotent — safe to re-run.
npm run db:seed
```

After that:

- Web (diner + portal shells) → <http://localhost:3000>
- API healthz → <http://localhost:3001/healthz>
- Portal landing → <http://localhost:3000/portal>

## Michelin scrape (optional, one-shot)

A 20-restaurant hand-curated fallback ships committed at `tools/scrape/seed-data/restaurants.fallback.json`, so `npm run db:seed` works out of the box. If you want to refresh the scraped Paris + Lyon dataset:

```bash
npx playwright install chromium      # one-time, ~200 MB browser download
npm run scrape:michelin              # one-shot; writes tools/scrape/seed-data/restaurants.json
```

**NEVER re-run the scrape in CI or at runtime** — see [`tools/scrape/README.md`](tools/scrape/README.md).

## Prisma model ownership

See [`docs/MODEL-OWNERSHIP.md`](docs/MODEL-OWNERSHIP.md) for the authoritative PR-review reference. Summary:

| Owner      | Models (edits + migrations)                                                         |
| ---------- | ----------------------------------------------------------------------------------- |
| **Murx**   | `User`, `Session`, `Account`, `Verification`, `Souvenir`, `PointTransaction`        |
| **Wilson** | `Restaurant`, `Dish`, `Reward`, `Redemption`                                        |
| **Ilia**   | `@repo/shared-schemas` (Zod DTOs) + `points.service.ts` (awardPoints + ledger math) |

**Schema freeze:** Phase 1 shipped the complete v1 schema. Adding a column or table requires coordination on #hackathon; don't solo-merge schema migrations post-Phase-1.

## Architecture at a glance

- One Next.js 16 app (`apps/web`) hosts both diner + portal via App Router route groups `(diner)` + `(portal)`.
- All business logic lives in Express (`apps/api`). `apps/web` has ZERO `app/api/*` handlers.
- `next.config.ts` rewrites `/api/:path*` → Express over the docker-compose network. Same-origin same-cookie.
- Prisma client is generated per workspace and consumed via `@repo/db`.
- Design tokens live in ONE file: `packages/tokens/tokens.css`. ESLint blocks raw hex anywhere else.
- Image storage = local filesystem via `apps/api/src/storage.ts` abstraction. Swapping backends = single-file change.

## Useful commands

| Command                                      | What it does                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------ |
| `docker compose -f compose.dev.yaml up -d`   | Start the full stack                                                     |
| `docker compose -f compose.dev.yaml down`    | Stop containers, KEEP volumes (restaurants stay seeded)                  |
| `docker compose -f compose.dev.yaml down -v` | Stop AND wipe volumes — **destructive; re-seed required** (PITFALLS #18) |
| `npm run db:seed`                            | Seed / re-seed restaurants (idempotent)                                  |
| `npm run db:studio`                          | Prisma Studio at <http://localhost:5555>                                 |
| `npm run dev:web`                            | Run Next.js on the host (outside compose)                                |
| `npm run dev:api`                            | Run Express on the host (outside compose)                                |

## Planning artifacts

The planning repo (UI-SPEC, research synthesis, task splits per teammate, PROJECT overview) lives in a separate **local-only** sibling directory `../hackathon/.planning/` and is NOT pushed to this GitHub remote. Ask Murx for the relevant file if you need it.

- UI-SPEC (Phase 1 design contract) — `../hackathon/.planning/phases/01-foundation/01-UI-SPEC.md`
- Research synthesis — `../hackathon/.planning/research/SUMMARY.md`
- Ilia task list — `../hackathon/.planning/team/ILIA-TASKS.md`
- Wilson task list — `../hackathon/.planning/team/WILSON-TASKS.md`
- Project overview — `../hackathon/.planning/PROJECT.md`

## License

Educational hackathon project. Not affiliated with Le Guide Michelin.
