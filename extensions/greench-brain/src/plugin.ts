/**
 * GreenchBrain — semantic memory (brain) plugin using Qdrant.
 *
 * Provides persistent, searchable memory for the agent:
 * - add_memory(text, user_id, metadata)
 * - search_memories(query, user_id, limit)
 * - get_memories(user_id)
 * - delete_memory(memory_id, user_id)
 *
 * Uses a dedicated Qdrant collection (greench_brain) with Ollama embeddings.
 */

import crypto from "node:crypto";
import { definePluginEntry, type GreenchClawPluginApi } from "GreenchClaw/plugin-sdk/plugin-entry";

// ── Config ────────────────────────────────────────────────────────────────────

interface BrainConfig {
  qdrantHost: string;
  qdrantPort: number;
  ollamaUrl: string;
  embeddingModel: string;
  collection: string;
}

const DEFAULT_BRAIN_CONFIG: BrainConfig = {
  qdrantHost: "localhost",
  qdrantPort: 6333,
  ollamaUrl: "http://localhost:11434",
  embeddingModel: "nomic-embed-text:v1.5",
  collection: "greench_brain",
};

// ── Qdrant helpers ────────────────────────────────────────────────────────────

// ── Qdrant REST API (no extra deps) ─────────────────────────────────────────

function qdrantUrl(cfg: BrainConfig, path: string): string {
  return `http://${cfg.qdrantHost}:${cfg.qdrantPort}${path}`;
}

async function qdrantRequest<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const resp = await fetch(url, {
    ...opts,
    headers: { "Content-Type": "application/json", ...opts.headers },
  });
  if (!resp.ok) throw new Error(`Qdrant ${resp.status}: ${await resp.text().catch(() => "")}`);
  return resp.json() as Promise<T>;
}

async function ensureBrainCollection(cfg: BrainConfig): Promise<void> {
  try {
    const data = await qdrantRequest<{ collections: Array<{ name: string }> }>(
      qdrantUrl(cfg, "/collections"),
    );
    if (!data.collections.some((c) => c.name === cfg.collection)) {
      await qdrantRequest(qdrantUrl(cfg, `/collections/${cfg.collection}`), {
        method: "PUT",
        body: JSON.stringify({ vectors: { size: 768, distance: "Cosine" } }),
      });
    }
  } catch {
    // May already exist
  }
}

async function brainUpsert(
  cfg: BrainConfig,
  point: {
    id: number;
    vector: number[];
    payload: Record<string, unknown>;
  },
): Promise<void> {
  await ensureBrainCollection(cfg);
  await qdrantRequest(qdrantUrl(cfg, `/collections/${cfg.collection}/points`), {
    method: "PUT",
    body: JSON.stringify({ points: [point] }),
  });
}

async function doBrainSearch(
  cfg: BrainConfig,
  queryVector: number[],
  userId: string,
  limit: number,
) {
  await ensureBrainCollection(cfg);
  const data = await qdrantRequest<{
    result: Array<{ id: number; score: number; payload: Record<string, unknown> }>;
  }>(qdrantUrl(cfg, `/collections/${cfg.collection}/points/query`), {
    method: "POST",
    body: JSON.stringify({
      query: queryVector,
      limit,
      filter: { must: [{ key: "user_id", match: { value: userId } }] },
    }),
  });
  return data.result ?? [];
}

async function brainFetchAll(cfg: BrainConfig, userId: string, limit: number) {
  await ensureBrainCollection(cfg);
  const data = await qdrantRequest<{
    result: Array<{ id: number; score: number; payload: Record<string, unknown> }>;
  }>(qdrantUrl(cfg, `/collections/${cfg.collection}/points/query`), {
    method: "POST",
    body: JSON.stringify({
      query: new Array(768).fill(0),
      limit,
      filter: { must: [{ key: "user_id", match: { value: userId } }] },
    }),
  });
  return data.result ?? [];
}

async function brainDeletePoint(cfg: BrainConfig, pointId: number): Promise<void> {
  await qdrantRequest(qdrantUrl(cfg, `/collections/${cfg.collection}/points/delete`), {
    method: "POST",
    body: JSON.stringify({ points: [pointId] }),
  });
}

// ── Memory Store (file-based metadata) ──────────────────────────────────────

async function embedText(text: string, baseUrl: string, model: string): Promise<number[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const resp = await fetch(`${baseUrl}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt: text }),
      signal: controller.signal,
    });
    if (!resp.ok) throw new Error(`Embedding failed: ${resp.status}`);
    const data = (await resp.json()) as { embedding?: number[] };
    return data.embedding ?? [];
  } finally {
    clearTimeout(timeout);
  }
}

// ── Brain Operations ─────────────────────────────────────────────────────────

async function brainAddMemory(
  api: GreenchClawPluginApi,
  text: string,
  userId: string = "default",
  metadata: Record<string, unknown> = {},
): Promise<{ memory_id: string }> {
  const cfg = getBrainConfig(api);
  const memoryId = crypto.randomUUID();
  const vector = await embedText(text, cfg.ollamaUrl, cfg.embeddingModel);

  await brainUpsert(cfg, {
    id: Math.abs(
      parseInt(crypto.createHash("sha1").update(memoryId).digest("hex").slice(0, 12), 16),
    ),
    vector,
    payload: {
      memory_id: memoryId,
      user_id: userId,
      text,
      metadata,
      created_at: new Date().toISOString(),
    },
  });

  return { memory_id: memoryId };
}

async function brainSearch(
  api: GreenchClawPluginApi,
  query: string,
  userId: string = "default",
  limit: number = 10,
): Promise<
  Array<{
    memory_id: string;
    text: string;
    score: number;
    metadata: Record<string, unknown>;
    created_at: string;
  }>
> {
  const cfg = getBrainConfig(api);
  const queryVector = await embedText(query, cfg.ollamaUrl, cfg.embeddingModel);
  const results = await doBrainSearch(cfg, queryVector, userId, limit);
  return results.map((r) => ({
    memory_id: (r.payload.memory_id as string) ?? "",
    text: (r.payload.text as string) ?? "",
    score: r.score,
    metadata: (r.payload.metadata as Record<string, unknown>) ?? {},
    created_at: (r.payload.created_at as string) ?? "",
  }));
}

async function brainGetAll(
  api: GreenchClawPluginApi,
  userId: string = "default",
  limit: number = 100,
): Promise<
  Array<{
    memory_id: string;
    text: string;
    metadata: Record<string, unknown>;
    created_at: string;
  }>
> {
  const cfg = getBrainConfig(api);
  const results = await brainFetchAll(cfg, userId, limit);
  return results.map((r) => ({
    memory_id: (r.payload.memory_id as string) ?? "",
    text: (r.payload.text as string) ?? "",
    metadata: (r.payload.metadata as Record<string, unknown>) ?? {},
    created_at: (r.payload.created_at as string) ?? "",
  }));
}

async function brainDeleteMemory(
  api: GreenchClawPluginApi,
  memoryId: string,
  userId: string = "default",
): Promise<boolean> {
  const cfg = getBrainConfig(api);
  const pointId = Math.abs(
    parseInt(crypto.createHash("sha1").update(memoryId).digest("hex").slice(0, 12), 16),
  );
  try {
    await brainDeletePoint(cfg, pointId);
    return true;
  } catch {
    return false;
  }
}

// ── Config ────────────────────────────────────────────────────────────────────

function getBrainConfig(api: GreenchClawPluginApi): BrainConfig {
  const raw = (api.config.plugins?.entries as Record<string, unknown> | undefined)?.[
    "greench-brain"
  ];
  const cfg = (
    raw && typeof raw === "object" && "config" in raw
      ? (raw as { config: Record<string, unknown> }).config
      : raw
  ) as Record<string, unknown> | undefined;

  return {
    qdrantHost: String(cfg?.qdrantHost ?? DEFAULT_BRAIN_CONFIG.qdrantHost),
    qdrantPort: Number(cfg?.qdrantPort ?? DEFAULT_BRAIN_CONFIG.qdrantPort),
    ollamaUrl: String(cfg?.ollamaUrl ?? DEFAULT_BRAIN_CONFIG.ollamaUrl),
    embeddingModel: String(cfg?.embeddingModel ?? DEFAULT_BRAIN_CONFIG.embeddingModel),
    collection: String(cfg?.collection ?? DEFAULT_BRAIN_CONFIG.collection),
  };
}

// ── Plugin Tools ─────────────────────────────────────────────────────────────

function buildTools(api: GreenchClawPluginApi) {
  return [
    {
      name: "brain_add",
      description: "Add a memory to the agent's brain.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string", description: "Memory text to store" },
          user_id: {
            type: "string",
            description: "User ID (default: default)",
            default: "default",
          },
          metadata: {
            type: "object",
            description: "Optional metadata (key-value pairs)",
            additionalProperties: true,
          },
        },
        required: ["text"],
      },
      async run(args: { text: string; user_id?: string; metadata?: Record<string, unknown> }) {
        try {
          const result = await brainAddMemory(
            api,
            args.text,
            args.user_id ?? "default",
            args.metadata ?? {},
          );
          return {
            success: true,
            output: `Memory added: ${result.memory_id}`,
            error: null,
          };
        } catch (err) {
          return { success: false, output: "", error: String(err) };
        }
      },
    },
    {
      name: "brain_search",
      description: "Search the agent's brain for relevant memories.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          user_id: { type: "string", description: "User ID (default: default)" },
          limit: { type: "number", description: "Max results (default 10)" },
        },
        required: ["query"],
      },
      async run(args: { query: string; user_id?: string; limit?: number }) {
        try {
          const results = await brainSearch(
            api,
            args.query,
            args.user_id ?? "default",
            args.limit ?? 10,
          );
          if (!results.length) {
            return { success: true, output: "No memories found.", error: null };
          }
          const lines = results.map(
            (r, i) =>
              `[${i + 1}] (score: ${r.score.toFixed(3)}) ${r.text}${Object.keys(r.metadata).length ? ` | ${JSON.stringify(r.metadata)}` : ""}`,
          );
          return { success: true, output: lines.join("\n\n"), error: null };
        } catch (err) {
          return { success: false, output: "", error: String(err) };
        }
      },
    },
    {
      name: "brain_list",
      description: "List all memories in the brain.",
      inputSchema: {
        type: "object",
        properties: {
          user_id: { type: "string" },
          limit: { type: "number" },
        },
      },
      async run(args: { user_id?: string; limit?: number }) {
        try {
          const memories = await brainGetAll(api, args.user_id ?? "default", args.limit ?? 100);
          if (!memories.length) {
            return { success: true, output: "No memories stored.", error: null };
          }
          const lines = memories.map((m, i) => `[${i + 1}] ${m.text}`);
          return { success: true, output: lines.join("\n"), error: null };
        } catch (err) {
          return { success: false, output: "", error: String(err) };
        }
      },
    },
    {
      name: "brain_delete",
      description: "Delete a specific memory by ID.",
      inputSchema: {
        type: "object",
        properties: {
          memory_id: { type: "string" },
          user_id: { type: "string" },
        },
        required: ["memory_id"],
      },
      async run(args: { memory_id: string; user_id?: string }) {
        try {
          const deleted = await brainDeleteMemory(api, args.memory_id, args.user_id ?? "default");
          return {
            success: true,
            output: deleted ? `Memory '${args.memory_id}' deleted.` : `Memory not found.`,
            error: null,
          };
        } catch (err) {
          return { success: false, output: "", error: String(err) };
        }
      },
    },
  ];
}

// ── Plugin Entry ─────────────────────────────────────────────────────────────

export default definePluginEntry({
  id: "greench-brain",
  name: "GreenchBrain",
  description: "Semantic memory brain — persistent, searchable memory using Qdrant.",
  async register(api: GreenchClawPluginApi) {
    const tools = buildTools(api);
    for (const tool of tools) {
      try {
        api.runtime.agent.tools.register?.({
          id: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
          async handler(args: Record<string, unknown>) {
            return tool.run(args as Parameters<typeof tool.run>[0]);
          },
        });
      } catch (err) {
        api.logger.error?.("greench-brain: failed to register tool", {
          tool: tool.name,
          error: String(err),
        });
      }
    }
    api.logger.info?.("greench-brain: registered", { count: tools.length });
  },
  tools: {
    brain_add: {
      description: "Add a memory to the brain.",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string" },
          user_id: { type: "string" },
          metadata: { type: "object", additionalProperties: true },
        },
        required: ["text"],
      },
    },
    brain_search: {
      description: "Search brain memories.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          user_id: { type: "string" },
          limit: { type: "number" },
        },
        required: ["query"],
      },
    },
    brain_list: {
      description: "List all memories.",
      inputSchema: {
        type: "object",
        properties: { user_id: { type: "string" }, limit: { type: "number" } },
      },
    },
    brain_delete: {
      description: "Delete a memory.",
      inputSchema: {
        type: "object",
        properties: { memory_id: { type: "string" }, user_id: { type: "string" } },
        required: ["memory_id"],
      },
    },
  },
  configSchema: {
    type: "object",
    properties: {
      qdrantHost: { type: "string", default: "localhost" },
      qdrantPort: { type: "number", default: 6333 },
      ollamaUrl: { type: "string", default: "http://localhost:11434" },
      embeddingModel: { type: "string", default: "nomic-embed-text:v1.5" },
      collection: { type: "string", default: "greench_brain" },
    },
  },
});
