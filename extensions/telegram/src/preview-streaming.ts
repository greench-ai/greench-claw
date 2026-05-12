import {
  resolveChannelPreviewStreamMode,
  type StreamingMode,
} from "NexisClaw/plugin-sdk/channel-streaming";

type TelegramPreviewStreamMode = StreamingMode;

export function resolveTelegramPreviewStreamMode(
  params: {
    streamMode?: unknown;
    streaming?: unknown;
  } = {},
): TelegramPreviewStreamMode {
  return resolveChannelPreviewStreamMode(params, "partial");
}
