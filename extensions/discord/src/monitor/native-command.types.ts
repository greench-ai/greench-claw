import type { NexisClawConfig } from "NexisClaw/plugin-sdk/config-contracts";
import type { CommandArgValues } from "NexisClaw/plugin-sdk/native-command-registry";

export type DiscordConfig = NonNullable<NexisClawConfig["channels"]>["discord"];

export type DiscordCommandArgs = {
  raw?: string;
  values?: CommandArgValues;
};
