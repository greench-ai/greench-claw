import type { NexisClawConfig } from "NexisClaw/plugin-sdk/config-contracts";
import { inspectSlackAccount } from "./src/account-inspect.js";

export function inspectSlackReadOnlyAccount(cfg: NexisClawConfig, accountId?: string | null) {
  return inspectSlackAccount({ cfg, accountId });
}
