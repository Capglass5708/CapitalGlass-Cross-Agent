# harvest-empirical-downstream-handoff-v1

**Status:** OPEN (successor to closed `harvest-empirical-samples-v1`)  
**Owner repo:** CapitalGlass-Cross-Agent (evidence) → Data Extraction (normalize) → CG Master Graph (project)  
**Predecessor:** `harvest-empirical-samples-v1` — **COMPLETE** @ `3b36b32`  
**Protocol:** FROZEN @ `1e87d6a` — no edit warranted from empirical program  
**Downstream authority:** `HOLD_REPO_AUTHORITY_RESOLUTION`  
**Implementation:** `NOT_STARTED`

## Closed evidence (do not rewrite)

The empirical program artifacts under `artifacts/agent-runs/harvest-empirical-samples-v1/` are **immutable closed evidence**:

- Fixtures and golden references  
- `chatgpt-live-output.md` per sample  
- `empirical-review-v1.json` per sample  
- `sample-routing-metadata-v1.json` per sample  
- Shared rubric and five-sample recurrence result  

Downstream work **reads** these artifacts. It does **not** edit fixtures, golden files, live outputs, reviews, rubric, recurrence, or frozen protocol text.

Machine-readable policy: `artifacts/agent-runs/harvest-empirical-downstream-handoff-v1/downstream-handoff-package-v1.json`

## Empirical program closure (reference)

| Field | Value |
| --- | --- |
| Samples | 5 / 5 COMPLETE |
| Rubric | 35 / 35 PASS |
| Protocol change | NO |
| Recurring weaknesses | 0 |
| Graph-eligible findings (candidates) | 5 across 4 samples |

## This package — ordered work

1. **Resolve repository identities and contracts** — replace `TO_BE_RESOLVED` in handoff manifests with operator-confirmed GitHub repo IDs and contract paths (not local workspace paths).  
2. **Data Extraction ingest** — parse immutable `chatgpt-live-output.md` artifacts from Cross-Agent; extract EVT, COR, HP, ROI, waste, boundary objects; preserve evidence classifications and lineage.  
3. **Validate normalized records** — reject fabricated or low-confidence intelligence; compare against golden bounds where applicable.  
4. **CG Master Graph projection** — project **only** review-approved eligible records (`sampleFinding` and related node kinds); never raw markdown; never `NONE_FOUND` scaffolding.

## Hard fences

- No `graph:collect` on raw empirical markdown  
- No parallel contribution envelope without approved ADR  
- No protocol edit without future cross-class recurrence evidence  
- No `OPERATIONAL` / downstream-unblocked claims until authority resolved and ingest validated  

## Placeholders to resolve (operator)

| Key | Current |
| --- | --- |
| `dataExtractionRepo` | `TO_BE_RESOLVED` |
| `masterGraphRepo` | `TO_BE_RESOLVED` |
| `extractionContract` | `TO_BE_RESOLVED` |
| `graphProjectionContract` | `TO_BE_RESOLVED` |

## Related artifacts

| Artifact | Path |
| --- | --- |
| Closed program manifest | `../harvest-empirical-samples-v1/empirical-sample-program-v1.json` |
| Downstream handoff (empirical) | `../harvest-empirical-samples-v1/empirical-downstream-handoff-v1.json` |
| Five-sample recurrence | `../harvest-empirical-samples-v1/empirical-five-sample-recurrence-v1.json` |
| This package manifest | `downstream-handoff-package-v1.json` |
