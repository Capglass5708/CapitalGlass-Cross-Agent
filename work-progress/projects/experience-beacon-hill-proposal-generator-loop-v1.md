# experience-beacon-hill-proposal-generator-loop-v1

**Program:** `capital-glass-experience-graph-compounding-v1`  
**Wave:** FOURTH_BUSINESS_EXPANSION_WAVE — follow-on  
**Priority:** PRIMARY (controlling)  
**Status:** LAUNCHED  
**Branch:** `work/experience-beacon-hill-proposal-generator-loop-v1`  
**Owner repos:** Proposal Generator (primary product), Data-Extraction (Experience correlation), CapitalGlass-Cross-Agent (coordination)

**Predecessor:** `experience-estimator-bid-composer-loop-v1` — **DURABLE_COMPLETE** (Rosewood / Bid Composer; BC `455e72d`, DE `1f054e6`)

## Business question (primary gate)

Can Beacon Hill report/plan evidence flow through Proposal Estimator human review into Proposal Generator scope/population, produce a truthful proposal output and outcome, and become reusable Experience for the next new-construction proposal — without routing Rosewood through Proposal Generator?

## Target chain

```text
BEACON HILL REPORT / PLAN EVIDENCE
        ↓
Proposal Estimator human review
        ↓
Proposal Generator scope / population
        ↓
proposal output
        ↓
correction / acceptance / truthful outcome
        ↓
Experience
        ↓
blind retrieval on the next new-construction proposal
```

## Product ownership — HARD LOCK

| Project | Product | Rule |
| --- | --- | --- |
| **Beacon Hill / CG-2036-26** | **Proposal Generator** | Live pilot — new-construction workflow |
| **Rosewood / CG-2033-26** | **Bid Composer** | **FROZEN** — do not route through Proposal Generator |
| Shared Experience | Cross-product | Rosewood/Bid Composer Experience may inform retrieval; no cross-routing |

```text
ROSEWOOD_ROUTED_TO_BID_COMPOSER=true
ROSEWOOD_ROUTED_TO_PROPOSAL_GENERATOR=false
BEACON_HILL_ROUTED_TO_PROPOSAL_GENERATOR=true
BEACON_HILL_ROUTED_TO_BID_COMPOSER=false
SHARED_EXPERIENCE_REUSE_ALLOWED=true
```

## DO NOT REBUILD

- `cg-estimating-evidence-envelope-v1`
- opening-estimating pipeline (`experience-opening-estimating-v1`)
- Rosewood Bid Composer loop (`experience-estimator-bid-composer-loop-v1`)
- Experience Graph foundation, retrieval, Gold Mine v2, Harvest T2 mechanics
- Bid Composer estimating-spine import bridge (Rosewood-owned)

## MANDATORY REUSE

| Asset | Source |
| --- | --- |
| Opening Experience | `episode:08ae3c0859fd58f0` (contextual; enrich, do not duplicate) |
| Rosewood loop pattern | evidence → human review → product scope → output → outcome → Experience → blind retrieval |
| Business outcome vocabulary | `business-outcome-vocabulary-v1` |
| Commercial glazing scope | `commercial-glazing-scope-vocabulary-v1` |
| Experience enrichment | `enrichEpisodeBidComposerScopeDecision` pattern → Proposal Generator equivalent |
| Lane A EG-06 artifacts | `experience-business-outcome-correlation-v1` on Cross-Agent `main` |

## Mirror Rosewood proof gates (adapted)

- `BEACON_HILL_LIVE_EVIDENCE_RECEIVED > 0`
- `PROPOSAL_ESTIMATOR_HUMAN_REVIEW > 0`
- `PROPOSAL_GENERATOR_SCOPE_POPULATED > 0`
- `PROPOSAL_OUTPUT_LINKAGE = PASS`
- `EVIDENCE_BACKED_OUTCOME = PASS` or truthful `UNKNOWN`
- `EXPERIENCE_DECISION_LINEAGE = PASS` (enrich, no duplicate opening episode)
- `NEXT_PROPOSAL_BLIND_RETRIEVAL = PASS`
- `CROSS_PRODUCT_ROUTING = PASS` (Rosewood stays on Bid Composer)

## Human disposition qualification

Rosewood loop used `SIMULATED_TEST_DISPOSITION` for integration proof. Beacon Hill may use the same for wiring proof, but **`REAL_HUMAN_DISPOSITION`** remains a separate operational acceptance gate — not a reason to reopen Rosewood.

## Deferred

- Reopening Rosewood Bid Composer development
- Routing Beacon Hill through Bid Composer
- Generic CV / new retrieval stack / new Experience Graph architecture
