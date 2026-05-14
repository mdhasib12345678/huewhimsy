#!/usr/bin/env bash
# Install / configure the HueWhimsy monitoring stack on the VPS.
#
# Required env (or args):
#   SMTP_USER          Gmail account, e.g. hasib107040@gmail.com
#   SMTP_PASSWORD      Gmail 16-char App Password (NO spaces)
#   ALERT_TO           recipient (defaults to SMTP_USER)
#   ALERT_FROM         from-display (default: "HueWhimsy Alerts <SMTP_USER>")
#
# Usage:
#   SMTP_USER=hasib107040@gmail.com SMTP_PASSWORD=abcd1234... \
#     bash infra/monitoring/install.sh
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/huewhimsy}"
SCRIPTS_DIR="$REPO_DIR/infra/scripts"

: "${SMTP_USER:?SMTP_USER required (your Gmail address)}"
: "${SMTP_PASSWORD:?SMTP_PASSWORD required (Gmail App Password)}"
ALERT_TO="${ALERT_TO:-$SMTP_USER}"
ALERT_FROM="${ALERT_FROM:-HueWhimsy Alerts <$SMTP_USER>}"

step() { printf '\n\033[1;36m>> %s\033[0m\n' "$*"; }

step "Install msmtp + ca-certificates"
DEBIAN_FRONTEND=noninteractive apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get install -qq -y msmtp msmtp-mta ca-certificates >/dev/null

step "Write /etc/msmtprc (Gmail SMTP, TLS, port 587)"
cat > /etc/msmtprc <<EOF
defaults
auth           on
tls            on
tls_starttls   on
tls_trust_file /etc/ssl/certs/ca-certificates.crt
logfile        /var/log/msmtp.log

account default
host           smtp.gmail.com
port           587
from           $SMTP_USER
user           $SMTP_USER
password       $SMTP_PASSWORD
EOF
chmod 600 /etc/msmtprc
chown root:root /etc/msmtprc
touch /var/log/msmtp.log
chmod 640 /var/log/msmtp.log

step "Write /etc/huewhimsy/alerts.env"
mkdir -p /etc/huewhimsy
cat > /etc/huewhimsy/alerts.env <<EOF
ALERT_TO="$ALERT_TO"
ALERT_FROM="$ALERT_FROM"
EOF
chmod 600 /etc/huewhimsy/alerts.env

step "Ensure state + log directories"
mkdir -p /var/lib/huewhimsy/alerts
touch /var/log/huewhimsy-health.log
chmod 640 /var/log/huewhimsy-health.log

step "chmod +x scripts"
chmod +x "$SCRIPTS_DIR"/email-alert.sh \
         "$SCRIPTS_DIR"/health-probe.sh \
         "$SCRIPTS_DIR"/health-watchdog.sh \
         "$SCRIPTS_DIR"/daily-digest.sh

step "Install cron jobs"
# Health: probe + watchdog every 5 minutes
cat > /etc/cron.d/huewhimsy-health <<'EOF'
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
*/5 * * * * root bash /opt/huewhimsy/infra/scripts/health-watchdog.sh
*/5 * * * * root bash /opt/huewhimsy/infra/scripts/health-probe.sh
EOF
chmod 644 /etc/cron.d/huewhimsy-health

# Daily digest at 06:00 UTC
cat > /etc/cron.d/huewhimsy-digest <<'EOF'
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
0 6 * * * root bash /opt/huewhimsy/infra/scripts/daily-digest.sh
EOF
chmod 644 /etc/cron.d/huewhimsy-digest

systemctl reload cron 2>/dev/null || systemctl restart cron

step "Logrotate config"
cat > /etc/logrotate.d/huewhimsy-monitoring <<'EOF'
/var/log/huewhimsy-health.log
/var/log/msmtp.log
{
    weekly
    rotate 8
    compress
    missingok
    notifempty
    create 0640 root root
}
EOF

step "Send test email"
ALERT_MIN_GAP=0 "$SCRIPTS_DIR/email-alert.sh" "install-test" \
    "monitoring installed successfully" <<EOF
The HueWhimsy monitoring stack was installed at $(date -u +'%Y-%m-%d %H:%M:%S UTC').

Active cron jobs:
$(grep -h '^[*0-9]' /etc/cron.d/huewhimsy-* | sed 's/^/  /')

Alert recipient: $ALERT_TO
SMTP user:       $SMTP_USER

If you got this email, monitoring is fully wired.
EOF

step "Done"
echo "Check $ALERT_TO inbox for the test email."
echo "msmtp log:   /var/log/msmtp.log"
echo "health log:  /var/log/huewhimsy-health.log"
