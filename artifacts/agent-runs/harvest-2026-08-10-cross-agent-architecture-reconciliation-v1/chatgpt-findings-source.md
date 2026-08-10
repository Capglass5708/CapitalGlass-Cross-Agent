# ChatGPT Findings Source — Cross-Agent Architecture Reconciliation

- harvestId: `harvest-2026-08-10-cross-agent-architecture-reconciliation-v1`
- mission: `chat-thread-closeout-autopsy-harvest-chatgpt-v1`
- protocol: `v2.1`
- lane: `CHAT_CONTEXT_ONLY`
- tier: `T2`
- verdict: `CHATGPT_SOURCE_PUBLISHED`
- sourceRepo: `Capglass5708/CapitalGlass-Cross-Agent`
- sourceBranch: `chat-gpt-harvest`
- sourceCommitSha: `84da8f6dbe69705b62a747b2dd4a5015aa179583`
- initialPublicationCommitSha: `84da8f6dbe69705b62a747b2dd4a5015aa179583`
- canonicalArchitectureAuthority: `CapitalGlass-Cross-Agent/origin/main`

## 1. Final summary + verdict

This thread established two durable architecture rules for the current Cross-Agent estate.

First, architecture completeness must be proven semantically rather than inferred from open/closed PR counts. Historical PRs may be fully superseded, partially absorbed, obsolete, evidence-only, active product work, or still contain required architectural deltas. The correct terminal state is not “all old PRs merged”; it is “every still-required operating capability is available from canonical `origin/main`, with zero ambiguous branch authority.”

Second, `chat-gpt-harvest` is an evidence-staging lane, not an architectural authority branch. A valid ChatGPT source artifact may live on a staging branch that is intentionally divergent from current `main`. Cursor should ingest the designated artifact against current canonical `main`; it should not merge or rebase the long-lived staging history merely to consume evidence.

The thread also records a receipt-durability pattern: preserve the immutable content publication SHA as `sourceCommitSha` / `initialPublicationCommitSha`; when a corrective commit backfills durable receipt fields, verify the resulting remote branch HEAD externally rather than attempting impossible self-reference inside that same commit.

Final ChatGPT-side verdict: `CHATGPT_SOURCE_PUBLISHED` after the Git gate is externally verified in the closing chat receipt.

## 2. Harvest tier rationale

`T2` is appropriate because the thread contains reusable cross-repository authority, reconciliation, Git-staging, receipt-durability, and sequencing lessons. It defines a new architecture reconciliation mission and concrete Gold Mine candidates, but it does not claim canonical implementation, Cursor validation, or `HARVEST_COMPLETE`.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: 84da8f6dbe69705b62a747b2dd4a5015aa179583
```

Any user-reported `INDEX_HIT`, cache, L:, or scout state in the conversation is preserved only as thread evidence. ChatGPT does not independently claim those retrieval layers in this run.

## 4. Thread event inventory

### EVT-001 — Cross-Agent architecture completeness questioned
The user asked whether all recent Cross-Agent architecture expansion had been pushed and implemented into operating `main`.

### EVT-002 — Core expansion found on main, residual ambiguity found outside it
Live repo investigation in the thread showed the major modern expansion operating on `main`, while at least one historical architecture PR (#6, medium-critical harvest risk remediation) remained open and only partially mapped to current-main capability. The correct state was “core expansion operating on main; residual architecture reconciliation required,” not a false 100% claim.

### EVT-003 — Architecture reconciliation WaveRunner created
A WaveRunner was produced with terminal goals `CROSS_AGENT_ARCHITECTURE_AUTHORITY=origin/main`, `UNMERGED_REQUIRED_ARCHITECTURE=0`, and `AMBIGUOUS_ARCHITECTURE_AUTHORITY=0`. It explicitly forbids blind bulk-merging and requires semantic dispositions for every architecture-bearing PR.

### EVT-004 — Prior ChatGPT harvest receipt durability corrected
The user reported that the prior control-plane ChatGPT source retained content SHA `a59f7d7693619bcbca292878e0c4c18f1d5face2`, while a corrective commit advanced remote `chat-gpt-harvest` HEAD to `23e2037842215945b141c321b8c3616271eac03c`. The artifact then carried `CHATGPT_SOURCE_PUBLISHED`, `CHATGPT_HARVEST_GIT_GATE=PASS`, and `remoteVerified: true`.

### EVT-005 — Staging branch divergence proven honestly
The user reported a merge-base of `402352f4…` against current Cross-Agent `main`, with `chat-gpt-harvest` 56 behind / 92 ahead and not containing the recent main expansion. This demonstrated that source-evidence validity and branch-currentness are different properties.

### EVT-006 — Ingest boundary clarified
The thread established: ingest the designated evidence artifact against current main; do not merge the staging branch history into main.

### EVT-007 — Mission sequencing chosen
The user started the Cross-Agent architecture reconciliation WaveRunner and intentionally deferred the earlier control-plane ChatGPT harvest ingest until the reconciliation completes.

### EVT-008 — This v2.1 harvest invoked
The user ran the attached source-authority protocol with `RUN FILE`.

## 5. Harvest packets

### HP-001 — Architecture completeness is capability completeness
- kind: `authority-pattern`
- goldMineSignalClass: `SUCCESS_PATTERN`
- implementationState: `IMPLEMENTED_IN_THREAD`
- novelty: `NEW`
- finding: Operating architecture is complete when every still-required capability is available from canonical main and no branch-only authority remains, not when every historical PR is merged.

### HP-002 — Open PR does not equal missing architecture
- kind: `failure-pattern`
- goldMineSignalClass: `AGENT_FRICTION_SIGNAL`
- implementationState: `OBSERVED_OPEN`
- novelty: `NEW`
- finding: Later architecture can supersede an older PR semantically without containing its original commits. Open-PR count is therefore not a safe architecture-debt metric.

### HP-003 — Divergent ChatGPT staging remains valid evidence
- kind: `authority-pattern`
- goldMineSignalClass: `SUCCESS_PATTERN`
- implementationState: `VERIFIED_FIXED`
- novelty: `RESOLUTION_EVIDENCE`
- resolvesRootCauseId: `chatgpt-staging-equals-main-assumption-v1`
- finding: `chat-gpt-harvest` can be ahead/behind/diverged and still contain valid source evidence. Canonical architecture remains `origin/main`.

### HP-004 — Content SHA and corrective HEAD are separate identities
- kind: `protocol-upgrade`
- goldMineSignalClass: `RESOLUTION_SIGNAL`
- implementationState: `VERIFIED_FIXED`
- novelty: `RESOLUTION_EVIDENCE`
- resolvesRootCauseId: `harvest-receipt-self-reference-v1`
- finding: Preserve the immutable content commit as source provenance and externally verify the corrective receipt HEAD. Do not attempt to embed a commit's own final SHA in itself.

### HP-005 — Reconciliation before dependent ingest
- kind: `sequencing-pattern`
- goldMineSignalClass: `SUCCESS_PATTERN`
- implementationState: `ADOPTED`
- novelty: `NEW`
- finding: Complete canonical architecture reconciliation before validating/publishing dependent staged evidence, so downstream outputs bind to a stable authority baseline.

## 6. Execution deltas

### ED-001
- before: major recent Cross-Agent expansion appeared merged.
- after: core expansion is on main, but historical architecture branches require semantic disposition before a 100% claim.
- effect: PR-state reasoning was replaced by capability-level reconciliation.

### ED-002
- before: prior ChatGPT source publication had incomplete durable receipt/currentness metadata.
- after: corrective backfill preserved original content provenance while separately proving the corrective remote HEAD and branch divergence.
- effect: receipt truth no longer implied staging-currentness.

### ED-003
- before: prior control-plane ChatGPT source was ready for immediate Cursor ingest.
- after: ingest was intentionally deferred until the architecture reconciliation WaveRunner finishes.
- effect: dependent validation will bind to the post-reconciliation canonical architecture.

## 7. Observed improvement outcomes

### OUT-001 — Prior ChatGPT receipt durability repaired
- beforeState: durable content existed, but receipt/currentness representation was incomplete for the newer Cross-Agent expectation.
- afterState: user reported corrective remote HEAD `23e2037842215945b141c321b8c3616271eac03c`, PASS Git gate, `remoteVerified: true`, and preserved content SHA `a59f7d7693619bcbca292878e0c4c18f1d5face2`.
- measurableChange: publication state became explicitly durable without rewriting source provenance.
- proof: user-supplied SHA/parity report in this thread.
- remainingResidual: Cursor ingest/validation/publication of that prior harvest remains pending.
- improvementProven: true

### OUT-002 — Architecture ambiguity converted into an executable mission
- beforeState: residual architecture ambiguity existed across historical open PRs.
- afterState: a stage-gated WaveRunner now requires full PR inventory, special PR #6 reconciliation, minimum modern delta migration, full architecture test matrix, stale-PR disposition, currentness receipt, clean-main proof, and remote parity.
- measurableChange: an ambiguous cleanup question became a deterministic terminal contract.
- proof: WaveRunner authored in this thread.
- remainingResidual: WaveRunner execution is in progress; terminal result not yet returned.
- improvementProven: false

## 8. Waste ledger

### TW-001 — Binary PR-status framing
Using open/closed PR state as a proxy for architecture completeness creates false positives and invites stale merges.

### TW-002 — Repeated receipt self-reference correction
A second commit is needed when durable metadata must contain the first content commit SHA. This should be standardized rather than rediscovered per harvest.

### TW-003 — Mixed-mission risk
Running Cursor ingest while architecture reconciliation is changing canonical main would blur authority and closeout evidence. The user correctly separated the missions.

## 9. Duplication detector

### DUP-001
- target: `harvest-2026-08-10-control-plane-terminal-closeout-v1`
- classification: `KNOWN_EXISTING`
- disposition: `NEEDS_REGISTRY_LOOKUP_FIRST`
- action: do not duplicate its control-plane implementation evidence; only ingest the new staging/receipt/sequencing lessons from this source.

### DUP-002
- target: recent active-ledger / harvest-expansion work associated in-thread with `420910d3…`
- classification: `KNOWN_EXISTING`
- disposition: `NEEDS_REGISTRY_LOOKUP_FIRST`
- action: reference currentness/ledger outcomes rather than re-harvest them.

### DUP-003
- target: historical `harvest-git-durability-v1-2-context`
- classification: `KNOWN_EXISTING`
- disposition: `NEEDS_REGISTRY_LOOKUP_FIRST`
- action: deduplicate this thread's resolution evidence against the canonical durability packet during Cursor ingest.

## 10. Operator friction

### OF-001 — “Published” could be misread as “current with main”
- goldMineSignalClass: `OPERATOR_FRICTION_SIGNAL`
- novelty: `NEW`
- implementationState: `VERIFIED_FIXED`
- friction: explicit merge-base and behind/ahead proof was required to separate evidence validity from branch currentness.

### OF-002 — Dual-SHA semantics are not obvious
- goldMineSignalClass: `OPERATOR_FRICTION_SIGNAL`
- novelty: `RECURRENCE`
- implementationState: `PARTIAL`
- friction: agents/operators must distinguish immutable content SHA from later corrective branch HEAD.

### OF-003 — Deferred ingest requires operator re-entry
- goldMineSignalClass: `OPERATOR_FRICTION_SIGNAL`
- novelty: `NEW`
- implementationState: `ADOPTED`
- friction: the operator must return to the pending prior-harvest ingest after WaveRunner closeout.

## 11. Observability gaps

### OG-001 — Git gate lacked advisory main-relationship evidence
- whatWeNeededToKnow: whether `chat-gpt-harvest` was current with canonical main.
- whyItWasNotObservable: receipt parity proved source publication, not merge-base/currentness.
- workflow: ChatGPT harvest Git publication.
- missingMetricOrReceipt: `mainMergeBase`, `behindMain`, `aheadMain`, `containsCurrentMainExpansion`.
- recommendedInstrumentation: add advisory branch-currentness fields without making them a source-validity gate.
- goldMineSignalClass: `OBSERVABILITY_GAP`

### OG-002 — No single semantic architecture-debt view
- whatWeNeededToKnow: which historical open PRs contain still-required architecture.
- whyItWasNotObservable: PR state is structural, not semantic.
- workflow: Cross-Agent architecture closeout.
- missingMetricOrReceipt: per-PR capability disposition + superseding main authority.
- recommendedInstrumentation: generate `cross-agent-architecture-currentness-v1` or equivalent.
- goldMineSignalClass: `OBSERVABILITY_GAP`

### OG-003 — Git self-reference prevents in-commit final-head recording
- whatWeNeededToKnow: immutable content commit and final corrective remote HEAD.
- whyItWasNotObservable: writing a commit's own SHA changes the commit.
- workflow: ChatGPT harvest Git publication.
- missingMetricOrReceipt: explicit dual identity fields.
- recommendedInstrumentation: standardize `sourceContentCommitSha` / `initialPublicationCommitSha` plus externally emitted `publicationReceiptHeadSha`.
- goldMineSignalClass: `OBSERVABILITY_GAP`

## 12. Success patterns

### SUCCESS_PATTERN-001 — Semantic reconciliation over bulk merge
Historical branches are evaluated by invariant/capability against current architecture; only useful missing deltas migrate.

### SUCCESS_PATTERN-002 — Staging and canonical authority remain separate
“Ingest the artifact; do not merge the staging branch” prevents unrelated divergent history from becoming operating architecture.

### SUCCESS_PATTERN-003 — Corrective backfill preserves provenance
The first content SHA remains immutable evidence provenance while a later commit carries durable receipt fields.

### SUCCESS_PATTERN-004 — Mission sequencing stabilizes authority
Finishing reconciliation before dependent ingest reduces moving-baseline closeout ambiguity.

## 13. ROI backlog

### ROI-001 — Architecture PR disposition/currentness registry
- rank: 1
- operatorValue: reduces repeated PR archaeology.
- businessValue: indirect platform-maintenance benefit.
- platformValue: high.
- agentValue: high.
- reliabilityValue: high.
- automationLeverage: high.
- estimatedComplexity: `UNKNOWN`
- blastRadius: `MEDIUM`
- confidence: `HIGH`
- evidenceDiversity: open-PR audit + WaveRunner design.
- rootCauseLeverage: high.
- goldMineSignalClass: `BUSINESS_WORKFLOW_SIGNAL`
- novelty: `NEW`
- businessImpact: `PLATFORM_RELIABILITY`

### ROI-002 — Advisory staging-branch ancestry/currentness receipt fields
- rank: 2
- operatorValue: immediately distinguishes valid source publication from main currentness.
- businessValue: indirect.
- platformValue: high.
- agentValue: high.
- reliabilityValue: high.
- automationLeverage: medium.
- estimatedComplexity: `UNKNOWN`
- blastRadius: `LOW`
- confidence: `HIGH`
- evidenceDiversity: branch-divergence proof + prior corrective backfill.
- rootCauseLeverage: medium-high.
- goldMineSignalClass: `OBSERVABILITY_GAP`
- novelty: `NEW`
- businessImpact: `PLATFORM_RELIABILITY`

### ROI-003 — Standard dual-SHA harvest receipt schema
- rank: 3
- operatorValue: removes recurring self-reference confusion.
- businessValue: indirect.
- platformValue: medium-high.
- agentValue: high.
- reliabilityValue: high.
- automationLeverage: medium.
- estimatedComplexity: `UNKNOWN`
- blastRadius: `LOW`
- confidence: `HIGH`
- evidenceDiversity: prior correction + current Git-gate flow.
- rootCauseLeverage: high.
- goldMineSignalClass: `RESOLUTION_SIGNAL`
- novelty: `RECURRENCE`
- businessImpact: `PLATFORM_RELIABILITY`

### ROI-004 — Artifact-only ingest helper for divergent staging branches
- rank: 4
- operatorValue: makes one-file consumption explicit.
- businessValue: indirect.
- platformValue: medium.
- agentValue: medium-high.
- reliabilityValue: medium-high.
- automationLeverage: medium.
- estimatedComplexity: `UNKNOWN`
- blastRadius: `LOW`
- confidence: `MEDIUM`
- evidenceDiversity: staging divergence + ingest discussion.
- rootCauseLeverage: medium.
- goldMineSignalClass: `AGENT_FRICTION_SIGNAL`
- novelty: `NEW`
- businessImpact: `PLATFORM_RELIABILITY`

### ROI-005 — Stale architecture-PR closure automation after reconciliation
- rank: 5
- operatorValue: reduces manual cleanup once semantic disposition is proven.
- businessValue: indirect.
- platformValue: medium.
- agentValue: medium.
- reliabilityValue: medium.
- automationLeverage: medium-high.
- estimatedComplexity: `UNKNOWN`
- blastRadius: `MEDIUM`
- confidence: `MEDIUM`
- evidenceDiversity: open-PR audit + WaveRunner terminal contract.
- rootCauseLeverage: medium.
- goldMineSignalClass: `SUCCESS_PATTERN`
- novelty: `NEW`
- businessImpact: `PLATFORM_MAINTAINABILITY`

## 14. Product-workflow coverage

| Surface | Coverage | Evidence |
| --- | --- | --- |
| Computer Estimator | NOT_OBSERVED | No estimator execution. |
| Human Estimator | NOT_OBSERVED | No HE execution. |
| Document Center | NOT_OBSERVED | Historical references only. |
| plan-set processing | NOT_OBSERVED | No plan-set run. |
| OCR/parser | NOT_OBSERVED | No parser execution. |
| Revu/Bluebeam | NOT_OBSERVED | No Revu execution. |
| Bid Composer | NOT_OBSERVED | Historical references only. |
| proposals | NOT_OBSERVED | No proposal run. |
| VAE | NOT_OBSERVED | No VAE workflow. |
| Scraper | NOT_OBSERVED | No scraper workflow. |
| cross-app handoffs | OBSERVED | ChatGPT → Git staging → Cursor ingest → canonical publication boundary. |
| operator re-entry | OBSERVED | Deferred ingest must resume after WaveRunner. |
| manual intervention | OBSERVED | Corrective receipt backfill and sequencing were operator-visible. |

## 15. Corpus bias note

`corpusBiasNote: Thread evidence is Cross-Agent architecture/governance/harvest-heavy; commercial product workflows are under-observed.`

`underObservedDomains: [Computer Estimator, Human Estimator, Document Center, plan-set processing, OCR/parser, Revu/Bluebeam, Bid Composer, proposals, VAE, Scraper]`

No estate-wide optimization claim is supported by this thread.

## 16. Do-not-advance guards

1. Do not bulk-merge historical Cross-Agent PRs to reduce open-PR count.
2. Do not treat `chat-gpt-harvest` as canonical architecture authority.
3. Do not require staging-branch currentness for source-evidence validity.
4. Do not merge/rebase the long-lived staging history into main merely to ingest one artifact.
5. Do not duplicate the prior control-plane harvest's implementation evidence.
6. Do not claim the reconciliation WaveRunner is complete until its terminal report is returned.
7. Do not run the deferred prior-harvest ingest against a moving architecture baseline if WaveRunner is still changing canonical main.
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
    "Does an open historical PR prove architecture is missing from main?"
  ],
  "evidenceRefs": ["EVT-001", "EVT-002", "EVT-003", "HP-001", "HP-002"],
  "futureAgentInstructions": "Measure architecture debt semantically; migrate only still-required invariants to current main and record superseding authority for the rest."
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
    "Can ChatGPT harvest evidence remain valid when chat-gpt-harvest diverges from main?",
    "Should Cursor merge chat-gpt-harvest history to ingest one findings file?"
  ],
  "evidenceRefs": ["EVT-004", "EVT-005", "EVT-006", "HP-003"],
  "futureAgentInstructions": "Treat chat-gpt-harvest as evidence staging only. Verify the designated artifact and Git gate, then ingest against current main without importing unrelated staging history."
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
  "futureAgentInstructions": "Preserve immutable source-content provenance separately from externally verified corrective branch HEAD; never attempt to embed a commit's own final SHA inside itself."
}
```

## 18. Future-agent instructions

- Start architecture reconciliation from current `origin/main`, not an old PR branch.
- Inventory every open PR, but determine debt by capability parity and current tests.
- Reconcile PR #6 specially because some safeguards are already superseded while others may still matter.
- Keep `origin/main` the sole operating architecture authority.
- Keep `chat-gpt-harvest` an evidence-staging lane even when its history diverges.
- Preserve the initial source-content commit SHA and separately verify the final remote staging HEAD.
- After the active WaveRunner finishes, use its resulting canonical main SHA as the baseline for the deferred earlier-harvest Cursor ingest.
- Run duplication-preflight before promoting these candidates because this source overlaps existing durability/currentness harvests.

## 19. Publication truth table

| Layer | State |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | source content commit `84da8f6dbe69705b62a747b2dd4a5015aa179583`; corrective receipt commit follows |
| `CHATGPT_HARVEST_GIT_GATE` | `PASS` subject to external final-HEAD verification reported in chat |
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

```json
{
  "gitPublicationReceipt": {
    "gate": "CHATGPT_HARVEST_GIT_GATE",
    "verdict": "PASS",
    "repo": "Capglass5708/CapitalGlass-Cross-Agent",
    "branch": "chat-gpt-harvest",
    "harvestId": "harvest-2026-08-10-cross-agent-architecture-reconciliation-v1",
    "artifactPath": "artifacts/agent-runs/harvest-2026-08-10-cross-agent-architecture-reconciliation-v1/chatgpt-findings-source.md",
    "sourceCommitSha": "84da8f6dbe69705b62a747b2dd4a5015aa179583",
    "initialPublicationCommitSha": "84da8f6dbe69705b62a747b2dd4a5015aa179583",
    "initialContentRemoteVerified": true,
    "correctiveReceiptHead": "EXTERNALLY_VERIFIED_IN_CHAT_TO_AVOID_SELF_REFERENCE",
    "remoteVerified": true
  }
}
```

The immutable source/content identity is intentionally the initial publication commit. The corrective receipt commit necessarily has a different SHA and is verified externally in the closing ChatGPT gate receipt rather than self-referenced here.

## 21. Cursor handoff command

After the active Cross-Agent architecture reconciliation WaveRunner completes, ingest this one source artifact against the resulting canonical main architecture. Do not merge the staging branch history.

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
