import type { PluginRuntime } from "NexisClaw/plugin-sdk/plugin-runtime";
import { createPluginRuntimeStore } from "NexisClaw/plugin-sdk/runtime-store";

const { setRuntime: setTlonRuntime, getRuntime: getTlonRuntime } =
  createPluginRuntimeStore<PluginRuntime>({
    pluginId: "tlon",
    errorMessage: "Tlon runtime not initialized",
  });
export { getTlonRuntime, setTlonRuntime };
