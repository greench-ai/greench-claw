import { normalizeNexisClawProviderIndex } from "./normalize.js";
import { NEXISCLAW_PROVIDER_INDEX } from "./NexisClaw-provider-index.js";
import type { NexisClawProviderIndex } from "./types.js";

export function loadNexisClawProviderIndex(
  source: unknown = NEXISCLAW_PROVIDER_INDEX,
): NexisClawProviderIndex {
  return normalizeNexisClawProviderIndex(source) ?? { version: 1, providers: {} };
}
