# ce-issued-proposal-corpus-v1

**Status:** **FOUNDATION_COMPLETE — git authority shipped; not DURABLE_COMPLETE**  
**Successor WP:** `issued-proposal-structured-estimator-learning-v1`  
**Parent program:** `capital-glass-proposal-learning-compounding-spine-v1` (Wave 8 corpus path unblocked)  
**Consumer repos:** CapitalGlass-BidComposer, Computer Estimator, capital-glass-estimating-parser, CG-Human-Estimator-MCP  
**Mission class:** `investigate` → `docs` (corpus indexing)

## Business question

Can agents discover, parse, and reuse **issued Capital Glass proposal PDFs** on Z: as a benchmark corpus for compiler parity, schedule-row import, and Human Estimator reusable language — without treating PDF text as approved scope?

**Answer so far:** Yes for **catalog + executive summary + exclusion templates**; frame/glass list table extraction is next parser slice.

## Corpus authority

| Field | Value |
| --- | --- |
| Corpus ID | `ce-sample-issued-proposals-v1` |
| Windows path | `Z:\Capital-Glass-Dev\Computer Estimator Sample Documents\Proposals` |
| WSL path | `/mnt/z/Capital-Glass-Dev/Computer Estimator Sample Documents/Proposals` |
| Count | 23 PDFs (Jan–Jun 2026) |
| Bid ID pattern | `CG-{####}-26` |

**Not** CE plan pipeline input — sibling folders `bid-sheets/` and `full-plan-sets/` remain upstream evidence.

## Artifacts (git authority until L: publication)

| Artifact | Path |
| --- | --- |
| Full manifest (23 records) | `artifacts/issued-proposal-corpus-v1/manifest.json` |
| Hub compact slice (git failover) | `work-progress/intelligence-hub-slices/issued-proposal-corpus-v1.json` |
| Exclusion phrase library | `artifacts/issued-proposal-corpus-v1/exclusion-phrase-library-v1.json` |
| Regression pack | `artifacts/issued-proposal-corpus-v1/regression-pack-v1.json` |
| Knowledge builds | `artifacts/issued-proposal-corpus-v1/knowledge-builds/*.json` |
| AGENT_BUILD_CATALOG patch | `artifacts/issued-proposal-corpus-v1/agent-build-catalog-patch-v1.json` |
| Harvest script | `scripts/issued-proposal-corpus/harvest-issued-proposal-corpus-v1.py` |

Regenerate:

```bash
python3 scripts/issued-proposal-corpus/harvest-issued-proposal-corpus-v1.py
# or
node scripts/issued-proposal-corpus/harvest-issued-proposal-corpus-v1.mjs
```

Requires `poppler-utils` (`pdftotext`, `pdfinfo`).

## Corpus stats (2026-08-12 harvest)

| Metric | Value |
| --- | --- |
| Pages | 6–11 (median 8) |
| Base bid | $20,785 – $632,200 (median $61,590) |
| Dominant system | Tubelite T14000 storefront |
| Universal exclusion | Waterproofing beyond storefront (23/23) |

## Regression tiers

| Tier | Bid IDs | Use |
| --- | --- | --- |
| smoke | CG-1055-26, CG-1098-26 | Parser + compiler smoke |
| multiBuilding | CG-1136-26, CG-1105-26 | Building splits |
| alternates | CG-1055-26, CG-1138-26, CG-1137-26 | Alternate pricing lines |
| specialScope | CG-1131-26 | Demolition, access, healthcare |
| largeCommercial | CG-1061-26, CG-1105-26, CG-1122-26 | High SF / price |

## Indexed blocker relief

| Blocker | How this package helps |
| --- | --- |
| `bid-composer-weak-on-window-schedule-row` | `frame-schedule-glass-list-schema-v1.json` + 23 real glass-list tables |
| `de-opening-detection-kb-is-shallow` | Pair corpus with `full-plan-sets/` for plan↔issued crosswalk (future slice) |

## Slices

### Slice 1 — Corpus manifest + hub slice ✅

23 PDFs harvested to manifest + `issued-proposal-corpus-v1.json` git failover slice.

### Slice 2 — Knowledge builds ✅

Section templates, quantity summary schema, frame schedule schema, vertical profiles under `knowledge-builds/`.

### Slice 3 — Bid Composer regression pointer ✅

`CapitalGlass-BidComposer/fixtures/issued-proposal-corpus/regression-pack-v1.json` → Cross-Agent manifest.

### Slice 4 — Hub publication (operator)

Merge `agent-build-catalog-patch-v1.json` on WESLEYDESK `index-publication.yml` — **do not** hand-write L: from Cursor.

## Forbidden

- Treating issued PDF prose as estimator-approved scope without `bid_*` review
- Batch-processing `Proposals/` through CE plan pipeline
- Writing secrets or customer PII beyond what is already in issued PDFs into git

## Next actions

**Hand off to `issued-proposal-structured-estimator-learning-v1`.** This WP stops at corpus admission + reproducible harvest.

1. **Operator:** publish hub slice + catalog patch to L: (WESLEYDESK)  
2. **Parser:** frame schedule + glass list table extractor (not more executive-summary work)  
3. **Bid Composer:** `test:issued-proposal-corpus-parity` on smoke tier  
4. **Cross-Agent / Data-Extraction:** populate `PROPOSAL_LEARNING_RECORD_V1` + `ESTIMATOR_DECISION_EVENT_V1`

## Maturity at close (foundation only)

| Lane | Grade |
| --- | --- |
| Corpus discovery/admission | A |
| Reproducibility/regression foundation | A- |
| Proposal parsing | B / early |
| Structured estimator-learning | C / partial — **successor WP** |
| Decision-event learning | not proven — **successor WP** |
