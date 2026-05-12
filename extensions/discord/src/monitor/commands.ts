import type { DiscordSlashCommandConfig } from "NexisClaw/plugin-sdk/config-contracts";

export function resolveDiscordSlashCommandConfig(
  raw?: DiscordSlashCommandConfig,
): Required<DiscordSlashCommandConfig> {
  return {
    ephemeral: raw?.ephemeral !== false,
  };
}
