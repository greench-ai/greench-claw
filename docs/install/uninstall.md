---
summary: "Uninstall NexisClaw completely (CLI, service, state, workspace)"
read_when:
  - You want to remove NexisClaw from a machine
  - The gateway service is still running after uninstall
title: "Uninstall"
---

Two paths:

- **Easy path** if `NexisClaw` is still installed.
- **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash
NexisClaw uninstall
```

Non-interactive (automation / npx):

```bash
NexisClaw uninstall --all --yes --non-interactive
npx -y NexisClaw uninstall --all --yes --non-interactive
```

Manual steps (same result):

1. Stop the gateway service:

```bash
NexisClaw gateway stop
```

2. Uninstall the gateway service (launchd/systemd/schtasks):

```bash
NexisClaw gateway uninstall
```

3. Delete state + config:

```bash
rm -rf "${NEXISCLAW_STATE_DIR:-$HOME/.NexisClaw}"
```

If you set `NEXISCLAW_CONFIG_PATH` to a custom location outside the state dir, delete that file too.

4. Delete your workspace (optional, removes agent files):

```bash
rm -rf ~/.NexisClaw/workspace
```

5. Remove the CLI install (pick the one you used):

```bash
npm rm -g NexisClaw
pnpm remove -g NexisClaw
bun remove -g NexisClaw
```

6. If you installed the macOS app:

```bash
rm -rf /Applications/NexisClaw.app
```

Notes:

- If you used profiles (`--profile` / `NEXISCLAW_PROFILE`), repeat step 3 for each state dir (defaults are `~/.NexisClaw-<profile>`).
- In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `NexisClaw` is missing.

### macOS (launchd)

Default label is `ai.NexisClaw.gateway` (or `ai.NexisClaw.<profile>`; legacy `com.NexisClaw.*` may still exist):

```bash
launchctl bootout gui/$UID/ai.NexisClaw.gateway
rm -f ~/Library/LaunchAgents/ai.NexisClaw.gateway.plist
```

If you used a profile, replace the label and plist name with `ai.NexisClaw.<profile>`. Remove any legacy `com.NexisClaw.*` plists if present.

### Linux (systemd user unit)

Default unit name is `NexisClaw-gateway.service` (or `NexisClaw-gateway-<profile>.service`):

```bash
systemctl --user disable --now NexisClaw-gateway.service
rm -f ~/.config/systemd/user/NexisClaw-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `NexisClaw Gateway` (or `NexisClaw Gateway (<profile>)`).
The task script lives under your state dir.

```powershell
schtasks /Delete /F /TN "NexisClaw Gateway"
Remove-Item -Force "$env:USERPROFILE\.NexisClaw\gateway.cmd"
```

If you used a profile, delete the matching task name and `~\.NexisClaw-<profile>\gateway.cmd`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://NexisClaw.ai/install.sh` or `install.ps1`, the CLI was installed with `npm install -g NexisClaw@latest`.
Remove it with `npm rm -g NexisClaw` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `NexisClaw ...` / `bun run NexisClaw ...`):

1. Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2. Delete the repo directory.
3. Remove state + workspace as shown above.

## Related

- [Install overview](/install)
- [Migration guide](/install/migrating)
