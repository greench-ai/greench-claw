import type { NexisClawConfig } from "../../config/types.NexisClaw.js";

export function createPerSenderSessionConfig(
  overrides: Partial<NonNullable<NexisClawConfig["session"]>> = {},
): NonNullable<NexisClawConfig["session"]> {
  return {
    mainKey: "main",
    scope: "per-sender",
    ...overrides,
  };
}
