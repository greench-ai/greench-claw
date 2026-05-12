import { describeVeniceProviderRuntimeContract } from "NexisClaw/plugin-sdk/provider-test-contracts";

describeVeniceProviderRuntimeContract(() => import("./index.js"));
