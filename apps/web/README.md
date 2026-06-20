# 🖥️ Web

> The user-facing frontend for the City Ride Booking experience. Renders the trip dashboard, Firebase authentication, CopilotKit chat sidebar with AI assistant, and Generative UI components (ride estimates, HITL confirmations, driver match cards) connected to the LangGraph agent runtime.

[![Next.js](https://img.shields.io/badge/Next.js-16.2.7-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.4-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![CopilotKit](https://img.shields.io/badge/CopilotKit-1.59.x-6366f1?logo=openai&logoColor=white)](https://docs.copilotkit.ai/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Technical Stacks](#-technical-stacks)
- [Development Tools](#-development-tools)
- [Environment](#-environment)
- [How to Run](#-how-to-run)
- [Project Structure](#-project-structure)

---

## 🔍 Overview

Responsibilities:

- Render the trip dashboard with status filtering (All / Active / Completed / Cancelled), stats cards, and trip detail dialogs
- Handle user authentication via Firebase Auth (login page + auth context)
- Render the CopilotKit chat sidebar with streaming AI assistant responses
- Display Generative UI components in chat: ride estimate cards, driver match cards, trip list cards, success/error cards
- Implement human-in-the-loop confirmation workflows: ride confirmation card (`RideConfirmCard`) and cancellation confirmation card (`CancelTripCard`)
- Register frontend tools, render tools, and agent context readables for CopilotKit integration
- Provide REST API routes for trip data (`/api/trips`) and CopilotKit runtime proxy (`/api/copilotkit`)

**Depends on:** `agent` (LangGraph server on port `8123`) and PostgreSQL database.

---

## 🛠 Technical Stacks

| Technology                                            | Version   | Purpose                                    |
| ----------------------------------------------------- | --------- | ------------------------------------------ |
| [Next.js](https://nextjs.org/)                        | `16.2.7`  | React framework with SSR and API routes    |
| [React](https://react.dev/)                           | `19.2.4`  | UI library                                 |
| [CopilotKit React Core](https://docs.copilotkit.ai/) | `1.59.2`  | In-app AI copilot hooks and state          |
| [CopilotKit React UI](https://docs.copilotkit.ai/)   | `1.59.2`  | Pre-built copilot UI components            |
| [CopilotKit Runtime](https://docs.copilotkit.ai/)    | `1.59.2`  | Server-side CopilotKit runtime             |
| [TailwindCSS](https://tailwindcss.com/)               | `4.x`     | Utility-first CSS framework                |
| [shadcn/ui](https://ui.shadcn.com/)                  | `4.10.0`  | Radix-based UI component library           |
| [Radix UI](https://www.radix-ui.com/)                | `1.5.0`   | Accessible, unstyled UI primitives         |
| [Firebase](https://firebase.google.com/)              | `12.14.0` | Authentication provider                    |
| [Drizzle ORM](https://orm.drizzle.team/)              | `0.45.2`  | TypeScript ORM for PostgreSQL queries      |
| [Zod](https://zod.dev/)                              | `3.25.x`  | Runtime schema validation                  |
| [Lucide React](https://lucide.dev/)                  | `1.17.0`  | Icon library                               |
| [TypeScript](https://www.typescriptlang.org/)         | `5.x`     | Static typing                              |

---

## 🔧 Development Tools

| Tool                                                                | Version   | Purpose                |
| ------------------------------------------------------------------- | --------- | ---------------------- |
| [ESLint](https://eslint.org/)                                       | `9.x`     | Static code analysis   |
| [eslint-config-next](https://nextjs.org/docs/app/api-reference/config/eslint) | `16.2.7` | Next.js ESLint rules  |
| [Prettier](https://prettier.io/)                                    | (root)    | Code formatter         |
| [TypeScript](https://www.typescriptlang.org/)                       | `5.x`     | Type checking          |

---

## 🌐 Environment

Create a `.env` file in this directory (no `.env.example` provided — use the template below):

| Variable                                     | Required | Purpose                                |
| -------------------------------------------- | -------- | -------------------------------------- |
| `DATABASE_URL`                               | Yes      | PostgreSQL connection string           |
| `LANGGRAPH_DEPLOYMENT_URL`                   | Yes      | LangGraph agent server URL             |
| `LANGSMITH_API_KEY`                          | No       | LangSmith tracing API key              |
| `NEXT_PUBLIC_FIREBASE_API_KEY`               | Yes      | Firebase API key                       |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`           | Yes      | Firebase Auth domain                   |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`            | Yes      | Firebase project ID                    |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`        | Yes      | Firebase storage bucket                |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`   | Yes      | Firebase messaging sender ID           |
| `NEXT_PUBLIC_FIREBASE_APP_ID`                | Yes      | Firebase app ID                        |

Typical local values:

```bash
DATABASE_URL=<your-postgresql-connection-string>
LANGGRAPH_DEPLOYMENT_URL=http://localhost:8123

# Firebase Authentication
NEXT_PUBLIC_FIREBASE_API_KEY=<your-firebase-api-key>
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<your-firebase-auth-domain>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<your-firebase-project-id>
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<your-firebase-storage-bucket>
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<your-firebase-sender-id>
NEXT_PUBLIC_FIREBASE_APP_ID=<your-firebase-app-id>
```

---

## 🚀 How to Run

### Prerequisites

- Node.js `>=22`
- `pnpm >=9`
- `agent` (LangGraph server) must already be running
- PostgreSQL database must be accessible

### Commands

Inside the package:

| Command      | Description               |
| ------------ | ------------------------- |
| `pnpm dev`   | Start Next.js dev server  |
| `pnpm build` | Build for production      |
| `pnpm start` | Start production server   |
| `pnpm lint`  | Run ESLint                |

From the repository root:

```bash
pnpm dev:web
```

Open http://localhost:3000 in your browser.
