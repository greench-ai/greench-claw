export type NexisClawPiCodingAgentSkillSourceAugmentation = never;

declare module "@earendil-works/pi-coding-agent" {
  interface Skill {
    // NexisClaw relies on the source identifier returned by pi skill loaders.
    source: string;
  }
}
