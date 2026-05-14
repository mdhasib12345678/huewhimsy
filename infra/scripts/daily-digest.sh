#!/usr/bin/env bash
# Daily ops digest email — VPS metrics, container status, backups, errors.
# Designed for: 0 6 * * * cron.
set -uo pipefail

REPO_DIR="${REPO_DIR:-/opt/huewhimsy}"
ALERT_SCRIPT="$REPO_DIR/infra/scripts/email-alert.sh"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/huewhimsy}"

body=$(mktemp)
{
    printf '=== HueWhimsy Daily Digest — %s ===\n\n' "$(date -u +'%Y-%m-%d')"

    printf '--- Host ---\n'
    uptime
    echo
    free -h
    echo
    df -h /
    echo

    printf '\n--- Container status ---\n'
    docker compose -f "$REPO_DIR/docker-compose.prod.yml" ps 2>/dev/null \
        | awk 'NR==1 || /huewhimsy/'
    echo

    printf '\n--- Docker resource usage ---\n'
    docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}' 2>/dev/null

    printf '\n--- Backups (last 7 days) ---\n'
    if [ -d "$BACKUP_DIR" ]; then
        find "$BACKUP_DIR" -mindepth 1 -maxdepth 1 -type d -mtime -7 \
            -printf '%TY-%Tm-%Td %TH:%TM  %p\n' 2>/dev/null \
            | sort -r | head -10
        echo
        printf 'Total backup size: %s\n' \
            "$(du -sh "$BACKUP_DIR" 2>/dev/null | awk '{print $1}')"
    else
        printf '(no backup dir found at %s)\n' "$BACKUP_DIR"
    fi

    printf '\n--- Recent errors (last 24h, per container) ---\n'
    for svc in backend storefront nginx postgres redis; do
        echo "[$svc]"
        docker compose -f "$REPO_DIR/docker-compose.prod.yml" logs --since 24h "$svc" 2>&1 \
            | grep -Ei 'error|fatal|panic' \
            | grep -viE 'pg_dump|backup' \
            | tail -5 \
            || echo "(none)"
        echo
    done

    printf '\n--- Health probe log (today) ---\n'
    awk -v today="$(date -u +%Y-%m-%d)" '$0 ~ today' /var/log/huewhimsy-health.log 2>/dev/null \
        | grep -E 'FAIL|ERROR' | tail -20 \
        || echo "(no failures recorded today)"

    printf '\n--- fail2ban ---\n'
    fail2ban-client status sshd 2>/dev/null \
        | grep -E 'failed|banned' \
        || echo "(fail2ban not available)"

    printf '\n--- Last deploy commit ---\n'
    if [ -d "$REPO_DIR/.git" ]; then
        git -C "$REPO_DIR" log -1 --format='%h %ai %s%n%nAuthor: %an'
    else
        ls -la "$REPO_DIR/docker-compose.prod.yml" 2>/dev/null | awk '{printf "Last code update: %s %s %s\n", $6, $7, $8}'
    fi
} > "$body"

# Always send (rate-limit far enough apart that the daily cron always fires)
SUBJECT="daily digest $(date -u +%Y-%m-%d)"
if [ -x "$ALERT_SCRIPT" ]; then
    ALERT_MIN_GAP=3600 "$ALERT_SCRIPT" "daily-digest-$(date -u +%Y-%m-%d)" "$SUBJECT" "$body"
fi

rm -f "$body"
