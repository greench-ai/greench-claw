import { resolveChannelGroupRequireMention } from "NexisClaw/plugin-sdk/channel-policy";
import type { NexisClawConfig } from "NexisClaw/plugin-sdk/core";

type GoogleChatGroupContext = {
  cfg: NexisClawConfig;
  accountId?: string | null;
  groupId?: string | null;
};

export function resolveGoogleChatGroupRequireMention(params: GoogleChatGroupContext): boolean {
  return resolveChannelGroupRequireMention({
    cfg: params.cfg,
    channel: "googlechat",
    groupId: params.groupId,
    accountId: params.accountId,
  });
}
