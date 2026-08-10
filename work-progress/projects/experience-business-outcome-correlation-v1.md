# experience-business-outcome-correlation-v1

**Program:** `capital-glass-experience-graph-compounding-v1`  
**Wave:** FOURTH_BUSINESS_EXPANSION_WAVE  
**Priority:** PARALLEL (Lane A — must not block Lane B)  
**Status:** IN_PROGRESS  
**Branch:** `work/experience-business-outcome-correlation-v1`  
**Owner repos:** `Data-Extraction`, `CapitalGlass-Cross-Agent`

## Mission

Close the learning loop: report/parser experience → human acceptance/correction → business outcome → retrievable pattern.

## Pilot

Beacon Hill / CG-2036-26 EG-06 hosted evidence (`experience-report-parsing-population-live-proof-v1`).

## Slice 1 deliverables

- Business outcome vocabulary (`business-outcome-vocabulary-v1.json`)
- Episode outcome enrichment (no duplicate episodes)
- `run-business-outcome-correlation-pipeline.mjs`
- Proof chain: `population_mismatch` → `final_output_accepted` → `PROPOSAL_CORRECTED` or `UNKNOWN`
- Independent retrieval + Gold Mine v2

## Terminal acceptance

- `BUSINESS_OUTCOME_OBSERVATIONS >= 1`
- `OUTCOME_LINKED_EPISODES >= 1`
- `DETERMINISTIC_OUTCOME_RELATIONSHIPS >= 1`
- `MODEL_INFERRED_AUTHORITY_LEAKAGE=0`
- `GOLD_MINE_V2=PASS`
- `BUSINESS_OUTCOME_RETRIEVAL=PASS`
- `HARVEST_T2=PASS` + `remoteVerified=true`
