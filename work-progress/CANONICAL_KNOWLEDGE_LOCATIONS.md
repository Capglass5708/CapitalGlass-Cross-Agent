# Canonical Knowledge Locations

This is the canonical map for where agents should look for reusable Capital Glass build knowledge, scraped research, app indexes, published packages, and coordination notes.

The operational front door for machine-readable build assistance is now the synced master index on L:.

Purpose: stop valuable information from getting scattered across chat, Cursor output, local folders, and implementation repos.

## Single Operational Front Door

Agents looking for available apps, repos, MCP servers, plugins, external libraries, vendor tools, handoff packages, and knowledge builds should start here:

```text
L:\Capital-Glass-Intelligence-Hub\00-master-index\
```

| File / folder | What it is |
| --- | --- |
| `AGENT_START_HERE.md` | Human-readable instructions for agents |
| `INDEX.json` | Master pointer file v2 with counts and quick links |
| `AGENT_BUILD_CATALOG.json` | Unified catalog of all indexed build-assist items |
| `BY-KIND/` | Sliced indexes when the agent already knows the category |

Current synced inventory:

| Kind | Count |
| --- | ---: |
| Capital Glass apps | 12 |
| Platform repos | 7 |
| MCP servers | 18 |
| Cursor plugins | 5 |
| External libraries / GitHub research | 20 |
| Vendor tools | 5 |
| DE handoff packages | 2 |
| Knowledge builds linked | 20 |
| Cross-Agent master work docs | 1 |

### BY-KIND slices

```text
L:\Capital-Glass-Intelligence-Hub\00-master-index\BY-KIND\capital-glass-apps.json
L:\Capital-Glass-Intelligence-Hub\00-master-index\BY-KIND\platform-repos.json
L:\Capital-Glass-Intelligence-Hub\00-master-index\BY-KIND\mcp-servers.json
L:\Capital-Glass-Intelligence-Hub\00-master-index\BY-KIND\cursor-plugins.json
L:\Capital-Glass-Intelligence-Hub\00-master-index\BY-KIND\external-libraries.json
L:\Capital-Glass-Intelligence-Hub\00-master-index\BY-KIND\vendor-tools.json
L:\Capital-Glass-Intelligence-Hub\00-master-index\BY-KIND\handoff-packages.json
L:\Capital-Glass-Intelligence-Hub\00-master-index\BY-KIND\cross-agent-master-work.json
```

### Cross-Agent master work (published copy on L:)

Git source of truth: `CapitalGlass-Cross-Agent/work-progress/2026-08-02_MASTER_WORK_DOCUMENT.md`

| L: path | Purpose |
| --- | --- |
| `cross-agent-master-work/2026-08-02_MASTER_WORK_DOCUMENT.md` | Published readable copy |
| `cross-agent-master-work/LATEST.md` | Latest alias (full contents) |
| `cross-agent-master-work/INDEX.json` | Machine-readable document index |
| `BY-KIND/cross-agent-master-work.json` | Kind slice for agent discovery |

### Agent use pattern

1. Open `L:\Capital-Glass-Intelligence-Hub\00-master-index\AGENT_START_HERE.md`.
2. Load `AGENT_BUILD_CATALOG.json` or the relevant `BY-KIND/*.json` slice.
3. Follow the item pointers to opportunity maps, source catalogs, GitHub corpuses, capture manifests, and knowledge builds.
4. Use Cross-Agent project files for human decisions, current status, run evidence, commits, and next actions.

Example pointer shape from the unified catalog:

```json
{
  "pointers": {
    "opportunityMap": "L:/.../08-app-opportunity-map/pymkup.json",
    "sourceCatalog": "L:/.../01-source-catalog/pymkup.json",
    "githubCorpus": "Z:/.../github-research/repos/pymkup",
    "captureManifest": "Z:/.../02-manifests/revu-opening-pymkup-github-v1.json",
    "knowledgeBuild": "C:/Developer/repos/Data-Extraction/artifacts/.../operational-knowledge.json"
  }
}
```

### Sync authority

The master index is rebuilt from Data-Extraction:

```powershell
cd C:\Developer\repos\Data-Extraction
npm run agent-research-library:sync-master-index
```

It auto-syncs when a new source registry is registered or a pilot handoff package is published.

Estate manifest:

```text
Data-Extraction/config/agent-research-library/estate-manifest-v1.json
```

Latest reported Data-Extraction commit for this feature: `bbddfe3` on `main`.

### Known gaps

| Gap | Status |
| --- | --- |
| `10-approved-for-use/` | Empty until agent review promotes items |
| Rank 9 YOLO benchmark | No repo URL pinned |
| Knowledge build paths | Some still point to local DE machine C: until warm-cache sync to L: is added |

Recommended next improvement: weekly job to mirror `operational-knowledge.json` files to:

```text
L:\Capital-Glass-Intelligence-Hub\02-capability-library\
```


## Canonical Rule

> Cross-Agent records what matters and where to find it. It does not store the full research corpus or implementation code.

When an agent needs available apps, libraries, tools, indexes, scraped GitHub material, or reusable build knowledge, start here.

## Read Order

| Order | Location | Purpose |
| --- | --- | --- |
| 1 | `CapitalGlass-Cross-Agent/AGENT_START_HERE.md` | Agent operating rules |
| 2 | `CapitalGlass-Cross-Agent/work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md` | This canonical map |
| 3 | `CapitalGlass-Cross-Agent/work-progress/ACTIVE_WORK.md` | Current ledger and active blockers |
| 4 | `CapitalGlass-Cross-Agent/work-progress/projects/INDEX.md` | Project/work-package index |
| 5 | Relevant project file under `work-progress/projects/` | Exact decisions, paths, commits, run evidence |
| 6 | Owning repo / Synology path named by the project file | Actual implementation or published research |

## Storage Layers

| Layer | Canonical role | Primary location |
| --- | --- | --- |
| Coordination / decisions | What matters, why, status, next actions | `CapitalGlass-Cross-Agent/work-progress/` |
| Project-specific ledger | Durable notes for one work package | `CapitalGlass-Cross-Agent/work-progress/projects/YYYY-MM-DD_<project-id>.md` |
| Research selection indexes | Ranked app/library/vendor lists and adoption decisions | `Data-Extraction/config/agent-research-library/*.json` |
| Raw scraped GitHub/site captures | Capture plans, manifests, scraped pages, URL inventories | `Scraper/ui-capture/artifacts/vendor-docs/<vendor-or-topic>/` |
| Processed knowledge packages | Data-Extraction KBs, manifests, retrieval snapshots, operational notes | `Data-Extraction/artifacts/data-extraction-2/` |
| Published quick-access copies | Synology/L: compact indexes and agent entry points | `L:\Capital-Glass-Intelligence-Hub\00-master-index\`, `L:\Capital-Glass-Research\...`, `L:\Capital-Glass-Intelligence-Hub\...` |
| Shared published mirrors | Z: published suite material when a workflow publishes there | `Z:\Capital-Glass-Dev\...` |
| Suite app map | App registry, Bible/source map, application keys | `CG-AppBuilder-MCP/docs/SUITE_APPLICATION_BIBLE_REGISTRY.json` |
| Suite bridges | Repo ownership, app-to-app bridges, workflow gaps | `CG-AppBuilder-MCP/docs/SUITE_BRIDGE_MAP.md` |
| Shared schemas/contracts | Evidence packages and consumer contracts | `CG-AppBuilder-MCP/contracts/external-schema-index.json` |
| Governance authority | North Star capture/closeout rules and compounding proof | `CG-Platform-Governance-MCP` |
| Execution adapter | Sync, index, cache, gates, worker scripts | `CG-AppBuilder-MCP` |

## GitHub-Scraped Research Canonical Path

When the user asks where scraped GitHub libraries/apps are stored, start with `L:\Capital-Glass-Intelligence-Hub\00-master-index\`, then answer with this ladder:

| Step | Look here | Meaning |
| --- | --- | --- |
| 1 | `Data-Extraction/config/agent-research-library/` | Which libraries/apps were selected and why |
| 2 | `Scraper/ui-capture/artifacts/vendor-docs/` | Raw captured GitHub/site material |
| 3 | `Data-Extraction/artifacts/data-extraction-2/` | Processed knowledge packages |
| 4 | `L:\Capital-Glass-Research\` and `L:\Capital-Glass-Intelligence-Hub\` | Published quick-access copies |
| 5 | Relevant Cross-Agent project file | Current decision, owner, status, and next action |

## Known Research Indexes And Packages

| Work / library set | Canonical index or package | Location |
| --- | --- | --- |
| Revu opening detection | `revu-opening-detection-top10-v1.json` | `Data-Extraction/config/agent-research-library/revu-opening-detection-top10-v1.json` |
| Revu opening pilot KBs | `PKG-REVU-OPENING-DETECTION-PILOT-V1` | `Data-Extraction/artifacts/data-extraction-2/revu-opening-detection-pilot/` |
| Docling GitHub ingest | `KB-DOCLING-GITHUB-V1-2026-08-01` | `Data-Extraction/artifacts/data-extraction-2/vendor-pilot/KB-DOCLING-GITHUB-V1-2026-08-01/` |
| Docling raw capture | GitHub vendor docs capture | `Scraper/ui-capture/artifacts/vendor-docs/docling/` |
| Docling published compact | Agent compact and manifests | `L:\Capital-Glass-Intelligence-Hub\03-domains\vendor-docs\docling\...`, `L:\Capital-Glass-Research\Scraper-Corpus\vendor-docs\docling\...` |
| Unstructured GitHub scrape | Vendor docs capture/corpus | `Scraper/ui-capture/artifacts/vendor-docs/unstructured/` and DE publish target when processed |
| Proposal stack pilot | Proposal output libraries | `Data-Extraction/artifacts/data-extraction-2/proposal-stack-pilot/` |

## GPU Host Authority For Opening Stack

Current machine roles for the Computer Estimator / Revu opening stack:

| Host | GPU | Role for this stack |
| --- | --- | --- |
| `WESLEYDESK` | GTX 1080 Ti | Dev / office / L: workflows; can run opening stack checks, but is not the RTX 5080 activation host today |
| `RYZEN9DESK` / `CG-RYZEN9DESK-01` | RTX 5080 | Primary GPU target for Paddle GPU 3.x, `dev_gpu`, `gpu-activation-probe`, SAHI/PaddleDetection inference benchmarks |

Canonical proof rule:

> `RTX5080_GPU_ACTIVATION_PROVEN` belongs on `RYZEN9DESK`, not `WESLEYDESK`, unless the hardware is moved and a new receipt explicitly says so.

Install targets:

| Target | Action |
| --- | --- |
| RTX 5080 activation | Run on `CG-RYZEN9DESK-01`: `bash scripts/install_opening_stack_ryzen9desk.sh` plus `~/paddle-wheels` for `paddlepaddle-gpu==3.2.1` |
| WESLEYDESK 1080 | After `sudo apt install python3.14-venv python3-pip`, run the same install script in `/home/cgbuilder/repos/Computer Estimator` if needed |

WESLEYDESK may verify imports with `cest opening-stack-verify` and run CPU/GPU-limited Paddle checks, but those receipts must not be treated as RTX 5080 proof.

Important distinction:

`docs/handoff/GPU_WESLEYDESK_PROMOTION.md` describes a future 5080-on-WESLEYDESK 24/7 production promotion. That is separate from today's host split where RYZEN9DESK owns the 5080.

## RTX 5080 Value Lookup Pattern

The L: master index may not name "RTX 5080" directly. Agents should infer 5080 build value through the apps and work packages that can use GPU acceleration.

Primary lane: **Computer Estimator**.

| Question | Canonical lookup |
| --- | --- |
| Which app owns GPU parser value? | `00-master-index/BY-KIND/capital-glass-apps.json` → `computer-estimator` |
| Which research index matters most? | `08-app-opportunity-map/revu-opening-detection-top10-v1-index.json` |
| Which package has manifests? | `00-master-index/BY-KIND/handoff-packages.json` → `PKG-REVU-OPENING-DETECTION-PILOT-V1` |
| Where are per-library Z: manifests? | `Z:/Capital-Glass-Research/Scraper-Corpus/github-research/repos/<slug>/02-manifests/revu-opening-*-github-v1.json` |
| Which optional parser alternative should be watched? | `03-domains/vendor-docs/docling/compacts/docling-adoption-agent-compact-v1.json` |

### 5080 Tiering From Current Hub Interpretation

| Tier | Items | Meaning |
| --- | --- | --- |
| Tier 1 - direct inference wins | SAHI, PaddleDetection | Highest ROI for RTX 5080: tiled object detection on large plan sheets |
| Tier 1 - complementary parser lanes | PyMuPDF, pymkup | CPU/vector/markup lanes that improve training and evidence fusion |
| Tier 2 - labeling/model build | CVAT, SAM 2 | Use 5080 time for proprietary dataset creation and fine-tuning support |
| Tier 3 - watch/study | Docling, Unstructured, CubiCasa5K, FloorPlanCAD, PERDAW, Arch FP YOLO | Benchmark or research only until a mission proves value |

### Current 5080 ROI Decision

The natural implementation work package is:

```text
cg-opening-locator-v1
```

Scope:

- Wire SAHI + PaddleDetection into Computer Estimator's existing GPU benchmark / activation path.
- Fuse detections with existing `plan-detector/` geometry instead of replacing geometry.
- Use CVAT + SAM 2 for Capital Glass proprietary opening labels.
- Keep Docling as WATCH for schedule/table fixtures against camelot + PP-Structure.
- Defer proposal-stack libraries for CE parser throughput; they target proposal output, not opening detection.

### Important Gaps

| Gap | Meaning |
| --- | --- |
| `10-approved-for-use/` count is 0 | All catalog recommendations are pre-approval until reviewed |
| Revu-opening DE KB artifacts are shallow | Use hub registry + Z: manifests as reliable pointers today |
| No explicit RTX 5080 activation doc in master index | Follow Computer Estimator handoff: `docs/handoff/GPU_WESLEYDESK_PROMOTION.md` and `cg-opening-locator-v1` |


## Agent Decision Rule

| Need | Go to |
| --- | --- |
| What is happening now? | `work-progress/ACTIVE_WORK.md` |
| What project files exist? | `work-progress/projects/INDEX.md` |
| What libraries/apps were researched? | `Data-Extraction/config/agent-research-library/` |
| Where are raw scraped pages? | `Scraper/ui-capture/artifacts/vendor-docs/` |
| Where are processed knowledge packages? | `Data-Extraction/artifacts/data-extraction-2/` |
| Where are quick-access published copies? | `L:\Capital-Glass-Research\` and `L:\Capital-Glass-Intelligence-Hub\` |
| How do apps/repos connect? | `CG-AppBuilder-MCP/docs/SUITE_BRIDGE_MAP.md` |
| What schema should a producer/consumer use? | `CG-AppBuilder-MCP/contracts/external-schema-index.json` |
| What is the constitutional capture/closeout rule? | `CG-Platform-Governance-MCP` |

## What Does Not Belong Here

Do not put these in Cross-Agent:

- Full scraped corpuses.
- Full Bible copies.
- MCP server code.
- Database migrations.
- Secrets.
- Large logs.
- App implementation code.

Cross-Agent should store durable pointers, decisions, evidence summaries, run results, commits, and next actions.
