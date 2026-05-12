/**
 * Standalone MCP server for selected built-in NexisClaw tools.
 *
 * Run via: node --import tsx src/mcp/NexisClaw-tools-serve.ts
 * Or: bun src/mcp/NexisClaw-tools-serve.ts
 */
import { pathToFileURL } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { AnyAgentTool } from "../agents/tools/common.js";
import { createCronTool } from "../agents/tools/cron-tool.js";
import { formatErrorMessage } from "../infra/errors.js";
import { connectToolsMcpServerToStdio, createToolsMcpServer } from "./tools-stdio-server.js";

export function resolveNexisClawToolsForMcp(): AnyAgentTool[] {
  return [createCronTool()];
}

function createNexisClawToolsMcpServer(
  params: {
    tools?: AnyAgentTool[];
  } = {},
): Server {
  const tools = params.tools ?? resolveNexisClawToolsForMcp();
  return createToolsMcpServer({ name: "NexisClaw-tools", tools });
}

async function serveNexisClawToolsMcp(): Promise<void> {
  const server = createNexisClawToolsMcpServer();
  await connectToolsMcpServerToStdio(server);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  serveNexisClawToolsMcp().catch((err) => {
    process.stderr.write(`NexisClaw-tools-serve: ${formatErrorMessage(err)}\n`);
    process.exit(1);
  });
}
