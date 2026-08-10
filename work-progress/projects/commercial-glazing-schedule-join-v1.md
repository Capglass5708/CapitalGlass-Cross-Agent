# commercial-glazing-schedule-join-v1

**Program:** `capital-glass-experience-graph-compounding-v1`  
**Status:** DURABLE_COMPLETE  
**Owner repos:** `Computer Estimator`, `CapitalGlass-Cross-Agent`, `Data-Extraction`  
**Parent:** `experience-opening-estimating-v1` (Lane B)

## Mission

Join opening identity to schedule rows and emit a deterministic **enriched glazing scope object** per candidate:

`opening identity → schedule association → size / type / system / material / remarks / qty → enriched glazing scope object`

## Proof project

| Field | Value |
| --- | --- |
| Project | Beacon Hill / **CG-2036-26** |
| `projectId` | `5d38b25a-c391-4d7c-8866-f8a1f4cea942` |
| L: path | `/mnt/l/Capital-Glass-Projects/CG-2036-26 - Lincoln - Waller Beacon Hill` |
| General Elevation report | `01 - Estimating/05 - Reports/General Elevation/LINCOLN - WALLER BEACON HILL EXTERIOR - General Elevation.XLS` |

## Reuse (do not rebuild)

- `cg-estimating-evidence-envelope-v1` + CE `envelope_reconciliation` pipeline
- `commercial-glazing-scope-vocabulary-v1`
- Beacon Hill pilot fixture (`beacon-hill-estimating-pilot.json`)
- `experience-opening-estimating-v1` opening observations

## Slice 1 deliverables

- Contract: `contracts/estimating/enriched-glazing-scope-object-v1.json`
- CE module: `schedule_join.build_enriched_glazing_scope_objects`
- Fixture: `fixtures/estimating-spine/beacon-hill-schedule-join-pilot-v1.json`
- Unit tests: joined W22 row + schedule-only D-101 row
- Terminal receipt fields on reconciliation output: `enrichedGlazingScopeObjects[]`

## Terminal acceptance (slice 1)

- `SCHEDULE_JOIN_DETERMINISTIC=PASS` (idempotent replay)
- `BEACON_HILL_FIXTURE_JOINED_OPENING_COUNT >= 1`
- `ENRICHED_SCOPE_COMMERCIAL_STATE=none` (no BC writes)
- `COMMERCIAL_GLAZING_SCOPE_VOCABULARY_BOUND=PASS`

## Slice 2 — live-beacon-hill-schedule-join-v1

**Status:** PASS (2026-08-10)

| Field | Value |
| --- | --- |
| SOURCE_A | `L:.../General Elevation/LINCOLN - WALLER BEACON HILL EXTERIOR - General Elevation.XLS` |
| SOURCE_B | `Data-Extraction/.../beacon-hill-estimating-pilot.json` |
| Receipt | `Computer Estimator/artifacts/agent-runs/commercial-glazing-schedule-join-v1/live-beacon-hill-schedule-join-receipt.json` |
| Joined scopes | 17/17 JOINED |
| Unmatched observations | 1 (curtain wall — explicit, no CW row on General Elevation) |

Run:

```bash
cd "Computer Estimator"
PYTHONPATH=src python scripts/run_live_beacon_hill_schedule_join.py
```

**Stop gate cleared:** Experience wiring (`run-estimating-experience-pipeline.mjs`) may proceed when operator authorizes slice 3.

## Slice 3 — experience-pipeline-wiring-v1

**Status:** PASS (2026-08-10)

| Field | Value |
| --- | --- |
| Input | Slice 2 receipt (no filesystem rediscovery) |
| Pipeline | `Data-Extraction/scripts/experience-graph/lib/run-estimating-experience-pipeline-from-schedule-join.mjs` |
| Receipt | `Data-Extraction/artifacts/agent-runs/commercial-glazing-schedule-join-v1/live-beacon-hill-experience-wiring-receipt.json` |
| Opening observations | 2 (storefront correction JOINED + curtain wall UNMATCHED explicit) |
| Experience observations | 2 |
| Episodes | 1 |
| Retrieval | PASS (storefront correction retrievable, score 7) |

Run:

```bash
cd Data-Extraction
npm run experience:wiring:live-beacon-hill
npm run test:experience-schedule-join-wiring
```

**Terminal gate:** `EXPERIENCE_PIPELINE_WIRING=PASS` — all wiring gates green; no BC/PG writes; `commercialState=none`; idempotent replay proven.

**Stop gate cleared:** Slice 4 human review lane may open when operator authorizes.

## Slice 4 — human-review-lane

**Status:** PASS (2026-08-10)

| Field | Value |
| --- | --- |
| Input | Slice 2 + Slice 3 receipts (no L: rediscovery) |
| Contract | `CapitalGlass-Cross-Agent/contracts/estimating/human-review-packet-v1.json` |
| Pipeline | `Data-Extraction/scripts/experience-graph/lib/build-human-review-packet-from-receipts.mjs` |
| Receipt | `Data-Extraction/artifacts/agent-runs/commercial-glazing-schedule-join-v1/live-beacon-hill-human-review-lane-receipt.json` |
| Review items | 2 (storefront JOINED + curtain wall CG_GLAZING_OMISSION_REVIEW) |
| Decisions proved | CORRECT (storefront remarks) + DEFER (curtain wall unmatched) |
| Learning handoff | 1 governed candidate (ingestion not performed) |

Run:

```bash
cd Data-Extraction
npm run experience:human-review:live-beacon-hill
npm run test:human-review-lane
```

**Terminal gate:** `HUMAN_REVIEW_LANE=PASS` — evidence hierarchy preserved; Experience advisory-only; `UNMATCHED_SCOPE_AUTO_PROMOTION=0`; no BC/PG writes.

**Parent milestone:** `commercial-glazing-schedule-join-v1` → **DURABLE_COMPLETE**

| Merge SHA | Repo |
| --- | --- |
| `8081826b` | Data-Extraction (#43) |
| `8d18ea94` | CapitalGlass-Cross-Agent (#32) |

Closeout receipts: `artifacts/agent-runs/commercial-glazing-schedule-join-v1/`

## Out of scope (this WP)

- Ryzen / ASG / MCP infrastructure convergence (complete — hold unless ASG drift)
- `waverunner-mcp-spoke-receipt-enforcement-v1`
- Bid Composer commercial disposition / pricing
