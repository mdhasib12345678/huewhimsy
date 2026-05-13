#!/usr/bin/env bash
# Seed Medusa with a sales channel, region, publishable key, and a few demo products.
# Idempotent — safe to re-run.
set -euo pipefail
cd /opt/huewhimsy

set -a; . ./.env.production; set +a

step() { printf '\n\033[1;36m>> %s\033[0m\n' "$*"; }

ADMIN_EMAIL="${ADMIN_EMAIL:-hasib107040@gmail.com}"
ADMIN_PASSWORD="${1:-Hue-2024@2341}"
PUBLIC_URL="${MEDUSA_BACKEND_URL:-https://srv1667251.hstgr.cloud}"

step "Get admin JWT (login as $ADMIN_EMAIL)"
TOKEN=$(curl -fsS -X POST "${PUBLIC_URL}/auth/user/emailpass" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
[ -n "$TOKEN" ] || { echo "Failed to get admin token" >&2; exit 1; }
echo "  Token OK (length ${#TOKEN})"

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

step "Ensure sales channel 'huewhimsy'"
SC_LIST=$(api GET "/admin/sales-channels")
SC_ID=$(echo "$SC_LIST" | python3 -c "import sys,json; d=json.load(sys.stdin); m=[s for s in d.get('sales_channels',[]) if s['name']=='huewhimsy']; print(m[0]['id'] if m else '')")
if [ -z "$SC_ID" ]; then
    SC=$(api POST "/admin/sales-channels" '{"name":"huewhimsy","description":"Default storefront"}')
    SC_ID=$(echo "$SC" | python3 -c "import sys,json; print(json.load(sys.stdin)['sales_channel']['id'])")
    echo "  Created sales_channel: $SC_ID"
else
    echo "  Existing sales_channel: $SC_ID"
fi

step "Ensure publishable API key 'huewhimsy-storefront'"
PK_LIST=$(api GET "/admin/api-keys?type=publishable")
PK_TOKEN=$(echo "$PK_LIST" | python3 -c "import sys,json; d=json.load(sys.stdin); m=[k for k in d.get('api_keys',[]) if k.get('title')=='huewhimsy-storefront']; print(m[0]['token'] if m else '')")
PK_ID=$(echo "$PK_LIST" | python3 -c "import sys,json; d=json.load(sys.stdin); m=[k for k in d.get('api_keys',[]) if k.get('title')=='huewhimsy-storefront']; print(m[0]['id'] if m else '')")
if [ -z "$PK_TOKEN" ]; then
    PK=$(api POST "/admin/api-keys" '{"title":"huewhimsy-storefront","type":"publishable"}')
    PK_TOKEN=$(echo "$PK" | python3 -c "import sys,json; print(json.load(sys.stdin)['api_key']['token'])")
    PK_ID=$(echo "$PK" | python3 -c "import sys,json; print(json.load(sys.stdin)['api_key']['id'])")
    echo "  Created publishable key: $PK_TOKEN"
else
    echo "  Existing publishable key: $PK_TOKEN"
fi

step "Link publishable key -> sales_channel"
api POST "/admin/api-keys/${PK_ID}/sales-channels" "{\"add\":[\"${SC_ID}\"]}" >/dev/null
echo "  Linked"

step "Ensure region 'United States'"
RG_LIST=$(api GET "/admin/regions")
RG_ID=$(echo "$RG_LIST" | python3 -c "import sys,json; d=json.load(sys.stdin); m=[r for r in d.get('regions',[]) if r['name']=='United States']; print(m[0]['id'] if m else '')")
if [ -z "$RG_ID" ]; then
    RG=$(api POST "/admin/regions" '{"name":"United States","currency_code":"usd","countries":["us"]}')
    RG_ID=$(echo "$RG" | python3 -c "import sys,json; print(json.load(sys.stdin)['region']['id'])")
    echo "  Created region: $RG_ID"
else
    echo "  Existing region: $RG_ID"
fi

step "Seed 4 demo products"
seed_product() {
    local title=$1 handle=$2 desc=$3 price_cents=$4 thumb=$5
    local exists
    exists=$(api GET "/admin/products?handle=${handle}" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('products',[])))")
    if [ "$exists" != "0" ]; then
        echo "  - $title: already exists"
        return
    fi
    api POST "/admin/products" "$(cat <<JSON
{
  "title": "${title}",
  "handle": "${handle}",
  "description": "${desc}",
  "status": "published",
  "thumbnail": "${thumb}",
  "sales_channels": [{"id": "${SC_ID}"}],
  "options": [{"title": "Format", "values": ["Hardcover"]}],
  "variants": [
    {
      "title": "Hardcover",
      "manage_inventory": false,
      "prices": [{"amount": ${price_cents}, "currency_code": "usd"}],
      "options": {"Format": "Hardcover"}
    }
  ]
}
JSON
    )" >/dev/null
    echo "  + $title (\$$(echo "scale=2; $price_cents/100" | bc))"
}

seed_product "A is for Alligator"       "a-is-for-alligator"       "A whimsical alphabet adventure with friendly creatures." 1499 "https://placehold.co/600x600/ff9ec7/ffffff?text=A+is+for+Alligator"
seed_product "Dinosaur Dance Party"     "dinosaur-dance-party"     "Join the dancing dinos for a prehistoric jubilee." 1799 "https://placehold.co/600x600/06d6a0/ffffff?text=Dinosaur+Dance"
seed_product "Whiskers and Wonders"     "whiskers-and-wonders"     "Twelve curious cats explore twelve curious worlds." 1599 "https://placehold.co/600x600/ffd166/000000?text=Whiskers"
seed_product "Around the World in 26 Pages" "around-the-world-26"  "A landmark journey for tiny travelers, A to Z." 1899 "https://placehold.co/600x600/118ab2/ffffff?text=Around+the+World"

step "Summary"
PRODUCTS=$(api GET "/admin/products" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('products',[])))")
echo "  Products in DB: $PRODUCTS"
echo "  Publishable API key (use in frontend): $PK_TOKEN"
echo
echo "Save this key for the storefront integration."
