import { pluginRegistrationContractCases } from "NexisClaw/plugin-sdk/plugin-test-contracts";
import { describePluginRegistrationContract } from "NexisClaw/plugin-sdk/plugin-test-contracts";

describePluginRegistrationContract({
  ...pluginRegistrationContractCases.google,
  speechProviderIds: ["google"],
  videoGenerationProviderIds: ["google"],
  webSearchProviderIds: ["gemini"],
  requireDescribeImages: true,
  requireGenerateImage: true,
  requireGenerateVideo: true,
});
