#!/usr/bin/env bash
# Install systemd timers and cron entries for backups + monitoring.
set -euo pipefail

readonly REPO_DIR="${REPO_DIR:-/opt/huewhimsy}"
cd "$REPO_DIR"

step() { printf '\n\033[1;36m>> %s\033[0m\n' "$*"; }

step "Backup cron: daily 03:00 UTC"
cat > /etc/cron.d/huewhimsy-backup <<EOF
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
0 3 * * * root bash ${REPO_DIR}/infra/scripts/backup.sh >> /var/log/huewhimsy-backup.log 2>&1
EOF
chmod 644 /etc/cron.d/huewhimsy-backup

step "Docker prune cron: weekly Sunday 04:00 UTC"
cat > /etc/cron.d/huewhimsy-prune <<EOF
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
0 4 * * 0 root docker system prune -af --filter "until=168h" >> /var/log/huewhimsy-prune.log 2>&1
EOF
chmod 644 /etc/cron.d/huewhimsy-prune

step "Health-check cron: every 5 min (restart unhealthy)"
cat > /etc/cron.d/huewhimsy-health <<EOF
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
*/5 * * * * root cd ${REPO_DIR} && docker compose -f docker-compose.prod.yml ps --format '{{.Name}} {{.State}} {{.Health}}' | awk '\$3 == "unhealthy" {print \$1}' | xargs -r -n1 docker restart >> /var/log/huewhimsy-health.log 2>&1
EOF
chmod 644 /etc/cron.d/huewhimsy-health

step "Logrotate for huewhimsy logs"
cat > /etc/logrotate.d/huewhimsy <<'EOF'
/var/log/huewhimsy-*.log {
    weekly
    rotate 8
    missingok
    notifempty
    compress
    delaycompress
    copytruncate
}
EOF

step "Reload cron"
systemctl restart cron
systemctl is-active cron

step "Listing installed crons"
ls -la /etc/cron.d/huewhimsy-*

step "Done — cron + logrotate installed"
echo "Verify: 'tail -f /var/log/huewhimsy-backup.log' after next 03:00 UTC tick"
