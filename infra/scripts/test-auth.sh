#!/usr/bin/env bash
# Smoke test the customer auth flow.
set -euo pipefail
cd /opt/huewhimsy
set -a; . ./.env.production; set +a

URL="${MEDUSA_BACKEND_URL:-https://huewhimsy.com}"
PK="$VITE_MEDUSA_PUBLISHABLE_KEY"
H_PK=(-H "x-publishable-api-key: $PK")
H_JSON=(-H "Content-Type: application/json")

step() { printf '\n\033[1;36m>> %s\033[0m\n' "$*"; }

EMAIL="demo+$(date +%s)@huewhimsy.test"
PASS="DemoPass$(date +%s)!"

step "Register pre-auth token ($EMAIL)"
PRE_TOKEN=$(curl -fsS "${H_PK[@]}" "${H_JSON[@]}" -X POST "$URL/auth/customer/emailpass/register" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
echo "  token length: ${#PRE_TOKEN}"

step "Create customer profile"
CUSTOMER=$(curl -fsS "${H_PK[@]}" "${H_JSON[@]}" \
    -H "Authorization: Bearer $PRE_TOKEN" \
    -X POST "$URL/store/customers" \
    -d "{\"email\":\"$EMAIL\",\"first_name\":\"Demo\",\"last_name\":\"Tester\"}")
echo "$CUSTOMER" | python3 -c "
import sys, json
c = json.load(sys.stdin)['customer']
print(f\"  customer.id: {c['id']}\")
print(f\"  email:       {c['email']}\")
print(f\"  name:        {c.get('first_name','')} {c.get('last_name','')}\")
"

step "Login (separate)"
TOKEN=$(curl -fsS "${H_PK[@]}" "${H_JSON[@]}" -X POST "$URL/auth/customer/emailpass" \
    -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
echo "  login token length: ${#TOKEN}"

step "Get current customer (/store/customers/me)"
curl -fsS "${H_PK[@]}" -H "Authorization: Bearer $TOKEN" "$URL/store/customers/me" \
    | python3 -c "
import sys, json
c = json.load(sys.stdin)['customer']
print(f\"  id={c['id']}  email={c['email']}\")
print(f\"  has_account={c.get('has_account')}\")
"

step "List customer orders (should be empty)"
curl -fsS "${H_PK[@]}" -H "Authorization: Bearer $TOKEN" "$URL/store/orders?limit=10" \
    | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f\"  count={d.get('count', len(d.get('orders', [])))}\")
"

step "Auth flow PASSED"
