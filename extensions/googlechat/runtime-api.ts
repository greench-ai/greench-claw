// Private runtime barrel for the bundled Google Chat extension.
// Keep this barrel thin and avoid broad plugin-sdk surfaces during bootstrap.

export { DEFAULT_ACCOUNT_ID } from "NexisClaw/plugin-sdk/account-id";
export {
  createActionGate,
  jsonResult,
  readNumberParam,
  readReactionParams,
  readStringParam,
} from "NexisClaw/plugin-sdk/channel-actions";
export { buildChannelConfigSchema } from "NexisClaw/plugin-sdk/channel-config-primitives";
export type {
  ChannelMessageActionAdapter,
  ChannelMessageActionName,
  ChannelStatusIssue,
} from "NexisClaw/plugin-sdk/channel-contract";
export { missingTargetError } from "NexisClaw/plugin-sdk/channel-feedback";
export {
  createAccountStatusSink,
  runPassiveAccountLifecycle,
} from "NexisClaw/plugin-sdk/channel-lifecycle";
export { createChannelPairingController } from "NexisClaw/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "NexisClaw/plugin-sdk/channel-message";
export { PAIRING_APPROVED_MESSAGE } from "NexisClaw/plugin-sdk/channel-status";
export { chunkTextForOutbound } from "NexisClaw/plugin-sdk/text-chunking";
export type { NexisClawConfig } from "NexisClaw/plugin-sdk/config-contracts";
export { GoogleChatConfigSchema } from "NexisClaw/plugin-sdk/bundled-channel-config-schema";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "NexisClaw/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "NexisClaw/plugin-sdk/dangerous-name-runtime";
export { fetchRemoteMedia, resolveChannelMediaMaxBytes } from "NexisClaw/plugin-sdk/media-runtime";
export { loadOutboundMediaFromUrl } from "NexisClaw/plugin-sdk/outbound-media";
export type { PluginRuntime } from "NexisClaw/plugin-sdk/runtime-store";
export { fetchWithSsrFGuard } from "NexisClaw/plugin-sdk/ssrf-runtime";
export type {
  GoogleChatAccountConfig,
  GoogleChatConfig,
} from "NexisClaw/plugin-sdk/config-contracts";
export { extractToolSend } from "NexisClaw/plugin-sdk/tool-send";
export { resolveInboundMentionDecision } from "NexisClaw/plugin-sdk/channel-inbound";
export { resolveInboundRouteEnvelopeBuilderWithRuntime } from "NexisClaw/plugin-sdk/inbound-envelope";
export { resolveWebhookPath } from "NexisClaw/plugin-sdk/webhook-ingress";
export {
  registerWebhookTargetWithPluginRoute,
  resolveWebhookTargetWithAuthOrReject,
  withResolvedWebhookRequestPipeline,
} from "NexisClaw/plugin-sdk/webhook-targets";
export {
  createWebhookInFlightLimiter,
  readJsonWebhookBodyOrReject,
  type WebhookInFlightLimiter,
} from "NexisClaw/plugin-sdk/webhook-request-guards";
export { setGoogleChatRuntime } from "./src/runtime.js";
