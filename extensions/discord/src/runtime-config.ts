import {
  getRuntimeConfigSnapshot,
  getRuntimeConfigSourceSnapshot,
  selectApplicableRuntimeConfig,
} from "NexisClaw/plugin-sdk/runtime-config-snapshot";
import type { NexisClawConfig } from "./runtime-api.js";

export function selectDiscordRuntimeConfig(inputConfig: NexisClawConfig): NexisClawConfig {
  return (
    selectApplicableRuntimeConfig({
      inputConfig,
      runtimeConfig: getRuntimeConfigSnapshot(),
      runtimeSourceConfig: getRuntimeConfigSourceSnapshot(),
    }) ?? inputConfig
  );
}
