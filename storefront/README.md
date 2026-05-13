# HueWhimsy Storefront (Next.js 15)

This directory holds the Next.js 15 storefront. Initialize once:

```bash
cd storefront
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Required for the production Dockerfile:

- `output: 'standalone'` in `next.config.ts` / `next.config.mjs`
- A `/` route that responds 200 OK for the healthcheck
- Env vars exposed via `NEXT_PUBLIC_*` for the Medusa backend URL

Example `next.config.ts` snippet:

```ts
const nextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'srv1667251.hstgr.cloud' },
    ],
  },
};
export default nextConfig;
```

Or wire the official Medusa Next.js starter:

```bash
git clone https://github.com/medusajs/nextjs-starter-medusa.git tmp
mv tmp/* tmp/.* . 2>/dev/null || true
rm -rf tmp
```
