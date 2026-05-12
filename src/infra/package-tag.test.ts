import { describe, expect, it } from "vitest";
import { normalizePackageTagInput } from "./package-tag.js";

describe("normalizePackageTagInput", () => {
  const packageNames = ["NexisClaw", "@NexisClaw/plugin"] as const;

  it.each([
    { input: undefined, expected: null },
    { input: "   ", expected: null },
    { input: "NexisClaw@beta", expected: "beta" },
    { input: "@NexisClaw/plugin@2026.2.24", expected: "2026.2.24" },
    { input: "NexisClaw@   ", expected: null },
    { input: "NexisClaw", expected: null },
    { input: " @NexisClaw/plugin ", expected: null },
    { input: " latest ", expected: "latest" },
    { input: "@other/plugin@beta", expected: "@other/plugin@beta" },
    { input: "NexisClawer@beta", expected: "NexisClawer@beta" },
  ] satisfies ReadonlyArray<{ input: string | undefined; expected: string | null }>)(
    "normalizes %j",
    ({ input, expected }) => {
      expect(normalizePackageTagInput(input, packageNames)).toBe(expected);
    },
  );
});
