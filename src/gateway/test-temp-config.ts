import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  clearConfigCache,
  resetConfigRuntimeState,
  setRuntimeConfigSnapshot,
} from "../config/config.js";
import type { NexisClawConfig } from "../config/config.js";
import { clearSecretsRuntimeSnapshot } from "../secrets/runtime.js";

function withStableOwnerDisplaySecretForTest(cfg: unknown): unknown {
  if (!cfg || typeof cfg !== "object" || Array.isArray(cfg)) {
    return cfg;
  }
  const record = cfg as Record<string, unknown>;
  const commands =
    record.commands && typeof record.commands === "object" && !Array.isArray(record.commands)
      ? (record.commands as Record<string, unknown>)
      : {};
  if (typeof commands.ownerDisplaySecret === "string" && commands.ownerDisplaySecret.length > 0) {
    return cfg;
  }
  return {
    ...record,
    commands: {
      ...commands,
      ownerDisplaySecret: "NexisClaw-test-owner-display-secret",
    },
  };
}

export async function withTempConfig(params: {
  cfg: unknown;
  run: () => Promise<void>;
  prefix?: string;
}): Promise<void> {
  const prevConfigPath = process.env.NEXISCLAW_CONFIG_PATH;

  const testConfig = withStableOwnerDisplaySecretForTest(params.cfg) as NexisClawConfig;
  const dir = await mkdtemp(path.join(os.tmpdir(), params.prefix ?? "NexisClaw-test-config-"));
  const configPath = path.join(dir, "NexisClaw.json");

  process.env.NEXISCLAW_CONFIG_PATH = configPath;

  try {
    await writeFile(configPath, JSON.stringify(testConfig, null, 2), "utf-8");
    clearConfigCache();
    resetConfigRuntimeState();
    clearSecretsRuntimeSnapshot();
    setRuntimeConfigSnapshot(testConfig, testConfig);
    await params.run();
  } finally {
    if (prevConfigPath === undefined) {
      delete process.env.NEXISCLAW_CONFIG_PATH;
    } else {
      process.env.NEXISCLAW_CONFIG_PATH = prevConfigPath;
    }
    clearConfigCache();
    resetConfigRuntimeState();
    clearSecretsRuntimeSnapshot();
    await rm(dir, { recursive: true, force: true });
  }
}
