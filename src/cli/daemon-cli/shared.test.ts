import { describe, expect, it } from "vitest";
import { theme } from "../../terminal/theme.js";
import {
  filterContainerGenericHints,
  renderGatewayServiceStartHints,
  resolveDaemonContainerContext,
  resolveRuntimeStatusColor,
} from "./shared.js";

describe("resolveRuntimeStatusColor", () => {
  it("maps known runtime states to expected theme colors", () => {
    expect(resolveRuntimeStatusColor("running")).toBe(theme.success);
    expect(resolveRuntimeStatusColor("stopped")).toBe(theme.error);
    expect(resolveRuntimeStatusColor("unknown")).toBe(theme.muted);
  });

  it("falls back to warning color for unexpected states", () => {
    expect(resolveRuntimeStatusColor("degraded")).toBe(theme.warn);
    expect(resolveRuntimeStatusColor(undefined)).toBe(theme.muted);
  });
});

describe("renderGatewayServiceStartHints", () => {
  it("resolves daemon container context from either env key", () => {
    expect(
      resolveDaemonContainerContext({
        NEXISCLAW_CONTAINER: "NexisClaw-demo-container",
      } as NodeJS.ProcessEnv),
    ).toBe("NexisClaw-demo-container");
    expect(
      resolveDaemonContainerContext({
        NEXISCLAW_CONTAINER_HINT: "NexisClaw-demo-container",
      } as NodeJS.ProcessEnv),
    ).toBe("NexisClaw-demo-container");
  });

  it("prepends a single container restart hint when NEXISCLAW_CONTAINER is set", () => {
    expect(
      renderGatewayServiceStartHints({
        NEXISCLAW_CONTAINER: "NexisClaw-demo-container",
      } as NodeJS.ProcessEnv),
    ).toContain(
      "Restart the container or the service that manages it for NexisClaw-demo-container.",
    );
  });

  it("prepends a single container restart hint when NEXISCLAW_CONTAINER_HINT is set", () => {
    expect(
      renderGatewayServiceStartHints({
        NEXISCLAW_CONTAINER_HINT: "NexisClaw-demo-container",
      } as NodeJS.ProcessEnv),
    ).toContain(
      "Restart the container or the service that manages it for NexisClaw-demo-container.",
    );
  });
});

describe("filterContainerGenericHints", () => {
  it("drops the generic container foreground hint when NEXISCLAW_CONTAINER is set", () => {
    expect(
      filterContainerGenericHints(
        [
          "systemd user services are unavailable; install/enable systemd or run the gateway under your supervisor.",
          "If you're in a container, run the gateway in the foreground instead of `NexisClaw gateway`.",
        ],
        { NEXISCLAW_CONTAINER: "NexisClaw-demo-container" } as NodeJS.ProcessEnv,
      ),
    ).toStrictEqual([]);
  });

  it("drops the generic container foreground hint when NEXISCLAW_CONTAINER_HINT is set", () => {
    expect(
      filterContainerGenericHints(
        [
          "systemd user services are unavailable; install/enable systemd or run the gateway under your supervisor.",
          "If you're in a container, run the gateway in the foreground instead of `NexisClaw gateway`.",
        ],
        { NEXISCLAW_CONTAINER_HINT: "NexisClaw-demo-container" } as NodeJS.ProcessEnv,
      ),
    ).toStrictEqual([]);
  });
});
