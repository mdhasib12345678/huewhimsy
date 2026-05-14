#!/usr/bin/env bash
# Probe public + container health, email on failure (rate-limited via email-alert.sh).
# Designed for: */5 * * * * cron.
set -uo pipefail

REPO_DIR="${REPO_DIR:-/opt/huewhimsy}"
LOG_FILE="${LOG_FILE:-/var/log/huewhimsy-health.log}"
ALERT_SCRIPT="$REPO_DIR/infra/scripts/email-alert.sh"

ts() { date -u +'%Y-%m-%dT%H:%M:%SZ'; }
log() { printf '[%s] %s\n' "$(ts)" "$*" >> "$LOG_FILE"; }

probe_http() {
    local name="$1" url="$2" want="$3"
    local code
    code=$(curl -sf -o /dev/null -w '%{http_code}' --max-time 10 "$url" || echo 000)
    if [ "$code" = "$want" ]; then
        log "OK    $name $url -> $code"
        return 0
    fi
    log "FAIL  $name $url -> $code (wanted $want)"
    return 1
}

# Allow either 200 or 400 for /store/products — 400 means it responded (just needs query params).
probe_http_any() {
    local name="$1" url="$2"; shift 2
    local code
    code=$(curl -sf -o /dev/null -w '%{http_code}' --max-time 10 "$url" || echo 000)
    for want in "$@"; do
        if [ "$code" = "$want" ]; then
            log "OK    $name $url -> $code"
            return 0
        fi
    done
    log "FAIL  $name $url -> $code (wanted one of $*)"
    return 1
}

failures=()

probe_http       "public-health"   "https://huewhimsy.com/health"          "200" || failures+=("public-health")
probe_http       "storefront"      "https://huewhimsy.com/"                "200" || failures+=("storefront")
probe_http       "studio"          "https://huewhimsy.com/studio"          "200" || failures+=("studio")
probe_http_any   "store-api"       "https://huewhimsy.com/store/products"  "200" "400" || failures+=("store-api")

# Container health (only if we are on the VPS)
if [ -d "$REPO_DIR" ] && command -v docker >/dev/null 2>&1; then
    while IFS=$'\t' read -r name health; do
        if [ "$health" = "unhealthy" ]; then
            log "FAIL  container:$name unhealthy"
            failures+=("container:$name")
        fi
    done < <(docker compose -f "$REPO_DIR/docker-compose.prod.yml" ps \
        --format '{{.Name}}	{{.Health}}' 2>/dev/null || true)
fi

if [ "${#failures[@]}" -eq 0 ]; then
    exit 0
fi

# Build alert body
body=$(mktemp)
{
    printf 'Probe failures at %s\n\n' "$(ts)"
    for f in "${failures[@]}"; do
        printf '  - %s\n' "$f"
    done
    printf '\n--- Recent log entries ---\n'
    tail -50 "$LOG_FILE" 2>/dev/null || true
    printf '\n--- Container status ---\n'
    docker compose -f "$REPO_DIR/docker-compose.prod.yml" ps 2>/dev/null || true
} > "$body"

# Group failures into one alert key per probe interval
ALERT_KEY="health-probe-$(IFS='_'; echo "${failures[*]}" | tr ':' '-' | tr ' ' '_')"
SUBJECT="health probe failed: ${failures[*]}"

if [ -x "$ALERT_SCRIPT" ]; then
    ALERT_MIN_GAP="${ALERT_MIN_GAP:-1800}" "$ALERT_SCRIPT" "$ALERT_KEY" "$SUBJECT" "$body" || \
        log "ERROR could not send alert (alert script failed)"
else
    log "ERROR alert script missing or not executable: $ALERT_SCRIPT"
fi

rm -f "$body"
exit 1
