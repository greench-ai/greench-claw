// Narrow Matrix monitor helper seam.
// Keep monitor internals off the broad package runtime-api barrel so monitor
// tests and shared workers do not pull unrelated Matrix helper surfaces.

export type { NormalizedLocation } from "NexisClaw/plugin-sdk/channel-location";
export type { PluginRuntime, RuntimeLogger } from "NexisClaw/plugin-sdk/plugin-runtime";
export type { BlockReplyContext, ReplyPayload } from "NexisClaw/plugin-sdk/reply-runtime";
export type { MarkdownTableMode, NexisClawConfig } from "NexisClaw/plugin-sdk/config-contracts";
export type { RuntimeEnv } from "NexisClaw/plugin-sdk/runtime";
export {
  addAllowlistUserEntriesFromConfigEntry,
  buildAllowlistResolutionSummary,
  canonicalizeAllowlistWithResolvedIds,
  formatAllowlistMatchMeta,
  patchAllowlistUsersInConfigEntries,
  summarizeMapping,
} from "NexisClaw/plugin-sdk/allow-from";
export {
  createReplyPrefixOptions,
  createTypingCallbacks,
} from "NexisClaw/plugin-sdk/channel-reply-options-runtime";
export { formatLocationText, toLocationContext } from "NexisClaw/plugin-sdk/channel-location";
export { getAgentScopedMediaLocalRoots } from "NexisClaw/plugin-sdk/agent-media-payload";
export { logInboundDrop, logTypingFailure } from "NexisClaw/plugin-sdk/channel-logging";
export {
  buildChannelKeyCandidates,
  resolveChannelEntryMatch,
} from "NexisClaw/plugin-sdk/channel-targets";
