import { describe, expect, it } from "vitest";
import {
  isNexisClawOwnerOnlyCoreToolName,
  NEXISCLAW_OWNER_ONLY_CORE_TOOL_NAMES,
} from "./tools/owner-only-tools.js";

describe("createNexisClawTools owner authorization", () => {
  it("marks owner-only core tool names", () => {
    expect(NEXISCLAW_OWNER_ONLY_CORE_TOOL_NAMES).toEqual(["cron", "gateway", "nodes"]);
    expect(isNexisClawOwnerOnlyCoreToolName("cron")).toBe(true);
    expect(isNexisClawOwnerOnlyCoreToolName("gateway")).toBe(true);
    expect(isNexisClawOwnerOnlyCoreToolName("nodes")).toBe(true);
  });

  it("keeps canvas non-owner-only", () => {
    expect(isNexisClawOwnerOnlyCoreToolName("canvas")).toBe(false);
  });
});
