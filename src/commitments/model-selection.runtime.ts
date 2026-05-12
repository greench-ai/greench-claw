import { resolveDefaultModelForAgent } from "../agents/model-selection.js";
import type { NexisClawConfig } from "../config/config.js";

export function resolveCommitmentDefaultModelRef(params: {
  cfg: NexisClawConfig;
  agentId?: string;
}): { provider: string; model: string } {
  return resolveDefaultModelForAgent(params);
}
