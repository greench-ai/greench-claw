import type { ChannelDoctorConfigMutation } from "NexisClaw/plugin-sdk/channel-contract";
import type { NexisClawConfig } from "NexisClaw/plugin-sdk/config-contracts";
import { normalizeCompatibilityConfig as normalizeCompatibilityConfigImpl } from "./doctor.js";

export function normalizeCompatibilityConfig({
  cfg,
}: {
  cfg: NexisClawConfig;
}): ChannelDoctorConfigMutation {
  return normalizeCompatibilityConfigImpl({ cfg });
}
