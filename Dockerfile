# syntax=docker/dockerfile:1
# Multi-stage Dockerfile for ArchFlow (Web + API + Nginx in one PSM-ready container)

FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@11.17.0

WORKDIR /app

# Copy workspace manifests & Prisma schema first for layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY apps/api/prisma ./apps/api/prisma

RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm config set store-dir /pnpm/store && \
    pnpm config set trust-lockfile true && \
    pnpm config set prefer-offline true && \
    pnpm config set network-concurrency 4 && \
    pnpm config set fetch-timeout 120000 && \
    pnpm config set fetch-retries 5 && \
    pnpm config set fetch-retry-mintimeout 10000 && \
    pnpm config set fetch-retry-maxtimeout 60000 && \
    (pnpm install --frozen-lockfile || (echo "[ArchFlow] Lockfile mismatch detected, retrying with --no-frozen-lockfile..." && pnpm install --no-frozen-lockfile))

# Copy full app sources
COPY apps/api ./apps/api
COPY apps/web ./apps/web

# Generate Prisma client, build NestJS API, and compile idempotent seed script
RUN pnpm --dir apps/api exec prisma generate && \
    pnpm --dir apps/api run build && \
    pnpm --dir apps/api exec tsc prisma/seed.ts --outDir dist/prisma --module commonjs --target es2022 --esModuleInterop --skipLibCheck

# Build Next.js standalone bundle configured for same-origin /api proxy
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=/api
RUN pnpm --dir apps/web run build

# Create isolated production bundle for API from shared lockfile (uses pnpm store offline; avoids --legacy workspace re-resolution)
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    (pnpm --filter @archflow/api --config.inject-workspace-packages=true --config.offline=true --config.trust-lockfile=true deploy --prod /prod/api || \
     pnpm --filter @archflow/api --config.inject-workspace-packages=true --config.prefer-offline=true --config.trust-lockfile=true deploy --prod /prod/api) && \
    cd /prod/api && \
    ./node_modules/.bin/prisma generate --schema=/app/apps/api/prisma/schema.prisma

# ------------------------------------------------------------------------------
# Production Runner
# ------------------------------------------------------------------------------
FROM node:22-alpine AS runner
RUN apk add --no-cache nginx openssl libc6-compat wget

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV API_PORT=4000
ENV WEB_PORT=3001
ENV UPLOAD_DIR=/app/apps/api/uploads

# Copy NestJS production bundle + compiled dist + prisma schema
COPY --from=builder /prod/api /app/apps/api
COPY --from=builder /app/apps/api/dist /app/apps/api/dist
COPY --from=builder /app/apps/api/prisma /app/apps/api/prisma

# Copy Next.js standalone output into isolated directory
COPY --from=builder /app/apps/web/.next/standalone /app/web-standalone
COPY --from=builder /app/apps/web/.next/static /app/web-standalone/apps/web/.next/static
COPY --from=builder /app/apps/web/public /app/web-standalone/apps/web/public

# Copy Nginx & entrypoint scripts
COPY docker/nginx.conf.template /app/docker/nginx.conf.template
COPY docker/entrypoint.sh /app/docker/entrypoint.sh

RUN sed -i 's/\r$//' /app/docker/entrypoint.sh /app/docker/nginx.conf.template && \
    chmod +x /app/docker/entrypoint.sh && \
    mkdir -p /run/nginx /etc/nginx/http.d /app/apps/api/uploads && \
    sed -i 's/worker_processes\s\+auto;/worker_processes 1;/g' /etc/nginx/nginx.conf

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider "http://127.0.0.1:${PORT:-3000}/api/health" || exit 1

ENTRYPOINT ["/app/docker/entrypoint.sh"]
