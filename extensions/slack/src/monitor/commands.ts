import type { SlackSlashCommandConfig } from "NexisClaw/plugin-sdk/config-contracts";
import { normalizeOptionalString } from "NexisClaw/plugin-sdk/string-coerce-runtime";

/**
 * Strip Slack mentions (<@U123>, <@U123|name>) so command detection works on
 * normalized text. Use in both prepare and debounce gate for consistency.
 */
export function stripSlackMentionsForCommandDetection(text: string): string {
  return (text ?? "")
    .replace(/<@[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSlackSlashCommandName(raw: string) {
  return raw.replace(/^\/+/, "");
}

export function resolveSlackSlashCommandConfig(
  raw?: SlackSlashCommandConfig,
): Required<SlackSlashCommandConfig> {
  const normalizedName = normalizeSlackSlashCommandName(
    normalizeOptionalString(raw?.name) ?? "NexisClaw",
  );
  const name = normalizedName || "NexisClaw";
  return {
    enabled: raw?.enabled === true,
    name,
    sessionPrefix: normalizeOptionalString(raw?.sessionPrefix) ?? "slack:slash",
    ephemeral: raw?.ephemeral !== false,
  };
}

export function buildSlackSlashCommandMatcher(name: string) {
  const normalized = normalizeSlackSlashCommandName(name);
  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^/?${escaped}$`);
}
