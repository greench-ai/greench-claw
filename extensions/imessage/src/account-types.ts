import type { NexisClawConfig } from "NexisClaw/plugin-sdk/config-contracts";

export type IMessageAccountConfig = Omit<
  NonNullable<NonNullable<NexisClawConfig["channels"]>["imessage"]>,
  "accounts" | "defaultAccount"
>;
