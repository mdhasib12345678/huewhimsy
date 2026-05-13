#!/usr/bin/env bash
# HueWhimsy restore — usage: restore.sh /var/backups/huewhimsy/YYYYMMDD-HHMMSS
set -euo pipefail

readonly REPO_DIR="${REPO_DIR:-/opt/huewhimsy}"
readonly SRC="${1:?Usage: $0 /var/backups/huewhimsy/<timestamp>}"
readonly ENV_FILE="${REPO_DIR}/.env.production"

[ -d "$SRC" ] || { echo "Backup dir not found: $SRC" >&2; exit 1; }
set -a; . "$ENV_FILE"; set +a
cd "$REPO_DIR"

read -rp "Restore from $SRC ? This will OVERWRITE the current Postgres DB. [yes/NO] " ans
[ "$ans" = "yes" ] || { echo "Aborted."; exit 1; }

DUMP="$(ls "$SRC"/postgres-*.dump | head -1)"
[ -f "$DUMP" ] || { echo "No postgres dump in $SRC" >&2; exit 1; }

echo "Stopping app containers..."
docker compose -f docker-compose.prod.yml stop backend storefront

echo "Restoring Postgres..."
docker compose -f docker-compose.prod.yml exec -T postgres \
    dropdb --if-exists -U "${POSTGRES_USER}" "${POSTGRES_DB}"
docker compose -f docker-compose.prod.yml exec -T postgres \
    createdb -U "${POSTGRES_USER}" "${POSTGRES_DB}"
docker compose -f docker-compose.prod.yml exec -T postgres \
    pg_restore -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --no-owner --jobs=2 < "$DUMP"

if [ -f "$SRC/redis-dump.rdb" ]; then
    echo "Restoring Redis..."
    docker compose -f docker-compose.prod.yml stop redis
    docker run --rm -v huewhimsy_redis_data:/data -v "$SRC":/in alpine \
        cp /in/redis-dump.rdb /data/dump.rdb
    docker compose -f docker-compose.prod.yml start redis
fi

echo "Starting app containers..."
docker compose -f docker-compose.prod.yml up -d backend storefront

echo "Restore complete."
