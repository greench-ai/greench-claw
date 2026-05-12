import type { NexisClawConfig } from "NexisClaw/plugin-sdk/config-contracts";
import { inspectDiscordAccount } from "./src/account-inspect.js";

export function inspectDiscordReadOnlyAccount(cfg: NexisClawConfig, accountId?: string | null) {
  return inspectDiscordAccount({ cfg, accountId });
}
