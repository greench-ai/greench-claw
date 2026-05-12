import { describePluginRegistrationContract } from "NexisClaw/plugin-sdk/plugin-test-contracts";

describePluginRegistrationContract({
  pluginId: "opencode",
  providerIds: ["opencode"],
  mediaUnderstandingProviderIds: ["opencode"],
  requireDescribeImages: true,
});
