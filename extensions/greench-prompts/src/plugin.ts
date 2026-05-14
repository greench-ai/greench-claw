/**
 * GreenchPrompts — SQLite-backed prompt template storage with variable interpolation.
 */

import path from "node:path";
import type { GreenchClawConfig } from "GreenchClaw/plugin-sdk/config-contracts";
import { definePluginEntry, type GreenchClawPluginApi } from "GreenchClaw/plugin-sdk/plugin-entry";

// ── Types ────────────────────────────────────────────────────────────────────

interface TemplateRow {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  user_prompt_template: string;
  focus_mode: string;
  created_at: string;
  updated_at: string;
}

interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  system_prompt: string;
  user_prompt_template: string;
  focus_mode: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

// ── SQLite via sql.js ─────────────────────────────────────────────────────────

let _SQL: unknown = null;
let _db: unknown = null;

async function getDb(api: GreenchClawPluginApi) {
  if (_db) return _db as ReturnType<(typeof import("sql.js"))["default"]["Database"]>;

  const initSqlJs = (await import("sql.js")).default;
  _SQL = await initSqlJs();

  const dbPath = path.join(
    api.runtime.state.resolveStateDir(),
    "plugins",
    "greench-prompts",
    "prompt_templates.db",
  );

  let data: Uint8Array | undefined;
  try {
    const { readFileSync } = await import("node:fs");
    data = readFileSync(dbPath);
  } catch {
    // New DB
  }

  const db = new _SQL.Database(data);
  _db = db;

  // Init schema
  db.run(`
    CREATE TABLE IF NOT EXISTS templates (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      system_prompt TEXT NOT NULL,
      user_prompt_template TEXT NOT NULL DEFAULT '',
      focus_mode TEXT NOT NULL DEFAULT 'copilot',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  // Persist on shutdown
  api.runtime.events.on?.("shutdown", () => {
    try {
      const { writeFileSync, mkdirSync } = require("node:fs");
      const dir = path.dirname(dbPath);
      mkdirSync(dir, { recursive: true });
      const data = (db as { export: () => Uint8Array }).export();
      writeFileSync(dbPath, Buffer.from(data));
    } catch {
      // Ignore
    }
  });

  return db as ReturnType<(typeof import("sql.js"))["default"]["Database"]>;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractVars(template: string): string[] {
  const matches = template.match(/\{\{(\w+)\}\}/g) ?? [];
  return [...new Set(matches.map((m) => m.slice(2, -2)))];
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

function rowToTemplate(row: unknown[]): PromptTemplate {
  const [
    id,
    name,
    description,
    system_prompt,
    user_prompt_template,
    focus_mode,
    created_at,
    updated_at,
  ] = row as string[];
  const allText = [system_prompt, user_prompt_template].join(" ");
  return {
    id,
    name,
    description,
    system_prompt,
    user_prompt_template,
    focus_mode,
    variables: extractVars(allText),
    created_at,
    updated_at,
  };
}

// ── CRUD Operations ───────────────────────────────────────────────────────────

async function listTemplates(api: GreenchClawPluginApi): Promise<PromptTemplate[]> {
  const db = await getDb(api);
  const rows = db.exec(
    "SELECT id, name, description, system_prompt, user_prompt_template, focus_mode, created_at, updated_at FROM templates ORDER BY updated_at DESC",
  );
  if (!rows.length) return [];
  return rows[0].values.map(rowToTemplate);
}

async function getTemplate(
  api: GreenchClawPluginApi,
  name: string,
): Promise<PromptTemplate | null> {
  const db = await getDb(api);
  const rows = db.exec(
    "SELECT id, name, description, system_prompt, user_prompt_template, focus_mode, created_at, updated_at FROM templates WHERE name = ?",
    [name],
  );
  if (!rows.length || !rows[0].values.length) return null;
  return rowToTemplate(rows[0].values[0]);
}

async function createTemplate(
  api: GreenchClawPluginApi,
  name: string,
  systemPrompt: string,
  userPromptTemplate: string,
  description: string,
  focusMode: string,
): Promise<PromptTemplate> {
  const db = await getDb(api);
  const id = Math.random().toString(36).slice(2, 10);
  const now = new Date().toISOString();
  db.run(
    `INSERT INTO templates (id, name, description, system_prompt, user_prompt_template, focus_mode, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, name, description, systemPrompt, userPromptTemplate, focusMode, now, now],
  );
  return {
    id,
    name,
    description,
    system_prompt: systemPrompt,
    user_prompt_template: userPromptTemplate,
    focus_mode: focusMode,
    variables: extractVars(systemPrompt + userPromptTemplate),
    created_at: now,
    updated_at: now,
  };
}

async function updateTemplate(
  api: GreenchClawPluginApi,
  name: string,
  updates: Partial<{
    systemPrompt: string;
    userPromptTemplate: string;
    description: string;
    focusMode: string;
  }>,
): Promise<PromptTemplate | null> {
  const db = await getDb(api);
  const existing = await getTemplate(api, name);
  if (!existing) return null;

  const now = new Date().toISOString();
  const systemPrompt = updates.systemPrompt ?? existing.system_prompt;
  const userPromptTemplate = updates.userPromptTemplate ?? existing.user_prompt_template;
  const description = updates.description ?? existing.description;
  const focusMode = updates.focusMode ?? existing.focus_mode;

  db.run(
    `UPDATE templates SET system_prompt=?, user_prompt_template=?, description=?, focus_mode=?, updated_at=? WHERE name=?`,
    [systemPrompt, userPromptTemplate, description, focusMode, now, name],
  );

  return {
    ...existing,
    system_prompt: systemPrompt,
    user_prompt_template: userPromptTemplate,
    description,
    focus_mode: focusMode,
    variables: extractVars(systemPrompt + userPromptTemplate),
    updated_at: now,
  };
}

async function deleteTemplate(api: GreenchClawPluginApi, name: string): Promise<boolean> {
  const db = await getDb(api);
  db.run("DELETE FROM templates WHERE name = ?", [name]);
  return true;
}

async function interpolateTemplate(
  api: GreenchClawPluginApi,
  name: string,
  vars: Record<string, string>,
): Promise<{ system_prompt: string; user_prompt_template: string } | null> {
  const tpl = await getTemplate(api, name);
  if (!tpl) return null;
  return {
    system_prompt: interpolate(tpl.system_prompt, vars),
    user_prompt_template: interpolate(tpl.user_prompt_template, vars),
  };
}

// ── Plugin Tools ─────────────────────────────────────────────────────────────

function buildTools(api: GreenchClawPluginApi) {
  return [
    {
      name: "prompts_list",
      description: "List all prompt templates.",
      inputSchema: { type: "object", properties: {} },
      async run() {
        try {
          const templates = await listTemplates(api);
          if (!templates.length) {
            return { success: true, output: "No prompt templates defined.", error: null };
          }
          const lines = templates.map(
            (t) =>
              `• ${t.name} [${t.focus_mode}] — ${t.description || "no description"} | vars: ${t.variables.join(", ") || "none"}`,
          );
          return { success: true, output: lines.join("\n"), error: null };
        } catch (err) {
          return { success: false, output: "", error: String(err) };
        }
      },
    },
    {
      name: "prompts_get",
      description: "Get a prompt template by name.",
      inputSchema: {
        type: "object",
        properties: { name: { type: "string" } },
        required: ["name"],
      },
      async run(args: { name: string }) {
        try {
          const tpl = await getTemplate(api, args.name);
          if (!tpl)
            return { success: false, output: "", error: `Template '${args.name}' not found` };
          return {
            success: true,
            output: JSON.stringify(tpl, null, 2),
            error: null,
          };
        } catch (err) {
          return { success: false, output: "", error: String(err) };
        }
      },
    },
    {
      name: "prompts_create",
      description: "Create a new prompt template.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          system_prompt: { type: "string" },
          user_prompt_template: { type: "string" },
          description: { type: "string" },
          focus_mode: { type: "string" },
        },
        required: ["name", "system_prompt"],
      },
      async run(args: {
        name: string;
        system_prompt: string;
        user_prompt_template?: string;
        description?: string;
        focus_mode?: string;
      }) {
        try {
          const existing = await getTemplate(api, args.name);
          if (existing) {
            return { success: false, output: "", error: `Template '${args.name}' already exists` };
          }
          const tpl = await createTemplate(
            api,
            args.name,
            args.system_prompt,
            args.user_prompt_template ?? "",
            args.description ?? "",
            args.focus_mode ?? "copilot",
          );
          return {
            success: true,
            output: `Created template '${tpl.name}' with vars: ${tpl.variables.join(", ") || "none"}`,
            error: null,
          };
        } catch (err) {
          return { success: false, output: "", error: String(err) };
        }
      },
    },
    {
      name: "prompts_delete",
      description: "Delete a prompt template by name.",
      inputSchema: {
        type: "object",
        properties: { name: { type: "string" } },
        required: ["name"],
      },
      async run(args: { name: string }) {
        try {
          await deleteTemplate(api, args.name);
          return { success: true, output: `Template '${args.name}' deleted.`, error: null };
        } catch (err) {
          return { success: false, output: "", error: String(err) };
        }
      },
    },
  ];
}

// ── Plugin Entry ─────────────────────────────────────────────────────────────

export default definePluginEntry({
  id: "greench-prompts",
  name: "GreenchPrompts",
  description: "SQLite-backed prompt templates with variable interpolation.",
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
        api.logger.error?.("greench-prompts: failed to register tool", {
          tool: tool.name,
          error: String(err),
        });
      }
    }
    api.logger.info?.("greench-prompts: registered", { count: tools.length });
  },
  tools: {
    prompts_list: {
      description: "List all prompt templates.",
      inputSchema: { type: "object", properties: {} },
    },
    prompts_get: {
      description: "Get a prompt template by name.",
      inputSchema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
    },
    prompts_create: {
      description: "Create a new prompt template.",
      inputSchema: {
        type: "object",
        properties: {
          name: { type: "string" },
          system_prompt: { type: "string" },
          user_prompt_template: { type: "string" },
          description: { type: "string" },
          focus_mode: { type: "string" },
        },
        required: ["name", "system_prompt"],
      },
    },
    prompts_delete: {
      description: "Delete a prompt template.",
      inputSchema: { type: "object", properties: { name: { type: "string" } }, required: ["name"] },
    },
  },
});
