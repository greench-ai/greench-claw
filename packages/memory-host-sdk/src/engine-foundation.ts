// Real workspace contract for memory engine foundation concerns.

export {
  resolveAgentContextLimits,
  resolveAgentDir,
  resolveAgentWorkspaceDir,
  resolveDefaultAgentId,
  resolveSessionAgentId,
} from "./host/NexisClaw-runtime-agent.js";
export {
  resolveMemorySearchConfig,
  resolveMemorySearchSyncConfig,
  type ResolvedMemorySearchConfig,
  type ResolvedMemorySearchSyncConfig,
} from "./host/NexisClaw-runtime-agent.js";
export { parseDurationMs } from "./host/NexisClaw-runtime-config.js";
export { loadConfig } from "./host/NexisClaw-runtime-config.js";
export { resolveStateDir } from "./host/NexisClaw-runtime-config.js";
export { resolveSessionTranscriptsDirForAgent } from "./host/NexisClaw-runtime-config.js";
export {
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
} from "./host/NexisClaw-runtime-config.js";
export { root } from "./host/NexisClaw-runtime-io.js";
export { isPathInside } from "./host/fs-utils.js";
export { createSubsystemLogger } from "./host/NexisClaw-runtime-io.js";
export { detectMime } from "./host/NexisClaw-runtime-io.js";
export { resolveGlobalSingleton } from "./host/NexisClaw-runtime-io.js";
export { onSessionTranscriptUpdate } from "./host/NexisClaw-runtime-session.js";
export { splitShellArgs } from "./host/NexisClaw-runtime-io.js";
export { runTasksWithConcurrency } from "./host/NexisClaw-runtime-io.js";
export {
  shortenHomeInString,
  shortenHomePath,
  resolveUserPath,
  truncateUtf16Safe,
} from "./host/NexisClaw-runtime-io.js";
export type { NexisClawConfig } from "./host/NexisClaw-runtime-config.js";
export type { SessionSendPolicyConfig } from "./host/NexisClaw-runtime-config.js";
export type { SecretInput } from "./host/NexisClaw-runtime-config.js";
export type {
  MemoryBackend,
  MemoryCitationsMode,
  MemoryQmdConfig,
  MemoryQmdIndexPath,
  MemoryQmdMcporterConfig,
  MemoryQmdSearchMode,
} from "./host/NexisClaw-runtime-config.js";
export type { MemorySearchConfig } from "./host/NexisClaw-runtime-config.js";
