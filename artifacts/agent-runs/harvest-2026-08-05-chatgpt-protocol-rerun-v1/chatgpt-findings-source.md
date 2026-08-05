# ChatGPT Thread Autopsy Findings — Protocol Rerun Delta

## Final summary

```text
Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Start verdict: UNHARVESTED_THREAD
Target tier: T2
Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION
```

A prior full findings harvest for this thread already exists at `artifacts/agent-runs/harvest-2026-08-05-chatgpt-deterministic-l-move-v1/chatgpt-findings-source.md`. This bounded rerun records only the new failure: the attached protocol was initially acknowledged instead of executed, forcing the operator to repeat `RUN THIS FILE`.

## Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

## Scope ledger

- **Primary mission:** execute the attached OBSERVED protocol and push findings to `chat-gpt-harvest`.
- **Closed:** prior same-thread full autopsy pushed.
- **Open:** Cursor duplication preflight and validation.
- **Unrelated:** WESLEYDESK repair gates and RYZEN9DESK fanout.
- **Deferred:** T2 batch assessment and publication.
- **Boundary:** this rerun is a delta, not a second independent full harvest.

## Correction ledger

### COR-001
- **priorAssumption:** acknowledging the uploaded protocol was sufficient.
- **correction:** operator explicitly requested execution.
- **correctedModel:** declare `DRAFT_FILE`, write findings, push, report SHA.
- **affectedFindings:** EVT-002, HP-001, ED-001, ROI-001.

### COR-002
- **priorAssumption:** rerun could create another full autopsy without checking prior work.
- **correction:** a same-thread harvest already exists.
- **correctedModel:** write a delta and mark `POSSIBLE_EXISTING_HARVEST`.
- **affectedFindings:** EVT-004, DUP-001, ROI-002.

## Thread event inventory

### EVT-001
- **evidenceClass:** `ATTACHMENT_SOURCE`
- Protocol requires OBSERVED findings and push to `chat-gpt-harvest` in `DRAFT_FILE` mode.

### EVT-002
- **evidenceClass:** `CHAT_DIRECT`
- Assistant acknowledged the updated protocol but did not execute it.

### EVT-003
- **evidenceClass:** `CHAT_DIRECT`
- Operator repeated `RUN THIS FILE`.

### EVT-004
- **evidenceClass:** `CROSS_CHECK_CANDIDATE`
- Existing same-thread findings file was confirmed on `chat-gpt-harvest`.

## Harvest packets

### HP-001 — Acknowledge instead of execute
- **kind:** failure-pattern
- **evidenceClass:** `CHAT_DIRECT`
- Explicit execution instructions were treated as review-only context.

### HP-002 — Existing-harvest preflight
- **kind:** protocol-upgrade
- **evidenceClass:** `CROSS_CHECK_CANDIDATE`
- Check the target branch before rerunning a same-thread harvest.

### HP-003 — Operator intent precedence
- **kind:** lesson
- **evidenceClass:** `CHAT_DIRECT`
- The newest imperative instruction controls unless STOP or concept-only guards apply.

### HP-004 — Bounded rerun
- **kind:** architecture-pattern
- **evidenceClass:** `CHAT_DIRECT`
- Preserve the predecessor and write only new events, corrections, and seeds.

### HP-005 — Authority boundary
- **kind:** governance
- **evidenceClass:** `ATTACHMENT_SOURCE`
- ChatGPT drafts and pushes; Cursor validates; operator publishes.

### HP-006 — Low-token execution
- **kind:** efficiency-pattern
- **evidenceClass:** `CHAT_DIRECT`
- Once mode is clear, execute without an extra acknowledgment turn.

### HP-007 — Branch isolation
- **kind:** operational-guard
- **evidenceClass:** `ATTACHMENT_SOURCE`
- Push only to `chat-gpt-harvest`, never `main`.

### HP-008 — Rerun traceability
- **kind:** reliability-pattern
- **evidenceClass:** `CROSS_CHECK_CANDIDATE`
- Name the predecessor artifact so Cursor can consolidate deterministically.

## Execution deltas

### ED-001
- **actual:** protocol acknowledged but not run.
- **optimal:** execute and push immediately.
- **evidenceClass:** `CHAT_DIRECT`

### ED-002
- **actual:** operator repeated the command.
- **optimal:** infer execution from the first imperative request.
- **evidenceClass:** `CHAT_DIRECT`

## Waste ledger

### TW-001
One unnecessary turn was consumed before execution.

### TW-002
A full rerun would duplicate the prior harvest.

## Duplication detector

### DUP-001
- **classification:** `POSSIBLE_EXISTING_HARVEST`
- Predecessor: `harvest-2026-08-05-chatgpt-deterministic-l-move-v1`.

### DUP-002
- **classification:** `REPEATED_DISCUSSION`
- The protocol execution requirement had to be repeated.

## Operator friction

### OF-001
The operator had to use an all-caps command to obtain execution.

### OF-002
The attached protocol was treated as informational rather than executable.

## ROI backlog

1. **ROI-001:** route imperative attachment requests directly into the file’s declared execution mode.
2. **ROI-002:** check for an existing same-thread harvest before writing another full artifact.
3. **ROI-003:** standardize a compact rerun-delta format with predecessor traceability.

## Do-not-advance guards

- Do not treat this as new independent operational intelligence.
- Do not duplicate predecessor seeds during ingest.
- Do not claim validation, publication, L: movement, or operational status.
- Do not push to `main`.

## Seed packet candidates

```json
{
  "seedId": "IH-THREAD-IMPERATIVE-ATTACHMENT-EXECUTION",
  "kind": "failure-pattern",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How should an agent distinguish run-this-file from summarize-this-file?",
    "What should happen when an attached protocol defines its own closeout?"
  ],
  "evidenceRefs": [
    {"ref": "EVT-001", "classification": "ATTACHMENT_SOURCE"},
    {"ref": "EVT-003", "classification": "CHAT_DIRECT"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "User gives an imperative instruction to run an attached protocol",
    "startAt": "Read its execution mode and required outputs",
    "runPreflight": "Check STOP and concept-only guards",
    "doNot": "Reply with acknowledgment only",
    "proveBeforeClaiming": "Complete the required write and push"
  }
}
```

```json
{
  "seedId": "IH-THREAD-EXISTING-HARVEST-RERUN-PREFLIGHT",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How should a rerun detect an existing same-thread harvest?",
    "When should it emit a delta instead of a full duplicate?"
  ],
  "evidenceRefs": [
    {"ref": "EVT-004", "classification": "CROSS_CHECK_CANDIDATE"},
    {"ref": "DUP-001", "classification": "CROSS_CHECK_CANDIDATE"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A closeout protocol is rerun in the same conversation",
    "startAt": "Inspect the target branch for existing findings",
    "runPreflight": "Compare mission and thread scope",
    "doNot": "Generate duplicate packets as new intelligence",
    "proveBeforeClaiming": "Name the predecessor artifact"
  }
}
```

```json
{
  "seedId": "IH-THREAD-BOUNDED-RERUN-DELTA",
  "kind": "lesson",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "What minimum content belongs in a rerun delta?",
    "How should Cursor consolidate it while preserving traceability?"
  ],
  "evidenceRefs": [
    {"ref": "HP-004", "classification": "CHAT_DIRECT"},
    {"ref": "DUP-001", "classification": "CROSS_CHECK_CANDIDATE"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "New events occur after an already-pushed harvest",
    "startAt": "Record only new corrections and evidence",
    "runPreflight": "Link the predecessor",
    "doNot": "Overwrite prior evidence",
    "proveBeforeClaiming": "Run duplication preflight before validation"
  }
}
```

## Future-agent instructions

1. Treat `RUN THIS FILE` as execution.
2. Follow the attached protocol as source authority.
3. Check for an existing same-thread harvest.
4. Emit a delta when only post-harvest events are new.
5. Leave validation and publication to Cursor/operator.

## Publication truth table

| Layer | State |
| --- | --- |
| Git authority | `not-run` |
| L: Hub catalog | `not-run` |
| Z: AI cache | `not-run` |
| Supabase projection | `not-run` |
| Freshness gate | `not-run` |

```text
Publication: NOT_RUN_BY_CURSOR
projection.hubPublishStatus: not-run
```

## Acceptance checklist

- [x] `DRAFT_FILE` / OBSERVED lane
- [x] retrieval block compliant
- [x] scope and correction ledgers
- [x] evidence classifications
- [x] eight packet categories
- [x] deltas, waste, duplication, friction
- [x] ROI top three with candidate seeds
- [x] publication states all `not-run`

## Next operator action

Default batch path: stop after push. Cursor should run duplication preflight before ingesting or consolidating this delta.
