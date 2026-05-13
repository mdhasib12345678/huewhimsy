# HueWhimsy Backend (Medusa v2)

This directory holds the Medusa v2 backend. When deploying for the first time, initialize the app here:

```bash
cd backend
npx create-medusa-app@latest . --skip-db
```

Or clone the Medusa starter and remove its `.git`:

```bash
cd backend
npx create-medusa-app@latest tmp-medusa --skip-db --no-browser --with-nextjs-starter=false
mv tmp-medusa/* tmp-medusa/.* . 2>/dev/null || true
rmdir tmp-medusa
```

The provided `Dockerfile` expects:

- a standard Medusa v2 project at the repo root
- a `build` script that produces `.medusa/server/`
- standard `package.json` deps

Migrations run automatically on container start (`npx medusa db:migrate`).
