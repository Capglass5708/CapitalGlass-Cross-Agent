# ChatGPT Findings Source — Control-Plane Terminal Closeout

harvestId: `harvest-2026-08-10-control-plane-terminal-closeout-v1`
protocol: `chat-thread-closeout-autopsy-harvest-chatgpt-v1 v2.1`
lane: `CHAT_CONTEXT_ONLY`
mode: `DRAFT_FILE`
targetTier: `T2`
startVerdict: `UNHARVESTED_THREAD`
closeoutTarget: `CHATGPT_SOURCE_PUBLISHED`

> Source boundary: this artifact compresses only the visible ChatGPT conversation and the attached harvest protocol. Any Git/code/test/runtime state described below is a thread-reported claim unless separately verified by Cursor/operator tooling. ChatGPT does not claim code, deploy, index, or `HARVEST_COMPLETE` authority.

## 1. Final summary + verdict

The thread records a control-plane milestone reported as merged to canonical `main` via PR `#316` at merge SHA `8d17efc6d`, plus a closed `ai-cache-runtime-fast-path-v1` lifecycle. The durable lesson is not another architecture redesign: it is the conversion of a merged implementation into an evidence-complete terminal closeout through canonical state, generated-artifact freshness, publication/index currentness, fresh regression proof, material-session admission proof, remote parity, and lifecycle receipts.

The conversation sharpened one important boundary: implementation durability and repository-wide terminal hygiene are separate states. A pre-existing PromptOps drift should not reopen completed control-plane engineering, but it cannot be ignored if the canonical closeout gate requires it to pass. The operator therefore requested a WaveRunner closeout mandate with broad tactical autonomy but narrow terminal scope.

Current ChatGPT verdict at artifact creation: `DRAFT_READY` pending mandatory Git publication verification. After successful remote verification, the chat response may advance to `CHATGPT_SOURCE_PUBLISHED`; it must not claim `HARVEST_COMPLETE`.

## 2. Harvest tier rationale

**Tier: T2.**

Rationale:
- The thread contains durable SDLC/control-plane architecture lessons, not merely a transient status update.
- It exposes a recurring distinction between implementation completion and terminal closeout proof.
- It produces a reusable WaveRunner closeout pattern with explicit stage gates and stop conditions.
- It contains both positive success patterns and unresolved observability/consistency issues suitable for Gold Mine classification.
- Product-workflow evidence is sparse; this is primarily an SDLC/governance thread.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN_AT_DRAFT_CREATION
sourceBranch: chat-gpt-harvest
sourceRepo: Capglass5708/CapitalGlass-Cross-Agent
```

No claim is made for `INDEX_HIT`, Hub publication, AI-cache publication, Supabase projection, or protocol operational status.

## 4. Thread event inventory

### EVT-001 — Control-plane merge reported
The user reported PR `#316` merged to `main` at `8d17efc6d`, containing the canonical milestone execution state-machine foundation plus repaired execution-context composition.

### EVT-002 — Canonical-vs-narrative execution authority clarified
The reported implementation restores `resolveCanonicalMilestoneLane()` against authoritative `lanes.milestone`, separates `resolveMilestoneNarrativeHint()` as non-authoritative context, and exposes `computeExecutionEligibility()` with execution permission/blocker outputs.

### EVT-003 — Material-session front door reported composed
The user reported `material-session-front-door.mjs` already composes `resolveExecutionContext()`, so canonical milestone gates now reach material prepare / operating prompt admission.

### EVT-004 — AI-cache fast path reported closed
The user reported `ai-cache-runtime-fast-path-v1` as `DURABLE_COMPLETE`, with cache-first short-circuit, operating-prompt memo, startup prewarm metadata, aggregate proof, and capability-find memo.

### EVT-005 — Regression suite reported green
The user reported PASS for five named suites: execution-context milestone composition, material-prepare control-plane integration, milestone execution state machine, AI-cache runtime fast path, and capability-find memo.

### EVT-006 — Closeout debt identified
The user reported `closeout:gate` still failing on pre-existing `suite-prompt-index.json` drift affecting document-center / proposal-generator SHAs.

### EVT-007 — Publication/index follow-up identified
The user identified `prompts:collect` and `platform-registry:pilot-index` as follow-up actions and noted a local WSL `git pull` timeout.

### EVT-008 — WaveRunner terminal-closeout mandate requested
The user explicitly requested a WaveRunner to take the merged state to closeout.

### EVT-009 — Closeout semantics tightened
The conversation distinguished actions from proof: running PromptOps collection or codeintel indexing is insufficient unless outputs are verified against current canonical Git authority.

### EVT-010 — Source-report inconsistency surfaced
The handoff states “All 6 commits” while the visible slice table enumerates slices 1 through 5. The conversation correctly treats this as something to resolve from Git ancestry rather than guessing.

## 5. Harvest packets

### HP-001 — Canonical milestone state must dominate narrative hints
```yaml
kind: architecture-success-pattern
goldMineSignalClass: SUCCESS_PATTERN
implementationState: IMPLEMENTED_IN_THREAD
novelty: RESOLUTION_EVIDENCE
evidenceRefs: [EVT-002, EVT-003]
```

Durable finding: execution admission should consume a derived canonical milestone projection, while narrative/multiwave hints remain informational. This prevents stale human-readable state from authorizing or blocking material execution.

### HP-002 — Implementation completion and terminal closeout are distinct
```yaml
kind: lesson
goldMineSignalClass: SUCCESS_PATTERN
implementationState: ADOPTED
novelty: NEW
evidenceRefs: [EVT-006, EVT-008, EVT-009]
```

A merged milestone may be legitimately `DURABLE_COMPLETE` at the implementation layer while repository-wide closeout still has generated-artifact, publication, index, parity, or receipt debt. The closeout runner should converge those surfaces without reopening completed architecture unless fresh evidence proves a regression.

### HP-003 — Generated-artifact drift is a closeout dependency, not necessarily milestone regression
```yaml
kind: failure-pattern
goldMineSignalClass: PROBLEM_SIGNAL
implementationState: OBSERVED_OPEN
novelty: KNOWN_EXISTING
evidenceRefs: [EVT-006]
resolutionTarget: regenerate PromptOps index through canonical producer and prove closeout gate
```

The PromptOps index drift is reported as pre-existing and unrelated to PR `#316`; nevertheless, if `closeout:gate` requires the index to be current, it remains a terminal-closeout dependency.

### HP-004 — Reindex commands require source-binding proof
```yaml
kind: lesson
goldMineSignalClass: RESOLUTION_SIGNAL
implementationState: IMPLEMENTED_IN_THREAD
novelty: NEW
evidenceRefs: [EVT-007, EVT-009]
```

A successful index command is not itself sufficient evidence. Closeout should prove the index/publication source SHA is current canonical `main`, that the new capability is discoverable, and that stale predecessors are not selected.

### HP-005 — Operator sync failures should not be confused with canonical regressions
```yaml
kind: operator-friction
goldMineSignalClass: OPERATOR_FRICTION_SIGNAL
implementationState: OBSERVED_OPEN
novelty: RECURRENCE
evidenceRefs: [EVT-007]
```

A local WSL `git pull` timeout is an operator/substrate symptom. The runner should re-establish canonical checkout parity using a safe isolated path if needed rather than treating local sync failure as evidence the merged architecture is absent.

### HP-006 — Closeout runner should own convergence, not architecture reinvention
```yaml
kind: operating-pattern
goldMineSignalClass: SUCCESS_PATTERN
implementationState: ADOPTED
novelty: NEW
evidenceRefs: [EVT-008, EVT-009]
```

The requested WaveRunner mission is intentionally scoped to evidence convergence: canonical ancestry, PromptOps repair, index/publication currentness, fresh regression proof, material preflight, cache-fast-path reproof, closeout gate, remote parity, and terminal receipts.

### HP-007 — Source handoff commit/slice count inconsistency needs ancestry evidence
```yaml
kind: observability-finding
goldMineSignalClass: OBSERVABILITY_GAP
implementationState: OBSERVED_OPEN
novelty: NEW
evidenceRefs: [EVT-010]
```

The thread contains a mismatch between “6 commits” and five listed slices. Closeout should query Git ancestry/commit history and report the actual composition instead of normalizing the prose by assumption.

## 6. Execution deltas

### ED-001 — Before vs after canonical execution admission
**Before:** execution context had reportedly regressed to legacy milestone-lane resolution and lacked exported canonical execution eligibility.

**After:** the thread reports restored canonical milestone lane selection, narrative hint separation, and exported execution eligibility consumed by material-session preparation.

### ED-002 — Before vs after cache fast path
**Before:** runtime retrieval/prompt preparation lacked the complete reported fast-path lifecycle package.

**After:** the thread reports cache short-circuit tiers, operating-prompt memo, prewarm metadata, aggregate proof, capability-find advisory memo, and lifecycle `DURABLE_COMPLETE`.

### ED-003 — Remaining delta to terminal closeout
**Current residual:** generated PromptOps drift, platform/codeintel refresh/currentness proof, final canonical regression reproof, material-session admission proof, repository closeout PASS, remote parity, and durable terminal receipts.

## 7. Observed improvement outcomes

### OUT-001 — Canonical milestone execution composition
```yaml
outcomeId: OUT-001
beforeState: "Execution context reportedly used legacy milestone lane resolution and lacked exported computeExecutionEligibility()."
afterState: "Thread reports canonical lanes.milestone authority, separate non-authoritative narrative hint, and computeExecutionEligibility() composed into material-session preparation."
measurableChange: "Five named regression/integration suites reported PASS, including execution-context and material-prepare composition."
proof: "Thread-reported PR #316 merge and test list; not independently verified by ChatGPT."
remainingResidual: "Fresh final-state reproof and repository-wide closeout still required."
improvementProven: false
```

`improvementProven` remains false in this artifact because ChatGPT did not independently execute repository tests; the thread reports the proof.

### OUT-002 — AI-cache runtime fast path lifecycle
```yaml
outcomeId: OUT-002
beforeState: "Fast-path capabilities were not represented as a closed lifecycle package in the visible handoff."
afterState: "Thread reports ai-cache-runtime-fast-path-v1 lifecycle index at DURABLE_COMPLETE."
measurableChange: "Five functional slices are listed; handoff text also claims six commits, creating a composition ambiguity."
proof: "Thread-reported lifecycle path and test PASS; not independently verified by ChatGPT."
remainingResidual: "Resolve actual commit count/ancestry and reprove on final closeout main."
improvementProven: false
```

### OUT-003 — Closeout mission quality
```yaml
outcomeId: OUT-003
beforeState: "Post-merge follow-up was described mainly as operator sync + optional prompt-index refresh."
afterState: "WaveRunner closeout mandate requires evidence-bound convergence through prompt/index currentness, regression reproof, preflight, closeout gate, parity, and receipts."
measurableChange: "Terminal definition upgraded from command execution to proof-backed FINAL_STATE=DURABLE_COMPLETE."
proof: "Visible WaveRunner mandate in this conversation."
remainingResidual: "Cursor/WaveRunner must execute and prove the gates."
improvementProven: true
```

## 8. Waste ledger

### TW-001 — Repeating merge status without terminal-state differentiation
The same PR `#316` handoff was pasted twice in the thread. The second pass was useful only because it tightened closeout semantics; future agents should avoid re-summarizing merged implementation when the actual decision is whether terminal gates are satisfied.

### TW-002 — Command-list closeout framing
Treating `prompts:collect`, `platform-registry:pilot-index`, or `git pull` as the closeout itself risks false confidence. Each command should emit or be followed by authoritative proof tied to current canonical source identity.

## 9. Duplication detector

### DUP-001
```yaml
status: NEEDS_REGISTRY_LOOKUP_FIRST
subject: canonical milestone execution-state control-plane work
threadEvidence: "PR #316 and canonical-milestone-execution-state-machine-v1 are repeatedly described as already merged/landed."
dedupInstruction: "Use workPackageId/commit ancestry/content digests; do not create a new implementation candidate merely because closeout debt remains."
```

### DUP-002
```yaml
status: NEEDS_REGISTRY_LOOKUP_FIRST
subject: ai-cache-runtime-fast-path-v1
threadEvidence: "Lifecycle is reported DURABLE_COMPLETE."
dedupInstruction: "Treat new findings as regression evidence only if current-main proof fails; otherwise keep closeout debt separate."
```

## 10. Operator friction

### OF-001 — WSL pull timeout
```yaml
goldMineSignalClass: OPERATOR_FRICTION_SIGNAL
novelty: RECURRENCE
implementationState: OBSERVED_OPEN
impact: "Local operator checkout may lag canonical remote and delay closeout proof."
preferredResponse: "Use safe sync/recovery or isolated worktree; do not rewrite unrelated dirty state."
```

### OF-002 — Ambiguous “optional” closeout language
```yaml
goldMineSignalClass: AGENT_FRICTION_SIGNAL
novelty: NEW
implementationState: IMPLEMENTED_IN_THREAD
impact: "An agent may prematurely declare completion while a required repository closeout gate is red."
preferredResponse: "Classify whether the failing gate is in the terminal contract; if yes, repair/prove it even when the drift predates the milestone."
```

## 11. Observability gaps

### OG-001 — Commit-count ambiguity
```yaml
observabilityGapId: OG-001
whatWeNeededToKnow: "Exact commit composition of ai-cache-runtime-fast-path-v1."
whyItWasNotObservable: "Thread says 'All 6 commits' but visibly enumerates only five slices."
workflow: "Milestone handoff / terminal closeout"
missingMetricOrReceipt: "Git ancestry / ordered commit receipt for the lifecycle package"
recommendedInstrumentation: "Include machine-generated commitCount and commitShas[] in lifecycle/closeout receipt."
goldMineSignalClass: OBSERVABILITY_GAP
```

### OG-002 — Index-currentness proof
```yaml
observabilityGapId: OG-002
whatWeNeededToKnow: "Whether platform/codeintel publication is actually bound to the final canonical main SHA."
whyItWasNotObservable: "The thread provides a reindex command but no resulting source-SHA receipt."
workflow: "Post-merge publication / closeout admission"
missingMetricOrReceipt: "publication sourceCommitSha + currentness verdict + discovery proof"
recommendedInstrumentation: "Have platform-registry:pilot-index emit a canonical source binding receipt consumable by closeout:gate."
goldMineSignalClass: OBSERVABILITY_GAP
```

### OG-003 — Self-referential Git receipt placement in ChatGPT harvest protocol
```yaml
observabilityGapId: OG-003
whatWeNeededToKnow: "How to embed the final branch-head commit SHA inside the same committed findings file that produces that SHA."
whyItWasNotObservable: "A commit SHA depends on the committed tree/content; embedding its own final SHA creates a self-reference problem for single-commit publication."
workflow: "CHATGPT_HARVEST_GIT_GATE"
missingMetricOrReceipt: "Protocol clarification whether gitPublicationReceipt is chat-only, sidecar, or may reference the initial artifact commit while branch head advances."
recommendedInstrumentation: "Define the mandatory SHA receipt as an out-of-band chat/connector receipt, or permit a deterministic sidecar receipt not included in the gated artifact commit."
goldMineSignalClass: OBSERVABILITY_GAP
```

## 12. Success patterns

### SUCCESS-001 — Canonical projection before execution
`goldMineSignalClass: SUCCESS_PATTERN`

The architecture pattern “authoritative evidence → derived canonical milestone projection → execution context → material front door” reduces ambiguity and gives one machine-consumable place for execution eligibility.

### SUCCESS-002 — Narrative kept useful but non-authoritative
`goldMineSignalClass: SUCCESS_PATTERN`

Preserving milestone narrative as a hint instead of deleting it retains operator/agent context without allowing stale prose to override canonical execution state.

### SUCCESS-003 — Closeout runner granted bounded autonomy
`goldMineSignalClass: SUCCESS_PATTERN`

The WaveRunner mandate gives broad authority to investigate and repair within a narrow terminal mission, minimizing operator micromanagement while retaining explicit stop conditions and governance boundaries.

### SUCCESS-004 — Completed implementation is not reopened casually
`goldMineSignalClass: SUCCESS_PATTERN`

The thread consistently protects completed architecture from being downgraded due to unrelated pre-existing repository debt, while still requiring truthful repository-level closeout.

## 13. ROI backlog

### ROI-001 — Machine-generated terminal closeout receipt
```yaml
rank: 1
operatorValue: "Removes ambiguity over whether merged work is actually terminally closed."
businessValue: "Reduces engineering/operator time spent re-litigating completed milestones."
platformValue: "Provides a single durable proof bundle for Git, tests, preflight, publication, parity, and lifecycle state."
agentValue: "Allows future agents to consume closeout state instead of reconstructing it from chat narrative."
reliabilityValue: HIGH
automationLeverage: HIGH
estimatedComplexity: MEDIUM
blastRadius: MEDIUM
confidence: HIGH
evidenceDiversity: "Thread events + reported gate/test/publication surfaces"
rootCauseLeverage: HIGH
goldMineSignalClass: BUSINESS_WORKFLOW_SIGNAL
novelty: NEW
businessImpact: OPERATIONAL_EFFICIENCY
```

### ROI-002 — Publication currentness as a first-class closeout gate
```yaml
rank: 2
operatorValue: "Eliminates manual interpretation of whether a reindex command was enough."
businessValue: "Faster reliable agent startup and less stale-capability routing."
platformValue: "Binds codeintel/platform publication to canonical Git identity."
agentValue: "Prevents agents from consuming stale predecessor capabilities."
reliabilityValue: HIGH
automationLeverage: HIGH
estimatedComplexity: MEDIUM
blastRadius: LOW_TO_MEDIUM
confidence: HIGH
evidenceDiversity: "EVT-007, EVT-009, OG-002"
rootCauseLeverage: HIGH
goldMineSignalClass: RESOLUTION_SIGNAL
novelty: NEW
businessImpact: RELIABILITY
```

### ROI-003 — Lifecycle receipts include ordered commit identity
```yaml
rank: 3
operatorValue: "Makes handoff composition auditable without reading prose tables."
businessValue: "Reduces closeout review friction."
platformValue: "Improves milestone reproducibility and ancestry checks."
agentValue: "Removes ambiguity like the 6-commits / 5-slices mismatch."
reliabilityValue: MEDIUM
automationLeverage: MEDIUM
estimatedComplexity: LOW
blastRadius: LOW
confidence: HIGH
evidenceDiversity: "EVT-010, OG-001"
rootCauseLeverage: MEDIUM
goldMineSignalClass: OBSERVABILITY_GAP
novelty: NEW
businessImpact: OPERATIONAL_EFFICIENCY
```

### ROI-004 — Safe operator sync fallback encoded in WaveRunner
```yaml
rank: 4
operatorValue: "Avoids manual recovery when local WSL checkout cannot pull cleanly."
businessValue: "Reduces closeout delay."
platformValue: "Separates environment/substrate incidents from canonical repository truth."
agentValue: "Enables deterministic isolated-worktree recovery."
reliabilityValue: MEDIUM
automationLeverage: MEDIUM
estimatedComplexity: LOW_TO_MEDIUM
blastRadius: LOW
confidence: MEDIUM
evidenceDiversity: "Single thread-reported WSL timeout plus closeout pattern"
rootCauseLeverage: MEDIUM
goldMineSignalClass: OPERATOR_FRICTION_SIGNAL
novelty: RECURRENCE
businessImpact: OPERATIONAL_EFFICIENCY
```

## 14. Product-workflow coverage

| Surface | Coverage | Evidence note |
| --- | --- | --- |
| Computer Estimator | NOT_OBSERVED | No estimator product workflow discussed in this thread. |
| Human Estimator | NOT_OBSERVED | No HE workflow discussed. |
| Document Center | OBSERVED | Only as a reported PromptOps SHA-drift reference; no product behavior investigated. |
| plan-set processing | NOT_OBSERVED | No plan-set processing evidence. |
| OCR/parser | NOT_OBSERVED | No parser behavior discussed. |
| Revu/Bluebeam | NOT_OBSERVED | No Revu behavior discussed. |
| Bid Composer | NOT_OBSERVED | No Bid Composer product behavior discussed. |
| proposals | NOT_OBSERVED | No proposal workflow behavior discussed. |
| VAE | NOT_OBSERVED | No VAE workflow discussed. |
| Scraper | NOT_OBSERVED | No Scraper workflow discussed. |
| cross-app handoffs | OBSERVED | Control-plane execution context → material-session front door is a platform handoff, not a business-product handoff. |
| operator re-entry | OBSERVED | Operator requested explicit WaveRunner closeout after merge handoff. |
| manual intervention | OBSERVED | Local git sync and prompt/index follow-up were initially framed as manual commands. |

## 15. Corpus bias note

`corpusBiasNote: "Thread evidence is heavily SDLC/control-plane/governance oriented; product workflows and business outcomes are under-observed."`

`underObservedDomains: [Computer Estimator, Human Estimator, plan-set processing, OCR/parser, Revu/Bluebeam, Bid Composer, proposals, VAE, Scraper]`

Zero or few open product candidates from this thread must not be interpreted as estate-wide product optimization.

## 16. Do-not-advance guards

1. Do not claim PR `#316`, tests, lifecycle state, closeout gate, index state, or remote parity are independently verified by ChatGPT; they are thread-reported unless Cursor reproofs them.
2. Do not reopen `canonical-milestone-execution-state-machine-v1` or `ai-cache-runtime-fast-path-v1` merely because repository-wide closeout debt remains.
3. Do not suppress the PromptOps drift because it predates PR `#316` if the canonical closeout contract requires it to pass.
4. Do not treat narrative/multiwave hints as execution authority over canonical milestone state.
5. Do not treat successful execution of `prompts:collect` or `platform-registry:pilot-index` as sufficient without source-binding/currentness evidence.
6. Do not resolve the “6 commits / 5 slices” mismatch by prose assumption; verify ancestry.
7. Do not claim `HARVEST_COMPLETE`, `OPERATIONAL`, `FULLY_SEEDED`, or `INDEX_HIT` from ChatGPT.
8. Do not merge this harvest artifact directly to `main`; Cursor owns ingest/validation/canonicalization.

## 17. Seed packet candidates

```json
{
  "seedId": "IH-THREAD-CONTROL-PLANE-CLOSEOUT-SEPARATE-IMPLEMENTATION-FROM-TERMINAL-HYGIENE",
  "kind": "lesson",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How should WaveRunner handle a milestone whose implementation is durable but repository closeout has unrelated drift?",
    "Should pre-existing generated-artifact drift reopen a completed implementation milestone?"
  ],
  "evidenceRefs": ["HP-002", "HP-003", "SUCCESS-004"],
  "futureAgentInstructions": "Preserve implementation completion unless fresh regression evidence exists; separately converge every gate required by the terminal closeout contract."
}
```

```json
{
  "seedId": "IH-THREAD-CANONICAL-MILESTONE-AUTHORITY-OVER-NARRATIVE-HINTS",
  "kind": "lesson",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "What milestone state should control execution eligibility?",
    "Can multiwave or narrative milestone hints override canonical milestone state?"
  ],
  "evidenceRefs": ["HP-001", "SUCCESS-001", "SUCCESS-002"],
  "futureAgentInstructions": "Use canonical milestone projection for execution authority; retain narrative only as non-authoritative context."
}
```

```json
{
  "seedId": "IH-THREAD-PUBLICATION-CURRENTNESS-REQUIRES-SOURCE-SHA-PROOF",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "What proves platform/codeintel reindexing is current after a merge?",
    "Is a successful index command enough for closeout?"
  ],
  "evidenceRefs": ["HP-004", "OG-002", "ROI-002"],
  "futureAgentInstructions": "Require publication receipts to expose canonical sourceCommitSha/currentness and prove capability discovery against current main."
}
```

```json
{
  "seedId": "IH-THREAD-HARVEST-RECEIPT-SELF-REFERENCE-CLARIFICATION",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Where should CHATGPT_HARVEST_GIT_GATE SHA receipts be recorded?",
    "Can the final commit SHA be embedded inside the exact committed artifact that determines that SHA?"
  ],
  "evidenceRefs": ["OG-003"],
  "futureAgentInstructions": "Clarify receipt placement to avoid self-referential commit identity; prefer an out-of-band verified chat/connector receipt or explicit sidecar contract."
}
```

## 18. Future-agent instructions

- Start from canonical current `origin/main`; verify PR `#316` is an ancestor if `main` has advanced.
- Treat canonical milestone state as execution authority and narrative hints as advisory only.
- Classify every closeout failure before repairing it.
- Regenerate derived artifacts through their producing systems; do not hand-edit generated SHA fields unless the generator is defective.
- Bind platform/codeintel/PI currentness to final canonical source SHA.
- Re-run the relevant control-plane regression suite on the final candidate state; historical PASS is not enough for terminal closeout.
- Exercise material-session admission to prove canonical milestone gating reaches the front door.
- Reprove `ai-cache-runtime-fast-path-v1` only for regression protection; do not reopen it for unrelated debt.
- Require `closeout:gate`, governed-clean, remote parity, and lifecycle receipts before declaring terminal completion.
- Resolve source inconsistencies through Git/runtime evidence, not narrative normalization.

## 19. Publication truth table

| Layer | State (ChatGPT closeout) |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | `pending-gate-verification-at-artifact-write` |
| `CHATGPT_HARVEST_GIT_GATE` | `pending-gate-verification-at-artifact-write` |
| L: draft staging (Action move) | `not-run` |
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

## 20. gitPublicationReceipt

The mandatory verified SHA receipt is emitted by ChatGPT in the closeout response after GitHub remote verification. It is not self-embedded with its own final commit SHA here because the commit SHA is a function of the committed content/tree; see `OG-003` protocol-upgrade candidate.

Expected receipt fields:

```json
{
  "gitPublicationReceipt": {
    "gate": "CHATGPT_HARVEST_GIT_GATE",
    "verdict": "PENDING_AT_ARTIFACT_WRITE",
    "repo": "Capglass5708/CapitalGlass-Cross-Agent",
    "branch": "chat-gpt-harvest",
    "harvestId": "harvest-2026-08-10-control-plane-terminal-closeout-v1",
    "artifactPath": "artifacts/agent-runs/harvest-2026-08-10-control-plane-terminal-closeout-v1/chatgpt-findings-source.md",
    "localCommitSha": "EMIT_AFTER_PUSH",
    "remoteCommitSha": "EMIT_AFTER_REMOTE_VERIFICATION",
    "remoteVerified": false
  }
}
```

## 21. Cursor handoff command

After ChatGPT reports `CHATGPT_SOURCE_PUBLISHED` and a verified commit SHA:

```text
Ingest ChatGPT thread autopsy findings per chat-thread-closeout-autopsy-harvest-chatgpt-v1 v2.1.

git fetch origin chat-gpt-harvest && git checkout chat-gpt-harvest && git pull --ff-only origin chat-gpt-harvest

npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-10-control-plane-terminal-closeout-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-10-control-plane-terminal-closeout-v1

npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-10-control-plane-terminal-closeout-v1
npm run harvest:sync-derived -- harvest-2026-08-10-control-plane-terminal-closeout-v1
npm run harvest:validate -- harvest-2026-08-10-control-plane-terminal-closeout-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-10-control-plane-terminal-closeout-v1
npm run test:harvest
# operator:
npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-10-control-plane-terminal-closeout-v1
```

Cursor/operator remain responsible for validation, canonical `main` promotion, Z/L publication, index/cache publication, freshness proof, and any final `HARVEST_COMPLETE` claim.
