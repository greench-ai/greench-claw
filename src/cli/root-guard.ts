import process from "node:process";

/**
 * Block CLI execution when running as root (uid 0 or euid 0) unless explicitly opted in.
 *
 * Running as root causes:
 * - Separate state dir (/root/.NexisClaw/ vs /home/<user>/.NexisClaw/)
 * - Conflicting systemd user services (port 18789 race)
 * - Root-owned files in the service user's state dir (EACCES)
 */
export function assertNotRoot(env: NodeJS.ProcessEnv = process.env): void {
  if (typeof process.getuid !== "function") {
    return;
  }
  const uid = process.getuid();
  const euid = typeof process.geteuid === "function" ? process.geteuid() : uid;
  if (uid !== 0 && euid !== 0) {
    return;
  }
  if (
    env.NEXISCLAW_ALLOW_ROOT === "1" ||
    (env.NEXISCLAW_CLI_CONTAINER_BYPASS === "1" && env.NEXISCLAW_CONTAINER_HINT)
  ) {
    return;
  }
  process.stderr.write(
    "[NexisClaw] Refusing to run as root.\n" +
      "\n" +
      "Why this is blocked:\n" +
      "  - A separate state directory under /root/.NexisClaw/ instead of the service user's\n" +
      "  - Conflicting systemd user services that race on port 18789\n" +
      "  - Root-owned files in the service user's state dir (EACCES errors)\n" +
      "\n" +
      "What to do:\n" +
      "  - Re-run as the service user: sudo -u <service-user> -H NexisClaw ...\n" +
      "  - Or switch shells first: su - <service-user>\n" +
      "\n" +
      "Intentional container/CI run only:\n" +
      "  NEXISCLAW_ALLOW_ROOT=1 NexisClaw ...\n",
  );
  process.exit(1);
}
