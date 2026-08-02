# Project: revu-opening-detection-top10-v1

## Summary

Scope Evidence Locator Phase 2 research registry for door/window/opening detection. Computer Estimator owns detection; CapitalGlassRevu owns approved markup placement and read-back; Revu MCP is not the detection engine.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | `revu-opening-detection-top10-v1` |
| Work package | `cg-opening-locator-v1` |
| Date opened | 2026-08-01 |
| Source | Wesley / Cursor investigation |
| Coordination repo | CapitalGlass-Cross-Agent |
| Detection owner | `Computer Estimator` |
| Markup binding owner | `CapitalGlassRevu` |
| Read-only evidence MCP | `CG-Computer-Estimator-MCP` |
| Status | **Pilot 8/10 operational; parser interpretation captured** |
| Commits / PRs | `Data-Extraction 38e5c58`; `Scraper 36cd354`; `CapitalGlass-Cross-Agent` ledger update pending |

## Architecture rule (mandatory)

| Layer | Owner | Role |
| --- | --- | --- |
| Detection / evidence fusion | Computer Estimator | Vector geometry, SAHI+PaddleDetection, OCR/tags/schedules |
| Evidence API | CG-Computer-Estimator-MCP | Read-only exposure of candidates |
| Markup placement | CapitalGlassRevu | Approved page coordinates → Bluebeam markups → read-back |
| Human gate | Estimator | Mandatory review before production markups or quantities |

Revu MCP must not become the detection engine.

## Current capability gap

| Repo | Gap |
| --- | --- |
| CapitalGlassRevu | Strong control plane and read-back; production takeoff workflow still stub; production docs locked |
| Computer Estimator | Phase 1 text/tables/regions complete; Phase 2 object detection / `cg-opening-locator-v1` not built |
| CG-Computer-Estimator-MCP | Exposes estimator evidence read-only |

Foundations already present in Computer Estimator: PyMuPDF, pdfplumber, OpenCV, PaddleOCR, normalized coordinates, Postgres provenance, rendering, tiling, markup package, `pymkup>=0.8`.

## Top 10 registry verdicts

| Rank | Resource | Verdict | Role |
| --- | --- | --- | --- |
| 1 | pymkup | ADOPT | Historical Bluebeam labels → training data |
| 2 | PyMuPDF | ADOPT | Vector geometry lane (AGPL review) |
| 3 | SAHI | ADOPT | Sliced inference on large sheets |
| 4 | PaddleDetection | ADOPT | Apache-2.0 detector training |
| 5 | CVAT | ADOPT | Labeling / QA |
| 6 | CubiCasa5K | STUDY | CC BY-NC — research only |
| 7 | FloorPlanCAD | STUDY | Noncommercial — research only |
| 8 | PERDAW | BENCHMARK | MIT — early classification experiments |
| 9 | Arch FP YOLO benchmark | WATCH | Ultralytics license review; repo URL TBD |
| 10 | SAM 2 | ADOPT (labeling) | Mask assistant for CVAT |

## Detection lanes (recommended)

1. **Vector geometry** — PyMuPDF `get_drawings()`, wall gaps, door swings, frame lines, storefront grids.
2. **Visual detection** — PaddleDetection + SAHI tiled inference.
3. **Text/schedule fusion** — OCR, tags, door/window schedules, elevation callouts (Phase 1 evidence stages).

## Highest-ROI training source

Capital Glass historical Bluebeam markups via pymkup — not public floor-plan datasets.

## Evaluation gates (initial)

| Metric | Target |
| --- | --- |
| Door-location recall | ≥ 95% |
| Window/opening recall | ≥ 95% |
| Bounding-box IoU | ≥ 0.70 |
| Correct tag association | ≥ 90% |
| Correct schedule-row association | ≥ 85% |
| Unreviewed automatic production writes | 0 |
| Predictions with provenance | 100% |

## Registry / config paths (repos)

| Artifact | Path |
| --- | --- |
| Source registry | `Data-Extraction/config/agent-research-library/revu-opening-detection-top10-v1.json` |
| GitHub capture batch | `Scraper/config/agent-research-library/revu-opening-detection-github-captures-v1.json` |

## Commits / PRs

| Repo | Commit / PR | Status |
| --- | --- | --- |
| Data-Extraction | Pending | Registry JSON |
| Scraper | Pending | Capture batch config |
| CapitalGlass-Cross-Agent | Pending | This project file |

## Blockers

| Blocker | Owner | Action |
| --- | --- | --- |
| Rank 9 benchmark repo URL not pinned | Operator | Supply exact GitHub URL before deep capture |
| PyMuPDF AGPL | Computer Estimator | License review before commercial distribution |
| CubiCasa5K / FloorPlanCAD NC licenses | Research only | Do not use as production training data |
| CapitalGlassRevu production takeoff still stub | CapitalGlassRevu | Bind workflow only after fixture + read-back proof |

## Next actions

| Priority | Action | Owner |
| --- | --- | --- |
| 1 | Publish registry to Z: `00-source-registry` and L: `08-app-opportunity-map` | Data-Extraction |
| 2 | Deep-capture ranks 1–5 via Scraper batch (manifest-only publish) | Scraper |
| 3 | Build `cg-opening-locator-v1` stub in Computer Estimator with four initial classes | Computer Estimator |
| 4 | Extract historical Bluebeam labels with pymkup from completed takeoff PDFs | Computer Estimator |
| 5 | Keep CapitalGlassRevu takeoff workflow locked until estimator-reviewed recall demonstrated | CapitalGlassRevu |

## Parser investigation — 2026-08-01

### Parser goal

Treat this lane as **Computer Estimator → parserEvidencePackage@1.0.0 → Bid Composer**, not Bid Composer's legacy GPT bid-sheet intake.

The parser target is plan PDF evidence: regions, schedules, tags, geometry, provenance, and bounded approval state. Bid Composer is the consumer/review spine after Computer Estimator produces structured evidence.

### High-signal sources for parser work

| Source | Path | Parser relevance |
| --- | --- | --- |
| Opening detection index | `Data-Extraction/config/agent-research-library/revu-opening-detection-top10-v1.json` | Primary parser-adjacent registry for `cg-opening-locator-v1` |
| Docling KB | `artifacts/data-extraction-2/vendor-pilot/KB-DOCLING-GITHUB-V1-2026-08-01/` | Optional layout/table/OCR benchmark path |
| Schema pointers | `contracts/external-schema-index.json` | `parserEvidencePackage@1.0.0`, schedule kinds, Bid Composer consumer shapes |
| Suite bridge | `docs/SUITE_BRIDGE_MAP.md` | Computer Estimator → Bid Composer bridge and documented import gaps |

Low CE-parser relevance: `proposal-stack-top10-v1.json` and `artifacts/data-extraction-2/proposal-stack-pilot/`. Those belong downstream to Bid Composer / Proposal Generator output, not plan parsing.

### Registry interpretation for CE

| Library | Verdict | Parser contribution | CE state |
| --- | --- | --- | --- |
| pymkup | ADOPT | Bluebeam markup labels/UUIDs → training labels | Already in `pyproject.toml` as `pymkup>=0.8` |
| PyMuPDF | ADOPT | Vector paths, annotations, `get_drawings()` | Used in `plan-detector` / `pdf_vectors.py` |
| SAHI | ADOPT | Tiled inference on large plan sheets | Not integrated |
| PaddleDetection | ADOPT | RT-DETR / PP-YOLOE; fits Paddle GPU lane | PaddleOCR yes; detection training not wired |
| CVAT | ADOPT | Label/QA for proprietary door/window set | Not integrated |
| CubiCasa5K | STUDY | Segmentation benchmark only; NC license | Research only |
| FloorPlanCAD | STUDY | Metadata; project discontinued | Research only |
| PERDAW | BENCHMARK | Early classification experiments | Shallow capture only |
| Arch FP YOLO | WATCH | Quick proof; Ultralytics license risk | URL/licensing review needed |
| SAM 2 | ADOPT | Mask assist for labeling, not detector | Not integrated |

The registry reinforces CE's existing evidence-first model. It is not meant to rediscover `plan-detector`; it is the Phase 2 visual-detection adoption list that should sit on top of geometry and markup lanes.

### Computer Estimator foundations already present

| Area | Current foundation |
| --- | --- |
| Opening candidates | `plan-detector/` geometry-first door + storefront candidates |
| Vector lane | Optional PyMuPDF vector extraction |
| MCP/read bridge | Plan-detector MCP tools and pdfscribe export bridge |
| Schedule/table lane | camelot + PaddleOCR / PP-Structure |
| OCR floor | Tesseract CPU fallback |
| Markup lane | pymkup for Bluebeam markup extraction/binding |

### Docling parser relevance

Docling is useful as a benchmark or fallback for:

- Ruled schedule tables beside camelot/pdfplumber.
- Messy raster plans needing unified layout + table extraction.
- Local/air-gapped document conversion aligned with CE workstation policy.

Current state: corpus and URL canon are indexed, but enhancement targets Office Admin knowledge intake first. The Unstructured pilot has empty enhancement candidates and no actionable parser signal yet.

### Honest Data-Extraction gap

The DE pilot produced useful indexes, but the deep vendor interpretation is not finished.

| Artifact | State |
| --- | --- |
| `artifacts/data-extraction-2/revu-opening-detection-pilot/` | Knowledge builds COMPLETE, mostly metadata-only |
| pymkup KB | 1 entity; `unsupported_vendor` unresolved claims |
| PyMuPDF / PaddleDetection / SAHI operational knowledge | `operational-knowledge.json` empty |
| Opening enhancement candidates | Empty |
| Real durable index | Registry JSON, not the shallow KB artifacts |
| Publishing script | `scripts/agent-research-library/publish-revu-opening-detection-pilot.mjs` |

The index is ahead of interpretation: good registry, shallow operational API notes. Data-Extraction still needs deeper vendor KB for pymkup, PyMuPDF, and PaddleDetection.

### Suite consumer gaps

| Gap | Impact |
| --- | --- |
| Bid Composer weak on `window_schedule_row` import | Lowers parser ROI for window/opening evidence |
| Window schedule review lane missing | Needs Bid Composer / HE review design |
| HE MCP read tools missing for this lane | Limits downstream review automation |

DE coordinates meaning, CE produces packages, and Bid Composer is the join spine.

### Recommended parser priorities

| Priority | Work | Owner |
| --- | --- | --- |
| High | Implement SAHI + PaddleDetection tiled visual detection on full architectural sheets; fuse/score-merge with plan-detector geometry instead of replacing geometry | Computer Estimator |
| High | Build CVAT + SAM2 labeling pipeline using Capital Glass takeoff PDFs, pymkup labels, and operator corrections | Computer Estimator / Data-Extraction |
| High | Train classes: `door_plan`, `window_plan`, `door_elevation`, `window_or_glazed_opening_elevation` | Computer Estimator |
| Medium | Finish DE vendor interpretation for pymkup, PyMuPDF, and PaddleDetection; fix `unsupported_vendor` | Data-Extraction |
| Medium | Run Docling spike on one schedule-heavy fixture vs camelot lattice + PP-Structure | Computer Estimator |
| Low | Keep CubiCasa5K, PERDAW, and FloorPlanCAD as research/benchmark only | Data-Extraction |
| Low | Keep proposal-stack pilot out of CE parser scope | Bid Composer / Proposal Generator |

Docling should only be adopted if it improves provenance and bbox contracts without breaking D1/D2/D7 ordering.

### Revu MCP current operating boundary

Today, Revu MCP is used through Cursor on WESLEYDESK while Bluebeam Revu 21 is running. It is not yet available through Bid Composer.

| Capability | Current state |
| --- | --- |
| Cursor MCP invocation | Verified |
| Fixture markup execution | Verified |
| Read-back verification | Verified |
| Estimator Agent Lane | Verified |
| Production documents | Locked |
| Bid Composer export | Disabled |
| Production workflows | None enabled |
| Official Bluebeam host proof | Pending |

Use it now for controlled fixtures, testing, reading PDFs, markup proof, and workflow development. Do not give it live bid plans for unrestricted production takeoff.

Current direct-use pattern:

1. Open Bluebeam Revu 21 on WESLEYDESK and sign into the correct account.
2. Open Cursor in `C:\Developer\repos\CapitalGlassRevu`.
3. Confirm MCP server `user-bluebeam-revu` or `bluebeam-revu` is connected.
4. Use Run Everything mode.
5. Give direct read-only or controlled-fixture instructions, such as page count, existing markups, page scale, controlled measurement markup, read-back, markup ID, and transaction result.

Available tool classes include opening files, page counts, markup listing, add/delete markup, markup shape/state reads and writes, page scale, labels, bookmarks, stamps, custom columns, and Studio search.

### Intended production use

Bid Composer should eventually expose product actions, not raw MCP commands:

| Bid Composer action | Underlying lane |
| --- | --- |
| Open in Revu | Revu MCP opens canonical PDF |
| Prepare takeoff | CE evidence + Revu controlled setup |
| Apply estimating toolset | Revu MCP, gated |
| Read Revu measurements | Revu read-back/export |
| Send approved scope to Bid Composer | Structured quantities into review lane |

Nothing reaches pricing until estimator approval.

### Next Revu work package

Recommended next package: `revu-production-takeoff-pilot-v1`.

Scope one narrow workflow only:

`Document Center canonical plan → open in Revu → storefront/glass takeoff → human approval → structured export → Bid Composer review`.

Until that package is complete, Revu MCP remains a controlled testing and takeoff-development tool, not an unattended production system.


## Parser run evidence - Ryzen9Desk - 2026-08-01

This is a live execution note for the Computer Estimator parser lane.

| Field | Value |
| --- | --- |
| Machine | `RYZEN9DESK` |
| Repo / lane | `Computer Estimator` parser |
| Policy marker | `NO_EXT4_VENV` |
| Staged PDF | `C:\Users\wesle\AppData\Local\Temp\rosewood-staging\20260717_2406 Rosewood Ave_Permit Set - Copy.pdf` |
| Incoming PDF present | `/mnt/c/Developer/repos/Computer Estimator/data/incoming/rosewood-permit-set.pdf` |
| Incoming PDF size observed | `39550976` bytes |
| DB container | `computer_estimator_db` started |
| Health check observed | `unhealthy` before/around DB restart |

### Failure chain

1. Torch CUDA import failed inside WSL/env:

~~~text
ImportError: /mnt/c/Developer/repos/Computer Estimator/.venv/lib/python3.12/site-packages/torch/lib/libtorch_cuda.so: undefined symbol: ncclCommResume
~~~

2. CPU torch wheel was downloaded and installed:

~~~text
torch-2.13.0+cpu
CUDA available: False
~~~

3. Parser then failed on a PDF path mismatch:

~~~text
Plan parser failed: PDF not found: /mnt/c/Developer/repos/Computer Estimator/data/incoming/vector_text_plan.pdf
~~~

4. Actual Rosewood PDF existed at:

~~~text
/mnt/c/Developer/repos/Computer Estimator/data/incoming/rosewood-permit-set.pdf
~~~

### Interpretation

This is not yet a parser-evidence failure. It is an execution/configuration failure:

- CUDA torch/NCCL was broken for the current environment.
- CPU torch fallback installed successfully.
- Parser invocation/default fixture still pointed at `vector_text_plan.pdf`.
- Rosewood file was staged under the expected incoming folder but the parser command did not target it.
- Database service was restarted, but health was observed as `unhealthy` in the pasted run.

### Next action for parser lane

Run the parser with an explicit Rosewood input path after DB health is confirmed:

~~~powershell
cd "C:\Developer\repos\Computer Estimator"
# Confirm DB/container health first.
# Then run parser command with explicit input:
# data/incoming/rosewood-permit-set.pdf
~~~

The exact command should be recorded once confirmed from the Computer Estimator repo scripts. Do not treat `vector_text_plan.pdf` as the target fixture for this Rosewood run.

## GPU machine roles - 2026-08-02

| Host | GPU | Role for this stack |
| --- | --- | --- |
| `WESLEYDESK` | GTX 1080 Ti | Dev / office / L: workflows; opening stack can run here, but it is not the 5080 activation host |
| `RYZEN9DESK` / `CG-RYZEN9DESK-01` | RTX 5080 | Primary GPU target for Paddle GPU 3.x, `dev_gpu`, `gpu-activation-probe`, SAHI/PaddleDetection inference benchmarks |

### Install / verification split

| Host | Install / verification action |
| --- | --- |
| `CG-RYZEN9DESK-01` | Finish RTX 5080 activation using `bash scripts/install_opening_stack_ryzen9desk.sh` and `~/paddle-wheels` for `paddlepaddle-gpu==3.2.1` |
| `WESLEYDESK` | After `sudo apt install python3.14-venv python3-pip`, run the same install script in `/home/cgbuilder/repos/Computer Estimator` if needed; use for import verification and dev checks |

Receipt policy:

> `RTX5080_GPU_ACTIVATION_PROVEN` belongs on `RYZEN9DESK`, not `WESLEYDESK`.

WESLEYDESK 1080 can verify imports with `cest opening-stack-verify` and run CPU/GPU-limited Paddle work, but those receipts are not 5080 proof.

`docs/handoff/GPU_WESLEYDESK_PROMOTION.md` describes a future 5080 on WESLEYDESK for 24/7 production. It should not be confused with today's 1080-vs-5080 split.

## Rosewood parser run - Ryzen9Desk - in progress - 2026-08-01

This records the live Rosewood Computer Estimator parser run on Ryzen9Desk.

| Field | Value |
| --- | --- |
| Host | `RYZEN9DESK` / `wesley@cg-ryzen9desk-01` |
| Repo / lane | `Computer Estimator` plan parser |
| Project | `Rosewood` |
| Document ID | `1a6fda42-8c48-450e-83bf-8bb590af026b` |
| PDF | `data/incoming/rosewood-permit-set.pdf` |
| Source PDF size/pages | 113 MB / 192 pages |
| Execution mode | CPU: `USE_GPU=false`, Tesseract OCR |
| Docker Postgres | Running healthy on `:5433` |
| WSL dependencies | Tesseract + Ghostscript installed |
| PyTorch state | Broken CUDA PyTorch replaced with `torch-2.13.0+cpu` |
| Output paths | `data/processed`, `data/plan-out` |
| Z: status on Ryzen9 | Not mapped for this run; outputs local only |
| Last observed stage | Render around page 98/192 |
| Run log | `/tmp/rosewood-plan-parser.log` |

### Monitor commands

~~~bash
ssh wesley@cg-ryzen9desk-01 'wsl -e bash -lc "tail -f /tmp/rosewood-plan-parser.log"'
ssh wesley@cg-ryzen9desk-01 'wsl -e bash -lc "grep render_page_done /tmp/rosewood-plan-parser.log | tail -3"'
~~~

### Current interpretation

- The earlier smoke run reached ingest -> OCR -> merge, then failed on embed before PyTorch was fixed.
- Current Rosewood run is past ingest and actively rendering.
- This is a CPU-mode validation run, not a GPU performance proof.
- Expected render time for 192 sheets: roughly 10-15 minutes.
- Expected OCR + embed on CPU: roughly 1-3+ hours for the full permit set.
- Review exports should land under `C:\Developer\repos\Computer Estimator\data\plan-out\` on Ryzen9.
- Do not expect `Z:\Plan Out` output until that share is mapped on Ryzen9.

### Completion criteria to record next

When complete, capture:

| Required evidence | Expected value |
| --- | --- |
| JSON closeout | `succeeded: 1` |
| Evidence package path(s) | Paths generated under `data/plan-out` / processed output |
| BC relay readiness | Whether output is suitable for Bid Composer relay import |
| Failures/warnings | Any OCR/embed/export warnings from the log |

## Rosewood bid status and Revu MCP fit - 2026-08-02

This corrects the Rosewood project state and separates the three active lanes.

| Field | Value |
| --- | --- |
| Project | `2406 Rosewood Ave` / `CG-PROJ-ROSEWOOD` |
| Plan set | `20260717_2406 Rosewood Ave_Permit Set.pdf` |
| Current bottom line | Revu/operator corpus has good progress; CE parse failed/stalled; real Bid Composer proposal has not started |

### Lane 1 - Revu / operator intelligence

| Area | Status |
| --- | --- |
| Instructor videos | 13 clips registered in `Data-Extraction/topics/bluebeam-revu/projects/rosewood/project.json` |
| Stages covered | Cover -> floor -> schedule -> elevations -> details -> RFIs/clarifications |
| Latest capture | `VID-ROSEWOOD-DETAIL003` - finishing schedule / exterior window notes |
| Corpus | Transcripts + logic instances on `L:\Capital-Glass-Research` |
| Estimating knowledge | Bound to `CG-PROJ-ROSEWOOD` + `schedule_review` for Human Estimator MCP proof target |

Interpretation: this lane is operator walkthrough -> transcript -> structured estimating logic. It does not mean a Bid Composer proposal is ready.

### Lane 2 - Plan parser / Computer Estimator

| Item | Status |
| --- | --- |
| Plan In drop | Permit PDF was in `Z:\Office\Plan Parser\Plan In\_failed\`; parse never completed cleanly |
| CE GPU on Ryzen desk | Blocked / incomplete due to Paddle wheel setup |
| Active OCR on Ryzen | None reported in this correction |
| L: evidence | Sample/relay docs such as `ce-relay-doc-001`, not a full Rosewood parse package |
| Planned chain | Rosewood Plan In -> CE parse -> Bid Composer import -> issue-gate dry run |

Interpretation: the CE parse chain has not finished. Do not treat Rosewood as having a completed parser evidence package yet.

### Lane 3 - Bid Composer proposal

| Item | Status |
| --- | --- |
| Pilot bid `2085cd1a-...` | CE suite test harness with door conflicts / agent lane; aliased as Rosewood in one validation artifact |
| Real 2406 Rosewood customer bid | Not started as a live Bid Composer job |
| Proposal issued | No - `proposalIssued: false` |
| Release blockers | 3 remaining per wave-f1 readiness |
| Live Rosewood bid ingestion | Blocked: needs L: corpus promote + real `bidId` + agent-lane run |
| Active BC proposal work | Submersive `6b30e040`, PR #41, not Rosewood |

Interpretation: the test harness artifact must not be confused with the real Rosewood customer bid.

### Revu MCP use for Rosewood

Revu MCP can be used for live markup in Bluebeam Revu, under controlled constraints.

| Tool / capability | Rosewood use |
| --- | --- |
| `open_file` | Open the permit PDF in Revu |
| `add_markup` | Clouds, callouts, polylines, highlights, squares, count markers |
| `set_page_scale` | Required before length/area measurements |
| `search` | Find window tags / sheet refs, then highlight |
| `list_markups_in_pdf` / `get_markup_state` | Read back sheet markup state |
| `set_markup_property` / `set_markup_shape` | Adjust existing markups |

Requirements:

- Revu must be running on the machine where the MCP bridge is attached, typically the active desk machine.
- `open_file` comes first; tools operate on the active PDF in Revu.
- PDF path must be local to that machine, for example `Z:\Office\Bids\RoseWood\20260717_2406 Rosewood Ave_Permit Set - Copy.pdf`, L:, or local disk.
- Measurements need scale; call `set_page_scale` per sheet before dimension/area markups.
- Revu MCP is not a substitute for CE OCR. Revu MCP is estimator/agent markup in Revu; CE still owns machine evidence extraction for Bid Composer import.

Suggested Rosewood Revu workflow:

1. `open_file` -> Rosewood permit PDF.
2. `set_page_scale` -> per elevation/schedule sheet.
3. `search` -> `W38`, `W37`, `Type 13`, and transcript-derived tags.
4. `add_markup` -> scope clouds, callouts, and count markers.
5. Optional export -> Plan Out or Bid Composer intake.

What it will not do alone:

- It will not fix the failed Plan In parse.
- It will not create `bid_*` records in Bid Composer.
- It will not issue a proposal.
- Markup is evidence; estimator approval is still required.

Next concrete operator choice: open the Rosewood permit PDF in Revu on the active Revu MCP host and choose the first sheet, such as `A.520.1` schedule, elevation 7, or `A.521` detail.

## Update log

### 2026-08-02 CT - Rosewood bid status corrected

- Separated Rosewood into three lanes: Revu/operator intelligence, CE parser, and Bid Composer proposal.
- Recorded that Revu videos/transcripts/logic corpus have good progress, but the CE parser lane is stalled and the real Bid Composer customer bid has not started.
- Clarified that pilot bid `2085cd1a-...` is a CE suite harness artifact aliased as Rosewood, not the live 2406 Rosewood bid.
- Documented controlled Revu MCP markup use and constraints for Rosewood drawings.

### 2026-08-02 CT - GPU machine roles clarified

- Recorded `WESLEYDESK` as GTX 1080 Ti dev/office/L: workflow host, not current RTX 5080 proof host.
- Recorded `RYZEN9DESK` / `CG-RYZEN9DESK-01` as the RTX 5080 activation and benchmark host for Paddle GPU 3.x, `dev_gpu`, `gpu-activation-probe`, SAHI/PaddleDetection.
- Receipt rule: `RTX5080_GPU_ACTIVATION_PROVEN` belongs on RYZEN9DESK unless a later hardware move and receipt changes authority.
- Noted that `GPU_WESLEYDESK_PROMOTION.md` is a future 5080-on-WESLEYDESK production promotion document, separate from today's host split.

### 2026-08-01 CT - Rosewood parser run started on Ryzen9Desk

- Host: `wesley@cg-ryzen9desk-01` / `RYZEN9DESK`.
- Project: `Rosewood`; document ID `1a6fda42-8c48-450e-83bf-8bb590af026b`.
- Docker Postgres on `:5433` healthy; Tesseract and Ghostscript installed in WSL.
- Broken CUDA torch replaced with CPU `torch-2.13.0+cpu`; run is CPU mode with `USE_GPU=false`.
- 113 MB / 192-page Rosewood PDF copied to `data/incoming/rosewood-permit-set.pdf`.
- Last observed stage: render around page 98/192; outputs are local under `data/processed` and `data/plan-out` because Z: is not mapped on Ryzen9.

### 2026-08-01 CT - Ryzen9Desk parser run evidence captured

- Captured failed parser execution on `RYZEN9DESK` as configuration/runtime evidence, not parser-quality evidence.
- Torch CUDA failed with `ncclCommResume`; CPU `torch-2.13.0+cpu` installed and reported CUDA unavailable.
- Parser failed because it looked for `vector_text_plan.pdf`; actual Rosewood PDF was present as `data/incoming/rosewood-permit-set.pdf`.
- DB container `computer_estimator_db` was started; health was observed as `unhealthy` in the pasted run.

### 2026-08-01 CT — parser and Revu operating boundary captured

- Captured parser target as Computer Estimator → `parserEvidencePackage@1.0.0` → Bid Composer.
- Recorded that Revu opening-detection and Docling are the parser-relevant DE outputs; proposal-stack is downstream and out of CE parser scope.
- Added current Revu MCP operating boundary: Cursor/WESLEYDESK controlled fixtures verified; production documents locked; Bid Composer export disabled.
- Defined next likely package as `revu-production-takeoff-pilot-v1` after `cg-opening-locator-v1` parser work is scoped.


### 2026-08-01 18:07 CT — pilot 8/10 operational; DE handoff ACK_ACCEPTED

- GitHub captures complete for ranks 1–6, 8, 10 (8 sources).
- `PKG-REVU-OPENING-DETECTION-PILOT-V1` validated, ingested, ACK_ACCEPTED.
- Eight knowledge builds under `artifacts/data-extraction-2/revu-opening-detection-pilot/`.
- Commits pushed: Data-Extraction `38e5c58`, Scraper `36cd354`.

### 2026-08-01 17:43 CT — investigation recorded; registry drafted

- Recorded architecture split: CE detects, Revu MCP marks up, estimator approves.
- Drafted `revu-opening-detection-top10-v1` registry and Scraper capture batch for ADOPT lane (ranks 1–5).
- Flagged CubiCasa5K and FloorPlanCAD as STUDY-only (noncommercial datasets).
- Defined `cg-opening-locator-v1` as Computer Estimator implementation block, not CapitalGlassRevu.
