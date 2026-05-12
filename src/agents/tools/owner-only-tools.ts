export const NEXISCLAW_OWNER_ONLY_CORE_TOOL_NAMES = ["cron", "gateway", "nodes"] as const;

const NEXISCLAW_OWNER_ONLY_CORE_TOOL_NAME_SET: ReadonlySet<string> = new Set(
  NEXISCLAW_OWNER_ONLY_CORE_TOOL_NAMES,
);

export function isNexisClawOwnerOnlyCoreToolName(toolName: string): boolean {
  return NEXISCLAW_OWNER_ONLY_CORE_TOOL_NAME_SET.has(toolName);
}
