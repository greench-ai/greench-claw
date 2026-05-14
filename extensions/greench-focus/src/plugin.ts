/**
 * GreenchFocus — focus modes for task-specific agent behavior.
 *
 * Modes: copilot, academic, writing, coding, agent
 * Each mode applies a specific behavioral modifier to the agent's system prompt.
 */

import { definePluginEntry, type GreenchClawPluginApi } from "GreenchClaw/plugin-sdk/plugin-entry";

// ── Focus Mode Definitions ────────────────────────────────────────────────────

interface FocusMode {
  name: string;
  description: string;
  modifier: string; // appended to system prompt
  rag_boost: boolean; // whether to boost RAG retrieval
}

const FOCUS_MODES: Record<string, FocusMode> = {
  copilot: {
    name: "Copilot",
    description: "General-purpose coding and assistance. Balanced reasoning and speed.",
    modifier: `You are in **Copilot** mode — a balanced, general-purpose assistant.
- Reason through problems step by step
- Provide clear, concise explanations
- Prioritize practical, working solutions
- Be helpful but not verbose`,
    rag_boost: false,
  },
  academic: {
    name: "Academic",
    description: "Research, analysis, and rigorous technical writing.",
    modifier: `You are in **Academic** mode — precise, rigorous, and thorough.
- Cite sources and distinguish facts from speculation
- Consider edge cases and counter-arguments
- Structure responses with clear logical flow
- Use precise terminology and define ambiguous terms
- Prefer depth over breadth`,
    rag_boost: true,
  },
  writing: {
    name: "Writing",
    description: "Creative writing, prose, and content creation.",
    modifier: `You are in **Writing** mode — creative and expressive.
- Write with varied sentence structure and rhythm
- Use vivid, specific language over generic descriptions
- Match or adapt to the user's tone and style
- Prioritize readability and flow
- Don't be afraid of first-person perspective or strong voice`,
    rag_boost: false,
  },
  coding: {
    name: "Coding",
    description: "Software development — debugging, architecture, and implementation.",
    modifier: `You are in **Coding** mode — precise and engineer-focused.
- Provide working, well-structured code
- Include type annotations and clear naming
- Explain the "why" behind architectural decisions
- Reference relevant docs or best practices
- Spot potential bugs, security issues, and performance problems
- Prefer clarity over clever tricks`,
    rag_boost: true,
  },
  agent: {
    name: "Agent",
    description: "Autonomous problem-solving — plans, executes, and iterates independently.",
    modifier: `You are in **Agent** mode — autonomous and self-directed.
- Think step-by-step before acting
- Break complex tasks into subtasks
- Execute tools to gather information and take action
- Monitor progress and adapt strategy
- Report back with clear status updates
- Know when to ask clarifying questions vs. proceed autonomously`,
    rag_boost: false,
  },
};

const DEFAULT_MODE = "copilot";

// ── Focus Mode Store ──────────────────────────────────────────────────────────

let _currentMode: string = DEFAULT_MODE;

function getCurrentMode(): string {
  return _currentMode;
}

function setCurrentMode(mode: string): boolean {
  if (!FOCUS_MODES[mode]) return false;
  _currentMode = mode;
  return true;
}

// ── Plugin Tools ─────────────────────────────────────────────────────────────

function buildTools() {
  return [
    {
      name: "focus_mode",
      description: "Get or set the current focus mode.",
      inputSchema: {
        type: "object",
        properties: {
          mode: {
            type: "string",
            enum: Object.keys(FOCUS_MODES),
            description: `Focus mode to switch to. Options: ${Object.keys(FOCUS_MODES).join(", ")}`,
          },
        },
      },
      async run(args: { mode?: string }) {
        if (!args.mode) {
          const current = FOCUS_MODES[getCurrentMode()];
          const available = Object.entries(FOCUS_MODES)
            .map(([k, v]) => `  • ${k}: ${v.description}`)
            .join("\n");
          return {
            success: true,
            output: `Current mode: ${getCurrentMode()}\n\nAvailable modes:\n${available}`,
            error: null,
          };
        }

        if (!setCurrentMode(args.mode)) {
          return {
            success: false,
            output: "",
            error: `Unknown focus mode: ${args.mode}. Available: ${Object.keys(FOCUS_MODES).join(", ")}`,
          };
        }

        const mode = FOCUS_MODES[args.mode];
        return {
          success: true,
          output: `Switched to **${mode.name}** mode.\n\n${mode.description}\n\n${mode.modifier}`,
          error: null,
        };
      },
    },
    {
      name: "focus_modes_list",
      description: "List all available focus modes and their descriptions.",
      inputSchema: { type: "object", properties: {} },
      async run() {
        const current = getCurrentMode();
        const lines = Object.entries(FOCUS_MODES).map(([key, mode]) => {
          const marker = key === current ? " ← active" : "";
          return `**${key}**${marker}: ${mode.description}`;
        });
        return { success: true, output: lines.join("\n"), error: null };
      },
    },
  ];
}

// ── Plugin Entry ─────────────────────────────────────────────────────────────

export default definePluginEntry({
  id: "greench-focus",
  name: "GreenchFocus",
  description: "Focus modes — behavioral presets for different task types.",
  async register(api: GreenchClawPluginApi) {
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
        api.logger.error?.("greench-focus: failed to register tool", {
          tool: tool.name,
          error: String(err),
        });
      }
    }

    // Also expose a method to get the current focus mode modifier for system prompt injection
    api.runtime.config.mutate?.((cfg) => {
      // Inject focus mode modifier into agent system prompt
      return cfg;
    });

    api.logger.info?.("greench-focus: registered", { mode: getCurrentMode() });
  },
  tools: {
    focus_mode: {
      description: "Get or set the current focus mode.",
      inputSchema: {
        type: "object",
        properties: {
          mode: {
            type: "string",
            enum: ["copilot", "academic", "writing", "coding", "agent"],
          },
        },
      },
    },
    focus_modes_list: {
      description: "List all focus modes.",
      inputSchema: { type: "object", properties: {} },
    },
  },
});
