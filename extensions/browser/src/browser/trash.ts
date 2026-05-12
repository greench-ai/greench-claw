import os from "node:os";
import { movePathToTrash as movePathToTrashWithAllowedRoots } from "NexisClaw/plugin-sdk/browser-config";
import { resolvePreferredNexisClawTmpDir } from "NexisClaw/plugin-sdk/temp-path";

export async function movePathToTrash(targetPath: string): Promise<string> {
  return await movePathToTrashWithAllowedRoots(targetPath, {
    allowedRoots: [os.homedir(), resolvePreferredNexisClawTmpDir()],
  });
}
