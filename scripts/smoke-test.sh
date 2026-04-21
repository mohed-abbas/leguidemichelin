#!/usr/bin/env bash
# Guide Foodie Journey — Phase 1 smoke suite.
#
# Runs every invariant from:
#   .planning/phases/01-foundation/01-VALIDATION.md §Integration Smoke Tests
#   .planning/phases/01-foundation/01-VALIDATION.md §Per-Task Verification Map
#
# Usage: bash scripts/smoke-test.sh           # full suite (≈2-3 min with docker)
#        bash scripts/smoke-test.sh --quick   # static checks only (≈10s, no docker)

set -euo pipefail
cd "$(dirname "$0")/.."

QUICK=0
[[ "${1:-}" == "--quick" ]] && QUICK=1

pass() { echo "  [PASS] $1"; }
fail() { echo "  [FAIL] $1" >&2; exit 1; }
info() { echo "  [INFO] $1"; }

echo "─── Phase 1 smoke suite ──────────────────────────────────────────"

# ── Static checks ──────────────────────────────────────────────────
echo "# Static checks"

test -d apps/web && test -d apps/api && test -d packages/db \
  && test -d packages/tokens && test -d packages/shared-schemas \
  && test -d packages/config && test -d tools/scrape \
  && pass "monorepo structure (Plan 1-3)" \
  || fail "monorepo structure missing a workspace"

! test -d packages/ui \
  && pass "D-18: no packages/ui directory" \
  || fail "D-18 violated: packages/ui exists"

grep -qE '^!\.env\.example$' .gitignore \
  && pass ".gitignore allow-lists .env.example" \
  || fail ".gitignore missing !.env.example allow-list"

if git ls-files | grep -qE '^\.env$'; then
  fail ".env is tracked in git — SECRET LEAK RISK"
else
  pass ".env is NOT tracked"
fi

# Tokens invariants
grep -q -- '--color-primary' packages/tokens/tokens.css \
  && pass "packages/tokens/tokens.css has --color-primary"
# Exclude the tokens.css sentinel comment "do NOT use #C8102E" — a reminder
# to future editors is allowed; the brand-exact red as an actual CSS value is not.
if grep '#C8102E' packages/tokens/tokens.css | grep -vq 'do NOT use'; then
  fail "Michelin brand-exact red detected in tokens"
else
  pass "PITFALLS #11: no Michelin-exact red in tokens"
fi

# Prisma schema invariants
grep -qE 'url\s*=\s*env\("DATABASE_URL"\)' packages/db/prisma/schema.prisma \
  && pass "Prisma datasource reads from env"
if grep -qE '^model (JourneyCheckpoint|JourneyProgress|Badge|BadgeUnlock)' packages/db/prisma/schema.prisma; then
  fail "D-07 violated: Journey/Badge model detected"
else
  pass "D-07: no Journey/Badge models in schema"
fi

# Scrape + fallback
test -f tools/scrape/seed-data/restaurants.fallback.json \
  && pass "DATA-02 fallback JSON present"
node -e "const f=require('./tools/scrape/seed-data/restaurants.fallback.json'); if (f.length < 20) process.exit(1)" \
  && pass "DATA-02 fallback has ≥20 entries"
! grep -qiE 'https?://[^"]*michelin\.[^"]+\.(jpg|png|webp)' tools/scrape/seed-data/restaurants.fallback.json \
  && pass "T-01-BRAND-IP: no Michelin image URLs in fallback"

# Better Auth mount order (T-01-AUTH-BYPASS)
AUTH_LINE=$(grep -n 'app.all("/api/auth/\*splat"' apps/api/src/index.ts | head -1 | cut -d: -f1 || true)
JSON_LINE=$(grep -n 'app.use(express.json' apps/api/src/index.ts | head -1 | cut -d: -f1 || true)
if [[ -n "${AUTH_LINE:-}" && -n "${JSON_LINE:-}" && "$AUTH_LINE" -lt "$JSON_LINE" ]]; then
  pass "T-01-AUTH-BYPASS: Better Auth mounted before express.json (L$AUTH_LINE < L$JSON_LINE)"
else
  fail "T-01-AUTH-BYPASS: mount order wrong (auth L$AUTH_LINE, json L$JSON_LINE)"
fi

# No outbound fetch in api (T-01-SSRF)
if grep -rE '(fetch\(|axios\.|http\.get\(|https\.get\()' apps/api/src/ 2>/dev/null; then
  fail "T-01-SSRF: outbound fetch detected in api"
else
  pass "T-01-SSRF: no outbound fetch in api"
fi

# No raw SQL (T-01-SQLI / T-01-SEED-INJECTION)
if grep -qE '\$queryRawUnsafe|\$executeRawUnsafe' packages/db/src/index.ts 2>/dev/null; then
  fail "T-01-SQLI: raw-query convenience export detected"
else
  pass "T-01-SQLI: no raw-query convenience export"
fi
if grep -qE '\$queryRawUnsafe|\$executeRawUnsafe' packages/db/prisma/seed.ts; then
  fail "T-01-SEED-INJECTION: seed uses raw SQL"
else
  pass "T-01-SEED-INJECTION: seed uses upsert (no raw SQL)"
fi

# Dev-disable (T-01-SW-STALE)
grep -q 'NODE_ENV === "development"' apps/web/next.config.ts \
  && grep -q 'withSerwist' apps/web/next.config.ts \
  && pass "T-01-SW-STALE: Serwist dev-disabled"

# Compose YAML parses
docker compose -f compose.dev.yaml config -q \
  && pass "compose.dev.yaml parses"
docker compose -f compose.prod.yaml config -q \
  && pass "compose.prod.yaml parses"

# Volume hygiene (T-01-IMAGE-PATH-TRAVERSAL, T-01-DB-CREDS-LEAK)
grep -q 'images-dev-data:/var/data/images' compose.dev.yaml \
  && pass "T-01-IMAGE-PATH-TRAVERSAL: dev uses named volume"
grep -q '/srv/foodie/images:/var/data/images' compose.prod.yaml \
  && pass "T-01-IMAGE-PATH-TRAVERSAL: prod uses dedicated host bind"
if grep -qE '^(ENV|ARG)\s+(POSTGRES_PASSWORD|BETTER_AUTH_SECRET|DATABASE_URL)\s*=' Dockerfile.api Dockerfile.web; then
  fail "T-01-DB-CREDS-LEAK: secret baked in Dockerfile layer"
else
  pass "T-01-DB-CREDS-LEAK: no secrets baked in Dockerfile layers"
fi

# Pre-commit wiring (T-01-SECRET-LEAK layer 2)
test -x .husky/pre-commit \
  && pass ".husky/pre-commit is executable"
test -f scripts/secret-scan.mjs \
  && pass "scripts/secret-scan.mjs present"

# README + model ownership
grep -qi 'Not affiliated' README.md \
  && pass "DEMO-04 / PITFALLS #11: README disclaimer present"
test -f docs/MODEL-OWNERSHIP.md \
  && pass "docs/MODEL-OWNERSHIP.md present"

# Remote target (T-01-REMOTE-TAMPER)
git remote get-url origin | grep -q 'mohed-abbas/leguidemichelin' \
  && pass "Remote points at mohed-abbas/leguidemichelin"

# ── Build smoke ──────────────────────────────────────────────────
echo "# Build smoke"
(cd packages/db && DATABASE_URL="postgresql://tmp:tmp@localhost:5432/tmp?schema=public" npx prisma validate) \
  && pass "prisma validate OK"
npm run build --workspace=packages/db --silent \
  && pass "@repo/db builds"
npm run build --workspace=apps/api --silent \
  && pass "@repo/api builds"
if [[ $QUICK -eq 0 ]]; then
  NODE_ENV=production npm run build --workspace=apps/web --silent \
    && pass "@repo/web builds (prod, Serwist pipeline)"
else
  info "skipped web prod build (--quick)"
fi

# Docker image builder stages
if [[ $QUICK -eq 0 ]]; then
  docker build -f Dockerfile.api --target builder -t gfj-api-builder . >/dev/null \
    && pass "Dockerfile.api builder stage builds"
  docker build -f Dockerfile.web --target builder -t gfj-web-builder . >/dev/null \
    && pass "Dockerfile.web builder stage builds"
else
  info "skipped docker builds (--quick)"
fi

# ── Live compose smoke ──────────────────────────────────────────────
if [[ $QUICK -eq 0 ]]; then
  echo "# Live compose smoke"

  # Ensure .env exists
  [[ -f .env ]] || cp .env.example .env
  # Ensure BETTER_AUTH_SECRET is not the placeholder
  if grep -q 'replace_me_with_a_random' .env; then
    SEC=$(openssl rand -base64 32 2>/dev/null | tr -d '=+/' | head -c 32)
    awk -v s="$SEC" '/^BETTER_AUTH_SECRET=/ { print "BETTER_AUTH_SECRET=" s; next } { print }' .env > .env.tmp && mv .env.tmp .env
  fi

  docker compose -f compose.dev.yaml up -d --build >/dev/null
  for i in $(seq 1 60); do
    curl -fsS http://localhost:3001/healthz >/dev/null 2>&1 && break
    sleep 2
  done

  # Same-origin rewrite: web's /api/auth/ endpoint must reach the Express handler.
  # Better Auth's /api/auth root returns 404 for unknown sub-paths but proves the
  # rewrite is wired. `curl -w '%{http_code}' /api/auth` should not be 5xx.
  REWRITE_CODE=$(curl -fsS -o /dev/null -w '%{http_code}' http://localhost:3000/api/auth || true)
  if [[ "$REWRITE_CODE" =~ ^[23] || "$REWRITE_CODE" == "404" ]]; then
    pass "same-origin rewrite (Next → Express) live ($REWRITE_CODE)"
  else
    fail "same-origin rewrite failed (got $REWRITE_CODE)"
  fi

  # Cold-boot: web renders
  curl -fsSL http://localhost:3000/ | grep -qi 'Guide Foodie Journey' \
    && pass "cold-boot: web renders landing"

  # Seed idempotency (run via api container so DATABASE_URL resolves inside compose network)
  docker compose -f compose.dev.yaml exec -T api sh -c "cd /workspace && npm run db:seed" >/dev/null
  COUNT_1=$(docker compose -f compose.dev.yaml exec -T postgres \
    psql -U "${POSTGRES_USER:-foodie}" -d "${POSTGRES_DB:-foodie}" -tAc 'SELECT count(*) FROM "Restaurant"')
  docker compose -f compose.dev.yaml exec -T api sh -c "cd /workspace && npm run db:seed" >/dev/null
  COUNT_2=$(docker compose -f compose.dev.yaml exec -T postgres \
    psql -U "${POSTGRES_USER:-foodie}" -d "${POSTGRES_DB:-foodie}" -tAc 'SELECT count(*) FROM "Restaurant"')
  if [[ "$COUNT_1" == "$COUNT_2" ]]; then
    pass "seed idempotency: $COUNT_1 rows on both runs"
  else
    fail "seed NOT idempotent: $COUNT_1 vs $COUNT_2"
  fi

  docker compose -f compose.dev.yaml down >/dev/null
else
  info "skipped live compose smoke (--quick)"
fi

# ── Pre-commit secret-scan live test (final defense-in-depth) ──
echo "# Pre-commit secret-scan"
# Build the fake key at runtime so THIS script doesn't trip the secret-scan on itself.
# The pre-commit hook will still see the real literal once it's written to disk.
FAKE_STRIPE_KEY="sk_""test_""smoketest2222333344445555666677"
printf 'const x = "%s";\n' "$FAKE_STRIPE_KEY" > _smoke-secret.ts
git add _smoke-secret.ts
# pipefail makes `git commit 2>&1 | grep` surface git's non-zero exit even when
# grep matches. Temporarily disable, capture to file, re-check.
# `set -e` would kill the script on git's expected non-zero exit; disable
# briefly so we can capture the exit code ourselves.
set +e
set +o pipefail
git commit -m "should block" > /tmp/smoke-secret-test.log 2>&1
COMMIT_EC=$?
set -e
set -o pipefail
git reset HEAD _smoke-secret.ts >/dev/null 2>&1 || true
rm -f _smoke-secret.ts
if [[ "$COMMIT_EC" -ne 0 ]] && grep -q 'Stripe secret' /tmp/smoke-secret-test.log; then
  pass "T-01-SECRET-LEAK: pre-commit secret-scan live-blocks Stripe key"
else
  cat /tmp/smoke-secret-test.log >&2
  fail "T-01-SECRET-LEAK: secret-scan did NOT block the smoke secret (commit_ec=$COMMIT_EC)"
fi

echo "─── All Phase 1 smoke checks green ───────────────────────────────"
