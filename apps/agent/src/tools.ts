/**
 * Agent Tools
 *
 * Defines the tools available to the LangGraph agent.
 * Tools are LangChain-compatible and can be used by the LLM.
 */

import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * Example: A simple greeting tool.
 * Replace this with your actual tools (search, database, APIs, etc.)
 */
export const greetingTool = tool(
  async ({ name }: { name: string }) => {
    return `Hello, ${name}! Welcome to the LangGraph agent.`;
  },
  {
    name: "greeting",
    description: "Greet a user by name",
    schema: z.object({
      name: z.string().describe("The name of the user to greet"),
    }),
  }
);

/**
 * Export all tools as an array for use in graph nodes.
 */
export const tools = [greetingTool];
