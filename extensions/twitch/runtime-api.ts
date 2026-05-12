// Private runtime barrel for the bundled Twitch extension.
// Keep this barrel thin and aligned with the local extension surface.

export type {
  ChannelAccountSnapshot,
  ChannelCapabilities,
  ChannelGatewayContext,
  ChannelLogSink,
  ChannelMessageActionAdapter,
  ChannelMessageActionContext,
  ChannelMeta,
  ChannelOutboundAdapter,
  ChannelOutboundContext,
  ChannelResolveKind,
  ChannelResolveResult,
  ChannelStatusAdapter,
} from "NexisClaw/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "NexisClaw/plugin-sdk/channel-core";
export type { OutboundDeliveryResult } from "NexisClaw/plugin-sdk/channel-send-result";
export type { NexisClawConfig } from "NexisClaw/plugin-sdk/config-contracts";
export type { RuntimeEnv } from "NexisClaw/plugin-sdk/runtime";
export type { WizardPrompter } from "NexisClaw/plugin-sdk/setup";
