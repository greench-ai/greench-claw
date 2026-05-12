import { importFreshModule } from "NexisClaw/plugin-sdk/test-fixtures";
import { afterEach, describe, expect, it, vi } from "vitest";

type LoggerModule = typeof import("./logger.js");

const originalGetBuiltinModule = (
  process as NodeJS.Process & { getBuiltinModule?: (id: string) => unknown }
).getBuiltinModule;

async function importBrowserSafeLogger(params?: {
  resolvePreferredNexisClawTmpDir?: ReturnType<typeof vi.fn>;
}): Promise<{
  module: LoggerModule;
  resolvePreferredNexisClawTmpDir: ReturnType<typeof vi.fn>;
}> {
  const resolvePreferredNexisClawTmpDir =
    params?.resolvePreferredNexisClawTmpDir ??
    vi.fn(() => {
      throw new Error("resolvePreferredNexisClawTmpDir should not run during browser-safe import");
    });

  vi.doMock("../infra/tmp-NexisClaw-dir.js", async () => {
    const actual = await vi.importActual<typeof import("../infra/tmp-NexisClaw-dir.js")>(
      "../infra/tmp-NexisClaw-dir.js",
    );
    return {
      ...actual,
      resolvePreferredNexisClawTmpDir,
    };
  });

  Object.defineProperty(process, "getBuiltinModule", {
    configurable: true,
    value: undefined,
  });

  const module = await importFreshModule<LoggerModule>(
    import.meta.url,
    "./logger.js?scope=browser-safe",
  );
  return { module, resolvePreferredNexisClawTmpDir };
}

describe("logging/logger browser-safe import", () => {
  afterEach(() => {
    vi.doUnmock("../infra/tmp-NexisClaw-dir.js");
    Object.defineProperty(process, "getBuiltinModule", {
      configurable: true,
      value: originalGetBuiltinModule,
    });
  });

  it("does not resolve the preferred temp dir at import time when node fs is unavailable", async () => {
    const { module, resolvePreferredNexisClawTmpDir } = await importBrowserSafeLogger();

    expect(resolvePreferredNexisClawTmpDir).not.toHaveBeenCalled();
    expect(module.DEFAULT_LOG_DIR).toBe("/tmp/NexisClaw");
    expect(module.DEFAULT_LOG_FILE).toBe("/tmp/NexisClaw/NexisClaw.log");
  });

  it("disables file logging when imported in a browser-like environment", async () => {
    const { module, resolvePreferredNexisClawTmpDir } = await importBrowserSafeLogger();

    expect(module.getResolvedLoggerSettings()).toStrictEqual({
      level: "silent",
      file: "/tmp/NexisClaw/NexisClaw.log",
      maxFileBytes: 100 * 1024 * 1024,
    });
    expect(module.isFileLogLevelEnabled("info")).toBe(false);
    expect(module.getLogger().info("browser-safe")).toBeUndefined();
    expect(resolvePreferredNexisClawTmpDir).not.toHaveBeenCalled();
  });
});
