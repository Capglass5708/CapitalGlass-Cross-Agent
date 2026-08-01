# Active Work Progress

This is the shared editable valuable-work ledger for Wesley, ChatGPT, Cursor, and other agents.

Purpose: keep everything valuable from the build in one durable place: current work, project IDs, timestamps, progress, decisions, blockers, evidence, saved commits, verification, reusable context, and next actions.

## Rules

- This file tracks valuable build information; it does not contain implementation code.
- All pertinent build information must be written here as work progresses.
- When Wesley pastes Cursor text into ChatGPT, ChatGPT is responsible for extracting the valuable build information and writing it into this ledger.
- Cursor paste intake means: keep project IDs, timestamps, repo names, commits, verification, decisions, blockers, and next actions; discard noise and duplicated chat filler.
- For distinct projects/work packages, create or update a project file in `work-progress/projects/` using the instructions in `work-progress/projects/README.md`.
- Do not rely on chat memory alone for anything that affects future work, agent behavior, repo ownership, authority, verification, recovery, or next actions.
- Do not store secrets, credentials, database dumps, Bible copies, or app source here.
- Link to owning repos, commits, PRs, runbooks, and verification files instead of copying their contents.
- Update this file whenever meaningful work starts, changes direction, gets blocked, is committed, is pushed, is verified, or creates reusable knowledge.
- Every material update must include a project/work package ID when available and a timestamp.
- Newest active status goes near the top. Historical detail can move to dated entries below.
- Read `work-progress/WORKSPACE_CONTEXT.md` before deciding which repo owns the next action.

## Required entry format

Use this structure for material updates:

```md
### <YYYY-MM-DD HH:mm CT> — <project/work-package/Cursor ID or short title>

| Field | Value |
| --- | --- |
| Project / Cursor ID | <id if available> |
| Work package | <work-package-id if available> |
| Source | ChatGPT / Cursor / Human / Agent name |
| Repos involved | <repo list> |
| Status | Planned / Active / Blocked / Complete / Pushed |
| Commits / PRs | <commit shas, PR links, or none> |
| Verification | <commands/results or none> |
| Next action | <next concrete action> |

Notes:
- <pertinent build note>
- <decision / blocker / result>
```

Minimum required fields:

| Field | Required? |
| --- | --- |
| Timestamp | Yes |
| Project / Cursor ID or short title | Yes |
| Repos involved | Yes |
| Status | Yes |
| Notes | Yes |
| Commits / PRs | Required when changed |
| Verification | Required when validated |
| Next action | Required unless complete |

## What counts as valuable information

Write it here if it would help future agents, reduce repeated explanation, prevent drift, recover context, or prove what happened.

| Valuable information | Capture requirement |
| --- | --- |
| Project / Cursor project ID | Record when available |
| Work package ID | Record when available |
| Timestamp | Required for material updates |
| Repo ownership | Record involved repos and role |
| Decisions | Record the decision and why |
| Blockers | Record blocker and required fix |
| Commands | Record commands that matter |
| Verification | Record command/result/evidence |
| Commits / PRs | Record SHA/link/status |
| Reusable lessons | Record what future agents should know |
| Authority rules | Record if they affect where work belongs |
| Next action | Record unless work is complete |
| Project file | Create/update `work-progress/projects/<date>_<project-id>.md` for distinct projects |

## Cursor paste intake rule

When Wesley pastes Cursor output, ChatGPT must convert it into a ledger entry.

Capture:

- project ID / Cursor project ID
- work package ID
- timestamp
- repo(s) involved
- files changed, if relevant
- commits and push status
- verification commands and results
- blockers and warnings
- decisions made
- next action
- reusable lessons for future agents

Do not capture:

- repeated filler
- long unneeded command output
- secrets or credentials
- full source code
- Bible content copies
- database dumps

## Current active status

| Field | Value |
| --- | --- |
| Last updated | 2026-08-01 |
| Current focus | Cross-Agent startup path pushed; North Star compounding proof authority committed locally; closeout gate needs clean-env rerun; proposal-stack pilot remains 9/10 operational |
| Workspace context | `work-progress/WORKSPACE_CONTEXT.md` |
| Agent startup entrypoint | `AGENT_START_HERE.md` |
| Project index | `work-progress/projects/INDEX.md` |
| Project file instructions | `work-progress/projects/README.md` |
| Primary authority repo | CG-Platform-Governance-MCP |
| Execution/support repo | CG-AppBuilder-MCP |
| Coordination repo | CapitalGlass-Cross-Agent |
| Progress writing rule | Write all valuable build information here as timestamped project/work-package entries |

## Current saved work

| Repo | Commit | Status | Notes |
| --- | --- | --- | --- |
| CapitalGlass-Cross-Agent | `4260ed7` | Pushed | Agent startup entrypoint, project index, README startup path pointer; working tree clean; no hook warnings |
| CG-Platform-Governance-MCP | `0f6dafd` | Local only / not pushed | `north-star-compounding-proof-v1` constitutional authority: schema, lib, MCP tools, policy modules, closeout wiring, manifest, ownership map |
| CG-AppBuilder-MCP | `480315c2` | Local only / not pushed | AppBuilder execution adapters: Governance shims, compounding proof client, preflight/closeout wiring, Cursor rule, Bible doc, register-tools fix |
| CapitalGlass-Cross-Agent | `76b34fe` | Pushed | Application Bible sync runbook updated |
| CG-AppBuilder-MCP | `dc32d991` | Pushed | `bible:authority:gate` added |

## Current operating rules

### Meeting repo capture

Write pertinent build information into this file, including:

- project / Cursor project ID when available
- work package ID when available
- timestamp
- active goals
- decisions made
- current status
- blockers
- commands that matter
- commits and pushes
- verification results
- authority rules
- reusable lessons
- next actions

For distinct projects, also create or update a file under:

```text
work-progress/projects/
```

### Bible-dependent work

Before Bible-dependent work, run from CG-AppBuilder-MCP:

```powershell
cd C:\Developer\repos\CG-AppBuilder-MCP
doppler run -p cg-mcp -c dev -- npm run bible:authority:gate
```

Result handling:

| Result | Action |
| --- | --- |
| `PASS` | Proceed |
| `PASS_WITH_WARNINGS` | Proceed and note warnings |
| `BLOCKED` | Stop and fix failing layer |

### North Star / Governance work

Permanent authority rule:

> Governance decides what must be captured and whether completed work counts. AppBuilder may produce receipts, but AppBuilder is not the source of truth for the protocol.

Target direction:

- Governance MCP owns North Star Protocol, capture contract, closeout requirements, compounding proof schema, and validation.
- AppBuilder remains an execution adapter for writing/syncing/indexing/cache operations.
- Completed material work should not count unless Governance validates that it was captured, stored, indexed, and made reusable.

## Open next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | Clear leaked `CG_AUTO_V32_WORK_PACKAGE` and `CG_AUTO_V32_MATERIAL`, then rerun `npm run closeout:gate` | CG-AppBuilder-MCP / shell environment | Pending |
| 2 | Restart MCP in Cursor so `governance_get_compounding_capture_contract` and `governance_validate_compounding_proof` load | Cursor / local MCP runtime | Pending operator action |
| 3 | Push local commits `0f6dafd` and `480315c2` when approved | CG-Platform-Governance-MCP / CG-AppBuilder-MCP | Pending |
| 4 | Run next work package: `north-star-compounding-vertical-pilot-v1` — harvest → Z: → next-mission retrieval | CG-Platform-Governance-MCP / CG-AppBuilder-MCP | Recommended next WP |
| 5 | Run next work package: `platform-governance-phase4-registries-v1` — program/mission/exception registries | CG-Platform-Governance-MCP | Recommended next WP |
| 6 | Keep this valuable-work ledger updated as timestamped work proceeds | CapitalGlass-Cross-Agent | Active |

## Progress log

### 2026-08-01 CT — cross-agent startup path pushed

| Field | Value |
| --- | --- |
| Project / Cursor ID | `cross-agent-startup-entrypoint-v1` |
| Work package | `agent-start-here-and-project-index` |
| Source | Cursor paste + Wesley + ChatGPT ledger intake |
| Repos involved | `CapitalGlass-Cross-Agent` |
| Status | Pushed |
| Commits / PRs | `CapitalGlass-Cross-Agent 4260ed7` pushed to `origin/main` |
| Verification | Remote files confirmed: `AGENT_START_HERE.md`, `work-progress/projects/INDEX.md`, README startup pointer; working tree clean; no hook warnings |
| Next action | New agents should follow `README.md` → `AGENT_START_HERE.md` → `work-progress/projects/INDEX.md` → relevant project file |

Notes:
- Commit message: `docs: add agent startup entrypoint and project index`.
- Remote advanced `3399c2a..4260ed7` on `main`.
- Commit contents:
  - `AGENT_START_HERE.md` — new onboarding doc.
  - `work-progress/projects/INDEX.md` — master index of project files.
  - `README.md` — startup path pointer.
- No implementation repos were modified.
- Startup path now durable:
  - `README.md`
  - `AGENT_START_HERE.md`
  - `work-progress/ACTIVE_WORK.md`
  - `work-progress/projects/INDEX.md`
  - relevant project file.

### 2026-08-01 CT — north-star-compounding-proof-v1 commits and gate rerun

| Field | Value |
| --- | --- |
| Project / Cursor ID | `north-star-compounding-proof-v1` |
| Work package | `north-star-compounding-proof-v1` |
| Source | Cursor paste + Wesley + ChatGPT ledger intake |
| Repos involved | `CG-Platform-Governance-MCP`, `CG-AppBuilder-MCP`, `CapitalGlass-Cross-Agent` |
| Status | Committed locally; push pending; full closeout gate needs clean-env rerun |
| Commits / PRs | `CG-Platform-Governance-MCP 0f6dafd`; `CG-AppBuilder-MCP 480315c2`; neither pushed |
| Verification | `check-bible-runtime-parity` PASS; `check:cross-index-parity` PARTIAL blocking=0; isolated `test:auto-protocol-v3` passed 14/14; full `closeout:gate` failed later due likely env contamination |
| Next action | Clear Auto v3.2 env vars, rerun `npm run closeout:gate`, restart Cursor MCP servers, then push commits when approved |

Notes:
- Governance commit: `0f6dafd` — `feat(governance): add north-star-compounding-proof-v1 constitutional authority`.
- AppBuilder commit: `480315c2` — `feat(governance): AppBuilder execution adapters for compounding proof authority`.
- Project file updated: `work-progress/projects/2026-08-01_north-star-compounding-proof-v1.md`.

### 2026-08-01 18:07 CT — revu-opening pilot 8/10 operational

| Field | Value |
| --- | --- |
| Project / Cursor ID | `revu-opening-detection-top10-v1` |
| Work package | `cg-opening-locator-v1` |
| Source | Cursor |
| Repos involved | `Computer Estimator`, `CapitalGlassRevu`, `CG-Computer-Estimator-MCP`, `Data-Extraction`, `Scraper`, `CapitalGlass-Cross-Agent` |
| Status | Pilot 8/10 operational — DE handoff ACK_ACCEPTED |
| Commits / PRs | `Data-Extraction 38e5c58`; `Scraper 36cd354` |
| Verification | `PKG-REVU-OPENING-DETECTION-PILOT-V1` ACK_ACCEPTED; 8 GitHub captures; 8 knowledge builds under `artifacts/data-extraction-2/revu-opening-detection-pilot/` |
| Next action | Agent review ADOPT lane (ranks 1–5); pin rank-9 YOLO benchmark URL; begin `cg-opening-locator-v1` stub in Computer Estimator |

Notes:
- **Architecture rule:** Computer Estimator detects; CG-Computer-Estimator-MCP read-only; CapitalGlassRevu markup + read-back; Revu MCP is not the detection engine.
- Full pipeline: scrape → articles → Z: publish → DE handoff → knowledge builds.
- Excluded from capture: rank 7 (FloorPlanCAD metadata), rank 9 (YOLO benchmark URL TBD).
- Project file: `work-progress/projects/2026-08-01_revu-opening-detection-top10-v1.md`.

### 2026-08-01 17:34 CT — proposal-stack pilot 9/10 operational

| Field | Value |
| --- | --- |
| Project / Cursor ID | `agent-research-library-layout-v1` |
| Work package | `proposal-stack-top10-v1` |
| Source | Cursor |
| Repos involved | `Data-Extraction`, `Scraper`, `CapitalGlass-Cross-Agent` |
| Status | Pilot 9/10 operational |
| Commits / PRs | `Data-Extraction 2190944` (ingestion pipeline); `Scraper 0111837` (proposal-stack batch); prior layout commits `b1d2e42`, `3e09e4c` |
| Verification | Handoff `PKG-PROPOSAL-STACK-PILOT-V1` ACK_ACCEPTED; nine `knowledge:build` runs; manifest-only Z: publish complete |
| Next action | Optional bounded n8n capture; agent review before any `10-approved-for-use/` promotion |

Notes:
- Proposal-generator top-10 GitHub registry published to Z: `00-source-registry` and L: `08-app-opportunity-map`.
- Nine sources operational: Docxtemplater, Tiptap, pdfme, Gotenberg, Documenso, docx, AutoRFP, Unstructured (#8), AgencyOS.
- n8n (#10) deferred — bounded WATCH config ready, non-blocking.
- Raw captures excluded from git (`artifacts/captures/`); corpus on Z: only.
- Project file updated: `work-progress/projects/2026-08-01_agent-research-library-layout-v1.md`.
