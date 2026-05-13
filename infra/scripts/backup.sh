#!/usr/bin/env bash
# HueWhimsy backup — Postgres dump + Redis RDB + volumes + uploads.
# Cron: 0 3 * * * /opt/huewhimsy/infra/scripts/backup.sh
set -euo pipefail

readonly REPO_DIR="${REPO_DIR:-/opt/huewhimsy}"
readonly BACKUP_ROOT="${BACKUP_ROOT:-/var/backups/huewhimsy}"
readonly KEEP_DAYS="${KEEP_DAYS:-7}"
readonly TS="$(date '+%Y%m%d-%H%M%S')"
readonly DEST="${BACKUP_ROOT}/${TS}"
readonly ENV_FILE="${REPO_DIR}/.env.production"

set -a; . "$ENV_FILE"; set +a

mkdir -p "$DEST"
cd "$REPO_DIR"

log() { printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*"; }

log "Postgres dump"
docker compose -f docker-compose.prod.yml exec -T postgres \
    pg_dump -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" -F c -Z 6 \
    > "${DEST}/postgres-${POSTGRES_DB}.dump"

log "Redis RDB snapshot"
docker compose -f docker-compose.prod.yml exec -T redis redis-cli SAVE >/dev/null
docker run --rm -v huewhimsy_redis_data:/data:ro -v "${DEST}":/out alpine \
    cp /data/dump.rdb /out/redis-dump.rdb

log "Compose + configs"
tar -czf "${DEST}/configs.tar.gz" \
    docker-compose.prod.yml infra/ .env.production 2>/dev/null || true

log "SHA256 manifest"
( cd "$DEST" && sha256sum * > SHA256SUMS )

log "Prune old (>${KEEP_DAYS}d)"
find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -mtime "+${KEEP_DAYS}" -exec rm -rf {} +

log "Disk free:"; df -h "$BACKUP_ROOT" | tail -1
log "Backup done: $DEST"
