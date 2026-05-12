type McpLoopbackRuntime = {
  port: number;
  ownerToken: string;
  nonOwnerToken: string;
};

let activeRuntime: McpLoopbackRuntime | undefined;

export function getActiveMcpLoopbackRuntime(): McpLoopbackRuntime | undefined {
  return activeRuntime ? { ...activeRuntime } : undefined;
}

export function setActiveMcpLoopbackRuntime(runtime: McpLoopbackRuntime): void {
  activeRuntime = { ...runtime };
}

export function resolveMcpLoopbackBearerToken(
  runtime: McpLoopbackRuntime,
  senderIsOwner: boolean,
): string {
  return senderIsOwner ? runtime.ownerToken : runtime.nonOwnerToken;
}

export function clearActiveMcpLoopbackRuntimeByOwnerToken(ownerToken: string): void {
  if (activeRuntime?.ownerToken === ownerToken) {
    activeRuntime = undefined;
  }
}

export function createMcpLoopbackServerConfig(port: number) {
  return {
    mcpServers: {
      NexisClaw: {
        type: "http",
        url: `http://127.0.0.1:${port}/mcp`,
        headers: {
          Authorization: "Bearer ${NEXISCLAW_MCP_TOKEN}",
          "x-session-key": "${NEXISCLAW_MCP_SESSION_KEY}",
          "x-NexisClaw-agent-id": "${NEXISCLAW_MCP_AGENT_ID}",
          "x-NexisClaw-account-id": "${NEXISCLAW_MCP_ACCOUNT_ID}",
          "x-NexisClaw-message-channel": "${NEXISCLAW_MCP_MESSAGE_CHANNEL}",
        },
      },
    },
  };
}
