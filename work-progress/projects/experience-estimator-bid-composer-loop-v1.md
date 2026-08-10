# experience-estimator-bid-composer-loop-v1

**Program:** `capital-glass-experience-graph-compounding-v1`  
**Wave:** FOURTH_BUSINESS_EXPANSION_WAVE — follow-on  
**Priority:** PRIMARY (controlling)  
**Status:** **DURABLE_COMPLETE**  
**Branch:** `work/experience-estimator-bid-composer-loop-v1` (coordination); owner repos merged to `main`  
**Merge SHAs:** BidComposer `455e72d`, Data-Extraction `1f054e6`, Cross-Agent `5d97b5a`  
**PRs:** [BidComposer #59](https://github.com/Capglass5708/CapitalGlass-BidComposer/pull/59), [Data-Extraction #42](https://github.com/Capglass5708/Data-Extraction/pull/42)  
**Terminal receipt:** `Data-Extraction/artifacts/agent-runs/experience-estimator-bid-composer-loop-v1/terminal-milestone-receipt-v1.json`  
**Harvest T2:** `CapitalGlass-Cross-Agent/artifacts/harvest-runs/experience-estimator-bid-composer-loop-v1/`  
**Cross-Agent closeout:** PR housekeeping (Harvest publication on `main`) — **does not reopen Rosewood development**

## Freeze (2026-08-10)

**Rosewood business-loop implementation is FROZEN.** Do not extend scope, refactor spine import, or re-litigate integration gates.

| Qualification | Note |
| --- | --- |
| Dispositions | `SIMULATED_TEST_DISPOSITION` — integration proof only |
| Production path | Bid Composer review cockpit/API wired for `REAL_HUMAN_DISPOSITION` later |
| Reopen trigger | None for this milestone; ops acceptance is a separate gate |

## Business question (answered — DURABLE_COMPLETE)

Can evidence found in the plans flow through human estimating review into Bid Composer scope, and can that decision become reusable Experience for the next bid? **Yes** (Rosewood pilot; `SIMULATED_TEST_DISPOSITION` for disposition step).

## Product boundary (proven)

## Target chain

```text
REAL PLAN / REVU / CE EVIDENCE
        ↓
Opening / glazing-scope Experience          ← reuse Lane B (episode:08ae3c0859fd58f0 lineage)
        ↓
Human estimator review
        ↓
accepted / corrected estimating decision
        ↓
Bid Composer scope item
        ↓
proposal scope
        ↓
result / later correction
        ↓
Experience
        ↓
retrieved on the next estimate
```

## Locks — DO NOT REBUILD

- `cg-estimating-evidence-envelope-v1`
- `run-estimating-experience-pipeline` / live producer ingestion
- Experience Graph B1 contracts + correlation stack
- `retrieve-experience-by-situation`
- Gold Mine v2 scorer
- Harvest T2 closeout mechanics

## Reuse (mandatory)

| Asset | Location |
| --- | --- |
| Opening Experience lineage | `episode:08ae3c0859fd58f0`, live producer receipt on `main` |
| CE–Revu reconciliation | `CapitalGlassRevu/scripts/lib/ce-revu-reconciliation/pipeline.mjs` |
| Human estimator spine evaluation | `CapitalGlass-BidComposer/src/lib/estimating-spine/human-estimator-evaluation/spine-evaluation-v1.ts` |
| Scope review import | `CapitalGlass-BidComposer/src/lib/estimating-spine/scope-review-import/import-spine-scope-candidate.ts` |
| Scope item contract | `scope-item-v1` — `Data-Extraction/scripts/lib/scope-item-validate.mjs` |
| Commercial glazing scope | `commercial-glazing-scope-vocabulary-v1` |
| Lane B live pilot | Beacon Hill + Rosewood supplemental evidence paths |

## Parallel lane (non-blocking)

`experience-business-outcome-correlation-v1` (Lane A) closes independently. Its PR/merge must not delay this milestone unless it exposes a **shared contract dependency** (e.g. episode identity, business-outcome vocabulary).

## Slices

### Slice 1 — Spine import bridge (fixture + live-envelope path)

Wire validated opening/scope evidence → `buildSpineHumanEstimatorEvaluation` → `importSpineScopeReviewPackage` → pending scope review items with Experience refs.

**Acceptance:**

- `SCOPE_REVIEW_ITEMS_FROM_EVIDENCE=PASS` (≥1 item from live or Rosewood reconciliation path)
- `EXPERIENCE_LINEAGE_LINKED=PASS` (refs `episode:08ae3c0859fd58f0` or successor — no duplicate episode)
- `HUMAN_ESTIMATOR_EVALUATION=PASS` (`writePerformed: false`, commercial boundary preserved)
- Fixture regression only; no new envelope authority

### Slice 2 — Human disposition loop

Estimator accepts/corrects scope review items; capture disposition + override events; enrich Experience (no duplicate episodes).

**Acceptance:**

- ≥1 accepted disposition + ≥1 corrected/wrong-move **only if honestly evidenced**
- `EXPERIENCE_EPISODES=PASS` with disposition provenance
- Independent retrieval on a **new bid situation** query (no project/episode IDs)

### Slice 3 — Proposal scope + compounding closeout

Map approved scope review items toward `scope-item-v1` / proposal scope; optional business outcome hook (Lane A pattern); Harvest T2 terminal closeout when live proof is coherent.

## Terminal acceptance (preview)

- `ESTIMATING_TO_BID_COMPOSER_SCOPE=PASS`
- `HUMAN_DISPOSITION_CAPTURED=PASS`
- `EXPERIENCE_COMPOUNDING=PASS`
- `INDEPENDENT_RETRIEVAL=PASS`
- `BUSINESS_VALUE_PROOF=PASS` (answers the business question above)
- `HARVEST_T2=PASS` + `remoteVerified=true` when closing

## Deferred

- New envelope formats
- Second document engine / retrieval stack
- Literal correction fabrication when evidence absent
- Full proposal-generator production deploy (scope proof first)
