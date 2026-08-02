# CapitalGlass-Cross-Agent

Cross-agent workspace for ChatGPT, Cursor, and you.

**Agents: start at [`AGENT_START_HERE.md`](./AGENT_START_HERE.md).**

## Read order

| Order | File | Purpose |
| --- | --- | --- |
| 1 | [`AGENT_START_HERE.md`](./AGENT_START_HERE.md) | Operating rules and first-read path |
| 2 | [`work-progress/WORKSPACE_CONTEXT.md`](./work-progress/WORKSPACE_CONTEXT.md) | Workspace and repo ownership |
| 3 | [`work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md`](./work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md) | Canonical map for L:/Z:/repo knowledge locations |
| 4 | [`work-progress/ACTIVE_WORK.md`](./work-progress/ACTIVE_WORK.md) | Live ledger and current blockers |
| 5 | [`work-progress/projects/INDEX.md`](./work-progress/projects/INDEX.md) | Project/work-package index |

## Most important rule

**This repo may describe work.**  
**This repo must not become the work.**

No implementation code, MCP servers, databases, Bible copies, or app scaffolding here.

## Folders

| Folder | Purpose | Rule |
| --- | --- | --- |
| `work-progress/` | Shared editable current-work ledger for you, ChatGPT, Cursor, and agents | Current status/progress only; no code or secrets |
| `inbox/` | Raw requests or rough notes before they become work | Temporary only |
| `plans/` | ChatGPT-authored plans before implementation | No code |
| `cursor-reports/` | Cursor reports after work is done | Evidence/status only |
| `chatgpt-reviews/` | ChatGPT reviews when explicitly requested | Review only |
| `decisions/` | Final decisions, architecture calls, “we chose X because Y” | Short, durable |
| `runbooks/` | Repeatable operating instructions | Step-by-step only |
| `verification/` | Smoke-test prompts, pass/fail checklists, connector tests | Evidence-focused |
| `handoffs/` | Human/agent handoff docs between ChatGPT, Cursor, you | Current work transfer |
| `archive/` | Old reports/plans that should not guide current work | Dead reference only |
| `repo-map/` | Durable repo ownership and role maps | Pointers only; no implementation |

## Do not add

`src/`, `scripts/`, `tools/`, `mcp/`, `supabase/`, `database/`, `bibles/`, `apps/`, `packages/`

## Agent rules

- ChatGPT writes plans only when explicitly asked.
- Cursor writes implementation reports.
- ChatGPT writes reviews only when explicitly asked.
- Implementation happens in the owning application repos.
- Application Bibles are read-only and are not copied into this repo.
- This repo is not an app, MCP server, database, deployment target, or control plane.
- Active progress goes in `work-progress/ACTIVE_WORK.md`.
