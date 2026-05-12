// Private runtime barrel for the bundled Feishu extension.
// Keep this barrel thin and generic-only.

export type {
  AllowlistMatch,
  AnyAgentTool,
  BaseProbeResult,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelMeta,
  ChannelOutboundAdapter,
  ChannelPlugin,
  HistoryEntry,
  NexisClawConfig,
  NexisClawPluginApi,
  OutboundIdentity,
  PluginRuntime,
  ReplyPayload,
} from "NexisClaw/plugin-sdk/core";
export type { NexisClawConfig as ClawdbotConfig } from "NexisClaw/plugin-sdk/core";
export type { RuntimeEnv } from "NexisClaw/plugin-sdk/runtime";
export type { GroupToolPolicyConfig } from "NexisClaw/plugin-sdk/config-contracts";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createActionGate,
  createDedupeCache,
} from "NexisClaw/plugin-sdk/core";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "NexisClaw/plugin-sdk/channel-status";
export { buildAgentMediaPayload } from "NexisClaw/plugin-sdk/agent-media-payload";
export { createChannelPairingController } from "NexisClaw/plugin-sdk/channel-pairing";
export { createReplyPrefixContext } from "NexisClaw/plugin-sdk/channel-message";
export {
  evaluateSupplementalContextVisibility,
  filterSupplementalContextItems,
  resolveChannelContextVisibilityMode,
} from "NexisClaw/plugin-sdk/context-visibility-runtime";
export {
  loadSessionStore,
  resolveSessionStoreEntry,
} from "NexisClaw/plugin-sdk/session-store-runtime";
export { readJsonFileWithFallback } from "NexisClaw/plugin-sdk/json-store";
export { createPersistentDedupe } from "NexisClaw/plugin-sdk/persistent-dedupe";
export { normalizeAgentId } from "NexisClaw/plugin-sdk/routing";
export { chunkTextForOutbound } from "NexisClaw/plugin-sdk/text-chunking";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
  requestBodyErrorToText,
} from "NexisClaw/plugin-sdk/webhook-ingress";
export { setFeishuRuntime } from "./src/runtime.js";
