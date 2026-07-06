# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.15.0 --ignore-scripts

# Copy monorepo manifests (better layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy internal workspace packages
COPY packages/ ./packages/

# Copy the web app
COPY apps/web/ ./apps/web/

# Copy agent source — needed because apps/web/src/lib/db.ts imports
# the Drizzle schema via relative path: '../../../agent/src/db/schema'
# Also copy package.json so pnpm workspace does not fail scanning apps/*
# TODO: move schema to @repo/shared to remove this cross-app dependency
COPY apps/agent/package.json ./apps/agent/package.json
COPY apps/agent/src/ ./apps/agent/src/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Build shared packages first, then web
RUN pnpm build --filter=@repo/shared --filter=@repo/logger
RUN pnpm build --filter=web

# ── Stage 2: Runner ───────────────────────────────────────────────────────────
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy the standalone Next.js server bundle (includes its own node_modules)
COPY --from=builder /app/apps/web/.next/standalone ./
# Copy static assets (CSS, JS chunks, images)
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
# Copy public folder (favicon, robots.txt, etc.)
COPY --from=builder /app/apps/web/public ./apps/web/public

WORKDIR /app/apps/web

# Railway injects PORT automatically
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
EXPOSE 3000

# Use the standalone server entry point directly (no pnpm needed)
CMD ["node", "server.js"]
