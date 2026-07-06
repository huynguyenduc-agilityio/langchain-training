FROM node:22-slim

# ── Monorepo setup ──────────────────────────────────────────────────────────
# Avoids using langchain/langgraphjs-api base image which locks
# @langchain/langgraph-checkpoint to ~1.0.0, conflicting with our ^1.1.3.
# Instead, run the LangGraph CLI directly on a plain Node image.

RUN npm install -g pnpm@9.15.0 --ignore-scripts

WORKDIR /app

# Copy monorepo manifests first (better layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy internal workspace packages
COPY packages/ ./packages/

# Copy the agent app
COPY apps/agent/ ./apps/agent/

# Install all workspace dependencies
RUN pnpm install --frozen-lockfile

# Build shared packages (@repo/shared, @repo/logger) so the agent can import them
RUN pnpm build --filter=@repo/shared --filter=@repo/logger

WORKDIR /app/apps/agent

# Railway injects PORT env var. We use shell form (not exec form) so that
# $PORT is expanded by /bin/sh before being passed to langgraph-cli.
# Default to 8123 if PORT is not set (local testing).
EXPOSE 8123
CMD ["/bin/sh", "-c", "npx -y @langchain/langgraph-cli@1.4.0 dev --port ${PORT:-8123} --no-browser --host 0.0.0.0"]