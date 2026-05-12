import type { NexisClawConfig } from "./runtime-api.js";
import { inspectTelegramAccount } from "./src/account-inspect.js";

export function inspectTelegramReadOnlyAccount(cfg: NexisClawConfig, accountId?: string | null) {
  return inspectTelegramAccount({ cfg, accountId });
}
