// Private runtime barrel for the bundled Voice Call extension.
// Keep this barrel thin and aligned with the local extension surface.

export { definePluginEntry } from "NexisClaw/plugin-sdk/plugin-entry";
export type { NexisClawPluginApi } from "NexisClaw/plugin-sdk/plugin-entry";
export type { GatewayRequestHandlerOptions } from "NexisClaw/plugin-sdk/gateway-runtime";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
  requestBodyErrorToText,
} from "NexisClaw/plugin-sdk/webhook-request-guards";
export { fetchWithSsrFGuard, isBlockedHostnameOrIp } from "NexisClaw/plugin-sdk/ssrf-runtime";
export type { SessionEntry } from "NexisClaw/plugin-sdk/session-store-runtime";
export {
  TtsAutoSchema,
  TtsConfigSchema,
  TtsModeSchema,
  TtsProviderSchema,
} from "NexisClaw/plugin-sdk/tts-runtime";
export { sleep } from "NexisClaw/plugin-sdk/runtime-env";
