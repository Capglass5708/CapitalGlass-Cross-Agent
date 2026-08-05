# harvest-empirical-samples-v1

**Status:** CLOSED — see successor `harvest-empirical-downstream-handoff-v1`  
**Owner repo:** CapitalGlass-Cross-Agent  
**Protocol state:** FROZEN — authority at `1e87d6a` (`harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md`); publication evidence at `b8ceb83` (not protocol text)

## Program lineage (explicit commits)

| Role | Commit |
| --- | --- |
| Protocol authority (frozen text) | `1e87d6a` |
| Program scaffold | `2b565d3` |
| Thin live run | `0034073` |
| Downstream routing metadata | `a2cfa25` |
| Publication evidence | `b8ceb83` |
| Planning live run | `60ac4cb` |
| Five-sample recurrence | see `empirical-five-sample-recurrence-v1.json` |

## Purpose

Empirically test the frozen ChatGPT OBSERVED harvest protocol across five thread classes before any protocol expansion. Outputs are upstream evidence for **Data Extraction → CG Master Graph** — not an isolated harvest test.

## Intended lineage

```text
ChatGPT empirical sample
  → Data Extraction (parse, normalize, validate)
  → CG Master Graph (eligible objects only)
  → retrieval / reuse / protocol-learning signals
```

**Handoff status:** `HOLD_REPO_AUTHORITY_RESOLUTION` — repo IDs and contract paths in manifest are `TO_BE_RESOLVED` until operator confirms GitHub authorities.

## Five-sample recurrence verdict

| Field | Value |
| --- | --- |
| Program status | COMPLETE |
| Samples passing | 5 / 5 |
| Protocol change recommended | **No** |
| Recurring weakness candidates | 0 |
| Downstream wiring authorized | **No** |

Turn-2 overreach in four correction-arc fixtures is **fixture-intentional**; frozen protocol consistently captured COR-001 without retaining overreach as intelligence. Full record: `empirical-five-sample-recurrence-v1.json`.

## Review criteria (every sample)

1. Durable intelligence only  
2. No template padding  
3. Traceable evidence  
4. Earned ROI  
5. Justified futureSavings  
6. High signal density  
7. Minimal human edit burden  

## Graph eligibility rule

Project only when:

```text
traceable + durable + nonduplicate + classified + review-approved = graph eligible
```

Do **not** project `NONE_FOUND` headings or template scaffolding as knowledge. Raw `chatgpt-live-output.md` stays immutable; Data Extraction owns normalized projection.

## Sample queue

| # | Class | Sample id | Status | Harvest verdict | Graph eligibility |
| --- | --- | --- | --- | --- | --- |
| 1 | thin | `thin-thread-v1` | COMPLETE | `NO_HARVEST_NEEDED` | hold |
| 2 | medium | `medium-thread-v1` | COMPLETE | `DRAFT_READY_FOR_CURSOR_VALIDATION` | eligible |
| 3 | architectural | `architectural-thread-v1` | COMPLETE | `DRAFT_READY_FOR_CURSOR_VALIDATION` | eligible |
| 4 | debugging | `debugging-thread-v1` | COMPLETE | `DRAFT_READY_FOR_CURSOR_VALIDATION` | eligible |
| 5 | planning | `planning-thread-v1` | COMPLETE | `DRAFT_READY_FOR_CURSOR_VALIDATION` | eligible |

## Artifacts

| Artifact | Path |
| --- | --- |
| Program manifest | `artifacts/agent-runs/harvest-empirical-samples-v1/empirical-sample-program-v1.json` |
| Rubric | `artifacts/agent-runs/harvest-empirical-samples-v1/empirical-review-rubric-v1.json` |
| Downstream handoff | `artifacts/agent-runs/harvest-empirical-samples-v1/empirical-downstream-handoff-v1.json` |
| Five-sample recurrence | `artifacts/agent-runs/harvest-empirical-samples-v1/empirical-five-sample-recurrence-v1.json` |
| Program defects log | `artifacts/agent-runs/harvest-empirical-samples-v1/empirical-program-defects-v1.json` |

## Planning sample #5

**Fixture:** empirical program closeout sequencing — reject premature downstream unblock; preserve HOLD (7 turns).  
**Live output:** `DRAFT_READY_FOR_CURSOR_VALIDATION`, T2 earned.  
**Rubric:** PASS (7/7); COR-001 rejects premature unblock; HP-001 planning boundary; ROI/seeds NONE_FOUND.  
**Graph:** `eligible` — one `sampleFinding` candidate (HP-001).

## Governance

- **Do not edit** `harvest/protocol/*` — five-sample recurrence found no protocol change warranted.
- Downstream wiring remains blocked until operator resolves `HOLD_REPO_AUTHORITY_RESOLUTION`.
- Data Extraction / CG Master Graph implementation **not started** per program scope.

## Next authorized actions (operator)

1. Resolve `HOLD_REPO_AUTHORITY_RESOLUTION` (Data Extraction + CG Master Graph repo IDs and contracts)  
2. Data Extraction empirical parser ingest (normalized projection only)  
3. CG Master Graph projection from validated records — never raw markdown  
4. Protocol edit only if future recurrence evidence meets full-program gate  
