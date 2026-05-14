# HueWhimsy Monitoring

Lightweight cron-based observability for the HueWhimsy production VPS.

## Components

| Script | Purpose | Schedule |
|---|---|---|
| `health-probe.sh` | Probes public endpoints + container health, emails on failure | `*/5 * * * *` |
| `health-watchdog.sh` | Restarts unhealthy containers, emails on restart | `*/5 * * * *` |
| `daily-digest.sh` | Daily ops summary (metrics, backups, errors) | `0 6 * * *` UTC |
| `backup.sh` | Database + config backup (existing from Phase 6) | `0 3 * * *` UTC |
| `email-alert.sh` | Rate-limited email wrapper used by all scripts | — |

## Configuration

All alert recipients/senders are sourced from `/etc/huewhimsy/alerts.env`:

```
ALERT_TO=hasib107040@gmail.com
ALERT_FROM=HueWhimsy Alerts <noreply@huewhimsy.com>
```

SMTP is delivered via **msmtp** configured for Gmail in `/etc/msmtprc` (chmod 600,
contains app password — NEVER committed). The setup script is
`infra/monitoring/install.sh`.

## Cron files

Installed to `/etc/cron.d/`:

- `huewhimsy-health` — runs health-probe.sh + health-watchdog.sh every 5 minutes
- `huewhimsy-digest` — runs daily-digest.sh at 06:00 UTC
- `huewhimsy-backup` — existing backup cron (Phase 6)
- `huewhimsy-prune` — existing weekly docker prune (Phase 6)

## Rate-limiting

`email-alert.sh` uses per-alert-key state files at `/var/lib/huewhimsy/alerts/`
to prevent spam. Default minimum gap is 30 minutes per unique alert key.

## Testing

```bash
# Send a test email
ALERT_MIN_GAP=0 /opt/huewhimsy/infra/scripts/email-alert.sh test "ping" <<< "test body"

# Trigger a fake unhealthy container alert
docker pause huewhimsy-nginx
sleep 6
bash /opt/huewhimsy/infra/scripts/health-probe.sh
docker unpause huewhimsy-nginx
```
