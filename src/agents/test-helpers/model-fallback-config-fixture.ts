import type { NexisClawConfig } from "../../config/types.NexisClaw.js";

export function makeModelFallbackCfg(overrides: Partial<NexisClawConfig> = {}): NexisClawConfig {
  return {
    agents: {
      defaults: {
        model: {
          primary: "openai/gpt-4.1-mini",
          fallbacks: ["anthropic/claude-haiku-3-5"],
        },
      },
    },
    ...overrides,
  } as NexisClawConfig;
}
