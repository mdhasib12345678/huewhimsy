#!/usr/bin/env bash
# Send an email alert via msmtp with rate-limiting per alert key.
# Usage:
#   email-alert.sh <alert-key> <subject> [body-file-or-stdin]
# Env:
#   ALERT_TO         destination email (default from /etc/huewhimsy/alerts.env)
#   ALERT_MIN_GAP    seconds between same-key alerts (default 1800 = 30min)
#   ALERT_STATE_DIR  state dir (default /var/lib/huewhimsy/alerts)
set -euo pipefail

ALERT_KEY="${1:?alert key required (e.g. health-backend)}"
ALERT_SUBJECT="${2:?subject required}"
ALERT_BODY_FILE="${3:-}"

# Load destination + sender config
if [ -f /etc/huewhimsy/alerts.env ]; then
    # shellcheck disable=SC1091
    . /etc/huewhimsy/alerts.env
fi

ALERT_TO="${ALERT_TO:?ALERT_TO must be set (recipient email)}"
ALERT_FROM="${ALERT_FROM:-HueWhimsy Alerts <noreply@huewhimsy.com>}"
ALERT_MIN_GAP="${ALERT_MIN_GAP:-1800}"
ALERT_STATE_DIR="${ALERT_STATE_DIR:-/var/lib/huewhimsy/alerts}"
HOSTNAME_TAG="$(hostname -s)"

mkdir -p "$ALERT_STATE_DIR"
STATE_FILE="$ALERT_STATE_DIR/$ALERT_KEY"

now=$(date +%s)
if [ -f "$STATE_FILE" ]; then
    last=$(cat "$STATE_FILE" 2>/dev/null || echo 0)
    diff=$(( now - last ))
    if [ "$diff" -lt "$ALERT_MIN_GAP" ]; then
        echo "[alert] $ALERT_KEY suppressed (${diff}s < ${ALERT_MIN_GAP}s)"
        exit 0
    fi
fi

# Compose body
if [ -n "$ALERT_BODY_FILE" ] && [ -f "$ALERT_BODY_FILE" ]; then
    body=$(cat "$ALERT_BODY_FILE")
elif [ ! -t 0 ]; then
    body=$(cat)
else
    body="(no body provided)"
fi

{
    printf 'From: %s\n' "$ALERT_FROM"
    printf 'To: %s\n' "$ALERT_TO"
    printf 'Subject: [HueWhimsy/%s] %s\n' "$HOSTNAME_TAG" "$ALERT_SUBJECT"
    printf 'Content-Type: text/plain; charset=utf-8\n'
    printf '\n'
    printf 'Host:  %s\n' "$(hostname -f 2>/dev/null || hostname)"
    printf 'Time:  %s\n' "$(date -u +'%Y-%m-%d %H:%M:%S UTC')"
    printf 'Key:   %s\n' "$ALERT_KEY"
    printf '\n'
    printf -- '--- Details ---\n'
    printf '%s\n' "$body"
} | msmtp -a default "$ALERT_TO"

echo "$now" > "$STATE_FILE"
echo "[alert] $ALERT_KEY sent to $ALERT_TO"
