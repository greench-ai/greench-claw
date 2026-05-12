const COMMON_LIVE_ENV_NAMES = [
  "NEXISCLAW_AGENT_RUNTIME",
  "NEXISCLAW_CONFIG_PATH",
  "NEXISCLAW_GATEWAY_TOKEN",
  "OPENAI_API_KEY",
  "OPENAI_BASE_URL",
  "NEXISCLAW_SKIP_BROWSER_CONTROL_SERVER",
  "NEXISCLAW_SKIP_CANVAS_HOST",
  "NEXISCLAW_SKIP_CHANNELS",
  "NEXISCLAW_SKIP_CRON",
  "NEXISCLAW_SKIP_GMAIL_WATCHER",
  "NEXISCLAW_STATE_DIR",
] as const;

export type LiveEnvSnapshot = Record<string, string | undefined>;

export function snapshotLiveEnv(extraNames: readonly string[] = []): LiveEnvSnapshot {
  const snapshot: LiveEnvSnapshot = {};
  for (const name of [...COMMON_LIVE_ENV_NAMES, ...extraNames]) {
    snapshot[name] = process.env[name];
  }
  return snapshot;
}

export function restoreLiveEnv(snapshot: LiveEnvSnapshot): void {
  for (const [name, value] of Object.entries(snapshot)) {
    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }
}
