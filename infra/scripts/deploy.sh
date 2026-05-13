#!/usr/bin/env bash
# HueWhimsy deploy — pull latest, build, restart, prune
set -euo pipefail

readonly REPO_DIR="${REPO_DIR:-/opt/huewhimsy}"
readonly COMPOSE_FILE="docker-compose.prod.yml"
readonly ENV_FILE=".env.production"

cd "$REPO_DIR"

step() { printf '\n\033[1;36m>> %s\033[0m\n' "$*"; }

[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE" >&2; exit 1; }

step "Pull latest code"
git fetch --all --prune
git reset --hard origin/main

step "Build images"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --pull

step "Start / update stack"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --remove-orphans

step "Wait for health"
sleep 5
docker compose -f "$COMPOSE_FILE" ps

step "Prune dangling images / build cache (>3 days)"
docker image prune -f
docker builder prune -f --filter "until=72h"

step "Done"
docker compose -f "$COMPOSE_FILE" ps
