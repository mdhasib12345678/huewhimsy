#!/usr/bin/env bash
set -euo pipefail
cd /opt/huewhimsy

set -a
. ./.env.production
set +a

echo '=== DATABASE_URL (masked) ==='
echo "DATABASE_URL points to host=postgres user=${POSTGRES_USER} db=${POSTGRES_DB}"
echo

echo '=== Direct psql from a fresh transient container ==='
docker run --rm --network huewhimsy_net \
    -e PGPASSWORD="${POSTGRES_PASSWORD}" \
    postgres:16-alpine \
    psql -h postgres -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -c "SELECT version(), now();"
echo

echo '=== DNS resolve check ==='
docker run --rm --network huewhimsy_net alpine:3 sh -c "nslookup postgres 2>&1 | head -5; nslookup redis 2>&1 | head -5"
echo

echo '=== Postgres container resource stats ==='
docker stats huewhimsy-postgres --no-stream --format 'Mem: {{.MemUsage}}  CPU: {{.CPUPerc}}  PIDs: {{.PIDs}}'
echo

echo '=== Postgres max_connections vs current ==='
docker exec -i huewhimsy-postgres psql -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" <<'SQL'
SELECT
    setting::int AS max_connections
FROM pg_settings WHERE name = 'max_connections';
SELECT count(*) AS active_connections FROM pg_stat_activity;
SQL
