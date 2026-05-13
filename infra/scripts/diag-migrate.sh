#!/usr/bin/env bash
set -eo pipefail
cd /opt/huewhimsy

echo '=== Reset migrations table for clean retry ==='
docker exec -i huewhimsy-postgres psql -U huewhimsy -d huewhimsy -c 'DROP TABLE IF EXISTS mikro_orm_migrations CASCADE;' 2>&1 | tail -1

echo
echo '=== Run migrations via compose with DEBUG=knex ==='
docker compose -f docker-compose.prod.yml run --rm \
    -e DEBUG=knex:query,knex:tx,knex:bindings \
    -e NODE_OPTIONS="--max-old-space-size=768 --trace-warnings" \
    backend sh -c '
        echo "DB_URL host: $(echo "$DATABASE_URL" | sed -E "s|.*@([^/]+).*|\1|")"
        echo "DATABASE_URL set: $([ -n "$DATABASE_URL" ] && echo yes || echo no)"
        echo "Running npx medusa db:migrate..."
        timeout 90 npx medusa db:migrate 2>&1
        echo "Exit: $?"
    '
