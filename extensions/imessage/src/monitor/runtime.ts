import { createNonExitingRuntime, type RuntimeEnv } from "NexisClaw/plugin-sdk/runtime-env";
import { normalizeStringEntries } from "NexisClaw/plugin-sdk/string-coerce-runtime";
import type { MonitorIMessageOpts } from "./types.js";

export function resolveRuntime(opts: MonitorIMessageOpts): RuntimeEnv {
  return opts.runtime ?? createNonExitingRuntime();
}

export function normalizeAllowList(list?: Array<string | number>) {
  return normalizeStringEntries(list);
}
