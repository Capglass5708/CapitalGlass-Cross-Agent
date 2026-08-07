# ChatGPT Thread Autopsy Findings

## 1. Final summary + verdict

**Harvest ID:** `harvest-2026-08-07-chatgpt-harvest-v21-restoration-live-pilot-v1`  
**Mission:** `chat-thread-closeout-autopsy-harvest-chatgpt-v1`  
**Protocol:** v2.1  
**Lane:** `CHAT_CONTEXT_ONLY`  
**Mode:** `DRAFT_FILE`  
**Closeout target:** `CHATGPT_SOURCE_PUBLISHED`  
**Artifact:** `artifacts/agent-runs/harvest-2026-08-07-chatgpt-harvest-v21-restoration-live-pilot-v1/chatgpt-findings-source.md`

This thread captured the restoration and live exercise of the ChatGPT Git publication lane for harvest closeouts, plus a production plan-set-processing M4P closeout used as a fresh pilot source. The durable system lesson is that ChatGPT harvest behavior must be governed by `CapitalGlass-Cross-Agent/main` plus synchronized Z/L protocol copies, while ChatGPT is authorized to publish exactly one designated findings artifact to `chat-gpt-harvest` and may claim `CHATGPT_SOURCE_PUBLISHED` only after remote SHA verification. Cursor/operator lanes retain ingest, validation, canonical publication, Z/L Hub publication, index/cache, and `HARVEST_COMPLETE` authority.

The thread also exposed an important operational failure pattern: the stronger Git-backed ChatGPT harvest lane had previously existed on unmerged side branches, while `main` and the L: catalog still carried the simpler draft-only protocol. That split estate made behavior appear inconsistent. The restoration wave fixed this by promoting protocol v2/v2.1, the shared publication contract, consistency tests, workflow automation, and mirror wiring to `main` as atomic commit `bf3952e58c500036e11d8f42d810df3c2a7314af`, followed by Z mirror sync.

A fresh ChatGPT pilot then successfully published an M4P findings artifact to `chat-gpt-harvest` at remote-verified SHA `2c3cf6e21669a5cd121184c8828a43a4b6dfdb7f`. That proved the ChatGPT-side Git gate after the restoration became authoritative. The remaining restoration closeout proof is downstream: GitHub Action execution, deterministic L: staging, Cursor ingest, validation, and `test:harvest`.

**Important evidence boundary:** M4P implementation/live-proof details are thread-observed from the operator-provided closeout. This ChatGPT lane did not independently inspect `CapitalGlass-Documents`, Supabase, or the cited M4P receipts. GitHub authority facts specifically called out as verified were inspected through the connected GitHub surface in this thread.

**Draft verdict at artifact creation:** `DRAFT_READY`  
**Target after Git gate PASS:** `CHATGPT_SOURCE_PUBLISHED`  
**Canonical harvest completion:** Cursor-owned; ChatGPT does not claim `HARVEST_COMPLETE`.

---

## 2. Harvest tier rationale

**Target tier:** `T2`

Rationale: the thread contains a corrected protocol authority model, a recurring publication failure pattern, a concrete authentication blocker and recovery, an atomic `main` promotion, a fresh post-restoration ChatGPT Git pilot, a downstream observability gap, and a substantive M4P system handoff closeout. These are durable cross-thread lessons that can affect future SDLC, agent routing, Gold Mine classification, and operator friction. Canonical verification beyond the ChatGPT Git boundary belongs to Cursor/operator lanes.

---

## 3. Retrieval preflight

ChatGPT protocol truth:

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN_AT_DRAFT_WRITE
```

GitHub authority checks executed in this thread:

```text
CapitalGlass-Cross-Agent/main restoration commit:
bf3952e58c500036e11d8f42d810df3c2a7314af

Fresh prior ChatGPT pilot on chat-gpt-harvest:
2c3cf6e21669a5cd121184c8828a43a4b6dfdb7f
remote comparison: identical / 0 ahead / 0 behind
```

Source-reported M4P retrieval state, not independently executed by ChatGPT:

```text
Retrieval: INDEX_MISS
Cache: CACHE_MISS
Scout: repo authority + live Supabase proofs; Intelligence Hub not consulted for implementation lane
```

Do not convert these observations into `INDEX_HIT`, `HARVEST_COMPLETE`, `OPERATIONAL`, or `FULLY_SEEDED` claims in the ChatGPT lane.

---

## 4. Thread event inventory

### EVT-001 — Push-capable autopsy protocol disappeared from canonical L copy

The operator identified that `L:\02-catalog\Harvest\protocol\CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md` had become draft-only because the stronger `chat-gpt-harvest` push lane was developed on side branches and never promoted to `main`.

Evidence included branch-only commits for mandatory push instructions, Git→L automation, tiering, and workflow logic. The canonical `main` protocol still reflected the simpler Cursor-handoff-only model.

### EVT-002 — Split-estate diagnosis established the root cause

The thread separated operational authority from branch experiments:

- `main` + published Z/L mirrors define actual ChatGPT harvest behavior.
- `chat-gpt-harvest` branch-only protocol text is non-authoritative.
- advancement protocol and old assessment artifacts still referenced push behavior while the autopsy protocol did not.

This explained why ChatGPT behavior appeared inconsistent across different files.

### EVT-003 — Restoration design established deterministic authority boundaries

The restoration design preserved a narrow ChatGPT write boundary:

- ChatGPT: thread compression → one designated `chatgpt-findings-source.md` → Git staging on `chat-gpt-harvest`.
- Cursor: ingest → validation → classification → canonical JSON → `main` promotion.
- Operator/estate automation: full publication, Z/L, index, cache, freshness.

Three truth stages were separated: `DRAFT_READY`, `CHATGPT_SOURCE_PUBLISHED`, and Cursor-owned `HARVEST_COMPLETE`.

### EVT-004 — Restoration wave implemented locally as atomic 21-file commit

The restoration wave aligned autopsy, advancement, T2 assessment, quality gate, shared publication contract, GitHub Action, deterministic move/collect/stage scripts, consistency tests, package scripts, and Z-mirror wiring.

Local commit:

`bf3952e58c500036e11d8f42d810df3c2a7314af` — `feat(harvest): restore ChatGPT Git publication lane v2 on main`

### EVT-005 — OAuth `workflow` scope blocked first `main` push

GitHub rejected the atomic restoration push because the credential had `repo` but lacked `workflow`, which is required to create/update `.github/workflows/chatgpt-harvest-move-to-l.yml`.

The branch remained one commit ahead while `origin/main` stayed at `9146913...`.

### EVT-006 — Repeated device authorization attempts created operator friction

Multiple `gh auth refresh -h github.com -s workflow --clipboard` device flows timed out before the browser authorization step completed. The thread repeatedly re-stated the same milestone state while the underlying blocker remained unchanged.

### EVT-007 — Auth block cleared; atomic commit reached GitHub `main`

The operator later confirmed the token included `workflow`, `HEAD == origin/main == bf3952e58c500036e11d8f42d810df3c2a7314af`, ahead/behind was 0/0, and `harvest:sync-z-mirror` returned `Z_HARVEST_MIRROR_SYNC_PASS`.

ChatGPT independently fetched `bf3952e...` from GitHub and verified the restored workflow existed on `main`.

Milestone advanced to `GIT_AUTHORITY_PASS / LIVE_PILOT_PENDING`.

### EVT-008 — Fresh post-restoration ChatGPT Git pilot passed

Using the M4P closeout as a live source thread, ChatGPT wrote one findings artifact to `chat-gpt-harvest` and received commit SHA:

`2c3cf6e21669a5cd121184c8828a43a4b6dfdb7f`

Remote comparison of branch HEAD to that SHA returned `identical`, 0 ahead, 0 behind.

ChatGPT verdict for that pilot: `CHATGPT_SOURCE_PUBLISHED`.

### EVT-009 — Downstream Action/L/Cursor proof remained open

The GitHub connector surface available in the thread did not expose a push-triggered workflow run for the commit. No failure was proven; rather, Action execution and deterministic L: staging were not observable from the current ChatGPT tools.

The restoration milestone therefore remained `LIVE_PILOT_GIT_PASS / ACTION_L_CURSOR_PENDING` rather than `CLOSED_GO`.

### EVT-010 — M4P plan-set processing handoff closeout supplied durable product evidence

The operator reported `PLAN_SET_PROCESSING_HANDOFF_READY_WITH_WARN` for M4P, including immutable processing snapshots, deterministic replay, Bluebeam/OCR/parser lane bindings keyed by `processingSnapshotId`, and a hard `NO_DOWNSTREAM_FILESYSTEM_REDISCOVERY_PASS` invariant.

Warnings remained for stale worker recovery proof, partial-processing live simulation, fixture repair history, and at that time a local-only `CapitalGlass-Documents` commit.

### EVT-011 — v2.1 Gold Mine compounding contract became authoritative

The attached protocol and GitHub `main` both showed v2.1, upgrading harvest from narrative-only compression to classified evidence capture including problem/resolution/adoption/performance/friction/observability/product signals, implementation state, novelty, outcomes, workflow coverage, corpus bias, and no-suppression rules.

---

## 5. Harvest packets

### HP-001 — Split-estate protocol authority caused inconsistent ChatGPT harvest behavior

```yaml
kind: failure-pattern
goldMineSignalClass: PROBLEM_SIGNAL
implementationState: VERIFIED_FIXED
novelty: RESOLUTION_EVIDENCE
workPackageId: chatgpt-harvest-git-publication-restoration-v2
problem: >-
  Push-capable autopsy behavior existed on side branches but not on main, while L:
  mirrored main. Different protocol files therefore gave inconsistent instructions.
rootCause: >-
  Branch lane was treated as operationally complete without promoting its protocol and
  automation changes into the canonical main -> Z -> L publication path.
resolutionTarget: >-
  main must own the autopsy protocol, shared Git publication contract, automation,
  consistency gate, and mirror wiring before operators treat the lane as operational.
evidenceRefs:
  - EVT-001
  - EVT-002
  - EVT-004
  - EVT-007
```

### HP-002 — ChatGPT Git publication must be a narrow, verifiable authority lane

```yaml
kind: protocol-upgrade
goldMineSignalClass: RESOLUTION_SIGNAL
implementationState: ADOPTED
novelty: RESOLUTION_EVIDENCE
workPackageId: chatgpt-harvest-git-publication-contract-v1
resolutionTarget: >-
  Authorize only one designated evidence artifact on chat-gpt-harvest, require remote
  SHA verification, and prohibit ChatGPT from claiming canonical ingest/publication.
proof:
  - protocol v2/v2.1 on main
  - shared publication contract on main
  - fresh remote-verified pilot SHA 2c3cf6e21669a5cd121184c8828a43a4b6dfdb7f
evidenceRefs:
  - EVT-003
  - EVT-007
  - EVT-008
```

### HP-003 — Workflow-file pushes need explicit GitHub auth capability

```yaml
kind: known-failure
goldMineSignalClass: OPERATOR_FRICTION_SIGNAL
implementationState: VERIFIED_FIXED
novelty: RESOLUTION_EVIDENCE
workPackageId: github-workflow-scope-harvest-restoration
problem: >-
  Atomic main push was rejected because OAuth credential lacked workflow scope while
  the commit added .github/workflows/chatgpt-harvest-move-to-l.yml.
resolutionTarget: >-
  Preflight auth capability before an execution wave that adds or modifies Actions
  workflows; preserve atomic commit rather than splitting authority changes.
evidenceRefs:
  - EVT-005
  - EVT-006
  - EVT-007
```

### HP-004 — Repeated unchanged blocker narration wasted operator cycles

```yaml
kind: inefficiency
goldMineSignalClass: AGENT_FRICTION_SIGNAL
implementationState: OBSERVED_OPEN
novelty: NEW
workPackageId: blocker-state-dedup-agent-behavior
problem: >-
  Several turns restated the same blocked auth status without new evidence, even after
  the actionable boundary was already clear.
resolutionTarget: >-
  Detect unchanged blocker fingerprints and emit one concise status + alternate path,
  then wait for changed evidence rather than re-litigating the same state.
evidenceRefs:
  - EVT-006
```

### HP-005 — GitHub Action/L staging remains an observability gap in ChatGPT closeout

```yaml
kind: observability-gap
goldMineSignalClass: OBSERVABILITY_GAP
implementationState: OBSERVED_OPEN
novelty: NEW
workPackageId: chatgpt-harvest-action-l-observability
problem: >-
  ChatGPT can prove chat-gpt-harvest branch SHA but the current connector surface did
  not expose the push-triggered self-hosted workflow run or L: staging receipt.
resolutionTarget: >-
  Provide a deterministic receipt surface or query path for Action run -> job -> L move
  receipt so restoration pilots can close without manual cross-tool correlation.
evidenceRefs:
  - EVT-009
```

### HP-006 — Immutable processing snapshot is a successful downstream handoff pattern

```yaml
kind: success-pattern
goldMineSignalClass: SUCCESS_PATTERN
implementationState: IMPLEMENTED_IN_THREAD
novelty: RESOLUTION_EVIDENCE
workPackageId: plan-set-processing-handoff-bluebeam-ocr-v1
pattern: >-
  Normalize source/sheet membership into one immutable processingSnapshotId and bind
  Bluebeam/OCR/parser downstream lanes to that identity rather than rediscovering files.
sourceEvidenceBoundary: thread-observed, not independently verified by ChatGPT
reportedProof:
  - Rosewood snapshot 748545a7-5114-47dd-a979-3d72a0b3b8eb with REPLAY_NO_OP
  - Beacon Hill snapshot ce0db433-2214-45b8-bf43-00077f179bf4 with REPLAY_NO_OP
  - Beacon Hill 1 Bluebeam + 82 OCR + 82 parser bindings on one snapshot
evidenceRefs:
  - EVT-010
```

### HP-007 — M4P downstream readiness still needs stale worker and partial-live proof

```yaml
kind: residual-risk
goldMineSignalClass: PERFORMANCE_SIGNAL
implementationState: PARTIAL
novelty: KNOWN_EXISTING
workPackageId: plan-set-processing-handoff-bluebeam-ocr-v1
residuals:
  - stale lane binding status exists but worker lease death/retry proof deferred
  - partial state machine unit-tested but live 78/4 Beacon Hill simulation not run
resolutionTarget: >-
  Prove stale job recovery and live partial-processing behavior before treating worker
  execution resilience as fully closed.
evidenceRefs:
  - EVT-010
```

### HP-008 — Gold Mine needs source-classified positive and negative evidence

```yaml
kind: protocol-upgrade
goldMineSignalClass: RESOLUTION_SIGNAL
implementationState: ADOPTED
novelty: NEW
workPackageId: chatgpt-harvest-v21-gold-mine-compounding
resolutionTarget: >-
  Harvest findings carry explicit signal class, implementation state, novelty, outcomes,
  product coverage, observability gaps, success patterns, and corpus bias rather than
  forcing Data-Extraction to infer them from prose.
evidenceRefs:
  - EVT-011
```

---

## 6. Execution deltas

### ED-001 — Autopsy lane authority changed from draft-only to Git-staged

```yaml
before: ChatGPT produced draft Markdown and handed it to Cursor; Git authority not-run
after: ChatGPT publishes one designated findings artifact to chat-gpt-harvest and verifies remote SHA
goldMineSignalClass: RESOLUTION_SIGNAL
implementationState: ADOPTED
novelty: RESOLUTION_EVIDENCE
```

### ED-002 — Publication truth now separates source publication from canonical harvest completion

```yaml
before: draft/published/complete states could be conflated
after:
  - DRAFT_READY
  - CHATGPT_SOURCE_PUBLISHED
  - HARVEST_COMPLETE (Cursor only)
goldMineSignalClass: SUCCESS_PATTERN
implementationState: ADOPTED
novelty: RESOLUTION_EVIDENCE
```

### ED-003 — Protocol authority now enforces main → Z → L instead of branch folklore

```yaml
before: branch-only protocol work could be mistaken for active operator behavior
after: only main and synchronized Z/L surfaces define ChatGPT harvest behavior
goldMineSignalClass: RESOLUTION_SIGNAL
implementationState: ADOPTED
novelty: RESOLUTION_EVIDENCE
```

### ED-004 — v2.1 extends harvest output from narrative to structured Gold Mine evidence

```yaml
before: harvest mainly summarized events/packets/ROI/seeds
after: findings additionally encode signal class, state, novelty, outcomes, coverage, observability gaps, success patterns, and bias
goldMineSignalClass: RESOLUTION_SIGNAL
implementationState: ADOPTED
novelty: NEW
```

---

## 7. Observed improvement outcomes

### OUT-001 — Canonical ChatGPT Git publication lane restored

```yaml
outcomeId: OUT-001
beforeState: >-
  Autopsy protocol on main/L was draft-only while stronger push instructions lived on
  unmerged branches, producing a split estate.
afterState: >-
  Protocol v2/v2.1, shared contract, aligned companion protocols, workflow automation,
  consistency gate, and mirror wiring are on main at bf3952e...
measurableChange:
  - local/remote main parity reported 0/0
  - Z_HARVEST_MIRROR_SYNC_PASS reported
  - GitHub fetch verified bf3952e and workflow on main
proof:
  - EVT-007
remainingResidual: downstream Action -> L -> Cursor validation proof
improvementProven: true
```

### OUT-002 — Fresh ChatGPT Git gate passed after restoration

```yaml
outcomeId: OUT-002
beforeState: restoration live pilot pending
afterState: fresh M4P findings artifact remote-published on chat-gpt-harvest
measurableChange:
  remoteCommitSha: 2c3cf6e21669a5cd121184c8828a43a4b6dfdb7f
  branchComparison: identical
  aheadBy: 0
  behindBy: 0
proof:
  - EVT-008
remainingResidual: Action/L/Cursor stages not proven in ChatGPT lane
improvementProven: true
```

### OUT-003 — OAuth workflow-scope blocker cleared without splitting restoration commit

```yaml
outcomeId: OUT-003
beforeState: >-
  bf3952e was local-only because token lacked workflow scope and GitHub rejected the
  Actions workflow path.
afterState: >-
  workflow scope present; atomic 21-file bf3952e reached origin/main intact.
measurableChange:
  headRemoteParity: true
  commitSplitRequired: false
proof:
  - EVT-005
  - EVT-007
remainingResidual: preflight should prevent recurrence
improvementProven: true
```

### OUT-004 — M4P immutable handoff pattern reported implemented, but not fully resilience-proven

```yaml
outcomeId: OUT-004
beforeState: downstream plan-set consumers risk membership rediscovery and fragmented provenance
afterState: processingSnapshotId reportedly binds Bluebeam/OCR/parser handoffs with deterministic replay
measurableChange:
  rosewoodSources: 1
  rosewoodSheets: 192
  beaconHillSources: 82
  beaconHillSheets: 82
  beaconHillBindings:
    bluebeam: 1
    ocr: 82
    parser: 82
proof: operator-provided M4P closeout and cited receipts
remainingResidual:
  - stale lease death/retry proof
  - live partial-processing simulation
  - M4P repo commit state may need independent re-check
improvementProven: false
```

---

## 8. Waste ledger

### TW-001 — Repeated auth-block status loops

Multiple turns repeated the same `IMPLEMENTED_LOCAL / BLOCKED_GIT_AUTH_SCOPE` state and the same device authorization instructions without new evidence.

```yaml
goldMineSignalClass: AGENT_FRICTION_SIGNAL
implementationState: OBSERVED_OPEN
novelty: NEW
wasteType: repeated_state_narration
avoidable: true
recommendedFix: blocker fingerprint + no-change response dedupe
```

### TW-002 — Initial protocol work closed on side branch before canonical promotion

The earlier push lane accumulated implementation and documentation value but was operationally ineffective because it did not land on `main`.

```yaml
goldMineSignalClass: PROBLEM_SIGNAL
implementationState: VERIFIED_FIXED
novelty: RESOLUTION_EVIDENCE
wasteType: branch_authority_drift
avoidable: true
recommendedFix: lane closeout must include canonical ancestor/promotion check
```

---

## 9. Duplication detector

### DUP-001 — Authentication blocker repeated across several turns

```yaml
duplicationClass: repeated_work
stableIdentity: github-workflow-scope-harvest-restoration
status: CONFIRMED_REPEAT
notes: >-
  Same auth scope blocker and unchanged remote SHA were re-stated multiple times.
action: retain one canonical evidence packet; preserve distinct recovery evidence only
```

### DUP-002 — Existing M4P harvest artifact already published in prior pilot

```yaml
duplicationClass: prior_artifact_overlap
stableIdentity: harvest-2026-08-07-plan-set-processing-handoff-m4p-closeout-v1
knownSourceCommitSha: 2c3cf6e21669a5cd121184c8828a43a4b6dfdb7f
status: NEEDS_REGISTRY_LOOKUP_FIRST
notes: >-
  This autopsy references M4P only as part of the restoration live-pilot history; Cursor
  should deduplicate against the earlier M4P harvest rather than create duplicate canonical
  intelligence solely from repeated narrative.
```

No suppression: distinct low-value, deferred, or residual observations remain valid evidence even if duplicated narrative is collapsed.

---

## 10. Operator friction

### OF-001 — OAuth device flow requires a human browser step and timed out repeatedly

```yaml
goldMineSignalClass: OPERATOR_FRICTION_SIGNAL
implementationState: VERIFIED_FIXED
novelty: RESOLUTION_EVIDENCE
friction: >-
  Agent sessions could start gh auth refresh but could not reliably keep the device flow
  alive while waiting for operator browser authorization.
impact: delayed atomic promotion and caused repetitive status loops
recommendedImprovement: preflight workflow scope before wave execution; surface one concise interactive operator step
```

### OF-002 — Remote authority could look stale in one surface while WSL state was current

```yaml
goldMineSignalClass: OPERATOR_FRICTION_SIGNAL
implementationState: VERIFIED_FIXED
novelty: NEW
friction: >-
  Operator had to correct the recorded milestone after auth/push had already succeeded on
  the machine while prior GitHub checks still reflected the older remote state.
recommendedImprovement: re-query remote authority whenever operator reports a state transition; avoid persisting stale verdicts
```

---

## 11. Observability gaps

### OG-001 — Push-triggered Action run not observable from the available commit-status path

```yaml
observabilityGapId: OG-001
whatWeNeededToKnow: >-
  Did chatgpt-harvest-move-to-l.yml trigger for the fresh ChatGPT push and did the self-hosted
  WESLEYDESK job complete successfully?
whyItWasNotObservable: >-
  The connector path used for commit statuses exposed no status entries and the available
  workflow-run helper was not a general push-run listing surface.
workflow: ChatGPT harvest -> GitHub Action -> L draft staging
missingMetricOrReceipt: workflow run id, job conclusion, deterministic L move receipt
recommendedInstrumentation: >-
  Publish a compact machine-readable latest Action/L move receipt keyed by source commit SHA
  and harvestId; expose a direct workflow-run query by head SHA/event.
goldMineSignalClass: OBSERVABILITY_GAP
```

### OG-002 — M4P worker resilience evidence incomplete

```yaml
observabilityGapId: OG-002
whatWeNeededToKnow: >-
  Whether stale worker leases are durably recovered and whether partial processing behaves
  correctly in a live multi-source execution.
whyItWasNotObservable: deferred from M4P wave
workflow: plan-set processing -> OCR/parser/Bluebeam workers
missingMetricOrReceipt:
  - STALE_PROCESSING_JOB_RECOVERY_PASS
  - live 78/4 Beacon Hill partial-processing receipt
recommendedInstrumentation: worker lease/retry receipt plus partial-state transition proof
goldMineSignalClass: OBSERVABILITY_GAP
```

---

## 12. Success patterns

### SUCCESS-001 — Main-first authority routing prevented branch-only behavior from being accepted

```yaml
goldMineSignalClass: SUCCESS_PATTERN
implementationState: ADOPTED
novelty: RESOLUTION_EVIDENCE
pattern: >-
  Explicitly treating main -> Z -> L as the only operational protocol authority exposed
  the split-estate defect and prevented branch-only text from being mistaken for production policy.
proof:
  - restoration commit bf3952e on main
  - v2.1 protocol fetched from main
```

### SUCCESS-002 — Remote SHA equality makes ChatGPT publication truth deterministic

```yaml
goldMineSignalClass: SUCCESS_PATTERN
implementationState: ADOPTED
novelty: RESOLUTION_EVIDENCE
pattern: >-
  Branch HEAD compared directly to the new commit SHA; identical / 0 ahead / 0 behind is a
  simple hard gate for CHATGPT_SOURCE_PUBLISHED.
proof:
  - fresh pilot 2c3cf6e21669a5cd121184c8828a43a4b6dfdb7f
```

### SUCCESS-003 — Atomic restoration commit preserved protocol + automation consistency

```yaml
goldMineSignalClass: SUCCESS_PATTERN
implementationState: ADOPTED
novelty: RESOLUTION_EVIDENCE
pattern: >-
  The team did not split the workflow out when auth failed; once scope was corrected the
  same 21-file commit landed intact, preserving one authority point for protocol, scripts,
  workflow, tests, and mirror wiring.
proof: bf3952e58c500036e11d8f42d810df3c2a7314af
```

### SUCCESS-004 — Immutable processing snapshot prevents downstream membership rediscovery

```yaml
goldMineSignalClass: SUCCESS_PATTERN
implementationState: IMPLEMENTED_IN_THREAD
novelty: RESOLUTION_EVIDENCE
pattern: >-
  Bind multiple downstream lanes to a single immutable processing identity and explicitly
  carry noFilesystemRediscovery=true.
sourceEvidenceBoundary: thread-observed M4P closeout
```

---

## 13. ROI backlog

### ROI-001 — Close the Action → L → Cursor restoration pilot

```yaml
rank: 1
operatorValue: HIGH
businessValue: MEDIUM
platformValue: HIGH
agentValue: HIGH
reliabilityValue: HIGH
automationLeverage: HIGH
estimatedComplexity: LOW_TO_MEDIUM
blastRadius: LOW
confidence: HIGH
evidenceDiversity: HIGH
rootCauseLeverage: HIGH
goldMineSignalClass: RESOLUTION_SIGNAL
novelty: RESOLUTION_EVIDENCE
businessImpact: RELIABILITY
rationale: >-
  This is the only remaining proof required to convert the restored ChatGPT Git lane from
  Git-only success into a fully demonstrated end-to-end closeout path.
```

### ROI-002 — Add deterministic Action/L receipt lookup by source SHA

```yaml
rank: 2
operatorValue: HIGH
businessValue: LOW
platformValue: HIGH
agentValue: HIGH
reliabilityValue: HIGH
automationLeverage: HIGH
estimatedComplexity: MEDIUM
blastRadius: LOW
confidence: HIGH
evidenceDiversity: MEDIUM
rootCauseLeverage: HIGH
goldMineSignalClass: OBSERVABILITY_GAP
novelty: NEW
businessImpact: OPERABILITY
rationale: >-
  Removes manual ambiguity at the exact boundary now blocking CLOSED_GO proof from ChatGPT.
```

### ROI-003 — Add GitHub workflow-scope capability preflight

```yaml
rank: 3
operatorValue: MEDIUM
businessValue: LOW
platformValue: MEDIUM
agentValue: MEDIUM
reliabilityValue: MEDIUM
automationLeverage: MEDIUM
estimatedComplexity: LOW
blastRadius: LOW
confidence: HIGH
evidenceDiversity: MEDIUM
rootCauseLeverage: MEDIUM
goldMineSignalClass: OPERATOR_FRICTION_SIGNAL
novelty: RESOLUTION_EVIDENCE
businessImpact: OPERABILITY
rationale: >-
  Prevents a predictable push failure before waves that introduce/modify Actions workflows.
```

### ROI-004 — Blocker-fingerprint dedupe for agent status loops

```yaml
rank: 4
operatorValue: MEDIUM
businessValue: LOW
platformValue: MEDIUM
agentValue: HIGH
reliabilityValue: LOW
automationLeverage: MEDIUM
estimatedComplexity: MEDIUM
blastRadius: MEDIUM
confidence: MEDIUM
evidenceDiversity: LOW
rootCauseLeverage: MEDIUM
goldMineSignalClass: AGENT_FRICTION_SIGNAL
novelty: NEW
businessImpact: EFFICIENCY
rationale: >-
  Reduces repeated unchanged blocker narration and operator token/time waste across SDLC threads.
```

### ROI-005 — M4P stale lease recovery proof

```yaml
rank: 5
operatorValue: MEDIUM
businessValue: MEDIUM
platformValue: HIGH
agentValue: LOW
reliabilityValue: HIGH
automationLeverage: HIGH
estimatedComplexity: MEDIUM
blastRadius: MEDIUM
confidence: MEDIUM
evidenceDiversity: MEDIUM
rootCauseLeverage: HIGH
goldMineSignalClass: PERFORMANCE_SIGNAL
novelty: KNOWN_EXISTING
businessImpact: RELIABILITY
rationale: >-
  Immutable handoff identity is valuable, but durable worker recovery is necessary before
  long-running OCR/parser execution can be treated as resilient.
```

### ROI-006 — M4P live partial-processing simulation

```yaml
rank: 6
operatorValue: MEDIUM
businessValue: MEDIUM
platformValue: MEDIUM
agentValue: LOW
reliabilityValue: MEDIUM
automationLeverage: MEDIUM
estimatedComplexity: MEDIUM
blastRadius: LOW
confidence: MEDIUM
evidenceDiversity: LOW
rootCauseLeverage: MEDIUM
goldMineSignalClass: PERFORMANCE_SIGNAL
novelty: KNOWN_EXISTING
businessImpact: RELIABILITY
rationale: >-
  Converts unit-tested partial state behavior into live production evidence for multi-source plan sets.
```

---

## 14. Product-workflow coverage

| Domain | Coverage | Evidence in this thread |
| --- | --- | --- |
| Computer Estimator | NOT_OBSERVED | No direct CE workflow evidence |
| Human Estimator | NOT_OBSERVED | No direct HE workflow evidence |
| Document Center | OBSERVED | M4P implementation reported in `CapitalGlass-Documents` |
| plan-set processing | OBSERVED | M4P immutable processing snapshots and lane bindings |
| OCR/parser | OBSERVED | downstream bindings + stale/partial residuals |
| Revu/Bluebeam | OBSERVED | Bluebeam envelope/binding and launch-proof option mentioned |
| Bid Composer | NOT_OBSERVED | No direct BC workflow in this thread |
| proposals | NOT_OBSERVED | No direct proposal workflow evidence |
| VAE | NOT_OBSERVED | No direct VAE workflow evidence |
| Scraper | NOT_OBSERVED | No direct Scraper workflow evidence |
| cross-app handoffs | OBSERVED | plan-set snapshot -> Bluebeam/OCR/parser; ChatGPT -> Git -> L -> Cursor |
| operator re-entry | OBSERVED | GitHub device auth browser step required manual intervention |
| manual intervention | OBSERVED | OAuth workflow scope and downstream Action/L verification |

---

## 15. Corpus bias note

```text
corpusBiasNote: Thread evidence is heavily SDLC/governance/harvest-authority oriented, with one substantive Document Center/plan-set-processing closeout; most estimator, proposal, VAE, and scraper product workflows are under-observed.
underObservedDomains: [Computer Estimator, Human Estimator, Bid Composer, proposals, VAE, Scraper]
```

Zero open Gold Mine candidates must **not** be inferred from this thread. Several product surfaces are NOT_OBSERVED, and distinct low-value/deferred observations must not be suppressed.

---

## 16. Do-not-advance guards

1. Do **not** mark the ChatGPT harvest restoration `CLOSED_GO` until Action → L staging → Cursor ingest → validate → `test:harvest` is proven.
2. Do **not** treat `chat-gpt-harvest` branch protocol text as operational authority; `main` + synchronized Z/L remain authoritative.
3. Do **not** let ChatGPT claim `HARVEST_COMPLETE`, `OPERATIONAL`, `FULLY_SEEDED`, index hit, or Hub publication.
4. Do **not** duplicate the prior M4P canonical harvest without digest/registry lookup; this artifact references M4P primarily as live-pilot evidence.
5. Do **not** treat M4P worker resilience as closed until stale recovery and live partial-processing proofs exist.
6. Do **not** infer estate-wide optimization from this SDLC-heavy corpus.
7. Do **not** use display ordinals (`HP-###`, `GOLD-####`) as durable identity; preserve digests/workPackageIds/content hashes when known.
8. Do **not** suppress distinct deferred or low-value Gold Mine evidence merely because it seems minor.

---

## 17. Seed packet candidates

```json
{
  "seedId": "IH-THREAD-CHATGPT-HARVEST-MAIN-AUTHORITY-V1",
  "kind": "failure-pattern",
  "status": "CANDIDATE",
  "goldMineSignalClass": "PROBLEM_SIGNAL",
  "implementationState": "VERIFIED_FIXED",
  "novelty": "RESOLUTION_EVIDENCE",
  "workPackageId": "chatgpt-harvest-git-publication-restoration-v2",
  "retrievalQuestions": [
    "Why can chat-gpt-harvest branch behavior differ from the operator protocol?",
    "Which surface is authoritative for ChatGPT harvest behavior?",
    "How do we prevent branch-only protocol work from being treated as operational?"
  ],
  "evidenceRefs": ["EVT-001", "EVT-002", "EVT-007", "OUT-001"],
  "futureAgentInstructions": "Before relying on ChatGPT harvest behavior, verify the protocol on CapitalGlass-Cross-Agent/main and its synchronized Z/L publication state. Branch-only protocol text is non-authoritative."
}
```

```json
{
  "seedId": "IH-THREAD-CHATGPT-HARVEST-GIT-GATE-V1",
  "kind": "lesson",
  "status": "CANDIDATE",
  "goldMineSignalClass": "SUCCESS_PATTERN",
  "implementationState": "ADOPTED",
  "novelty": "RESOLUTION_EVIDENCE",
  "workPackageId": "chatgpt-harvest-git-publication-contract-v1",
  "retrievalQuestions": [
    "What must ChatGPT prove before claiming CHATGPT_SOURCE_PUBLISHED?",
    "What is the allowed ChatGPT repo write boundary?",
    "Who owns HARVEST_COMPLETE?"
  ],
  "evidenceRefs": ["EVT-003", "EVT-008", "SUCCESS-002"],
  "futureAgentInstructions": "Write only the designated findings artifact to chat-gpt-harvest, verify remote branch HEAD equals the new commit SHA, emit the publication receipt, and leave ingest/validation/canonical publication to Cursor/operator lanes."
}
```

```json
{
  "seedId": "IH-THREAD-GITHUB-WORKFLOW-SCOPE-PREFLIGHT-V1",
  "kind": "failure-pattern",
  "status": "CANDIDATE",
  "goldMineSignalClass": "OPERATOR_FRICTION_SIGNAL",
  "implementationState": "VERIFIED_FIXED",
  "novelty": "RESOLUTION_EVIDENCE",
  "workPackageId": "github-workflow-scope-harvest-restoration",
  "retrievalQuestions": [
    "Why did GitHub reject the restoration main push?",
    "What auth capability should be preflighted before changing GitHub Actions workflows?"
  ],
  "evidenceRefs": ["EVT-005", "EVT-006", "OUT-003"],
  "futureAgentInstructions": "Before a wave that adds or modifies .github/workflows files, verify the credential path can update workflows. Preserve atomic authority commits rather than splitting protocol and automation solely to bypass auth."
}
```

```json
{
  "seedId": "IH-THREAD-PLAN-SET-PROCESSING-SNAPSHOT-HANDOFF-V1",
  "kind": "lesson",
  "status": "CANDIDATE",
  "goldMineSignalClass": "SUCCESS_PATTERN",
  "implementationState": "IMPLEMENTED_IN_THREAD",
  "novelty": "RESOLUTION_EVIDENCE",
  "workPackageId": "plan-set-processing-handoff-bluebeam-ocr-v1",
  "retrievalQuestions": [
    "How should downstream Bluebeam/OCR/parser work identify one immutable plan-set processing graph?",
    "How is downstream filesystem rediscovery prevented?",
    "What M4P resilience proofs remain open?"
  ],
  "evidenceRefs": ["EVT-010", "HP-006", "HP-007", "OUT-004"],
  "futureAgentInstructions": "Treat processingSnapshotId as the reported immutable handoff identity; independently verify CapitalGlass-Documents authority before implementation decisions. Do not claim stale-worker or live partial-processing resilience closed without receipts."
}
```

---

## 18. Future-agent instructions

1. Start with `CapitalGlass-Cross-Agent/main` protocol authority, not remembered side-branch behavior.
2. For ChatGPT `DRAFT_FILE`, write one designated findings artifact to `chat-gpt-harvest`, commit, push, and remotely verify SHA.
3. Record `CHATGPT_SOURCE_PUBLISHED` only after the Git gate passes.
4. Treat Action/L/Cursor stages as separate evidence gates; do not infer them from Git publication success.
5. If Action/L proof is missing, look for a move receipt keyed by harvestId/source SHA before re-running or declaring failure.
6. Run digest-aware duplication checks against the prior M4P harvest before promoting M4P packets again.
7. Preserve Gold Mine signal class, implementation state, novelty, outcomes, product coverage, observability gaps, success patterns, and corpus bias in downstream canonicalization.
8. Keep all distinct improvement signals visible to Gold Mine; deduplicate true duplicates only.
9. For M4P follow-up, independently re-check `CapitalGlass-Documents` Git authority and worker receipts before choosing stale-recovery, partial-live, Bluebeam launch, or M5 work.

---

## 19. Publication truth table

| Layer | State at draft write |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | pending commit/push at artifact composition |
| `CHATGPT_HARVEST_GIT_GATE` | pending remote verification |
| L: draft staging (Action move) | `not-run-by-ChatGPT` |
| Cursor ingest | `not-run` |
| `harvest:validate` | `not-run` |
| L: Hub catalog (operator publish) | `not-run` |
| Z: AI cache | `not-run` |
| Supabase projection | `not-run` |
| Lane C export / Data-Extraction | `not-run` |
| Freshness gate | `not-run` |
| Automatic protocol mutation | `false` |

```text
Publication: NOT_RUN_BY_CURSOR
projection.hubPublishStatus: not-run
```

---

## 20. gitPublicationReceipt

The final `gitPublicationReceipt` is intentionally emitted in chat after the commit is created and remote branch HEAD is verified. Embedding the final commit SHA into the same commit would be self-referential. This section satisfies the artifact structure while preserving deterministic receipt truth.

```json
{
  "gitPublicationReceipt": {
    "gate": "CHATGPT_HARVEST_GIT_GATE",
    "verdict": "PENDING_AT_DRAFT_WRITE",
    "repo": "Capglass5708/CapitalGlass-Cross-Agent",
    "branch": "chat-gpt-harvest",
    "harvestId": "harvest-2026-08-07-chatgpt-harvest-v21-restoration-live-pilot-v1",
    "artifactPath": "artifacts/agent-runs/harvest-2026-08-07-chatgpt-harvest-v21-restoration-live-pilot-v1/chatgpt-findings-source.md",
    "localCommitSha": null,
    "remoteCommitSha": null,
    "remoteVerified": false
  }
}
```

---

## 21. Cursor handoff command

After ChatGPT emits `CHATGPT_SOURCE_PUBLISHED` with a verified remote SHA:

```bash
git fetch origin chat-gpt-harvest
git checkout chat-gpt-harvest
git pull --ff-only origin chat-gpt-harvest

npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-07-chatgpt-harvest-v21-restoration-live-pilot-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-07-chatgpt-harvest-v21-restoration-live-pilot-v1

npm run harvest:duplication-preflight -- \
  --harvest-id=harvest-2026-08-07-chatgpt-harvest-v21-restoration-live-pilot-v1

npm run harvest:sync-derived -- \
  harvest-2026-08-07-chatgpt-harvest-v21-restoration-live-pilot-v1

npm run harvest:validate -- \
  harvest-2026-08-07-chatgpt-harvest-v21-restoration-live-pilot-v1

npm run harvest:validate-autopsy -- \
  --harvest-id=harvest-2026-08-07-chatgpt-harvest-v21-restoration-live-pilot-v1

npm run test:harvest
```

Operator-only after validation:

```bash
npm run harvest:publish-intelligence-full -- \
  --harvest-id=harvest-2026-08-07-chatgpt-harvest-v21-restoration-live-pilot-v1
```
