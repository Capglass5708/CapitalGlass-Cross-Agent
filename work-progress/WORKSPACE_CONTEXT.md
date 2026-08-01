# Active Workspace Context

This file states the active workspace and the repositories involved in the current work.

Purpose: give Wesley, ChatGPT, Cursor, and other agents a fast orientation point before touching any repo.

## Workspace

| Field | Value |
| --- | --- |
| Workspace name | Governance / North Star / Bible authority workspace |
| Coordination repo | CapitalGlass-Cross-Agent |
| Current focus | Move protocol authority to Governance while keeping AppBuilder as execution adapter |
| Last updated | 2026-08-01 |
| Valuable-work ledger | `work-progress/ACTIVE_WORK.md` |

## Required writing rule

All valuable build information must be written into the meeting repo as the work progresses.

Every material update must include, when available:

- project ID or Cursor project ID
- work package ID
- timestamp
- source: ChatGPT, Cursor, human, or agent name
- repos involved
- status
- pertinent notes
- commits / PRs when changed
- verification results when validated
- next action unless complete

Do not rely on chat memory alone. If the information affects future work, agent behavior, repo ownership, authority, verification, recovery, reuse, or next actions, write it here or in `work-progress/ACTIVE_WORK.md`.

Do not write secrets, credentials, database dumps, Bible copies, app source code, or implementation code into this repo.

## Repositories involved

| Repo | Role in this workspace | What belongs there | What does not belong there |
| --- | --- | --- | --- |
| `CapitalGlass-Cross-Agent` | Meeting / coordination repo | Active work ledger, runbooks, handoffs, verification notes, repo-role context | App code, MCP server code, database code, Bible copies, implementation scripts |
| `CG-Platform-Governance-MCP` | Authority repo | North Star Protocol, governance decisions, capture contract, closeout validation, compounding proof schema, Synology/Supabase/cache authority rules | AppBuilder execution scripts, corpus writers, Bible sync/index execution, DSM operations |
| `CG-AppBuilder-MCP` | Execution/support repo | App-building execution, context compile, Bible sync/index, cache operations, corpus sync, harvest execution, Supabase ingest adapters | Final protocol authority, deciding whether completed work counts, duplicate North Star rules |

## Current authority split

Permanent rule:

> Governance decides what must be captured and whether work counts. AppBuilder may produce receipts, but AppBuilder is not the source of truth for the protocol.

| Responsibility | Permanent owner |
| --- | --- |
| North Star Protocol | `CG-Platform-Governance-MCP` |
| Capture contract for chat/work intelligence | `CG-Platform-Governance-MCP` |
| Required closeout evidence | `CG-Platform-Governance-MCP` |
| `north-star-compounding-proof-v1` schema and validation | `CG-Platform-Governance-MCP` |
| Whether material work is complete | `CG-Platform-Governance-MCP` |
| Synology/Supabase/cache authority rules | `CG-Platform-Governance-MCP` |
| Writing/syncing/indexing/caching execution | `CG-AppBuilder-MCP` or future execution adapters |
| Meeting notes, runbooks, active progress | `CapitalGlass-Cross-Agent` |

## Current active files in this repo

| File | Purpose |
| --- | --- |
| `work-progress/ACTIVE_WORK.md` | Shared editable valuable-work ledger with timestamped project/work-package entries |
| `work-progress/WORKSPACE_CONTEXT.md` | This workspace and repo-role map |
| `verification/application-bible-sync-runbook.md` | Bible sync/gate verification runbook |
| `cursor-reports/2026-08-01-chatgpt-bible-access-verification.md` | ChatGPT Bible access verification handoff |

## Current saved commits referenced by this workspace

| Repo | Commit | Purpose |
| --- | --- | --- |
| `CapitalGlass-Cross-Agent` | `76b34fe` | Application Bible sync runbook |
| `CG-AppBuilder-MCP` | `dc32d991` | `bible:authority:gate` |

## Agent instruction

Before starting related work, read this file and `work-progress/ACTIVE_WORK.md`.

Then work in the correct repo:

- Coordination or handoff only → `CapitalGlass-Cross-Agent`
- Protocol authority or validation → `CG-Platform-Governance-MCP`
- Execution adapter, sync, index, cache, harvest, or AppBuilder implementation → `CG-AppBuilder-MCP`

As work proceeds, write valuable build information back into `work-progress/ACTIVE_WORK.md` using timestamped project/work-package entries.