#!/usr/bin/env bash
# Smoke test the public cart API.
set -euo pipefail
cd /opt/huewhimsy
set -a; . ./.env.production; set +a

URL="${MEDUSA_BACKEND_URL:-https://huewhimsy.com}"
PK="$VITE_MEDUSA_PUBLISHABLE_KEY"
REGION="$VITE_DEFAULT_REGION_ID"

H_PK=(-H "x-publishable-api-key: $PK")
H_JSON=(-H "Content-Type: application/json")

step() { printf '\n\033[1;36m>> %s\033[0m\n' "$*"; }

step "Get a variant id from /store/products"
VARIANT=$(curl -fsS "${H_PK[@]}" "$URL/store/products?region_id=$REGION&limit=1&fields=*variants" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['products'][0]['variants'][0]['id'])")
echo "  variant_id: $VARIANT"

step "Create a cart"
CART_ID=$(curl -fsS "${H_PK[@]}" "${H_JSON[@]}" -X POST "$URL/store/carts" \
    -d "{\"region_id\":\"$REGION\"}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['cart']['id'])")
echo "  cart_id: $CART_ID"

step "Add a line item (qty=2)"
RESP=$(curl -fsS "${H_PK[@]}" "${H_JSON[@]}" -X POST "$URL/store/carts/$CART_ID/line-items" \
    -d "{\"variant_id\":\"$VARIANT\",\"quantity\":2}")
LINE_ID=$(echo "$RESP" | python3 -c "import sys,json; print(json.load(sys.stdin)['cart']['items'][0]['id'])")
echo "$RESP" | python3 -c "
import sys, json
c = json.load(sys.stdin)['cart']
for i in c.get('items', []):
    print(f'    {i[\"product_title\"]:<30} qty={i[\"quantity\"]} unit=\${i[\"unit_price\"]}')
print(f'    subtotal=\${c.get(\"subtotal\")}')
"

step "Update line item quantity to 5"
curl -fsS "${H_PK[@]}" "${H_JSON[@]}" -X POST "$URL/store/carts/$CART_ID/line-items/$LINE_ID" \
    -d "{\"quantity\":5}" \
    | python3 -c "
import sys, json
c = json.load(sys.stdin)['cart']
for i in c.get('items', []):
    print(f'    {i[\"product_title\"]:<30} qty={i[\"quantity\"]} unit=\${i[\"unit_price\"]}')
print(f'    subtotal=\${c.get(\"subtotal\")}')
"

step "Remove the line item"
curl -fsS "${H_PK[@]}" -X DELETE "$URL/store/carts/$CART_ID/line-items/$LINE_ID" \
    | python3 -c "
import sys, json
c = json.load(sys.stdin)['cart']
print(f'    items={len(c.get(\"items\", []))}  subtotal=\${c.get(\"subtotal\")}')
"

step "Get final cart"
curl -fsS "${H_PK[@]}" "$URL/store/carts/$CART_ID" \
    | python3 -c "
import sys, json
c = json.load(sys.stdin)['cart']
print(f'    cart_id={c[\"id\"]}  region={c.get(\"region_id\")}  items={len(c.get(\"items\", []))}')
"

step "Done — cart API fully functional"
