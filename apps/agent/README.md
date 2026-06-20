# 🤖 Agent

> The LangGraph AI agent server for the City Ride Booking chatbot. Implements a multi-agent architecture with supervisor pattern, specialized subgraphs (Ride, Management, Info), human-in-the-loop interrupt workflows, input guardrails, and real-time streaming via CopilotKit and AG-UI protocol.

[![LangGraph](https://img.shields.io/badge/LangGraph-1.3.x-1C3C3C?logo=langchain&logoColor=white)](https://langchain-ai.github.io/langgraphjs/)
[![LangChainJS](https://img.shields.io/badge/LangChain-1.1.x-1C3C3C?logo=langchain&logoColor=white)](https://js.langchain.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-1.4.x-412991?logo=openai&logoColor=white)](https://platform.openai.com/)
[![CopilotKit SDK](https://img.shields.io/badge/CopilotKit_SDK-1.59.x-6366f1?logo=openai&logoColor=white)](https://docs.copilotkit.ai/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Technical Stacks](#-technical-stacks)
- [Development Tools](#-development-tools)
- [Environment](#-environment)
- [How to Run](#-how-to-run)
- [Project Structure](#-project-structure)

---

## 🔍 Overview

Responsibilities:

- Run the LangGraph agent graph as a server via `@langchain/langgraph-cli`
- Implement supervisor pattern with central routing to specialized sub-agents
- **Ride Agent** — handles ride estimation (ORS geocoding + routing) and ride request with driver matching
- **Management Agent** — handles trip cancellation with fee calculation
- **Info Agent** — handles trip history lookup and FAQ responses
- Enforce input guardrails as a dedicated graph node (operating hours 05:00–23:00, max 3 active trips, max 50km distance, phone format validation)
- Classify user intent via structured output before routing to sub-agents
- Execute human-in-the-loop workflows using LangGraph `interrupt()` + `Command` pattern for ride confirmations and cancellations
- Persist conversation state via `MemorySaver` checkpointer
- Stream responses to the frontend via CopilotKit SDK and AG-UI protocol
- Manage trip and driver data in PostgreSQL via Drizzle ORM

**Depends on:** PostgreSQL database, OpenAI API key, and OpenRouteService (ORS) API key.

---

## 🏗 Architecture

### Graph Flow

```
START
  │
  ▼
input_validation ──(fail)──► error_response ──► END
  │
  (pass)
  │
  ▼
classify_intent
  │
  ▼
supervisor ◄─────────────────────────┐
  │                                   │
  ├──► ride_agent (subgraph) ────────┤
  ├──► management_agent (subgraph) ──┤
  ├──► info_agent (subgraph) ────────┘
  ├──► error_response ──► END
  └──► END
```

### Key Concepts

| Concept                  | Implementation                                                                |
| ------------------------ | ----------------------------------------------------------------------------- |
| **Multi-Agent**          | Supervisor pattern with 3 specialized subgraphs                               |
| **Subgraphs**            | `rideSubgraph`, `managementSubgraph`, `infoSubgraph` as composable units      |
| **Human-in-the-Loop**    | `interrupt()` pauses graph at ride confirmation and cancellation steps         |
| **Guardrails**           | `inputValidation` node validates before LLM invocation                        |
| **Intent Classification**| Structured output with Zod schema for routing decisions                       |
| **Checkpointer**         | `MemorySaver` for conversation state persistence                              |
| **Conditional Edges**    | Dynamic routing from supervisor and validation nodes                          |
| **Streaming**            | CopilotKit SDK + AG-UI encoder for real-time response streaming               |

---

## 🛠 Technical Stacks

| Technology                                                        | Version  | Purpose                                           |
| ----------------------------------------------------------------- | -------- | ------------------------------------------------- |
| [LangGraph](https://langchain-ai.github.io/langgraphjs/)         | `1.3.x`  | Stateful graph orchestration (StateGraph, nodes, edges) |
| [LangChainJS Core](https://js.langchain.com/)                    | `1.1.x`  | LLM framework (tools, structured output, messages)      |
| [@langchain/openai](https://js.langchain.com/)                   | `1.4.x`  | OpenAI ChatGPT integration                              |
| [CopilotKit SDK](https://docs.copilotkit.ai/)                    | `1.59.x` | Server-side CopilotKit integration                      |
| [AG-UI Core](https://docs.ag-ui.com/)                            | `0.0.55` | Agentic UI event types                                  |
| [AG-UI Encoder](https://docs.ag-ui.com/)                         | `0.0.55` | Event stream encoding                                   |
| [AG-UI LangGraph](https://docs.ag-ui.com/)                       | `0.0.36` | LangGraph ↔ AG-UI adapter                               |
| [Drizzle ORM](https://orm.drizzle.team/)                         | `0.45.2` | TypeScript ORM for PostgreSQL                            |
| [pg](https://node-postgres.com/)                                 | `8.21.x` | PostgreSQL client driver                                 |
| [Zod](https://zod.dev/)                                          | `3.25.x` | Schema validation and structured output                  |
| [dotenv](https://github.com/motdotla/dotenv)                     | `16.5.x` | Environment variable loading                             |
| [TypeScript](https://www.typescriptlang.org/)                    | `5.x`    | Static typing                                            |

---

## 🔧 Development Tools

| Tool                                                    | Version  | Purpose                              |
| ------------------------------------------------------- | -------- | ------------------------------------ |
| [@langchain/langgraph-cli](https://langchain-ai.github.io/langgraphjs/) | `1.2.1` | LangGraph dev server CLI    |
| [tsup](https://tsup.egoist.dev/)                        | `8.4.x`  | TypeScript bundler for production    |
| [tsx](https://github.com/privatenumber/tsx)              | `4.19.x` | TypeScript execution for scripts     |
| [Drizzle Kit](https://orm.drizzle.team/)                | `0.31.x` | Database migration management        |
| [ESLint](https://eslint.org/)                           | `9.x`    | Static code analysis                 |
| [Prettier](https://prettier.io/)                        | (root)   | Code formatter                       |

---

## 🌐 Environment

Copy the example file:

```bash
cp .env.example .env
```

| Variable              | Required | Purpose                                    |
| --------------------- | -------- | ------------------------------------------ |
| `OPENAI_API_KEY`      | Yes      | OpenAI API key for LLM calls               |
| `AGENT_PORT`          | No       | Agent server port (default: `8123`)         |
| `ORS_API_KEY`         | Yes      | OpenRouteService API key for geocoding      |
| `DATABASE_URL`        | Yes      | PostgreSQL connection string                |
| `LANGSMITH_TRACING`   | No       | Enable LangSmith tracing (`true` / `false`) |
| `LANGSMITH_API_KEY`   | No       | LangSmith API key                           |
| `LANGSMITH_PROJECT`   | No       | LangSmith project name                      |
| `LANGSMITH_ENDPOINT`  | No       | LangSmith API endpoint                      |

Typical local values:

```bash
OPENAI_API_KEY=<your-openai-key>
AGENT_PORT=8123
ORS_API_KEY=<your-openrouteservice-key>
DATABASE_URL=<your-postgresql-connection-string>

# LangSmith Tracing (optional)
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=<your-langsmith-key>
LANGSMITH_PROJECT=city-ride-booking
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
```

---

## 🚀 How to Run

### Prerequisites

- Node.js `>=22`
- `pnpm >=9`
- PostgreSQL database must be accessible
- OpenAI API key and ORS API key must be configured

### Commands

Inside the package:

| Command      | Description                                          |
| ------------ | ---------------------------------------------------- |
| `pnpm dev`   | Start LangGraph dev server (port `8123`, no browser) |
| `pnpm build` | Build agent for production (via tsup)                |
| `pnpm lint`  | Run ESLint                                           |

From the repository root:

```bash
pnpm dev:agent
```

The LangGraph server will be available at http://localhost:8123.

### Database Migrations

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Open Drizzle Studio (database browser)
npx drizzle-kit studio
```

---

### Configuration Files

| File               | Purpose                               |
| ------------------- | ------------------------------------- |
| `langgraph.json`    | LangGraph CLI graph registration      |
| `drizzle.config.ts` | Drizzle ORM / migration configuration |
| `tsconfig.json`     | TypeScript compiler options           |
| `eslint.config.js`  | ESLint configuration                  |
| `package.json`      | Dependencies and scripts              |
