import type { NexisClawConfig } from "../config/types.NexisClaw.js";

export function isGatewayModelPricingEnabled(config: NexisClawConfig): boolean {
  return config.models?.pricing?.enabled !== false;
}
