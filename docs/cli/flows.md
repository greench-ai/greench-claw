---
summary: "Redirect: flow commands live under `NexisClaw tasks flow`"
read_when:
  - You encounter `NexisClaw flows` in older docs or release notes
  - You want a quick TaskFlow inspection reference
title: "Flows (redirect)"
---

# `NexisClaw tasks flow`

There is no top-level `NexisClaw flows` command. Durable TaskFlow inspection lives under `NexisClaw tasks flow`.

## Subcommands

```bash
NexisClaw tasks flow list   [--json] [--status <name>]
NexisClaw tasks flow show   <lookup> [--json]
NexisClaw tasks flow cancel <lookup>
```

| Subcommand | Description                | Arguments / options                                                                   |
| ---------- | -------------------------- | ------------------------------------------------------------------------------------- |
| `list`     | List tracked TaskFlows.    | `--json` machine-readable output; `--status <name>` filter (see status values below). |
| `show`     | Show one TaskFlow.         | `<lookup>` flow id or owner key; `--json` machine-readable output.                    |
| `cancel`   | Cancel a running TaskFlow. | `<lookup>` flow id or owner key.                                                      |

`<lookup>` accepts either a flow id (returned by `list` / `show`) or the flow's owner key (the stable identifier the owning subsystem uses to track the flow).

### Status filter values

`--status` on `list` accepts one of:

`queued`, `running`, `waiting`, `blocked`, `succeeded`, `failed`, `cancelled`, `lost`

## Examples

```bash
NexisClaw tasks flow list
NexisClaw tasks flow list --status running
NexisClaw tasks flow list --json
NexisClaw tasks flow show flow_abc123
NexisClaw tasks flow show flow_abc123 --json
NexisClaw tasks flow cancel flow_abc123
```

For full TaskFlow concepts and authoring see [TaskFlow](/automation/taskflow). For the parent `tasks` command see [tasks CLI reference](/cli/tasks).

## Related

- [CLI reference](/cli)
- [Automation](/automation)
- [TaskFlow](/automation/taskflow)
