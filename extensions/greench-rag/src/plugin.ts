/**
 * GreenchRAG — RAG pipeline plugin for GreenchClaw.
 *
 * Features:
 * - Document parsing: PDF, DOCX, TXT, MD
 * - Text chunking with token-based overlap
 * - Ollama embedding (nomic-embed-text)
 * - Qdrant vector storage
 * - Semantic search
 * - Chat with RAG context
 */

import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { definePluginEntry, type GreenchClawPluginApi } from "GreenchClaw/plugin-sdk/plugin-entry";

// ── Types ────────────────────────────────────────────────────────────────────

interface Chunk {
  chunk_id: string;
  text: string;
  start_char: number;
  end_char: number;
}

interface StoredChunk {
  text: string;
  doc_id: string;
  doc_title: string;
  chunk_index: number;
  score: number;
}

interface DocumentMeta {
  doc_id: string;
  title: string;
  file_type: string;
  chunk_count: number;
  uploaded_at: string;
  metadata: Record<string, unknown>;
}

interface RAGConfig {
  qdrant: {
    host: string;
    port: number;
    collection: string;
  };
  ollama: {
    baseUrl: string;
    embeddingModel: string;
  };
  chunking: {
    chunkSize: number; // tokens
    chunkOverlap: number; // tokens
  };
}

// ── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_QDRANT_HOST = "localhost";
const DEFAULT_QDRANT_PORT = 6333;
const DEFAULT_COLLECTION = "greench_documents";
const DEFAULT_OLLAMA_URL = "http://localhost:11434";
const DEFAULT_EMBEDDING_MODEL = "nomic-embed-text:v1.5";
const DEFAULT_CHUNK_SIZE = 500; // tokens
const DEFAULT_CHUNK_OVERLAP = 100; // tokens
const EMBEDDING_DIMS = 768; // nomic-embed-text dims

// ── Config resolution ────────────────────────────────────────────────────────

function resolveConfig(api: GreenchClawPluginApi): RAGConfig {
  const raw = api.config.plugins?.entries?.["greench-rag"];
  const cfg = (
    raw && typeof raw === "object" && "config" in raw
      ? (raw as { config: Record<string, unknown> }).config
      : raw
  ) as Record<string, unknown> | undefined;

  const qdrant = (cfg?.qdrant as Record<string, unknown> | undefined) ?? {};
  const ollama = (cfg?.ollama as Record<string, unknown> | undefined) ?? {};
  const chunking = (cfg?.chunking as Record<string, unknown> | undefined) ?? {};

  return {
    qdrant: {
      host: String(qdrant.host ?? DEFAULT_QDRANT_HOST),
      port: Number(qdrant.port ?? DEFAULT_QDRANT_PORT),
      collection: String(qdrant.collection ?? DEFAULT_COLLECTION),
    },
    ollama: {
      baseUrl: String(ollama.baseUrl ?? DEFAULT_OLLAMA_URL),
      embeddingModel: String(ollama.embeddingModel ?? DEFAULT_EMBEDDING_MODEL),
    },
    chunking: {
      chunkSize: Number(chunking.chunkSize ?? DEFAULT_CHUNK_SIZE),
      chunkOverlap: Number(chunking.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP),
    },
  };
}

// ── Document Parsers ──────────────────────────────────────────────────────────

async function parsePDF(buffer: Buffer): Promise<string> {
  // Lazy-load pdfjs-dist to avoid heavy import at startup
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "";

  const loadingTask = pdfjsLib.getDocument({ data: buffer.slice(0) });
  const pdf = await loadingTask.promise;
  const texts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: unknown) => {
        const it = item as { str?: string };
        return it.str ?? "";
      })
      .join(" ");
    if (pageText.trim()) texts.push(pageText);
  }

  return texts.join("\n\n");
}

async function parseDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

function parseTXT(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

async function parseFile(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf" || mimeType.endsWith("/pdf")) {
    return parsePDF(buffer);
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/vnd.ms-word.document" ||
    mimeType.endsWith("/wordprocessingml")
  ) {
    return parseDOCX(buffer);
  }

  if (
    mimeType === "text/plain" ||
    mimeType === "text/markdown" ||
    mimeType === "text/x-markdown" ||
    mimeType === "text/csv"
  ) {
    return parseTXT(buffer);
  }

  // Fallback: try UTF-8 decode
  return parseTXT(buffer);
}

// ── Chunking ─────────────────────────────────────────────────────────────────

function chunkText(
  text: string,
  chunkSize: number = DEFAULT_CHUNK_SIZE,
  overlap: number = DEFAULT_CHUNK_OVERLAP,
): Chunk[] {
  // 1 token ≈ 4 chars
  const charLimit = chunkSize * 4;
  const overlapChars = overlap * 4;

  const chunks: Chunk[] = [];
  let start = 0;
  const textLen = text.length;

  while (start < textLen) {
    const end = start + charLimit;
    const chunkText = text.slice(start, end).trim();

    if (chunkText) {
      chunks.push({
        chunk_id: `chunk_${chunks.length}`,
        text: chunkText,
        start_char: start,
        end_char: Math.min(end, textLen),
      });
    }

    start = start + charLimit - overlapChars;
    if (start >= textLen) break;
  }

  return chunks;
}

// ── Embedding ────────────────────────────────────────────────────────────────

async function embedTexts(texts: string[], baseUrl: string, model: string): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (const text of texts) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);

    try {
      const response = await fetch(`${baseUrl}/api/embeddings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model, prompt: text }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Ollama embedding failed: ${response.status} ${response.statusText}`);
      }

      const data = (await response.json()) as { embedding?: number[] };
      if (!data.embedding) {
        throw new Error("No embedding returned from Ollama");
      }
      embeddings.push(data.embedding);
    } finally {
      clearTimeout(timeout);
    }
  }

  return embeddings;
}

// ── Qdrant REST API Client ────────────────────────────────────────────────────

function qdrantUrl(cfg: RAGConfig, path: string): string {
  return `http://${cfg.qdrant.host}:${cfg.qdrant.port}${path}`;
}

async function qdrantRequest<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const resp = await fetch(url, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...opts.headers,
    },
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(`Qdrant ${resp.status}: ${text}`);
  }
  return resp.json() as Promise<T>;
}

async function ensureCollection(cfg: RAGConfig): Promise<void> {
  try {
    const data = await qdrantRequest<{ collections: Array<{ name: string }> }>(
      qdrantUrl(cfg, "/collections"),
    );
    const exists = data.collections.some((c) => c.name === cfg.qdrant.collection);
    if (!exists) {
      await qdrantRequest(qdrantUrl(cfg, `/collections/${cfg.qdrant.collection}`), {
        method: "PUT",
        body: JSON.stringify({
          vectors: {
            size: EMBEDDING_DIMS,
            distance: "Cosine",
          },
        }),
      });
    }
  } catch {
    // Collection may already exist
  }
}

async function qdrantUpsert(
  cfg: RAGConfig,
  points: Array<{ id: number; vector: number[]; payload: Record<string, unknown> }>,
): Promise<void> {
  await ensureCollection(cfg);
  await qdrantRequest(qdrantUrl(cfg, `/collections/${cfg.qdrant.collection}/points`), {
    method: "PUT",
    body: JSON.stringify({ points }),
  });
}

async function qdrantSearch(
  cfg: RAGConfig,
  queryVector: number[],
  limit: number,
): Promise<Array<{ id: number; score: number; payload: Record<string, unknown> }>> {
  await ensureCollection(cfg);
  const data = await qdrantRequest<{
    result: Array<{ id: number; score: number; payload: Record<string, unknown> }>;
  }>(qdrantUrl(cfg, `/collections/${cfg.qdrant.collection}/points/query`), {
    method: "POST",
    body: JSON.stringify({ query: queryVector, limit }),
  });
  return data.result ?? [];
}

async function qdrantDelete(cfg: RAGConfig, points: number[]): Promise<void> {
  await qdrantRequest(qdrantUrl(cfg, `/collections/${cfg.qdrant.collection}/points/delete`), {
    method: "POST",
    body: JSON.stringify({ points }),
  });
}

// ── Document metadata store (file-based) ─────────────────────────────────────

function getMetaPath(api: GreenchClawPluginApi): string {
  return path.join(
    api.runtime.state.resolveStateDir(),
    "plugins",
    "greench-rag",
    "documents_meta.json",
  );
}

async function loadMeta(api: GreenchClawPluginApi): Promise<Record<string, DocumentMeta>> {
  try {
    const content = await fs.readFile(getMetaPath(api), "utf-8");
    return JSON.parse(content);
  } catch {
    return {};
  }
}

async function saveMeta(
  api: GreenchClawPluginApi,
  meta: Record<string, DocumentMeta>,
): Promise<void> {
  const dir = path.dirname(getMetaPath(api));
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(getMetaPath(api), JSON.stringify(meta, null, 2), "utf-8");
}

// ── RAG Core Operations ──────────────────────────────────────────────────────

async function ingestDocument(
  api: GreenchClawPluginApi,
  docId: string,
  title: string,
  fileType: string,
  buffer: Buffer,
  mimeType: string,
): Promise<{ chunks_stored: number }> {
  const cfg = resolveConfig(api);

  // Parse
  const text = await parseFile(buffer, mimeType);

  if (!text.trim()) {
    throw new Error("Document is empty after parsing");
  }

  // Chunk
  const chunks = chunkText(text, cfg.chunking.chunkSize, cfg.chunking.chunkOverlap);

  // Embed
  const texts = chunks.map((c) => c.text);
  const vectors = await embedTexts(texts, cfg.ollama.baseUrl, cfg.ollama.embeddingModel);

  // Store in Qdrant via REST API
  const points = chunks.map((chunk, i) => ({
    id: Math.abs(
      parseInt(crypto.createHash("sha1").update(`${docId}_${i}`).digest("hex").slice(0, 16), 16),
    ),
    vector: vectors[i],
    payload: {
      doc_id: docId,
      doc_title: title,
      file_type: fileType,
      chunk_id: chunk.chunk_id,
      chunk_index: i,
      text: chunk.text,
    },
  }));

  await qdrantUpsert(cfg, points);

  // Save metadata
  const meta = await loadMeta(api);
  meta[docId] = {
    doc_id: docId,
    title,
    file_type: fileType,
    chunk_count: chunks.length,
    uploaded_at: new Date().toISOString(),
    metadata: {},
  };
  await saveMeta(api, meta);

  return { chunks_stored: chunks.length };
}

async function searchChunks(
  api: GreenchClawPluginApi,
  query: string,
  topK: number = 5,
): Promise<StoredChunk[]> {
  const cfg = resolveConfig(api);

  // Embed query
  const vectors = await embedTexts([query], cfg.ollama.baseUrl, cfg.ollama.embeddingModel);
  const queryVector = vectors[0];

  const results = await qdrantSearch(cfg, queryVector, topK);

  return results.map((r) => ({
    text: (r.payload.text as string) ?? "",
    doc_id: (r.payload.doc_id as string) ?? "",
    doc_title: (r.payload.doc_title as string) ?? "",
    chunk_index: (r.payload.chunk_index as number) ?? 0,
    score: r.score,
  }));
}

async function listDocuments(api: GreenchClawPluginApi): Promise<DocumentMeta[]> {
  const meta = await loadMeta(api);
  return Object.values(meta);
}

async function deleteDocument(api: GreenchClawPluginApi, docId: string): Promise<boolean> {
  const cfg = resolveConfig(api);
  const meta = await loadMeta(api);

  if (!meta[docId]) return false;

  const chunkCount = meta[docId].chunk_count;

  // Delete all chunk points for this doc
  const pointIds = Array.from({ length: chunkCount }, (_, i) =>
    Math.abs(
      parseInt(crypto.createHash("sha1").update(`${docId}_${i}`).digest("hex").slice(0, 16), 16),
    ),
  );

  await qdrantDelete(cfg, pointIds);

  delete meta[docId];
  await saveMeta(api, meta);
  return true;
}

// ── Build RAG Context ────────────────────────────────────────────────────────

function buildRAGContext(chunks: StoredChunk[]): string {
  if (!chunks.length) return "";
  return chunks.map((c) => `[Document: ${c.doc_title}]\n${c.text}`).join("\n\n---\n\n");
}

// ── Plugin Tools ─────────────────────────────────────────────────────────────

function buildTools(api: GreenchClawPluginApi) {
  return [
    {
      name: "rag_search",
      description:
        "Search indexed documents using semantic similarity. Returns relevant text chunks from uploaded PDFs, DOCX, TXT, and MD files.",
      inputSchema: {
        type: "object" as const,
        properties: {
          query: { type: "string" as const, description: "Search query" },
          top_k: {
            type: "number" as const,
            description: "Max results to return (default 5)",
            default: 5,
          },
        },
        required: ["query" as const],
      },
      async run(args: { query: string; top_k?: number }) {
        try {
          const chunks = await searchChunks(api, args.query, args.top_k ?? 5);
          if (!chunks.length) {
            return { success: true, output: "No documents found matching the query.", error: null };
          }
          const lines = chunks.map(
            (c, i) => `[${i + 1}] ${c.doc_title} (score: ${c.score.toFixed(3)})\n${c.text}`,
          );
          return {
            success: true,
            output: `Found ${chunks.length} result(s):\n\n${lines.join("\n\n")}`,
            error: null,
          };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return { success: false, output: "", error: msg };
        }
      },
    },
    {
      name: "rag_list",
      description: "List all indexed documents in the RAG store.",
      inputSchema: {
        type: "object" as const,
        properties: {},
      },
      async run() {
        try {
          const docs = await listDocuments(api);
          if (!docs.length) {
            return { success: true, output: "No documents indexed yet.", error: null };
          }
          const lines = docs.map(
            (d) => `- ${d.title} (${d.chunk_count} chunks, uploaded ${d.uploaded_at})`,
          );
          return { success: true, output: lines.join("\n"), error: null };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return { success: false, output: "", error: msg };
        }
      },
    },
    {
      name: "rag_delete",
      description: "Delete an indexed document by its ID.",
      inputSchema: {
        type: "object" as const,
        properties: {
          doc_id: { type: "string" as const, description: "Document ID to delete" },
        },
        required: ["doc_id" as const],
      },
      async run(args: { doc_id: string }) {
        try {
          const deleted = await deleteDocument(api, args.doc_id);
          return {
            success: true,
            output: deleted
              ? `Document '${args.doc_id}' deleted.`
              : `Document '${args.doc_id}' not found.`,
            error: null,
          };
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return { success: false, output: "", error: msg };
        }
      },
    },
  ];
}

// ── Plugin Registration ────────────────────────────────────────────────────────

let _registeredTools: unknown[] = [];

async function registerRAGPlugin(api: GreenchClawPluginApi): Promise<void> {
  const tools = buildTools(api);
  _registeredTools = tools;

  api.logger.info?.("greench-rag: registering tools", { count: tools.length });

  // Register tools with the agent tool catalog
  for (const tool of tools) {
    try {
      api.runtime.agent.tools.register?.({
        id: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        async handler(args: Record<string, unknown>) {
          const result = await tool.run(args as Parameters<typeof tool.run>[0]);
          return result;
        },
      });
    } catch (err) {
      api.logger.error?.("greench-rag: failed to register tool", {
        tool: tool.name,
        error: String(err),
      });
    }
  }
}

// ── Plugin Entry ─────────────────────────────────────────────────────────────

let _pluginApi: GreenchClawPluginApi | null = null;

export default definePluginEntry({
  id: "greench-rag",
  name: "GreenchRAG",
  description:
    "RAG pipeline — upload PDFs, DOCX, TXT, MD files, semantic search, and chat with document context.",
  async register(api: GreenchClawPluginApi) {
    _pluginApi = api;
    await registerRAGPlugin(api);
    api.logger.info?.("greench-rag: plugin registered");
  },
  async onAgentToolCall(toolName: string, args: Record<string, unknown>) {
    // Route tool calls to our handlers
    const tool = _registeredTools.find((t) => (t as { name: string }).name === toolName);
    if (!tool) return undefined;
    return (tool as { run: (args: Record<string, unknown>) => unknown }).run(args);
  },
  tools: {
    rag_search: {
      description:
        "Search indexed documents using semantic similarity. Returns relevant text chunks from uploaded PDFs, DOCX, TXT, and MD files.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string", description: "Search query" },
          top_k: { type: "number", description: "Max results (default 5)", default: 5 },
        },
        required: ["query"],
      },
    },
    rag_list: {
      description: "List all indexed documents.",
      inputSchema: { type: "object", properties: {} },
    },
    rag_delete: {
      description: "Delete a document by ID.",
      inputSchema: {
        type: "object",
        properties: { doc_id: { type: "string" } },
        required: ["doc_id"],
      },
    },
  },
  configSchema: {
    type: "object",
    properties: {
      qdrant: {
        type: "object",
        properties: {
          host: { type: "string", default: "localhost" },
          port: { type: "number", default: 6333 },
          collection: { type: "string", default: "greench_documents" },
        },
      },
      ollama: {
        type: "object",
        properties: {
          baseUrl: { type: "string", default: "http://localhost:11434" },
          embeddingModel: { type: "string", default: "nomic-embed-text:v1.5" },
        },
      },
      chunking: {
        type: "object",
        properties: {
          chunkSize: { type: "number", default: 500 },
          chunkOverlap: { type: "number", default: 100 },
        },
      },
    },
  },
});
