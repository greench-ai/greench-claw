import { describeAnthropicProviderRuntimeContract } from "NexisClaw/plugin-sdk/provider-test-contracts";

describeAnthropicProviderRuntimeContract(() => import("./index.js"));
