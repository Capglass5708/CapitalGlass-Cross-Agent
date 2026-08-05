# harvest-empirical-samples-v1

**Status:** IN_PROGRESS  
**Owner repo:** CapitalGlass-Cross-Agent  
**Protocol state:** FROZEN at `b8ceb83` (no protocol edits until sample set complete)

## Purpose

Empirically test the frozen ChatGPT OBSERVED harvest protocol across five thread classes before any protocol expansion. Each sample uses the same review criteria; protocol changes require repeated weaknesses across samples.

## Review criteria (every sample)

1. Durable intelligence only  
2. No template padding  
3. Traceable evidence  
4. Earned ROI  
5. Justified futureSavings  
6. High signal density  
7. Minimal human edit burden  

## Sample queue

| # | Class | Sample id | Status | Expected verdict |
| --- | --- | --- | --- | --- |
| 1 | thin | `thin-thread-v1` | IN_REVIEW | `NO_HARVEST_NEEDED` or very small file |
| 2 | medium | `medium-thread-v1` | PENDING | `DRAFT_READY_FOR_CURSOR_VALIDATION` |
| 3 | architectural | `architectural-thread-v1` | PENDING | `DRAFT_READY_FOR_CURSOR_VALIDATION` |
| 4 | debugging | `debugging-thread-v1` | PENDING | `DRAFT_READY_FOR_CURSOR_VALIDATION` |
| 5 | planning | `planning-thread-v1` | PENDING | `DRAFT_READY_FOR_CURSOR_VALIDATION` |

## Artifacts

- Program manifest: `artifacts/agent-runs/harvest-empirical-samples-v1/empirical-sample-program-v1.json`
- Rubric: `artifacts/agent-runs/harvest-empirical-samples-v1/empirical-review-rubric-v1.json`
- Thin fixture: `artifacts/agent-runs/harvest-empirical-samples-v1/samples/thin-thread-v1/`

## Thin sample #1 — current

**Fixture:** branch-name factual Q&A (3 turns).  
**Golden reference:** `NO_HARVEST_NEEDED`, tier T0, no ingest pipeline.  
**Cursor rubric score:** PASS (golden reference only).  
**Pending:** ChatGPT live run against fixture to confirm protocol behavior matches golden reference.

## Governance

- Do not edit `harvest/protocol/*` until all five samples reviewed and weaknesses documented.
- Supabase 401 remains separate work package.
- August 3 harvest drift remains out of scope.
