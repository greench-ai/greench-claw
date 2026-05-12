import { describeGithubCopilotProviderRuntimeContract } from "NexisClaw/plugin-sdk/provider-test-contracts";

describeGithubCopilotProviderRuntimeContract(() => import("./index.js"));
