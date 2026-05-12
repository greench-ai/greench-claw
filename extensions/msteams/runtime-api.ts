// Private runtime barrel for the bundled Microsoft Teams extension.
// Keep this barrel thin and aligned with the local extension surface.

export { DEFAULT_ACCOUNT_ID } from "NexisClaw/plugin-sdk/account-id";
export type { AllowlistMatch } from "NexisClaw/plugin-sdk/allow-from";
export {
  mergeAllowlist,
  resolveAllowlistMatchSimple,
  summarizeMapping,
} from "NexisClaw/plugin-sdk/allow-from";
export type {
  BaseProbeResult,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelOutboundAdapter,
} from "NexisClaw/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "NexisClaw/plugin-sdk/channel-core";
export { logTypingFailure } from "NexisClaw/plugin-sdk/channel-logging";
export { createChannelPairingController } from "NexisClaw/plugin-sdk/channel-pairing";
export { resolveToolsBySender } from "NexisClaw/plugin-sdk/channel-policy";
export { createChannelMessageReplyPipeline } from "NexisClaw/plugin-sdk/channel-message";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "NexisClaw/plugin-sdk/channel-status";
export {
  buildChannelKeyCandidates,
  normalizeChannelSlug,
  resolveChannelEntryMatchWithFallback,
  resolveNestedAllowlistDecision,
} from "NexisClaw/plugin-sdk/channel-targets";
export type {
  GroupPolicy,
  GroupToolPolicyConfig,
  MSTeamsChannelConfig,
  MSTeamsConfig,
  MSTeamsReplyStyle,
  MSTeamsTeamConfig,
  MarkdownTableMode,
  NexisClawConfig,
} from "NexisClaw/plugin-sdk/config-contracts";
export { isDangerousNameMatchingEnabled } from "NexisClaw/plugin-sdk/dangerous-name-runtime";
export { resolveDefaultGroupPolicy } from "NexisClaw/plugin-sdk/runtime-group-policy";
export { withFileLock } from "NexisClaw/plugin-sdk/file-lock";
export { keepHttpServerTaskAlive } from "NexisClaw/plugin-sdk/channel-lifecycle";
export {
  detectMime,
  extensionForMime,
  extractOriginalFilename,
  getFileExtension,
  resolveChannelMediaMaxBytes,
} from "NexisClaw/plugin-sdk/media-runtime";
export { dispatchReplyFromConfigWithSettledDispatcher } from "NexisClaw/plugin-sdk/inbound-reply-dispatch";
export { loadOutboundMediaFromUrl } from "NexisClaw/plugin-sdk/outbound-media";
export { buildMediaPayload } from "NexisClaw/plugin-sdk/reply-payload";
export type { ReplyPayload } from "NexisClaw/plugin-sdk/reply-payload";
export type { PluginRuntime } from "NexisClaw/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "NexisClaw/plugin-sdk/runtime";
export type { SsrFPolicy } from "NexisClaw/plugin-sdk/ssrf-runtime";
export { fetchWithSsrFGuard } from "NexisClaw/plugin-sdk/ssrf-runtime";
export { normalizeStringEntries } from "NexisClaw/plugin-sdk/string-normalization-runtime";
export { chunkTextForOutbound } from "NexisClaw/plugin-sdk/text-chunking";
export { DEFAULT_WEBHOOK_MAX_BODY_BYTES } from "NexisClaw/plugin-sdk/webhook-ingress";
export { setMSTeamsRuntime } from "./src/runtime.js";
