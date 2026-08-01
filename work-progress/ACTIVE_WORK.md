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
| Current focus | North Star compounding proof authority committed locally; closeout gate needs clean-env rerun; proposal-stack pilot remains 9/10 operational |
| Workspace context | `work-progress/WORKSPACE_CONTEXT.md` |
| Project file instructions | `work-progress/projects/README.md` |
| Primary authority repo | CG-Platform-Governance-MCP |
| Execution/support repo | CG-AppBuilder-MCP |
| Coordination repo | CapitalGlass-Cross-Agent |
| Progress writing rule | Write all valuable build information here as timestamped project/work-package entries |

## Current saved work

| Repo | Commit | Status | Notes |
| --- | --- | --- | --- |
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

### 2026-08-01 17:23 CT — docling manifest-only-fast publish

| Field | Value |
| --- | --- |
| Project / Cursor ID | `docling-github-ingest-v1` |
| Work package | `docling-github-ingest-v1` |
| Source | Wesley + Cursor closeout + ChatGPT ledger intake |
| Repos involved | `Scraper`, `Data-Extraction`, `CapitalGlass-Cross-Agent` |
| Status | Publish optimized; corpus publish no longer bulk-copies pages by default |
| Commits / PRs | Cross-Agent Docling note update `2ecb2f5fb4265c2ce23c063734c30ac2f329725d`; implementation commit not provided |
| Verification | `manifest-only-fast` publish completed in ~28 seconds; previous full-copy path crashed after 21+ minutes |
| Next action | Use L: compact / manifest / cold-cache entry points for agents; use full publish only when all 1,076 pages must be mirrored to L: |

Notes:
- `publish-docling-corpus.mjs` now uses `manifest-only-fast` by default.
- Default publish skips bulk page copies.
- It publishes manifests and pointers to Z:.
- It mirrors only lightweight sections to L: — `00-control`, `02-manifests`, and `03-provenance`.
- Full page bytes remain in local capture and DE2 cold cache.
- Agent entry points on L:
  - `L:/Capital-Glass-Intelligence-Hub/03-domains/vendor-docs/docling/compacts/docling-adoption-agent-compact-v1.json`.
  - `L:/Capital-Glass-Research/Scraper-Corpus/vendor-docs/docling/02-manifests/extracted-articles-docling-github-v1.json`.
  - `L:/Capital-Glass-Research/estimating-suite-cold-cache/intelligence/vendor-docs/docling/PKG-DE2-DOCLING-.../retrieval-snapshot.json`.
- Use `npm run vendor-docs:publish:docling:full` only if all 1,076 pages must be mirrored to L:.

### 2026-08-01 16:56 CT — agent research layout commits pushed

| Field | Value |
| --- | --- |
| Project / Cursor ID | `agent-research-library-layout-v1` |
| Work package | `scraper-data-extraction-agent-research-library-layout` |
| Source | Wesley + Cursor closeout + ChatGPT ledger intake |
| Repos involved | `Data-Extraction`, `Scraper`, `CapitalGlass-Cross-Agent` |
| Status | Pushed |
| Commits / PRs | `Data-Extraction b1d2e42`; `Scraper 3e09e4c`; Cross-Agent project note `c7dc425ab7b7ffb28a3d4f46eb8e0c00708657da` |
| Verification | Prior layout verification reported `ALL_A_PLUS`; pushed commits reported by Wesley/Cursor |
| Next action | Decide whether to make a second Scraper commit for remaining Unstructured/Docling vendor-docs work and a separate Data-Extraction commit for Bible/Docling changes |

Notes:
- Created `work-progress/projects/2026-08-01_agent-research-library-layout-v1.md`.
- Data-Extraction commit pushed to `origin/main`: `b1d2e42` — `feat(agent-research-library): scaffold Z/L/Hub ingestion folder layout`.
- Data-Extraction commit scope included:
  - `scripts/lib/agent-research-library/*`.
  - `scripts/agent-research-library/*`.
  - `package.json` new npm scripts.
  - `scripts/lib/paths.mjs` L: extraction directories.
  - `scripts/synology/scaffold-nas-layout.mjs`.
- Data-Extraction still unstaged / not in commit:
  - application-bible edits.
  - docling scripts.
  - railway run artifacts.
  - `constants.mjs`.
  - other unstaged items not listed in the closeout.
- Scraper commit pushed to `origin/feat/vendor-docs-markdown-capture-v1`: `3e09e4c` — `fix(pageflows): retire TEMP L DRIVE default capture root`.
- Scraper commit scope included:
  - `ui-capture/scripts/lib/pageflows-env.mjs`.
  - `ui-capture/README.md`.
- Scraper still unstaged / not in commit:
  - Unstructured capture lane work.
  - Docling capture lane work.
  - related `package.json`, scripts, configs, and artifacts.
- Decision point: user asked whether to make a second commit for remaining Scraper vendor-docs work or Data-Extraction Bible/Docling changes.

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