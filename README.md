# 🚕 City Ride Booking Chatbot

> An AI-powered intra-city ride-hailing application where users can request rides, estimate fares, manage trips, and interact with an intelligent chatbot assistant. Built with **LangChainJS**, **LangGraph**, **CopilotKit**, and **AG-UI** — featuring streaming responses, human-in-the-loop confirmation workflows, Generative UI, multi-agent architecture, guardrails, interrupts, and subgraphs.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![pnpm](https://img.shields.io/badge/pnpm-9.15.0-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.5.x-EF4444?logo=turborepo&logoColor=white)](https://turbo.build/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Technical Stacks](#-technical-stacks)
- [Development Tools](#-development-tools)
- [Timeline](#-timeline)
- [Quick Start](#-quick-start)
- [Command Reference](#-command-reference)
- [Project Structure](#-project-structure)
- [Author](#-author)

---

## 🔍 Overview

- **Plan:** [LangChain & LangGraph Training Plan - City Ride Booking](doc-plan/%5Bhuy.nguyenduc%5D%20LangChain%20%26%20LangGraph%20Training%20Plan%20-%20City%20Ride%20Booking.md)
- **Team size:** 1 developer

This is a **Turborepo monorepo** with two runtime surfaces managed by `pnpm`.

| Package                          | Role                                                    | Default URL            |
| -------------------------------- | ------------------------------------------------------- | ---------------------- |
| [`apps/web`](apps/web)           | User-facing trip dashboard, login, and chat experience  | http://localhost:3000   |
| [`apps/agent`](apps/agent)       | LangGraph AI agent server (CopilotKit + AG-UI runtime)  | http://localhost:8123   |

### Key Features

- 🤖 **AI Chat Assistant** — conversational chatbot for ride estimation, booking, cancellation, and trip lookup
- 🚗 **Ride Estimation** — geocoding & routing via OpenRouteService (ORS) with fare calculation for Bike / Car 4-seat / Car 7-seat
- ✅ **Human-in-the-Loop** — ride request and cancellation confirmation cards using LangGraph `interrupt()` + `Command` pattern
- 🧠 **Multi-Agent Architecture** — supervisor pattern routing to specialized Ride Agent, Management Agent, and Info Agent subgraphs
- 🛡️ **Input Guardrails** — programmatic validation node (operating hours, active trip limit, distance cap, phone format)
- 🎨 **Generative UI** — interactive cards rendered in chat via `useFrontendTool` and `useRenderTool`
- 🔐 **Firebase Authentication** — user login with Firebase Auth
- 💾 **PostgreSQL Persistence** — trip data and driver matching via Drizzle ORM

---

## 🏗 Architecture

```
web (Next.js)  ──►  agent (LangGraph Server)  ──►  PostgreSQL
  CopilotKit           LangChainJS                   Drizzle ORM
  AG-UI streaming      Supervisor + Subgraphs        Trip / Driver data
  Generative UI        OpenRouteService (ORS)
  Firebase Auth        PostgresSaver checkpointer
```

1. `web` renders the trip dashboard, login page, and CopilotKit chat sidebar
2. `web` sends CopilotKit runtime requests to the `agent` LangGraph server
3. `agent` runs the multi-agent graph (supervisor → ride / management / info sub-agents) and calls external services (ORS for geocoding, PostgreSQL for data)
4. The agent uses `interrupt()` for human-in-the-loop confirmations and streams responses back via AG-UI protocol

---

## 🛠 Technical Stacks

| Technology                                                        | Version   | Purpose                                                |
| ----------------------------------------------------------------- | --------- | ------------------------------------------------------ |
| [TypeScript](https://www.typescriptlang.org/)                     | `5.x`     | Strongly typed language across all apps                |
| [React](https://react.dev/)                                       | `19.2.4`  | Frontend UI library                                    |
| [Next.js](https://nextjs.org/)                                    | `16.2.7`  | React framework with SSR and API routes                |
| [CopilotKit](https://docs.copilotkit.ai/)                        | `1.59.x`  | Framework for in-app AI copilots and agents            |
| [AG-UI](https://docs.ag-ui.com/)                                 | `0.0.55`  | Protocol for streaming agentic UI events               |
| [LangChainJS](https://js.langchain.com/)                         | `1.1.x`   | LLM framework for building AI chains and agents        |
| [LangGraph](https://langchain-ai.github.io/langgraphjs/)         | `1.3.x`   | Stateful, multi-agent graph orchestration framework    |
| [OpenAI SDK](https://platform.openai.com/)                       | `1.4.x`   | LLM provider (via `@langchain/openai`)                 |
| [TailwindCSS](https://tailwindcss.com/)                          | `4.x`     | Utility-first CSS framework                            |
| [shadcn/ui](https://ui.shadcn.com/)                              | `4.10.0`  | Radix-based UI component library                       |
| [Drizzle ORM](https://orm.drizzle.team/)                         | `0.45.2`  | TypeScript ORM for PostgreSQL                          |
| [Firebase](https://firebase.google.com/)                         | `12.14.0` | Authentication provider                                |
| [Zod](https://zod.dev/)                                          | `3.25.x`  | Schema validation for structured outputs               |

---

## 🔧 Development Tools

| Tool                                       | Version  | Purpose                                  |
| ------------------------------------------ | -------- | ---------------------------------------- |
| [Turborepo](https://turbo.build/)          | `2.5.x`  | Monorepo task runner with caching        |
| [ESLint](https://eslint.org/)              | `9.x`    | Static code analysis                     |
| [Prettier](https://prettier.io/)           | `3.5.x`  | Opinionated code formatter               |
| [tsup](https://tsup.egoist.dev/)           | `8.4.x`  | TypeScript bundler for agent build       |
| [Drizzle Kit](https://orm.drizzle.team/)   | `0.31.x` | Database migration and schema management |

---

## 📅 Timeline

|              |               |
| ------------ | ------------- |
| **Estimate** | 8 days        |
| **Start**    | June 9, 2026  |
| **End**      | June 17, 2026 |

---

## 🚀 Quick Start

### Prerequisites

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/en/download/package-manager)
[![pnpm](https://img.shields.io/badge/pnpm-v9.15.0-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/installation)
[![OpenAI](https://img.shields.io/badge/LLM-OpenAI_API_Key-412991?logo=openai&logoColor=white)](https://platform.openai.com/)
[![ORS](https://img.shields.io/badge/Geocoding-OpenRouteService_API_Key-6CB52D)](https://openrouteservice.org/)

### Steps

```bash
# 1. Clone the repository
git clone <repository-url>
cd langchain-training

# 2. Install all dependencies
pnpm install

# 3. Set up environment variables
cp apps/agent/.env.example apps/agent/.env
# (web/.env — create manually, see below)
```

Fill in the required values:

**`apps/agent/.env`**

```bash
OPENAI_API_KEY=<your-openai-key>
AGENT_PORT=8123
ORS_API_KEY=<your-openrouteservice-key>
DATABASE_URL=<your-postgresql-connection-string>
DATABASE_DIRECT_URL=<your-postgresql-direct-connection-string> # Direct connection (port 5432) for PostgresSaver checkpointer

# LangSmith Tracing (optional)
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=<your-langsmith-key>
LANGSMITH_PROJECT=<your-project-name>
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
```

**`apps/web/.env`**

```bash
DATABASE_URL=<your-postgresql-connection-string>
DATABASE_DIRECT_URL=<your-postgresql-direct-connection-string> # Direct connection (port 5432) for Server-Sent Events (LISTEN/NOTIFY)
LANGGRAPH_DEPLOYMENT_URL=http://localhost:8123

# Firebase Authentication
NEXT_PUBLIC_FIREBASE_API_KEY=<your-firebase-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-firebase-auth-domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-firebase-project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-firebase-storage-bucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-firebase-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your-firebase-app-id>
```

### Start services

Start each service in a separate terminal **in this order**:

```bash
# Terminal 1 — LangGraph AI agent server
pnpm dev:agent

# Terminal 2 — Next.js frontend
pnpm dev:web
```

Open http://localhost:3000 in your browser.

---

## 📟 Command Reference

### Installation

| Command        | Purpose                           |
| -------------- | --------------------------------- |
| `pnpm install` | Install all workspace dependencies|

### Development

| Command         | Purpose                        | Port                   |
| --------------- | ------------------------------ | ---------------------- |
| `pnpm dev`      | Run all apps concurrently      | —                      |
| `pnpm dev:agent`| Run LangGraph agent server     | http://localhost:8123  |
| `pnpm dev:web`  | Run Next.js frontend           | http://localhost:3000  |

### Build

| Command      | Purpose        |
| ------------ | -------------- |
| `pnpm build` | Build all apps |

### Lint & Format

| Command              | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `pnpm lint`          | Lint all apps                              |
| `pnpm format:check`  | Check formatting with Prettier             |

---

## 📁 Project Structure

This monorepo is structured as follows:

```text
langchain-training/
├── apps/
│   ├── agent/                # LangGraph AI agent server
│   │   ├── src/
│   │   │   ├── constants/    # Shared constant values (pricing, rules, locations)
│   │   │   ├── db/           # Drizzle schema, migrations, seed scripts, Postgres checkpointer
│   │   │   ├── graphs/       # Subgraph definitions (ride, management, info)
│   │   │   ├── nodes/        # Graph node implementations (supervisor, validation, classifiers)
│   │   │   ├── prompts/      # System prompts for all agents/subgraphs
│   │   │   ├── services/     # External integrations (OpenRouteService)
│   │   │   ├── tools/        # Tool definitions for LangGraph agents
│   │   │   ├── types/        # TypeScript interfaces & types
│   │   │   └── utils/        # Shared helper functions
│   │   └── package.json
│   └── web/                  # Next.js frontend application
│       ├── src/
│       │   ├── app/          # Next.js app router pages & API endpoints (SSE, copilotkit proxy)
│       │   ├── components/   # React components (GenUI cards, dashboard, auth)
│       │   ├── constants/    # UI & Chat constants
│       │   ├── features/     # Feature-specific logic (auth, ride-booking)
│       │   ├── lib/          # Firebase initialization & HTTP/DB clients
│       │   ├── store/        # Zustand stores for state management
│       │   ├── types/        # UI-specific TypeScript types
│       │   └── utils/        # Frontend utility/helper functions
│       └── package.json
├── package.json              # Monorepo workspaces definition
└── turbo.json                # Turborepo task pipeline configuration
```

---

## 👤 Author

- **Huy Nguyen Duc** — [huy.nguyenduc](mailto:huy.nguyenduc@asnet.com.vn)
