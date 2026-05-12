import type { PluginRuntime } from "NexisClaw/plugin-sdk/core";
import { createPluginRuntimeStore } from "NexisClaw/plugin-sdk/runtime-store";

const { setRuntime: setSignalRuntime, clearRuntime: clearSignalRuntime } =
  createPluginRuntimeStore<PluginRuntime>({
    pluginId: "signal",
    errorMessage: "Signal runtime not initialized",
  });
export { clearSignalRuntime, setSignalRuntime };
