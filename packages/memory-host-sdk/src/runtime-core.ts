// Focused runtime contract for memory plugin config/state/helpers.

export type { AnyAgentTool } from "./host/NexisClaw-runtime-agent.js";
export { resolveCronStyleNow } from "./host/NexisClaw-runtime-agent.js";
export { DEFAULT_PI_COMPACTION_RESERVE_TOKENS_FLOOR } from "./host/NexisClaw-runtime-agent.js";
export { resolveDefaultAgentId, resolveSessionAgentId } from "./host/NexisClaw-runtime-agent.js";
export { resolveMemorySearchConfig } from "./host/NexisClaw-runtime-agent.js";
export {
  asToolParamsRecord,
  jsonResult,
  readNumberParam,
  readStringParam,
} from "./host/NexisClaw-runtime-agent.js";
export { SILENT_REPLY_TOKEN } from "./host/NexisClaw-runtime-session.js";
export { parseNonNegativeByteSize } from "./host/NexisClaw-runtime-config.js";
export {
  getRuntimeConfig,
  /** @deprecated Use getRuntimeConfig(), or pass the already loaded config through the call path. */
  loadConfig,
} from "./host/NexisClaw-runtime-config.js";
export { resolveStateDir } from "./host/NexisClaw-runtime-config.js";
export { resolveSessionTranscriptsDirForAgent } from "./host/NexisClaw-runtime-config.js";
export { emptyPluginConfigSchema } from "./host/NexisClaw-runtime-memory.js";
export {
  buildActiveMemoryPromptSection,
  getMemoryCapabilityRegistration,
  listActiveMemoryPublicArtifacts,
} from "./host/NexisClaw-runtime-memory.js";
export { parseAgentSessionKey } from "./host/NexisClaw-runtime-agent.js";
export type { NexisClawConfig } from "./host/NexisClaw-runtime-config.js";
export type { MemoryCitationsMode } from "./host/NexisClaw-runtime-config.js";
export type {
  MemoryFlushPlan,
  MemoryFlushPlanResolver,
  MemoryPluginCapability,
  MemoryPluginPublicArtifact,
  MemoryPluginPublicArtifactsProvider,
  MemoryPluginRuntime,
  MemoryPromptSectionBuilder,
} from "./host/NexisClaw-runtime-memory.js";
export type { NexisClawPluginApi } from "./host/NexisClaw-runtime-memory.js";
