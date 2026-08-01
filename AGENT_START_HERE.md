# Agent Start Here

**Read this file before doing anything in this repo.**

CapitalGlass-Cross-Agent is the **meeting / coordination repo** for Wesley, ChatGPT, Cursor, and other agents. It records what is happening across the Capital Glass build. It is **not** where implementation happens.

---

## The one rule

> **This repo may describe work. This repo must not become the work.**

No implementation code, MCP servers, databases, Bible copies, app scaffolding, or secrets here.

---

## What to read first (in order)

| Order | File | Why |
| --- | --- | --- |
| 1 | `AGENT_START_HERE.md` | This file — rules and orientation |
| 2 | `work-progress/WORKSPACE_CONTEXT.md` | Active workspace, repo roles, authority split |
| 3 | `work-progress/ACTIVE_WORK.md` | Current valuable-work ledger and progress log |
| 4 | `work-progress/projects/INDEX.md` | Master index of all project files |
| 5 | Relevant project file in `work-progress/projects/` | Durable notes for the specific mission you are joining |

If a project file exists for your work package, read it before touching any implementation repo.

---

## What this repo is for

| Use | Location |
| --- | --- |
| Current work status and progress log | `work-progress/ACTIVE_WORK.md` |
| Workspace and repo-role context | `work-progress/WORKSPACE_CONTEXT.md` |
| One file per project / work package | `work-progress/projects/` |
| Master project index | `work-progress/projects/INDEX.md` |
| Final decisions (when created) | `decisions/DECISION_LOG.md` |
| Repo authority map (when created) | `repo-map/REPOSITORY_ROLES.md` |
| Required gates (when created) | `verification/CURRENT_GATES.md` |
| Current handoff (when created) | `handoffs/CURRENT_HANDOFF.md` |
| How to update the ledger (when created) | `runbooks/AGENT_LEDGER_UPDATE_RUNBOOK.md` |
| Raw Cursor paste before distillation (when created) | `work-progress/intake/` |
| Project file templates (when created) | `work-progress/templates/` |
| ChatGPT-authored plans | `plans/` |
| Cursor reports after work | `cursor-reports/` |
| Verification notes and checklists | `verification/` |
| Old material that should not guide current work | `archive/` |

---

## What this repo is not

Do **not** add or implement here:

- `src/`, `scripts/`, `tools/`, `mcp/`, `supabase/`, `database/`, `bibles/`, `apps/`, `packages/`
- App source code, MCP server code, migrations, or build artifacts
- Secrets, credentials, database dumps, or copied Bible content
- Long raw logs or full command output

Link to owning repos, commits, PRs, artifact paths, and verification files instead.

---

## Where to do real work

| Task type | Go here |
| --- | --- |
| Coordination, ledger, handoffs, runbooks | `CapitalGlass-Cross-Agent` |
| Protocol authority, governance, closeout validation | `CG-Platform-Governance-MCP` |
| App-building execution, Bible sync/index, cache, harvest | `CG-AppBuilder-MCP` |
| Scraper capture, vendor-docs corpus | `Scraper` |
| Knowledge build, research library layout, DE2 | `Data-Extraction` |
| App-specific features | The owning application repo |

**Permanent authority rule:**

> Governance decides what must be captured and whether completed work counts. AppBuilder may produce receipts, but AppBuilder is not the source of truth for the protocol.

---

## Agent responsibilities

### Every agent

1. Read context files (see table above) before acting.
2. Work in the **correct owning repo** — never implement in this meeting repo.
3. Update `work-progress/ACTIVE_WORK.md` when work starts, changes, blocks, commits, verifies, or completes.
4. Create or update a project file in `work-progress/projects/` for distinct projects or work packages.
5. Update `work-progress/projects/INDEX.md` when adding or materially changing a project file.
6. Do not rely on chat memory for anything that affects future work, repo ownership, authority, verification, or next actions.

### ChatGPT

- Writes plans only when explicitly asked (`plans/`).
- Writes reviews only when explicitly asked (`chatgpt-reviews/`).
- When Wesley pastes Cursor output, extract valuable build information and write it into the ledger and relevant project file. Discard noise, filler, secrets, and full source code.

### Cursor

- Implements in owning application repos.
- Writes implementation reports to `cursor-reports/` when asked.
- Does not treat this repo as a code or MCP host.

---

## How to update the ledger

Every material update to `work-progress/ACTIVE_WORK.md` must include:

| Field | Required? |
| --- | --- |
| Timestamp | Yes |
| Project / Cursor ID or short title | Yes |
| Repos involved | Yes |
| Status | Yes |
| Notes | Yes |
| Commits / PRs | When changed |
| Verification | When validated |
| Next action | Unless complete |

Use the entry format defined in `work-progress/ACTIVE_WORK.md`. Newest active status goes near the top.

For a new project, also:

1. Create `work-progress/projects/YYYY-MM-DD_<project-id>.md` using the template in `work-progress/projects/README.md`.
2. Add a row to `work-progress/projects/INDEX.md`.
3. Add a ledger entry in `work-progress/ACTIVE_WORK.md`.

---

## Cursor paste intake

When Wesley pastes Cursor text, capture:

- project ID / work package ID
- timestamp
- repo(s) involved
- commits and push status
- verification commands and results
- blockers and warnings
- decisions made
- next action
- reusable lessons

Do **not** capture: repeated filler, long unneeded output, secrets, full source code, Bible copies, or database dumps.

---

## Verification gates (current)

Before Bible-dependent work in `CG-AppBuilder-MCP`:

```powershell
cd C:\Developer\repos\CG-AppBuilder-MCP
doppler run -p cg-mcp -c dev -- npm run bible:authority:gate
```

| Result | Action |
| --- | --- |
| `PASS` | Proceed |
| `PASS_WITH_WARNINGS` | Proceed and note warnings |
| `BLOCKED` | Stop and fix failing layer |

For material Cursor sessions in AppBuilder, also follow Auto Protocol v3.2 preflight and closeout rules in that repo.

See `verification/application-bible-sync-runbook.md` for Bible sync details.

---

## Folder map (target structure)

```text
CapitalGlass-Cross-Agent/
├── AGENT_START_HERE.md          ← you are here
├── README.md
├── work-progress/
│   ├── ACTIVE_WORK.md           ← live ledger
│   ├── WORKSPACE_CONTEXT.md     ← workspace + repo roles
│   ├── projects/
│   │   ├── README.md            ← project file instructions
│   │   ├── INDEX.md             ← master project index
│   │   └── YYYY-MM-DD_<id>.md   ← one file per project
│   ├── templates/               ← (planned) reusable templates
│   └── intake/                  ← (planned) raw Cursor paste staging
├── decisions/                   ← (planned) DECISION_LOG.md
├── repo-map/                    ← (planned) REPOSITORY_ROLES.md
├── runbooks/                    ← operating instructions
├── verification/                ← gates, checklists, evidence
├── handoffs/                    ← (planned) CURRENT_HANDOFF.md
├── plans/                       ← ChatGPT plans
├── cursor-reports/              ← Cursor closeout reports
├── chatgpt-reviews/             ← ChatGPT reviews
└── archive/                     ← dead reference only
```

---

## Quick checklist before you act

- [ ] Read `work-progress/WORKSPACE_CONTEXT.md`
- [ ] Read `work-progress/ACTIVE_WORK.md`
- [ ] Check `work-progress/projects/INDEX.md` for an existing project file
- [ ] Confirm which repo owns the work you are about to do
- [ ] Confirm you are **not** about to write code in this repo
- [ ] Plan to update the ledger when you finish or hit a blocker

---

## If you are unsure

1. Check `work-progress/projects/INDEX.md` for an active project.
2. Check `work-progress/ACTIVE_WORK.md` open next actions.
3. Ask Wesley which repo owns the work before implementing.
4. When in doubt, write coordination notes here and implement elsewhere.
