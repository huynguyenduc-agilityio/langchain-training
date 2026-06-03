/**
 * CopilotKit API Route
 *
 * This endpoint bridges the Next.js frontend with the LangGraph agent
 * via the CopilotKit runtime and AG-UI protocol.
 *
 * The agent runs via `langgraph dev` on port 2024.
 * This route connects to it using CopilotKit's LangGraphAgent.
 */

import {
  CopilotRuntime,
  copilotRuntimeNextJSAppRouterEndpoint,
} from "@copilotkit/runtime";
import { LangGraphAgent } from "@copilotkit/runtime/langgraph";
import { NextRequest } from "next/server";

const AGENT_DEPLOYMENT_URL =
  process.env.AGENT_DEPLOYMENT_URL || "http://localhost:2024";

const runtime = new CopilotRuntime({
  agents: {
    default: new LangGraphAgent({
      deploymentUrl: AGENT_DEPLOYMENT_URL,
      graphId: "agent",
      langsmithApiKey: process.env.LANGSMITH_API_KEY || "",
    }),
  },
});

export const POST = async (req: NextRequest) => {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    endpoint: "/api/copilotkit",
  });

  return handleRequest(req);
};
