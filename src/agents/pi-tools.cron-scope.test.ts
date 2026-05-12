import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnyAgentTool } from "./tools/common.js";

const mocks = vi.hoisted(() => {
  const stubTool = (name: string, ownerOnly = false) =>
    ({
      name,
      label: name,
      displaySummary: name,
      description: name,
      ownerOnly,
      parameters: { type: "object", properties: {} },
      execute: vi.fn(),
    }) satisfies AnyAgentTool;

  return {
    createNexisClawToolsOptions: vi.fn(),
    stubTool,
  };
});

vi.mock("./NexisClaw-tools.js", () => ({
  createNexisClawTools: (options: unknown) => {
    mocks.createNexisClawToolsOptions(options);
    return [mocks.stubTool("cron", true)];
  },
}));

import "./test-helpers/fast-bash-tools.js";
import "./test-helpers/fast-coding-tools.js";
import { createNexisClawCodingTools } from "./pi-tools.js";

describe("createNexisClawCodingTools cron scope", () => {
  beforeEach(() => {
    mocks.createNexisClawToolsOptions.mockClear();
  });

  it("scopes the cron owner-only runtime grant to self-removal", () => {
    const tools = createNexisClawCodingTools({
      trigger: "cron",
      jobId: "job-current",
      senderIsOwner: false,
      ownerOnlyToolAllowlist: ["cron"],
    });

    expect(tools.map((tool) => tool.name)).toContain("cron");
    const [options] = mocks.createNexisClawToolsOptions.mock.calls.at(0) ?? [];
    expect(options?.cronSelfRemoveOnlyJobId).toBe("job-current");
  });

  it("does not scope ordinary owner cron sessions", () => {
    createNexisClawCodingTools({
      trigger: "cron",
      jobId: "job-current",
      senderIsOwner: true,
    });

    const [options] = mocks.createNexisClawToolsOptions.mock.calls.at(0) ?? [];
    expect(options?.cronSelfRemoveOnlyJobId).toBeUndefined();
  });
});
