#!/usr/bin/env bash
set -e
JS=$(docker exec huewhimsy-storefront sh -c 'ls /usr/share/nginx/html/assets/*.js' | head -1)
echo "Bundle: $JS"
echo
echo "== Publishable key =="
docker exec huewhimsy-storefront grep -oE 'pk_627[a-z0-9]+' "$JS" | head -1
echo
echo "== Region id =="
docker exec huewhimsy-storefront grep -oE 'reg_01KRG[A-Z0-9]+' "$JS" | head -1
echo
echo "== Backend host =="
docker exec huewhimsy-storefront grep -oE 'srv1667251\.hstgr\.cloud' "$JS" | head -1
echo
echo "== API path =="
docker exec huewhimsy-storefront grep -oE '/store/products' "$JS" | head -1
