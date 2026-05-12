import {
  getRuntimeConfigSnapshot,
  getRuntimeConfigSourceSnapshot,
} from "../config/runtime-snapshot.js";
import type { NexisClawConfig } from "../config/types.NexisClaw.js";

export function resolvePluginActivationSourceConfig(params: {
  config?: NexisClawConfig;
  activationSourceConfig?: NexisClawConfig;
}): NexisClawConfig {
  if (params.activationSourceConfig !== undefined) {
    return params.activationSourceConfig;
  }
  const sourceSnapshot = getRuntimeConfigSourceSnapshot();
  if (sourceSnapshot && params.config === getRuntimeConfigSnapshot()) {
    return sourceSnapshot;
  }
  return params.config ?? {};
}
