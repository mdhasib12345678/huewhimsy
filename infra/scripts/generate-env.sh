#!/usr/bin/env bash
# Generate .env.production with strong random secrets.
# Usage: bash generate-env.sh [PUBLIC_HOST]
set -euo pipefail

readonly REPO_DIR="${REPO_DIR:-/opt/huewhimsy}"
readonly PUBLIC_HOST="${1:-srv1667251.hstgr.cloud}"
readonly OUT="${REPO_DIR}/.env.production"

cd "$REPO_DIR"

if [ -f "$OUT" ]; then
    echo ".env.production already exists. Refusing to overwrite." >&2
    echo "Remove or rename it first, then re-run." >&2
    exit 1
fi

gen_hex()    { openssl rand -hex 32; }
gen_b64()    { openssl rand -base64 24 | tr -d '\n/=+' | cut -c1-32; }

# For initial bring-up before SSL, use HTTP. Switch to HTTPS after certbot.
SCHEME="http"
URL="${SCHEME}://${PUBLIC_HOST}"

cat > "$OUT" <<EOF
# Auto-generated $(date -Iseconds) — DO NOT COMMIT
PUBLIC_HOST=${PUBLIC_HOST}
PUBLIC_SCHEME=${SCHEME}

# Postgres
POSTGRES_USER=huewhimsy
POSTGRES_PASSWORD=$(gen_b64)
POSTGRES_DB=huewhimsy

# Medusa
JWT_SECRET=$(gen_hex)
COOKIE_SECRET=$(gen_hex)
MEDUSA_BACKEND_URL=${URL}
STORE_CORS=${URL}
ADMIN_CORS=${URL}
AUTH_CORS=${URL}

# Next.js
NEXT_PUBLIC_MEDUSA_BACKEND_URL=${URL}
NEXT_PUBLIC_BASE_URL=${URL}
NEXT_PUBLIC_DEFAULT_REGION=us
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_PLACEHOLDER_run_seed_after_first_boot
REVALIDATE_SECRET=$(gen_hex)

# Admin
ADMIN_EMAIL=hasib107040@gmail.com
LETSENCRYPT_EMAIL=hasib107040@gmail.com
EOF

chmod 600 "$OUT"
echo "Generated: $OUT (mode 600)"
echo
echo "Summary:"
grep -E '^(PUBLIC_|POSTGRES_USER|POSTGRES_DB|MEDUSA_BACKEND_URL|NEXT_PUBLIC_BASE_URL|ADMIN_EMAIL)' "$OUT"
echo
echo "Secrets generated (hidden). Switch SCHEME to https after SSL is in place."
