#!/usr/bin/env bash
# Phase 3 end-to-end smoke test.
# Prereqs: postgres + api running on :3001, DB freshly seeded via
#   npm run --workspace @repo/db db:reset && npm run --workspace @repo/db db:seed
#   (api must be running during seed — see README.md "Demo Credentials")
#
# Exits 0 on success; non-zero + loud message on any failure.
#
# Usage:
#   bash scripts/smoke-phase3.sh
#   npm run smoke:phase3
#   API_BASE=http://localhost:3001 bash scripts/smoke-phase3.sh

set -euo pipefail

API="${API_BASE:-http://localhost:3001}"
ORIGIN="${WEB_ORIGIN:-http://localhost:3000}"

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

ADMIN_JAR="$TMP/admin.jar"
DEMO_JAR="$TMP/demo.jar"
EMPTY_JAR="$TMP/empty.jar"
STAFF_ARPEGE_JAR="$TMP/staff-arpege.jar"
STAFF_MB_JAR="$TMP/staff-mb.jar"

fail() { echo "FAIL: $*" >&2; exit 1; }
pass() { echo "PASS: $*"; }

sign_in() {
  local jar="$1" email="$2" password="$3"
  local code
  code=$(curl -s -S -o /dev/null -c "$jar" -w '%{http_code}' \
    -H "content-type: application/json" -H "origin: $ORIGIN" \
    -X POST "$API/api/auth/sign-in/email" \
    -d "{\"email\":\"$email\",\"password\":\"$password\"}") || fail "sign_in $email curl error"
  [ "$code" = "200" ] || fail "sign_in $email returned HTTP $code (expected 200)"
  [ -s "$jar" ] || fail "sign_in $email produced empty cookie jar"
}

status() { curl -s -S -o "$TMP/body" -w '%{http_code}' "$@"; }
status_cookie() { local jar="$1"; shift; curl -s -S -b "$jar" -o "$TMP/body" -w '%{http_code}' "$@"; }

# ─── 1. Auth ─────────────────────────────────────────────────────────
sign_in "$ADMIN_JAR"       "admin@guide-foodie.test"            "Admin2026!"
sign_in "$DEMO_JAR"        "diner-demo@guide-foodie.test"       "Diner2026!"
sign_in "$EMPTY_JAR"       "diner-empty@guide-foodie.test"      "Diner2026!"
sign_in "$STAFF_ARPEGE_JAR" "staff-arpege@demo.guidefoodie.app" "DemoStaff2026!"
sign_in "$STAFF_MB_JAR"    "staff-la-mere-brazier@demo.guidefoodie.app" "DemoStaff2026!"
pass "all 5 seeded accounts sign in"

# ─── 2. ADMIN gate: DINER+STAFF → 403, ADMIN → 200 ──────────────────
code=$(status_cookie "$DEMO_JAR" "$API/api/admin/stats")
[ "$code" = "403" ] || fail "DINER → /api/admin/stats expected 403, got $code"
grep -q '"error":"forbidden"' "$TMP/body" || fail "DINER → /api/admin/stats missing forbidden error code"

code=$(status_cookie "$STAFF_ARPEGE_JAR" "$API/api/admin/users")
[ "$code" = "403" ] || fail "STAFF → /api/admin/users expected 403, got $code"

code=$(status_cookie "$ADMIN_JAR" "$API/api/admin/stats")
[ "$code" = "200" ] || fail "ADMIN → /api/admin/stats expected 200, got $code"
pass "admin gate: DINER+STAFF 403, ADMIN 200"

# ─── 3. Public restaurants + bbox ────────────────────────────────────
code=$(status "$API/api/restaurants")
[ "$code" = "200" ] || fail "GET /api/restaurants expected 200, got $code"

code=$(status "$API/api/restaurants?bbox=2.0,48.0,3.0,49.0")
[ "$code" = "200" ] || fail "bbox query expected 200, got $code"

# Malformed bbox → 400 validation
code=$(status "$API/api/restaurants?bbox=notanumber")
[ "$code" = "400" ] || fail "malformed bbox expected 400, got $code"
grep -q '"error":"validation"' "$TMP/body" || fail "malformed bbox missing validation error code"
pass "public restaurants ok + bbox filters + validation errors"

# ─── 4. Fresh diner has empty souvenirs ──────────────────────────────
code=$(status_cookie "$EMPTY_JAR" "$API/api/me/souvenirs")
[ "$code" = "200" ] || fail "diner-empty /api/me/souvenirs expected 200, got $code"
grep -q '"items":\[\]' "$TMP/body" || fail "diner-empty should have items:[]"
grep -q '"visitedRestaurantIds":\[\]' "$TMP/body" || fail "diner-empty should have visitedRestaurantIds:[]"
pass "diner-empty has no souvenirs"

# ─── 5. POST /api/souvenirs with image → 201 + points ────────────────
# Grab a THREE-star restaurant (1000 pts each) and its first dish.
# Uses node to parse the JSON list from the public /api/restaurants endpoint.
THREE_STAR_ID=$(curl -s "$API/api/restaurants" | node -e "
const d=JSON.parse(require('fs').readFileSync(0,'utf8'));
const list=Array.isArray(d)?d:(d.items||[]);
const r=list.find(x=>x.michelinRating==='THREE');
process.stdout.write(r?r.id:'');
")
[ -n "$THREE_STAR_ID" ] || fail "could not find a THREE-star restaurant id (seed may not have run)"

DISH_ID=$(curl -s "$API/api/restaurants/$THREE_STAR_ID/menu" | node -e "
const d=JSON.parse(require('fs').readFileSync(0,'utf8'));
const x=(d.dishes||[])[0];
process.stdout.write(x?x.id:'');
")
[ -n "$DISH_ID" ] || fail "could not find a dish id for THREE-star restaurant"

# Build a minimal valid JPEG (16x16) via python3 base64 decode
python3 - <<'PY' > "$TMP/pic.jpg"
import base64, sys
# Tiny valid JPEG (red 16x16) generated as a self-contained base64 blob
DATA = (
  b"/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0a"
  b"HBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIy"
  b"MjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAAQABADASIA"
  b"AhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEB"
  b"AAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AL/AB//Z"
)
sys.stdout.buffer.write(base64.b64decode(DATA))
PY
test -s "$TMP/pic.jpg" || fail "couldn't create test jpeg"

code=$(curl -s -S -b "$EMPTY_JAR" -o "$TMP/body" -w '%{http_code}' \
  -X POST "$API/api/souvenirs" \
  -F "dishId=$DISH_ID" -F "note=Smoke test souvenir" \
  -F "image=@$TMP/pic.jpg;type=image/jpeg")
[ "$code" = "201" ] || fail "POST /api/souvenirs expected 201, got $code (body: $(cat "$TMP/body"))"

SOUV_ID=$(node -e "const d=JSON.parse(require('fs').readFileSync('$TMP/body','utf8')); process.stdout.write(d.id||'')")
[ -n "$SOUV_ID" ] || fail "POST /api/souvenirs didn't return id"

# Points credited — THREE-star = 1000 pts
BALANCE=$(curl -s -b "$EMPTY_JAR" "$API/api/me/points" | node -e "
const d=JSON.parse(require('fs').readFileSync(0,'utf8'));
process.stdout.write(String(d.balance||0));
")
[ "$BALANCE" = "1000" ] || fail "expected diner-empty balance 1000 after minting at THREE-star, got $BALANCE"
pass "souvenir minted at THREE-star + 1000 points credited"

# Got the imageKey back; fetch /api/images/:key → 200 + immutable cache
IMG_KEY=$(node -e "const d=JSON.parse(require('fs').readFileSync('$TMP/body','utf8')); process.stdout.write(d.imageKey||'')")
[ -n "$IMG_KEY" ] || fail "souvenir response missing imageKey"
code=$(curl -s -S -o /dev/null -D "$TMP/hdr" -w '%{http_code}' "$API/api/images/$IMG_KEY")
[ "$code" = "200" ] || fail "GET /api/images/:key expected 200, got $code"
grep -qi 'cache-control:.*immutable' "$TMP/hdr" || fail "/api/images missing immutable cache header"
pass "image served + immutable cache"

# ─── 6. Redeem with insufficient balance → 409 ───────────────────────
# diner-empty now has 1000 pts; pick a reward costing >= 2000 pts (Tasting menu credit)
REWARD_ID=$(curl -s "$API/api/rewards" | node -e "
const d=JSON.parse(require('fs').readFileSync(0,'utf8'));
const list=Array.isArray(d)?d:(d.items||[]);
const x=list.find(r=>r.pointsCost>=2000);
process.stdout.write(x?x.id:'');
")
[ -n "$REWARD_ID" ] || fail "could not find a >=2000 pt reward (expected Tasting menu credit 2000)"
code=$(curl -s -S -b "$EMPTY_JAR" -o "$TMP/body" -w '%{http_code}' \
  -H "content-type: application/json" -X POST "$API/api/redeem" \
  -d "{\"rewardId\":\"$REWARD_ID\"}")
# diner-empty has 1000 pts; 2000-pt reward → insufficient_balance
[ "$code" = "409" ] || fail "insufficient balance expected 409, got $code"
grep -q '"error":"insufficient_balance"' "$TMP/body" || fail "missing insufficient_balance code"
pass "insufficient_balance 409 on under-balance redeem"

# ─── 7. Portal cross-restaurant guard ────────────────────────────────
# Arpège staff lists own dishes — should be non-empty
code=$(status_cookie "$STAFF_ARPEGE_JAR" "$API/api/portal/dishes")
[ "$code" = "200" ] || fail "staff-arpege /api/portal/dishes expected 200, got $code"

# Get Mère Brazier's id via admin endpoint, then grab one of its dishes
MB_REST_ID=$(curl -s -b "$ADMIN_JAR" "$API/api/admin/restaurants" | node -e "
const d=JSON.parse(require('fs').readFileSync(0,'utf8'));
const list=Array.isArray(d)?d:(d.items||[]);
const mb=list.find(r=>r.michelinSlug==='lyon/la-mere-brazier');
process.stdout.write(mb?mb.id:'');
")
[ -n "$MB_REST_ID" ] || fail "could not find la-mere-brazier restaurant id"

MB_DISH=$(curl -s -b "$ADMIN_JAR" "$API/api/admin/restaurants/$MB_REST_ID/menu" | node -e "
const d=JSON.parse(require('fs').readFileSync(0,'utf8'));
const x=(d.dishes||[])[0];
process.stdout.write(x?x.id:'');
")
[ -n "$MB_DISH" ] || fail "la-mere-brazier has no dishes"

# Arpège staff trying to PATCH Mère Brazier's dish → 404 (cross-restaurant guard)
code=$(curl -s -S -b "$STAFF_ARPEGE_JAR" -o "$TMP/body" -w '%{http_code}' \
  -H "content-type: application/json" -X PATCH "$API/api/portal/dishes/$MB_DISH" \
  -d '{"name":"hacked name"}')
[ "$code" = "404" ] || fail "cross-restaurant PATCH expected 404, got $code"
pass "cross-restaurant dish mutation blocked"

# ─── 8. account_disabled flow ────────────────────────────────────────
DISABLE_USER=$(curl -s -b "$ADMIN_JAR" "$API/api/admin/users" | node -e "
const d=JSON.parse(require('fs').readFileSync(0,'utf8'));
const list=Array.isArray(d)?d:(d.items||[]);
const u=list.find(x=>x.email==='dev-ilia@guide-foodie.test');
process.stdout.write(u?u.id:'');
")
[ -n "$DISABLE_USER" ] || fail "could not find dev-ilia user id"

DEV_JAR="$TMP/dev.jar"
sign_in "$DEV_JAR" "dev-ilia@guide-foodie.test" "DevDiner2026!"

# Disable the user via admin PATCH
code=$(curl -s -S -b "$ADMIN_JAR" -o "$TMP/body" -w '%{http_code}' \
  -H "content-type: application/json" -X PATCH "$API/api/admin/users/$DISABLE_USER" \
  -d '{"disabledAt":"2026-04-22T12:00:00.000Z"}')
[ "$code" = "200" ] || fail "admin disable user expected 200, got $code"

# Disabled user's next authenticated request returns 401 account_disabled
code=$(status_cookie "$DEV_JAR" "$API/api/auth/me")
[ "$code" = "401" ] || fail "disabled user /api/auth/me expected 401, got $code"
grep -q '"error":"account_disabled"' "$TMP/body" || fail "disabled user missing account_disabled code"

# Re-enable so the smoke is idempotent (T-11-02)
curl -s -b "$ADMIN_JAR" -H "content-type: application/json" -X PATCH \
  "$API/api/admin/users/$DISABLE_USER" -d '{"disabledAt":null}' > /dev/null
pass "account_disabled flow: disable → 401 account_disabled, re-enabled for idempotency"

echo ""
echo "ALL PHASE 3 SMOKE ASSERTIONS PASSED"
