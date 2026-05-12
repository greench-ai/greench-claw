import {
  getRuntimeConfig,
  getRuntimeConfigSourceSnapshot,
  type NexisClawConfig,
} from "../config/config.js";

export function loadBrowserConfigForRuntimeRefresh(): NexisClawConfig {
  return getRuntimeConfigSourceSnapshot() ?? getRuntimeConfig();
}
