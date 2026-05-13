#!/usr/bin/env bash
# HueWhimsy VPS bootstrap — Ubuntu 24.04 LTS, KVM 2 (2 vCPU, 8GB RAM, 100GB)
# Idempotent: safe to re-run.
set -euo pipefail

readonly LOG="/var/log/huewhimsy-bootstrap.log"
exec > >(tee -a "$LOG") 2>&1

step() { printf '\n\033[1;32m=== [%s] %s ===\033[0m\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }

[ "$(id -u)" -eq 0 ] || { echo "Run as root" >&2; exit 1; }

export DEBIAN_FRONTEND=noninteractive
export NEEDRESTART_MODE=a

step "1/13 apt update + upgrade"
apt-get update -y
apt-get upgrade -y
apt-get autoremove -y

step "2/13 Base packages"
apt-get install -y --no-install-recommends \
    ca-certificates curl wget git gnupg lsb-release software-properties-common \
    ufw fail2ban unattended-upgrades apt-listchanges needrestart \
    htop iotop ncdu jq tree nano vim tmux rsync \
    cron logrotate netcat-openbsd dnsutils chrony \
    build-essential python3-pip openssl

step "3/13 Hostname + /etc/hosts"
hostnamectl set-hostname srv1667251
if ! grep -q '127.0.1.1 srv1667251' /etc/hosts; then
    echo '127.0.1.1 srv1667251' >> /etc/hosts
fi

step "4/13 Timezone + NTP"
timedatectl set-timezone UTC
systemctl enable --now chrony

step "5/13 4 GB swapfile"
if ! swapon --show | grep -q '/swapfile'; then
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
fi
grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab

step "6/13 Sysctl tuning"
cat > /etc/sysctl.d/99-huewhimsy.conf <<'EOF'
# memory
vm.swappiness = 10
vm.vfs_cache_pressure = 50
vm.overcommit_memory = 1
vm.dirty_ratio = 15
vm.dirty_background_ratio = 5
vm.max_map_count = 262144

# network
net.core.somaxconn = 65535
net.core.netdev_max_backlog = 65535
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 15
net.ipv4.tcp_keepalive_time = 600
net.ipv4.tcp_keepalive_intvl = 30
net.ipv4.tcp_keepalive_probes = 5
net.ipv4.tcp_tw_reuse = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.ip_local_port_range = 10240 65535
net.ipv4.tcp_slow_start_after_idle = 0
net.ipv4.tcp_mtu_probing = 1
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

# filesystem
fs.file-max = 2097152
fs.inotify.max_user_instances = 8192
fs.inotify.max_user_watches = 524288

# bridge nf (Docker)
net.bridge.bridge-nf-call-iptables = 1
net.bridge.bridge-nf-call-ip6tables = 1
EOF
sysctl --system >/dev/null

step "7/13 ulimits"
cat > /etc/security/limits.d/99-huewhimsy.conf <<'EOF'
* soft nofile 1048576
* hard nofile 1048576
* soft nproc  unlimited
* hard nproc  unlimited
root soft nofile 1048576
root hard nofile 1048576
EOF

step "8/13 Unattended security upgrades"
cat > /etc/apt/apt.conf.d/52unattended-upgrades-local <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
EOF
systemctl enable --now unattended-upgrades

step "9/13 SSH hardening"
mkdir -p /etc/ssh/sshd_config.d
cat > /etc/ssh/sshd_config.d/99-huewhimsy.conf <<'EOF'
PermitRootLogin prohibit-password
PasswordAuthentication no
PubkeyAuthentication yes
KbdInteractiveAuthentication no
PermitEmptyPasswords no
X11Forwarding no
MaxAuthTries 3
LoginGraceTime 30
ClientAliveInterval 300
ClientAliveCountMax 2
AllowAgentForwarding no
AllowTcpForwarding no
GatewayPorts no
PermitTunnel no
PrintMotd no
TCPKeepAlive yes
UseDNS no
EOF
# Validate before reload
sshd -t
systemctl reload ssh

step "10/13 fail2ban"
cat > /etc/fail2ban/jail.d/huewhimsy.local <<'EOF'
[DEFAULT]
bantime  = 1h
findtime = 10m
maxretry = 3
backend  = systemd
banaction = ufw
ignoreip = 127.0.0.1/8 ::1

[sshd]
enabled  = true
port     = ssh
mode     = aggressive
EOF
systemctl enable --now fail2ban
systemctl restart fail2ban

step "11/13 UFW (host firewall, second layer)"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp comment 'SSH'
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'
ufw logging low
ufw --force enable

step "12/13 Docker + Compose v2"
if ! command -v docker >/dev/null 2>&1; then
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" \
        > /etc/apt/sources.list.d/docker.list
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
fi

mkdir -p /etc/docker
cat > /etc/docker/daemon.json <<'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "live-restore": true,
  "default-ulimits": {
    "nofile": { "Name": "nofile", "Hard": 1048576, "Soft": 1048576 }
  },
  "max-concurrent-downloads": 3,
  "max-concurrent-uploads": 3,
  "userland-proxy": false,
  "experimental": false,
  "metrics-addr": "127.0.0.1:9323"
}
EOF
systemctl enable docker
systemctl restart docker

cat > /etc/logrotate.d/docker <<'EOF'
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    missingok
    notifempty
    compress
    delaycompress
    copytruncate
}
EOF

step "13/13 Verify"
docker --version
docker compose version
free -h
df -h /
swapon --show
ufw status verbose
systemctl is-active fail2ban
systemctl is-active unattended-upgrades
systemctl is-active docker

step "BOOTSTRAP COMPLETE"
echo "Log: $LOG"
