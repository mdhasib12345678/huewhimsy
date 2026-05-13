#!/usr/bin/env bash
set -euo pipefail
cd /opt/huewhimsy

echo '=== Container state ==='
docker compose -f docker-compose.prod.yml ps backend

echo
echo '=== Backend process tree ==='
docker exec huewhimsy-backend ps -ef 2>/dev/null || echo '(cannot exec)'

echo
echo '=== Backend last 30 log lines ==='
docker logs huewhimsy-backend --tail 30 2>&1

echo
echo '=== Postgres active connections to huewhimsy DB ==='
docker exec -i huewhimsy-postgres psql -U huewhimsy -d huewhimsy <<'SQL'
SELECT
    pid,
    state,
    wait_event_type,
    wait_event,
    age(now(), query_start) AS age,
    left(query, 100) AS query
FROM pg_stat_activity
WHERE datname = 'huewhimsy'
ORDER BY query_start NULLS LAST;
SQL

echo
echo '=== Locks held ==='
docker exec -i huewhimsy-postgres psql -U huewhimsy -d huewhimsy <<'SQL'
SELECT
    locktype,
    relation::regclass AS relation,
    mode,
    granted,
    pid
FROM pg_locks
WHERE relation IS NOT NULL
LIMIT 20;
SQL

echo
echo '=== Tables present so far ==='
docker exec -i huewhimsy-postgres psql -U huewhimsy -d huewhimsy <<'SQL'
\dt
SQL
