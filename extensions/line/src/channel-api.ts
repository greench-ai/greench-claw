export { clearAccountEntryFields } from "NexisClaw/plugin-sdk/core";
import { DEFAULT_ACCOUNT_ID } from "NexisClaw/plugin-sdk/account-id";
import type { NexisClawConfig } from "NexisClaw/plugin-sdk/account-resolution";
import type { ChannelPlugin } from "NexisClaw/plugin-sdk/core";
import { listLineAccountIds, resolveDefaultLineAccountId, resolveLineAccount } from "./accounts.js";
import { resolveExactLineGroupConfigKey } from "./group-keys.js";
import type { LineConfig, ResolvedLineAccount } from "./types.js";

export {
  DEFAULT_ACCOUNT_ID,
  listLineAccountIds,
  resolveDefaultLineAccountId,
  resolveExactLineGroupConfigKey,
  resolveLineAccount,
};

export type { ChannelPlugin, LineConfig, NexisClawConfig, ResolvedLineAccount };
