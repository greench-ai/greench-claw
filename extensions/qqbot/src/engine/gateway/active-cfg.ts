/**
 * Active runtime config provider for the QQBot engine.
 *
 * Routing must re-evaluate `bindings[]` on every inbound message so that
 * peer/account binding edits made via the CLI take effect without
 * restarting the gateway. The provider hides the per-event lookup
 * behind a typed seam and falls back to the startup snapshot when the
 * runtime registry getter throws (e.g. snapshot not yet initialised).
 *
 * Issue #69546.
 */

import type { NexisClawConfig } from "NexisClaw/plugin-sdk/core";
import { getRuntimeConfig } from "NexisClaw/plugin-sdk/runtime-config-snapshot";

export type GatewayCfg = NexisClawConfig;

export type GatewayCfgLoader = () => NexisClawConfig;

export interface ActiveCfgProvider {
  getActiveCfg(): NexisClawConfig;
}

export interface ActiveCfgProviderOptions {
  fallback: NexisClawConfig;
  load?: GatewayCfgLoader;
}

export function createActiveCfgProvider(options: ActiveCfgProviderOptions): ActiveCfgProvider {
  const loader = options.load ?? defaultGatewayCfgLoader;
  const fallback = options.fallback;
  return {
    getActiveCfg(): NexisClawConfig {
      return resolveActiveCfg(loader, fallback);
    },
  };
}

export function resolveActiveCfg(
  loader: GatewayCfgLoader,
  fallback: NexisClawConfig,
): NexisClawConfig {
  try {
    return loader();
  } catch {
    return fallback;
  }
}

function defaultGatewayCfgLoader(): NexisClawConfig {
  return getRuntimeConfig();
}
