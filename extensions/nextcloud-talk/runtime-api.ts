// Private runtime barrel for the bundled Nextcloud Talk extension.
// Keep this barrel thin and aligned with the local extension surface.

export type { AllowlistMatch } from "NexisClaw/plugin-sdk/allow-from";
export type { ChannelGroupContext } from "NexisClaw/plugin-sdk/channel-contract";
export { logInboundDrop } from "NexisClaw/plugin-sdk/channel-logging";
export { createChannelPairingController } from "NexisClaw/plugin-sdk/channel-pairing";
export type {
  BlockStreamingCoalesceConfig,
  DmConfig,
  DmPolicy,
  GroupPolicy,
  GroupToolPolicyConfig,
  NexisClawConfig,
} from "NexisClaw/plugin-sdk/config-contracts";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "NexisClaw/plugin-sdk/runtime-group-policy";
export { createChannelMessageReplyPipeline } from "NexisClaw/plugin-sdk/channel-message";
export type { OutboundReplyPayload } from "NexisClaw/plugin-sdk/reply-payload";
export { deliverFormattedTextWithAttachments } from "NexisClaw/plugin-sdk/reply-payload";
export type { PluginRuntime } from "NexisClaw/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "NexisClaw/plugin-sdk/runtime";
export type { SecretInput } from "NexisClaw/plugin-sdk/secret-input";
export { fetchWithSsrFGuard } from "NexisClaw/plugin-sdk/ssrf-runtime";
export { setNextcloudTalkRuntime } from "./src/runtime.js";
