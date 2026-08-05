# ChatGPT Thread Autopsy Findings — ASG Hardening and Three-Lane Closeout

**Mode:** `DRAFT_FILE`  
**Mission:** `chat-thread-closeout-autopsy-harvest-chatgpt-v1`  
**Lane:** `CHAT_CONTEXT_ONLY`  
**Intelligence kind:** `OBSERVED`  
**Harvest ID:** `harvest-2026-08-05-asg-go-hardening-three-lane-closeout-v1`  
**Start verdict:** `UNHARVESTED_THREAD`  
**Target tier:** `T2`  
**Output verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

## 1. Final summary

This thread documented All Systems Go moving from WARN to formal live GO, then hardening the runner, publishing a canonical ASG operational authority package, repairing governance preflight linkage, restoring the North Star observer CLI, and harvesting the three closed lanes. Durable lessons: newest receipt authority overrides stale summaries; shared-database drift is classified before snapshot refresh; persistent workers do not belong in bounded closeout commands; mission closure stays separate from out-of-scope governance linkage; and Phase C remains explicitly operator-gated. Operational claims are user-reported and require Cursor verification.

## 2. Harvest verdict and tier rationale

**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`  
**Tier:** `T2`

The thread contains corrections, multiple owner-repo lanes, publication phases, immutable boundaries, and reusable failure-prevention patterns. This is OBSERVED intelligence only; no advancement synthesis is included.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

## 4. Scope ledger

### Primary and closed lanes

- `ultimate-sdlc-runner-dark-package-v1`
- `ultimate-sdlc-runner-hardening-and-ai-cache-v1`
- `governance-material-preflight-linkage-v1`
- `north-star-observe-cli-repair-v1`
- Related harvest: `harvest-2026-08-04-three-lane-suite-closeout-v1`

### Deferred work

- Phase C pointer materialization, requiring `phase-b-v2` and `PHASE_C_POINTER_APPROVED=1`
- Optional ledger and Supabase thread-autopsy projection repair for the three-lane harvest

### Do-not-merge boundaries

- Do not reopen ASG hardening for governance linkage repair.
- Do not label `HARVEST_POINTER_PENDING` degraded when L/Z/Supabase are current.
- Do not merge North Star CLI repair into governance linkage.
- Optional derived gaps do not invalidate an OPERATIONAL publication receipt.

## 5. Correction ledger

### COR-001 — Git was not the final blocker

- **Prior assumption:** pushing local commits would produce GO.
- **Correction:** the fresh post-push receipt showed `shared-db-impact: WARN`.
- **Corrected model:** newest complete receipt determines the blocker.
- **Evidence:** `CHAT_DIRECT`, `USER_REPORTED_OPERATIONAL`.

### COR-002 — Pointer pending was not degradation

- **Prior assumption:** missing Phase C implied degraded derived layers.
- **Correction:** L, Z, and Supabase were healthy; only the intentionally gated pointer was missing.
- **Corrected model:** `HARVEST_POINTER_PENDING` is healthy pre–Phase C state.
- **Evidence:** `USER_REPORTED_OPERATIONAL`.

### COR-003 — Governance linkage did not reopen ASG

- **Prior assumption:** Auto v3.2 linkage failure could affect closed ASG.
- **Correction:** closure artifacts excluded linkage from ASG scope.
- **Corrected model:** linkage belongs to `governance-material-preflight-linkage-v1`.
- **Evidence:** `USER_REPORTED_OPERATIONAL`.

## 6. Thread event inventory

### EVT-001 — Original ASG mission reached formal GO

- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- Six lanes PASS, live-capable run, `zeroWritesProven: true`.
- **Future efficiency impact:** future agents start from the final receipt instead of replaying WARN history.

### EVT-002 — Shared-db reconciliation corrected stale blocker assumptions

- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- Git parity became PASS while shared-db remained WARN; duplicate migration versions were classified and resolved without hiding expected pending migrations.
- **Future efficiency impact:** prevents unsafe baselining and false GO claims.

### EVT-003 — Batched Supabase projection removed CLI hangs

- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- One transaction and one async CLI process replaced one process per SQL statement; reported duration fell to about five seconds per harvest.
- **Future efficiency impact:** avoids partial retries and long stalls.

### EVT-004 — ASG hardening and AI-cache authority completed

- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- Receipt authority, lineage, migration collision preflight, bounded-command policy, phase semantics, cache freshness, Z publication, L mirror, Supabase pointer, and seeds 005–009 were reported.
- **Future efficiency impact:** agents retrieve a compact operating contract instead of reconstructing the thread.

### EVT-005 — ASG hardening closed with deferred Phase C

- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- Closure class reported as `CLOSED_WITH_DEFERRED_PHASE_C`.
- **Future efficiency impact:** completed implementation does not remain artificially open.

### EVT-006 — Governance preflight linkage repaired separately

- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- Missing linkage was seeded automatically and owner prefixes were aligned in both ownership and preflight libraries.
- **Future efficiency impact:** avoids repeated `PREFLIGHT_LINKAGE_MISSING` closeout failures.

### EVT-007 — North Star observer CLI restored

- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- Missing AppBuilder CLI was restored as a thin delegate with JSON, exit-code, and read-only smoke tests.
- **Future efficiency impact:** agents use the supported npm command rather than internal library paths.

### EVT-008 — Three-lane harvest reached Phase B OPERATIONAL

- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- Phase A validation/staging passed, Phase B produced an OPERATIONAL receipt, and Phase C stayed deferred.
- **Future efficiency impact:** compresses three closed lanes into reusable retrieval intelligence.

## 7. Harvest packets

### HP-001 — Newest receipt authority
- **Kind:** `protocol-upgrade`
- **Evidence class:** `CHAT_DIRECT`
- Closeout narration derives from the newest machine-readable receipt.

### HP-002 — Persistent worker in closeout
- **Kind:** `failure-pattern`
- **Evidence class:** `CHAT_DIRECT`
- `token-refresh-worker.mjs` slept for days and was unsuitable for bounded closeout work.

### HP-003 — Batched idempotent Supabase apply
- **Kind:** `lesson`
- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- One transaction, one process, hard timeout, attribution tags, deterministic upserts.

### HP-004 — Phase-state semantics
- **Kind:** `protocol-upgrade`
- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- `HARVEST_POINTER_PENDING` is not degradation when operational layers are current.

### HP-005 — Ownership boundary
- **Kind:** `lesson`
- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- Governance linkage repair must not reopen immutable ASG work.

### HP-006 — Public CLI restoration
- **Kind:** `lesson`
- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- Restore public entry points as thin delegates and smoke-test the npm command on main.

## 8. Execution deltas

### ED-001 — Receipt handling
- **Actual:** “only Git yellow” was accepted before parsing the post-push receipt.
- **Optimal:** validate newest receipt and lane lineage first.

### ED-002 — Supabase apply
- **Actual:** synchronous process per statement caused hangs.
- **Optimal:** one bounded asynchronous transaction per harvest.

### ED-003 — Governance ownership repair
- **Actual:** ownership and preflight prefix logic diverged.
- **Optimal:** inspect and update both authority libraries together.

## 9. Waste ledger

### TW-001 — Repeated locked-state acknowledgements
- **Evidence class:** `CHAT_DIRECT`
- The same Phase A/B/C state was restated multiple times after no further action was authorized.
- **Prevention:** one immutable closure compact and a stop condition.

### TW-002 — Partial publication retries
- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- Partially published seeds required supersede flags.
- **Prevention:** idempotent stage receipts and layer-specific repair commands.

### TW-003 — Repeated Supabase initialization
- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- One CLI session per statement caused long waits.
- **Prevention:** batched apply.

## 10. Duplication detector

### DUP-001 — Repeated locked-state discussion
- **Class:** `REPEATED_DISCUSSION`
- Retain one final compact rather than several state seeds.

### DUP-002 — Existing ASG seed overlap
- **Class:** `POSSIBLE_EXISTING_HARVEST`
- Receipt authority, shared-db reconciliation, bounded commands, formal GO, and phase semantics already have reported seeds.
- **Disposition:** `NEEDS_REGISTRY_LOOKUP_FIRST` before accepting any candidate below.

## 11. Operator friction

### OF-001 — Ambiguous “run” after locked state
- **Evidence class:** `CHAT_DIRECT`
- The attached protocol resolved the request as an OBSERVED `DRAFT_FILE` harvest on `chat-gpt-harvest`.

## 12. ROI backlog

### ROI-001 — Receipt-first closeout authority

- **Rank:** 1
- **Improvement type:** `validation_rule`
- **Evidence class:** `CHAT_DIRECT`
- **Future savings:** high token/time savings; avoids repeated investigation and implementation rework.
- **Optimal future workflow:** locate newest receipt → validate schema/SHA/run mode/lanes → compare lineage → declare state from newest eligible receipt only.

### ROI-002 — Batched bounded Supabase projection

- **Rank:** 2
- **Improvement type:** `coding_pattern`
- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- **Future savings:** high time savings; avoids roughly seven repeated CLI calls per harvest and partial retries.
- **Optimal future workflow:** build deterministic idempotent SQL → one async process → timeout and attribution → receipt after commit.

### ROI-003 — Explicit Phase B / Phase C semantics

- **Rank:** 3
- **Improvement type:** `stop_condition`
- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- **Future savings:** medium token/time savings; avoids unnecessary republish and unauthorized pointer work.
- **Optimal future workflow:** verify Phase B → return `HARVEST_POINTER_PENDING` → stop without approval → use `phase-b-v2` for Phase C.

### ROI-004 — Governance ownership dual-check
- **Rank:** 4
- **Improvement type:** `debugging_heuristic`
- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- Check both ownership and preflight libraries for `governance-material-*` prefix handling.

### ROI-005 — Public CLI smoke test on main
- **Rank:** 5
- **Improvement type:** `validation_rule`
- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- Library tests do not prove the public npm entry point exists.

## 13. Do-not-advance guards

- Do not claim `HARVEST_COMPLETE`, `OPERATIONAL`, or live retrieval from this draft.
- Do not reopen any closed mission.
- Do not approve or run Phase C from this draft.
- Do not republish existing seeds without duplication preflight.
- Do not promote reported SHAs, receipts, tests, or publication state without cross-checks.
- Do not mix OBSERVED facts with ADVANCEMENT synthesis.
- Do not push this draft to `main`.

## 14. Seed packet candidates

### Candidate A — Receipt-first closeout

```json
{
  "seedId": "IH-THREAD-RECEIPT-FIRST-CLOSEOUT-20260805",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "improvementType": "validation_rule",
  "futureSavings": {
    "tokenSavingsEstimate": "high",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 4,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["cursor_planning", "testing", "debugging", "deployment"],
    "futureEfficiencyImpact": "Prevents stale closeout summaries from overriding the newest receipt."
  },
  "optimalFutureWorkflow": ["Open newest receipt", "Validate eligibility and SHA", "Compare lineage", "Declare state from receipt only"],
  "retrievalQuestions": ["Why did the ASG blocker change after Git push?", "What is the sole authority for formal GO?"],
  "evidenceRefs": [{"classification": "CHAT_DIRECT", "ref": "Git-only WARN corrected by shared-db WARN receipt"}],
  "futureAgentInstructions": {
    "whenThisAppears": "A summary and newer receipt disagree.",
    "startAt": "Newest machine-readable receipt.",
    "runPreflight": "Validate schema and lineage.",
    "doNot": ["Trust stale narrative", "Declare GO from Git parity alone"],
    "proveBeforeClaiming": ["All lanes parsed", "Formal eligibility true", "SHA and live mode proven"]
  }
}
```

### Candidate B — Batched Supabase projection

```json
{
  "seedId": "IH-THREAD-BATCHED-SUPABASE-PROJECTION-20260805",
  "kind": "lesson",
  "status": "CANDIDATE",
  "improvementType": "coding_pattern",
  "futureSavings": {
    "tokenSavingsEstimate": "medium",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 7,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["coding", "testing", "debugging", "deployment"],
    "futureEfficiencyImpact": "Replaces repeated synchronous CLI sessions with one bounded transaction."
  },
  "optimalFutureWorkflow": ["Build SQL batch", "Run one async process", "Timeout and attribute errors", "Write receipt after commit"],
  "retrievalQuestions": ["Why did projection hang?", "What pattern reduced apply time to seconds?"],
  "evidenceRefs": [{"classification": "USER_REPORTED_OPERATIONAL", "ref": "runSqlBatch and five-second projection report"}],
  "futureAgentInstructions": {
    "whenThisAppears": "Projection invokes Supabase CLI repeatedly.",
    "startAt": "Batch executor and transaction boundary.",
    "runPreflight": "Timeout, retry, idempotency, wrong-project tests.",
    "doNot": ["Spawn once per statement", "Write success before commit"],
    "proveBeforeClaiming": ["Single process", "Transaction committed", "Retry proven"]
  }
}
```

### Candidate C — Phase C explicit gate

```json
{
  "seedId": "IH-THREAD-PHASE-C-EXPLICIT-GATE-20260805",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "improvementType": "stop_condition",
  "futureSavings": {
    "tokenSavingsEstimate": "medium",
    "timeSavingsEstimate": "medium",
    "toolCallsAvoided": 3,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": false,
    "appliesTo": ["cursor_planning", "repository_retrieval", "deployment"],
    "futureEfficiencyImpact": "Prevents unnecessary republish and unauthorized pointer materialization."
  },
  "optimalFutureWorkflow": ["Verify Phase B", "Return pointer pending", "Stop without approval", "Use phase-b-v2 for Phase C"],
  "retrievalQuestions": ["Does pointer pending mean degraded?", "When may Phase C run?"],
  "evidenceRefs": [{"classification": "USER_REPORTED_OPERATIONAL", "ref": "Repeated locked Phase B OPERATIONAL / Phase C DEFERRED state"}],
  "futureAgentInstructions": {
    "whenThisAppears": "Operational layers are current but Git pointer is missing.",
    "startAt": "Phase-state semantics receipt.",
    "runPreflight": "Confirm Phase B and approval state.",
    "doNot": ["Label derived layers degraded", "Run Phase C without approval"],
    "proveBeforeClaiming": ["Phase B complete", "Pointer state explicit", "Approval evaluated"]
  }
}
```

**Duplication warning:** Cursor must compare these candidates with reported ASG and three-lane seed registries before accepting any seed.

## 15. Future-agent instructions

1. Start with the newest receipt and immutable closure artifact.
2. Keep ASG hardening, governance linkage, and North Star CLI repair separate.
3. For `governance-material-*` reroutes, verify prefixes in both ownership and preflight libraries.
4. Use `npm run north-star:observe`; exit 1 may represent observer verdict, not CLI failure.
5. Use bounded one-shot commands in closeout.
6. Treat Z as canonical authority and L/Supabase as retrieval/projection layers.
7. Do not rebuild or republish Z without source-hash drift.
8. Do not rerun full harvest publication merely to green optional derived layers.
9. Stop at `HARVEST_POINTER_PENDING` unless Phase C is explicitly approved.
10. Run duplication preflight before accepting seed candidates.

## 16. Publication truth

| Layer | State |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | `not-run` |
| L: draft staging (GitHub Action move) | `not-run` |
| Cursor ingest | `not-run` |
| Duplication preflight | `not-run` |
| `harvest:validate` | `not-run` |
| L: Hub catalog (operator publish) | `not-run` |
| Z: AI cache | `not-run` |
| Supabase projection | `not-run` |
| Data-Extraction advancement ingest | `not-run` |
| Freshness gate | `not-run` |

```text
Publication: NOT_RUN_BY_CURSOR
projection.hubPublishStatus: not-run
Implementation: NOT_AUTHORIZED
```

## 17. Acceptance checklist

- [x] OBSERVED lane only
- [x] DRAFT_FILE declared
- [x] ChatGPT-safe retrieval block
- [x] Scope and correction ledgers
- [x] Operational claims labeled
- [x] Thread-grounded ROI
- [x] Seed candidates marked CANDIDATE
- [x] Duplication risk called out
- [x] Closed lanes separated
- [x] Phase C deferred
- [x] Publication table not-run
- [ ] Cursor duplication preflight
- [ ] Cursor validation
- [ ] Operator publication

## 18. Next operator action

After Git push, Cursor should pull `chat-gpt-harvest` and run:

```bash
npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-05-asg-go-hardening-three-lane-closeout-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-05-asg-go-hardening-three-lane-closeout-v1

npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-05-asg-go-hardening-three-lane-closeout-v1
npm run harvest:sync-derived -- harvest-2026-08-05-asg-go-hardening-three-lane-closeout-v1
npm run harvest:validate -- harvest-2026-08-05-asg-go-hardening-three-lane-closeout-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-05-asg-go-hardening-three-lane-closeout-v1
npm run test:harvest
```

Operator publication remains a later explicit action.

## 19. Git push target

```text
Repo: Capglass5708/CapitalGlass-Cross-Agent
Branch: chat-gpt-harvest
File: artifacts/agent-runs/harvest-2026-08-05-asg-go-hardening-three-lane-closeout-v1/chatgpt-findings-source.md
Commit: harvest(chatgpt): draft findings harvest-2026-08-05-asg-go-hardening-three-lane-closeout-v1
```
