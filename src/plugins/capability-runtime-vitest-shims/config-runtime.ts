import { resolveActiveTalkProviderConfig } from "../../config/talk.js";
import type { NexisClawConfig } from "../../config/types.js";

export { resolveActiveTalkProviderConfig };

export function getRuntimeConfigSnapshot(): NexisClawConfig | null {
  return null;
}
