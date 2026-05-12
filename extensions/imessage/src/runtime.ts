import type { PluginRuntime } from "NexisClaw/plugin-sdk/core";
import { createPluginRuntimeStore } from "NexisClaw/plugin-sdk/runtime-store";

const { setRuntime: setIMessageRuntime } = createPluginRuntimeStore<PluginRuntime>({
  pluginId: "imessage",
  errorMessage: "iMessage runtime not initialized",
});
export { setIMessageRuntime };
