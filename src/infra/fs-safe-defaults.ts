import { configureFsSafePython } from "@NexisClaw/fs-safe/config";

const hasPythonModeOverride =
  process.env.FS_SAFE_PYTHON_MODE != null || process.env.NEXISCLAW_FS_SAFE_PYTHON_MODE != null;

if (!hasPythonModeOverride) {
  configureFsSafePython({ mode: "off" });
}
