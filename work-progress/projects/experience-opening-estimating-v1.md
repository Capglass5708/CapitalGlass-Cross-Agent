# experience-opening-estimating-v1

**Program:** `capital-glass-experience-graph-compounding-v1`  
**Wave:** FOURTH_BUSINESS_EXPANSION_WAVE  
**Priority:** PRIMARY (Lane B)  
**Status:** SLICE_2_LIVE_PROOF_PASS — Harvest T2 terminal closeout in progress  
**Feature head:** `784c3c3` (Data-Extraction)  
**Branch:** `work/experience-opening-estimating-v1`  
**Owner repos:** `Data-Extraction`, `CapitalGlass-Cross-Agent`

## Mission

Learn commercial-glazing estimating scope from plans/markups → opening recognition → human review → Experience → retrievable precedent.

## Pilot

**Selected:** Beacon Hill / CG-2036-26 (`projectId: 5d38b25a-c391-4d7c-8866-f8a1f4cea942`)

**Rationale:** Real Capital Glass project with hosted EG-06 business observations and Bluebeam spine proof (`snap-beacon-hill-a6-2-v1`, storefront markup). Lookout Industrial fixtures are richer structurally but `projectContext: mock_fixture` — used only as structural reference in tests, not as pilot authority.

## Reuse (do not rebuild)

- `cg-estimating-evidence-envelope-v1`
- Master Graph `OpeningCandidate` / estimating spine
- Experience Graph B1 contracts
- `run-business-experience-pipeline` patterns
- Gold Mine v2 scorer
- Harvest T2 closeout path

## Slice 1 deliverables

- Commercial glazing scope vocabulary (`commercial-glazing-scope-vocabulary-v1.json`)
- Estimating opening observation ref contract
- `correlate-episode-from-estimating-evidence.mjs`
- `run-estimating-experience-pipeline.mjs`
- Beacon Hill pilot fixture + retrieval proof tests
- Product coverage before/after in pipeline output

## Terminal acceptance

- `REAL_PROJECT_PILOT=PASS`
- `GLAZING_OPENING_OBSERVATIONS > 0`
- `HUMAN_REVIEW_EVIDENCE > 0`
- `EXPERIENCE_EPISODES > 0`
- `DETERMINISTIC_RELATIONSHIPS > 0`
- `RETRIEVAL=PASS`
- `PRODUCT_COVERAGE_REFRESH=PASS`
- `HARVEST_T2=PASS` + `remoteVerified=true`
