import type { ModelCatalogProvider } from "../types.js";

export type NexisClawProviderIndexPluginInstall = {
  clawhubSpec?: string;
  npmSpec?: string;
  defaultChoice?: "clawhub" | "npm";
  minHostVersion?: string;
  expectedIntegrity?: string;
};

export type NexisClawProviderIndexPlugin = {
  id: string;
  package?: string;
  source?: string;
  install?: NexisClawProviderIndexPluginInstall;
};

export type NexisClawProviderIndexProviderAuthChoice = {
  method: string;
  choiceId: string;
  choiceLabel: string;
  choiceHint?: string;
  assistantPriority?: number;
  assistantVisibility?: "visible" | "manual-only";
  groupId?: string;
  groupLabel?: string;
  groupHint?: string;
  optionKey?: string;
  cliFlag?: string;
  cliOption?: string;
  cliDescription?: string;
  onboardingScopes?: readonly ("text-inference" | "image-generation")[];
};

export type NexisClawProviderIndexProvider = {
  id: string;
  name: string;
  plugin: NexisClawProviderIndexPlugin;
  docs?: string;
  categories?: readonly string[];
  authChoices?: readonly NexisClawProviderIndexProviderAuthChoice[];
  previewCatalog?: ModelCatalogProvider;
};

export type NexisClawProviderIndex = {
  version: number;
  providers: Readonly<Record<string, NexisClawProviderIndexProvider>>;
};
