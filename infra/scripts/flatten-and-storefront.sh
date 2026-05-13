#!/usr/bin/env bash
# Flatten the create-medusa-app Turborepo into a plain Medusa backend,
# then clone the Medusa Next.js storefront.
set -euo pipefail

readonly REPO_DIR="${REPO_DIR:-/opt/huewhimsy}"
cd "$REPO_DIR"

step() { printf '\n\033[1;36m>> %s\033[0m\n' "$*"; }

# --- Flatten backend ---
if [ -d "backend/apps/backend" ] && [ ! -f "backend/medusa-config.ts" ]; then
    step "Flatten backend (monorepo -> plain Medusa)"
    cd backend

    # Preserve our infra-owned files
    cp Dockerfile        /tmp/HW.Dockerfile
    cp .dockerignore     /tmp/HW.dockerignore
    cp README.md         /tmp/HW.README

    # Move the actual Medusa app up one level
    shopt -s dotglob nullglob
    mv apps/backend/* .
    shopt -u dotglob nullglob

    # Remove monorepo wrappers (workspace deps will be reinstalled)
    rm -rf apps node_modules package-lock.json turbo.json
    rm -f LICENSE .npmrc

    # Restore our infra files
    mv /tmp/HW.Dockerfile     Dockerfile
    mv /tmp/HW.dockerignore   .dockerignore
    mv /tmp/HW.README         README.md

    # Remove Medusa's generated .env (we use repo-root .env.production)
    rm -f .env

    step "Install Medusa deps for flat backend"
    npm install --no-audit --no-fund --progress=false

    cd "$REPO_DIR"
    echo "  Flat backend ready"
else
    step "backend already flat or not scaffolded"
fi

# --- Clone Next.js storefront ---
if [ ! -f "storefront/package.json" ]; then
    step "Clone Medusa Next.js starter"
    rm -rf /tmp/nextjs-scaffold
    git clone --depth=1 https://github.com/medusajs/nextjs-starter-medusa.git /tmp/nextjs-scaffold

    # Preserve infra files
    cp storefront/Dockerfile     /tmp/HW.Dockerfile.sf
    cp storefront/.dockerignore  /tmp/HW.dockerignore.sf
    cp storefront/README.md      /tmp/HW.README.sf
    rm -rf storefront
    mv /tmp/nextjs-scaffold storefront
    rm -rf storefront/.git
    mv /tmp/HW.Dockerfile.sf      storefront/Dockerfile
    mv /tmp/HW.dockerignore.sf    storefront/.dockerignore
    mv /tmp/HW.README.sf          storefront/README.md
    # Remove any sample .env files
    rm -f storefront/.env.local storefront/.env.template
else
    step "storefront already initialized"
fi

# --- Patch Next.js for standalone output ---
step "Patch Next.js for output: standalone"
cd "$REPO_DIR/storefront"
CFG="$(ls next.config.* 2>/dev/null | head -1 || true)"
if [ -n "$CFG" ] && grep -qE "output\s*:\s*['\"]standalone['\"]" "$CFG"; then
    echo "  already configured: $CFG"
elif [ -n "$CFG" ]; then
    echo "  patching $CFG"
    python3 - <<PY
import re, pathlib
p = pathlib.Path("$CFG")
src = p.read_text()
if "standalone" in src:
    raise SystemExit("already has standalone")
# Insert output line after first '{'
new = re.sub(r"(\bnextConfig\s*[:=]\s*\{)", r"\1\n  output: 'standalone',", src, count=1)
if new == src:
    new = re.sub(r"(\{)", r"\1\n  output: 'standalone',", src, count=1)
p.write_text(new)
print("patched", p)
PY
else
    cat > next.config.js <<'EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: 'http',  hostname: 'localhost' },
      { protocol: 'http',  hostname: 'srv1667251.hstgr.cloud' },
      { protocol: 'https', hostname: 'srv1667251.hstgr.cloud' },
    ],
  },
};
module.exports = nextConfig;
EOF
fi

cd "$REPO_DIR"
step "Done"
echo "backend/    $(jq -r '.name + \" v\" + .version' backend/package.json)"
echo "storefront/ $(jq -r '.name + \" v\" + .version' storefront/package.json)"
echo
echo "=== backend/ ==="
ls -1 backend | head -20
echo
echo "=== storefront/ ==="
ls -1 storefront | head -20
