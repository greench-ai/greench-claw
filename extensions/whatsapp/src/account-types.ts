import type { NexisClawConfig } from "NexisClaw/plugin-sdk/config-contracts";

export type WhatsAppAccountConfig = NonNullable<
  NonNullable<NonNullable<NexisClawConfig["channels"]>["whatsapp"]>["accounts"]
>[string];
