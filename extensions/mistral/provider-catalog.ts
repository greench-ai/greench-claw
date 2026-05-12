import { buildManifestModelProviderConfig } from "NexisClaw/plugin-sdk/provider-catalog-shared";
import type { ModelProviderConfig } from "NexisClaw/plugin-sdk/provider-model-shared";
import manifest from "./NexisClaw.plugin.json" with { type: "json" };

export function buildMistralProvider(): ModelProviderConfig {
  return buildManifestModelProviderConfig({
    providerId: "mistral",
    catalog: manifest.modelCatalog.providers.mistral,
  });
}
