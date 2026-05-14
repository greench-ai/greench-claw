/**
 * GreenchHostTools — tools for executing on the WSL2/Linux host machine.
 *
 * This plugin provides the host_bash tool which runs shell commands on the
 * WSL2 host (outside the sandboxed environment), enabling file operations
 * on the host filesystem, git operations, npm commands, docker commands, etc.
 */

import { spawn } from "node:child_process";
import { definePluginEntry, type GreenchClawPluginApi } from "GreenchClaw/plugin-sdk/plugin-entry";

// ── Tool Implementation ──────────────────────────────────────────────────────

async function runHostBash(
  command: string,
  timeout: number = 30,
): Promise<{ output: string; error: string | null }> {
  return new Promise((resolve) => {
    const isWindows = process.platform === "win32";

    let proc;
    if (isWindows) {
      // On Windows (WSL2 scenario), use wsl -e bash -c
      proc = spawn("wsl", ["-e", "bash", "-c", command], {
        timeout: timeout * 1000,
        shell: false,
      });
    } else {
      // On native Linux, try wsl -e bash -c (WSL2 host scenario) or bash -c directly
      proc = spawn("wsl", ["-e", "bash", "-c", command], {
        timeout: timeout * 1000,
        shell: false,
      });
    }

    let stdout = "";
    let stderr = "";

    proc.stdout?.on("data", (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on("data", (data) => {
      stderr += data.toString();
    });

    proc.on("close", (code) => {
      const output = (stdout || "").slice(0, 5000);
      const err = (stderr || "").slice(0, 1000);
      resolve({ output, error: code === 0 ? null : err || `Exit code: ${code}` });
    });

    proc.on("error", (err) => {
      resolve({ output: "", error: err.message });
    });

    // Timeout handling
    setTimeout(
      () => {
        proc.kill("SIGKILL");
        resolve({ output: stdout.slice(0, 5000), error: `Command timed out after ${timeout}s` });
      },
      timeout * 1000 + 1000,
    );
  });
}

// ── Plugin Entry ─────────────────────────────────────────────────────────────

export default definePluginEntry({
  id: "greench-host-tools",
  name: "GreenchHostTools",
  description: "Host machine tools — run commands on the WSL2/Linux host outside the sandbox.",
  async register(api: GreenchClawPluginApi) {
    api.logger.info?.("greench-host-tools: registering host_bash tool");

    try {
      api.runtime.agent.tools.register?.({
        id: "host_bash",
        description:
          "Execute a shell command on the WSL2/Linux host machine (outside the sandbox). Use for file operations on the host filesystem (/home/greench/), git operations, npm, docker commands on host, etc.",
        inputSchema: {
          type: "object",
          properties: {
            command: {
              type: "string",
              description: "Shell command to run on the host machine",
            },
            timeout: {
              type: "number",
              description: "Timeout in seconds (default 30)",
              default: 30,
            },
          },
          required: ["command"],
        },
        async handler(args: Record<string, unknown>) {
          const command = String(args.command ?? "");
          const timeout = Number(args.timeout ?? 30);

          if (!command.trim()) {
            return { success: false, output: "", error: "Empty command" };
          }

          api.logger.debug?.("greench-host-tools: host_bash", { command, timeout });

          try {
            const { output, error } = await runHostBash(command, timeout);
            return {
              success: error === null,
              output,
              error,
            };
          } catch (err) {
            return { success: false, output: "", error: String(err) };
          }
        },
      });

      api.logger.info?.("greench-host-tools: host_bash registered");
    } catch (err) {
      api.logger.error?.("greench-host-tools: failed to register", { error: String(err) });
    }
  },
  tools: {
    host_bash: {
      description:
        "Execute a shell command on the WSL2/Linux host machine (outside the sandbox). Use for /home/greench/ file operations, git, npm, docker on host.",
      inputSchema: {
        type: "object",
        properties: {
          command: { type: "string", description: "Shell command to run on the host" },
          timeout: { type: "number", description: "Timeout in seconds (default 30)", default: 30 },
        },
        required: ["command"],
      },
    },
  },
});
