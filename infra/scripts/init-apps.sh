#!/usr/bin/env bash
# Initialize Medusa v2 backend + Next.js storefront on the VPS (v2 — correct flags).
set -euo pipefail

readonly REPO_DIR="${REPO_DIR:-/opt/huewhimsy}"
cd "$REPO_DIR"

step() { printf '\n\033[1;36m>> %s\033[0m\n' "$*"; }

# Node 20 should already be installed by the previous run
if ! command -v node >/dev/null 2>&1; then
    step "Install Node.js 20"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
fi
echo "node: $(node -v)  npm: $(npm -v)"

# ---- Medusa v2 backend ----
if [ ! -f "backend/package.json" ]; then
    step "Scaffold Medusa v2 backend"
    rm -rf /tmp/medusa-scaffold
    cd /tmp
    # Auto-answer "n" to the "install Next.js starter?" prompt (we clone our own)
    yes n | npx --yes create-medusa-app@latest medusa-scaffold \
        --skip-db \
        --no-migrations \
        --no-browser \
        --use-npm || true
    if [ ! -d /tmp/medusa-scaffold ] || [ ! -f /tmp/medusa-scaffold/package.json ]; then
        echo "ERROR: create-medusa-app failed" >&2
        exit 1
    fi
    cd "$REPO_DIR"
    # Preserve our infra-owned files before replacing
    cp backend/Dockerfile        /tmp/HW_Dockerfile.backend
    cp backend/.dockerignore     /tmp/HW_dockerignore.backend
    cp backend/README.md         /tmp/HW_README.backend
    rm -rf backend
    mv /tmp/medusa-scaffold backend
    mv /tmp/HW_Dockerfile.backend    backend/Dockerfile
    mv /tmp/HW_dockerignore.backend  backend/.dockerignore
    mv /tmp/HW_README.backend        backend/README.md
    echo "  backend ready: $(jq -r '.name + \"@\" + .version' backend/package.json)"
else
    step "backend/package.json already exists — skipping scaffold"
fi

# ---- Next.js Medusa starter ----
if [ ! -f "storefront/package.json" ]; then
    step "Clone Medusa Next.js starter"
    rm -rf /tmp/nextjs-scaffold
    git clone --depth=1 https://github.com/medusajs/nextjs-starter-medusa.git /tmp/nextjs-scaffold
    cd "$REPO_DIR"
    cp storefront/Dockerfile     /tmp/HW_Dockerfile.storefront
    cp storefront/.dockerignore  /tmp/HW_dockerignore.storefront
    cp storefront/README.md      /tmp/HW_README.storefront
    rm -rf storefront
    mv /tmp/nextjs-scaffold storefront
    rm -rf storefront/.git
    mv /tmp/HW_Dockerfile.storefront    storefront/Dockerfile
    mv /tmp/HW_dockerignore.storefront  storefront/.dockerignore
    mv /tmp/HW_README.storefront        storefront/README.md
    echo "  storefront ready: $(jq -r '.name + \"@\" + .version' storefront/package.json)"
else
    step "storefront/package.json already exists — skipping clone"
fi

# ---- Patch Next.js for standalone output ----
step "Ensure Next.js output: standalone"
cd "$REPO_DIR/storefront"
CFG="$(ls next.config.* 2>/dev/null | head -1 || true)"
if [ -n "$CFG" ] && grep -q "output" "$CFG" && grep -q "standalone" "$CFG"; then
    echo "  already configured: $CFG"
elif [ -n "$CFG" ]; then
    echo "  patching $CFG"
    # Naive but works for the official starter — insert output line at first '{'
    python3 - <<PY
import re, pathlib
p = pathlib.Path("$CFG")
src = p.read_text()
if "output:" in src:
    raise SystemExit("output already present")
new = re.sub(r"(\bnextConfig\s*[:=]\s*\{)", r"\1\n  output: 'standalone',", src, count=1)
if new == src:
    raise SystemExit("could not patch nextConfig in " + str(p))
p.write_text(new)
print("patched", p)
PY
else
    echo "  creating next.config.js"
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
echo
echo "backend/    $(jq -r '.name + \" v\" + .version' backend/package.json)"
echo "storefront/ $(jq -r '.name + \" v\" + .version' storefront/package.json)"
ls -1 backend | head -20
echo '---'
ls -1 storefront | head -20
