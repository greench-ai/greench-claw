// Private runtime barrel for the bundled IRC extension.
// Keep this barrel thin and generic-only.

export type { BaseProbeResult } from "NexisClaw/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "NexisClaw/plugin-sdk/channel-core";
export type { NexisClawConfig } from "NexisClaw/plugin-sdk/config-contracts";
export type { PluginRuntime } from "NexisClaw/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "NexisClaw/plugin-sdk/runtime";
export type {
  BlockStreamingCoalesceConfig,
  DmConfig,
  DmPolicy,
  GroupPolicy,
  GroupToolPolicyBySenderConfig,
  GroupToolPolicyConfig,
  MarkdownConfig,
} from "NexisClaw/plugin-sdk/config-contracts";
export type { OutboundReplyPayload } from "NexisClaw/plugin-sdk/reply-payload";
export { DEFAULT_ACCOUNT_ID } from "NexisClaw/plugin-sdk/account-id";
export { buildChannelConfigSchema } from "NexisClaw/plugin-sdk/channel-config-primitives";
export {
  PAIRING_APPROVED_MESSAGE,
  buildBaseChannelStatusSummary,
} from "NexisClaw/plugin-sdk/channel-status";
export { createChannelPairingController } from "NexisClaw/plugin-sdk/channel-pairing";
export { createAccountStatusSink } from "NexisClaw/plugin-sdk/channel-lifecycle";
export { resolveControlCommandGate } from "NexisClaw/plugin-sdk/command-auth-native";
export { createChannelMessageReplyPipeline } from "NexisClaw/plugin-sdk/channel-message";
export { chunkTextForOutbound } from "NexisClaw/plugin-sdk/text-chunking";
export {
  deliverFormattedTextWithAttachments,
  formatTextWithAttachmentLinks,
  resolveOutboundMediaUrls,
} from "NexisClaw/plugin-sdk/reply-payload";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "NexisClaw/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "NexisClaw/plugin-sdk/dangerous-name-runtime";
export { logInboundDrop } from "NexisClaw/plugin-sdk/channel-inbound";
