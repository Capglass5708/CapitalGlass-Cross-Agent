# harvest-empirical-downstream-handoff-v1

**Status:** CLOSED_READY_FOR_IMPLEMENTATION  
**Milestone:** `AUTHORITY_RESOLVED_AND_HANDOFF_READY`  
**Owner repo:** CapitalGlass-Cross-Agent (evidence) → Data Extraction (normalize) → CG Master Graph (project)  
**Predecessor:** `harvest-empirical-samples-v1` — **CLOSED** @ `3b36b32`  
**Protocol:** FROZEN @ `1e87d6a`  
**Implementation:** `NOT_STARTED` (deferred to next package)

## Authority resolution (complete)

| Field | Resolved value |
| --- | --- |
| Data Extraction repo | `Capglass5708/Data-Extraction` |
| CG Master Graph repo | `Capglass5708/CG-MASTER-GRAPH` |
| Extraction contract | `docs/platform/SUITE_ADVANCEMENT_GRAPH_LANE.md` |
| Graph projection contract | `docs/CG-HARVEST-TO-GRAPH-CONTRACT-v1.md` |
| Source inventory | **VERIFIED** (29 artifacts, 5 samples) |

Evidence: `artifacts/agent-runs/harvest-empirical-downstream-handoff-v1/authority-resolution-evidence-v1.json`  
Inventory: `artifacts/agent-runs/harvest-empirical-downstream-handoff-v1/source-inventory-verification-v1.json`

## Final state

| Key | Value |
| --- | --- |
| empiricalProgram | CLOSED |
| empiricalEvidence | IMMUTABLE |
| protocol | FROZEN |
| repositoryAuthorities | RESOLVED |
| contracts | PINNED |
| sourceInventory | VERIFIED |
| dataExtraction | NOT_STARTED |
| graphProjection | NOT_STARTED |
| handoffPackage | CLOSED_READY_FOR_IMPLEMENTATION |

## Closed evidence (do not rewrite)

Empirical artifacts under `artifacts/agent-runs/harvest-empirical-samples-v1/` remain **immutable closed evidence**. Downstream implementation reads them only.

## Deferred to next implementation package

- Build Data Extraction empirical parser / ingest runner  
- Run extraction against immutable live outputs  
- Wire Master Graph projection from validated normalized records  
- Protocol edits, new schemas, parallel envelopes, unrelated infrastructure  

## Next implementation package entry criteria

1. Read `authority-resolution-evidence-v1.json` and `source-inventory-verification-v1.json`  
2. Ingest from pinned Cross-Agent evidence paths only  
3. Validate against pinned contracts in owner repos  
4. Project only review-approved eligible `sampleFinding` records  
