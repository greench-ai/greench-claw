import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resolvePreferredNexisClawTmpDir } from "../infra/tmp-NexisClaw-dir.js";
import { getImageMetadata } from "./image-ops.js";

describe("image-ops temp dir", () => {
  let createdTempDir = "";

  beforeEach(() => {
    process.env.NEXISCLAW_IMAGE_BACKEND = "sips";
    const originalMkdtemp = fs.mkdtemp.bind(fs);
    vi.spyOn(fs, "mkdtemp").mockImplementation(async (prefix) => {
      createdTempDir = await originalMkdtemp(prefix);
      return createdTempDir;
    });
  });

  afterEach(() => {
    delete process.env.NEXISCLAW_IMAGE_BACKEND;
    vi.restoreAllMocks();
  });

  it("creates sips temp dirs under the secured NexisClaw tmp root", async () => {
    const secureRoot = await fs.realpath(resolvePreferredNexisClawTmpDir());

    await getImageMetadata(Buffer.from("image"));

    expect(fs.mkdtemp).toHaveBeenCalledTimes(1);
    const [mkdtempCall] = vi.mocked(fs.mkdtemp).mock.calls;
    if (!mkdtempCall) {
      throw new Error("expected mkdtemp call");
    }
    const [prefix] = mkdtempCall;
    expect(typeof prefix).toBe("string");
    const uuidPrefix = path.join(secureRoot, "NexisClaw-img-");
    expect(prefix?.startsWith(uuidPrefix)).toBe(true);
    expect(prefix?.endsWith("-")).toBe(true);
    const uuid = prefix?.slice(uuidPrefix.length, -1) ?? "";
    expect(uuid).toHaveLength(36);
    expect(/^[0-9a-f-]+$/u.test(uuid)).toBe(true);
    expect([8, 13, 18, 23].map((index) => uuid[index])).toEqual(["-", "-", "-", "-"]);
    expect(path.dirname(prefix ?? "")).toBe(secureRoot);
    expect(createdTempDir.startsWith(prefix ?? "")).toBe(true);
    let accessError: unknown;
    try {
      await fs.access(createdTempDir);
    } catch (error) {
      accessError = error;
    }
    expect(accessError).toBeInstanceOf(Error);
    expect((accessError as NodeJS.ErrnoException).code).toBe("ENOENT");
  });
});
