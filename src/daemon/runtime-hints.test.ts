import { describe, expect, it } from "vitest";
import { buildPlatformRuntimeLogHints, buildPlatformServiceStartHints } from "./runtime-hints.js";

describe("buildPlatformRuntimeLogHints", () => {
  it("renders launchd log hints on darwin", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        env: {
          NEXISCLAW_STATE_DIR: "/tmp/NexisClaw-state",
          NEXISCLAW_LOG_PREFIX: "gateway",
        },
        systemdServiceName: "NexisClaw-gateway",
        windowsTaskName: "NexisClaw Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /tmp/NexisClaw-state/logs/gateway.log",
      "Launchd stderr (if installed): suppressed",
      "Restart attempts: /tmp/NexisClaw-state/logs/gateway-restart.log",
    ]);
  });

  it("renders systemd and windows hints by platform", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "linux",
        env: {
          NEXISCLAW_STATE_DIR: "/tmp/NexisClaw-state",
        },
        systemdServiceName: "NexisClaw-gateway",
        windowsTaskName: "NexisClaw Gateway",
      }),
    ).toEqual([
      "Logs: journalctl --user -u NexisClaw-gateway.service -n 200 --no-pager",
      "Restart attempts: /tmp/NexisClaw-state/logs/gateway-restart.log",
    ]);
    expect(
      buildPlatformRuntimeLogHints({
        platform: "win32",
        env: {
          NEXISCLAW_STATE_DIR: "/tmp/NexisClaw-state",
        },
        systemdServiceName: "NexisClaw-gateway",
        windowsTaskName: "NexisClaw Gateway",
      }),
    ).toEqual([
      'Logs: schtasks /Query /TN "NexisClaw Gateway" /V /FO LIST',
      "Restart attempts: /tmp/NexisClaw-state/logs/gateway-restart.log",
    ]);
  });
});

describe("buildPlatformServiceStartHints", () => {
  it("builds platform-specific service start hints", () => {
    expect(
      buildPlatformServiceStartHints({
        platform: "darwin",
        installCommand: "NexisClaw gateway install",
        startCommand: "NexisClaw gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.NexisClaw.gateway.plist",
        systemdServiceName: "NexisClaw-gateway",
        windowsTaskName: "NexisClaw Gateway",
      }),
    ).toEqual([
      "NexisClaw gateway install",
      "NexisClaw gateway",
      "launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.NexisClaw.gateway.plist",
    ]);
    expect(
      buildPlatformServiceStartHints({
        platform: "linux",
        installCommand: "NexisClaw gateway install",
        startCommand: "NexisClaw gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.NexisClaw.gateway.plist",
        systemdServiceName: "NexisClaw-gateway",
        windowsTaskName: "NexisClaw Gateway",
      }),
    ).toEqual([
      "NexisClaw gateway install",
      "NexisClaw gateway",
      "systemctl --user start NexisClaw-gateway.service",
    ]);
  });
});
