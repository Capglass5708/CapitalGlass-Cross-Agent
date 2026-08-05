# harvest-empirical-samples-v1

**Status:** IN_PROGRESS (thin + medium + architectural + debugging COMPLETE; planning PENDING; downstream HOLD)  
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

## Protocol-freeze decision rules (graph-level)

| Signal | Graph action |
| --- | --- |
| One weak sample | Observation only |
| Same weakness across multiple sample classes | `recurringWeakness` candidate |
| Recurring pattern across full program | `protocolChangeCandidate` |
| Operator-approved edit | `approvedProtocolChange` |

Node kinds must remain distinct: `sampleFinding`, `recurringWeakness`, `protocolChangeCandidate`, `approvedProtocolChange`.

## Sample queue

| # | Class | Sample id | Status | Harvest verdict | Graph eligibility |
| --- | --- | --- | --- | --- | --- |
| 1 | thin | `thin-thread-v1` | COMPLETE | `NO_HARVEST_NEEDED` | hold |
| 2 | medium | `medium-thread-v1` | COMPLETE | `DRAFT_READY_FOR_CURSOR_VALIDATION` | eligible |
| 3 | architectural | `architectural-thread-v1` | COMPLETE | `DRAFT_READY_FOR_CURSOR_VALIDATION` | eligible |
| 4 | debugging | `debugging-thread-v1` | COMPLETE | `DRAFT_READY_FOR_CURSOR_VALIDATION` | eligible |
| 5 | planning | `planning-thread-v1` | PENDING | — | — |

## Artifacts

| Artifact | Path |
| --- | --- |
| Program manifest | `artifacts/agent-runs/harvest-empirical-samples-v1/empirical-sample-program-v1.json` |
| Rubric | `artifacts/agent-runs/harvest-empirical-samples-v1/empirical-review-rubric-v1.json` |
| Downstream handoff | `artifacts/agent-runs/harvest-empirical-samples-v1/empirical-downstream-handoff-v1.json` |
| Program defects log | `artifacts/agent-runs/harvest-empirical-samples-v1/empirical-program-defects-v1.json` |
| Thin routing metadata | `artifacts/agent-runs/harvest-empirical-samples-v1/samples/thin-thread-v1/sample-routing-metadata-v1.json` |
| Medium routing metadata | `artifacts/agent-runs/harvest-empirical-samples-v1/samples/medium-thread-v1/sample-routing-metadata-v1.json` |
| Architectural routing metadata | `artifacts/agent-runs/harvest-empirical-samples-v1/samples/architectural-thread-v1/sample-routing-metadata-v1.json` |
| Debugging routing metadata | `artifacts/agent-runs/harvest-empirical-samples-v1/samples/debugging-thread-v1/sample-routing-metadata-v1.json` |

## Thin sample #1

**Fixture:** branch-name factual Q&A (3 turns).  
**Golden reference:** `NO_HARVEST_NEEDED`, expected tier T0; observed T0 earned at live run.  
**Live output:** `chatgpt-live-output.md` (unchanged; cursor protocol execution; ChatGPT UI replacement optional).  
**Rubric:** PASS on all 7 criteria.  
**Graph:** `hold` — no `sampleFinding` nodes; only Sample / ProtocolVersion / ReviewScore candidates.

## Empirical flow (ordered)

1. Freeze sample source and golden reference  
2. Run ChatGPT without protocol changes  
3. Preserve raw output  
4. Score with empirical rubric  
5. Commit sample evidence  
6. Send package to Data Extraction (when authority resolved)  
7. Normalize and validate extracted objects  
8. Project eligible objects to CG Master Graph  
9. Compare weakness patterns across all five samples  
10. Author protocol changes only from recurring graph evidence  

## Governance

- Do not edit `harvest/protocol/*` until all five samples reviewed and graph documents recurring weakness.
- Supabase 401 remains separate work package.
- August 3 harvest drift remains out of scope.
- Debugging sample complete; planning fixture authorized.

## Debugging sample #4

**Fixture:** localized `harvest:validate` EVT classification failure — reject terminal log-dump as harvest; extract one debugging heuristic (7 turns).  
**Live output:** `chatgpt-live-output.md` — `DRAFT_READY_FOR_CURSOR_VALIDATION`, T2 earned.  
**Rubric:** PASS (7/7); COR-001 rejects log-dump; HP-001 debugging heuristic; ROI/seeds NONE_FOUND.  
**Graph:** `eligible` — one `sampleFinding` candidate (HP-001).

## Planning sample #5 (fixture only)

_Authorized next — fixture scaffold pending._

## Architectural sample #3 (fixture only)

**Fixture:** cross-repo ownership boundary — reject direct raw-markdown `graph:collect`; affirm Cross-Agent → Data Extraction → Master Graph handoff; forbid parallel envelope scaffold (7 turns).  
**Golden reference:** bounds-based `golden-findings-DRAFT_READY.md`.  
**Live output:** `chatgpt-live-output.md` — observed T2, COR-001 rejects direct ingestion, HP-001..003 three-layer + no-parallel-envelope boundaries.  
**Rubric:** PASS on all 7 criteria; protocol change not indicated.  
**Graph:** `eligible` — two `sampleFinding` candidates (three-layer handoff, no parallel envelope); downstream ingest still HOLD.

## Medium sample #2

**Fixture:** mild correction arc — over-broad draft-vs-no-harvest rule narrowed to T0 factual closure boundary (5 turns).  
**Golden reference:** bounds-based `golden-findings-DRAFT_READY.md`.  
**Live output:** `chatgpt-live-output.md` — observed T2, `DRAFT_READY_FOR_CURSOR_VALIDATION`, COR-001 boundary.  
**Rubric:** PASS on all 7 criteria; protocol change not indicated.  
**Graph:** `eligible` — one `sampleFinding` candidate (COR-001 boundary); downstream ingest still HOLD.
