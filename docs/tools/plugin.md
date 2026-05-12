---
summary: "Install, configure, and manage NexisClaw plugins"
read_when:
  - Installing or configuring plugins
  - Understanding plugin discovery and load rules
  - Working with Codex/Claude-compatible plugin bundles
title: "Plugins"
sidebarTitle: "Install and Configure"
---

Plugins extend NexisClaw with new capabilities: channels, model providers,
agent harnesses, tools, skills, speech, realtime transcription, realtime
voice, media-understanding, image generation, video generation, web fetch, web
search, and more. Some plugins are **core** (shipped with NexisClaw), others
are **external**. Most external plugins are published and discovered through
[ClawHub](/clawhub). Npm remains supported for direct installs and for a
temporary set of NexisClaw-owned plugin packages while that migration finishes.

## Quick start

For copy-paste install, list, uninstall, update, and publishing examples, see
[Manage plugins](/plugins/manage-plugins).

<Steps>
  <Step title="See what is loaded">
    ```bash
    NexisClaw plugins list
    ```
  </Step>

  <Step title="Install a plugin">
    ```bash
    # Search ClawHub plugins
    NexisClaw plugins search "calendar"

    # From ClawHub
    NexisClaw plugins install clawhub:NexisClaw-codex-app-server

    # From npm
    NexisClaw plugins install npm:@acme/NexisClaw-plugin
    NexisClaw plugins install npm-pack:./NexisClaw-plugin-1.2.3.tgz

    # From git
    NexisClaw plugins install git:github.com/acme/NexisClaw-plugin@v1.0.0

    # From a local directory or archive
    NexisClaw plugins install ./my-plugin
    NexisClaw plugins install ./my-plugin.tgz
    ```

  </Step>

  <Step title="Restart the Gateway">
    ```bash
    NexisClaw gateway restart
    ```

    Then configure under `plugins.entries.\<id\>.config` in your config file.

  </Step>

  <Step title="Chat-native management">
    In a running Gateway, owner-only `/plugins enable` and `/plugins disable`
    trigger the Gateway config reloader. The Gateway reloads plugin runtime
    surfaces in process, and new agent turns rebuild their tool list from the
    refreshed registry. `/plugins install` changes plugin source code, so the
    Gateway requests a restart instead of pretending the current process can
    safely reload already-imported modules.

  </Step>

  <Step title="Verify the plugin">
    ```bash
    NexisClaw plugins inspect <plugin-id> --runtime --json

    # If the plugin registered a CLI root, run one command from that root.
    NexisClaw <plugin-command> --help
    ```

    Use `--runtime` when you need to prove registered tools, services, gateway
    methods, hooks, or plugin-owned CLI commands. Plain `inspect` is a cold
    manifest/registry check and intentionally avoids importing plugin runtime.

  </Step>
</Steps>

If you prefer chat-native control, enable `commands.plugins: true` and use:

```text
/plugin install clawhub:<package>
/plugin show <plugin-id>
/plugin enable <plugin-id>
```

The install path uses the same resolver as the CLI: local path/archive, explicit
`clawhub:<pkg>`, explicit `npm:<pkg>`, explicit `npm-pack:<path.tgz>`,
explicit `git:<repo>`, or bare package spec through npm.

If config is invalid, install normally fails closed and points you at
`NexisClaw doctor --fix`. The only recovery exception is a narrow bundled-plugin
reinstall path for plugins that opt into
`NexisClaw.install.allowInvalidConfigRecovery`.
During Gateway startup, invalid plugin config fails closed like any other invalid
config. Run `NexisClaw doctor --fix` to quarantine the bad plugin config by
disabling that plugin entry and removing its invalid config payload; the normal
config backup keeps the previous values.
When a channel config references a plugin that is no longer discoverable but the
same stale plugin id remains in plugin config or install records, Gateway startup
logs warnings and skips that channel instead of blocking every other channel.
Run `NexisClaw doctor --fix` to remove the stale channel/plugin entries; unknown
channel keys without stale-plugin evidence still fail validation so typos stay
visible.
If `plugins.enabled: false` is set, stale plugin references are treated as inert:
Gateway startup skips plugin discovery/load work and `NexisClaw doctor` preserves
the disabled plugin config instead of auto-removing it. Re-enable plugins before
running doctor cleanup if you want stale plugin ids removed.

Plugin dependency installation happens only during explicit install/update or
doctor repair flows. Gateway startup, config reload, and runtime inspection do
not run package managers or repair dependency trees. Local plugins must already
have their dependencies installed, while npm, git, and ClawHub plugins are
installed under NexisClaw's managed plugin roots. npm dependencies may be hoisted
within NexisClaw's managed npm root; install/update scans that managed root before
trust and uninstall removes npm-managed packages through npm. External plugins
and custom load paths must still be installed through `NexisClaw plugins install`.
Use `NexisClaw plugins list --json` to see the static `dependencyStatus` for each
visible plugin without importing runtime code or repairing dependencies.
See [Plugin dependency resolution](/plugins/dependency-resolution) for the
install-time lifecycle.

### Blocked plugin path ownership

If plugin diagnostics say
`blocked plugin candidate: suspicious ownership (... uid=1000, expected uid=0 or root)`
and config validation follows with `plugin present but blocked`, NexisClaw found
plugin files owned by a different Unix user than the process that is loading
them. Keep the plugin config in place; fix the filesystem ownership or run
NexisClaw as the same user that owns the state directory.

For Docker installs, the official image runs as `node` (uid `1000`), so the
host bind-mounted NexisClaw config and workspace directories should normally be
owned by uid `1000`:

```bash
sudo chown -R 1000:1000 /path/to/NexisClaw-config /path/to/NexisClaw-workspace
```

If you intentionally run NexisClaw as root, repair the managed plugin root to
root ownership instead:

```bash
sudo chown -R root:root /path/to/NexisClaw-config/npm
```

After fixing ownership, rerun `NexisClaw doctor --fix` or
`NexisClaw plugins registry --refresh` so the persisted plugin registry matches
the repaired files.

For npm installs, mutable selectors such as `latest` or a dist-tag are resolved
before installation and then pinned to the exact verified version in NexisClaw's
managed npm root. After npm finishes, NexisClaw verifies the installed
`package-lock.json` entry still matches the resolved version and integrity. If
npm writes different package metadata, the install fails and the managed package
is rolled back instead of accepting a different plugin artifact.
Managed npm roots also inherit NexisClaw's package-level npm `overrides`, so
security pins that protect the packaged host also apply to hoisted external
plugin dependencies.

Source checkouts are pnpm workspaces. If you clone NexisClaw to hack on bundled
plugins, run `pnpm install`; NexisClaw then loads bundled plugins from
`extensions/<id>` so edits and package-local dependencies are used directly.
Plain npm root installs are for packaged NexisClaw, not source checkout
development.

## Plugin types

NexisClaw recognizes two plugin formats:

| Format     | How it works                                                       | Examples                                               |
| ---------- | ------------------------------------------------------------------ | ------------------------------------------------------ |
| **Native** | `NexisClaw.plugin.json` + runtime module; executes in-process       | Official plugins, community npm packages               |
| **Bundle** | Codex/Claude/Cursor-compatible layout; mapped to NexisClaw features | `.codex-plugin/`, `.claude-plugin/`, `.cursor-plugin/` |

Both show up under `NexisClaw plugins list`. See [Plugin Bundles](/plugins/bundles) for bundle details.

If you are writing a native plugin, start with [Building Plugins](/plugins/building-plugins)
and the [Plugin SDK Overview](/plugins/sdk-overview).

## Package entrypoints

Native plugin npm packages must declare `NexisClaw.extensions` in `package.json`.
Each entry must stay inside the package directory and resolve to a readable
runtime file, or to a TypeScript source file with an inferred built JavaScript
peer such as `src/index.ts` to `dist/index.js`.
Packaged installs must ship that JavaScript runtime output. The TypeScript
source fallback is for source checkouts and local development paths, not for
npm packages installed into NexisClaw's managed plugin root.

Untracked directories dropped into the global extension root are treated as
local source checkouts and may load TypeScript entries directly. Directories
still named by an install record, including `installPath` or `sourcePath`, stay
managed and keep the compiled-output requirement even when the global scan sees
them. If you intentionally convert a managed install into an untracked local
checkout, remove the stale install record first with uninstall or doctor cleanup.

If a managed package warning says it `requires compiled runtime output for
TypeScript entry ...`, the package was published without the JavaScript files
NexisClaw needs at runtime. That is a plugin packaging issue, not a local config
problem. Update or reinstall the plugin after the publisher republishes compiled
JavaScript, or disable/uninstall that plugin until a fixed package is available.

Use `NexisClaw.runtimeExtensions` when published runtime files do not live at the
same paths as the source entries. When present, `runtimeExtensions` must contain
exactly one entry for every `extensions` entry. Mismatched lists fail install and
plugin discovery rather than silently falling back to source paths. If you also
publish `NexisClaw.setupEntry`, use `NexisClaw.runtimeSetupEntry` for its built
JavaScript peer; that file is required when declared.

```json
{
  "name": "@acme/NexisClaw-plugin",
  "NexisClaw": {
    "extensions": ["./src/index.ts"],
    "runtimeExtensions": ["./dist/index.js"]
  }
}
```

## Official plugins

### NexisClaw-owned npm packages during migration

ClawHub is the primary distribution path for most plugins. Current packaged
NexisClaw releases already bundle many official plugins, so those do not need
separate npm installs in normal setups. Until every NexisClaw-owned plugin has
migrated to ClawHub, NexisClaw still ships some `@NexisClaw/*` plugin packages on
npm for older/custom installs and direct npm workflows.

If npm reports an `@NexisClaw/*` plugin package as deprecated, that package
version is from an older external package train. Use the bundled plugin from
current NexisClaw or a local checkout until a newer npm package is published.

| Plugin          | Package                    | Docs                                       |
| --------------- | -------------------------- | ------------------------------------------ |
| Discord         | `@NexisClaw/discord`        | [Discord](/channels/discord)               |
| Feishu          | `@NexisClaw/feishu`         | [Feishu](/channels/feishu)                 |
| Matrix          | `@NexisClaw/matrix`         | [Matrix](/channels/matrix)                 |
| Mattermost      | `@NexisClaw/mattermost`     | [Mattermost](/channels/mattermost)         |
| Microsoft Teams | `@NexisClaw/msteams`        | [Microsoft Teams](/channels/msteams)       |
| Nextcloud Talk  | `@NexisClaw/nextcloud-talk` | [Nextcloud Talk](/channels/nextcloud-talk) |
| Nostr           | `@NexisClaw/nostr`          | [Nostr](/channels/nostr)                   |
| Synology Chat   | `@NexisClaw/synology-chat`  | [Synology Chat](/channels/synology-chat)   |
| Tlon            | `@NexisClaw/tlon`           | [Tlon](/channels/tlon)                     |
| WhatsApp        | `@NexisClaw/whatsapp`       | [WhatsApp](/channels/whatsapp)             |
| Zalo            | `@NexisClaw/zalo`           | [Zalo](/channels/zalo)                     |
| Zalo Personal   | `@NexisClaw/zalouser`       | [Zalo Personal](/plugins/zalouser)         |

### Core (shipped with NexisClaw)

<AccordionGroup>
  <Accordion title="Model providers (enabled by default)">
    `anthropic`, `byteplus`, `cloudflare-ai-gateway`, `github-copilot`, `google`,
    `huggingface`, `kilocode`, `kimi-coding`, `minimax`, `mistral`, `qwen`,
    `moonshot`, `nvidia`, `openai`, `opencode`, `opencode-go`, `openrouter`,
    `qianfan`, `synthetic`, `together`, `venice`,
    `vercel-ai-gateway`, `volcengine`, `xiaomi`, `zai`
  </Accordion>

  <Accordion title="Memory plugins">
    - `memory-core` - bundled memory search (default via `plugins.slots.memory`)
    - `memory-lancedb` - LanceDB-backed long-term memory with auto-recall/capture (set `plugins.slots.memory = "memory-lancedb"`)

    See [Memory LanceDB](/plugins/memory-lancedb) for OpenAI-compatible
    embedding setup, Ollama examples, recall limits, and troubleshooting.

  </Accordion>

  <Accordion title="Speech providers (enabled by default)">
    `elevenlabs`, `microsoft`
  </Accordion>

  <Accordion title="Other">
    - `browser` - bundled browser plugin for the browser tool, `NexisClaw browser` CLI, `browser.request` gateway method, browser runtime, and default browser control service (enabled by default; disable before replacing it)
    - `copilot-proxy` - VS Code Copilot Proxy bridge (disabled by default)

  </Accordion>
</AccordionGroup>

Looking for third-party plugins? See [ClawHub](/clawhub).

## Configuration

```json5
{
  plugins: {
    enabled: true,
    allow: ["voice-call"],
    deny: ["untrusted-plugin"],
    load: { paths: ["~/Projects/oss/voice-call-plugin"] },
    entries: {
      "voice-call": { enabled: true, config: { provider: "twilio" } },
    },
  },
}
```

| Field              | Description                                               |
| ------------------ | --------------------------------------------------------- |
| `enabled`          | Master toggle (default: `true`)                           |
| `allow`            | Plugin allowlist (optional)                               |
| `bundledDiscovery` | Bundled plugin discovery mode (`allowlist` by default)    |
| `deny`             | Plugin denylist (optional; deny wins)                     |
| `load.paths`       | Extra plugin files/directories                            |
| `slots`            | Exclusive slot selectors (e.g. `memory`, `contextEngine`) |
| `entries.\<id\>`   | Per-plugin toggles + config                               |

`plugins.allow` is exclusive. When it is non-empty, only listed plugins can load
or expose tools, even if `tools.allow` contains `"*"` or a specific plugin-owned
tool name. If a tool allowlist references plugin tools, add the owning plugin ids
to `plugins.allow` or remove `plugins.allow`; `NexisClaw doctor` warns about this
shape.

`plugins.bundledDiscovery` defaults to `"allowlist"` for new configs, so a
restrictive `plugins.allow` inventory also blocks omitted bundled provider
plugins, including runtime web-search provider discovery. Doctor stamps older
restrictive allowlist configs with `"compat"` during migration so upgrades keep
legacy bundled provider behavior until the operator opts into the stricter mode.
An empty `plugins.allow` is still treated as unset/open.

Config changes made through `/plugins enable` or `/plugins disable` trigger an
in-process Gateway plugin reload. New agent turns rebuild their tool list from
the refreshed plugin registry. Source-changing operations such as install,
update, and uninstall still restart the Gateway process because already-imported
plugin modules cannot be safely replaced in place.

`NexisClaw plugins list` is a local plugin registry/config snapshot. An
`enabled` plugin there means the persisted registry and current config allow the
plugin to participate. It does not prove that an already-running remote Gateway
has reloaded or restarted into the same plugin code. On VPS/container setups
with wrapper processes, send restarts or reload-triggering writes to the actual
`NexisClaw gateway run` process, or use `NexisClaw gateway restart` against the
running Gateway when the reload reports a failure.

<Accordion title="Plugin states: disabled vs missing vs invalid">
  - **Disabled**: plugin exists but enablement rules turned it off. Config is preserved.
  - **Missing**: config references a plugin id that discovery did not find.
  - **Invalid**: plugin exists but its config does not match the declared schema. Gateway startup skips only that plugin; `NexisClaw doctor --fix` can quarantine the invalid entry by disabling it and removing its config payload.

</Accordion>

## Discovery and precedence

NexisClaw scans for plugins in this order (first match wins):

<Steps>
  <Step title="Config paths">
    `plugins.load.paths` - explicit file or directory paths. Paths that point
    back at NexisClaw's own packaged bundled plugin directories are ignored;
    run `NexisClaw doctor --fix` to remove those stale aliases.
  </Step>

  <Step title="Workspace plugins">
    `\<workspace\>/.NexisClaw/<plugin-root>/*.ts` and `\<workspace\>/.NexisClaw/<plugin-root>/*/index.ts`.
  </Step>

  <Step title="Global plugins">
    `~/.NexisClaw/<plugin-root>/*.ts` and `~/.NexisClaw/<plugin-root>/*/index.ts`.
  </Step>

  <Step title="Bundled plugins">
    Shipped with NexisClaw. Many are enabled by default (model providers, speech).
    Others require explicit enablement.
  </Step>
</Steps>

Packaged installs and Docker images normally resolve bundled plugins from the
compiled `dist/extensions` tree. If a bundled plugin source directory is
bind-mounted over the matching packaged source path, for example
`/app/extensions/synology-chat`, NexisClaw treats that mounted source directory
as a bundled source overlay and discovers it before the packaged
`/app/dist/extensions/synology-chat` bundle. This keeps maintainer container
loops working without switching every bundled plugin back to TypeScript source.
Set `NEXISCLAW_DISABLE_BUNDLED_SOURCE_OVERLAYS=1` to force packaged dist bundles
even when source overlay mounts are present.

### Enablement rules

- `plugins.enabled: false` disables all plugins and skips plugin discovery/load work
- `plugins.deny` always wins over allow
- `plugins.entries.\<id\>.enabled: false` disables that plugin
- Workspace-origin plugins are **disabled by default** (must be explicitly enabled)
- Bundled plugins follow the built-in default-on set unless overridden
- Exclusive slots can force-enable the selected plugin for that slot
- Some bundled opt-in plugins are enabled automatically when config names a
  plugin-owned surface, such as a provider model ref, channel config, or harness
  runtime
- Stale plugin config is preserved while `plugins.enabled: false` is active;
  re-enable plugins before running doctor cleanup if you want stale ids removed
- OpenAI-family Codex routes keep separate plugin boundaries:
  `openai-codex/*` belongs to the OpenAI plugin, while the bundled Codex
  app-server plugin is selected by canonical `openai/*` agent refs, explicit
  provider/model `agentRuntime.id: "codex"`, or legacy `codex/*` model refs

## Troubleshooting runtime hooks

If a plugin appears in `plugins list` but `register(api)` side effects or hooks
do not run in live chat traffic, check these first:

- Run `NexisClaw gateway status --deep --require-rpc` and confirm the active
  Gateway URL, profile, config path, and process are the ones you are editing.
- Restart the live Gateway after plugin install/config/code changes. In wrapper
  containers, PID 1 may only be a supervisor; restart or signal the child
  `NexisClaw gateway run` process.
- Use `NexisClaw plugins inspect <id> --runtime --json` to confirm hook registrations and
  diagnostics. Non-bundled conversation hooks such as `before_model_resolve`,
  `before_agent_reply`, `before_agent_run`, `llm_input`, `llm_output`,
  `before_agent_finalize`, and `agent_end` need
  `plugins.entries.<id>.hooks.allowConversationAccess=true`.
- For model switching, prefer `before_model_resolve`. It runs before model
  resolution for agent turns; `llm_output` only runs after a model attempt
  produces assistant output.
- For proof of the effective session model, use `NexisClaw sessions` or the
  Gateway session/status surfaces and, when debugging provider payloads, start
  the Gateway with `--raw-stream --raw-stream-path <path>`.

### Slow plugin tool setup

If agent turns appear to stall while preparing tools, enable trace logging and
check for plugin tool factory timing lines:

```bash
NexisClaw config set logging.level trace
NexisClaw logs --follow
```

Look for:

```text
[trace:plugin-tools] factory timings ...
```

The summary lists total factory time and the slowest plugin tool factories,
including plugin id, declared tool names, result shape, and whether the tool is
optional. Slow lines are promoted to warnings when a single factory takes at
least 1s or total plugin tool factory prep takes at least 5s.

NexisClaw caches successful plugin tool factory results for repeated resolutions
with the same effective request context. The cache key includes the effective
runtime config, workspace, agent/session ids, sandbox policy, browser settings,
delivery context, requester identity, and ownership state, so factories that
depend on those trusted fields are re-run when the context changes.

If one plugin dominates the timing, inspect its runtime registrations:

```bash
NexisClaw plugins inspect <plugin-id> --runtime --json
```

Then update, reinstall, or disable that plugin. Plugin authors should move
expensive dependency loading behind the tool execution path instead of doing it
inside the tool factory.

### Duplicate channel or tool ownership

Symptoms:

- `channel already registered: <channel-id> (<plugin-id>)`
- `channel setup already registered: <channel-id> (<plugin-id>)`
- `plugin tool name conflict (<plugin-id>): <tool-name>`

These mean more than one enabled plugin is trying to own the same channel,
setup flow, or tool name. The most common cause is an external channel plugin
installed beside a bundled plugin that now provides the same channel id.

Debug steps:

- Run `NexisClaw plugins list --enabled --verbose` to see every enabled plugin
  and origin.
- Run `NexisClaw plugins inspect <id> --runtime --json` for each suspected plugin and
  compare `channels`, `channelConfigs`, `tools`, and diagnostics.
- Run `NexisClaw plugins registry --refresh` after installing or removing
  plugin packages so persisted metadata reflects the current install.
- Restart the Gateway after install, registry, or config changes.

Fix options:

- If one plugin intentionally replaces another for the same channel id, the
  preferred plugin should declare `channelConfigs.<channel-id>.preferOver` with
  the lower-priority plugin id. See [/plugins/manifest#replacing-another-channel-plugin](/plugins/manifest#replacing-another-channel-plugin).
- If the duplicate is accidental, disable one side with
  `plugins.entries.<plugin-id>.enabled: false` or remove the stale plugin
  install.
- If you explicitly enabled both plugins, NexisClaw keeps that request and
  reports the conflict. Pick one owner for the channel or rename plugin-owned
  tools so the runtime surface is unambiguous.

## Plugin slots (exclusive categories)

Some categories are exclusive (only one active at a time):

```json5
{
  plugins: {
    slots: {
      memory: "memory-core", // or "none" to disable
      contextEngine: "legacy", // or a plugin id
    },
  },
}
```

| Slot            | What it controls      | Default             |
| --------------- | --------------------- | ------------------- |
| `memory`        | Active memory plugin  | `memory-core`       |
| `contextEngine` | Active context engine | `legacy` (built-in) |

## CLI reference

```bash
NexisClaw plugins list                       # compact inventory
NexisClaw plugins list --enabled            # only enabled plugins
NexisClaw plugins list --verbose            # per-plugin detail lines
NexisClaw plugins list --json               # machine-readable inventory
NexisClaw plugins search <query>            # search ClawHub plugin catalog
NexisClaw plugins inspect <id>              # static detail
NexisClaw plugins inspect <id> --runtime    # registered hooks/tools/CLI/gateway methods
NexisClaw plugins inspect <id> --json       # machine-readable
NexisClaw plugins inspect --all             # fleet-wide table
NexisClaw plugins info <id>                 # inspect alias
NexisClaw plugins doctor                    # diagnostics
NexisClaw plugins registry                  # inspect persisted registry state
NexisClaw plugins registry --refresh        # rebuild persisted registry
NexisClaw doctor --fix                      # repair plugin registry state

NexisClaw plugins install <package>         # install from npm by default
NexisClaw plugins install clawhub:<pkg>     # install from ClawHub only
NexisClaw plugins install npm:<pkg>         # install from npm only
NexisClaw plugins install git:<repo>        # install from git
NexisClaw plugins install git:<repo>@<ref>  # install from git ref
NexisClaw plugins install <spec> --force    # overwrite existing install
NexisClaw plugins install <path>            # install from local path
NexisClaw plugins install -l <path>         # link (no copy) for dev
NexisClaw plugins install <plugin> --marketplace <source>
NexisClaw plugins install <plugin> --marketplace https://github.com/<owner>/<repo>
NexisClaw plugins install <spec> --pin      # record exact resolved npm spec
NexisClaw plugins install <spec> --dangerously-force-unsafe-install
NexisClaw plugins update <id-or-npm-spec> # update one plugin
NexisClaw plugins update <id-or-npm-spec> --dangerously-force-unsafe-install
NexisClaw plugins update --all            # update all
NexisClaw plugins uninstall <id>          # remove config and plugin index records
NexisClaw plugins uninstall <id> --keep-files
NexisClaw plugins marketplace list <source>
NexisClaw plugins marketplace list <source> --json

# Verify runtime registrations after install.
NexisClaw plugins inspect <id> --runtime --json

# Run plugin-owned CLI commands directly from the NexisClaw root CLI.
NexisClaw <plugin-command> --help

NexisClaw plugins enable <id>
NexisClaw plugins disable <id>
```

Bundled plugins ship with NexisClaw. Many are enabled by default (for example
bundled model providers, bundled speech providers, and the bundled browser
plugin). Other bundled plugins still need `NexisClaw plugins enable <id>`.

`--force` overwrites an existing installed plugin or hook pack in place. Use
`NexisClaw plugins update <id-or-npm-spec>` for routine upgrades of tracked npm
plugins. It is not supported with `--link`, which reuses the source path instead
of copying over a managed install target.

When `plugins.allow` is already set, `NexisClaw plugins install` adds the
installed plugin id to that allowlist before enabling it. If the same plugin id
is present in `plugins.deny`, install removes that stale deny entry so the
explicit install is immediately loadable after restart.

NexisClaw keeps a persisted local plugin registry as the cold read model for
plugin inventory, contribution ownership, and startup planning. Install, update,
uninstall, enable, and disable flows refresh that registry after changing plugin
state. The same `plugins/installs.json` file keeps durable install metadata in
top-level `installRecords` and rebuildable manifest metadata in `plugins`. If
the registry is missing, stale, or invalid, `NexisClaw plugins registry
--refresh` rebuilds its manifest view from install records, config policy, and
manifest/package metadata without loading plugin runtime modules.

In Nix mode (`NEXISCLAW_NIX_MODE=1`), plugin lifecycle mutators are disabled.
Manage plugin package selection and config through the Nix source for the
install instead; for nix-NexisClaw, start with the agent-first
[Quick Start](https://github.com/NexisClaw/nix-NexisClaw#quick-start).
`NexisClaw plugins update <id-or-npm-spec>` applies to tracked installs. Passing
an npm package spec with a dist-tag or exact version resolves the package name
back to the tracked plugin record and records the new spec for future updates.
Passing the package name without a version moves an exact pinned install back to
the registry's default release line. If the installed npm plugin already matches
the resolved version and recorded artifact identity, NexisClaw skips the update
without downloading, reinstalling, or rewriting config.
When `NexisClaw update` runs on the beta channel, default-line npm and ClawHub
plugin records try `@beta` first and fall back to default/latest when no plugin
beta release exists. Exact versions and explicit tags stay pinned.

`--pin` is npm-only. It is not supported with `--marketplace`, because
marketplace installs persist marketplace source metadata instead of an npm spec.

`--dangerously-force-unsafe-install` is a break-glass override for false
positives from the built-in dangerous-code scanner. It allows plugin installs
and plugin updates to continue past built-in `critical` findings, but it still
does not bypass plugin `before_install` policy blocks or scan-failure blocking.
Install scans ignore common test files and directories such as `tests/`,
`__tests__/`, `*.test.*`, and `*.spec.*` to avoid blocking packaged test mocks;
declared plugin runtime entrypoints are still scanned even if they use one of
those names.

This CLI flag applies to plugin install/update flows only. Gateway-backed skill
dependency installs use the matching `dangerouslyForceUnsafeInstall` request
override instead, while `NexisClaw skills install` remains the separate ClawHub
skill download/install flow.

If a plugin you published on ClawHub is hidden or blocked by a scan, open the
ClawHub dashboard or run `clawhub package rescan <name>` to ask ClawHub to check
it again. `--dangerously-force-unsafe-install` only affects installs on your own
machine; it does not ask ClawHub to rescan the plugin or make a blocked release
public.

Compatible bundles participate in the same plugin list/inspect/enable/disable
flow. Current runtime support includes bundle skills, Claude command-skills,
Claude `settings.json` defaults, Claude `.lsp.json` and manifest-declared
`lspServers` defaults, Cursor command-skills, and compatible Codex hook
directories.

`NexisClaw plugins inspect <id>` also reports detected bundle capabilities plus
supported or unsupported MCP and LSP server entries for bundle-backed plugins.

Marketplace sources can be a Claude known-marketplace name from
`~/.claude/plugins/known_marketplaces.json`, a local marketplace root or
`marketplace.json` path, a GitHub shorthand like `owner/repo`, a GitHub repo
URL, or a git URL. For remote marketplaces, plugin entries must stay inside the
cloned marketplace repo and use relative path sources only.

See [`NexisClaw plugins` CLI reference](/cli/plugins) for full details.

## Plugin API overview

Native plugins export an entry object that exposes `register(api)`. Older
plugins may still use `activate(api)` as a legacy alias, but new plugins should
use `register`.

```typescript
export default definePluginEntry({
  id: "my-plugin",
  name: "My Plugin",
  register(api) {
    api.registerProvider({
      /* ... */
    });
    api.registerTool({
      /* ... */
    });
    api.registerChannel({
      /* ... */
    });
  },
});
```

NexisClaw loads the entry object and calls `register(api)` during plugin
activation. The loader still falls back to `activate(api)` for older plugins,
but bundled plugins and new external plugins should treat `register` as the
public contract.

`api.registrationMode` tells a plugin why its entry is being loaded:

| Mode            | Meaning                                                                                                                          |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `full`          | Runtime activation. Register tools, hooks, services, commands, routes, and other live side effects.                              |
| `discovery`     | Read-only capability discovery. Register providers and metadata; trusted plugin entry code may load, but skip live side effects. |
| `setup-only`    | Channel setup metadata loading through a lightweight setup entry.                                                                |
| `setup-runtime` | Channel setup loading that also needs the runtime entry.                                                                         |
| `cli-metadata`  | CLI command metadata collection only.                                                                                            |

Plugin entries that open sockets, databases, background workers, or long-lived
clients should guard those side effects with `api.registrationMode === "full"`.
Discovery loads are cached separately from activating loads and do not replace
the running Gateway registry. Discovery is non-activating, not import-free:
NexisClaw may evaluate the trusted plugin entry or channel plugin module to build
the snapshot. Keep module top levels lightweight and side-effect-free, and move
network clients, subprocesses, listeners, credential reads, and service startup
behind full-runtime paths.

Common registration methods:

| Method                                  | What it registers           |
| --------------------------------------- | --------------------------- |
| `registerProvider`                      | Model provider (LLM)        |
| `registerChannel`                       | Chat channel                |
| `registerTool`                          | Agent tool                  |
| `registerHook` / `on(...)`              | Lifecycle hooks             |
| `registerSpeechProvider`                | Text-to-speech / STT        |
| `registerRealtimeTranscriptionProvider` | Streaming STT               |
| `registerRealtimeVoiceProvider`         | Duplex realtime voice       |
| `registerMediaUnderstandingProvider`    | Image/audio analysis        |
| `registerImageGenerationProvider`       | Image generation            |
| `registerMusicGenerationProvider`       | Music generation            |
| `registerVideoGenerationProvider`       | Video generation            |
| `registerWebFetchProvider`              | Web fetch / scrape provider |
| `registerWebSearchProvider`             | Web search                  |
| `registerHttpRoute`                     | HTTP endpoint               |
| `registerCommand` / `registerCli`       | CLI commands                |
| `registerContextEngine`                 | Context engine              |
| `registerService`                       | Background service          |

Hook guard behavior for typed lifecycle hooks:

- `before_tool_call`: `{ block: true }` is terminal; lower-priority handlers are skipped.
- `before_tool_call`: `{ block: false }` is a no-op and does not clear an earlier block.
- `before_install`: `{ block: true }` is terminal; lower-priority handlers are skipped.
- `before_install`: `{ block: false }` is a no-op and does not clear an earlier block.
- `message_sending`: `{ cancel: true }` is terminal; lower-priority handlers are skipped.
- `message_sending`: `{ cancel: false }` is a no-op and does not clear an earlier cancel.

Native Codex app-server runs bridge Codex-native tool events back into this
hook surface. Plugins can block native Codex tools through `before_tool_call`,
observe results through `after_tool_call`, and participate in Codex
`PermissionRequest` approvals. The bridge does not rewrite Codex-native tool
arguments yet. The exact Codex runtime support boundary lives in the
[Codex harness v1 support contract](/plugins/codex-harness-runtime#v1-support-contract).

For full typed hook behavior, see [SDK overview](/plugins/sdk-overview#hook-decision-semantics).

## Related

- [Building plugins](/plugins/building-plugins) - create your own plugin
- [Plugin bundles](/plugins/bundles) - Codex/Claude/Cursor bundle compatibility
- [Plugin manifest](/plugins/manifest) - manifest schema
- [Registering tools](/plugins/building-plugins#registering-agent-tools) - add agent tools in a plugin
- [Plugin internals](/plugins/architecture) - capability model and load pipeline
- [ClawHub](/clawhub) - third-party plugin discovery
