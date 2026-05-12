import { describeOpenAIProviderRuntimeContract } from "NexisClaw/plugin-sdk/provider-test-contracts";

describeOpenAIProviderRuntimeContract(() => import("./index.js"));
