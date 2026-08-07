# ChatGPT Thread Autopsy Findings

## 1. Final summary + verdict

**Harvest ID:** `harvest-2026-08-07-plan-set-processing-handoff-m4p-closeout-v1`  
**Mission:** `chat-thread-closeout-autopsy-harvest-chatgpt-v1`  
**Protocol:** v2  
**Lane:** `CHAT_CONTEXT_ONLY`  
**Mode:** `DRAFT_FILE`  
**Closeout target:** `CHATGPT_SOURCE_PUBLISHED`  
**Artifact:** `artifacts/agent-runs/harvest-2026-08-07-plan-set-processing-handoff-m4p-closeout-v1/chatgpt-findings-source.md`

This thread records the operator-provided M4P closeout for plan-set processing handoff. The source report states that immutable processing snapshots, downstream lane bindings, replay determinism, and the no-filesystem-rediscovery boundary are implemented and live-proven for Rosewood and Beacon Hill, with remaining warnings around fixture repair, stale-job recovery, partial-processing live simulation, and a then-local-only Documents repo commit.

**Important evidence boundary:** all M4P implementation and live-proof facts below are **thread-observed from the operator-provided closeout**. ChatGPT did not independently inspect `CapitalGlass-Documents`, Supabase, or the cited receipts in this harvest lane and therefore does not upgrade those claims beyond the source report.

**Draft verdict at file creation:** `DRAFT_READY`  
**Target after Git gate PASS:** `CHATGPT_SOURCE_PUBLISHED`  
**Canonical harvest completion:** Cursor-owned; ChatGPT does not claim `HARVEST_COMPLETE`.

## 2. Harvest tier rationale

**Target tier:** `T2`

Rationale: the thread contains a milestone closeout with architecture invariants, live proof identifiers, explicit warnings, deferred work, and a next-wave decision boundary. It is durable system knowledge worth preserving for future agents, but canonical repo/Supabase validation belongs to Cursor/operator lanes.

## 3. Retrieval preflight

ChatGPT lane truth:

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

Source-reported retrieval state (not independently executed by ChatGPT):

```text
Retrieval: INDEX_MISS
Cache: CACHE_MISS
Scout: M4P closeout from repo authority + live Supabase proofs; Intelligence Hub not consulted for implementation lane.
```

## 4. Thread event inventory

### EVT-001 — M4P closeout verdict reported

The source report declares:

`PLAN_SET_PROCESSING_HANDOFF_READY_WITH_WARN`

Meaning: M4P is described as implemented and ready at the orchestration boundary, with explicit non-blocking warnings and no claim that downstream Bluebeam/OCR/parser execution is fully completed.

### EVT-002 — Immutable processing snapshot architecture reported

The report states that M4P implements immutable processing snapshots through `PlanSetProcessingHandoffOrchestrator.createSnapshot()`, with a SHA-256 fingerprint over plan-set revision plus ordered sources/sheets and no timestamps in the fingerprint.

Reported state transition model:

`processing_snapshot_created` → `bluebeam_workspace_ready` + `processing_partial`

### EVT-003 — Downstream lane bindings reported

The source states that Bluebeam, OCR, and parser work is bound through `document_plan_set_processing_lane_bindings`, and that downstream consumers receive `processingSnapshotId` rather than rediscovering plan-set membership from the filesystem.

### EVT-004 — Rosewood live proof reported

Reported fixture:

- `planSetId`: `a2033260-0001-4000-8000-000000000001`
- sources: `1`
- sheets: `192`
- `processingSnapshotId`: `748545a7-5114-47dd-a979-3d72a0b3b8eb`
- replay: `REPLAY_NO_OP`

### EVT-005 — Beacon Hill live proof reported

Reported fixture:

- `planSetId`: `225b33e3-800f-42f9-8dc6-31040203c9f4`
- sources: `82`
- sheets: `82`
- `processingSnapshotId`: `ce0db433-2214-45b8-bf43-00077f179bf4`
- replay: `REPLAY_NO_OP`

The report further states Beacon Hill produced 1 Bluebeam + 82 OCR + 82 parser bindings, all on the same snapshot.

### EVT-006 — Boundary classification reported

Downstream execution class is explicitly reported as `BOUNDARY_PASS`: binding/enqueue contract proven, **not** full OCR/parser/Bluebeam session completion.

### EVT-007 — Hard no-rediscovery invariant reported

The report declares `NO_DOWNSTREAM_FILESYSTEM_REDISCOVERY_PASS`, with bindings carrying both `processingSnapshotId` and `noFilesystemRediscovery: true`.

### EVT-008 — Four warnings preserved

The closeout retains four warnings:

1. Rosewood fixture repair from legacy `readiness_status=assembled` to `plan_set_ready_for_processing` with `component_key=MONOLITH`.
2. `stale` lane-binding status exists, but full worker lease death/retry proof is deferred; `STALE_PROCESSING_JOB_RECOVERY_PASS = false`.
3. `processing_partial` is unit-tested, but a live 78/4 Beacon Hill partial-processing simulation was not run in this wave.
4. At the time of the source report, the `CapitalGlass-Documents` implementation was staged but not committed because local Git identity was not configured.

### EVT-009 — Evidence paths reported

The source points to:

- `artifacts/agent-runs/plan-set-processing-handoff-bluebeam-ocr-v1/closeout-receipt.json`
- `artifacts/agent-runs/plan-set-processing-handoff-bluebeam-ocr-v1/live-proof-receipt.json`

These paths are recorded for Cursor verification; ChatGPT did not open them in this lane.

### EVT-010 — Next-wave choice intentionally left open

The source explicitly says **do not auto-start M5**. Candidate next waves are:

- M5 `canonical-physical-rename-v1`
- downstream worker hardening
- Bluebeam launch proof

## 5. Harvest packets

### HP-001 — architecture-decision

**Title:** Freeze plan-set membership before downstream processing

**Finding:** M4P’s central architecture is an immutable `processingSnapshotId` that freezes the source/sheet graph before Bluebeam/OCR/parser handoff.

**Why durable:** It creates a stable orchestration boundary and prevents downstream components from deriving membership independently.

**Evidence refs:** `EVT-002`, `EVT-003`, `EVT-007`

**Status:** `CANDIDATE`

### HP-002 — determinism-pattern

**Title:** Replay identity should derive from ordered graph content, not wall-clock time

**Finding:** The reported fingerprint uses plan-set revision + ordered sources/sheets with no timestamps, and both Rosewood and Beacon Hill replay unchanged graphs as `REPLAY_NO_OP`.

**Evidence refs:** `EVT-002`, `EVT-004`, `EVT-005`

**Status:** `CANDIDATE`

### HP-003 — boundary-contract

**Title:** Bind downstream work to snapshot identity, never filesystem rediscovery

**Finding:** Bluebeam/OCR/parser bindings reportedly carry `processingSnapshotId` plus `noFilesystemRediscovery: true`.

**Evidence refs:** `EVT-003`, `EVT-007`

**Status:** `CANDIDATE`

### HP-004 — verification-discipline

**Title:** Distinguish orchestration boundary proof from worker/session completion

**Finding:** The source explicitly classifies M4P as `BOUNDARY_PASS` and does not conflate binding/enqueue success with completed Bluebeam/OCR/parser execution.

**Evidence refs:** `EVT-006`

**Status:** `CANDIDATE`

### HP-005 — known-gap

**Title:** Stale worker recovery is not yet live-proven

**Finding:** Schema/state support for `stale` exists, but lease death/retry recovery remains deferred and should not be implied by M4P readiness.

**Evidence refs:** `EVT-008`

**Status:** `CANDIDATE`

### HP-006 — known-gap

**Title:** Partial-processing state needs a live mixed-success proof

**Finding:** `processing_partial` is unit-tested but the proposed 78/4 Beacon Hill simulation was not performed in this wave.

**Evidence refs:** `EVT-008`

**Status:** `CANDIDATE`

### HP-007 — fixture-hygiene

**Title:** Legacy readiness fixtures can block new orchestration gates

**Finding:** Rosewood required a fixture-only readiness/component-key alignment before M4P could execute.

**Evidence refs:** `EVT-008`

**Status:** `CANDIDATE`

### HP-008 — sequencing-guard

**Title:** Do not auto-start physical rename after orchestration handoff

**Finding:** The source preserves an explicit decision gate between M4P and M5; worker hardening or Bluebeam launch proof may be higher-value next steps depending on evidence.

**Evidence refs:** `EVT-010`

**Status:** `CANDIDATE`

## 6. Execution deltas

### ED-001

Plan-set processing moved from a readiness concept to a reported immutable snapshot handoff model with explicit downstream binding records.

### ED-002

Single-source and multi-source plan sets are reported to normalize through the same snapshot model, reducing special-case orchestration.

### ED-003

Replay behavior is reported as deterministic (`REPLAY_NO_OP`) on unchanged graphs for both Rosewood and Beacon Hill.

### ED-004

The downstream contract is now framed around snapshot-bound payloads instead of filesystem membership discovery.

### ED-005

Milestone semantics are narrowed: M4P proves orchestration/binding readiness, while actual worker lifecycle resilience and application launch execution remain separate future proofs.

## 7. Waste ledger

### TW-001 — potential repeated filesystem discovery

**Waste avoided:** allowing each downstream lane to rediscover source/sheet membership independently would duplicate I/O, create race/drift risk, and weaken replay determinism.

**Reported mitigation:** snapshot-bound lane bindings with `noFilesystemRediscovery: true`.

### TW-002 — false completion from boundary proof

**Waste avoided:** treating enqueue/binding success as proof of completed Bluebeam/OCR/parser sessions could cause premature milestone closure and later rework.

**Reported mitigation:** explicit `BOUNDARY_PASS` classification.

### TW-003 — legacy fixture drift

**Waste observed:** stale Rosewood readiness semantics blocked the new M4P gate and required fixture-only repair.

**Improvement candidate:** fixture freshness/compatibility checks before live orchestration proofs.

## 8. Duplication detector

### DUP-001

The thread does not show duplicate implementation waves inside M4P itself, but future agents must avoid reopening the already-settled architectural question of whether downstream lanes should scan the filesystem for membership.

**Disposition:** `NEEDS_REGISTRY_LOOKUP_FIRST` before proposing any filesystem-based downstream discovery.

## 9. Operator friction

### OF-001 — Git identity blocked closeout commit

The source reports that implementation was staged but not committed because local Git identity was not configured.

**Impact:** implementation proof and Git authority temporarily diverged.

**Candidate improvement:** preflight Git identity before implementation waves that are expected to end in a commit.

### OF-002 — fixture state repair during live proof

Rosewood required readiness/component-key repair before M4P could run.

**Impact:** live proof was delayed by non-feature fixture drift.

**Candidate improvement:** fixture compatibility gate before expensive/live proof steps.

## 10. ROI backlog (ranked)

1. **Downstream worker hardening** — make OCR/parser workers consume `lane_bindings` directly and prove stale lease death/retry behavior.
2. **Bluebeam launch proof** — prove the bounded machine handoff against the production Revu boundary without weakening snapshot identity.
3. **Live partial-processing proof** — run a controlled mixed-success Beacon Hill scenario (for example the source-proposed 78/4 shape) and prove state transitions/replay semantics.
4. **Git identity preflight** — fail fast before implementation if author identity is absent.
5. **Fixture compatibility preflight** — detect legacy readiness/component-key drift before live orchestration.
6. **M5 canonical physical rename** — proceed only when rename authority is explicitly selected; do not assume M4P completion implies M5 should start.

## 11. Do-not-advance guards

- Do **not** reinterpret `BOUNDARY_PASS` as completed OCR/parser/Bluebeam execution.
- Do **not** claim stale worker recovery is proven; the source explicitly says it is deferred.
- Do **not** claim live partial-processing proof; only unit-test coverage is reported.
- Do **not** reintroduce filesystem membership discovery into downstream lanes without an explicit architecture reversal.
- Do **not** auto-start M5 from this harvest.
- Do **not** treat the source-reported Git state in `CapitalGlass-Documents` as current without Cursor verifying the repo now.
- Do **not** claim the cited receipts or Supabase rows were independently inspected by ChatGPT.

## 12. Seed packet candidates

```json
{
  "seedId": "IH-THREAD-M4P-SNAPSHOT-BOUNDARY-V1",
  "kind": "lesson",
  "title": "Freeze plan-set membership into processingSnapshotId before downstream work",
  "retrievalQuestions": [
    "How should Bluebeam OCR and parser jobs discover plan-set membership?",
    "What identity should downstream plan-set processing bind to?"
  ],
  "evidenceRefs": ["EVT-002", "EVT-003", "EVT-007"],
  "futureAgentInstructions": "Prefer immutable processingSnapshotId-bound payloads. Do not add downstream filesystem rediscovery unless authority explicitly reverses the M4P invariant.",
  "status": "CANDIDATE"
}
```

```json
{
  "seedId": "IH-THREAD-M4P-BOUNDARY-PASS-NOT-WORKER-COMPLETE-V1",
  "kind": "failure-pattern",
  "title": "Do not confuse orchestration binding proof with downstream execution completion",
  "retrievalQuestions": [
    "Does M4P prove OCR parser and Bluebeam execution completed?",
    "What does BOUNDARY_PASS mean for plan-set processing handoff?"
  ],
  "evidenceRefs": ["EVT-006", "EVT-008"],
  "futureAgentInstructions": "Preserve the boundary: M4P can close on binding/enqueue proof while worker lease recovery, partial live execution, and Revu launch proof remain separate milestones.",
  "status": "CANDIDATE"
}
```

```json
{
  "seedId": "IH-THREAD-M4P-DETERMINISTIC-REPLAY-V1",
  "kind": "lesson",
  "title": "Fingerprint plan-set processing from ordered graph content without timestamps",
  "retrievalQuestions": [
    "How is M4P replay determinism achieved?",
    "What should a plan-set processing fingerprint include?"
  ],
  "evidenceRefs": ["EVT-002", "EVT-004", "EVT-005"],
  "futureAgentInstructions": "Keep replay identity content-derived and deterministic. Treat unchanged graph replay as a no-op rather than creating a new snapshot solely because time advanced.",
  "status": "CANDIDATE"
}
```

```json
{
  "seedId": "IH-THREAD-M4P-STALE-RECOVERY-GAP-V1",
  "kind": "failure-pattern",
  "title": "Stale lane-binding status is not equivalent to proven lease recovery",
  "retrievalQuestions": [
    "Is stale processing job recovery proven for M4P?",
    "What M4P worker lifecycle proof remains open?"
  ],
  "evidenceRefs": ["EVT-008"],
  "futureAgentInstructions": "Require a live lease death/retry proof before marking stale worker recovery PASS. Schema/state support alone is insufficient.",
  "status": "CANDIDATE"
}
```

## 13. Future-agent instructions

1. Start from the immutable snapshot boundary rather than rediscovering source membership.
2. Verify current `CapitalGlass-Documents` Git authority before relying on the source report’s staged/uncommitted warning; that state may have changed after this thread.
3. Read the cited closeout/live-proof receipts before converting thread-observed claims into canonical implementation facts.
4. Treat Rosewood and Beacon Hill as complementary proof shapes: one single-source/many-sheet and one many-source/equal-sheet graph.
5. Preserve `REPLAY_NO_OP` semantics for unchanged graphs.
6. Keep worker hardening, partial-processing live proof, and Bluebeam launch proof as distinct downstream validation work.
7. Do not start M5 automatically; require an explicit next-wave choice.

## 14. Publication truth table

| Layer | State (ChatGPT closeout) |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | `pending-git-gate-at-file-creation` |
| `CHATGPT_HARVEST_GIT_GATE` | `pending-git-gate-at-file-creation` |
| L: draft staging (Action move) | `not-run-by-chatgpt` |
| Cursor ingest | `not-run` |
| `harvest:validate` | `not-run` |
| `test:harvest` | `not-run` |
| L: Hub catalog (operator publish) | `not-run` |
| Z: AI cache | `not-run` |
| Supabase projection | `not-run-by-chatgpt` |
| Lane C export / Data-Extraction | `not-run` |
| Freshness gate | `not-run` |
| Automatic protocol mutation | `false` |

```text
Publication: NOT_RUN_BY_CURSOR
projection.hubPublishStatus: not-run
```

## 15. gitPublicationReceipt

Emitted in chat after remote verification. The source artifact intentionally does not self-claim a commit SHA before the Git gate completes.

## 16. Cursor handoff command

After `CHATGPT_HARVEST_GIT_GATE` PASS:

```bash
git fetch origin chat-gpt-harvest
git checkout chat-gpt-harvest
git pull --ff-only origin chat-gpt-harvest

npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-07-plan-set-processing-handoff-m4p-closeout-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-07-plan-set-processing-handoff-m4p-closeout-v1

npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-07-plan-set-processing-handoff-m4p-closeout-v1
npm run harvest:sync-derived -- harvest-2026-08-07-plan-set-processing-handoff-m4p-closeout-v1
npm run harvest:validate -- harvest-2026-08-07-plan-set-processing-handoff-m4p-closeout-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-07-plan-set-processing-handoff-m4p-closeout-v1
npm run test:harvest
```

Cursor/operator should verify the downstream GitHub Action → L: staging result separately before declaring the restoration live pilot `CLOSED_GO`.
