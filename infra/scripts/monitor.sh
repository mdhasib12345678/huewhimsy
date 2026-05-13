#!/usr/bin/env bash
# HueWhimsy monitor — health, resources, recent errors.
set -euo pipefail
cd "${REPO_DIR:-/opt/huewhimsy}"

hdr() { printf '\n\033[1;33m== %s ==\033[0m\n' "$*"; }

hdr "Host"
uptime
echo
free -h
echo
df -h /
echo
swapon --show

hdr "Docker compose status"
docker compose -f docker-compose.prod.yml ps

hdr "Docker resource usage"
docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}'

hdr "Recent error logs (last 20 lines, per container)"
for svc in backend storefront postgres redis nginx; do
    echo "--- $svc ---"
    docker compose -f docker-compose.prod.yml logs --tail=20 "$svc" 2>&1 \
        | grep -Ei 'error|fatal|panic|warn' | tail -10 || echo "(no errors)"
done

hdr "fail2ban jails"
fail2ban-client status sshd 2>/dev/null | sed 's/^/  /' || echo "fail2ban not running"

hdr "UFW"
ufw status numbered | head -20
