#!/usr/bin/env bash
# Container watchdog: restart unhealthy containers + email if restart happens.
# Replaces the inline awk pipeline in /etc/cron.d/huewhimsy-health.
set -uo pipefail

REPO_DIR="${REPO_DIR:-/opt/huewhimsy}"
COMPOSE_FILE="${COMPOSE_FILE:-$REPO_DIR/docker-compose.prod.yml}"
LOG_FILE="${LOG_FILE:-/var/log/huewhimsy-health.log}"
ALERT_SCRIPT="$REPO_DIR/infra/scripts/email-alert.sh"

ts() { date -u +'%Y-%m-%dT%H:%M:%SZ'; }
log() { printf '[%s] %s\n' "$(ts)" "$*" >> "$LOG_FILE"; }

cd "$REPO_DIR"

# Collect unhealthy container names
mapfile -t unhealthy < <(
    docker compose -f "$COMPOSE_FILE" ps \
        --format '{{.Name}}	{{.Health}}' 2>/dev/null \
        | awk -F'\t' '$2 == "unhealthy" {print $1}'
)

if [ "${#unhealthy[@]}" -eq 0 ]; then
    exit 0
fi

for name in "${unhealthy[@]}"; do
    log "RESTART $name (was unhealthy)"
    docker restart "$name" >> "$LOG_FILE" 2>&1 || log "ERROR docker restart $name failed"
done

if [ -x "$ALERT_SCRIPT" ]; then
    body=$(mktemp)
    {
        printf 'Watchdog restarted the following unhealthy containers:\n\n'
        for name in "${unhealthy[@]}"; do
            printf '  - %s\n' "$name"
        done
        printf '\nPost-restart status:\n'
        sleep 5
        docker compose -f "$COMPOSE_FILE" ps 2>/dev/null
        printf '\nRecent log lines from affected containers:\n'
        for name in "${unhealthy[@]}"; do
            svc=$(echo "$name" | sed 's/^huewhimsy-//')
            printf '\n[%s]\n' "$svc"
            docker compose -f "$COMPOSE_FILE" logs --tail=15 "$svc" 2>&1 | tail -15
        done
    } > "$body"

    ALERT_MIN_GAP="${ALERT_MIN_GAP:-900}" "$ALERT_SCRIPT" \
        "watchdog-restart-$(IFS='_'; echo "${unhealthy[*]}")" \
        "container watchdog restarted: ${unhealthy[*]}" \
        "$body"
    rm -f "$body"
fi
