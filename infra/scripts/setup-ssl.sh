#!/usr/bin/env bash
# Obtain Let's Encrypt cert (HTTP-01 webroot) and switch nginx to HTTPS.
# Usage: bash setup-ssl.sh <domain> [email]
set -euo pipefail

readonly REPO_DIR="${REPO_DIR:-/opt/huewhimsy}"
readonly DOMAIN="${1:?Usage: $0 <domain> [email]}"
readonly EMAIL="${2:-${LETSENCRYPT_EMAIL:-hasib107040@gmail.com}}"
readonly STAGING="${STAGING:-0}"

cd "$REPO_DIR"

step() { printf '\n\033[1;36m>> %s\033[0m\n' "$*"; }

step "Pre-flight: domain $DOMAIN must resolve to this VPS"
THIS_IP="$(curl -fsS https://api.ipify.org)"
# Query against an external public resolver to avoid /etc/hosts shadowing
RESOLVED="$(dig +short A "$DOMAIN" @1.1.1.1 | grep -E '^[0-9.]+$' | tail -1 || true)"
echo "  this VPS public IP : $THIS_IP"
echo "  $DOMAIN  resolves to: ${RESOLVED:-<no A record>}"
if [ -z "$RESOLVED" ] || [ "$RESOLVED" != "$THIS_IP" ]; then
    if [ "${SKIP_DNS_CHECK:-0}" = "1" ]; then
        echo "  (SKIP_DNS_CHECK=1 set, proceeding anyway)"
    else
        echo "WARNING: $DOMAIN does not resolve to $THIS_IP — Let's Encrypt HTTP-01 will fail." >&2
        echo "Set the A record and re-run, or rerun with SKIP_DNS_CHECK=1 if you've already verified." >&2
        exit 1
    fi
fi

step "Ensure webroot volume + nginx is serving /.well-known/acme-challenge/"
docker compose -f docker-compose.prod.yml up -d nginx

step "Request certificate"
CERTBOT_EXTRA=()
[ "$STAGING" = "1" ] && CERTBOT_EXTRA+=(--staging)

docker compose -f docker-compose.prod.yml run --rm \
    --entrypoint "" certbot \
    certbot certonly \
    --webroot --webroot-path=/var/www/certbot \
    --email "$EMAIL" --agree-tos --no-eff-email \
    --non-interactive --keep-until-expiring \
    "${CERTBOT_EXTRA[@]}" \
    -d "$DOMAIN"

step "Install nginx HTTPS vhost"
cat > /opt/huewhimsy/infra/nginx/conf.d/ssl.conf <<EOF
# Redirect all HTTP to HTTPS (except ACME)
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    location / {
        return 301 https://\$host\$request_uri;
    }
}

# HTTPS
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name ${DOMAIN};

    ssl_certificate     /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:MozSSL:10m;
    ssl_session_tickets off;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_stapling on;
    ssl_stapling_verify on;
    resolver 1.1.1.1 1.0.0.1 valid=300s;
    resolver_timeout 5s;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    include /etc/nginx/snippets/security-headers.conf;

    location = /health {
        access_log off;
        return 200 "ok\n";
        add_header Content-Type text/plain;
    }

    # Medusa admin UI
    location /app {
        proxy_pass http://medusa_backend;
        include /etc/nginx/snippets/proxy-params.conf;
    }
    location /admin/ {
        limit_req zone=api_limit burst=40 nodelay;
        proxy_pass http://medusa_backend;
        include /etc/nginx/snippets/proxy-params.conf;
    }
    location /store/ {
        limit_req zone=api_limit burst=60 nodelay;
        proxy_pass http://medusa_backend;
        include /etc/nginx/snippets/proxy-params.conf;
    }
    location /auth/ {
        limit_req zone=auth_limit burst=10 nodelay;
        proxy_pass http://medusa_backend;
        include /etc/nginx/snippets/proxy-params.conf;
    }
    location /hooks/ {
        proxy_pass http://medusa_backend;
        include /etc/nginx/snippets/proxy-params.conf;
    }
    location /_next/static/ {
        proxy_pass http://nextjs_storefront;
        include /etc/nginx/snippets/proxy-params.conf;
        proxy_cache_valid 200 365d;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
    location /_next/image {
        proxy_pass http://nextjs_storefront;
        include /etc/nginx/snippets/proxy-params.conf;
        proxy_cache_valid 200 7d;
    }
    location / {
        limit_req zone=web_limit burst=120 nodelay;
        proxy_pass http://nextjs_storefront;
        include /etc/nginx/snippets/proxy-params.conf;
    }
}
EOF

# Remove HTTP-only default to avoid conflict
mv /opt/huewhimsy/infra/nginx/conf.d/default.conf \
   /opt/huewhimsy/infra/nginx/conf.d/default.conf.disabled 2>/dev/null || true

step "Switch env scheme to https"
sed -i 's#^PUBLIC_SCHEME=http$#PUBLIC_SCHEME=https#' "$REPO_DIR/.env.production"
sed -i "s#http://${DOMAIN}#https://${DOMAIN}#g" "$REPO_DIR/.env.production"

step "Test nginx config and reload"
docker compose -f docker-compose.prod.yml exec nginx nginx -t
docker compose -f docker-compose.prod.yml restart nginx

step "Restart app containers to pick up new URLs"
docker compose -f docker-compose.prod.yml up -d backend storefront

step "Verify HTTPS"
sleep 5
curl -sS -o /dev/null -w "HTTPS health: %{http_code}\n" "https://${DOMAIN}/health" || true
curl -sS -I "https://${DOMAIN}/" | head -5 || true

step "SSL setup complete"
