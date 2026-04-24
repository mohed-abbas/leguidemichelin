# Backend Contract (v1 — Phase 3 freeze)

**Last modified SHA:** 30dfad43edb23fa11bec9aa9978c726160abe5d8
**Status:** Frozen — additive-only until Phase 5. Any breaking change requires a Murx-owned PR + team-channel announcement (ROADMAP Parallel Independence Protocol).
**Audience:** Phase 4 devs (Ilia, Wilson) consuming the API from the web app.

All request/response shapes come from `packages/shared-schemas` (`@repo/shared-schemas`) — import by name, never hand-write a duplicate.

---

## Error Contract

### Body shape (D-13)

Every error response is `{ error: ErrorCode, message?: string, fields?: Record<string, string> }`.

- `error` — one of the codes in the enum below.
- `message` — optional short human string suitable for UI toasts.
- `fields` — only present on 400 validation; Zod field-path (joined by `.`) → human message.

Example validation body:

```json
{
  "error": "validation",
  "fields": { "email": "Invalid email", "password": "Must be at least 8 characters" }
}
```

### Error code enum (D-15, `@repo/shared-schemas/errors.ts` — `ErrorCode`)

```
unauthenticated | forbidden | not_found | validation | insufficient_balance |
account_disabled | already_redeemed | invalid_image | payload_too_large |
unsupported_media_type | internal
```

Additive-only after Phase 3 close. Frontend imports `ErrorCode` from `@repo/shared-schemas` and pattern-matches with full type safety:

```ts
switch (err.error) {
  case ErrorCode.enum.insufficient_balance: ...
}
```

### HTTP status map (D-16)

| Status | Error codes                                |
| ------ | ------------------------------------------ |
| 400    | `validation`, `invalid_image`              |
| 401    | `unauthenticated`, `account_disabled`      |
| 403    | `forbidden`                                |
| 404    | `not_found`                                |
| 409    | `insufficient_balance`, `already_redeemed` |
| 413    | `payload_too_large`                        |
| 415    | `unsupported_media_type`                   |
| 500    | `internal`                                 |

---

## Endpoint Catalog

### Auth (Better Auth — do not reimplement)

| Method | Path                      | Role   | Request                                   | Response                                  | Errors                                    |
| ------ | ------------------------- | ------ | ----------------------------------------- | ----------------------------------------- | ----------------------------------------- |
| POST   | `/api/auth/sign-up/email` | public | `{ email, password, name }` (Better Auth) | `{ user, session }`                       | 400 validation, 409 duplicate             |
| POST   | `/api/auth/sign-in/email` | public | `{ email, password }`                     | `{ user, session }`                       | 400 validation, 401 unauthenticated       |
| POST   | `/api/auth/sign-out`      | any    | `{}`                                      | `{ success }`                             | 401 unauthenticated                       |
| GET    | `/api/auth/get-session`   | any    | —                                         | `{ user, session }` or `null`             | —                                         |
| GET    | `/api/auth/me`            | any    | —                                         | `{ id, email, role, name, restaurantId }` | 401 unauthenticated, 401 account_disabled |

> `GET /api/auth/me` is mounted **before** the Better Auth splat (`app.all("/api/auth/*splat")`) — it is a custom handler, not a Better Auth route.

Sample (sign-in):

```bash
curl -s -X POST http://localhost:3001/api/auth/sign-in/email \
  -H "content-type: application/json" -H "origin: http://localhost:3000" \
  -c cookies.txt \
  -d '{"email":"admin@guide-foodie.test","password":"Admin2026!"}'
```

Sample (get-session):

```bash
curl -s -b cookies.txt http://localhost:3001/api/auth/get-session
```

---

### Public — Restaurants

| Method | Path                        | Role   | Request                                                                                       | Response                          | Errors         |
| ------ | --------------------------- | ------ | --------------------------------------------------------------------------------------------- | --------------------------------- | -------------- |
| GET    | `/api/restaurants`          | public | `RestaurantListQuery` (query params: `city?`, `stars?`, `bbox?`, `lat?`, `lng?`, `radiusKm?`) | `{ items: RestaurantResponse[] }` | 400 validation |
| GET    | `/api/restaurants/:id`      | public | —                                                                                             | `RestaurantResponse`              | 404 not_found  |
| GET    | `/api/restaurants/:id/menu` | public | —                                                                                             | `RestaurantMenuResponse`          | 404 not_found  |

**Filter notes:**

- Disabled restaurants are always filtered out (D-08); `GET /api/restaurants/:id` 404s on a disabled restaurant (D-10).
- `bbox` takes precedence over `lat+lng+radiusKm` when both supplied.
- `stars` is a comma-separated list of `BIB|ONE|TWO|THREE`.

Sample (bbox viewport query — map surface):

```bash
curl -s "http://localhost:3001/api/restaurants?bbox=2.2,48.8,2.4,48.9"
```

Sample (city filter):

```bash
curl -s "http://localhost:3001/api/restaurants?city=Paris&stars=TWO,THREE"
```

Sample (nearby):

```bash
curl -s "http://localhost:3001/api/restaurants?lat=48.8566&lng=2.3522&radiusKm=5"
```

---

### Public — Rewards

| Method | Path           | Role   | Request | Response                              | Errors |
| ------ | -------------- | ------ | ------- | ------------------------------------- | ------ |
| GET    | `/api/rewards` | public | —       | `RewardResponse[]` (active:true only) | —      |

Sample:

```bash
curl -s http://localhost:3001/api/rewards
```

---

### Public — Images

| Method | Path               | Role          | Request | Response                                                                                    | Errors        |
| ------ | ------------------ | ------------- | ------- | ------------------------------------------------------------------------------------------- | ------------- |
| GET    | `/api/images/:key` | public (D-23) | —       | binary, `Content-Type` from extension, `Cache-Control: public, max-age=31536000, immutable` | 404 not_found |

> Security note (D-23): No auth required — opaque cuid keys are the only protection in v1. Acceptable for demo; v1.x can add signed URLs if needed.

Sample:

```bash
curl -s "http://localhost:3001/api/images/souvenirs/2026/abc123.jpg" -o photo.jpg
```

---

### Diner — Souvenirs

> All endpoints require `role: DINER` session cookie. Server always derives `userId` from the session — never from request body (PITFALL #7).

| Method | Path                 | Role          | Request                                                                    | Response                                                     | Errors                                                                                                                                                                         |
| ------ | -------------------- | ------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| POST   | `/api/souvenirs`     | DINER         | multipart: `SouvenirMintInput` (`dishId`, `note?`) + optional `image` file | `SouvenirResponse`                                           | 400 validation, 400 invalid_image, 401 unauthenticated/account_disabled, 403 forbidden, 404 not_found (disabled restaurant), 413 payload_too_large, 415 unsupported_media_type |
| GET    | `/api/souvenirs/:id` | DINER (owner) | —                                                                          | `SouvenirResponse`                                           | 401 unauthenticated/account_disabled, 404 not_found                                                                                                                            |
| GET    | `/api/me/souvenirs`  | DINER         | —                                                                          | `MeSouvenirsResponse` (`items[]` + `visitedRestaurantIds[]`) | 401 unauthenticated/account_disabled                                                                                                                                           |

**Image pipeline (D-18..D-22):**

- Full-size: max 2048px, JPEG 82, EXIF stripped → `souvenirs/<YYYY>/<cuid>.jpg`
- Thumbnail: 256×256 cover crop, JPEG 80 → `souvenirs/<YYYY>/thumb/<cuid>.jpg`
- DB stores only full-size `imageKey`; thumb key is derived by callers.
- Accepted: `image/jpeg`, `image/png`, `image/heic`, `image/heif` (max 10 MB).

Sample (mint with image):

```bash
curl -si -X POST http://localhost:3001/api/souvenirs \
  -b cookies.txt \
  -F "dishId=<dish-cuid>" -F "note=Soup VGE" \
  -F "image=@/tmp/lunch.heic;type=image/heic"
```

Sample (list own souvenirs + map pins):

```bash
curl -s -b cookies.txt http://localhost:3001/api/me/souvenirs
```

---

### Diner — Points

| Method | Path             | Role  | Request | Response                                   | Errors                               |
| ------ | ---------------- | ----- | ------- | ------------------------------------------ | ------------------------------------ |
| GET    | `/api/me/points` | DINER | —       | `MePointsResponse` (`balance`, `ledger[]`) | 401 unauthenticated/account_disabled |

**Points scale:** BIB = 50 pts, ONE = 100 pts, TWO = 300 pts, THREE = 1000 pts.

Sample:

```bash
curl -s -b cookies.txt http://localhost:3001/api/me/points
```

---

### Diner — Redemption

| Method | Path                  | Role  | Request                      | Response               | Errors                                                                                                           |
| ------ | --------------------- | ----- | ---------------------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------- |
| POST   | `/api/redeem`         | DINER | `RedeemInput` `{ rewardId }` | `RedemptionResponse`   | 401 unauthenticated/account_disabled, 403 forbidden, 404 not_found (reward not active), 409 insufficient_balance |
| GET    | `/api/me/redemptions` | DINER | —                            | `RedemptionResponse[]` | 401 unauthenticated/account_disabled                                                                             |

Sample (redeem):

```bash
curl -si -X POST http://localhost:3001/api/redeem \
  -b cookies.txt \
  -H "content-type: application/json" \
  -d '{"rewardId":"<reward-cuid>"}'
```

---

### Diner — Favorites

> All endpoints require `role: DINER` session cookie. Server always derives `userId` from the session — never from request body (PITFALL #7). Soft-disabled restaurants (`disabledAt != null`) are excluded from list responses and return 404 on toggle/delete (D-08 + Phase 04.1 D-A4).

| Method | Path                              | Role  | Request | Response                 | Errors                          |
| ------ | --------------------------------- | ----- | ------- | ------------------------ | ------------------------------- |
| POST   | `/api/me/favorites/:restaurantId` | DINER | —       | `ToggleFavoriteResponse` | 401, 404 (restaurant not found) |
| GET    | `/api/me/favorites`               | DINER | —       | `MeFavoritesResponse`    | 401                             |
| DELETE | `/api/me/favorites/:restaurantId` | DINER | —       | `ToggleFavoriteResponse` | 401, 404 (restaurant not found) |

Toggle is idempotent: POST twice on the same restaurant oscillates `{ favorited: true }` → `{ favorited: false }` via `$transaction` + DB `@@unique([userId, restaurantId])` (Phase 04.1 D-A4).

Sample:

```bash
# Toggle
curl -si -X POST http://localhost:3001/api/me/favorites/<restaurant-id> -b cookies.txt
# List
curl -s http://localhost:3001/api/me/favorites -b cookies.txt | jq
# Delete (idempotent)
curl -si -X DELETE http://localhost:3001/api/me/favorites/<restaurant-id> -b cookies.txt
```

**Related: `RestaurantResponse.isFavorited`** — `GET /api/restaurants/:id/menu` attaches `restaurant.isFavorited: boolean` when a valid DINER session cookie is present. Logged-out or non-DINER callers always receive `false` (never null / missing). The field is `.optional()` in the Zod schema for backward compatibility with admin/portal/scrape consumers (Phase 04.1 D-A1 refines SPEC Req 6).

---

### Portal (RESTAURANT_STAFF, scoped to session.restaurantId)

> All endpoints require `role: RESTAURANT_STAFF`. ADMIN calling these endpoints receives 403 (D-04 strict role enforcement). Cross-restaurant mutations are silently 404 (D-04 guard in service layer).

| Method | Path                     | Role  | Request                                     | Response                                                   | Errors                                                                      |
| ------ | ------------------------ | ----- | ------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------- |
| GET    | `/api/portal/dishes`     | STAFF | —                                           | `DishResponse[]`                                           | 401 unauthenticated/account_disabled, 403 forbidden                         |
| POST   | `/api/portal/dishes`     | STAFF | `DishCreate` + optional `defaultImage` file | `DishResponse`                                             | 400 validation, 401, 403, 413 payload_too_large, 415 unsupported_media_type |
| PATCH  | `/api/portal/dishes/:id` | STAFF | `DishPatch`                                 | `DishResponse`                                             | 400 validation, 401, 403, 404 not_found (cross-restaurant)                  |
| DELETE | `/api/portal/dishes/:id` | STAFF | —                                           | `{ success: true }`                                        | 401, 403, 404 not_found (cross-restaurant)                                  |
| GET    | `/api/portal/qr`         | STAFF | —                                           | `PortalQrResponse` `{ url, restaurantId, restaurantSlug }` | 401, 403                                                                    |

Sample (list dishes):

```bash
curl -s -b cookies.txt http://localhost:3001/api/portal/dishes
```

Sample (create dish):

```bash
curl -si -X POST http://localhost:3001/api/portal/dishes \
  -b cookies.txt \
  -H "content-type: application/json" \
  -d '{"name":"Foie gras poêlé","priceCents":6500,"sortOrder":1}'
```

Sample (get QR):

```bash
curl -s -b cookies.txt http://localhost:3001/api/portal/qr
```

---

### Admin (ADMIN only — siloed to /api/admin/\*)

> All endpoints require `role: ADMIN`. Applied at the router level via `adminRouter.use(requireAuth, requireRole('ADMIN'))` (D-05) — impossible to forget on a future admin route.

#### Restaurants

| Method | Path                              | Role  | Request                                              | Response                                                                                                                                                        | Errors                                  |
| ------ | --------------------------------- | ----- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| GET    | `/api/admin/restaurants`          | ADMIN | —                                                    | `AdminRestaurantsListResponse` (`{ items: AdminRestaurantResponse[] }`, incl. disabled)                                                                         | 401, 403                                |
| POST   | `/api/admin/restaurants`          | ADMIN | `AdminRestaurantCreate`                              | `AdminRestaurantResponse`                                                                                                                                       | 400 validation, 401, 403                |
| GET    | `/api/admin/restaurants/:id`      | ADMIN | —                                                    | `AdminRestaurantResponse`                                                                                                                                       | 401, 403, 404 not_found                 |
| PATCH  | `/api/admin/restaurants/:id`      | ADMIN | `AdminRestaurantPatch` (incl. nullable `disabledAt`) | `AdminRestaurantResponse`                                                                                                                                       | 400 validation, 401, 403, 404 not_found |
| DELETE | `/api/admin/restaurants/:id`      | ADMIN | —                                                    | `AdminRestaurantResponse` (soft-disable — sets `disabledAt = now()`; returns updated row so admin UI can render "disabled since …" without a second round-trip) | 401, 403, 404 not_found                 |
| GET    | `/api/admin/restaurants/:id/menu` | ADMIN | —                                                    | `RestaurantMenuResponse`                                                                                                                                        | 401, 403, 404 not_found                 |

**Soft-delete notes (D-11):**

- `DELETE /api/admin/restaurants/:id` sets `disabledAt = now()`. Never hard-deletes.
- Un-disable via `PATCH` with `{ "disabledAt": null }`.
- Admin endpoints return all restaurants including disabled; `disabledAt` field present on `AdminRestaurantResponse`.

#### Restaurant Dishes (admin)

| Method | Path                                        | Role  | Request      | Response            | Errors                                               |
| ------ | ------------------------------------------- | ----- | ------------ | ------------------- | ---------------------------------------------------- |
| POST   | `/api/admin/restaurants/:id/dishes`         | ADMIN | `DishCreate` | `DishResponse`      | 400 validation, 401, 403, 404 not_found (restaurant) |
| PATCH  | `/api/admin/restaurants/:id/dishes/:dishId` | ADMIN | `DishPatch`  | `DishResponse`      | 400 validation, 401, 403, 404 not_found              |
| DELETE | `/api/admin/restaurants/:id/dishes/:dishId` | ADMIN | —            | `{ success: true }` | 401, 403, 404 not_found                              |

> These share the internal `dishService` with portal dish endpoints (D-03: shared service layer, separate HTTP routes).

#### Users

| Method | Path                   | Role  | Request                                   | Response                                                    | Errors                                                            |
| ------ | ---------------------- | ----- | ----------------------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------- |
| GET    | `/api/admin/users`     | ADMIN | —                                         | `AdminUsersListResponse` `{ items: AdminUserRow[], total }` | 401, 403                                                          |
| PATCH  | `/api/admin/users/:id` | ADMIN | `AdminUserPatch` (`role?`, `disabledAt?`) | `AdminUserResponse`                                         | 400 validation, 401, 403 (self-target / forbidden), 404 not_found |

**ADMIN-07 guardrail:** `PATCH /api/admin/users/:id` rejects `id === req.user.id` with `{ "error": "forbidden" }` status 403. Self-demote is blocked to prevent an admin from locking the platform out of admin access.

Sample (disable a user):

```bash
curl -si -X PATCH "http://localhost:3001/api/admin/users/<user-id>" \
  -b cookies.txt \
  -H "content-type: application/json" \
  -d '{"disabledAt":"2026-04-22T12:00:00.000Z"}'
```

Sample (re-enable a user):

```bash
curl -si -X PATCH "http://localhost:3001/api/admin/users/<user-id>" \
  -b cookies.txt \
  -H "content-type: application/json" \
  -d '{"disabledAt":null}'
```

#### Stats

| Method | Path               | Role  | Request | Response             | Errors   |
| ------ | ------------------ | ----- | ------- | -------------------- | -------- |
| GET    | `/api/admin/stats` | ADMIN | —       | `AdminStatsResponse` | 401, 403 |

Sample:

```bash
curl -s -b cookies.txt http://localhost:3001/api/admin/stats
```

---

### Healthcheck (no auth)

| Method | Path       | Role   | Response                             |
| ------ | ---------- | ------ | ------------------------------------ |
| GET    | `/healthz` | public | `{ status: "ok", ts: <ISO string> }` |

---

## Auth cookie

Set by Better Auth. Flags locked Phase 2: `HttpOnly; SameSite=Lax; Max-Age=604800; Secure` (prod only). Cookie name prefix: `gfj` (configured in Better Auth config). The Next.js proxy passes cookies through transparently; clients MUST include `credentials: "include"` in fetch calls (handled by `apps/web/src/lib/api.ts`).

---

## Atomic-mutation contract

Two server services MUST run inside one `prisma.$transaction`:

- **Souvenir mint** (`awardPoints` service, `apps/api/src/services/points.ts`): insert Souvenir + insert PointTransaction + increment `User.totalPoints`.
- **Redemption** (`redeemReward` service, `apps/api/src/services/redeem.ts`): atomic balance guard + decrement via `updateMany` + insert Redemption + insert negative PointTransaction.

Any deviation is a contract break.

---

## Schema reference (`@repo/shared-schemas`)

Import path: `import { SouvenirMintInput, SouvenirResponse, ... } from "@repo/shared-schemas"`

| Schema name                                   | File                           | Used by                                                       |
| --------------------------------------------- | ------------------------------ | ------------------------------------------------------------- |
| `ErrorCode`, `ErrorBody`                      | `errors.ts`                    | All error responses                                           |
| `RestaurantListQuery`                         | `restaurants.ts`               | GET /api/restaurants query params                             |
| `RestaurantResponse`                          | `restaurants.ts`               | GET /api/restaurants, GET /api/restaurants/:id — Phase 04.1: adds optional `isFavorited: boolean` (injected on `GET /api/restaurants/:id/menu` only; logged-out → always `false`) |
| `RestaurantMenuResponse`                      | `restaurants.ts`               | GET /api/restaurants/:id/menu                                 |
| `FavoriteResponse`                            | `favorites.ts`                 | Item shape inside `MeFavoritesResponse`                       |
| `ToggleFavoriteResponse`                      | `favorites.ts`                 | POST + DELETE /api/me/favorites/:restaurantId                 |
| `MeFavoritesResponse`                         | `favorites.ts`                 | GET /api/me/favorites                                         |
| `AdminRestaurantResponse`                     | `restaurants.ts`               | Admin restaurant responses (incl. disabledAt)                 |
| `DishResponseShape` / `DishResponse`          | `restaurants.ts` / `portal.ts` | Dish responses                                                |
| `SouvenirMintInput`                           | `souvenirs.ts`                 | POST /api/souvenirs (JSON part of multipart)                  |
| `SouvenirResponse`                            | `souvenirs.ts`                 | GET /api/souvenirs/:id, POST /api/souvenirs                   |
| `MeSouvenirsResponse`                         | `souvenirs.ts`                 | GET /api/me/souvenirs                                         |
| `MePointsResponse`                            | `points.ts`                    | GET /api/me/points                                            |
| `PointTransactionResponse`                    | `points.ts`                    | Ledger items in MePointsResponse                              |
| `RewardResponse`                              | `redemption.ts`                | GET /api/rewards                                              |
| `RedeemInput`                                 | `redemption.ts`                | POST /api/redeem                                              |
| `RedemptionResponse`                          | `redemption.ts`                | POST /api/redeem, GET /api/me/redemptions                     |
| `DishCreate`                                  | `portal.ts`                    | POST /api/portal/dishes, POST /api/admin/.../dishes           |
| `DishPatch`                                   | `portal.ts`                    | PATCH /api/portal/dishes/:id, PATCH /api/admin/.../dishes/:id |
| `PortalQrResponse`                            | `portal.ts`                    | GET /api/portal/qr                                            |
| `AdminRestaurantCreate`                       | `admin.ts`                     | POST /api/admin/restaurants                                   |
| `AdminRestaurantPatch`                        | `admin.ts`                     | PATCH /api/admin/restaurants/:id                              |
| `AdminUserPatch`                              | `admin.ts`                     | PATCH /api/admin/users/:id                                    |
| `AdminStatsResponse`                          | `admin.ts`                     | GET /api/admin/stats                                          |
| `AdminUsersListResponse`, `AdminUserResponse` | `admin.ts`                     | GET /api/admin/users                                          |
| `UserRole`                                    | `admin.ts`                     | Role enum: `DINER \| RESTAURANT_STAFF \| ADMIN`               |

---

## Changelog

- 2026-04-22 — v1 frozen (Phase 3 close). Contract open for additive-only changes until Phase 5 demo hardening.

### 2026-04-24 — Phase 04.1 Favorites

- Added `POST /api/me/favorites/:restaurantId`, `GET /api/me/favorites`, `DELETE /api/me/favorites/:restaurantId` under Diner.
- `GET /api/restaurants/:id/menu` now returns `restaurant.isFavorited: boolean` for DINER sessions (false otherwise).
- New `FavoriteResponse`, `ToggleFavoriteResponse`, `MeFavoritesResponse` Zod schemas in `@repo/shared-schemas/src/favorites.ts`.
