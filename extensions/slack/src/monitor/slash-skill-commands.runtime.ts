import { listSkillCommandsForAgents as listSkillCommandsForAgentsImpl } from "NexisClaw/plugin-sdk/command-auth-native";

type ListSkillCommandsForAgents =
  typeof import("NexisClaw/plugin-sdk/command-auth-native").listSkillCommandsForAgents;

export function listSkillCommandsForAgents(
  ...args: Parameters<ListSkillCommandsForAgents>
): ReturnType<ListSkillCommandsForAgents> {
  return listSkillCommandsForAgentsImpl(...args);
}
