# Prisma Model Ownership

Authored 2026-04-22 (Phase 1). This table is authoritative for PR review. If a PR modifies a model outside the author's ownership, the reviewer pings the model's owner in #hackathon before merging. Schema drift caused our #2 pitfall; this doc is how we avoid re-living it.

## v1 models (shipped by Plan 3)

| Model              | Owner      | Notes                                                                                                                                                              |
| ------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `User`             | **Murx**   | Diner + restaurant-staff identity. Custom fields `role`, `totalPoints`, `restaurantId` via Better Auth `additionalFields` (all `input: false`).                    |
| `Session`          | **Murx**   | Better Auth session row.                                                                                                                                           |
| `Account`          | **Murx**   | Better Auth credential row; stores `password` (NOT on `User`).                                                                                                     |
| `Verification`     | **Murx**   | Better Auth email-verification codes (Phase 1 has `requireEmailVerification: false` — Phase 2 decides).                                                            |
| `Souvenir`         | **Murx**   | Diner-minted memento. Fields: `userId`, `restaurantId`, `dishId`, `note` (≤280 chars, Zod-enforced), `imageKey`, `usedDefaultImage`, `pointsAwarded`, `createdAt`. |
| `PointTransaction` | **Murx**   | Append-only ledger. `delta > 0` for mints, `delta < 0` for redemptions. `source PointSource`.                                                                      |
| `Restaurant`       | **Wilson** | Michelin-seeded restaurant row. `michelinSlug @unique` powers the scrape upsert. `lat` / `lng` are `Decimal @db.Decimal(9,6)`.                                     |
| `Dish`             | **Wilson** | Restaurant menu item. `priceCents Int` (D-05); `defaultImageKey` is the storage.ts key.                                                                            |
| `Reward`           | **Wilson** | Mocked perk definition. `pointsCost Int`, `active Boolean` for enable/disable.                                                                                     |
| `Redemption`       | **Wilson** | Diner's redemption record. `code @unique` is the mock code; `pointsSpent` is the cost at redemption time.                                                          |

## Cross-cutting invariants (everyone enforces)

- **Every model has `id String @id @default(cuid())`** (D-04).
- **Every model has `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt`** (D-04). Exceptions: `PointTransaction` (append-only — no updates), `Souvenir` (no updates per v1 UX).
- **Mutating endpoints atomically update related rows in a single `prisma.$transaction`** (architecture contract, not a schema rule): mint = `Souvenir` + `PointTransaction` + `User.totalPoints++`; redemption = `Redemption` + negative `PointTransaction` + `User.totalPoints--`.
- **No `JourneyCheckpoint`, `JourneyProgress`, `Badge`, or `BadgeUnlock` models in v1** (D-07 — Foodie Journey deferred to v2).
- **Never commit a schema change without running `npx prisma migrate dev`** locally first to generate the migration SQL.

## Non-schema ownership (services + shared code)

| Concern                                             | Owner    | Location                                                                  |
| --------------------------------------------------- | -------- | ------------------------------------------------------------------------- |
| Shared Zod DTOs                                     | **Ilia** | `packages/shared-schemas/src/*.ts`                                        |
| Points math (`awardPoints`, tier-to-points formula) | **Ilia** | `apps/api/src/services/points.service.ts` (Phase 4)                       |
| Storage abstraction                                 | **Murx** | `apps/api/src/storage.ts` (Phase 1 interface; Phase 4 wires multer+sharp) |
| Scraper                                             | **Murx** | `tools/scrape/src/scrape-michelin.ts` (Phase 1)                           |
| Seed script                                         | **Murx** | `packages/db/prisma/seed.ts` (Phase 1+7)                                  |

## Adding a model or column (post-Phase-1)

1. Open an issue (or #hackathon thread) that pings all 3 owners.
2. Justify why v1 schema isn't sufficient (most requests are a Zod schema change, not a DB change).
3. If we still agree: owner of the affected model writes the migration; reviewer is one of the other two owners.
4. `npx prisma migrate dev --name <short-name>` → commit the generated migration alongside the schema change.

---

_Authoritative for v1. Updated only by PR; reviewers check this file renders accurate ownership for any schema changes._
