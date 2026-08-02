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
| Canonical knowledge map | `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md` |

## Required writing rule

All valuable build information must be written into the meeting repo as the work progresses.

When Wesley pastes Cursor text into ChatGPT, ChatGPT is responsible for extracting the valuable build information and writing it into `work-progress/ACTIVE_WORK.md`.

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

## GitHub-Scraped Research Storage Map

Canonical source: `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md`.

This section is a quick summary for agents investigating available libraries, apps, frameworks, or vendor packages that can assist a build.

| Layer | Purpose | Primary location |
| --- | --- | --- |
| Research selection index | Curated/ranked list of libraries to investigate and why they matter | `Data-Extraction/config/agent-research-library/*.json` |
| Raw GitHub/site capture | Scraped pages, manifests, capture plans, URL inventories | `Scraper/ui-capture/artifacts/vendor-docs/<vendor-or-topic>/` |
| Packaged DE knowledge | Data-Extraction's processed KB packages, manifests, retrieval snapshots, operational notes | `Data-Extraction/artifacts/data-extraction-2/` |
| Published quick-access library | Synology/L: compact manifests and agent entry points for fast reuse | `L:\Capital-Glass-Research\...` and `L:\Capital-Glass-Intelligence-Hub\...` |
| Published suite/mirror references | Z:/shared published material when a pipeline publishes there | `Z:\Capital-Glass-Dev\...` or the path named in the project file |
| Coordination pointer | What matters, status, decisions, and exact paths for an agent | `CapitalGlass-Cross-Agent/work-progress/projects/*.md` |

Agent rule:

> Cross-Agent tells you what matters and where to go. Scraper holds raw captures. Data-Extraction holds indexes and processed knowledge. Synology/L:/Z: holds quick-access published copies. Implementation repos consume the knowledge; they do not become the research library.

### Known scraped/indexed examples

| Work | Index / package | Stored where |
| --- | --- | --- |
| Revu opening detection | `revu-opening-detection-top10-v1.json` | `Data-Extraction/config/agent-research-library/revu-opening-detection-top10-v1.json` |
| Revu opening pilot KBs | `PKG-REVU-OPENING-DETECTION-PILOT-V1` | `Data-Extraction/artifacts/data-extraction-2/revu-opening-detection-pilot/` |
| Docling GitHub ingest | `KB-DOCLING-GITHUB-V1-2026-08-01` | `Data-Extraction/artifacts/data-extraction-2/vendor-pilot/KB-DOCLING-GITHUB-V1-2026-08-01/` |
| Docling raw capture | GitHub vendor docs capture | `Scraper/ui-capture/artifacts/vendor-docs/docling/` |
| Docling published compact | Agent compact / manifests | `L:\Capital-Glass-Intelligence-Hub\03-domains\vendor-docs\docling\...` and `L:\Capital-Glass-Research\Scraper-Corpus\vendor-docs\docling\...` |
| Unstructured GitHub scrape | Vendor docs capture/corpus | `Scraper/ui-capture/artifacts/vendor-docs/unstructured/` and DE publish target when processed |
| Proposal stack pilot | Downstream proposal output libraries | `Data-Extraction/artifacts/data-extraction-2/proposal-stack-pilot/` |

When an agent is asked "what available apps/libraries can help this build?", it should first inspect:

```text
Data-Extraction/config/agent-research-library/
```

Then follow the selected registry entries into:

```text
Scraper/ui-capture/artifacts/vendor-docs/
Data-Extraction/artifacts/data-extraction-2/
L:\Capital-Glass-Research\
L:\Capital-Glass-Intelligence-Hub\
```

