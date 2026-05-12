import { describeGoogleProviderRuntimeContract } from "NexisClaw/plugin-sdk/provider-test-contracts";

describeGoogleProviderRuntimeContract(() => import("./index.js"));
