import { formatTrimmedAllowFromEntries } from "NexisClaw/plugin-sdk/channel-config-helpers";
import { PAIRING_APPROVED_MESSAGE } from "NexisClaw/plugin-sdk/channel-status";
import {
  DEFAULT_ACCOUNT_ID,
  getChatChannelMeta,
  type ChannelPlugin,
} from "NexisClaw/plugin-sdk/core";
import { resolveChannelMediaMaxBytes } from "NexisClaw/plugin-sdk/media-runtime";
import { collectStatusIssuesFromLastError } from "NexisClaw/plugin-sdk/status-helpers";
import { normalizeIMessageMessagingTarget } from "./normalize.js";
export { chunkTextForOutbound } from "NexisClaw/plugin-sdk/text-chunking";

export {
  collectStatusIssuesFromLastError,
  DEFAULT_ACCOUNT_ID,
  formatTrimmedAllowFromEntries,
  getChatChannelMeta,
  normalizeIMessageMessagingTarget,
  PAIRING_APPROVED_MESSAGE,
  resolveChannelMediaMaxBytes,
};

export type { ChannelPlugin };
