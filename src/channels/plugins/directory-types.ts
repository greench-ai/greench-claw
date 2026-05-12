import type { NexisClawConfig } from "../../config/types.js";

export type DirectoryConfigParams = {
  cfg: NexisClawConfig;
  accountId?: string | null;
  query?: string | null;
  limit?: number | null;
};
