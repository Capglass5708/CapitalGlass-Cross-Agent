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
| Status | Registry drafted — capture not started |

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

## Update log

### 2026-08-01 17:43 CT — investigation recorded; registry drafted

- Recorded architecture split: CE detects, Revu MCP marks up, estimator approves.
- Drafted `revu-opening-detection-top10-v1` registry and Scraper capture batch for ADOPT lane (ranks 1–5).
- Flagged CubiCasa5K and FloorPlanCAD as STUDY-only (noncommercial datasets).
- Defined `cg-opening-locator-v1` as Computer Estimator implementation block, not CapitalGlassRevu.
