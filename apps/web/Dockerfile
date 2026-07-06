# ── Stage 1: Builder ──────────────────────────────────────────────────────────
FROM node:22-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@9.15.0 --ignore-scripts

# ── NEXT_PUBLIC_* build-time args ─────────────────────────────────────────────
# NEXT_PUBLIC_ variables are baked into the JS bundle at `next build` time.
# They MUST be available as environment variables during the build step.
# Railway passes these as Build Arguments (set in service Settings → Variables).
ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ARG NEXT_PUBLIC_FIREBASE_PROJECT_ID
ARG NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ARG NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG NEXT_PUBLIC_FIREBASE_APP_ID
ARG NEXT_PUBLIC_COPILOTKIT_AGENT_ID

# Expose ARGs as ENV so Next.js build picks them up via process.env
ENV NEXT_PUBLIC_FIREBASE_API_KEY=$NEXT_PUBLIC_FIREBASE_API_KEY
ENV NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
ENV NEXT_PUBLIC_FIREBASE_PROJECT_ID=$NEXT_PUBLIC_FIREBASE_PROJECT_ID
ENV NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
ENV NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV NEXT_PUBLIC_FIREBASE_APP_ID=$NEXT_PUBLIC_FIREBASE_APP_ID
ENV NEXT_PUBLIC_COPILOTKIT_AGENT_ID=$NEXT_PUBLIC_COPILOTKIT_AGENT_ID

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

# Install pnpm for running the app
RUN npm install -g pnpm@9.15.0 --ignore-scripts

# Copy monorepo structure needed at runtime
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/packages/ ./packages/

# Copy built Next.js app
COPY --from=builder /app/apps/web/package.json ./apps/web/
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=builder /app/node_modules ./node_modules

WORKDIR /app/apps/web

# Railway injects PORT automatically
ENV PORT=3000
EXPOSE 3000

CMD ["pnpm", "start"]
