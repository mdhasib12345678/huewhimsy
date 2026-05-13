#!/usr/bin/env bash
set -euo pipefail
cd /opt/huewhimsy

echo '=== Compose status ==='
docker compose -f docker-compose.prod.yml ps
echo

echo '=== Postgres version ==='
docker exec huewhimsy-postgres psql -U huewhimsy -d huewhimsy -c "SELECT version();"
echo

echo '=== Postgres tuning verification ==='
docker exec huewhimsy-postgres psql -U huewhimsy -d huewhimsy -c "SHOW shared_buffers;"
docker exec huewhimsy-postgres psql -U huewhimsy -d huewhimsy -c "SHOW effective_cache_size;"
docker exec huewhimsy-postgres psql -U huewhimsy -d huewhimsy -c "SHOW max_connections;"
docker exec huewhimsy-postgres psql -U huewhimsy -d huewhimsy -c "SHOW work_mem;"
docker exec huewhimsy-postgres psql -U huewhimsy -d huewhimsy -c "SHOW maintenance_work_mem;"
echo

echo '=== Enable pg_stat_statements ==='
docker exec huewhimsy-postgres psql -U huewhimsy -d huewhimsy -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"
docker exec huewhimsy-postgres psql -U huewhimsy -d huewhimsy -c "\dx"
echo

echo '=== Database list ==='
docker exec huewhimsy-postgres psql -U huewhimsy -d huewhimsy -c "\l"
echo

echo '=== Redis config ==='
docker exec huewhimsy-redis redis-cli CONFIG GET maxmemory
docker exec huewhimsy-redis redis-cli CONFIG GET maxmemory-policy
docker exec huewhimsy-redis redis-cli CONFIG GET save
echo

echo '=== Redis smoke test ==='
docker exec huewhimsy-redis redis-cli SET smoke "ok" EX 60
docker exec huewhimsy-redis redis-cli GET smoke
docker exec huewhimsy-redis redis-cli DBSIZE
echo

echo '=== Volume sizes ==='
docker volume ls --filter "name=huewhimsy"
docker exec huewhimsy-postgres du -sh /var/lib/postgresql/data
docker exec huewhimsy-redis du -sh /data
echo

echo '=== Resource usage ==='
docker stats --no-stream --format 'table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}'
