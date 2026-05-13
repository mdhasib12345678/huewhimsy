# HueWhimsy — AI-Powered Commerce Platform

Production-grade Medusa + Next.js commerce stack on a single Hostinger KVM 2 VPS.

## Stack

| Layer | Technology |
|---|---|
| OS | Ubuntu 24.04 LTS |
| Container | Docker + Compose v2 |
| Reverse proxy | Nginx 1.27 |
| TLS | Let's Encrypt (certbot, auto-renew) |
| Database | PostgreSQL 16 |
| Cache / Queue | Redis 7 |
| Backend | Medusa v2 (Node 20, TypeScript) |
| Storefront | Next.js 15 (App Router, TypeScript) |
| CI/CD | GitHub Actions |

## Architecture

```
Internet
   │
   └── Hostinger Firewall (22, 80, 443)
       └── VPS (Ubuntu 24.04, 2 vCPU, 8GB)
           └── Docker network: huewhimsy_net
               ├── nginx       (80/443 → host)
               ├── storefront  (3000, Next.js)
               ├── backend     (9000, Medusa)
               ├── postgres    (5432)
               ├── redis       (6379)
               └── certbot     (renewal loop)
```

## Resource Budget (8 GB / 2 vCPU)

| Service   | Memory cap | CPU cap |
|-----------|-----------:|--------:|
| postgres  | 1500 MB    | 1.0     |
| backend   | 1024 MB    | 1.0     |
| storefront| 1024 MB    | 1.0     |
| redis     |  300 MB    | 0.5     |
| nginx     |  128 MB    | 0.5     |
| certbot   |   64 MB    | 0.1     |
| **Total** | **~4 GB**  |         |
| Host + swap headroom | ~4 GB | — |

## Project Layout

```
HueWhimsy/
├── backend/                # Medusa v2 app
│   ├── Dockerfile
│   └── .dockerignore
├── storefront/             # Next.js 15 app
│   ├── Dockerfile
│   └── .dockerignore
├── infra/
│   ├── postgres/postgresql.conf
│   ├── redis/redis.conf
│   ├── nginx/
│   │   ├── nginx.conf
│   │   ├── conf.d/default.conf
│   │   └── snippets/{proxy-params,security-headers}.conf
│   └── scripts/
│       ├── bootstrap.sh    # one-shot VPS hardening + Docker install
│       ├── deploy.sh       # build + restart
│       ├── backup.sh       # pg_dump + redis snapshot + volumes
│       ├── restore.sh
│       └── monitor.sh
├── docker-compose.prod.yml
├── .env.example
└── .github/workflows/deploy.yml
```

## Deploy

```bash
# On the VPS (one-time bootstrap)
ssh root@<vps-ip>
git clone <repo-url> /opt/huewhimsy
cd /opt/huewhimsy
cp .env.example .env.production
nano .env.production   # fill secrets
bash infra/scripts/bootstrap.sh
bash infra/scripts/deploy.sh
```

## Operate

```bash
# Logs
docker compose -f docker-compose.prod.yml logs -f backend

# Restart a service
docker compose -f docker-compose.prod.yml restart backend

# Backup (cron-friendly)
bash infra/scripts/backup.sh

# Resource usage
docker stats --no-stream
```

## Security Defaults

- SSH: key-only, password disabled
- Firewall: Hostinger group + host UFW, only 22/80/443/ICMP
- fail2ban on SSH (3 retries / 1h ban)
- TLS: HSTS, modern cipher suite, OCSP stapling
- HTTP: rate limiting per route (`web_limit`, `api_limit`, `auth_limit`)
- Unattended security upgrades enabled
- Docker logs rotated (10 MB × 3)
