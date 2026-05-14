#!/usr/bin/env bash
# Migrate primary domain to huewhimsy.com:
#   1. Issue Let's Encrypt cert covering huewhimsy.com + www.huewhimsy.com (+ keep temp Hostinger name as SAN)
#   2. Update .env.production URLs
#   3. Rebuild storefront with the new public URL baked into the Vite bundle
#   4. Reload nginx + restart backend
#   5. Smoke-test all URLs over HTTPS
# Safe to re-run.
set -euo pipefail

readonly REPO_DIR="${REPO_DIR:-/opt/huewhimsy}"
readonly NEW_DOMAIN="${NEW_DOMAIN:-huewhimsy.com}"
readonly NEW_WWW="${NEW_WWW:-www.$NEW_DOMAIN}"
readonly OLD_DOMAIN="${OLD_DOMAIN:-srv1667251.hstgr.cloud}"
readonly EMAIL="${LETSENCRYPT_EMAIL:-hasib107040@gmail.com}"

cd "$REPO_DIR"

step() { printf '\n\033[1;36m>> %s\033[0m\n' "$*"; }

step "Pre-flight: verify $NEW_DOMAIN and $NEW_WWW resolve to this VPS"
THIS_IP="$(curl -fsS https://api.ipify.org)"
for d in "$NEW_DOMAIN" "$NEW_WWW"; do
    R="$(dig +short A "$d" @1.1.1.1 | grep -E '^[0-9.]+$' | tail -1 || true)"
    echo "  $d -> ${R:-<no A record>}"
    [ "$R" = "$THIS_IP" ] || {
        echo "  ERROR: $d does not resolve to $THIS_IP" >&2
        echo "  Wait for DNS propagation or rerun with SKIP_DNS_CHECK=1" >&2
        [ "${SKIP_DNS_CHECK:-0}" = "1" ] || exit 1
    }
done

step "Issue Let's Encrypt cert for huewhimsy.com + www (hstgr.cloud has weekly LE cap)"
docker compose -f docker-compose.prod.yml run --rm \
    --entrypoint "" certbot \
    certbot certonly \
    --webroot --webroot-path=/var/www/certbot \
    --email "$EMAIL" --agree-tos --no-eff-email \
    --non-interactive --keep-until-expiring \
    --cert-name huewhimsy \
    -d "$NEW_DOMAIN" -d "$NEW_WWW"

step "Verify cert files exist"
docker compose -f docker-compose.prod.yml exec -T nginx \
    ls -la /etc/letsencrypt/live/huewhimsy/

step "Point nginx ssl.conf at the new cert"
sed -i.bak 's|/etc/letsencrypt/live/srv1667251.hstgr.cloud/|/etc/letsencrypt/live/huewhimsy/|g' \
    "$REPO_DIR/infra/nginx/conf.d/ssl.conf"
grep -E 'ssl_certificate' "$REPO_DIR/infra/nginx/conf.d/ssl.conf"

step "Update .env.production URLs: $OLD_DOMAIN -> $NEW_DOMAIN"
sed -i.bak "s|https://${OLD_DOMAIN}|https://${NEW_DOMAIN}|g" "$REPO_DIR/.env.production"
echo "  Diff:"
diff "$REPO_DIR/.env.production.bak" "$REPO_DIR/.env.production" || true
echo "  New URLs:"
grep -E '^(PUBLIC_HOST|MEDUSA_BACKEND_URL|NEXT_PUBLIC_BASE_URL|STORE_CORS|ADMIN_CORS|AUTH_CORS|NEXT_PUBLIC_MEDUSA_BACKEND_URL)=' "$REPO_DIR/.env.production"

step "Reload nginx so it picks up the new cert location"
docker compose -f docker-compose.prod.yml exec -T nginx nginx -t
docker compose -f docker-compose.prod.yml restart nginx

step "Rebuild storefront with new VITE_MEDUSA_BACKEND_URL baked"
docker compose -f docker-compose.prod.yml build storefront

step "Restart backend (picks up new CORS) and recreate storefront"
docker compose -f docker-compose.prod.yml up -d backend storefront

step "Wait 25s for healthchecks"
sleep 25
docker compose -f docker-compose.prod.yml ps

step "Smoke test on https://${NEW_DOMAIN}"
for p in "/" "/health" "/shop" "/studio" "/store/products" "/admin/users"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "https://${NEW_DOMAIN}${p}" || echo "ERR")
    printf '  %-25s %s\n' "$p" "$code"
done

step "Smoke test on https://www.${NEW_DOMAIN}"
for p in "/" "/health"; do
    code=$(curl -s -o /dev/null -w "%{http_code}" "https://www.${NEW_DOMAIN}${p}" || echo "ERR")
    printf '  %-25s %s\n' "$p" "$code"
done

step "Domain migration complete."
echo "Old temp URL still works (via cert SAN): https://${OLD_DOMAIN}"
echo "New primary URL:                          https://${NEW_DOMAIN}"
