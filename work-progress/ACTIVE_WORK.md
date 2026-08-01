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
| Current focus | North Star compounding proof moved into Governance authority; AppBuilder remains execution worker |
| Workspace context | `work-progress/WORKSPACE_CONTEXT.md` |
| Project file instructions | `work-progress/projects/README.md` |
| Primary authority repo | CG-Platform-Governance-MCP |
| Execution/support repo | CG-AppBuilder-MCP |
| Coordination repo | CapitalGlass-Cross-Agent |
| Progress writing rule | Write all valuable build information here as timestamped project/work-package entries |

## Current saved work

| Repo | Commit | Status | Notes |
| --- | --- | --- | --- |
| CapitalGlass-Cross-Agent | `76b34fe` | Pushed | Application Bible sync runbook updated |
| CG-AppBuilder-MCP | `dc32d991` | Pushed | `bible:authority:gate` added |
| CG-Platform-Governance-MCP | Not provided | Local / pending operator review | `north-star-compounding-proof-v1` schema/lib/MCP tools and policy migration work completed per Cursor closeout |
| CG-AppBuilder-MCP | Not provided | Local / pending operator review | AppBuilder shims, preflight fail-closed, closeout compounding envelope completed per Cursor closeout |

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
| 1 | Restart MCP in Cursor so `governance_get_compounding_capture_contract` and `governance_validate_compounding_proof` load | Cursor / local MCP runtime | Pending operator action |
| 2 | Commit paired Governance + AppBuilder changes after operator review | CG-Platform-Governance-MCP / CG-AppBuilder-MCP | Pending |
| 3 | Fix pre-existing `BIBLE_RUNTIME_PARITY_FAILED` / missing `list_application_bibles` runtime parity issue, then rerun `npm run closeout:gate` | CG-AppBuilder-MCP | Pending separate fix |
| 4 | Run next work package: `north-star-compounding-vertical-pilot-v1` — harvest → Z: → next-mission retrieval | CG-Platform-Governance-MCP / CG-AppBuilder-MCP | Recommended next WP |
| 5 | Run next work package: `platform-governance-phase4-registries-v1` — program/mission/exception registries | CG-Platform-Governance-MCP | Recommended next WP |
| 6 | Keep this valuable-work ledger updated as timestamped work proceeds | CapitalGlass-Cross-Agent | Active |

## Progress log

### 2026-08-01 16:52 CT — unstructured scrape + docling ingest planning

| Field | Value |
| --- | --- |
| Project / Cursor ID | `ephemeral-unstructured-github-scrape-v1`; `docling-github-ingest-v1` |
| Work package | `ephemeral-unstructured-github-scrape-v1`; `docling-github-ingest-v1` |
| Source | Wesley + Cursor paste + attached markdown + ChatGPT ledger intake |
| Repos involved | `Scraper`, `Data-Extraction`, `CapitalGlass-Cross-Agent`, external `Unstructured-IO/unstructured`, external `Unstructured-IO/unstructured-ingest`, external `docling-project/docling` |
| Status | Unstructured scrape complete; Docling ingest planned; shared GitHub articles builder needed |
| Commits / PRs | Cross-Agent project file commits: `1ff390878b25c54e8cfa615e7bf013539b1fb14b`, `5abae0f3917102767d039222b648ae5bdc15126d`; Unstructured note update `78bbddec98ac8f5943b06e4fa03f16801d47db2d` |
| Verification | Unstructured full scrape reported 1,793 artifacts, 0 failures; Docling plan read from attached markdown |
| Next action | Implement shared `build-github-markdown-articles.mjs`, then publish Unstructured and Docling captures to corpus and run Data-Extraction `knowledge:build` / opportunity mapping |

Notes:
- Created `work-progress/projects/2026-08-01_ephemeral-unstructured-github-scrape-v1.md`.
- Created `work-progress/projects/2026-08-01_docling-github-ingest-v1.md`.
- Updated the Unstructured project note with the shared Docling-discovered blocker: missing generic GitHub → articles builder.
- Unstructured scrape reported complete:
  - `unstructured-github-v1` — 279 files from `github.com/Unstructured-IO/unstructured`.
  - `unstructured-ingest-github-v1` — 1,008 files from `github.com/Unstructured-IO/unstructured-ingest`.
  - `unstructured-docs-markdown-v1` — 506 pages from `docs.unstructured.io` using `llms.txt`.
  - Total: 1,793 artifacts, 0 failures.
- Scraper files reported added for Unstructured:
  - `ui-capture/scripts/scrape-github-repo.mjs`.
  - `config/vendor-docs-targets/unstructured-github-v1.json`.
- Unstructured output locations reported under `C:\Developer\repos\Scraper\artifacts\captures\` and rollup artifacts under `C:\Developer\repos\Scraper\artifacts\`.
- Re-run command reported: `npm run vendor-docs:scrape:unstructured-all` from `C:\Developer\repos\Scraper\ui-capture`.
- Docling plan captured target layout for `Z:/Capital-Glass-Research/Scraper-Corpus/vendor-docs/docling/`, L: research mirror, cold-cache retrieval snapshot, and Intelligence Hub compact.
- Docling plan identified wrong-lane UI-reference capture and specified that GitHub API/tree scrape should supersede it.
- Shared blocker: generic GitHub article builder must emit `extracted-articles.json`, update `capture-manifest.json`, and handle Markdown/code/config files before GitHub captures can become first-class vendor-docs corpus packages.
- Future Data-Extraction work includes Docling interpreter, registry entry, warm retrieval ladder, estate status, fixture subset, producer package verification, and agent compact.

### 2026-08-01 16:50 CT — agent-research-library-layout-v1

| Field | Value |
| --- | --- |
| Project / Cursor ID | agent-research-library-layout-v1 |
| Work package | scraper-data-extraction-agent-research-library-layout |
| Source | Cursor paste + Wesley + ChatGPT ledger intake |
| Repos involved | `Data-Extraction`, `Scraper`, `CapitalGlass-Cross-Agent` |
| Status | Complete on disk; verification ALL_A_PLUS |
| Commits / PRs | Not provided in pasted closeout |
| Verification | `npm run agent-research-library:verify-layout -- --strict` reported `ALL_A_PLUS`; 58 folders created/verified across Z:, L:, and Intelligence Hub |
| Next action | Send/register 10 pilot URLs in `00-source-registry`, capture into raw lanes, package for Data-Extraction, then run handoff → `knowledge:build` → `08-app-opportunity-map` |

Notes:
- On-disk result: 58 new folders created across Z:, L:, and Intelligence Hub.
- Z: Scraper-Corpus folders created: `00-source-registry` through `09-evidence-hashes`, plus `github-research/` and `web-research/`.
- L: Research folders created: `raw-imports`, `normalized-text`, `extracted-json`, `agent-review-queue`, and related extraction lanes; existing `scraper-handoff-intake` and `exports` were preserved.
- L: Intelligence Hub folders created: `00-master-index` through `12-watchlist`, including `08-app-opportunity-map` and `10-approved-for-use`.
- README + INDEX files were added for the two gate folders: `08-app-opportunity-map` and `10-approved-for-use`.
- Reproducible Data-Extraction commands:
  - `npm run agent-research-library:scaffold-layout`
  - `npm run agent-research-library:verify-layout -- --strict`
- Data-Extraction wiring added:
  - `scripts/lib/agent-research-library/paths.mjs` — path constants + layout manifest.
  - `scripts/lib/agent-research-library/scaffold.mjs` — idempotent folder creation.
  - `scripts/lib/agent-research-library/verify.mjs` — layout grading.
  - `scripts/agent-research-library/scaffold-layout.mjs` and `scripts/agent-research-library/verify-layout.mjs` — CLIs.
  - `CORPUS_DIRS` extended with L: extraction lanes.
  - Layout is wired into `synology:scaffold-nas-layout` so future NAS scaffolds include the agent research library layout.
- Layout manifest written to `Z:\Capital-Glass-Research\Scraper-Corpus\00-control\AGENT-RESEARCH-LIBRARY-LAYOUT.json`.
- Scraper alignment completed: retired default `Z:\TEMP L DRIVE` in `ui-capture/scripts/lib/pageflows-env.mjs` replaced with canonical `Z:\Capital-Glass-Research\Scraper-Corpus\websites\pageflows`.
- Legacy paths intentionally preserved and not moved:
  - `Z:\...\Scraper-Corpus\packages\` remains the existing handoff lane, including `packages/ready-for-data-extraction`.
  - `Z:\...\Scraper-Corpus\vendor-docs\` remains the Synology vendor slot.
  - Existing Intelligence Hub `00-hub-control` through `12-operations` remains parallel to the new agent library lanes.
- Decision: new numbered lanes sit alongside legacy paths; the layout manifest documents aliases so writers can migrate incrementally.

### 2026-08-01 16:45 CT — north-star-compounding-proof-v1 project file created

| Field | Value |
| --- | --- |
| Project / Cursor ID | north-star-compounding-proof-v1 |
| Work package | north-star-compounding-proof-v1 |
| Source | ChatGPT + Wesley |
| Repos involved | `CapitalGlass-Cross-Agent` |
| Status | Active / pending commits |
| Commits / PRs | Project file commit `108348a6d3404939c570623295463c0632429084`; ledger update pending in this entry |
| Verification | Required context files read: `work-progress/WORKSPACE_CONTEXT.md`, `work-progress/ACTIVE_WORK.md`; project file created under `work-progress/projects/` |
| Next action | Restart MCP in Cursor, commit paired Governance + AppBuilder changes after operator review, and fix `BIBLE_RUNTIME_PARITY_FAILED` separately |

Notes:
- Created `work-progress/projects/2026-08-01_north-star-compounding-proof-v1.md`.
- Captured project purpose, workspace, repository roles, authority rule, delivered/reported complete items, evidence paths, verification, key decision, blockers, next work packages, and ledger links.
- This is coordination-only documentation; no implementation repos were modified.

### 2026-08-01 CT — project-files-readme

| Field | Value |
| --- | --- |
| Project / Cursor ID | project-files-readme |
| Work package | project-files-folder-instructions-v1 |
| Source | Wesley + ChatGPT |
| Repos involved | `CapitalGlass-Cross-Agent` |
| Status | Complete |
| Commits / PRs | Pending commit SHA from GitHub write |
| Verification | GitHub file write requested |
| Next action | Use `work-progress/projects/README.md` whenever starting a new project file |

Notes:
- Added folder-level README instructions for `work-progress/projects/`.
- The README tells agents to read workspace context, active ledger, and project instructions before creating a project file.
- The README defines filename pattern, required project template, Cursor paste intake, ledger update, and commit rule.

### 2026-08-01 CT — north-star-compounding-proof-v1

| Field | Value |
| --- | --- |
| Project / Cursor ID | north-star-compounding-proof-v1 |
| Work package | north-star-compounding-proof-v1 |
| Source | Cursor paste + Wesley + ChatGPT ledger intake |
| Repos involved | `CG-Platform-Governance-MCP`, `CG-AppBuilder-MCP`, `CapitalGlass-Cross-Agent` |
| Status | Complete locally; commit pending operator review |
| Commits / PRs | Not committed in Cursor session per pasted closeout |
| Verification | Auto v3.2 closeout gate `AUTO_V32_CLOSEOUT_GATE_PASS`; Governance tests 6/6 PASS; authority manifest OK; targeted corpus-sync test 16/16 PASS |
| Next action | Restart MCP in Cursor, commit paired Governance + AppBuilder changes after review, fix Bible runtime parity separately |

Notes:
- Mission: move constitutional authority to Governance MCP; AppBuilder becomes execution worker only.
- Delivered in Governance MCP:
  - `north-star-compounding-proof-v1` schema.
  - `north-star-compounding-proof-v1` library.
  - Two MCP tools: `governance_get_compounding_capture_contract` and `governance_validate_compounding_proof`.
  - Policy moved for corpus-sync, mission-front-door, and retention closeout.
- Delivered in AppBuilder:
  - Shims to Governance authority.
  - Preflight fail-closed behavior.
  - Closeout compounding envelope.
- Session evidence paths reported:
  - `CG-AppBuilder-MCP/artifacts/agent-runs/north-star-compounding-proof-v1/session-closeout-v3.2.json`
  - `governance-material-preflight-v1.json` — PASS.
  - `governance-closeout-decision-v1.json` — AUTHORIZED.
  - `north-star-compounding-proof-v1.json`.
  - `harvest-manifest-v1.json`.
- Outcome: PASS — governance preflight PASS, closeout AUTHORIZED, harvest recorded.
- Mission class: ownership.
- Host: Windows PowerShell.
- Mutation repo for closeout: `CG-AppBuilder-MCP`.
- Key decision: hard compounding proof BLOCK only applies when `platformTier.target=Compounding` or `promotionCompleted`; non-compounding material missions remain advisory.
- Verification commands/results reported:
  - `npm run test:north-star-compounding-proof` — PASS.
  - `npm run test:governance-closeout-decision` — PASS.
  - AppBuilder shim smoke — PASS.
  - `validate-auto-v32-closeout-gate.mjs` — PASS.
  - `run-auto-v32-closeout-corpus-sync.test.mjs` — 16/16 PASS.
- Known blocker: full `closeout:gate` still blocked by pre-existing `BIBLE_RUNTIME_PARITY_FAILED` / missing `list_application_bibles` tool; this is unrelated to `north-star-compounding-proof-v1`.
- Runtime note: targeted corpus-sync test took about 5.7 minutes because Node ran the full file despite name filter; harmless `fatal: not a git repository` warnings came from temp fixture dirs and did not affect results.
- Enhancement recommendations captured:
  - `north-star-compounding-vertical-pilot-v1` — harvest → Z: → next-mission retrieval.
  - `platform-governance-phase4-registries-v1` — program/mission/exception registries.
  - Immediate fix: fix `BIBLE_RUNTIME_PARITY_FAILED` to unblock full `closeout:gate`.
  - Immediate fix: commit paired Governance + AppBuilder changes after operator review.
- Mission alignment:
  - Lane served: Suite control-plane / governance authority correction.
  - Capability improved: Governance owns capture contract and PASS/BLOCK; AppBuilder triggers Governance at preflight and closeout.
  - Closeout question answered: authority is in Governance; AppBuilder is hands, not brain.

### 2026-08-01 15:00 CT — meeting-repo-progress-ledger

| Field | Value |
| --- | --- |
| Project / Cursor ID | meeting-repo-progress-ledger |
| Work package | active-work-ledger-v1 |
| Source | ChatGPT + Wesley |
| Repos involved | `CapitalGlass-Cross-Agent` |
| Status | Active |
| Commits / PRs | `d0825e2`, `16c64b3`, `35a046a`, `981c8c7`, `feb9446`, `6190376`, `8b66320`, `335f81a`, `f66745d`, `4ec95f9`, `64c2c98`, `cb1f58a` |
| Verification | GitHub file writes succeeded |
| Next action | Keep updating during future work |

Notes:
- Defined this file as the valuable-work ledger for the build.
- Added rule: when Wesley pastes Cursor output into ChatGPT, ChatGPT extracts the valuable build information and writes it into this ledger.
- Added explicit rule: all pertinent build information must be written into the meeting repo as work progresses.
- Added required format for timestamped project/work-package entries.
- Added requirement to capture project ID / Cursor project ID when available.
- Created `work-progress/WORKSPACE_CONTEXT.md` to state the active workspace and the repos involved:
  - `CapitalGlass-Cross-Agent`
  - `CG-Platform-Governance-MCP`
  - `CG-AppBuilder-MCP`

### 2026-08-01 — Bible authority gate and sync recovery

| Field | Value |
| --- | --- |
| Project / Cursor ID | Bible authority sync/gate |
| Work package | bible-authority-gate |
| Source | Cursor + Wesley + ChatGPT handoff |
| Repos involved | `CG-AppBuilder-MCP`, `CapitalGlass-Cross-Agent` |
| Status | Pushed |
| Commits / PRs | `CG-AppBuilder-MCP dc32d991`, `CapitalGlass-Cross-Agent 76b34fe` |
| Verification | Z: mirror `23/23 PASS`; bible-db live index 23 apps / 541 files; 60 cache links refreshed; `bible:authority:gate` `PASS_WITH_WARNINGS` exit 0 |
| Next action | Use the gate before Bible-dependent work |

Notes:
- Bible mirror and index pipeline reported complete:
  - Z: mirror mounted and `23/23 PASS`.
  - `bible-db:index-suite --live` indexed 23 apps / 541 files.
  - `bible-db:link-cache` refreshed 60 links.
  - `bible:authority:gate` returned `PASS_WITH_WARNINGS` with exit 0.
- Pushed coordination/runbook update:
  - CapitalGlass-Cross-Agent commit `76b34fe`.
- Pushed AppBuilder gate update:
  - CG-AppBuilder-MCP commit `dc32d991`.
- Decided permanent structure:
  - Governance MCP is authority.
  - AppBuilder is execution adapter.
  - Synology/Supabase/cache are storage and reuse layers, not protocol authority.
