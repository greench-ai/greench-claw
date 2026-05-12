import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { resolveCodexAppServerProtocolSource } from "../../scripts/lib/codex-app-server-protocol-source.js";
import { createScriptTestHarness } from "./test-helpers.js";

const { createTempDir } = createScriptTestHarness();
const originalNexisClawCodexRepo = process.env.NEXISCLAW_CODEX_REPO;

afterEach(() => {
  if (originalNexisClawCodexRepo === undefined) {
    delete process.env.NEXISCLAW_CODEX_REPO;
  } else {
    process.env.NEXISCLAW_CODEX_REPO = originalNexisClawCodexRepo;
  }
});

describe("codex app-server protocol source resolver", () => {
  it("uses NEXISCLAW_CODEX_REPO when provided", async () => {
    const root = createTempDir("NexisClaw-protocol-source-root-");
    const codexRepo = createTempDir("NexisClaw-protocol-source-codex-");
    createProtocolSchema(codexRepo);
    process.env.NEXISCLAW_CODEX_REPO = codexRepo;

    await expect(resolveCodexAppServerProtocolSource(root)).resolves.toEqual({
      codexRepo,
      sourceRoot: path.join(codexRepo, "codex-rs/app-server-protocol/schema"),
    });
  });

  it("finds the primary checkout sibling from a git worktree", async () => {
    const parentDir = createTempDir("NexisClaw-protocol-source-parent-");
    const primaryNexisClaw = path.join(parentDir, "NexisClaw");
    const codexRepo = path.join(parentDir, "codex");
    const worktreeRoot = createTempDir("NexisClaw-protocol-source-worktree-");
    fs.mkdirSync(path.join(primaryNexisClaw, ".git", "worktrees", "codex-harness"), {
      recursive: true,
    });
    fs.mkdirSync(worktreeRoot, { recursive: true });
    fs.writeFileSync(
      path.join(worktreeRoot, ".git"),
      `gitdir: ${path.join(primaryNexisClaw, ".git", "worktrees", "codex-harness")}\n`,
    );
    createProtocolSchema(codexRepo);
    delete process.env.NEXISCLAW_CODEX_REPO;

    await expect(resolveCodexAppServerProtocolSource(worktreeRoot)).resolves.toEqual({
      codexRepo,
      sourceRoot: path.join(codexRepo, "codex-rs/app-server-protocol/schema"),
    });
  });
});

function createProtocolSchema(codexRepo: string): void {
  fs.mkdirSync(path.join(codexRepo, "codex-rs/app-server-protocol/schema/typescript"), {
    recursive: true,
  });
}
