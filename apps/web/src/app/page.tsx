"use client";

import { CopilotChat } from "@copilotkit/react-ui";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          🤖 LangGraph Agent
        </h1>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          CopilotKit + AG-UI
        </span>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <CopilotChat
          className="flex-1"
          labels={{
            title: "LangGraph Agent",
            initial: "Hi! I'm your LangGraph-powered assistant. How can I help you today?",
          }}
        />
      </main>
    </div>
  );
}
