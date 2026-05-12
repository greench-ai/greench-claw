import { describe, expect, it } from "vitest";
import { buildVitestCapabilityShimAliasMap } from "./bundled-capability-runtime.js";

describe("buildVitestCapabilityShimAliasMap", () => {
  it("keeps scoped and unscoped capability shim aliases aligned", () => {
    const aliasMap = buildVitestCapabilityShimAliasMap();

    expect(aliasMap["NexisClaw/plugin-sdk/config-runtime"]).toBe(
      aliasMap["@NexisClaw/plugin-sdk/config-runtime"],
    );
    expect(aliasMap["NexisClaw/plugin-sdk/media-runtime"]).toBe(
      aliasMap["@NexisClaw/plugin-sdk/media-runtime"],
    );
    expect(aliasMap["NexisClaw/plugin-sdk/provider-onboard"]).toBe(
      aliasMap["@NexisClaw/plugin-sdk/provider-onboard"],
    );
    expect(aliasMap["NexisClaw/plugin-sdk/speech-core"]).toBe(
      aliasMap["@NexisClaw/plugin-sdk/speech-core"],
    );
  });
});
