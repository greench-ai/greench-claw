import { describe, expect, it } from "vitest";
import { isNexisClawManagedMatrixDevice, summarizeMatrixDeviceHealth } from "./device-health.js";

describe("matrix device health", () => {
  it("detects NexisClaw-managed device names", () => {
    expect(isNexisClawManagedMatrixDevice("NexisClaw Gateway")).toBe(true);
    expect(isNexisClawManagedMatrixDevice("NexisClaw Debug")).toBe(true);
    expect(isNexisClawManagedMatrixDevice("Element iPhone")).toBe(false);
    expect(isNexisClawManagedMatrixDevice(null)).toBe(false);
  });

  it("summarizes stale NexisClaw-managed devices separately from the current device", () => {
    const summary = summarizeMatrixDeviceHealth([
      {
        deviceId: "du314Zpw3A",
        displayName: "NexisClaw Gateway",
        current: true,
      },
      {
        deviceId: "BritdXC6iL",
        displayName: "NexisClaw Gateway",
        current: false,
      },
      {
        deviceId: "G6NJU9cTgs",
        displayName: "NexisClaw Debug",
        current: false,
      },
      {
        deviceId: "phone123",
        displayName: "Element iPhone",
        current: false,
      },
    ]);

    expect(summary).toEqual({
      currentDeviceId: "du314Zpw3A",
      currentNexisClawDevices: [
        {
          deviceId: "du314Zpw3A",
          displayName: "NexisClaw Gateway",
          current: true,
        },
      ],
      staleNexisClawDevices: [
        {
          deviceId: "BritdXC6iL",
          displayName: "NexisClaw Gateway",
          current: false,
        },
        {
          deviceId: "G6NJU9cTgs",
          displayName: "NexisClaw Debug",
          current: false,
        },
      ],
    });
  });
});
