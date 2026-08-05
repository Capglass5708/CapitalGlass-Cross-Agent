# ChatGPT Findings Source — North Star Lifecycle Thread

## 1. Final summary

```text
Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Start verdict: UNHARVESTED_THREAD
Target tier: T2
Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION
```

This thread established a reusable governed lifecycle for cross-repo material preflight, immutable preflight linkage, closeout authorization, lifecycle indexing, deterministic observation, downstream projections, packaging, and full-system verification. The highest-value lessons are not the individual commands, but the guardrails that prevented false PASS states: prove live cross-repo geometry, separate constitutional authority from execution and mutation ownership, treat artifacts as immutable evidence, make regression tests self-contained, and require main-branch/canonical-path parity before declaring the system operational.

Evidence basis: visible conversation plus the attached ChatGPT autopsy protocol only. Operational results pasted by the operator are classified as `USER_REPORTED_OPERATIONAL`; code/deploy/index claims requiring repository verification are classified as `CROSS_CHECK_CANDIDATE`.

## 2. Harvest verdict and tier rationale

**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

**Tier:** T2

Rationale: the thread contains multiple corrections, cross-repo ownership decisions, live acceptance reports, packaging reports, and a later full-system HOLD that corrected earlier completion language. These are durable lessons, but code, deploy, PR, receipt, and runtime claims still require Cursor validation.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

No `INDEX_HIT`, `INDEX_HIT_AI_CACHE`, `FAILOVER_SUPABASE`, `HARVEST_COMPLETE`, `OPERATIONAL`, or `FULLY_SEEDED` claim is made.

## 4. Scope ledger

### Primary mission

Compress the North Star lifecycle conversation into reusable observed intelligence for Cursor validation.

### Closed lanes reported in the thread

- Cross-repo lifecycle linkage design and implementation.
- Railway live acceptance.
- Deterministic lifecycle observer.
- Canonical Governance documentation plus App Builder pointer.
- Parent work-package closeout and downstream Supabase projection.
- Git packaging across three repos.

Classification: `USER_REPORTED_OPERATIONAL`.

### Open lane at thread end

- Full-system verification on current `main` remained `HOLD` because the North Star packaging PR trio was reported as still open and canonical runtime artifacts were missing at referenced paths.

Classification: `USER_REPORTED_OPERATIONAL` and `CROSS_CHECK_CANDIDATE`.

### Unrelated follow-ups

- Cheapest-redo registry historical Vercel backfill.
- Other App Builder/Data-Extraction feature work and stashed runtime drift.

### Do-not-merge boundaries

- Governance decision logic must remain canonical in Governance MCP.
- App Builder must stay a thin execution/control-plane delegate.
- Data-Extraction must remain a mutation consumer/delegate.
- Z: and Supabase remain downstream projections only.

## 5. Correction ledger

### COR-001 — Work-package documentation ownership

- **priorAssumption:** App Builder-only documentation was acceptable.
- **correction:** Canonical work-package documentation belongs in Governance MCP; App Builder contains only a non-authoritative pointer.
- **correctedModel:** Decision contracts live with constitutional authority; execution repositories link to them without duplicating semantics.
- **affectedFindings:** EVT-002, HP-002, ROI-002.
- **futurePrevention:** Resolve authority ownership before selecting a documentation home.
- **evidenceRef:** visible assistant correction and subsequent operator-approved plan — `CHAT_DIRECT`.

### COR-002 — Linkage success was not sufficient

- **priorAssumption:** Removing `PREFLIGHT_LINKAGE_MISSING` would complete cross-repo acceptance.
- **correction:** Cross-repo closeout still failed because repository equality was incorrectly mandatory.
- **correctedModel:** `repositoryMatch` may be false when `crossRepoLinkageValid` is strictly proven.
- **affectedFindings:** EVT-003, HP-003, ROI-001.
- **futurePrevention:** Acceptance tests must assert final decision PASS, not only successful receipt resolution.
- **evidenceRef:** operator Phase 0 report — `USER_REPORTED_OPERATIONAL`.

### COR-003 — Operational PASS did not equal deployed/full-system PASS

- **priorAssumption:** Mission closeout, projection sync, packaging, and open PRs were enough to treat the North Star system as fully operational.
- **correction:** Exhaustive verification later returned HOLD because current `main` and canonical runtime paths did not contain the required implementation/artifacts.
- **correctedModel:** Distinguish mission PASS, packaging PASS, merge/deployment PASS, and full-system operational PASS.
- **affectedFindings:** EVT-009, HP-005, ED-003, ROI-003.
- **futurePrevention:** Final system claims require current-main parity plus live canonical-path probes.
- **evidenceRef:** final verification report pasted by operator — `USER_REPORTED_OPERATIONAL`.

## 6. Thread event inventory

### EVT-001 — Deterministic lifecycle observer proposed

- A read-only observer keyed by `workPackageId` was proposed with stable checks, deterministic ordering, and semantic evidence hashing.
- **Evidence classification:** `CHAT_DIRECT`.
- **futureEfficiencyImpact:** Future agents can validate lifecycle health without re-reading the entire cross-repo receipt chain.

### EVT-002 — Governance ownership of canonical contract established

- Governance MCP was designated canonical for lifecycle rules; App Builder retained execution control-plane responsibilities; mutation repos retained mission receipts and full indexes.
- **Evidence classification:** `CHAT_DIRECT`.
- **futureEfficiencyImpact:** Prevents repeated ownership debate and duplicated authority logic.

### EVT-003 — Cross-repo equivalence defect identified

- Cross-repo preflight resolution succeeded, but equivalence failed because repository display-name equality was treated as mandatory.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL`.
- **futureEfficiencyImpact:** Future implementations can distinguish authority repo, mutation repo, execution control plane, and owner repo instead of collapsing them.

### EVT-004 — Delegated mutation-repo routing defect identified

- Delegated closeout did not consistently pass `--repo`, causing receipts to land under the wrong repository root.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL`.
- **futureEfficiencyImpact:** Explicit repo routing prevents false success with misplaced authoritative artifacts.

### EVT-005 — Lifecycle-index hygiene defects corrected

- Explicit `null` did not clear stale fields, stale closeout paths were preferred, preflight mutation repo identity was wrong, and index rebuild timing was too early.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL`.
- **futureEfficiencyImpact:** Authoritative rebuild from receipts is cheaper and safer than manual artifact repair.

### EVT-006 — Live Railway cross-repo acceptance reported PASS

- App Builder preflight to Data-Extraction closeout was reported as PASS, with exact hash linkage, authorized promotion, current lifecycle index, and locator agreement.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL` / `CROSS_CHECK_CANDIDATE`.

### EVT-007 — Deterministic observer reported PASS and repeatable

- Fifteen checks passed and repeated runs produced identical evidence hashes.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL` / `CROSS_CHECK_CANDIDATE`.

### EVT-008 — Historical blocked receipts preserved while newer PASS became current authority

- The observer was repaired so immutable historical blocks do not supersede a later authorized PASS closeout.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL`.
- **futureEfficiencyImpact:** Preserves audit history without producing false stale/failure states.

### EVT-009 — Packaging reported PASS, but full-system verification later returned HOLD

- Feature branches and PRs were reported as packaged, yet exhaustive verification found the North Star PR trio still open and canonical runtime artifacts absent on current `main`.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL` / `CROSS_CHECK_CANDIDATE`.
- **futureEfficiencyImpact:** Prevents conflating branch-level proof with deployed operational state.

### EVT-010 — Full-system verification design became broader than unit tests

- The verification included authority audit, 45 regression tests, live observer probes, synthetic fixtures, negative controls, rebuild/recovery, projections, startup retrieval, and Git/main parity.
- **Evidence classification:** `CHAT_DIRECT` for the verification prompt; `USER_REPORTED_OPERATIONAL` for results.
- **futureEfficiencyImpact:** Provides a reusable verification template that finds deployment and canonical-path gaps missed by branch tests.

## 7. Harvest packets

### HP-001 — Validation rule: command exit code is not the gate

- **Kind:** lesson
- A closeout or preflight command may exit nonzero for advisory reasons while the Governance decision is PASS, or exit zero without proving required receipt fields.
- Required gates must inspect authoritative receipts and semantic assertions.
- **Evidence classification:** `CHAT_DIRECT` and `USER_REPORTED_OPERATIONAL`.
- **Durable:** yes.

### HP-002 — Protocol upgrade: authority-aligned documentation

- **Kind:** protocol-upgrade
- Canonical decision contracts belong in Governance MCP; execution repos contain pointer-only documents.
- **Evidence classification:** `CHAT_DIRECT`.
- **Durable:** yes.

### HP-003 — Coding pattern: strict cross-repo equivalence

- **Kind:** coding-pattern
- Accept repository mismatch only when a derived `crossRepoLinkageValid` proves exact identity, lineage, materiality, freshness, authorization, and resolution context.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL` / `CROSS_CHECK_CANDIDATE`.
- **Durable:** yes, pending code validation.

### HP-004 — Recovery pattern: rebuild indexes from authoritative receipts

- **Kind:** lesson
- Generated lifecycle indexes and locators should be regenerable; immutable receipts should not be manually patched.
- **Evidence classification:** `CHAT_DIRECT` and `USER_REPORTED_OPERATIONAL`.
- **Durable:** yes.

### HP-005 — Failure pattern: branch PASS mistaken for operational PASS

- **Kind:** failure-pattern
- A feature branch can have green tests and valid receipts while current `main` lacks the CLI, locators, preflight receipts, or canonical mutation artifacts needed for live operation.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL` / `CROSS_CHECK_CANDIDATE`.
- **Durable:** yes.

## 8. Execution deltas

### ED-001 — Actual vs optimal: same-repo closeout used before proving cross-repo geometry

- **Actual:** App Builder-only closeout succeeded after an earlier Data-Extraction cross-repo failure.
- **Optimal:** Preserve the failed geometry and rerun App Builder preflight to Data-Extraction closeout.
- **Evidence classification:** `CHAT_DIRECT`.
- **Reusable lesson:** A convenient same-repo success cannot substitute for the exact production failure geometry.

### ED-002 — Actual vs optimal: live-machine artifact dependency in regression test

- **Actual:** An observer test depended on a missing App Builder Railway preflight receipt.
- **Optimal:** Seed all required receipts and indexes in temporary fixtures; keep live acceptance as separate runtime evidence.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL`.
- **Reusable lesson:** Regression tests should be self-contained; live receipts prove deployment, not test determinism.

### ED-003 — Actual vs optimal: packaging/merge state not reconciled before operational claim

- **Actual:** Packaging and merge summaries were accepted as PASS, then exhaustive verification found the North Star PRs still open.
- **Optimal:** Query remote PR state and verify current-main ancestry before declaring deployment complete.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL` / `CROSS_CHECK_CANDIDATE`.
- **Reusable lesson:** Remote state verification must precede operational status claims.

## 9. Waste ledger

### TW-001 — Repeated status restatement without new verification

- The thread repeatedly restated PASS states after user-provided summaries without independently reconciling remote PR state and canonical disk paths.
- **Evidence classification:** `CHAT_DIRECT`.
- **Cost:** repeated tokens and delayed discovery of deployment gaps.
- **Prevention:** Use a single state table separating implementation, operational mission, packaging, merged-main, canonical artifacts, and live verification.

### TW-002 — Long prompts duplicated prior requirements

- Multiple very long Cursor prompts repeated authority, gate, receipt, and output requirements.
- **Evidence classification:** `CHAT_DIRECT`.
- **Cost:** high token use and opportunity for drift between prompt versions.
- **Prevention:** Maintain one canonical gate manifest and issue short delta prompts referencing it.

## 10. Duplication detector

### DUP-001

- **Classification:** `REPEATED_DISCUSSION`
- The mission PASS, packaging PASS, and final state were re-acknowledged multiple times without changing authority or evidence.
- **Action:** Future agents should collapse repeated acknowledgements into one final state receipt and stop.
- **Evidence classification:** `CHAT_DIRECT`.

### DUP-002

- **Classification:** `POSSIBLE_EXISTING_HARVEST`
- The thread repeatedly encoded the same North Star authority split, observer checks, and PASS rules in successive prompts.
- **Action:** `NEEDS_REGISTRY_LOOKUP_FIRST` before creating another protocol seed.
- **Evidence classification:** `CHAT_DIRECT`.

## 11. Operator friction

### OF-001 — Operator wanted executable SDLC prompts, not narrative advice

- The operator repeatedly asked for prompts Cursor could execute through gates autonomously.
- **Evidence classification:** `CHAT_DIRECT`.
- **Preference:** Provide bounded, token-saving execution prompts with exact PASS/HOLD rules and minimal follow-up questions.

### OF-002 — Operator prefers branch-safe packaging

- The operator chose feature branches and PRs, explicit path staging, preserved stashes, and no force pushes.
- **Evidence classification:** `CHAT_DIRECT`.

## 12. ROI backlog

### ROI-001 — Canonical cross-repo lifecycle gate manifest

- **Rank:** 1
- **improvementType:** `validation_rule`
- **Why:** The thread repeatedly reconstructed the same conditions for preflight linkage, equivalence, authorization, index hygiene, observer checks, and immutable history.
- **Evidence classification:** `CHAT_DIRECT` and `USER_REPORTED_OPERATIONAL`.

```json
{
  "futureSavings": {
    "tokenSavingsEstimate": "high",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 8,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["cursor_planning", "coding", "testing", "debugging", "deployment"],
    "futureEfficiencyImpact": "A single canonical gate manifest prevents repeated long prompts and catches linkage, equivalence, artifact-routing, and deployment gaps before closeout claims."
  },
  "optimalFutureWorkflow": [
    "1. Load the canonical Governance work-package contract.",
    "2. Run the named preflight, closeout, observer, and regression gates from the manifest.",
    "3. Inspect semantic receipts rather than command exit codes alone.",
    "4. Verify current-main ancestry and canonical artifact paths.",
    "5. Emit one PASS/HOLD receipt and stop."
  ]
}
```

### ROI-002 — Authority-first retrieval and documentation placement

- **Rank:** 2
- **improvementType:** `planning_technique`
- **Why:** The thread corrected an initial App Builder-only documentation recommendation after inspecting Governance ownership.
- **Evidence classification:** `CHAT_DIRECT`.

```json
{
  "futureSavings": {
    "tokenSavingsEstimate": "medium",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 4,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["cursor_planning", "repository_retrieval", "coding"],
    "futureEfficiencyImpact": "Opening the constitutional owner contract before choosing file locations avoids duplicate authority docs and later migration."
  },
  "optimalFutureWorkflow": [
    "1. Identify constitutional owner, execution control plane, and mutation repo.",
    "2. Read the owner repo contract before creating docs or logic.",
    "3. Put canonical rules in the owner repo and pointer-only docs elsewhere.",
    "4. Reject any duplicated decision semantics during review."
  ]
}
```

### ROI-003 — Deployment parity gate before operational claims

- **Rank:** 3
- **improvementType:** `stop_condition`
- **Why:** The final verification found open PRs and missing canonical artifacts after earlier packaging/merge PASS statements.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL` / `CROSS_CHECK_CANDIDATE`.

```json
{
  "futureSavings": {
    "tokenSavingsEstimate": "medium",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 6,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": false,
    "appliesTo": ["testing", "debugging", "deployment"],
    "futureEfficiencyImpact": "A mandatory current-main and canonical-path check prevents premature operational declarations and expensive post-closeout autopsies."
  },
  "optimalFutureWorkflow": [
    "1. Verify PR state and merge SHA remotely.",
    "2. Fast-forward local main and confirm HEAD equals origin/main.",
    "3. Verify required CLIs, locators, preflights, indexes, and receipts at canonical paths.",
    "4. Run live observer twice on main.",
    "5. Declare operational PASS only after deterministic live success."
  ]
}
```

## 13. Do-not-advance guards

- Do not declare full-system operational PASS from branch tests alone.
- Do not use same-repo success as proof of a cross-repo failure geometry.
- Do not manually repair historical blocked receipts or lifecycle indexes.
- Do not treat projections as lifecycle authority.
- Do not restore live-machine artifacts merely to satisfy regression tests.
- Do not duplicate Governance equivalence or authorization logic in App Builder or Data-Extraction.
- Do not treat advisory process exit codes as authoritative decisions.
- Do not merge or push protocol findings to `main` before Cursor validation.

## 14. Seed packet candidates

### Seed candidate 1

```json
{
  "seedId": "IH-THREAD-NORTH-STAR-CROSS-REPO-GATE-V1",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "improvementType": "validation_rule",
  "summary": "Use a single canonical gate manifest for cross-repo preflight linkage, equivalence, closeout authorization, lifecycle-index hygiene, observer determinism, and deployment parity.",
  "futureSavings": {
    "tokenSavingsEstimate": "high",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 8,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["cursor_planning", "coding", "testing", "debugging", "deployment"],
    "futureEfficiencyImpact": "Future agents can execute one stable gate sequence instead of reconstructing the lifecycle contract across many prompts."
  },
  "optimalFutureWorkflow": [
    "1. Retrieve the Governance canonical contract by workPackageId.",
    "2. Run material preflight and validate the authoritative receipt.",
    "3. Run mutation-repo closeout with explicit repo identity.",
    "4. Rebuild lifecycle index from authoritative receipts.",
    "5. Run observer twice and compare semantic evidenceHash.",
    "6. Verify current-main and canonical-path parity before operational PASS."
  ],
  "retrievalQuestions": [
    "What exact gates prove an intentional cross-repo North Star closeout?",
    "Why can repositoryMatch be false while closeout still passes?",
    "What must be checked before declaring the lifecycle system operational on main?"
  ],
  "evidenceRefs": [
    {"ref": "Visible North Star Phase 0–4 reports", "classification": "USER_REPORTED_OPERATIONAL"},
    {"ref": "Visible full-system verification prompt and HOLD report", "classification": "CHAT_DIRECT"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A material mission spans preflight, execution, and mutation across different repositories.",
    "startAt": "Governance canonical work-package contract and lifecycle locator.",
    "runPreflight": "Run named Governance regression and observer gates before changing semantics.",
    "doNot": "Do not equate repository mismatch with invalid equivalence, and do not claim PASS from exit code or branch tests alone.",
    "proveBeforeClaiming": "Exact preflight hash linkage, strict crossRepoLinkageValid, authorized closeout, current index/locator agreement, deterministic observer, and current-main parity."
  }
}
```

### Seed candidate 2

```json
{
  "seedId": "IH-THREAD-DEPLOYMENT-PARITY-BEFORE-OPERATIONAL-V1",
  "kind": "failure-pattern",
  "status": "CANDIDATE",
  "improvementType": "stop_condition",
  "summary": "Packaging PASS and feature-branch proof do not establish full-system operational PASS until merged-main ancestry and canonical runtime artifacts are verified live.",
  "futureSavings": {
    "tokenSavingsEstimate": "medium",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 6,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": false,
    "appliesTo": ["testing", "debugging", "deployment"],
    "futureEfficiencyImpact": "A deployment-parity stop condition prevents repeated status reversals and catches missing CLIs, locators, and receipts immediately."
  },
  "optimalFutureWorkflow": [
    "1. Query remote PR state and record merge SHA.",
    "2. Confirm implementation commits are ancestors of origin/main.",
    "3. Fast-forward clean local main worktrees.",
    "4. Verify canonical absolute paths and regenerate only derived artifacts.",
    "5. Run live observers twice before operational PASS."
  ],
  "retrievalQuestions": [
    "What evidence distinguishes packaging PASS from operational PASS?",
    "Which canonical artifacts must exist on current main before a North Star observer can pass?"
  ],
  "evidenceRefs": [
    {"ref": "Packaging PASS reports followed by full-system HOLD report", "classification": "USER_REPORTED_OPERATIONAL"},
    {"ref": "Visible correction and final verification prompt", "classification": "CHAT_DIRECT"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A feature branch or PR is green and someone wants to declare the system deployed or operational.",
    "startAt": "Remote PR state, origin/main ancestry, and canonical runtime paths.",
    "runPreflight": "Verify current-main parity before live probes.",
    "doNot": "Do not infer deployment from local branches, open PRs, or historical PASS receipts.",
    "proveBeforeClaiming": "Merged main, materialized canonical artifacts, deterministic live observer PASS, and startup retrieval by workPackageId."
  }
}
```

## 15. Future-agent instructions

1. Retrieve by exact `workPackageId` before broad scanning.
2. Identify four identities separately: constitutional owner, execution control plane, mutation repo, and work-package owner.
3. Read the Governance canonical contract before editing code or docs.
4. Treat operator-pasted test/deploy reports as `USER_REPORTED_OPERATIONAL` until repository and runtime checks confirm them.
5. Run self-contained regression tests and keep live acceptance as a separate deployment proof.
6. Validate receipts semantically; command exit code is supporting evidence only.
7. Rebuild generated indexes and locators from authoritative receipts; never hand-edit historical evidence.
8. Verify remote PR state, current-main ancestry, and canonical paths before saying “fully operational.”
9. Stop after one authoritative PASS/HOLD receipt; do not repeatedly restate the same status.

## 16. Publication truth table

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

## 17. Acceptance checklist

- [x] Compression mindset applied; not a full replay.
- [x] Scope and corrections separated.
- [x] Operational claims labeled `USER_REPORTED_OPERATIONAL` or `CROSS_CHECK_CANDIDATE`.
- [x] No live index/cache/publication claims.
- [x] No `HARVEST_COMPLETE`, `OPERATIONAL`, or `FULLY_SEEDED` claim.
- [x] ROI tied to observed repeated work and corrections.
- [x] Seed candidates are `CANDIDATE` only.
- [x] Publication layers remain `not-run`.
- [x] Cursor validation remains mandatory.

## 18. Next operator action

After this findings file is committed to `chat-gpt-harvest`, Cursor should ingest and validate it using the canonical harvest commands. Cursor must cross-check repository, PR, receipt, index, test, and runtime claims before publication.

## 19. Cursor handoff

```bash
npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-05-north-star-lifecycle-thread-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-05-north-star-lifecycle-thread-v1

npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-05-north-star-lifecycle-thread-v1
npm run harvest:sync-derived -- harvest-2026-08-05-north-star-lifecycle-thread-v1
npm run harvest:validate -- harvest-2026-08-05-north-star-lifecycle-thread-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-05-north-star-lifecycle-thread-v1
npm run test:harvest
```

Operator-only publication, after validation:

```bash
npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-05-north-star-lifecycle-thread-v1
```
