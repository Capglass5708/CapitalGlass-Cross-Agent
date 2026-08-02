# Master Work Document - 2026-08-01 / 2026-08-02

This document consolidates the valuable work captured today across the Capital Glass build.

It is a human-readable master summary. Detailed project records remain in the project files named below.

## Executive Summary

Today's work established three major control points:

| Area | Result |
| --- | --- |
| Agent knowledge access | `L:\Capital-Glass-Intelligence-Hub\00-master-index\` is now the canonical operational front door |
| Cross-Agent role | `CapitalGlass-Cross-Agent` is the human ledger: decisions, status, evidence, paths, commits, next actions |
| GPU/parser direction | `RYZEN9DESK` owns RTX 5080 proof; Computer Estimator owns `cg-opening-locator-v1`; Revu MCP remains controlled fixture/markup lane |

The main theme: stop losing valuable work in chat. Agents now have a start path, canonical knowledge map, project index, active ledger, and project-specific records.

## Canonical Front Doors

| Need | Start here |
| --- | --- |
| Agent operating rules | `CapitalGlass-Cross-Agent/AGENT_START_HERE.md` |
| Current live ledger | `CapitalGlass-Cross-Agent/work-progress/ACTIVE_WORK.md` |
| Canonical knowledge map | `CapitalGlass-Cross-Agent/work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md` |
| Project index | `CapitalGlass-Cross-Agent/work-progress/projects/INDEX.md` |
| Machine-readable build catalog | `L:\Capital-Glass-Intelligence-Hub\00-master-index\` |

## L: Master Index

The synced operational catalog is:

```text
L:\Capital-Glass-Intelligence-Hub\00-master-index\
```

| File / folder | Purpose |
| --- | --- |
| `AGENT_START_HERE.md` | Human-readable instructions for agents |
| `INDEX.json` | Master pointer file v2 with counts and quick links |
| `AGENT_BUILD_CATALOG.json` | Unified catalog of build-assist items |
| `BY-KIND/` | Sliced indexes by category |

Reported synced inventory:

| Kind | Count |
| --- | ---: |
| Capital Glass apps | 12 |
| Platform repos | 7 |
| MCP servers | 18 |
| Cursor plugins | 5 |
| External GitHub research libraries | 20 |
| Vendor tools | 5 |
| DE handoff packages | 2 |
| Knowledge builds linked | 20 |

Sync command:

```powershell
cd C:\Developer\repos\Data-Extraction
npm run agent-research-library:sync-master-index
```

Latest reported Data-Extraction commit for master index feature: `bbddfe3` on `main`.

Known gaps:

| Gap | Status |
| --- | --- |
| `10-approved-for-use/` | Empty until review promotes items |
| Rank 9 YOLO benchmark | No repo URL pinned |
| Knowledge build paths | Some still point to local C: until warm-cache sync to L: exists |

Recommended next improvement: mirror `operational-knowledge.json` files to:

```text
L:\Capital-Glass-Intelligence-Hub\02-capability-library\
```

## Cross-Agent Files Created / Updated

| File | Purpose |
| --- | --- |
| `AGENT_START_HERE.md` | Agent startup instructions and repo boundaries |
| `work-progress/ACTIVE_WORK.md` | Current build ledger |
| `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md` | Canonical map of knowledge, indexes, research, Synology paths, suite maps |
| `work-progress/projects/INDEX.md` | Master project index |
| `work-progress/projects/2026-08-01_revu-opening-detection-top10-v1.md` | Revu/opening/parser/RTX/Rosewood project record |
| `work-progress/projects/2026-08-01_north-star-compounding-proof-v1.md` | Governance/AppBuilder authority-shift project record |
| `work-progress/2026-08-02_MASTER_WORK_DOCUMENT.md` | This consolidated master document |

## Canonical Storage Rule

| Layer | Owner / location |
| --- | --- |
| Human decisions and status | `CapitalGlass-Cross-Agent` |
| Machine-readable catalog | `L:\Capital-Glass-Intelligence-Hub\00-master-index\` |
| Research selection indexes | `Data-Extraction/config/agent-research-library/*.json` |
| Raw scraped GitHub/site captures | `Scraper/ui-capture/artifacts/vendor-docs/<vendor-or-topic>/` |
| Processed DE knowledge packages | `Data-Extraction/artifacts/data-extraction-2/` |
| Published quick-access copies | `L:\Capital-Glass-Research\...`, `L:\Capital-Glass-Intelligence-Hub\...` |
| Shared published suite mirror | `Z:\Capital-Glass-Dev\...` where the workflow publishes there |
| Implementation code | Owning app repo only |

Cross-Agent stores pointers and decisions. It must not store full scraped corpuses, full Bible copies, MCP code, DB migrations, secrets, large logs, or app implementation code.

## Bible / Platform Intelligence State

Verified in this session:

| Check | Result |
| --- | --- |
| Bible catalog tool discovered | yes |
| Bible context tool discovered | yes |
| Catalog callable alias | `mcp__codex_apps__cg_platform_intelligence_list_ap_570a053043ca` |
| Context callable alias | `mcp__codex_apps__cg_platform_intelligence_get_app_6e91f267e28d` |
| Catalog read succeeded | no |
| Current blocker | CG Platform Intelligence reauthentication required |

Exact blocker:

```text
UNAUTHORIZED
oauth_refresh_token_missing
TRIGGER_REAUTHENTICATION
```

Interpretation: the Bible tools are present in the surface, but reads are blocked until the CG Platform Intelligence connector is reauthenticated.

Earlier Bible authority/gate status captured in the ledger:

| Item | Status |
| --- | --- |
| Z: mirror | Mounted and passing after sync |
| `bible-db:index-suite --live` | 23 apps / 541 files indexed |
| `bible-db:link-cache` | 60 links refreshed |
| `bible:authority:gate` | PASS_WITH_WARNINGS |
| CG-AppBuilder-MCP commit | `dc32d991` pushed |
| Cross-Agent Bible runbook commit | `76b34fe` pushed |

Operational rule before Bible-dependent work:

```powershell
cd C:\Developer\repos\CG-AppBuilder-MCP
doppler run -p cg-mcp -c dev -- npm run bible:authority:gate
```

## Governance / North Star Work

Mission: move constitutional authority to Governance MCP; AppBuilder becomes execution worker only.

| Repo | Reported commit | Status |
| --- | --- | --- |
| `CG-Platform-Governance-MCP` | `0f6dafd` | Pushed | `north-star-compounding-proof-v1` constitutional authority on `origin/main` |
| `CG-AppBuilder-MCP` | `480315c2` | Local only / not pushed | AppBuilder execution adapters for compounding proof authority |

Delivered in the Governance/AppBuilder work package:

| Deliverable | Meaning |
| --- | --- |
| `north-star-compounding-proof-v1` schema/lib/tools | Governance capture and compounding proof authority |
| Governance closeout decision | AUTHORIZED |
| AppBuilder shims/adapters | AppBuilder triggers Governance, but does not own the rule |
| Preflight / closeout wiring | Material work must satisfy Governance capture contract |
| Tests | Governance tests reported 6/6 PASS |

Open actions captured:

| Action | Owner |
| --- | --- |
| Restart Cursor MCP so new Governance tools load | Operator / Cursor |
| Push Governance/AppBuilder commits when approved | Operator / repos |
| Rerun `npm run closeout:gate` in clean shell | CG-AppBuilder-MCP |
| Run `north-star-compounding-vertical-pilot-v1` | Governance + AppBuilder |
| Run `platform-governance-phase4-registries-v1` | Governance |

## Revu MCP Operating Boundary

Current Revu MCP state:

| Capability | State |
| --- | --- |
| Cursor MCP invocation | Verified |
| Fixture markup execution | Verified |
| Read-back verification | Verified |
| Estimator Agent Lane | Verified |
| Production documents | Locked |
| Bid Composer export | Disabled |
| Production workflows | None enabled |
| Official Bluebeam host proof | Pending |

Current use pattern:

1. Open Bluebeam Revu 21 on the correct host.
2. Sign into the correct Bluebeam account.
3. Open Cursor in `C:\Developer\repos\CapitalGlassRevu`.
4. Confirm `user-bluebeam-revu` or `bluebeam-revu` is connected.
5. Use direct controlled instructions for read-only inspection or fixture markup.
6. Do not use it for unrestricted production takeoff.

Recommended future package:

```text
revu-production-takeoff-pilot-v1
```

Scope:

```text
Document Center canonical plan -> open in Revu -> storefront/glass takeoff -> human approval -> structured export -> Bid Composer review
```

## Parser / Opening Detection Direction

Primary project file:

```text
work-progress/projects/2026-08-01_revu-opening-detection-top10-v1.md
```

Parser goal:

```text
Computer Estimator -> parserEvidencePackage@1.0.0 -> Bid Composer
```

Not Bid Composer's legacy GPT bid-sheet intake.

Primary work package:

```text
cg-opening-locator-v1
```

Primary Data-Extraction index:

```text
Data-Extraction/config/agent-research-library/revu-opening-detection-top10-v1.json
```

Important schema/bridge files:

```text
CG-AppBuilder-MCP/contracts/external-schema-index.json
CG-AppBuilder-MCP/docs/SUITE_BRIDGE_MAP.md
```

### Opening Detection Stack Interpretation

| Tier | Tools | Decision |
| --- | --- | --- |
| Tier 1 | SAHI + PaddleDetection | Highest RTX 5080 ROI for tiled opening detection |
| Tier 1 support | PyMuPDF + pymkup | Vector geometry and Bluebeam markup labels |
| Tier 2 | CVAT + SAM 2 | Proprietary dataset labeling and model-building support |
| Tier 3 | Docling | WATCH for schedules/tables vs camelot / PP-Structure |
| Defer | Proposal-stack tools | Proposal output, not CE parser throughput |

Known Data-Extraction gap: revu-opening KB artifacts are still shallow; hub registry and Z: manifests are the reliable pointers today.

## RTX 5080 / Machine Roles

Current host authority:

| Host | GPU | Role |
| --- | --- | --- |
| `WESLEYDESK` | GTX 1080 Ti | Dev / office / L: workflows; can verify imports, not current 5080 proof host |
| `RYZEN9DESK` / `CG-RYZEN9DESK-01` | RTX 5080 | Primary GPU target for Paddle GPU 3.x, `dev_gpu`, `gpu-activation-probe`, SAHI/PaddleDetection benchmarks |

Receipt policy:

```text
RTX5080_GPU_ACTIVATION_PROVEN belongs on RYZEN9DESK, not WESLEYDESK.
```

Install split:

| Host | Action |
| --- | --- |
| `CG-RYZEN9DESK-01` | Run `bash scripts/install_opening_stack_ryzen9desk.sh` plus `~/paddle-wheels` for `paddlepaddle-gpu==3.2.1` |
| `WESLEYDESK` | After `sudo apt install python3.14-venv python3-pip`, run same install script only for dev/import checks |

Important distinction: `docs/handoff/GPU_WESLEYDESK_PROMOTION.md` describes a future 5080-on-WESLEYDESK production promotion. Today's 5080 host is Ryzen9Desk.

## Rosewood Parser Run

Run status captured:

| Field | Value |
| --- | --- |
| Host | `wesley@cg-ryzen9desk-01` / `RYZEN9DESK` |
| Project | Rosewood |
| Document ID | `1a6fda42-8c48-450e-83bf-8bb590af026b` |
| PDF | `data/incoming/rosewood-permit-set.pdf` |
| Source PDF | 113 MB / 192 pages |
| Mode | CPU, `USE_GPU=false`, Tesseract OCR |
| DB | Docker Postgres on `:5433`, healthy |
| Dependencies | Tesseract + Ghostscript installed |
| PyTorch | Broken CUDA torch replaced with `torch-2.13.0+cpu` |
| Output paths | `data/processed`, `data/plan-out` |
| Z: status | Not mapped on Ryzen9 for this run |
| Last observed stage | Render around page 98/192 in one captured state; later parser was reported in detect stage around page 41/192 in memory context |

Monitor commands:

```bash
ssh wesley@cg-ryzen9desk-01 'wsl -e bash -lc "tail -f /tmp/rosewood-plan-parser.log"'
ssh wesley@cg-ryzen9desk-01 'wsl -e bash -lc "grep render_page_done /tmp/rosewood-plan-parser.log | tail -3"'
```

Completion evidence to capture:

| Evidence | Need |
| --- | --- |
| JSON closeout | `succeeded: 1` |
| Evidence package paths | Generated output under `data/plan-out` / processed output |
| Warnings/failures | OCR/embed/export warnings |
| BC relay readiness | Whether output is suitable for Bid Composer relay import |

## Correct Apps / Libraries To Install Prompt

A prompt was prepared for another agent to use the L: master index and determine the correct stack. Expected short result:

| Category | Items |
| --- | --- |
| Install / wire now | SAHI, PaddleDetection, CVAT, SAM 2 |
| Verify present | PyMuPDF, pymkup, PaddleOCR / PP-Structure |
| Watch | Docling, Unstructured |
| Skip for parser | Docxtemplater, Tiptap, Gotenberg and proposal-stack tools unless working on proposal output |

Decision rules:

- Do not install everything.
- Separate install-now from watch/study.
- Prefer tools aligned with Computer Estimator.
- Do not promote anything to approved-for-use unless reviewed.
- Save findings to Cross-Agent, not implementation repos, unless explicitly told to implement.

## Major Commits Captured Today

| Commit | Repo | Meaning |
| --- | --- | --- |
| `4260ed7` | Cross-Agent | Agent startup entrypoint and project index |
| `76b34fe` | Cross-Agent | Bible sync runbook |
| `dc32d991` | CG-AppBuilder-MCP | `bible:authority:gate` |
| `bbddfe3` | Data-Extraction | L: master index sync feature |
| `d0558a0` | Cross-Agent | Canonical knowledge locations map |
| `3c5f40e` | Cross-Agent | L: master index made canonical front door |
| `8c5e02f` | Cross-Agent | RTX 5080 catalog lookup pattern |
| `782293f` | Cross-Agent | GPU host authority in canonical map |
| `9501281` | Cross-Agent | GPU machine roles in Revu/opening project |
| `eb78829` | Cross-Agent | GPU host authority in active ledger |

Additional Cross-Agent commits today captured parser/Rosewood run evidence and active ledger updates.

## Open Next Actions

| Priority | Action | Owner |
| --- | --- | --- |
| 1 | Reauthenticate CG Platform Intelligence connector so Bible reads work again | Operator / ChatGPT connector |
| 2 | Monitor Rosewood parser run to completion and capture closeout | RYZEN9DESK / Computer Estimator |
| 3 | Confirm whether Rosewood output is ready for Bid Composer relay import | Computer Estimator / Bid Composer |
| 4 | Finish RTX 5080 opening stack activation on RYZEN9DESK | Computer Estimator |
| 5 | Scope/implement `cg-opening-locator-v1` with SAHI + PaddleDetection | Computer Estimator |
| 6 | Stand up CVAT + SAM 2 labeling lane if approved | Computer Estimator / Data-Extraction |
| 7 | Benchmark Docling against CE schedule/table fixtures | Computer Estimator |
| 8 | Add warm-cache sync of `operational-knowledge.json` to L: capability library | Data-Extraction |
| 9 | Restart Cursor MCP for Governance tools | Operator |
| 10 | Push `CG-AppBuilder-MCP` `480315c2` when approved | Operator / repos |

## L: Published Copy

| Field | Value |
| --- | --- |
| Published path | `L:\Capital-Glass-Intelligence-Hub\00-master-index\cross-agent-master-work\2026-08-02_MASTER_WORK_DOCUMENT.md` |
| Latest alias | `L:\Capital-Glass-Intelligence-Hub\00-master-index\cross-agent-master-work\LATEST.md` |
| Slice index | `L:\Capital-Glass-Intelligence-Hub\00-master-index\cross-agent-master-work\INDEX.json` |
| BY-KIND slice | `L:\Capital-Glass-Intelligence-Hub\00-master-index\BY-KIND\cross-agent-master-work.json` |
| Source commit | `7f454e3` |
| SHA-256 | See `cross-agent-master-work/INDEX.json` (`documents[0].sha256`) |
| Git source of truth | `CapitalGlass-Cross-Agent/work-progress/2026-08-02_MASTER_WORK_DOCUMENT.md` |

Cross-Agent remains the human ledger and Git history. L: holds the published readable copy and machine-readable pointers only.

## Final Operating Model

| Component | Role |
| --- | --- |
| Cross-Agent | Human ledger and coordination memory |
| L: master index | Machine-readable catalog / front door |
| Data-Extraction | Research indexes and processed knowledge |
| Scraper | Raw capture engine and manifests |
| Z:/L: | Published shared knowledge and quick-access copies |
| Governance MCP | Constitutional capture/closeout authority |
| AppBuilder MCP | Execution adapter / gates / sync / index |
| Computer Estimator | Parser and opening detection producer |
| Revu MCP | Controlled markup binding and read-back |
| Bid Composer | Review spine and downstream import consumer |

This is the structure agents should follow going forward.
