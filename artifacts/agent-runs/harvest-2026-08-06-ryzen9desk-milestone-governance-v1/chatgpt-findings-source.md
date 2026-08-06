# ChatGPT Findings Source — RYZEN9DESK Milestone Governance

Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1  
Lane: CHAT_CONTEXT_ONLY  
Intelligence kind: OBSERVED  
Start verdict: UNHARVESTED_THREAD  
Target tier: T2  
Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION

Harvest ID: `harvest-2026-08-06-ryzen9desk-milestone-governance-v1`  
Work package discussed: `ryzen9desk-office-admin-mcp-integration-v1`

## 1. Final summary

This thread converted a broad RYZEN9DESK/Office Admin integration plan into a gated milestone program, then repeatedly reviewed completion reports for M0 through M5. The durable value is not a claim that repository state is correct; ChatGPT cannot establish that. The durable value is the observed governance pattern used in the conversation:

1. separate process authority from execution and publication authority;
2. authorize one milestone at a time;
3. attach explicit scope exclusions and acceptance tests to each authorization;
4. treat cache publication and live availability as different truths;
5. preserve failed evidence and reconcile it through an auditable correction rather than rewriting history;
6. stop release progression when authoritative records disagree.

The thread also exposed a repeated operational weakness: milestone completion was sometimes declared from summarized reports even when a required acceptance condition was not met. The clearest example was M5, where the report claimed architectural PASS while preflight retrieval was `CACHE_STALE`, the in-run verifier returned `SCHEMA_UNSUPPORTED`, the ledger ended in `FAIL`, and a later local verifier returned `RECEIPT_VERIFIED`. The conversation eventually corrected course by classifying M5 as `PASS_WITH_RECONCILIATION_REQUIRED` and authorizing a bounded M5.1 stabilization pass.

No code, repository status, deployment status, index state, cache state, workflow result, or receipt claim in this findings file is independently verified. All such details are observations copied or paraphrased from visible user reports.

## 2. Harvest verdict and tier rationale

**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

**Tier:** T2

T2 is appropriate because the thread contains:

- multiple milestone authorizations;
- architecture and ownership corrections;
- repeated completion reports;
- corrections to earlier acceptance judgments;
- cross-repository boundaries;
- publication, cache, dispatch, ledger, and receipt semantics;
- durable failure patterns suitable for future-agent guidance.

This is an OBSERVED autopsy. It does not invent a new architecture beyond what appeared in the conversation.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

The thread repeatedly contained pasted retrieval labels such as `INDEX_HIT_AI_CACHE`, `PUBLICATION_PASS`, `CACHE_HIT`, `CACHE_STALE`, and `CACHE_MISS`. Those labels are recorded as user-reported evidence only. ChatGPT did not execute estate scout, cache, index, repository, runner, or publication commands during the original milestone discussion.

## 4. Thread event inventory

### EVT-001 — Initial architecture inventory supplied
The user supplied an inventory and corrected plan that placed editable persistence-process authority in CapitalGlass-Office-Admin, dispatch/publication orchestration in CG-AppBuilder-MCP, registry pointers in CapitalGlass-Cross-Agent, and governance validation in CG-Platform-Governance-MCP.

### EVT-002 — Milestone framing requested
The user asked for the plan to be reviewed and converted into milestones. ChatGPT interpreted the mistyped phrase as “milestone” and produced M0–M6 gates.

### EVT-003 — M0/M1 reported complete
The user reported architecture-freeze contracts and a canonical process package complete in Office Admin, with 18/18 tests passing and no App Builder, publication, dispatch, commit, or push actions.

### EVT-004 — M2 authorized
ChatGPT authorized Office Admin MCP runtime only, with explicit exclusions against App Builder changes, publication, live dispatch, gate reopening, commit, and push.

### EVT-005 — M2 reported complete
The user reported 24 MCP tools, 18/18 M1 tests, 6/6 M2 tests, and a 94-tool smoke pass. A prior idempotency validation failure had been fixed.

### EVT-006 — M3 authorized
ChatGPT required a fixture-to-tool coverage matrix and authorized the App Builder bridge, adapters, topology v2, live-probe evidence adapter, structured receipt verification, and cache verdict validator, while forbidding publication and live dispatch.

### EVT-007 — M3 reported complete
The user reported 26/26 tests, dry-run dispatch only, no publication, no outcome writes from App Builder, and a new topology-only v2 profile while preserving v1 meaning.

### EVT-008 — M4 authorized
ChatGPT authorized immutable release publication through existing Z, execution-packet registration, hot-cache compilation, Intelligence Hub metadata, bibleintel pointer linkage, and retrieval verification.

### EVT-009 — M4 reported complete
The user reported 22/22 M4 tests, a new Z CURRENT release, execution-packet registration, pointer receipts, and publication-time `CACHE_HIT`. The report also disclosed dirty-tree source identities, a real uncommitted Cross-Agent manifest change, Z CURRENT side effects, and incomplete estate-wide index-freshness publication.

### EVT-010 — M5 authorized
ChatGPT authorized exactly one controlled live dispatch, requiring live probe evidence, end-to-end correlation, duplicate suppression, stale proof without a second execution, Office Admin outcome recording, and no commits or push.

### EVT-011 — M5 reported with conflicting terminal truths
The user reported one successful GitHub Actions run and executor PASS, but preflight and post-operation cache were `CACHE_STALE`; the in-run receipt verifier returned `SCHEMA_UNSUPPORTED`; Office Admin recorded failed; and the handoff ledger recorded `dispatchVerdict: FAIL`. A post-run locally corrected verifier produced `RECEIPT_VERIFIED`.

### EVT-012 — M5 reclassified
ChatGPT declined to treat M5 as a clean operational PASS and instead classified it as `PASS_WITH_RECONCILIATION_REQUIRED`, with current-cache validation not proven.

### EVT-013 — M5.1 stabilization authorized
ChatGPT authorized no new live dispatch, exact schema compatibility mapping, nested artifact discovery fixes, immutable reconciliation records, audited ledger correction, source-identity stabilization, republishing, and a required final `CACHE_HIT` before M6.

### EVT-014 — Closeout protocol executed
The user attached the ChatGPT closeout-autopsy protocol and instructed ChatGPT to run it.

## 5. Harvest packets

### HP-001 — failure-pattern: Milestone PASS declared with unmet mandatory precondition

**Observed pattern:** A milestone completion report labeled M5 architectural validation PASS even though the M5 authorization required a valid preflight current-cache path and the report disclosed `CACHE_STALE`. The report correctly stated that current-cache validation was not claimed, but the milestone checklist still marked preflight retrieval as met.

**Impact:** Acceptance language became ambiguous. A future agent could read “M5 PASS” and miss that one required proof remained absent.

**Observed correction:** Reclassify as `PASS_WITH_RECONCILIATION_REQUIRED` and separately state that current-cache validation is not proven.

### HP-002 — failure-pattern: Terminal-state disagreement across systems

**Observed pattern:** GitHub Actions concluded success, executor receipt said PASS, corrected receipt verification said `RECEIPT_VERIFIED`, but Office Admin outcome and the handoff ledger remained failed because they consumed the earlier `SCHEMA_UNSUPPORTED` result.

**Impact:** Different operators and agents could make opposite decisions from different stores.

**Observed correction:** Preserve original evidence, append a reconciliation event, and update effective state only through an audited transition.

### HP-003 — failure-pattern: Receipt schema identifier mismatch discovered during live run

**Observed pattern:** The verification adapter expected a canonical receipt schema identifier while the executor emitted `schemaVersion: "1.0.0"`.

**Impact:** A successful executor run was classified as failed during the authorized live operation.

**Observed correction:** Define an exact compatibility mapping in the authority contract. Do not accept an unrestricted version family.

### HP-004 — failure-pattern: Publication from dirty working trees causes immediate staleness pressure

**Observed pattern:** M4 published using base SHA plus dirty-content hashes. Subsequent M5 implementation edits changed dirty hashes, so retrieval became `CACHE_STALE` before live validation.

**Impact:** Publication could be technically valid at one instant but too unstable to support the next milestone.

**Observed correction:** Freeze inputs, complete code before publication when possible, or expect a republish gate before live validation.

### HP-005 — lesson: Cache truth and live availability truth must remain separate

**Observed pattern:** The milestone contracts repeatedly required `cachedAvailabilityUsed: false` and a live runner probe for dispatch eligibility.

**Value:** This prevents a fresh process compact from being misread as proof that RYZEN9DESK is online or idle.

### HP-006 — protocol-upgrade: Milestone authorization should carry machine-checkable acceptance state

**Observed pattern:** Every authorization contained extensive prose acceptance criteria, but completion reports could still self-label PASS while disclosing exceptions.

**Improvement candidate:** Emit a compact acceptance manifest with required, optional, and blocking checks. Completion tooling should calculate verdict from the manifest rather than accept a narrative verdict.

### HP-007 — lesson: Preserve historical failure evidence

**Observed pattern:** The M5.1 authorization explicitly prohibited deleting or replacing the original `SCHEMA_UNSUPPORTED` and ledger failure evidence.

**Value:** The mismatch proves fail-closed behavior and provides evidence for compatibility and reconciliation improvements.

### HP-008 — repeated-work: Repeated milestone authorization and report interpretation

**Observed pattern:** M0/M1, M2, M3, M4, and M5 each followed a similar cycle: user report, ChatGPT interpretation, long authorization document, then another report.

**Status:** `NEEDS_REGISTRY_LOOKUP_FIRST`

**Potential duplication:** Existing harvest governance, work-package gate, or acceptance-manifest intelligence may already cover staged authorization and evidence-based completion.

## 6. Execution deltas

### ED-001 — Actual: full M5 proceeded after M4 source identities were already expected to drift

**Actual:** M4 publication used dirty-tree identities. M5 implementation changed those trees and produced `CACHE_STALE`.

**Optimal:** Complete all code required for the live validation harness before the publication freeze, then publish the exact implementation that will execute M5.

### ED-002 — Actual: receipt compatibility was discovered in the live operation

**Actual:** The executor’s real schema identifier was not accepted by the verifier until after the run.

**Optimal:** Download and validate a known executor receipt or run a contract fixture against the exact executor output schema before authorizing live dispatch.

### ED-003 — Actual: ledger finalization consumed the first verifier result

**Actual:** The ledger was marked FAIL from `SCHEMA_UNSUPPORTED` despite workflow success and a later verified receipt.

**Optimal:** Use a provisional observation state until receipt verification reaches a supported terminal verdict, or provide an explicit reconciliation transition from the start.

### ED-004 — Actual: M4 authorization permitted real publication before commits

**Actual:** Z CURRENT and the Cross-Agent manifest were changed while repositories remained dirty and uncommitted.

**Optimal:** Separate “publication integration test” from “promote CURRENT” or require a clean, reviewable source snapshot before changing shared CURRENT authority.

### ED-005 — Actual: long prose authorizations repeated common guards

**Actual:** Each milestone repeated no-commit, no-push, no-gate-reopen, and no-scope-creep rules.

**Optimal:** Define a reusable work-package guard profile and include milestone-specific deltas only.

## 7. Waste ledger

### TW-001 — Repeated restatement of shared constraints

The conversation repeatedly restated the same exclusions across milestones. This improved safety but consumed substantial review time and tokens.

**Potential reduction:** Use a stable guard block referenced by ID, with only changed permissions listed per milestone.

### TW-002 — M5 required a follow-up stabilization milestone because pre-live contract compatibility was incomplete

The live run discovered the receipt schema alias and nested artifact-path behavior.

**Potential reduction:** Add a pre-live “real artifact contract rehearsal” using a historical or synthetic artifact with the exact production packaging layout.

### TW-003 — Publication had to be stabilized again because implementation followed publication

Dirty-tree drift made `CACHE_STALE` expected.

**Potential reduction:** Move publication after implementation freeze, or publish a non-CURRENT candidate during development and promote only after source freeze.

### TW-004 — Narrative completion checklists allowed contradictory check marks

The M5 report marked preflight retrieval met while also saying `CACHE_STALE` and not claiming current-cache validation.

**Potential reduction:** Generate checklists from evidence with strict verdict equations.

## 8. Duplication detector

### DUP-001 — Staged authorization governance may already exist

The thread created M0–M6 and M5.1 authorization language. Before seeding, search existing Intelligence Hub and governance registries for:

- work-package milestone gates;
- controlled-ops authorization boundaries;
- acceptance manifests;
- no-commit/no-push guard profiles;
- cross-repository ownership matrices.

Status: `NEEDS_REGISTRY_LOOKUP_FIRST`

### DUP-002 — Cache/live-truth separation may already exist

Search for existing intelligence around:

- cache is advisory, live probe wins;
- cache applicability versus endpoint availability;
- stale publication contracts;
- source identity bindings.

Status: `NEEDS_REGISTRY_LOOKUP_FIRST`

### DUP-003 — Immutable correction and reconciliation may already exist

Search for:

- append-only outcome correction;
- terminal ledger reconciliation;
- effective verdict versus historical verdict;
- receipt re-verification;
- audit-preserving corrections.

Status: `NEEDS_REGISTRY_LOOKUP_FIRST`

## 9. Operator friction

### OF-001 — Typo recovery
The user wrote “MILES TONE,” and ChatGPT inferred “milestone.” The inference was correct in context, but an execution system should normalize common operator typos explicitly in logs.

### OF-002 — Completion reports were long and manually interpreted
The operator supplied detailed tables and constraint confirmations. ChatGPT still had to infer whether the milestone truly passed.

### OF-003 — Dirty-tree publication complicated every later verdict
Source identity was honest but operationally fragile. The operator had to track base SHA, dirty hash, candidate hash, release hash, and later drift.

### OF-004 — Multiple notions of success existed
Workflow success, executor PASS, receipt validity, ledger terminal state, Office Admin outcome, cache freshness, and gate state were all distinct. The thread needed repeated explanation to avoid collapsing them into one “PASS.”

### OF-005 — Shared authority side effects occurred before commit review
The Z CURRENT pointer and Cross-Agent manifest changed before M6, increasing rollback and review burden.

## 10. ROI backlog

### ROI-001 — Machine-readable milestone acceptance manifest
**Rank:** 1  
**Benefit:** Prevents narrative PASS labels from overriding unmet blocking conditions.  
**Observed trigger:** M5 reported PASS with `CACHE_STALE` and inconsistent terminal records.

### ROI-002 — Pre-live receipt contract rehearsal
**Rank:** 2  
**Benefit:** Detects schema aliases, nested artifact packaging, and downloader behavior before one-time live authorization.  
**Observed trigger:** `SCHEMA_UNSUPPORTED` and nested artifact discovery were found during or after M5.

### ROI-003 — Immutable reconciliation contract for terminal records
**Rank:** 3  
**Benefit:** Makes cross-system correction deterministic while preserving original evidence.  
**Observed trigger:** GHA/executor/verifier success disagreed with ledger and Office Admin failure.

### ROI-004 — Clean-source publication gate
**Rank:** 4  
**Benefit:** Reduces immediate `CACHE_STALE` caused by post-publication implementation drift.  
**Observed trigger:** M4 dirty-tree publication was stale by M5.

### ROI-005 — Shared authorization guard profile
**Rank:** 5  
**Benefit:** Reduces repeated prose and inconsistent exclusions across milestone documents.

### ROI-006 — Multi-truth status dashboard
**Rank:** 6  
**Benefit:** Displays cache freshness, runner state, workflow state, executor verdict, receipt verdict, ledger state, outcome state, and gate state separately.

## 11. Do-not-advance guards

1. Do not claim a milestone cleanly passed when a mandatory acceptance condition is explicitly unmet.
2. Do not collapse cache freshness, live availability, dispatch success, executor success, receipt verification, ledger state, or gate state into one status.
3. Do not overwrite failed evidence after a compatibility correction.
4. Do not manually edit terminal ledger records; use an audited reconciliation transition.
5. Do not accept broad receipt-version aliases.
6. Do not claim current-cache validation from a `CACHE_STALE` run.
7. Do not use a workflow conclusion alone as proof of process completion.
8. Do not promote shared CURRENT authority from unreviewed source drift without explicit rollback evidence.
9. Do not claim Cursor validation, hub publication, operational status, or full seeding from this ChatGPT draft.
10. Do not advance these seeds before duplication lookup.

## 12. Seed packet candidates

### Seed candidate 1 — Acceptance manifest

```json
{
  "seedId": "IH-THREAD-MILESTONE-ACCEPTANCE-MANIFEST-001",
  "kind": "protocol-upgrade",
  "title": "Calculate milestone verdicts from machine-readable blocking criteria",
  "status": "CANDIDATE",
  "duplicateRisk": "NEEDS_REGISTRY_LOOKUP_FIRST",
  "retrievalQuestions": [
    "How should an agent determine whether a milestone report is PASS, PASS_WITH_RECONCILIATION_REQUIRED, or FAIL?",
    "What prevents a narrative completion report from overriding an unmet blocking precondition?"
  ],
  "evidenceRefs": [
    "EVT-010 through EVT-013",
    "HP-001",
    "TW-004"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A work package has many acceptance checks and a report contains caveats or contradictory check marks.",
    "startAt": "Load the milestone acceptance manifest and classify every check as required, optional, blocking, or informational.",
    "runPreflight": "Compare claimed verdict to evidence-derived verdict before authorizing the next milestone.",
    "doNot": "Do not accept the report's headline verdict without recomputing it.",
    "proveBeforeClaiming": "Show all blocking criteria satisfied or explicitly classify the milestone as partial/reconciliation-required."
  }
}
```

### Seed candidate 2 — Receipt compatibility rehearsal

```json
{
  "seedId": "IH-THREAD-RECEIPT-CONTRACT-REHEARSAL-001",
  "kind": "failure-pattern",
  "title": "Rehearse exact executor receipt schemas and artifact layouts before live dispatch",
  "status": "CANDIDATE",
  "duplicateRisk": "NEEDS_REGISTRY_LOOKUP_FIRST",
  "retrievalQuestions": [
    "What receipt schema and artifact layout must be verified before authorizing a one-shot live execution?",
    "How should a verifier handle an exact legacy schema identifier without accepting an unrestricted version range?"
  ],
  "evidenceRefs": [
    "EVT-011",
    "HP-003",
    "ED-002",
    "TW-002"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A live workflow will produce an artifact consumed by a newly written verifier or downloader.",
    "startAt": "Obtain a representative artifact using the exact executor schema identifier and packaging layout.",
    "runPreflight": "Run schema validation, nested-path discovery, zero-match, ambiguous-match, and malformed-artifact tests.",
    "doNot": "Do not discover compatibility rules during the only authorized live run.",
    "proveBeforeClaiming": "Demonstrate RECEIPT_VERIFIED against a representative production-format artifact before dispatch."
  }
}
```

### Seed candidate 3 — Audited terminal reconciliation

```json
{
  "seedId": "IH-THREAD-AUDITED-TERMINAL-RECONCILIATION-001",
  "kind": "lesson",
  "title": "Preserve original terminal evidence and append an audited effective-state correction",
  "status": "CANDIDATE",
  "duplicateRisk": "NEEDS_REGISTRY_LOOKUP_FIRST",
  "retrievalQuestions": [
    "How should a system reconcile a failed ledger verdict after later receipt verification proves execution succeeded?",
    "What evidence must be preserved when correcting an outcome caused by verifier incompatibility?"
  ],
  "evidenceRefs": [
    "EVT-011 through EVT-013",
    "HP-002",
    "HP-007"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "Workflow, executor, verifier, ledger, and outcome stores disagree about one operation.",
    "startAt": "Freeze all original evidence and correlate handoff ID, operation key, request ID, workflow run ID, and receipt.",
    "runPreflight": "Verify that the correction uses an approved compatibility rule and does not create a second execution.",
    "doNot": "Do not delete, rewrite, or manually patch the original failed evidence.",
    "proveBeforeClaiming": "Produce an immutable reconciliation record and show the effective state calculation."
  }
}
```

### Seed candidate 4 — Stable publication source freeze

```json
{
  "seedId": "IH-THREAD-STABLE-PUBLICATION-FREEZE-001",
  "kind": "protocol-upgrade",
  "title": "Publish current cache only after implementation source freeze",
  "status": "CANDIDATE",
  "duplicateRisk": "NEEDS_REGISTRY_LOOKUP_FIRST",
  "retrievalQuestions": [
    "When should a dirty-tree source identity be allowed to promote a shared CURRENT cache release?",
    "How can a live validation avoid becoming CACHE_STALE immediately after publication?"
  ],
  "evidenceRefs": [
    "EVT-009 through EVT-011",
    "HP-004",
    "ED-001",
    "TW-003"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A publication milestone precedes implementation needed by the next live validation milestone.",
    "startAt": "Determine whether remaining implementation will alter any publication input or source identity.",
    "runPreflight": "Freeze source identities only after validation harness code is complete, or publish a non-CURRENT candidate.",
    "doNot": "Do not claim current-cache validation after known source drift.",
    "proveBeforeClaiming": "Recompute identity, binding, and CACHE_HIT immediately before the live operation."
  }
}
```

## 13. Future-agent instructions

When a future agent encounters a similar milestone chain:

1. Retrieve the authoritative work-package contract, not only the latest completion summary.
2. Build an evidence table with one row per acceptance criterion.
3. Keep distinct status fields for cache, runner, workflow, executor, receipt, ledger, outcome, and gate.
4. Recompute the milestone verdict from evidence.
5. Treat caveats involving mandatory checks as blockers or reconciliation requirements.
6. Before live execution, rehearse the exact receipt schema and artifact folder layout.
7. Do not promote a current cache release until the implementation inputs are stable enough to remain current through the next gate.
8. On disagreement, preserve all events and append a reconciliation record.
9. Require duplicate suppression evidence before any retry discussion.
10. Search the intelligence registry for existing acceptance, reconciliation, and cache/live-truth patterns before creating new seeds.

## 14. Publication truth table

| Layer | State |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | pending commit result at file creation time |
| L: draft staging (GitHub Action) | not-run |
| Cursor ingest | not-run |
| L: Hub catalog | not-run |
| Z: AI cache | not-run |
| Supabase projection | not-run |
| Freshness gate | not-run |

```text
Publication: NOT_RUN_BY_CURSOR
projection.hubPublishStatus: not-run
```

The M4/M5 publication claims discussed elsewhere in this findings file belong to the observed RYZEN9DESK work package. They are not publication of this harvest.

## 15. Acceptance checklist

- [x] OBSERVED lane used.
- [x] Chat-visible conversation treated as evidence source.
- [x] Retrieval preflight states index unavailable in ChatGPT context.
- [x] Event inventory uses `EVT-###` identifiers.
- [x] Harvest packets use `HP-###` identifiers.
- [x] Execution deltas use `ED-###` identifiers.
- [x] Waste ledger uses `TW-###` identifiers.
- [x] Duplication detector uses `DUP-###` identifiers.
- [x] Operator friction uses `OF-###` identifiers.
- [x] ROI backlog is ranked.
- [x] Do-not-advance guards are included.
- [x] Seed candidates include at least two retrieval questions and future-agent instructions.
- [x] Candidate seeds are not labeled approved.
- [x] No claim of Cursor validation, harvest completion, operational status, or hub publication.
- [x] No credentials or secrets intentionally included.
- [ ] Cursor duplication preflight not run.
- [ ] Cursor validation not run.
- [ ] Intelligence publication not run.

## 16. Next operator action

After this file is pushed, hand it to Cursor:

```bash
git checkout chat-gpt-harvest && git pull origin chat-gpt-harvest

npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-06-ryzen9desk-milestone-governance-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-06-ryzen9desk-milestone-governance-v1

npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-06-ryzen9desk-milestone-governance-v1
npm run harvest:sync-derived -- harvest-2026-08-06-ryzen9desk-milestone-governance-v1
npm run harvest:validate -- harvest-2026-08-06-ryzen9desk-milestone-governance-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-06-ryzen9desk-milestone-governance-v1
npm run test:harvest
```

Operator publication remains separate:

```bash
npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-06-ryzen9desk-milestone-governance-v1
```

L: move: NOT_RUN_BY_CHATGPT  
Publication: NOT_RUN_BY_CURSOR
