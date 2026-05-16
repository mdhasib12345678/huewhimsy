# syntax=docker/dockerfile:1.7
ARG NODE_VERSION=20

# ===== deps =====
FROM node:${NODE_VERSION}-alpine AS deps
RUN apk add --no-cache libc6-compat python3 make g++ git
WORKDIR /app
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm install --no-audit --no-fund --legacy-peer-deps; \
  fi

# ===== build =====
FROM node:${NODE_VERSION}-alpine AS build
RUN apk add --no-cache libc6-compat python3 make g++
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN \
  if [ -f pnpm-lock.yaml ]; then corepack enable && pnpm run build; \
  elif [ -f yarn.lock ]; then yarn build; \
  else npm run build; \
  fi

# ===== runtime =====
FROM node:${NODE_VERSION}-alpine AS runtime
RUN apk add --no-cache tini wget curl
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=9000
ENV HOST=0.0.0.0

RUN addgroup -S medusa -g 1001 && adduser -S medusa -u 1001 -G medusa

# Medusa v2 builds to .medusa/server
COPY --from=build --chown=medusa:medusa /app/.medusa/server ./
RUN if [ -f pnpm-lock.yaml ]; then corepack enable && pnpm install --prod --frozen-lockfile; \
    elif [ -f yarn.lock ]; then yarn install --production --frozen-lockfile; \
    else npm install --no-audit --no-fund --omit=dev --legacy-peer-deps; \
    fi && \
    npm cache clean --force && \
    chown -R medusa:medusa /app

USER medusa
EXPOSE 9000
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1:9000/health || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "npx medusa db:migrate && npx medusa start"]
