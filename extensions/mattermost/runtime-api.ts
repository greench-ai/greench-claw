// Private runtime barrel for the bundled Mattermost extension.
// Keep this barrel thin and generic-only.

export type {
  BaseProbeResult,
  ChannelAccountSnapshot,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelPlugin,
  ChatType,
  HistoryEntry,
  NexisClawConfig,
  NexisClawPluginApi,
  PluginRuntime,
} from "NexisClaw/plugin-sdk/core";
export type { RuntimeEnv } from "NexisClaw/plugin-sdk/runtime";
export type { ReplyPayload } from "NexisClaw/plugin-sdk/reply-runtime";
export type { ModelsProviderData } from "NexisClaw/plugin-sdk/models-provider-runtime";
export type {
  BlockStreamingCoalesceConfig,
  DmPolicy,
  GroupPolicy,
} from "NexisClaw/plugin-sdk/config-contracts";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createDedupeCache,
  parseStrictPositiveInteger,
  resolveClientIp,
  isTrustedProxyAddress,
} from "NexisClaw/plugin-sdk/core";
export { buildComputedAccountStatusSnapshot } from "NexisClaw/plugin-sdk/channel-status";
export { createAccountStatusSink } from "NexisClaw/plugin-sdk/channel-lifecycle";
export { buildAgentMediaPayload } from "NexisClaw/plugin-sdk/agent-media-payload";
export {
  listSkillCommandsForAgents,
  resolveControlCommandGate,
  resolveStoredModelOverride,
} from "NexisClaw/plugin-sdk/command-auth-native";
export { buildModelsProviderData } from "NexisClaw/plugin-sdk/models-provider-runtime";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "NexisClaw/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "NexisClaw/plugin-sdk/dangerous-name-runtime";
export { loadSessionStore, resolveStorePath } from "NexisClaw/plugin-sdk/session-store-runtime";
export { formatInboundFromLabel } from "NexisClaw/plugin-sdk/channel-inbound";
export { logInboundDrop } from "NexisClaw/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "NexisClaw/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "NexisClaw/plugin-sdk/channel-message";
export { logTypingFailure } from "NexisClaw/plugin-sdk/channel-feedback";
export { loadOutboundMediaFromUrl } from "NexisClaw/plugin-sdk/outbound-media";
export { rawDataToString } from "NexisClaw/plugin-sdk/webhook-ingress";
export { chunkTextForOutbound } from "NexisClaw/plugin-sdk/text-chunking";
export {
  DEFAULT_GROUP_HISTORY_LIMIT,
  buildPendingHistoryContextFromMap,
  clearHistoryEntriesIfEnabled,
  recordPendingHistoryEntryIfEnabled,
} from "NexisClaw/plugin-sdk/reply-history";
export { normalizeAccountId, resolveThreadSessionKeys } from "NexisClaw/plugin-sdk/routing";
export { resolveAllowlistMatchSimple } from "NexisClaw/plugin-sdk/allow-from";
export { registerPluginHttpRoute } from "NexisClaw/plugin-sdk/webhook-targets";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
} from "NexisClaw/plugin-sdk/webhook-ingress";
export {
  applyAccountNameToChannelSection,
  applySetupAccountConfigPatch,
  migrateBaseNameToDefaultAccount,
} from "NexisClaw/plugin-sdk/setup";
export {
  getAgentScopedMediaLocalRoots,
  resolveChannelMediaMaxBytes,
} from "NexisClaw/plugin-sdk/media-runtime";
export { normalizeProviderId } from "NexisClaw/plugin-sdk/provider-model-shared";
export { setMattermostRuntime } from "./src/runtime.js";
