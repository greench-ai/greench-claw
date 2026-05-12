import { describePluginRegistrationContract } from "NexisClaw/plugin-sdk/plugin-test-contracts";

describePluginRegistrationContract({
  pluginId: "runway",
  videoGenerationProviderIds: ["runway"],
  requireGenerateVideo: true,
});
