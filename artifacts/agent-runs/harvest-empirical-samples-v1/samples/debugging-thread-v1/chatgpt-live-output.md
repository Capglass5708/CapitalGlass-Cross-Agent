---
liveRunProvenance:
  requestedActor: chatgpt-web-ui
  actualActor: cursor-agent-frozen-protocol-execution
  reason: ChatGPT not invocable from Cursor agent session; output produced by executing frozen CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1 REVIEW_ONLY rules against fixture only (golden reference not read during generation)
  mode: REVIEW_ONLY
  executedAt: "2026-08-05T22:30:00.000Z"
  protocolAuthorityCommit: 1e87d6ab96ed35d3d117def99e1e0d670c028575
  fixturePath: samples/debugging-thread-v1/sample-thread-source.md
---

REVIEW_ONLY — chat-thread-closeout-autopsy-harvest-chatgpt-v1

Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1  
Lane: CHAT_CONTEXT_ONLY  
Start verdict: UNHARVESTED_THREAD  
Target tier: T2  
Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION

## Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

## Final summary

| Field | Value |
| --- | --- |
| Harvest id | harvest-2026-08-05-empirical-sample-debugging-v1 |
| Verdict | DRAFT_READY_FOR_CURSOR_VALIDATION |
| Tier | T2 |
| Debugging heuristics | 1 |
| Corrections | 1 |
| ROI ranks | 0 |
| Seeds | 0 |

**Rationale (3 lines):** User reported `harvest:validate` failure on EVT-004 missing evidence classification amid noisy terminal scrollback. Assistant first proposed harvesting the full log (rejected). User restricted to the localized EVT defect; assistant delivered one reusable debugging heuristic: inspect EVT inventory for missing evidence class before promoting execution noise. No architecture, planning, or downstream wiring claims.

## Scope ledger

| Item | Value |
| --- | --- |
| Topic | Localized empirical live-output validation failure (`harvest:validate` classification gate) |
| Evaluated system | EVT inventory in draft `chatgpt-live-output.md` |
| Closed lane | Terminal scrollback / install noise as OBSERVED intelligence |
| Error line (minimal quote) | `EVT-004 missing evidence classification (required: CHAT_DIRECT \| ATTACHMENT_SOURCE \| ...)` |
| Attachments | None |
| Closure | User confirmed debugging lesson for sample class |

## Correction ledger

| ID | priorAssumption | correction | correctedModel | affectedFindings | evidence class |
| --- | --- | --- | --- | --- | --- |
| COR-001 | Harvest full terminal scrollback; add HP per stderr line; rank validation failure as ROI-001 | User rejected; scrollback is noise; only durable fact is EVT-004 row lacks evidence class | Fix EVT classification locally; do not promote execution logs as harvest packets | EVT-002, EVT-003, EVT-004, HP-001 | CHAT_DIRECT |

## Thread event inventory

| EVT | Phase | Summary | Evidence class |
| --- | --- | --- | --- |
| EVT-001 | question | User reported validate failure on EVT-004 classification; asked what to keep amid scrollback noise | CHAT_DIRECT |
| EVT-002 | overreach | Assistant proposed harvesting entire terminal output and HP per stderr line | CHAT_DIRECT |
| EVT-003 | correction | User rejected log-dump; only EVT-004 missing evidence class is durable | CHAT_DIRECT |
| EVT-004 | diagnosis | Assistant identified EVT-004 row incomplete — blank evidence class blocks validate gate | CHAT_DIRECT |
| EVT-005 | question | User asked reusable debugging lesson — not architecture or ingest pipeline | CHAT_DIRECT |
| EVT-006 | boundary | Assistant stated debugging heuristic: inspect EVT inventory first; logs are context not OBSERVED intelligence | CHAT_DIRECT |
| EVT-007 | close | User confirmed lesson for debugging sample class | CHAT_DIRECT |

## Harvest packets (HP-###)

HP-001 | kind: debugging_heuristic | summary: On `harvest:validate` classification failure, inspect EVT inventory for missing `CHAT_DIRECT` / `ATTACHMENT_SOURCE` before re-running validate or harvesting terminal scrollback; noisy logs are execution context, not OBSERVED intelligence | evidence: EVT-003, EVT-004, EVT-006 | class: CHAT_DIRECT

## Execution deltas (ED-###)

ED-001 | actual: promote full terminal scrollback as harvest evidence | optimal: fix single EVT classification gap; quote error line only if needed | evidence: EVT-002 vs EVT-006 | class: CHAT_DIRECT

## Waste ledger (TW-###)

TW-001 | type: log-dump harvesting | summary: Turn 2 would paste install noise, path warnings, and passing gate lines into findings as HP rows | corrected: yes (COR-001) | evidence: EVT-002, EVT-003 | class: CHAT_DIRECT

## Duplication detector (DUP-###)

NONE_FOUND — debugging heuristic is localized validation practice, not restatement of architectural three-layer handoff or medium verdict-boundary rule.

## Operator friction (OF-###)

NONE_FOUND — thread resolved with one-field EVT fix and explicit signal-vs-noise boundary.

## ROI backlog

NONE_FOUND — single-field classification defect corrected in thread; no repeat friction or multi-step waste demonstrated beyond COR-001 correction context.

## Do-not-advance guards

| Award | Status | Do not claim until |
| --- | --- | --- |
| HARVEST_COMPLETE | BLOCKED | harvest:validate PASS |
| PUBLISHED_TO_HUB | BLOCKED | operator publish |
| OPERATIONAL | BLOCKED | harvest:publish-intelligence-full |
| DOWNSTREAM_IMPLEMENTED | BLOCKED | operator resolves repo authority |

## Seed packet candidates

NONE_FOUND — HP-001 captures the reusable debugging heuristic; distinct seed not warranted beyond correction context.

## Future-agent instructions

When empirical live output fails `harvest:validate` on evidence classification: inspect EVT rows first for blank `CHAT_DIRECT` / `ATTACHMENT_SOURCE` labels. Do not harvest terminal scrollback, install warnings, or unrelated green checks. Do not inflate a localized validation defect into architecture, planning, or downstream wiring findings.

## Publication truth table

| Layer | Status |
| --- | --- |
| Git push | NOT_REQUIRED (REVIEW_ONLY empirical lane) |
| L: move | NOT_RUN_BY_CHATGPT |
| Cursor ingest | NOT_RUN |
| Data Extraction ingest | NOT_RUN (implementation on HOLD) |
| harvest:validate | NOT_RUN |
| Hub publication | NOT_RUN |

## Acceptance checklist

- [x] Verdict: DRAFT_READY_FOR_CURSOR_VALIDATION
- [x] Tier T2 earned (correction arc + one debugging heuristic, compressed)
- [x] COR-001 rejects log-dump-as-harvest proposal
- [x] HP-001 separates reusable debugging intelligence from execution noise
- [x] Minimal terminal quotation (error line only in scope ledger)
- [x] No architecture, planning, or protocol-change claim
- [x] No HARVEST_COMPLETE / OPERATIONAL claims
- [x] ROI and seeds honestly NONE_FOUND

## Next operator action

Score against golden bounds and shared rubric. Commit routing metadata separately. Do not edit frozen protocol from this single debugging sample.
