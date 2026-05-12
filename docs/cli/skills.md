---
summary: "CLI reference for `NexisClaw skills` (search/install/update/list/info/check)"
read_when:
  - You want to see which skills are available and ready to run
  - You want to search, install, or update skills from ClawHub
  - You want to debug missing binaries/env/config for skills
title: "Skills"
---

# `NexisClaw skills`

Inspect local skills and install/update skills from ClawHub.

Related:

- Skills system: [Skills](/tools/skills)
- Skills config: [Skills config](/tools/skills-config)
- ClawHub installs: [ClawHub](/clawhub/cli)

## Commands

```bash
NexisClaw skills search "calendar"
NexisClaw skills search --limit 20 --json
NexisClaw skills install <slug>
NexisClaw skills install <slug> --version <version>
NexisClaw skills install <slug> --force
NexisClaw skills install <slug> --agent <id>
NexisClaw skills update <slug>
NexisClaw skills update --all
NexisClaw skills update --all --agent <id>
NexisClaw skills list
NexisClaw skills list --eligible
NexisClaw skills list --json
NexisClaw skills list --verbose
NexisClaw skills list --agent <id>
NexisClaw skills info <name>
NexisClaw skills info <name> --json
NexisClaw skills info <name> --agent <id>
NexisClaw skills check
NexisClaw skills check --agent <id>
NexisClaw skills check --json
```

`search`/`install`/`update` use ClawHub directly and install into the active
workspace `skills/` directory. `list`/`info`/`check` still inspect the local
skills visible to the current workspace and config. Workspace-backed commands
resolve the target workspace from `--agent <id>`, then the current working
directory when it is inside a configured agent workspace, then the default
agent.

This CLI `install` command downloads skill folders from ClawHub. Gateway-backed
skill dependency installs triggered from onboarding or Skills settings use the
separate `skills.install` request path instead.

Notes:

- `search [query...]` accepts an optional query; omit it to browse the default
  ClawHub search feed.
- `search --limit <n>` caps returned results.
- `install --force` overwrites an existing workspace skill folder for the same
  slug.
- `--agent <id>` targets one configured agent workspace and overrides current
  working directory inference.
- `update --all` only updates tracked ClawHub installs in the active workspace.
- `check --agent <id>` checks the selected agent's workspace and reports which
  ready skills are actually visible to that agent's prompt or command surface.
- `list` is the default action when no subcommand is provided.
- `list`, `info`, and `check` write their rendered output to stdout. With
  `--json`, that means the machine-readable payload stays on stdout for pipes
  and scripts.

## Related

- [CLI reference](/cli)
- [Skills](/tools/skills)
