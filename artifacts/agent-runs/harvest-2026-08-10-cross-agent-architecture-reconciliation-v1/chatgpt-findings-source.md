# ChatGPT Findings Source — Cross-Agent Architecture Reconciliation

- harvestId: `harvest-2026-08-10-cross-agent-architecture-reconciliation-v1`
- mission: `chat-thread-closeout-autopsy-harvest-chatgpt-v1`
- protocol: `v2.1`
- lane: `CHAT_CONTEXT_ONLY`
- tier: `T2`
- verdict: `DRAFT_READY`
- targetVerdict: `CHATGPT_SOURCE_PUBLISHED`
- sourceRepo: `Capglass5708/CapitalGlass-Cross-Agent`
- sourceBranch: `chat-gpt-harvest`
- sourceCommitSha: `PENDING_POST_COMMIT`
- canonicalArchitectureAuthority: `CapitalGlass-Cross-Agent/origin/main`

## 1. Final summary + verdict

This thread established two durable architecture rules for the current Cross-Agent estate.

First, the recent Cross-Agent expansion is substantially operating on `main`, but architecture completeness must be proven semantically rather than inferred from PR counts. Open historical PRs can be fully superseded, partially absorbed, obsolete, evidence-only, or still contain required deltas. The correct closeout path is a WaveRunner reconciliation that classifies every architecture-bearing PR and migrates only the still-required invariants into current `main`.

Second, `chat-gpt-harvest` is an evidence-staging lane, not an architectural authority branch. A valid ChatGPT source artifact may live on a staging branch that is intentionally divergent from current `main`; Cursor must ingest the designated artifact against current canonical `main` and must not merge the staging branch history merely to consume the evidence.

The thread also captured the corrective receipt-durability pattern: preserve the immutable content publication SHA as `sourceCommitSha` / `initialPublicationCommitSha`, while a later corrective commit may advance the staging branch HEAD to backfill durable receipt fields. The final branch HEAD is reported externally in the Git gate receipt rather than self-referenced inside the same commit.

Current ChatGPT verdict before Git gate: `DRAFT_READY`.

## 2. Harvest tier rationale

`T2` is appropriate because the thread contains reusable cross-repository operating architecture lessons, a new reconciliation milestone definition, a validated staging-vs-canonical authority rule, and a receipt-durability pattern likely to recur across future ChatGPT harvests. It is broader than a one-off operator note but does not claim canonical implementation or harvest completion.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: PENDING_POST_COMMIT
```

User-reported `INDEX_HIT` / L: state from Cursor is preserved only as thread evidence; ChatGPT does not independently claim index or cache state in this run.

## 4. Thread event inventory

### EVT-001 — Cross-Agent architecture completeness questioned

The user asked whether all recent Cross-Agent architecture expansion had been pushed and implemented into operating `main`.

Evidence in thread: live GitHub inspection showed major recent expansion merged to `main`, including hot-cache/query routing, Active Ledger + Closeout Index, Harvest v2.1 / Gold Mine, protocol self-learning, publication hardening, Experience Graph, and active-ledger currentness.

### EVT-002 — Residual architecture ambiguity identified

The audit found that not every historical architecture branch was conclusively absorbed. PR #6 (`feat(harvest): medium-critical risk remediation v1`) remained open and contained multiple historical risk-remediation capabilities. Some of those capabilities, such as Git-retention enforcement, were already present on current `main`; other named modules were not found there. The correct conclusion was `CROSS_AGENT_CORE_EXPANSION=OPERATING_ON_MAIN` with residual architecture reconciliation required rather than a false 100% claim.

### EVT-003 — Full architecture reconciliation WaveRunner created

A WaveRunner was drafted with terminal goal `CROSS_AGENT_ARCHITECTURE_AUTHORITY=origin/main`, `UNMERGED_REQUIRED_ARCHITECTURE=0`, and `AMBIGUOUS_ARCHITECTURE_AUTHORITY=0`. It requires semantic PR classification rather than bulk merging and explicitly provides dispositions including `ALREADY_SUPERSEDED`, `PARTIALLY_ABSORBED` via reimplementation/cherry-pick, `OBSOLETE`, `EVIDENCE_ONLY`, and active product work.

### EVT-004 — Prior ChatGPT harvest receipt durability corrected

The user reported a corrective backfill on remote `chat-gpt-harvest` for the prior control-plane harvest. The initial content publication SHA remained `a59f7d7693619bcbca292878e0c4c18f1d5face2`; corrective branch HEAD became `23e2037842215945b141c321b8c3616271eac03c`; the Git artifact carried `CHATGPT_SOURCE_PUBLISHED` and a PASS receipt with `remoteVerified: true`.

### EVT-005 — Branch divergence proven honestly

The user reported that `chat-gpt-harvest` was divergent from current Cross-Agent `main`: merge-base `402352f4…`, 56 behind / 92 ahead, and did not contain the recent main expansion. This established that valid evidence publication does not imply staging-branch currentness with main.

### EVT-006 — Ingest boundary clarified

The thread established that Cursor should ingest the single designated ChatGPT evidence artifact against current `main`, not merge or rebase the long-lived `chat-gpt-harvest` history into `main`.

### EVT-007 — Sequencing decision

The user began the Cross-Agent reconciliation WaveRunner and deferred Cursor ingest of the prior control-plane ChatGPT harvest until the reconciliation completes. The intended next authority for ingest is whatever canonical `main` emerges from that WaveRunner.

### EVT-008 — Current harvest invoked

The user invoked this v2.1 protocol with `RUN FILE`.

## 5. Harvest packets

### HP-001 — Single architectural authority requires semantic reconciliation

- kind: `authority-pattern`
- goldMineSignalClass: `SUCCESS_PATTERN`
- implementationState: `IMPLEMENTED_IN_THREAD`
- novelty: `NEW`
- finding: Cross-Agent architecture completeness should be measured by whether every still-required capability is available from current `main`, not by whether every historical PR was merged or closed.
- future use: architecture closeout should classify branch deltas semantically and migrate only missing invariants.

### HP-002 — Open PR does not equal missing architecture

- kind: `failure-pattern`
- goldMineSignalClass: `AGENT_FRICTION_SIGNAL`
- implementationState: `OBSERVED_OPEN`
- novelty: `NEW`
- finding: An older open PR can be partially or fully superseded by later architecture without commit ancestry. Treating open PR count as architecture debt creates false positives and encourages unsafe bulk merges.

### HP-003 — `chat-gpt-harvest` is evidence staging, never canonical architecture

- kind: `authority-pattern`
- goldMineSignalClass: `SUCCESS_PATTERN`
- implementationState: `VERIFIED_FIXED`
- novelty: `RESOLUTION_EVIDENCE`
- finding: A divergent `chat-gpt-harvest` branch can still carry valid ChatGPT source evidence. Canonical architecture remains `origin/main`; Cursor should ingest the source artifact without importing unrelated staging history.
- resolvesRootCauseId: `chatgpt-staging-equals-main-assumption-v1`

### HP-004 — Receipt durability needs content SHA / branch-HEAD separation

- kind: `protocol-upgrade`
- goldMineSignalClass: `RESOLUTION_SIGNAL`
- implementationState: `VERIFIED_FIXED`
- novelty: `RESOLUTION_EVIDENCE`
- finding: Because a commit cannot contain its own final SHA, durable harvest receipts should distinguish immutable content provenance (`sourceCommitSha` / `initialPublicationCommitSha`) from the later corrective receipt HEAD. The final remote HEAD is verified externally by the Git gate.
- resolvesRootCauseId: `harvest-receipt-self-reference-v1`

### HP-005 — Architecture reconciliation should precede dependent ingest

- kind: `sequencing-pattern`
- goldMineSignalClass: `SUCCESS_PATTERN`
- implementationState: `ADOPTED`
- novelty: `NEW`
- finding: When the canonical architecture is actively being reconciled, finish that convergence first, then ingest staged evidence against the resulting authority. This avoids validating/publishing through a moving architecture baseline.

## 6. Execution deltas

### ED-001

- before: “major recent expansion appears merged”
- after: “major expansion is operating on `main`, but residual architecture PRs require semantic disposition before a 100% claim”
- effect: replaced binary PR-state reasoning with capability-level reconciliation.

### ED-002

- before: prior ChatGPT source artifact had durable content but incomplete in-artifact receipt/currentness metadata.
- after: corrective backfill reported `CHATGPT_SOURCE_PUBLISHED`, PASS Git gate, immutable content SHA, corrective remote HEAD, and explicit branch divergence.
- effect: publication truth became durable without corrupting content provenance.

### ED-003

- before: Cursor ingest of the prior ChatGPT harvest was ready to run immediately.
- after: ingest was intentionally deferred until the Cross-Agent reconciliation WaveRunner finishes.
- effect: downstream validation will bind to the post-reconciliation canonical architecture rather than a baseline in motion.

## 7. Observed improvement outcomes

### OUT-001 — Prior ChatGPT receipt durability repaired

- beforeState: prior source publication lacked fully durable in-artifact backfill aligned with the newer Cross-Agent receipt expectation.
- afterState: user reported corrective commit `23e2037842215945b141c321b8c3616271eac03c` on remote `chat-gpt-harvest`, with the source artifact carrying `CHATGPT_SOURCE_PUBLISHED`, `CHATGPT_HARVEST_GIT_GATE=PASS`, and `remoteVerified: true`.
- measurableChange: receipt state moved from incomplete durability metadata to explicit published/verified state while preserving original content SHA `a59f7d7693619bcbca292878e0c4c18f1d5face2`.
- proof: user-supplied remote parity and SHA report in this thread.
- remainingResidual: Cursor ingest/validation/publication for that prior harvest remains intentionally pending.
- improvementProven: true

### OUT-002 — Architecture reconciliation mission made executable

- beforeState: residual architecture ambiguity existed across open Cross-Agent PRs.
- afterState: a stage-gated WaveRunner was created to inventory every open PR, reconcile PR #6 specially, migrate only still-required deltas, close stale authority, test the full architecture, and terminate only when `origin/main` is self-contained.
- measurableChange: ambiguity converted into a deterministic reconciliation contract with explicit dispositions and stop conditions.
- proof: WaveRunner prompt created in this thread.
- remainingResidual: WaveRunner execution is currently in progress; terminal architecture result has not yet been reported.
- improvementProven: false

## 8. Waste ledger

### TW-001 — Binary “all merged?” framing

Treating repository completeness as a yes/no question over open PRs required a deeper audit because historical PR state did not map directly to current capability state.

### TW-002 — Receipt self-reference correction cycle

The prior source needed a second corrective commit to embed its immutable content SHA and durable gate state. This is logically necessary under the current format but should be made explicit and standardized so it is not rediscovered per harvest.

### TW-003 — Potential mixed-mission execution

Running Cursor ingest while the architecture reconciliation WaveRunner is modifying canonical Cross-Agent architecture would couple two separate missions and make closeout evidence harder to interpret. The user correctly deferred ingest.

## 9. Duplication detector

### DUP-001

- target: `harvest-2026-08-10-control-plane-terminal-closeout-v1`
- classification: `KNOWN_EXISTING`
- action: do not re-harvest its control-plane implementation/closeout evidence here; this harvest only records the staging-receipt and sequencing lessons that followed.
- disposition: `NEEDS_REGISTRY_LOOKUP_FIRST` before canonical ingest.

### DUP-002

- target: recent active-ledger / harvest-expansion harvest associated in-thread with commit `420910d3…`
- classification: `KNOWN_EXISTING`
- action: reference its ledger/currentness work rather than duplicating it as a new canonical packet.
- disposition: `NEEDS_REGISTRY_LOOKUP_FIRST`.

### DUP-003

- target: historical `harvest-git-durability-v1-2-context` packet referenced during the architecture audit
- classification: `KNOWN_EXISTING`
- action: current thread contributes resolution evidence and a concrete ChatGPT staging example; deduplicate against the canonical packet during Cursor ingest.
- disposition: `NEEDS_REGISTRY_LOOKUP_FIRST`.

## 10. Operator friction

### OF-001 — Staging branch currentness ambiguity

- goldMineSignalClass: `OPERATOR_FRICTION_SIGNAL`
- novelty: `NEW`
- implementationState: `VERIFIED_FIXED`
- friction: “published on Git” could be misread as “based on current main.” The explicit behind/ahead proof was needed to disambiguate evidence validity from branch currentness.

### OF-002 — Two-SHA receipt semantics are not obvious

- goldMineSignalClass: `OPERATOR_FRICTION_SIGNAL`
- novelty: `RECURRENCE`
- implementationState: `PARTIAL`
- friction: users/agents must distinguish content commit SHA from corrective receipt HEAD to avoid impossible self-reference expectations.

### OF-003 — Parallel closeout missions require manual sequencing awareness

- goldMineSignalClass: `OPERATOR_FRICTION_SIGNAL`
- novelty: `NEW`
- implementationState: `ADOPTED`
- friction: the operator had to remember to return to the pending harvest ingest after the architecture WaveRunner completes.

## 11. Observability gaps

### OG-001 — Git gate did not originally surface branch relationship to main

- whatWeNeededToKnow: whether `chat-gpt-harvest` was based on current canonical `main`.
- whyItWasNotObservable: the publication receipt focused on artifact commit/push parity, not merge-base or behind/ahead state.
- workflow: ChatGPT harvest Git publication.
- missingMetricOrReceipt: `mainMergeBase`, `behindMain`, `aheadMain`, `containsCurrentMainExpansion`.
- recommendedInstrumentation: add advisory staging-branch ancestry/currentness fields to the Git publication receipt without making currentness a validity requirement for source evidence.
- goldMineSignalClass: `OBSERVABILITY_GAP`

### OG-002 — No single semantic architecture-debt view

- whatWeNeededToKnow: which open Cross-Agent PRs still contain required architecture versus superseded/obsolete/evidence-only work.
- whyItWasNotObservable: PR open/closed status is structural, not semantic.
- workflow: Cross-Agent architecture closeout.
- missingMetricOrReceipt: per-PR capability disposition registry with superseding main authority.
- recommendedInstrumentation: create/maintain `cross-agent-architecture-currentness-v1` receipt or equivalent generated view.
- goldMineSignalClass: `OBSERVABILITY_GAP`

### OG-003 — Receipt commit self-reference cannot be embedded directly

- whatWeNeededToKnow: both immutable source content commit and final remote branch HEAD after receipt backfill.
- whyItWasNotObservable: a Git commit cannot contain its own SHA; writing a final SHA changes the commit.
- workflow: ChatGPT harvest Git publication.
- missingMetricOrReceipt: explicit dual identity fields separating content provenance from external gate-head verification.
- recommendedInstrumentation: standardize `sourceContentCommitSha` / `initialPublicationCommitSha` plus externally emitted `publicationReceiptHeadSha`.
- goldMineSignalClass: `OBSERVABILITY_GAP`

## 12. Success patterns

### SUCCESS_PATTERN-001 — Semantic reconciliation over bulk merge

Historical branch content was evaluated by capability/invariant instead of blindly merged. This protects modern architecture from stale implementations while preserving still-useful deltas.

### SUCCESS_PATTERN-002 — Evidence staging separated from architectural authority

The explicit rule “ingest the artifact; do not merge the staging branch” prevents 92 ahead commits of unrelated staging history from becoming accidental architecture authority.

### SUCCESS_PATTERN-003 — Corrective backfill preserved immutable provenance

The user preserved the original content SHA while advancing the branch with a corrective receipt commit, avoiding provenance rewriting.

### SUCCESS_PATTERN-004 — Mission sequencing reduced moving-baseline risk

The user chose to finish the architecture reconciliation WaveRunner before running dependent Cursor ingest, keeping closeout scopes separate.

## 13. ROI backlog

### ROI-001 — Architecture PR disposition/currentness registry

- rank: 1
- operatorValue: reduces repeated manual PR archaeology and “is all of this on main?” investigations.
- businessValue: indirect; lowers platform maintenance friction.
- platformValue: high; creates one machine-readable view of residual architecture debt.
- agentValue: high; prevents open-PR-count false positives and unsafe merges.
- reliabilityValue: high.
- automationLeverage: high.
- estimatedComplexity: `UNKNOWN`
- blastRadius: `MEDIUM`
- confidence: `HIGH`
- evidenceDiversity: thread audit + open-PR ambiguity + WaveRunner design.
- rootCauseLeverage: high.
- goldMineSignalClass: `BUSINESS_WORKFLOW_SIGNAL`
- novelty: `NEW`
- businessImpact: `PLATFORM_RELIABILITY`

### ROI-002 — Advisory staging-branch ancestry/currentness in ChatGPT Git gate

- rank: 2
- operatorValue: immediately shows whether evidence branch is current, behind, ahead, or diverged from `main`.
- businessValue: indirect.
- platformValue: high.
- agentValue: high.
- reliabilityValue: high.
- automationLeverage: medium.
- estimatedComplexity: `UNKNOWN`
- blastRadius: `LOW`
- confidence: `HIGH`
- evidenceDiversity: prior corrective backfill + current thread branch-divergence proof.
- rootCauseLeverage: medium-high.
- goldMineSignalClass: `OBSERVABILITY_GAP`
- novelty: `NEW`
- businessImpact: `PLATFORM_RELIABILITY`

### ROI-003 — Standard dual-SHA receipt schema

- rank: 3
- operatorValue: removes recurring confusion about content SHA versus corrective HEAD.
- businessValue: indirect.
- platformValue: medium-high.
- agentValue: high.
- reliabilityValue: high.
- automationLeverage: medium.
- estimatedComplexity: `UNKNOWN`
- blastRadius: `LOW`
- confidence: `HIGH`
- evidenceDiversity: self-reference correction + current protocol gate behavior.
- rootCauseLeverage: high.
- goldMineSignalClass: `RESOLUTION_SIGNAL`
- novelty: `RECURRENCE`
- businessImpact: `PLATFORM_RELIABILITY`

### ROI-004 — Artifact-only ingest helper for divergent staging branches

- rank: 4
- operatorValue: makes it explicit that ingest consumes one designated source artifact, not branch history.
- businessValue: indirect.
- platformValue: medium.
- agentValue: medium-high.
- reliabilityValue: medium-high.
- automationLeverage: medium.
- estimatedComplexity: `UNKNOWN`
- blastRadius: `LOW`
- confidence: `MEDIUM`
- evidenceDiversity: current staging divergence and ingest sequencing discussion.
- rootCauseLeverage: medium.
- goldMineSignalClass: `AGENT_FRICTION_SIGNAL`
- novelty: `NEW`
- businessImpact: `PLATFORM_RELIABILITY`

### ROI-005 — Post-reconciliation stale-PR closure automation

- rank: 5
- operatorValue: reduces manual cleanup after semantic reconciliation.
- businessValue: indirect.
- platformValue: medium.
- agentValue: medium.
- reliabilityValue: medium.
- automationLeverage: medium-high.
- estimatedComplexity: `UNKNOWN`
- blastRadius: `MEDIUM`
- confidence: `MEDIUM`
- evidenceDiversity: open-PR audit + WaveRunner terminal design.
- rootCauseLeverage: medium.
- goldMineSignalClass: `SUCCESS_PATTERN`
- novelty: `NEW`
- businessImpact: `PLATFORM_MAINTAINABILITY`

## 14. Product-workflow coverage

| Surface | Coverage | Evidence in this thread |
| --- | --- | --- |
| Computer Estimator | NOT_OBSERVED | No estimator workflow execution examined. |
| Human Estimator | NOT_OBSERVED | No Human Estimator execution examined. |
| Document Center | NOT_OBSERVED | Only historical architecture references; no workflow analyzed. |
| plan-set processing | NOT_OBSERVED | No plan-set run. |
| OCR/parser | NOT_OBSERVED | No parser execution. |
| Revu/Bluebeam | NOT_OBSERVED | No Revu workflow execution. |
| Bid Composer | NOT_OBSERVED | Referenced historically only. |
| proposals | NOT_OBSERVED | No proposal generation/population run. |
| VAE | NOT_OBSERVED | No VAE workflow. |
| Scraper | NOT_OBSERVED | No scraper workflow. |
| cross-app handoffs | OBSERVED | ChatGPT → Git staging → Cursor ingest → canonical main/Z/L/index boundary discussed. |
| operator re-entry | OBSERVED | Operator must return to deferred Cursor ingest after WaveRunner completes. |
| manual intervention | OBSERVED | Prior corrective receipt backfill and sequencing decision were operator-visible steps. |

## 15. Corpus bias note

`corpusBiasNote: Thread evidence is Cross-Agent architecture/governance/harvest-heavy; commercial product workflows are under-observed.`

`underObservedDomains: [Computer Estimator, Human Estimator, Document Center, plan-set processing, OCR/parser, Revu/Bluebeam, Bid Composer, proposals, VAE, Scraper]`

No estate-wide optimization claim is supported by this thread.

## 16. Do-not-advance guards

1. Do not merge every open Cross-Agent PR merely to reach zero open PRs.
2. Do not treat `chat-gpt-harvest` branch currentness as a prerequisite for source-evidence validity.
3. Do not treat `chat-gpt-harvest` as canonical architecture authority.
4. Do not merge or rebase long-lived `chat-gpt-harvest` history into `main` just to ingest one artifact.
5. Do not re-harvest the prior control-plane closeout evidence; reference its existing harvest identity.
6. Do not claim the architecture reconciliation WaveRunner is complete until its terminal report is returned.
7. Do not run the deferred prior-harvest Cursor ingest against a moving baseline if the reconciliation WaveRunner is still changing canonical architecture.
8. Do not claim `INDEX_HIT`, `HARVEST_COMPLETE`, `OPERATIONAL`, or `FULLY_SEEDED` from this ChatGPT lane.

## 17. Seed packet candidates

```json
{
  "seedId": "IH-THREAD-CROSS-AGENT-ARCHITECTURE-SINGLE-AUTHORITY-001",
  "kind": "lesson",
  "status": "CANDIDATE",
  "goldMineSignalClass": "SUCCESS_PATTERN",
  "novelty": "NEW",
  "retrievalQuestions": [
    "How should old Cross-Agent architecture PRs be reconciled with current main?",
    "Does an open historical PR mean required architecture is missing from main?"
  ],
  "evidenceRefs": ["EVT-001", "EVT-002", "EVT-003", "HP-001", "HP-002"],
  "futureAgentInstructions": "Measure architecture debt semantically. Classify each architecture-bearing PR as still-required, superseded, obsolete, evidence-only, or active non-architecture work. Migrate only missing invariants into current main."
}
```

```json
{
  "seedId": "IH-THREAD-CHATGPT-HARVEST-DIVERGENT-STAGING-001",
  "kind": "lesson",
  "status": "CANDIDATE",
  "goldMineSignalClass": "SUCCESS_PATTERN",
  "novelty": "NEW",
  "retrievalQuestions": [
    "Can ChatGPT harvest evidence be valid when chat-gpt-harvest diverges from main?",
    "Should Cursor merge chat-gpt-harvest into main to ingest a findings artifact?"
  ],
  "evidenceRefs": ["EVT-004", "EVT-005", "EVT-006", "HP-003"],
  "futureAgentInstructions": "Treat chat-gpt-harvest as evidence staging only. Verify the artifact and Git gate, then ingest the designated file against current canonical main. Do not import unrelated branch history."
}
```

```json
{
  "seedId": "IH-THREAD-HARVEST-RECEIPT-DUAL-SHA-001",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "goldMineSignalClass": "RESOLUTION_SIGNAL",
  "novelty": "RECURRENCE",
  "retrievalQuestions": [
    "How should ChatGPT harvest receipts handle Git commit self-reference?",
    "Why can sourceCommitSha differ from the final corrective chat-gpt-harvest HEAD?"
  ],
  "evidenceRefs": ["EVT-004", "HP-004", "OG-003", "OUT-001"],
  "futureAgentInstructions": "Preserve immutable content provenance separately from the externally verified corrective receipt HEAD. Do not attempt to embed a commit's own final SHA inside itself."
}
```

## 18. Future-agent instructions

- Start Cross-Agent architecture work from current `origin/main`, not an old open PR branch.
- Inventory all open PRs, but use capability parity and current tests to determine real architecture debt.
- Give PR #6 special semantic reconciliation because parts are already superseded while other historical safeguards may still be useful.
- Preserve `origin/main` as the sole operating architecture authority.
- Treat `chat-gpt-harvest` as staging evidence even if it is materially ahead/behind/diverged from main.
- For staged ChatGPT evidence, preserve the original content publication SHA and separately verify the final remote staging HEAD.
- When the current architecture reconciliation WaveRunner finishes, use its resulting canonical main SHA as the baseline for the deferred prior-harvest Cursor ingest.
- Run duplication-preflight before promoting any seed from this source because several topics overlap existing durability/currentness harvests.

## 19. Publication truth table

| Layer | State |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | `not-run` |
| `CHATGPT_HARVEST_GIT_GATE` | `not-run` |
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

`PENDING_CHATGPT_HARVEST_GIT_GATE`

## 21. Cursor handoff command

After `CHATGPT_HARVEST_GIT_GATE` passes, Cursor should ingest this one artifact using the canonical current `main` architecture rather than merging the staging branch history:

```bash
git fetch origin chat-gpt-harvest

npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-10-cross-agent-architecture-reconciliation-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-10-cross-agent-architecture-reconciliation-v1

npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-10-cross-agent-architecture-reconciliation-v1
npm run harvest:sync-derived -- harvest-2026-08-10-cross-agent-architecture-reconciliation-v1
npm run harvest:validate -- harvest-2026-08-10-cross-agent-architecture-reconciliation-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-10-cross-agent-architecture-reconciliation-v1
npm run test:harvest
# operator after validation:
npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-10-cross-agent-architecture-reconciliation-v1
```

Cursor must verify the source artifact from `chat-gpt-harvest` and bind canonical outputs to the then-current `CapitalGlass-Cross-Agent/main`; this source does not authorize merging staging-branch history into main.
