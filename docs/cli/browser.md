---
summary: "CLI reference for `NexisClaw browser` (lifecycle, profiles, tabs, actions, state, and debugging)"
read_when:
  - You use `NexisClaw browser` and want examples for common tasks
  - You want to control a browser running on another machine via a node host
  - You want to attach to your local signed-in Chrome via Chrome MCP
title: "Browser"
---

# `NexisClaw browser`

Manage NexisClaw's browser control surface and run browser actions (lifecycle, profiles, tabs, snapshots, screenshots, navigation, input, state emulation, and debugging).

Related:

- Browser tool + API: [Browser tool](/tools/browser)

## Common flags

- `--url <gatewayWsUrl>`: Gateway WebSocket URL (defaults to config).
- `--token <token>`: Gateway token (if required).
- `--timeout <ms>`: request timeout (ms).
- `--expect-final`: wait for a final Gateway response.
- `--browser-profile <name>`: choose a browser profile (default from config).
- `--json`: machine-readable output (where supported).

## Quick start (local)

```bash
NexisClaw browser profiles
NexisClaw browser --browser-profile NexisClaw start
NexisClaw browser --browser-profile NexisClaw open https://example.com
NexisClaw browser --browser-profile NexisClaw snapshot
```

Agents can run the same readiness check with `browser({ action: "doctor" })`.

## Quick troubleshooting

If `start` fails with `not reachable after start`, troubleshoot CDP readiness first. If `start` and `tabs` succeed but `open` or `navigate` fails, the browser control plane is healthy and the failure is usually navigation SSRF policy.

Minimal sequence:

```bash
NexisClaw browser --browser-profile NexisClaw doctor
NexisClaw browser --browser-profile NexisClaw start
NexisClaw browser --browser-profile NexisClaw tabs
NexisClaw browser --browser-profile NexisClaw open https://example.com
```

Detailed guidance: [Browser troubleshooting](/tools/browser#cdp-startup-failure-vs-navigation-ssrf-block)

## Lifecycle

```bash
NexisClaw browser status
NexisClaw browser doctor
NexisClaw browser doctor --deep
NexisClaw browser start
NexisClaw browser start --headless
NexisClaw browser stop
NexisClaw browser --browser-profile NexisClaw reset-profile
```

Notes:

- `doctor --deep` adds a live snapshot probe. It is useful when basic CDP
  readiness is green but you want proof that the current tab can be inspected.
- For `attachOnly` and remote CDP profiles, `NexisClaw browser stop` closes the
  active control session and clears temporary emulation overrides even when
  NexisClaw did not launch the browser process itself.
- For local managed profiles, `NexisClaw browser stop` stops the spawned browser
  process.
- `NexisClaw browser start --headless` applies only to that start request and
  only when NexisClaw launches a local managed browser. It does not rewrite
  `browser.headless` or profile config, and it is a no-op for an already-running
  browser.
- On Linux hosts without `DISPLAY` or `WAYLAND_DISPLAY`, local managed profiles
  run headless automatically unless `NEXISCLAW_BROWSER_HEADLESS=0`,
  `browser.headless=false`, or `browser.profiles.<name>.headless=false`
  explicitly requests a visible browser.

## If the command is missing

If `NexisClaw browser` is an unknown command, check `plugins.allow` in
`~/.NexisClaw/NexisClaw.json`.

When `plugins.allow` is present, list the bundled browser plugin explicitly
unless the config already has a root `browser` block:

```json5
{
  plugins: {
    allow: ["telegram", "browser"],
  },
}
```

An explicit root `browser` block, for example `browser.enabled=true` or
`browser.profiles.<name>`, also activates the bundled browser plugin under a
restrictive plugin allowlist.

Related: [Browser tool](/tools/browser#missing-browser-command-or-tool)

## Profiles

Profiles are named browser routing configs. In practice:

- `NexisClaw`: launches or attaches to a dedicated NexisClaw-managed Chrome instance (isolated user data dir).
- `user`: controls your existing signed-in Chrome session via Chrome DevTools MCP.
- custom CDP profiles: point at a local or remote CDP endpoint.

```bash
NexisClaw browser profiles
NexisClaw browser create-profile --name work --color "#FF5A36"
NexisClaw browser create-profile --name chrome-live --driver existing-session
NexisClaw browser create-profile --name remote --cdp-url https://browser-host.example.com
NexisClaw browser delete-profile --name work
```

Use a specific profile:

```bash
NexisClaw browser --browser-profile work tabs
```

## Tabs

```bash
NexisClaw browser tabs
NexisClaw browser tab new --label docs
NexisClaw browser tab label t1 docs
NexisClaw browser tab select 2
NexisClaw browser tab close 2
NexisClaw browser open https://docs.NexisClaw.ai --label docs
NexisClaw browser focus docs
NexisClaw browser close t1
```

`tabs` returns `suggestedTargetId` first, then the stable `tabId` such as `t1`,
the optional label, and the raw `targetId`. Agents should pass
`suggestedTargetId` back into `focus`, `close`, snapshots, and actions. You can
assign a label with `open --label`, `tab new --label`, or `tab label`; labels,
tab ids, raw target ids, and unique target-id prefixes are all accepted.
When Chromium replaces the underlying raw target during a navigation or form
submit, NexisClaw keeps the stable `tabId`/label attached to the replacement tab
when it can prove the match. Raw target ids remain volatile; prefer
`suggestedTargetId`.

## Snapshot / screenshot / actions

Snapshot:

```bash
NexisClaw browser snapshot
NexisClaw browser snapshot --urls
```

Screenshot:

```bash
NexisClaw browser screenshot
NexisClaw browser screenshot --full-page
NexisClaw browser screenshot --ref e12
NexisClaw browser screenshot --labels
```

Notes:

- `--full-page` is for page captures only; it cannot be combined with `--ref`
  or `--element`.
- `existing-session` / `user` profiles support page screenshots and `--ref`
  screenshots from snapshot output, but not CSS `--element` screenshots.
- `--labels` overlays current snapshot refs on the screenshot.
- `snapshot --urls` appends discovered link destinations to AI snapshots so
  agents can choose direct navigation targets instead of guessing from link
  text alone.

Navigate/click/type (ref-based UI automation):

```bash
NexisClaw browser navigate https://example.com
NexisClaw browser click <ref>
NexisClaw browser click-coords 120 340
NexisClaw browser type <ref> "hello"
NexisClaw browser press Enter
NexisClaw browser hover <ref>
NexisClaw browser scrollintoview <ref>
NexisClaw browser drag <startRef> <endRef>
NexisClaw browser select <ref> OptionA OptionB
NexisClaw browser fill --fields '[{"ref":"1","value":"Ada"}]'
NexisClaw browser wait --text "Done"
NexisClaw browser evaluate --fn '(el) => el.textContent' --ref <ref>
```

Action responses return the current raw `targetId` after action-triggered page
replacement when NexisClaw can prove the replacement tab. Scripts should still
store and pass `suggestedTargetId`/labels for long-lived workflows.

File + dialog helpers:

```bash
NexisClaw browser upload /tmp/NexisClaw/uploads/file.pdf --ref <ref>
NexisClaw browser waitfordownload
NexisClaw browser download <ref> report.pdf
NexisClaw browser dialog --accept
```

Managed Chrome profiles save ordinary click-triggered downloads into the NexisClaw
downloads directory (`/tmp/NexisClaw/downloads` by default, or the configured temp
root). Use `waitfordownload` or `download` when the agent needs to wait for a
specific file and return its path; those explicit waiters own the next download.

## State and storage

Viewport + emulation:

```bash
NexisClaw browser resize 1280 720
NexisClaw browser set viewport 1280 720
NexisClaw browser set offline on
NexisClaw browser set media dark
NexisClaw browser set timezone Europe/London
NexisClaw browser set locale en-GB
NexisClaw browser set geo 51.5074 -0.1278 --accuracy 25
NexisClaw browser set device "iPhone 14"
NexisClaw browser set headers '{"x-test":"1"}'
NexisClaw browser set credentials myuser mypass
```

Cookies + storage:

```bash
NexisClaw browser cookies
NexisClaw browser cookies set session abc123 --url https://example.com
NexisClaw browser cookies clear
NexisClaw browser storage local get
NexisClaw browser storage local set token abc123
NexisClaw browser storage session clear
```

## Debugging

```bash
NexisClaw browser console --level error
NexisClaw browser pdf
NexisClaw browser responsebody "**/api"
NexisClaw browser highlight <ref>
NexisClaw browser errors --clear
NexisClaw browser requests --filter api
NexisClaw browser trace start
NexisClaw browser trace stop --out trace.zip
```

## Existing Chrome via MCP

Use the built-in `user` profile, or create your own `existing-session` profile:

```bash
NexisClaw browser --browser-profile user tabs
NexisClaw browser create-profile --name chrome-live --driver existing-session
NexisClaw browser create-profile --name brave-live --driver existing-session --user-data-dir "~/Library/Application Support/BraveSoftware/Brave-Browser"
NexisClaw browser --browser-profile chrome-live tabs
```

This path is host-only. For Docker, headless servers, Browserless, or other remote setups, use a CDP profile instead.

Current existing-session limits:

- snapshot-driven actions use refs, not CSS selectors
- `browser.actionTimeoutMs` defaults supported `act` requests to 60000 ms when
  callers omit `timeoutMs`; per-call `timeoutMs` still wins.
- `click` is left-click only
- `type` does not support `slowly=true`
- `press` does not support `delayMs`
- `hover`, `scrollintoview`, `drag`, `select`, `fill`, and `evaluate` reject
  per-call timeout overrides
- `select` supports one value only
- `wait --load networkidle` is not supported
- file uploads require `--ref` / `--input-ref`, do not support CSS
  `--element`, and currently support one file at a time
- dialog hooks do not support `--timeout`
- screenshots support page captures and `--ref`, but not CSS `--element`
- `responsebody`, download interception, PDF export, and batch actions still
  require a managed browser or raw CDP profile

## Remote browser control (node host proxy)

If the Gateway runs on a different machine than the browser, run a **node host** on the machine that has Chrome/Brave/Edge/Chromium. The Gateway will proxy browser actions to that node (no separate browser control server required).

Use `gateway.nodes.browser.mode` to control auto-routing and `gateway.nodes.browser.node` to pin a specific node if multiple are connected.

Security + remote setup: [Browser tool](/tools/browser), [Remote access](/gateway/remote), [Tailscale](/gateway/tailscale), [Security](/gateway/security)

## Related

- [CLI reference](/cli)
- [Browser](/tools/browser)
