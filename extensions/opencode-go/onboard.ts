import {
  applyAgentDefaultModelPrimary,
  type NexisClawConfig,
} from "NexisClaw/plugin-sdk/provider-onboard";

export const OPENCODE_GO_DEFAULT_MODEL_REF = "opencode-go/kimi-k2.6";

export function applyOpencodeGoProviderConfig(cfg: NexisClawConfig): NexisClawConfig {
  return cfg;
}

export function applyOpencodeGoConfig(cfg: NexisClawConfig): NexisClawConfig {
  return applyAgentDefaultModelPrimary(
    applyOpencodeGoProviderConfig(cfg),
    OPENCODE_GO_DEFAULT_MODEL_REF,
  );
}
