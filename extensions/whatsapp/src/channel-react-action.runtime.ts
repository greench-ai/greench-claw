import { readStringOrNumberParam, readStringParam } from "NexisClaw/plugin-sdk/channel-actions";
import type { NexisClawConfig } from "NexisClaw/plugin-sdk/config-contracts";

export { resolveReactionMessageId } from "NexisClaw/plugin-sdk/channel-actions";
export { handleWhatsAppAction } from "./action-runtime.js";
export { isWhatsAppGroupJid, normalizeWhatsAppTarget } from "./normalize.js";
export { readStringOrNumberParam, readStringParam, type NexisClawConfig };
