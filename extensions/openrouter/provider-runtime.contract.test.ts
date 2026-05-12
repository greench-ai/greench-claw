import { describeOpenRouterProviderRuntimeContract } from "NexisClaw/plugin-sdk/provider-test-contracts";

describeOpenRouterProviderRuntimeContract(() => import("./index.js"));
