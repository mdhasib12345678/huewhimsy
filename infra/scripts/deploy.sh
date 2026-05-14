#!/usr/bin/env bash
# HueWhimsy deploy — build, restart, prune
# Code is rsync/tar'd in by GitHub Actions BEFORE this script runs.
# Manual invocation (no transfer) just rebuilds whatever is in REPO_DIR.
set -euo pipefail

readonly REPO_DIR="${REPO_DIR:-/opt/huewhimsy}"
readonly COMPOSE_FILE="docker-compose.prod.yml"
readonly ENV_FILE=".env.production"
readonly HEALTH_TIMEOUT_SEC="${HEALTH_TIMEOUT_SEC:-240}"
readonly HEALTH_POLL_INTERVAL_SEC="${HEALTH_POLL_INTERVAL_SEC:-10}"

cd "$REPO_DIR"

step() { printf '\n\033[1;36m>> %s\033[0m\n' "$*"; }

[ -f "$ENV_FILE" ] || { echo "Missing $ENV_FILE" >&2; exit 1; }

step "Build images"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build --pull

step "Start / update stack"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --remove-orphans

step "Wait for all containers healthy (up to ${HEALTH_TIMEOUT_SEC}s)"
deadline=$(( $(date +%s) + HEALTH_TIMEOUT_SEC ))
while :; do
    # Find any container in the stack that is in 'unhealthy' state.
    unhealthy=$(docker compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null \
        | grep -ci '"Health":"unhealthy"' || true)
    # Find containers with a healthcheck still in 'starting' state.
    starting=$(docker compose -f "$COMPOSE_FILE" ps --format json 2>/dev/null \
        | grep -ci '"Health":"starting"' || true)
    now=$(date +%s)
    if [ "$unhealthy" -eq 0 ] && [ "$starting" -eq 0 ]; then
        echo "All containers healthy."
        break
    fi
    if [ "$now" -ge "$deadline" ]; then
        echo "ERROR: timeout waiting for healthy state ($unhealthy unhealthy, $starting starting)" >&2
        docker compose -f "$COMPOSE_FILE" ps
        exit 1
    fi
    printf '  ...still waiting (unhealthy=%s starting=%s, %ss elapsed)\n' \
        "$unhealthy" "$starting" "$(( now - (deadline - HEALTH_TIMEOUT_SEC) ))"
    sleep "$HEALTH_POLL_INTERVAL_SEC"
done

step "Container status"
docker compose -f "$COMPOSE_FILE" ps

step "Prune dangling images / build cache (>3 days)"
docker image prune -f
docker builder prune -f --filter "until=72h"

step "Done"
docker compose -f "$COMPOSE_FILE" ps
