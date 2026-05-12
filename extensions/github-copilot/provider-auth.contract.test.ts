import { describeGithubCopilotProviderAuthContract } from "NexisClaw/plugin-sdk/provider-test-contracts";

describeGithubCopilotProviderAuthContract(() => import("./index.js"));
