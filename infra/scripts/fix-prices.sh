#!/usr/bin/env bash
# Fix demo product prices: Medusa v2 amounts are decimal majors (USD dollars), not cents.
# Existing prices were stored as 1499 ($1499). We rewrite them to 14.99.
set -euo pipefail
cd /opt/huewhimsy

set -a; . ./.env.production; set +a

ADMIN_EMAIL="${ADMIN_EMAIL:-hasib107040@gmail.com}"
ADMIN_PASSWORD="${1:-Hue-2024@2341}"
PUBLIC_URL="${MEDUSA_BACKEND_URL:-https://huewhimsy.com}"

step() { printf '\n\033[1;36m>> %s\033[0m\n' "$*"; }

step "Login as admin"
TOKEN=$(curl -fsS -X POST "${PUBLIC_URL}/auth/user/emailpass" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
[ -n "$TOKEN" ] || { echo "Admin login failed" >&2; exit 1; }

api() {
    local method=$1 path=$2 body="${3:-}"
    if [ -n "$body" ]; then
        curl -fsS -X "$method" "${PUBLIC_URL}${path}" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$body"
    else
        curl -fsS -X "$method" "${PUBLIC_URL}${path}" \
            -H "Authorization: Bearer $TOKEN"
    fi
}

step "Fetch products with variants"
PRODUCTS=$(api GET "/admin/products?limit=50&fields=id,handle,title,*variants,*variants.prices")

declare -A FIX_MAP=(
  [a-is-for-alligator]=14.99
  [dinosaur-dance-party]=17.99
  [whiskers-and-wonders]=15.99
  [around-the-world-26]=18.99
)

for handle in "${!FIX_MAP[@]}"; do
    NEW_PRICE=${FIX_MAP[$handle]}
    PRODUCT=$(echo "$PRODUCTS" | python3 -c "
import sys, json
p = next((x for x in json.load(sys.stdin)['products'] if x['handle']=='${handle}'), None)
print(json.dumps(p) if p else '')
")
    if [ -z "$PRODUCT" ]; then
        echo "  skip ${handle}: not found"
        continue
    fi
    PID=$(echo "$PRODUCT" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
    VID=$(echo "$PRODUCT" | python3 -c "import sys,json; print(json.load(sys.stdin)['variants'][0]['id'])")
    CURRENT=$(echo "$PRODUCT" | python3 -c "
import sys,json
v = json.load(sys.stdin)['variants'][0]
ps = v.get('prices') or []
print(ps[0]['amount'] if ps else 'none')
")
    echo "  ${handle} (product=${PID} variant=${VID}) current=${CURRENT} -> ${NEW_PRICE}"

    api POST "/admin/products/${PID}/variants/${VID}" "{\"prices\":[{\"amount\":${NEW_PRICE},\"currency_code\":\"usd\"}]}" \
        | python3 -c "import sys,json; d=json.load(sys.stdin); v=d.get('product',{}).get('variants',[{}])[0]; ps=v.get('prices',[]); print('    new amount:', ps[0]['amount'] if ps else 'none')"
done

step "Verify via store API"
PK="${VITE_MEDUSA_PUBLISHABLE_KEY:?missing publishable key}"
RID="${VITE_DEFAULT_REGION_ID:?missing region id}"
curl -fsS -H "x-publishable-api-key: $PK" \
    "${PUBLIC_URL}/store/products?fields=handle,*variants.calculated_price&region_id=${RID}&limit=10" \
  | python3 -c "
import sys, json
for p in json.load(sys.stdin)['products']:
    v = p['variants'][0] if p.get('variants') else {}
    cp = (v.get('calculated_price') or {}).get('calculated_amount')
    print(f'  {p[\"handle\"]:<32} \${cp}')
"
