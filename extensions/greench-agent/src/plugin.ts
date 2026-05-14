/**
 * GreenchAgent — autonomous agent loop with visible reasoning.
 *
 * Provides the `agent_run` tool which runs a task using an autonomous
 * think → act → observe loop. Each step streams back so the user sees
 * the reasoning process.
 *
 * Streaming format:
 *   thought: <reasoning text>
 *   action: <tool_name> <input>
 *   tool_result: <output>
 *   final: <final answer>
 */

import { parseModelRef } from "GreenchClaw/plugin-sdk/agent-runtime";
import { definePluginEntry, type GreenchClawPluginApi } from "GreenchClaw/plugin-sdk/plugin-entry";

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_ITERATIONS = 8;
const REPETITION_LIMIT = 3;

// ── Tool Registry ─────────────────────────────────────────────────────────────

interface ToolSpec {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

interface ToolResult {
  success: boolean;
  output: string;
  error: string | null;
}

interface ToolRunner {
  run(args: Record<string, unknown>): Promise<ToolResult>;
}

const toolRegistry = new Map<string, ToolRunner>();

function registerTool(name: string, runner: ToolRunner): void {
  toolRegistry.set(name, runner);
}

function hasTool(name: string): boolean {
  return toolRegistry.has(name);
}

// ── Built-in tools (self-contained, no external deps) ───────────────────────

function safeEval(expr: string): number | string {
  const allowed = new Set("0123456789.+-*/()**% \t\n");
  if (![...expr].every((c) => allowed.has(c))) {
    throw new Error("Invalid characters in expression");
  }
  return eval(expr);
}

function buildBuiltInTools() {
  // Calculator
  registerTool("calculator", {
    async run(args: Record<string, unknown>) {
      const expr = String(args.expression ?? "");
      try {
        const result = safeEval(expr);
        return { success: true, output: String(result), error: null };
      } catch (err) {
        return { success: false, output: "", error: String(err) };
      }
    },
  });

  // Read file
  registerTool("read_file", {
    async run(args: Record<string, unknown>) {
      const filePath = String(args.path ?? "");
      if (!filePath) return { success: false, output: "", error: "No path provided" };
      try {
        const { readFileSync } = await import("node:fs");
        const content = readFileSync(filePath, "utf-8").slice(0, 8000);
        return { success: true, output: content, error: null };
      } catch (err) {
        return { success: false, output: "", error: String(err) };
      }
    },
  });

  // Wikipedia lookup (pure fetch)
  registerTool("wikipedia", {
    async run(args: Record<string, unknown>) {
      const topic = String(args.topic ?? "").trim();
      if (!topic) return { success: false, output: "", error: "No topic provided" };
      try {
        const encoded = encodeURIComponent(topic);
        const resp = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encoded}`, {
          headers: { "User-Agent": "GreenchClaw/1.0" },
          signal: AbortSignal.timeout(5000),
        });
        if (!resp.ok) return { success: false, output: "", error: `HTTP ${resp.status}` };
        const data = (await resp.json()) as {
          title?: string;
          extract?: string;
        };
        const title = data.title ?? topic;
        const extract = data.extract ?? "No summary available.";
        return {
          success: true,
          output: `**${title}**\n\n${extract}`,
          error: null,
        };
      } catch (err) {
        return { success: false, output: "", error: String(err) };
      }
    },
  });

  // Web search (Brave Search API if configured, else fetch-based)
  registerTool("web_search", {
    async run(args: Record<string, unknown>) {
      const query = String(args.query ?? "");
      if (!query) return { success: false, output: "", error: "No query provided" };

      // Try Brave Search first (via plugin config or env)
      const braveKey = process.env.BRAVE_SEARCH_API_KEY;
      if (braveKey) {
        try {
          const resp = await fetch(
            `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`,
            {
              headers: {
                Accept: "application/json",
                "X-Subscription-Token": braveKey,
              },
              signal: AbortSignal.timeout(10000),
            },
          );
          if (resp.ok) {
            const data = (await resp.json()) as {
              web?: { results?: Array<{ title?: string; url?: string; description?: string }> };
            };
            const results = data.web?.results ?? [];
            const lines = results
              .slice(0, 5)
              .map((r, i) => `[${i + 1}] ${r.title}\n  ${r.url}\n  ${r.description ?? ""}`);
            return {
              success: true,
              output: `Web search results for "${query}":\n\n${lines.join("\n\n")}`,
              error: null,
            };
          }
        } catch {
          // Fall through to error
        }
      }

      // Fallback: return instructions
      return {
        success: true,
        output: `Web search for "${query}" — configure BRAVE_SEARCH_API_KEY env var to enable live search.`,
        error: null,
      };
    },
  });
}

// ── Response Parser ──────────────────────────────────────────────────────────

const THOUGHT_RE = /thought:\s*(.+?)(?=\n(?:action:|final:)|$)/is;
const FINAL_RE = /final:\s*(.+)/is;
const ACTION_RE = /action:\s*(\w+)\s*(.+?)(?=\n|$)/s;

function parseResponse(text: string): {
  thought: string | null;
  final: string | null;
  toolName: string | null;
  toolArgs: string | null;
} {
  const thoughtMatch = THOUGHT_RE.exec(text);
  const finalMatch = FINAL_RE.exec(text);
  const actionMatch = ACTION_RE.exec(text);

  return {
    thought: thoughtMatch ? thoughtMatch[1].trim() : null,
    final: finalMatch ? finalMatch[1].trim() : null,
    toolName: actionMatch ? actionMatch[1].trim() : null,
    toolArgs: actionMatch ? actionMatch[2].trim() : null,
  };
}

// ── System Prompt ─────────────────────────────────────────────────────────────

function buildSystemPrompt(): string {
  const toolDescs = [...toolRegistry.entries()].map(([name, _]) => `- **${name}**`).join("\n");

  return `You are a precise, autonomous AI agent. You have access to tools.

## Available Tools
${toolDescs}

## How you work

**Step 1 — THINK**: Before every action, write your reasoning in a \`thought:\` block.
**Step 2 — ACT**: Then either call a tool OR give your final answer.

Format your responses like this:

\`\`\`
thought: I'm looking at the user's request. They want X. I should check Y first.
action: calculator {"expression": "2+2"}
\`\`\`

\`\`\`
tool_result: 4
thought: Got the result. Now I should...
action: read_file {"path": "/some/file.txt"}
\`\`\`

\`\`\`
thought: I have all the information I need. The answer is...
final: Your comprehensive answer here.
\`\`\`

## Rules
- ALWAYS write a \`thought:\` before taking any action
- If a tool fails, note it and try an alternative approach
- Keep thoughts concise but show your reasoning
- When you have a verified answer, respond with \`final:\` prefix
- Never call the same tool 3 times in a row without making progress`;
}

// ── Agent Loop ────────────────────────────────────────────────────────────────

async function runAgentLoop(
  task: string,
  signal: AbortSignal,
  onThought: (text: string) => void,
  onToolCall: (tool: string, args: Record<string, unknown>) => void,
  onToolResult: (tool: string, output: string, error: string | null) => void,
  onFinal: (text: string) => void,
  onError: (err: string) => void,
  model: string,
  api: GreenchClawPluginApi,
): Promise<void> {
  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: buildSystemPrompt() },
    { role: "user", content: task },
  ];

  const toolResults: Array<{ tool: string; output: string; error: string | null }> = [];
  let lastToolName: string | null = null;
  let sameToolCount = 0;

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    if (signal.aborted) break;

    // Build messages including tool results
    const allMessages = [
      ...messages,
      ...toolResults.map((tr) => ({
        role: "user" as const,
        content: `Tool result for ${tr.tool}:\n${tr.output}${tr.error ? `\nError: ${tr.error}` : ""}`,
      })),
    ];

    // Call LLM
    let responseText = "";
    try {
      // Use the agent runtime's completion API
      const session = api.runtime.agent.sessions.current;
      if (!session) {
        // Fallback: use fetch-based completion
        const { default: fetch } = await import("node:fetch");
        void fetch; // silence
      }

      // Use the model via the agent runtime
      const completion = await runCompletion(
        {
          model,
          messages: allMessages,
          maxTokens: 2048,
          temperature: 0.3,
        },
        api,
        signal,
      );
      responseText = completion;
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") {
        onError("Agent loop aborted");
        return;
      }
      onError(String(err));
      return;
    }

    // Parse response
    const { thought, final, toolName, toolArgs } = parseResponse(responseText);

    if (thought) onThought(thought);

    if (final) {
      onFinal(final);
      return;
    }

    if (!toolName || !hasTool(toolName)) {
      // No tool to call, treat as final response
      onFinal(responseText.trim() || "No response generated.");
      return;
    }

    // Repetition guard
    if (toolName === lastToolName) {
      sameToolCount++;
    } else {
      sameToolCount = 1;
      lastToolName = toolName;
    }

    if (sameToolCount >= REPETITION_LIMIT) {
      onThought(`[Stopping: ${toolName} called ${REPETITION_LIMIT} times without progress]`);
      onError(`Stopped: ${toolName} called repeatedly without progress`);
      return;
    }

    // Parse tool args
    let toolInput: Record<string, unknown> = {};
    if (toolArgs) {
      try {
        toolInput = JSON.parse(toolArgs);
      } catch {
        toolInput = { input: toolArgs };
      }
    }

    onToolCall(toolName, toolInput);

    // Execute tool
    const runner = toolRegistry.get(toolName);
    if (!runner) {
      onToolResult(toolName, "", `Unknown tool: ${toolName}`);
      continue;
    }

    const result = await runner.run(toolInput);
    onToolResult(toolName, result.output, result.error);
    toolResults.push({ tool: toolName, output: result.output, error: result.error });
  }

  onError(`Max iterations (${MAX_ITERATIONS}) reached`);
}

// ── Completion helper (uses globalThis.fetch + model API) ─────────────────────

async function runCompletion(
  params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
    maxTokens: number;
    temperature: number;
  },
  api: GreenchClawPluginApi,
  signal: AbortSignal,
): Promise<string> {
  // Try to use the agent runtime's model API
  try {
    const { api: agentApi } = api.runtime.agent as {
      api?: { chat: (opts: unknown) => Promise<AsyncGenerator<unknown>> };
    };
    if (agentApi?.chat) {
      const chunks: string[] = [];
      const gen = await agentApi.chat({
        model: params.model,
        messages: params.messages,
        maxTokens: params.maxTokens,
        temperature: params.temperature,
      });
      for await (const chunk of gen) {
        if (signal.aborted) break;
        const c = chunk as { type?: string; content?: string };
        if (c.type === "token" || c.type === "content") {
          chunks.push(c.content ?? "");
        }
      }
      return chunks.join("");
    }
  } catch {
    // Fall through
  }

  // Fallback: direct provider API call
  const { provider, modelId } = parseModelRef(params.model);
  const providerConfig = (api.config.models?.providers as Record<string, unknown> | undefined)?.[
    provider
  ] as { baseUrl?: string; apiKey?: string; api?: string } | undefined;

  if (!providerConfig?.baseUrl) {
    throw new Error(`No provider config for ${provider}. Configure model provider first.`);
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (providerConfig.apiKey) {
    headers["Authorization"] = `Bearer ${providerConfig.apiKey}`;
  }

  const body: Record<string, unknown> = {
    model: modelId,
    messages: params.messages,
    max_tokens: params.maxTokens,
    temperature: params.temperature,
  };

  if (providerConfig.api === "anthropic-messages") {
    // Anthropic-style
    const resp = await fetch(`${providerConfig.baseUrl}/v1/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...body, stream: false }),
      signal,
    });
    if (!resp.ok) throw new Error(`API error: ${resp.status}`);
    const data = (await resp.json()) as { content?: Array<{ type?: string; text?: string }> };
    return data.content?.[0]?.text ?? "";
  } else {
    // OpenAI-style
    const resp = await fetch(`${providerConfig.baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...body, stream: false }),
      signal,
    });
    if (!resp.ok) throw new Error(`API error: ${resp.status}`);
    const data = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content ?? "";
  }
}

// ── Plugin Tools ─────────────────────────────────────────────────────────────

let _apiRef: GreenchClawPluginApi;

function buildTools() {
  return [
    {
      name: "agent_run",
      description:
        "Run an autonomous agent to complete a complex task. The agent will think step-by-step, call tools, and return a final answer. Watch the thought process in real-time.",
      inputSchema: {
        type: "object",
        properties: {
          task: { type: "string", description: "The task for the agent to complete" },
          model: {
            type: "string",
            description: "Model to use (default: configured default model)",
          },
        },
        required: ["task"],
      },
      async run(args: { task: string; model?: string }) {
        const task = args.task;
        const model = args.model ?? api.runtime.agent.model?.() ?? "minimax/MiniMax-M2.7";

        const steps: string[] = [];
        let finalAnswer = "";
        let error: string | null = null;
        let toolCalls = 0;

        const abortController = new AbortController();

        try {
          await runAgentLoop(
            task,
            abortController.signal,
            // onThought
            (text) => {
              steps.push(`**Thought:** ${text}`);
            },
            // onToolCall
            (tool, toolArgs) => {
              steps.push(`**Action:** ${tool} ${JSON.stringify(toolArgs)}`);
              toolCalls++;
            },
            // onToolResult
            (tool, output, err) => {
              const truncated = output.length > 300 ? output.slice(0, 300) + "..." : output;
              steps.push(`**Result (${tool}):** ${err ? `ERROR: ${err}` : truncated}`);
            },
            // onFinal
            (text) => {
              finalAnswer = text;
            },
            // onError
            (err) => {
              error = err;
            },
            model,
            _apiRef,
          );
        } catch (err) {
          error = String(err);
        }

        const header = `**Agent Run** — ${toolCalls} tool call(s), ${steps.filter((s) => s.startsWith("**Thought")).length} thought(s)\n\n`;
        const body = steps.map((s) => `  ${s}`).join("\n\n");
        const final = finalAnswer ? `\n\n**Final Answer:**\n${finalAnswer}` : "";
        const errStr = error ? `\n\n**Error:** ${error}` : "";

        return {
          success: error === null,
          output: header + body + final + errStr,
          error,
        };
      },
    },
  ];
}

// ── Plugin Entry ─────────────────────────────────────────────────────────────

export default definePluginEntry({
  id: "greench-agent",
  name: "GreenchAgent",
  description:
    "Autonomous agent with visible reasoning — think → act → observe loop with tool execution.",
  async register(api: GreenchClawPluginApi) {
    _apiRef = api;

    // Register built-in tools
    buildBuiltInTools();

    // Auto-register RAG tools if greench-rag is enabled
    try {
      const ragTools =
        (
          api as { runtime?: { agent?: { tools?: { list?: () => Array<{ name: string }> } } } }
        ).runtime?.agent?.tools?.list?.() ?? [];
      for (const t of ragTools) {
        if (!hasTool(t.name) && t.name.startsWith("rag_")) {
          // RAG tools are already registered by greench-rag plugin
          // We just reference them here
        }
      }
    } catch {
      // Ignore
    }

    const tools = buildTools();
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
        api.logger.error?.("greench-agent: failed to register tool", {
          tool: tool.name,
          error: String(err),
        });
      }
    }

    api.logger.info?.("greench-agent: registered", {
      builtInTools: [...toolRegistry.keys()].join(", "),
    });
  },
  tools: {
    agent_run: {
      description:
        "Run an autonomous agent to complete a complex task. The agent thinks step-by-step, calls tools, and returns a final answer.",
      inputSchema: {
        type: "object",
        properties: {
          task: { type: "string", description: "The task for the agent" },
          model: { type: "string", description: "Model to use" },
        },
        required: ["task"],
      },
    },
  },
});
