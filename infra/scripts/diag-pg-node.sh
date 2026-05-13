#!/usr/bin/env bash
set -euo pipefail
cd /opt/huewhimsy

set -a
. ./.env.production
set +a

cat > /tmp/pg-test.js <<'JS'
const { Client } = require('pg');
const c = new Client({
  host: 'postgres',
  port: 5432,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  connectionTimeoutMillis: 5000,
});
const start = Date.now();
c.connect()
  .then(() => c.query('SELECT version(), now()'))
  .then(r => {
    console.log('OK in', Date.now() - start, 'ms:', JSON.stringify(r.rows[0]));
    return c.end();
  })
  .catch(e => {
    console.log('FAIL in', Date.now() - start, 'ms:', e.message);
    process.exit(1);
  });
JS

echo '=== Run pg test inside backend image, huewhimsy_net ==='
docker run --rm --network huewhimsy_net \
    -v /tmp/pg-test.js:/app/pg-test.js:ro \
    -e POSTGRES_USER="$POSTGRES_USER" \
    -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
    -e POSTGRES_DB="$POSTGRES_DB" \
    -w /app \
    huewhimsy/backend:latest \
    node ./pg-test.js
echo

echo '=== Check resolv.conf, nslookup, nc port 5432 from backend image ==='
docker run --rm --network huewhimsy_net huewhimsy/backend:latest sh -c '
cat /etc/resolv.conf | head -3
echo "---"
getent hosts postgres
echo "---"
nc -zv postgres 5432 2>&1 || echo "nc not present"
'
