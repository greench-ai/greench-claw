import type { NexisClawConfig } from "NexisClaw/plugin-sdk/config-contracts";

export type SignalAccountConfig = Omit<
  Exclude<NonNullable<NexisClawConfig["channels"]>["signal"], undefined>,
  "accounts"
>;
