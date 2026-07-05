FROM langchain/langgraphjs-api:20

# ── Monorepo setup ──────────────────────────────────────────────────────────
# Railway build context = monorepo root.
# We copy the entire monorepo so pnpm can resolve workspace:* packages
# (@repo/shared, @repo/logger) that the agent depends on.

# Copy monorepo manifests first (for better layer caching)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml /deps/langchain-training/

# Copy internal workspace packages
COPY packages/ /deps/langchain-training/packages/

# Copy the agent app
COPY apps/agent/ /deps/langchain-training/apps/agent/

# Install pnpm and all workspace dependencies
RUN npm install -g pnpm@9.15.0 --ignore-scripts
WORKDIR /deps/langchain-training
RUN pnpm install --frozen-lockfile

# ── LangGraph server config ─────────────────────────────────────────────────
ENV LANGSERVE_GRAPHS='{"agent":"./apps/agent/src/agent.ts:graph"}'

WORKDIR /deps/langchain-training/apps/agent
RUN (test ! -f /api/langgraph_api/js/build.mts && echo "Prebuild script not found, skipping") || tsx /api/langgraph_api/js/build.mts