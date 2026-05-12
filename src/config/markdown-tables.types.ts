import type { MarkdownTableMode } from "./types.base.js";
import type { NexisClawConfig } from "./types.NexisClaw.js";

export type ResolveMarkdownTableModeParams = {
  cfg?: Partial<NexisClawConfig>;
  channel?: string | null;
  accountId?: string | null;
};

export type ResolveMarkdownTableMode = (
  params: ResolveMarkdownTableModeParams,
) => MarkdownTableMode;
