# Guide Foodie Journey

Michelin-inspired souvenir PWA (hackathon). Diners scan a QR at a Michelin-listed restaurant, mint a "souvenir" (photo + note), earn points scaled to the restaurant's Michelin stars, and redeem for mocked rewards. Restaurant staff manage their menu via a portal. Platform admins manage restaurants and users from a dashboard.

> **Not affiliated with or endorsed by Le Guide Michelin.** This project uses publicly listed restaurant metadata for a 5-day educational hackathon only. Michelin is a registered trademark of Compagnie Générale des Établissements Michelin.

## Status

- ✅ Phase 1 — Foundation (monorepo + Prisma schema + PWA shell + compose + scrape)
- ✅ Phase 2 — Auth + App Shells (Better Auth, three roles, route groups)
- ✅ Phase 3 — Complete Backend + ADMIN (every endpoint, frozen contract, seed, admin APIs)
- 🔨 Phase 4 — Parallel Frontend Tracks (diner / portal / admin — one dev per track)
- ⏳ Phase 5 — Demo Hardening & Deployment (VPS + Caddy + Mapbox URL-restriction)

Backend API contract is frozen at `docs/BACKEND-CONTRACT.md` — Phase 4 UIs consume it.

## Prerequisites

- **Docker Engine 29+** and **Docker Compose v2+** (`docker compose version`)
- **Node.js 22 LTS** (`.nvmrc` pins this; `nvm use` recommended) — only required for running commands on the host outside Docker
- **npm 10+** — same caveat

Docker is the only hard requirement for day-to-day development. Everything (Postgres, migrations, seed, API, web) runs in compose.

## Boot on a fresh machine (one command, after copying env)

```bash
# 1. Copy env template (first-time only). .env is gitignored.
cp .env.example .env

# 2. Fill in the two values that are empty by default:
#    - BETTER_AUTH_SECRET  (generate: openssl rand -base64 32)
#    - NEXT_PUBLIC_MAPBOX_TOKEN  (pk.* token from https://mapbox.com — optional
#      for Phase 1-3 backend work; required for Phase 4 diner map)
#    Everything else has working defaults.

# 3. Boot the full stack. Compose does the rest:
#      postgres  → ready (healthcheck)
#      migrate   → prisma migrate deploy (one-shot)
#      api       → Express on :3001 (healthcheck)
#      seed      → idempotent seed (one-shot, waits for api healthy)
#      web       → Next.js on :3000
docker compose -f compose.dev.yaml up -d

# 4. Watch the seed finish (optional — takes ~20s on first run):
docker compose -f compose.dev.yaml logs -f seed
```

That's it. No second terminal, no manual `npm install`, no host-side Prisma client, no manual `db:seed`. The seed is idempotent — every `compose up` re-runs it safely.

After the stack is up:

- Web (diner + portal + admin) → <http://localhost:3000>
- API healthz → <http://localhost:3001/healthz>
- Portal landing → <http://localhost:3000/portal>
- Admin landing → <http://localhost:3000/admin>

## Michelin scrape (optional, one-shot)

A 20-restaurant hand-curated fallback ships committed at `tools/scrape/seed-data/restaurants.fallback.json`, so the seed service works out of the box. If you want to refresh the scraped Paris + Lyon dataset:

```bash
npx playwright install chromium      # one-time, ~200 MB browser download
npm run scrape:michelin              # one-shot; writes tools/scrape/seed-data/restaurants.json
```

Then `docker compose -f compose.dev.yaml up -d` — the `seed` service will pick up the fresher file automatically (it prefers `restaurants.json` over the fallback).

**NEVER re-run the scrape in CI or at runtime** — see [`tools/scrape/README.md`](tools/scrape/README.md).

## Prisma model + shared-file ownership (post-Phase-3 freeze)

Phase 3 shipped the complete v1 schema + frozen API contract. From Phase 4 onward the rules harden.

| Path                                                     | Owner  | Status                         |
| -------------------------------------------------------- | ------ | ------------------------------ |
| `packages/db/schema.prisma` + migrations                 | Murx   | FROZEN — only Murx edits       |
| `packages/shared-schemas/`                               | Murx   | FROZEN — only Murx edits       |
| `packages/tokens/tokens.css`                             | Murx   | FROZEN — designer re-skin only |
| `packages/ui/`                                           | Murx   | FROZEN                         |
| `packages/db/prisma/seed.ts`                             | Murx   | FROZEN                         |
| `app/(admin)/*`                                          | Ilia   | Phase 4 track                  |
| `app/(portal)/*` + diner restaurants/rewards/redemptions | Wilson | Phase 4 track                  |
| `app/(diner)/scan\|souvenirs\|collection\|points\|map`   | Murx   | Phase 4 track                  |

Any change to a frozen file implies a contract change → route it through Murx.

Legacy per-model ownership (pre-Phase-3, kept for historical PR review):

| Owner      | Models                                                                              |
| ---------- | ----------------------------------------------------------------------------------- |
| **Murx**   | `User`, `Session`, `Account`, `Verification`, `Souvenir`, `PointTransaction`        |
| **Wilson** | `Restaurant`, `Dish`, `Reward`, `Redemption`                                        |
| **Ilia**   | `@repo/shared-schemas` (Zod DTOs) + `points.service.ts` (awardPoints + ledger math) |

See [`docs/MODEL-OWNERSHIP.md`](docs/MODEL-OWNERSHIP.md) for deeper rationale.

## Architecture at a glance

- **One Next.js 16 app** (`apps/web`) hosts diner + portal + admin via App Router route groups `(diner)`, `(portal)`, `(admin)`. Same origin, same cookie, same PWA.
- **All business logic lives in Express** (`apps/api`). `apps/web` has ZERO `app/api/*` handlers.
- `next.config.ts` rewrites `/api/:path*` → Express over the docker-compose network. Same-origin same-cookie.
- Prisma client is generated per workspace and consumed via `@repo/db`.
- **Three roles:** `DINER`, `RESTAURANT_STAFF`, `ADMIN`. Server-side `requireRole(...)` guards every mutating endpoint.
- **Design tokens live in ONE file:** `packages/tokens/tokens.css`. ESLint blocks raw hex anywhere else.
- **Image storage** = local Docker volume via `apps/api/src/storage.ts` abstraction. Swapping backends = single-file change.
- **Mapbox GL JS** powers the diner souvenir map (Phase 4). Public `pk.*` token — URL-restrict in the Mapbox dashboard to localhost + demo VPS host before demo day. Never commit `sk.*`.

## Useful commands

| Command                                           | What it does                                                               |
| ------------------------------------------------- | -------------------------------------------------------------------------- |
| `docker compose -f compose.dev.yaml up -d`        | Start the full stack (migrate + seed auto-run)                             |
| `docker compose -f compose.dev.yaml logs -f`      | Tail all service logs                                                      |
| `docker compose -f compose.dev.yaml logs -f seed` | Watch seed output specifically                                             |
| `docker compose -f compose.dev.yaml down`         | Stop containers, KEEP volumes (DB + images preserved)                      |
| `docker compose -f compose.dev.yaml down -v`      | Stop AND wipe volumes — **destructive; next `up` re-seeds** (PITFALLS #18) |
| `docker compose -f compose.dev.yaml restart seed` | Re-run the seed without restarting anything else (idempotent)              |
| `npm run db:studio`                               | Prisma Studio on the host at <http://localhost:5555> (needs host `.env`)   |
| `npm run smoke:phase3`                            | Run Phase 3 backend smoke suite (requires stack up + seeded)               |

### Running scripts on the host (rarely needed)

The compose stack covers 95% of work. If you need to run Prisma Studio or a one-off script outside Docker:

1. Ensure `.env` exists (step 1 above) — the default `DATABASE_URL` points at the compose postgres via the mapped host port `54321`.
2. `npm install` at the repo root.
3. `npm run db:studio` (or whatever).

The previous "terminal 1 / terminal 2" workflow for running the seed by hand is no longer needed — the compose `seed` service replaces it. If you must run the seed from the host (e.g. refreshing staff users after editing the scrape fixture without a container rebuild), the compose stack must be up so the api is reachable at `localhost:3001`, then `npm run db:seed`.

## Phase 3 smoke

Once the stack is up (api + seeded):

```bash
npm run smoke:phase3
```

Asserts the full Phase 3 backend end-to-end across 8 assertion groups:

1. All seeded accounts sign in (admin, diner-demo, diner-empty, 2× staff)
2. ADMIN gate — DINER+STAFF receive 403, ADMIN receives 200 on `/api/admin/stats`
3. Public restaurants + bbox query + validation error on malformed bbox
4. Fresh diner has empty souvenirs (`items:[]`, `visitedRestaurantIds:[]`)
5. POST `/api/souvenirs` with JPEG → 201 + 1000 pts credited + `/api/images/:key` 200 + immutable cache
6. POST `/api/redeem` with insufficient balance → 409 `insufficient_balance`
7. Cross-restaurant dish PATCH → 404 (portal isolation guard)
8. Admin disables a user → 401 `account_disabled`; re-enables for idempotency

Exits non-zero on any regression.

## Planning artifacts

The planning repo (UI-SPEC, research synthesis, task splits per teammate, PROJECT overview) lives in a separate **local-only** sibling directory `../hackathon/.planning/` and is NOT pushed to this GitHub remote. Ask Murx for the relevant file if you need it.

- Project overview — `../hackathon/.planning/PROJECT.md`
- Research synthesis — `../hackathon/.planning/research/SUMMARY.md`
- Ilia task list — `../hackathon/.planning/team/ILIA-TASKS.md`
- Wilson task list — `../hackathon/.planning/team/WILSON-TASKS.md`
- Backend contract (the only contract Phase 4 FE code must respect) — `docs/BACKEND-CONTRACT.md` (shipped in-repo)

## Demo Credentials

These accounts are created by the `seed` compose service against the dev DB. **Dev-only — never reuse in production.**

| Email                                        | Password         | Role             | Purpose                                                  |
| -------------------------------------------- | ---------------- | ---------------- | -------------------------------------------------------- |
| `admin@guide-foodie.test`                    | `Admin2026!`     | ADMIN            | Full admin dashboard access                              |
| `staff-arpege@demo.guidefoodie.app`          | `DemoStaff2026!` | RESTAURANT_STAFF | Arpège (★★) portal login                                 |
| `staff-la-mere-brazier@demo.guidefoodie.app` | `DemoStaff2026!` | RESTAURANT_STAFF | La Mère Brazier (★★) portal login                        |
| `staff-septime@demo.guidefoodie.app`         | `DemoStaff2026!` | RESTAURANT_STAFF | Septime (★) portal login                                 |
| `dev-murx@guide-foodie.test`                 | `DevDiner2026!`  | DINER            | Murx's per-dev diner login                               |
| `dev-ilia@guide-foodie.test`                 | `DevDiner2026!`  | DINER            | Ilia's per-dev diner login                               |
| `dev-wilson@guide-foodie.test`               | `DevDiner2026!`  | DINER            | Wilson's per-dev diner login                             |
| `diner-empty@guide-foodie.test`              | `Diner2026!`     | DINER            | Empty account — 0 souvenirs, 0 points                    |
| `diner-demo@guide-foodie.test`               | `Diner2026!`     | DINER            | Demo account — 5 souvenirs across 3 restaurants, 850 pts |

> Staff email domain (`@demo.guidefoodie.app`) differs from the other fixtures
> (`@guide-foodie.test`) because the Phase 2 staff seed used a different
> convention — preserved for idempotency. A staff user is seeded for **every**
> restaurant in the scrape fixture (not just the three shown above); check
> `docker compose -f compose.dev.yaml logs seed` for the complete list.

### Public signups

Sign up freely at `/signup`. All new signups are `role: DINER` per CONTEXT.md D-01
(public signup cannot claim a role — `additionalFields.role.input: false` in Better Auth).

### Demo password note

The passwords above are **demo-only** — committed to the repo for judging convenience.
Production deploys (Phase 5) MUST rotate via a separate seed run with all passwords
sourced from env (`STAFF_PASSWORD`, `ADMIN_PASSWORD`, etc.). The `seed` compose service
is **dev-only**; `compose.prod.yaml` does not auto-seed.

## Troubleshooting

**`seed` service exits with "Environment variable not found: DATABASE_URL"**

You edited compose or your `.env` is missing vars. The `seed` service gets `DATABASE_URL` from compose's `environment:` block, not `.env` — if you see this, compose didn't apply the override. Run `docker compose -f compose.dev.yaml config` to inspect the effective config.

**Host-run `npm run db:seed` fails with the same error**

Your `.env` is missing `DATABASE_URL`. Copy the line from `.env.example`. This path is rarely needed — prefer the compose `seed` service.

**Seed hangs on "waiting for api healthz"**

The `api` container isn't healthy. `docker compose logs api` — usually a Prisma migrate problem or a missing `BETTER_AUTH_SECRET` in `.env`.

**Need a clean slate**

```bash
docker compose -f compose.dev.yaml down -v   # wipes postgres volume + images volume
docker compose -f compose.dev.yaml up -d     # re-migrates + re-seeds from scratch
```

## License

Educational hackathon project. Not affiliated with Le Guide Michelin.
