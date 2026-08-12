# Work package: capital-glass-proposal-learning-compounding-spine-v1

**Status:** WAVE_2_STRUCTURAL_EXTRACTION_COMPLETE  
**Parent program:** `capital-glass-experience-graph-compounding-v1`  
**Mission class:** fix (material)  
**Owner coordination:** CapitalGlass-Cross-Agent  
**Implementation owners:** Data-Extraction (admission/normalization), capital-glass-estimating-parser (structural extract), CG-MASTER-GRAPH (graph projection)

## North star

Convert historical Capital Glass **issued proposal PDFs** into provenance-backed estimating intelligence without treating assumptions as facts or proposal price as cost truth.

## Hard invariants (inherited)

- `UNKNOWN != ZERO`
- `MODEL_INFERRED != AUTHORITY`
- Raw source preserved before parse; normalized output never replaces raw
- Contradictions preserved; no silent conflict resolution
- Frequency observations ≠ company standards
- Bid Composer consumes learned intelligence; does not own general extraction

## Wave status

| Wave | Scope | Status |
| --- | --- | --- |
| 0 | Discovery + reuse matrix | **COMPLETE** |
| 1 | Raw admission + identity + parser record shell | **COMPLETE** — 23/23 Z: corpus batch |
| 2 | Structural extraction (systems/frames/glass/doors/hardware/scope) | **COMPLETE** — Wave 2 frame layouts (23/23 with frames) |
| 3 | Decision events + special conditions | PLANNED |
| 4 | Validation / contradiction engine | PLANNED |
| 5 | Boilerplate reduction | PLANNED |
| 6 | Graph + precedent retrieval | **FOUNDATION_EMITTED** — experience graph + spine projection bundle |
| 7 | Human review loop | PLANNED |
| 8 | Corpus backfill | **BATCH_EXTRACTED** — `ce-issued-proposal-corpus-v1` (23 PDFs); harvest `harvest-2026-08-12-proposal-learning-corpus-extract-v1` |
| 9 | Cross-source join readiness | PLANNED |

## Contracts (B1 extension)

- `contracts/proposal-learning/proposal-learning-record-v1.schema.json`
- `contracts/proposal-learning/estimator-decision-event-v1.schema.json`
- `contracts/proposal-learning/provenance-atom-v1.schema.json`

## Corpus admission (Wave 0 finding)

| Named sample | Canonical location found | Classification |
| --- | --- | --- |
| Bubba's 33 | Z: `Computer Estimator Sample Documents/full-plan-sets/!FULL SET Bubbas 33.pdf` | **PLAN_SET** (not issued proposal) |
| Bandera Hospital | Z: full-plan-sets combined set | PLAN_SET |
| Bellmead Duggar Field | Z: Bellmead Operations Building drawings | PLAN_SET |
| Belltec Expansion | Z: Belltec ARCH/MEP/STRUC | PLAN_SET |
| Carmen Commercial Center | Z: Carmen Commercial submittals | PLAN_SET |
| Anderson County Agrilife | Z: plan set PDF | PLAN_SET |
| College Station Self Storage | Z: College Station Complete Set | PLAN_SET |
| Caliber Collision Terrell | Not confirmed in scoped inventory | **MISSING** |
| Classic Collision Austin | Not confirmed | **MISSING** |
| Bubble Bath Tomball | Referenced in suite ROI (DC quote orphan) | **ORPHAN_REFERENCE** |

**Issued proposal lane (confirmed):** `L:\CapitalGlass-BidComposer\issued\{bidId}\` — Bid Composer production issued snapshots (limited count).

**Golden fixture (parser):** `capital-glass-estimating-parser/tests/fixtures/crunch-proposal-excerpt.txt` (Crunch Fitness Dove Creek / CG-1101-26).

**Operator action for Wave 8:** ~~Provide Synology or L: path~~ **Resolved 2026-08-12:** `Z:\Capital-Glass-Dev\Computer Estimator Sample Documents\Proposals` — manifest `ce-issued-proposal-corpus-v1`. Learning extraction continues under `issued-proposal-structured-estimator-learning-v1`.

## Implementation map

| Capability | Classification | Owner |
| --- | --- | --- |
| Raw hash + duplicate preflight | REUSE/EXTEND | Data-Extraction `deterministic-intake` patterns |
| Proposal structural regex extract | ADAPT | capital-glass-estimating-parser `proposal_extract.py` |
| `PROPOSAL_LEARNING_RECORD_V1` | EXTEND (new contract) | Cross-Agent |
| Experience graph emission | REUSE | Data-Extraction `emit-experience-graph-contribution.mjs` |
| Estimating spine graph edges | EXTEND | CG-MASTER-GRAPH `estimating-spine-graph-schema` |
| Gold Mine candidate publication | REUSE | Data-Extraction `gold-mine` |
| Live bid proposal tables | REUSE (consumer) | Bid Composer `bid_*` |
| Historical proposal PDF ingest lane | **NEW** (this WP) | Data-Extraction `scripts/proposal-learning/` |

## Evidence

- Wave 0: `artifacts/agent-runs/capital-glass-proposal-learning-compounding-spine-v1/wave0-discovery.json`
- Wave 1/2 corpus batch: `artifacts/agent-runs/capital-glass-proposal-learning-compounding-spine-v1/corpus-batch-receipt.json` (23/23 extracted, 0 zero-frame after Wave 2)
- Wave 6 graph emission: `Data-Extraction/artifacts/agent-runs/capital-glass-proposal-learning-compounding-spine-v1/experience-graph/proposal-learning-graph-emission-manifest.json`
- BidComposer issued lane: `Data-Extraction/artifacts/agent-runs/capital-glass-proposal-learning-compounding-spine-v1/bidcomposer-issued-batch-receipt.json`
