import { describePluginRegistrationContract } from "NexisClaw/plugin-sdk/plugin-test-contracts";

describePluginRegistrationContract({
  pluginId: "fal",
  providerIds: ["fal"],
  imageGenerationProviderIds: ["fal"],
  videoGenerationProviderIds: ["fal"],
  requireGenerateImage: true,
  requireGenerateVideo: true,
});
