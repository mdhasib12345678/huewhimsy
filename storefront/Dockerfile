# syntax=docker/dockerfile:1.7
# HueWhimsy storefront — Vite 6 + React 19 SPA, served by a small nginx.
ARG NODE_VERSION=20

# ===== build =====
FROM node:${NODE_VERSION}-alpine AS build
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund --progress=false
COPY . .
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=1024"
RUN npm run build

# ===== runtime (nginx serving static dist) =====
FROM nginx:1.27-alpine AS runtime
RUN apk add --no-cache tini wget
RUN rm -f /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# Self-contained nginx config for the SPA
RUN cat > /etc/nginx/conf.d/spa.conf <<'EOF'
server {
    listen 3000;
    listen [::]:3000;
    server_name _;
    server_tokens off;

    root /usr/share/nginx/html;
    index index.html;

    # Health check
    location = /health {
        access_log off;
        return 200 "ok\n";
        add_header Content-Type text/plain;
    }

    # Long cache for hashed assets
    location /assets/ {
        access_log off;
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Other static files (favicon, robots, etc.)
    location ~* \.(?:ico|css|js|gif|jpe?g|png|webp|avif|svg|woff2?|ttf|eot|otf)$ {
        access_log off;
        expires 30d;
        add_header Cache-Control "public";
        try_files $uri =404;
    }

    # SPA fallback — every other path returns index.html
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache" always;
    }

    # Gzip is enabled by parent nginx upstream — keep it off here to avoid double compression
    gzip off;
}
EOF

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:3000/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["nginx", "-g", "daemon off;"]
