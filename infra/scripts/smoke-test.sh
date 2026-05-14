#!/usr/bin/env bash
set -eo pipefail
cd /opt/huewhimsy

echo '=== Restart nginx so upstream cache refreshes ==='
docker compose -f docker-compose.prod.yml restart nginx
sleep 8

echo
echo '=== huewhimsy.com smoke test ==='
for p in / /health /shop /studio /store/products /admin/users /console/; do
    code=$(curl -s -o /dev/null -w '%{http_code}' "https://huewhimsy.com${p}")
    printf '  %-25s %s\n' "$p" "$code"
done

echo
echo '=== www.huewhimsy.com smoke test ==='
for p in / /health /shop; do
    code=$(curl -s -o /dev/null -w '%{http_code}' "https://www.huewhimsy.com${p}")
    printf '  %-25s %s\n' "$p" "$code"
done

echo
echo '=== Legacy srv1667251.hstgr.cloud (cert path changed — expect SSL error or redirect) ==='
for p in /; do
    code=$(curl -sk -o /dev/null -w '%{http_code}' "https://srv1667251.hstgr.cloud${p}")
    printf '  %-25s %s\n' "$p" "$code"
done

echo
echo '=== Container health ==='
docker compose -f docker-compose.prod.yml ps
