#!/usr/bin/env bash
#
# Phase 2 auth smoke — deterministic end-to-end curl flow.
# Assumes the stack is running: `docker compose -f compose.dev.yaml up -d`
# AND `npm --workspace @repo/web dev` OR prod build is serving on :3000.
#
# Run: bash scripts/smoke-auth.sh
#
set -euo pipefail

BASE="${BASE:-http://localhost:3000}"
COOKIE_JAR="$(mktemp -t gfj-smoke-XXXXXX.cookies)"
trap 'rm -f "$COOKIE_JAR"' EXIT

EMAIL="smoke-$(date +%s)-$$@test.local"
PASSWORD="SmokeP@ss123"
NAME="Smoke Tester"

pass() { printf "\033[32m[PASS]\033[0m %s\n" "$1"; }
fail() { printf "\033[31m[FAIL]\033[0m %s\n" "$1"; exit 1; }

echo "[smoke] BASE=$BASE, EMAIL=$EMAIL"

# 1. Unauthed /api/auth/me → 401
code=$(curl -sS -o /dev/null -w '%{http_code}' "$BASE/api/auth/me")
[[ "$code" == "401" ]] && pass "unauthed /me returns 401" || fail "unauthed /me returned $code, expected 401"

# 2. Sign up
signup_resp=$(curl -sS -c "$COOKIE_JAR" -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"$NAME\"}" \
  "$BASE/api/auth/sign-up/email")
echo "[smoke] signup response: $signup_resp"
grep -q "$EMAIL" "$COOKIE_JAR" || true  # cookie jar exists, values not inspected

# 3. Authed /api/auth/me → 200 + shape
me=$(curl -sS -b "$COOKIE_JAR" "$BASE/api/auth/me")
echo "[smoke] /me: $me"
echo "$me" | grep -q "\"email\":\"$EMAIL\"" && pass "/me returns signed-up email" || fail "/me did not contain email"
echo "$me" | grep -q "\"role\":\"DINER\"" && pass "/me role is DINER" || fail "/me role was not DINER (additionalFields.role.input:false must lock it)"
echo "$me" | grep -q "\"name\":\"$NAME\"" && pass "/me name matches" || fail "/me name did not match"

# 4. Inspect Set-Cookie flags from the signup response (re-run signup with -i to see headers — throwaway email)
EMAIL2="smoke2-$(date +%s)-$$@test.local"
headers=$(curl -sSi -c /dev/null -H 'Content-Type: application/json' \
  -d "{\"email\":\"$EMAIL2\",\"password\":\"$PASSWORD\",\"name\":\"cookie-check\"}" \
  "$BASE/api/auth/sign-up/email")
echo "$headers" | grep -qi 'Set-Cookie' || fail "no Set-Cookie header from signup"
echo "$headers" | grep -iE 'Set-Cookie.*httponly' >/dev/null && pass "Set-Cookie is HttpOnly" || fail "Set-Cookie missing HttpOnly"
echo "$headers" | grep -iE 'Set-Cookie.*samesite=lax' >/dev/null && pass "Set-Cookie is SameSite=Lax" || fail "Set-Cookie missing SameSite=Lax"
# Note: Secure flag only in production; dev over HTTP omits it. Skipping here.

# 5. Sign out — Better Auth enforces a CSRF Origin check on sign-out; must send
# an Origin matching BETTER_AUTH_URL (= $BASE in dev) or it returns 403.
signout_code=$(curl -sS -o /dev/null -w '%{http_code}' \
  -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
  -H 'Content-Type: application/json' -H "Origin: $BASE" \
  -d '{}' -X POST "$BASE/api/auth/sign-out")
[[ "$signout_code" == "200" ]] && pass "sign-out returns 200" || fail "sign-out returned $signout_code, expected 200"
code=$(curl -sS -o /dev/null -w '%{http_code}' -b "$COOKIE_JAR" "$BASE/api/auth/me")
[[ "$code" == "401" ]] && pass "post-signout /me returns 401" || fail "post-signout /me returned $code, expected 401"

echo "[smoke] all auth checks passed"
