#!/usr/bin/env bash
# Build backend + storefront images and bring the full stack online.
set -euo pipefail

readonly REPO_DIR="${REPO_DIR:-/opt/huewhimsy}"
cd "$REPO_DIR"

step() { printf '\n\033[1;36m>> %s\033[0m\n' "$*"; }

[ -f .env.production ] || { echo "Missing .env.production" >&2; exit 1; }
ln -sf .env.production .env

step "Build backend image (Medusa v2)"
docker compose -f docker-compose.prod.yml build backend

step "Build storefront image (Next.js standalone)"
docker compose -f docker-compose.prod.yml build storefront

step "Start backend (migrations run on container start)"
docker compose -f docker-compose.prod.yml up -d backend
echo "  Waiting up to 120s for backend healthcheck..."
for i in $(seq 1 24); do
    state=$(docker inspect --format='{{.State.Health.Status}}' huewhimsy-backend 2>/dev/null || echo "unknown")
    echo "    [$((i*5))s] $state"
    [ "$state" = "healthy" ] && break
    sleep 5
done

step "Start storefront"
docker compose -f docker-compose.prod.yml up -d storefront
echo "  Waiting up to 90s for storefront healthcheck..."
for i in $(seq 1 18); do
    state=$(docker inspect --format='{{.State.Health.Status}}' huewhimsy-storefront 2>/dev/null || echo "unknown")
    echo "    [$((i*5))s] $state"
    [ "$state" = "healthy" ] && break
    sleep 5
done

step "Start nginx + certbot"
docker compose -f docker-compose.prod.yml up -d nginx certbot

step "Final status"
sleep 3
docker compose -f docker-compose.prod.yml ps
echo
docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}'
echo
echo "=== Health checks ==="
curl -fsS http://127.0.0.1/health && echo
curl -fsSI http://127.0.0.1/ | head -3
echo
free -h
