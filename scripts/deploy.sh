#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# deploy.sh — single-slot redeploy for foodie on the shared-infra VPS.
#
# Expected location: /home/murx/apps/leguidemichelin/scripts/deploy.sh
# Run from the repo root:  bash scripts/deploy.sh
#
# What it does:
#   1. Sanity-check the shared proxy-net exists
#   2. git pull the latest main
#   3. Build fresh images with NEXT_PUBLIC_* pinned to this commit's SHA
#   4. Apply Prisma migrations (one-shot container)
#   5. Recreate api + web (short downtime; no blue-green)
#   6. Re-run idempotent seed (safe; upserts)
#   7. Print health status
#
# Designed to be safe to re-run. NOT zero-downtime — demo project.
# ─────────────────────────────────────────────────────────────────────

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE="docker compose -f compose.prod.yaml"

log() { printf '\033[1;34m[deploy]\033[0m %s\n' "$*"; }
err() { printf '\033[1;31m[deploy]\033[0m %s\n' "$*" >&2; }

# ── 1. Prechecks ─────────────────────────────────────────────────────
if ! docker network inspect proxy-net >/dev/null 2>&1; then
    err "external network 'proxy-net' does not exist."
    err "create it once: docker network create proxy-net"
    exit 1
fi

if [[ ! -f .env ]]; then
    err ".env not found at $ROOT_DIR/.env"
    err "copy .env.example and fill real values before first deploy"
    exit 1
fi

# ── 2. Pull latest code ──────────────────────────────────────────────
log "git pull origin main"
git pull --ff-only origin main

# ── 3. Pin build-SHA for this image ──────────────────────────────────
SHA="$(git rev-parse --short HEAD)"
export NEXT_PUBLIC_BUILD_SHA="$SHA"
log "building images @ $SHA"
# shellcheck disable=SC2086
$COMPOSE build --pull web api

# ── 4. Migrate (one-shot) ────────────────────────────────────────────
log "running prisma migrate deploy"
# shellcheck disable=SC2086
$COMPOSE run --rm migrate

# ── 5. Recreate runtime services ─────────────────────────────────────
log "recreating api + web"
# shellcheck disable=SC2086
$COMPOSE up -d --no-deps --force-recreate api web

# ── 6. Wait for api health, then seed ────────────────────────────────
log "waiting for api healthcheck"
for i in $(seq 1 40); do
    status="$(docker inspect --format='{{.State.Health.Status}}' foodie-api 2>/dev/null || echo 'starting')"
    if [[ "$status" == "healthy" ]]; then
        log "api is healthy"
        break
    fi
    if [[ "$i" == "40" ]]; then
        err "api did not become healthy within ~2min — check: docker logs foodie-api"
        exit 1
    fi
    sleep 3
done

log "running idempotent seed"
# shellcheck disable=SC2086
$COMPOSE run --rm seed || {
    err "seed failed — api is up but data may be incomplete. investigate before demo."
    exit 1
}

# ── 7. Status ────────────────────────────────────────────────────────
log "deploy complete @ $SHA"
# shellcheck disable=SC2086
$COMPOSE ps
