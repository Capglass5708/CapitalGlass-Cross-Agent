# ChatGPT Findings Source — Bid Composer Integration Planning

## 1. Final summary

```text
Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Start verdict: UNHARVESTED_THREAD
Target tier: T2
Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION
```

This thread established that CapitalGlass-BidComposer should be treated as the commercial integration and reconciliation point for CapitalGlassRevu MCP, Human Estimator MCP, Computer Estimator, and Visual Asset Engine. The conversation also surfaced that the current repository is a single Next.js application with a worker, MCP runtime, Supabase migrations, and a large `src/lib` layer that mixes business logic, persistence, integration behavior, orchestration, and proposal workflows.

The durable lesson is not merely to reorganize folders. Bid Composer needs explicit source-of-truth boundaries, versioned inbound contracts, immutable evidence storage, candidate-data staging, estimator review, and controlled promotion into authoritative bid state.

## 2. Harvest verdict and tier rationale

**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

**Tier:** T2

**Rationale:** The thread contains multiple durable architecture findings, a correction to the initial planning model, repository observations, integration ownership decisions, and several reusable workflow improvements. It does not contain verified implementation or deployment completion.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

GitHub repository reads were performed during the conversation for current structure cross-checking, but no Intelligence Hub scout, harvest registry lookup, Cursor validation, deployment verification, or publication command was run.

## 4. Scope ledger

### Primary mission

Determine the current CapitalGlass-BidComposer repository structure and define its intended role as the integration point for:

- CapitalGlassRevu MCP
- Human Estimator MCP
- Computer Estimator
- Visual Asset Engine

### Closed lanes

- Current high-level repository structure identified.
- Current runtime shape identified as Next.js app plus Bid Composer worker.
- Current `src/lib` architectural compression identified.
- Bid Composer integration role clarified.
- Initial source-of-truth boundaries stated.
- Recommended integration adapter names and canonical ingestion flow stated.

### Open lanes

- Verify complete file and dependency inventory in Cursor.
- Verify exact interfaces exposed by each upstream repo.
- Verify whether Human Estimator MCP is strictly read-only in all current code paths.
- Verify current Revu contract version and all supported evidence types.
- Verify Computer Estimator output schemas.
- Verify Visual Asset Engine asset lifecycle and approval contract.
- Produce canonical authority matrix and integration registry.
- Decide disposition of large Bid Composer PR #55 after code-level review.
- Implement and validate repository restructuring.

### Unrelated follow-ups

None identified.

### Deferred work

- No code changes were requested during the planning portion.
- No migration changes were applied.
- No PR was modified or merged.
- No deployment was performed.

### Do-not-merge boundaries

- Do not merge integration planning directly into implementation without contract verification.
- Do not let upstream adapters write authoritative bid state directly.
- Do not merge broad repository restructuring with unrelated feature expansion.
- Do not treat ChatGPT repository observations as canonical until Cursor verifies the checkout.

## 5. Correction ledger

### COR-001 — Generic integration hub model corrected to named suite integration point

- **priorAssumption:** Bid Composer should be a general integration hub for a broad set of upstream and downstream repositories.
- **correction:** The user explicitly identified the core integration set as Revu MCP, Human Estimator MCP, Computer Estimator, and Visual Asset Engine.
- **correctedModel:** Bid Composer is the commercial reconciliation authority where these four systems contribute evidence, recommendations, extracted data, and visual assets.
- **affectedFindings:** EVT-004, HP-002, HP-004, ROI-001, ROI-002, IH-THREAD-BID-INTEGRATION-AUTHORITY-001.
- **futurePrevention:** Ask architecture planning to name the authoritative producer set before proposing a broad integration registry.

### COR-002 — Proposed target structure distinguished from current repository structure

- **priorAssumption:** The conceptual `apps/packages/domain/application/integrations` structure could be read as the repository's current shape.
- **correction:** The user asked what the repository currently looks like.
- **correctedModel:** Current structure is a single Next.js repo with `src/app`, `src/components`, overloaded `src/lib`, `services/bid-composer-worker`, `mcp/human-estimator`, `supabase/migrations`, large scripts, docs, fixtures, and artifacts.
- **affectedFindings:** EVT-002, HP-001, ED-001, ROI-003.
- **futurePrevention:** Label all architecture trees as `CURRENT`, `TARGET`, or `TRANSITIONAL`.

## 6. Thread event inventory

| ID | Event | Evidence class | Durable lesson | futureEfficiencyImpact |
| --- | --- | --- | --- | --- |
| EVT-001 | User initiated planning for Bid Composer repository restructuring and integration preparation. | CHAT_DIRECT | Architecture should be planned before moving code. | Future agents can avoid premature file moves and first establish ownership and contracts. |
| EVT-002 | Repository inspection showed a single Next.js application with worker, MCP runtime, Supabase migrations, scripts, docs, fixtures, and artifacts. | CROSS_CHECK_CANDIDATE | Current shape must be documented before proposing target architecture. | A verified current-state map prevents inaccurate migration plans and duplicate abstractions. |
| EVT-003 | `src/lib` was identified as carrying domain logic, repositories, orchestration, integration clients, pricing, proposal, issuance, and revision behavior. | CROSS_CHECK_CANDIDATE | The restructuring problem is architectural compression, not merely folder naming. | Future work can target dependency boundaries instead of performing cosmetic renames. |
| EVT-004 | User stated Bid Composer should integrate Revu MCP, Human Estimator MCP, Computer Estimator, and Visual Asset Engine. | CHAT_DIRECT | Named producer systems should drive the integration architecture and authority matrix. | Agents can begin from the exact producer set and skip broad ecosystem speculation. |
| EVT-005 | Bid Composer was defined as owner of accepted quantities, assemblies, pricing, scope, proposal revisions, issuance, and outcomes. | CHAT_DIRECT | Bid Composer owns commercial truth; upstream systems own source evidence and specialized execution. | Prevents direct upstream mutation of bid authority and reduces reconciliation defects. |
| EVT-006 | A shared ingestion lifecycle was proposed: receive, authenticate, validate, deduplicate, store evidence, normalize, generate candidates, review, promote. | CHAT_DIRECT | All integrations should converge on one controlled promotion pipeline. | A single reusable pipeline reduces four separate ingestion implementations and inconsistent controls. |
| EVT-007 | User supplied the ChatGPT closeout autopsy protocol and ordered it to run. | ATTACHMENT_SOURCE | Protocol execution requires DRAFT_FILE declaration, structured findings, dedicated branch push, and Cursor handoff. | Standardized closeout converts transient architecture discussion into reusable intelligence. |

## 7. Harvest packets

### HP-001 — Architecture observation

- **kind:** observed_architecture
- **evidenceClass:** CROSS_CHECK_CANDIDATE
- **finding:** Bid Composer is currently a feature-organized Next.js repository with a separate worker and large operational script surface. Its principal structural pressure is the overloaded `src/lib` directory.
- **durable:** true
- **futureEfficiencyImpact:** Start restructuring with dependency classification and module ownership rather than a bulk directory move.

### HP-002 — Ownership boundary

- **kind:** architecture_boundary
- **evidenceClass:** CHAT_DIRECT
- **finding:** Revu MCP owns markup and measurement evidence; Human Estimator MCP owns advisory estimator intelligence; Computer Estimator owns machine extraction outputs; Visual Asset Engine owns generated visual assets; Bid Composer owns approved commercial bid state.
- **durable:** true
- **futureEfficiencyImpact:** Clear ownership prevents duplicated logic, database writes across boundaries, and disputes over source of truth.

### HP-003 — Data promotion pattern

- **kind:** coding_pattern
- **evidenceClass:** CHAT_DIRECT
- **finding:** Separate immutable source evidence, normalized candidate bid data, and authoritative approved bid data.
- **durable:** true
- **futureEfficiencyImpact:** This three-level model allows replay, audit, estimator approval, and source correction without silently overwriting commercial truth.

### HP-004 — Integration contract pattern

- **kind:** protocol_upgrade
- **evidenceClass:** CHAT_DIRECT
- **finding:** Every upstream system should use a versioned envelope with source identity, record identity, revision/run identity, idempotency, correlation, timestamps, hashes, payload, and evidence references.
- **durable:** true
- **futureEfficiencyImpact:** Shared envelope semantics reduce bespoke adapter code and make contract testing reusable.

### HP-005 — Migration strategy

- **kind:** planning_technique
- **evidenceClass:** CHAT_DIRECT
- **finding:** Use behavior-preserving staged extraction and a strangler pattern; do not perform a large all-at-once folder move.
- **durable:** true
- **futureEfficiencyImpact:** Smaller deployable PRs reduce merge conflicts, CI ambiguity, and rollback cost.

### HP-006 — Validation rule

- **kind:** validation_rule
- **evidenceClass:** CHAT_DIRECT
- **finding:** No adapter should write bid authority tables directly; API routes should not contain commercial domain rules; material commercial changes require review and promotion.
- **durable:** true
- **futureEfficiencyImpact:** Architecture tests can catch boundary violations before integration defects reach production.

### HP-007 — Operator preference

- **kind:** operator_preference
- **evidenceClass:** CHAT_DIRECT
- **finding:** The operator wants Bid Composer intentionally designed as the suite integration point, not treated as an isolated proposal application.
- **durable:** true
- **futureEfficiencyImpact:** Future planning should frame changes in terms of suite orchestration and commercial authority from the first response.

### HP-008 — Closeout protocol

- **kind:** workflow_protocol
- **evidenceClass:** ATTACHMENT_SOURCE
- **finding:** ChatGPT harvest output remains draft-only, must be pushed to `chat-gpt-harvest`, and cannot claim Cursor validation, publication, or operational status.
- **durable:** true
- **futureEfficiencyImpact:** Preserves publication truth and avoids false completion claims.

## 8. Execution deltas

### ED-001 — Target architecture was presented before current-state structure was explicitly requested

- **actual:** The conversation first produced a detailed target structure and migration plan.
- **optimal:** First produce a labeled current-state inventory, then target-state architecture, then transition sequence.
- **impact:** The user had to ask, “Currently what is the structure?”
- **linkedROI:** ROI-003

### ED-002 — Integration ecosystem was initially broader than the user’s named core systems

- **actual:** Early planning included Document Center, Proposal Generator, AppBuilder MCP, and other suite systems in the principal integration model.
- **optimal:** Start from the four explicitly named core producer systems, then add supporting systems in a secondary registry.
- **impact:** Risk of diluting the central architecture decision.
- **linkedROI:** ROI-001

### ED-003 — Repository structure evidence was summarized without a full tree checkout

- **actual:** Current structure was inferred from README, package scripts, and PR file lists available through GitHub connector calls.
- **optimal:** Cursor should generate a complete tracked-file tree and dependency graph from the branch under review.
- **impact:** Current summary is useful but remains a cross-check candidate.
- **linkedROI:** ROI-004

## 9. Waste ledger

### TW-001 — Repeated explanation of integration role

- **wasteType:** repeated_architecture_explanation
- **description:** The thread restated Bid Composer’s integration role in multiple diagrams and sections before converting it into a compact authority matrix.
- **cause:** No single canonical system-boundary table was established at the beginning.
- **prevention:** Create one authority matrix first, then derive folder structure and workflows from it.

### TW-002 — Proposed structure risked being mistaken for current structure

- **wasteType:** labeling_ambiguity
- **description:** A target monorepo-style tree appeared before a current repository tree was shown.
- **cause:** Missing `CURRENT`, `TARGET`, and `TRANSITION` labels.
- **prevention:** Require state labels on every architecture diagram.

## 10. Duplication detector

### DUP-001

- **classification:** POSSIBLE_EXISTING_IMPLEMENTATION
- **evidenceClass:** CROSS_CHECK_CANDIDATE
- **description:** The current repo already contains early `bid-composer-domain` and `bid-composer-application` folders for Revu takeoff. A new restructuring effort may duplicate partial boundary work.
- **requiredAction:** `NEEDS_REGISTRY_LOOKUP_FIRST`; inspect existing modules and tests before creating replacement abstractions.

### DUP-002

- **classification:** POSSIBLE_EXISTING_HARVEST
- **evidenceClass:** ATTACHMENT_SOURCE
- **description:** The protocol references a prior pilot harvest and thread-autopsy index patterns. This thread cannot confirm whether a similar Bid Composer architecture seed already exists.
- **requiredAction:** Cursor must run duplication preflight before publication.

### DUP-003

- **classification:** REPEATED_DISCUSSION
- **evidenceClass:** CHAT_DIRECT
- **description:** Bid Composer’s role as integration point was explained repeatedly after the user clarified the four systems.
- **requiredAction:** Compress future architecture responses around a single authority table and one ingestion lifecycle.

## 11. Operator friction

### OF-001 — Current versus target ambiguity

The operator had to explicitly ask for the current structure after receiving a target architecture proposal.

### OF-002 — Core integration set needed correction

The operator clarified the exact systems that should define the integration point.

### OF-003 — Planning needed to remain architecture-first

The operator’s sequence indicates a preference for understanding and aligning the repository model before implementation.

## 12. ROI backlog

### ROI-001 — Establish the four-system authority matrix first

- **rank:** 1
- **improvementType:** planning_technique
- **finding:** Make Revu MCP, Human Estimator MCP, Computer Estimator, Visual Asset Engine, and Bid Composer ownership explicit before designing modules.
- **futureSavings:**
  - **tokenSavingsEstimate:** high
  - **timeSavingsEstimate:** high
  - **toolCallsAvoided:** 4
  - **repeatedInvestigationAvoided:** true
  - **implementationReworkAvoided:** true
  - **appliesTo:** ["cursor_planning", "repository_retrieval", "coding", "testing"]
  - **futureEfficiencyImpact:** Future agents can map every interface and mutation to an owner without re-debating the suite architecture.
- **optimalFutureWorkflow:**
  1. Read the existing Bid Composer ownership and integration bridge documents.
  2. Inventory contracts exposed by the four producer systems.
  3. Build a field-level authority matrix for evidence, candidate data, and commercial truth.
  4. Reject any design that lets producers mutate authoritative bid records directly.
  5. Use the approved matrix to derive adapters, application services, and tests.

### ROI-002 — Standardize a single evidence-to-authority promotion pipeline

- **rank:** 2
- **improvementType:** coding_pattern
- **finding:** All four integrations should use one intake lifecycle and three-level data model.
- **futureSavings:**
  - **tokenSavingsEstimate:** high
  - **timeSavingsEstimate:** high
  - **toolCallsAvoided:** 6
  - **repeatedInvestigationAvoided:** true
  - **implementationReworkAvoided:** true
  - **appliesTo:** ["coding", "testing", "debugging", "deployment"]
  - **futureEfficiencyImpact:** One pipeline removes duplicated validation, idempotency, review, audit, and promotion logic across integrations.
- **optimalFutureWorkflow:**
  1. Define the canonical inbound envelope and lifecycle states.
  2. Persist immutable source receipts before normalization.
  3. Map payloads into candidate records without changing bid authority.
  4. Reconcile candidates against current revision state.
  5. Require estimator promotion for material commercial changes.
  6. Contract-test each producer against the same lifecycle fixtures.

### ROI-003 — Label current, target, and transitional architecture separately

- **rank:** 3
- **improvementType:** prompt_compression
- **finding:** Every architecture response and artifact should distinguish the observed repository from the desired structure and migration state.
- **futureSavings:**
  - **tokenSavingsEstimate:** medium
  - **timeSavingsEstimate:** high
  - **toolCallsAvoided:** 2
  - **repeatedInvestigationAvoided:** true
  - **implementationReworkAvoided:** true
  - **appliesTo:** ["cursor_planning", "repository_retrieval", "coding"]
  - **futureEfficiencyImpact:** Clear state labels prevent users and agents from treating conceptual folders as already implemented.
- **optimalFutureWorkflow:**
  1. Generate `CURRENT.md` from the repository tree and dependency scan.
  2. Define `TARGET.md` from approved authority boundaries.
  3. Define `TRANSITION.md` as a PR-by-PR strangler sequence.
  4. Require all diagrams and issues to reference one of those states.

### ROI-004 — Verify structure with a complete dependency inventory

- **rank:** 4
- **improvementType:** retrieval_technique
- **finding:** README, package scripts, and PR file lists are insufficient for final restructuring decisions.
- **futureSavings:**
  - **tokenSavingsEstimate:** medium
  - **timeSavingsEstimate:** medium
  - **toolCallsAvoided:** 3
  - **repeatedInvestigationAvoided:** true
  - **implementationReworkAvoided:** true
  - **appliesTo:** ["repository_retrieval", "cursor_planning", "testing"]
  - **futureEfficiencyImpact:** A generated module and dependency map reveals circular imports and existing abstractions before new code is designed.

### ROI-005 — Add executable architecture gates

- **rank:** 5
- **improvementType:** validation_rule
- **finding:** Enforce boundaries in CI rather than relying only on architecture documents.
- **futureSavings:**
  - **tokenSavingsEstimate:** medium
  - **timeSavingsEstimate:** high
  - **toolCallsAvoided:** 5
  - **repeatedInvestigationAvoided:** true
  - **implementationReworkAvoided:** true
  - **appliesTo:** ["coding", "testing", "debugging", "deployment"]
  - **futureEfficiencyImpact:** Dependency tests stop direct database writes and domain-to-adapter imports before review.

## 13. Do-not-advance guards

- Do not claim the current repository inventory is complete until Cursor inspects the checkout.
- Do not claim any integration contract is implemented without producer and consumer tests.
- Do not allow Revu MCP, Human Estimator MCP, Computer Estimator, or Visual Asset Engine to write authoritative bid state directly.
- Do not collapse source evidence and accepted commercial data into one table or object lifecycle.
- Do not move all files in one PR.
- Do not merge large feature work with the architecture foundation.
- Do not claim PR #55 is safe to merge based only on this chat.
- Do not claim `HARVEST_COMPLETE`, `OPERATIONAL`, `FULLY_SEEDED`, or publication success.

## 14. Seed packet candidates

### Seed candidate 1

```json
{
  "seedId": "IH-THREAD-BID-INTEGRATION-AUTHORITY-001",
  "kind": "lesson",
  "status": "CANDIDATE",
  "improvementType": "planning_technique",
  "summary": "Define Bid Composer as commercial authority and the four connected estimators/engines as evidence producers before restructuring code.",
  "futureSavings": {
    "tokenSavingsEstimate": "high",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 4,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["cursor_planning", "repository_retrieval", "coding", "testing"],
    "futureEfficiencyImpact": "Agents skip broad architecture debate and immediately classify every field, command, and contract by authority owner."
  },
  "optimalFutureWorkflow": [
    "1. Open existing ownership and integration bridge documents.",
    "2. Inventory Revu MCP, Human Estimator MCP, Computer Estimator, and VAE contracts.",
    "3. Create an authority matrix covering evidence, candidates, and approved bid state.",
    "4. Design adapters only after ownership is approved.",
    "5. Prove no producer can mutate commercial authority directly."
  ],
  "retrievalQuestions": [
    "Which repository currently owns each field that Bid Composer consumes from the four producer systems?",
    "Which existing Bid Composer routes or repositories permit direct mutation from upstream evidence?"
  ],
  "evidenceRefs": [
    {"ref": "chat:user-core-integration-set", "classification": "CHAT_DIRECT"},
    {"ref": "chat:assistant-source-of-truth-boundaries", "classification": "CHAT_DIRECT"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "When planning Bid Composer integrations or repository restructuring",
    "startAt": "Authority matrix and current integration contracts",
    "runPreflight": "Search existing architecture, ownership, and contract files before designing replacements",
    "doNot": "Do not treat upstream outputs as approved commercial truth",
    "proveBeforeClaiming": "Contract tests and mutation-boundary tests"
  }
}
```

### Seed candidate 2

```json
{
  "seedId": "IH-THREAD-EVIDENCE-PROMOTION-PIPELINE-001",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "improvementType": "coding_pattern",
  "summary": "Use one evidence-to-candidate-to-authority pipeline for all Bid Composer integrations.",
  "futureSavings": {
    "tokenSavingsEstimate": "high",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 6,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["coding", "testing", "debugging", "deployment"],
    "futureEfficiencyImpact": "Agents reuse one ingestion state machine and avoid building separate review and idempotency behavior for every integration."
  },
  "optimalFutureWorkflow": [
    "1. Validate a versioned source envelope.",
    "2. Persist immutable receipt and provenance.",
    "3. Normalize into candidate records.",
    "4. Reconcile against the active bid revision.",
    "5. Require review for material changes.",
    "6. Promote approved candidates and emit a receipt."
  ],
  "retrievalQuestions": [
    "Where are current ingestion receipts, idempotency keys, and active-run pointers stored?",
    "Which existing services already separate evidence from approved bid state?"
  ],
  "evidenceRefs": [
    {"ref": "chat:shared-integration-pipeline", "classification": "CHAT_DIRECT"},
    {"ref": "github:bid-composer-ingestion-readme-and-files", "classification": "CROSS_CHECK_CANDIDATE"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "When adding any new Bid Composer producer integration",
    "startAt": "Existing ingestion lifecycle and canonical envelope",
    "runPreflight": "Inspect current ingestion repositories, RPCs, and promotion gates",
    "doNot": "Do not create a producer-specific direct-write path",
    "proveBeforeClaiming": "Replay, duplicate delivery, stale revision, rejection, and promotion tests"
  }
}
```

### Seed candidate 3

```json
{
  "seedId": "IH-THREAD-ARCHITECTURE-STATE-LABELS-001",
  "kind": "failure-pattern",
  "status": "CANDIDATE",
  "improvementType": "prompt_compression",
  "summary": "Always label architecture artifacts as CURRENT, TARGET, or TRANSITIONAL.",
  "futureSavings": {
    "tokenSavingsEstimate": "medium",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 2,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["cursor_planning", "repository_retrieval", "coding"],
    "futureEfficiencyImpact": "Users and agents stop confusing proposed folder trees with implemented repository state."
  },
  "optimalFutureWorkflow": [
    "1. Generate and verify a CURRENT repository map.",
    "2. Approve a TARGET architecture from authority boundaries.",
    "3. Write a TRANSITION sequence with compatibility stages.",
    "4. Reference the state label in every issue and PR."
  ],
  "retrievalQuestions": [
    "What is the verified current repository tree and dependency direction?",
    "Which proposed modules already exist partially under different names?"
  ],
  "evidenceRefs": [
    {"ref": "chat:user-current-structure-question", "classification": "CHAT_DIRECT"},
    {"ref": "chat:assistant-target-tree-before-current-tree", "classification": "CHAT_DIRECT"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "When presenting architecture or migration plans",
    "startAt": "Verified current-state artifact",
    "runPreflight": "Compare proposed paths with tracked repository paths",
    "doNot": "Do not present unlabeled conceptual trees",
    "proveBeforeClaiming": "Repository tree and dependency scan"
  }
}
```

## 15. Future-agent instructions

1. Begin with a complete repository tree and dependency scan from the exact Bid Composer branch under review.
2. Read existing ownership, integration bridge, migration, and application-boundary documents before proposing replacements.
3. Inventory producer contracts from Revu MCP, Human Estimator MCP, Computer Estimator, and Visual Asset Engine.
4. Create a field-level authority matrix before moving code.
5. Identify existing partial domain/application abstractions and preserve useful behavior.
6. Define one canonical source envelope and evidence promotion state machine.
7. Add contract and architecture tests before extracting modules.
8. Split restructuring into behavior-preserving PRs.
9. Treat all implementation, CI, migration, and deployment claims from this findings file as unverified until Cursor proves them.

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

- [x] DRAFT_FILE mode declared.
- [x] CHAT_CONTEXT_ONLY lane preserved.
- [x] Retrieval state uses `INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT`.
- [x] Scope ledger included.
- [x] Correction ledger included.
- [x] EVT inventory includes evidence classifications.
- [x] Eight harvest packet kinds are represented as applicable.
- [x] Execution deltas included.
- [x] Waste ledger included.
- [x] Duplication detector included.
- [x] Operator friction included.
- [x] ROI backlog ranked.
- [x] ROI top three include improvement type, future savings, and optimal workflow.
- [x] At least one seed exists for each top-three ROI item.
- [x] Seed candidates include retrieval questions and classified evidence references.
- [x] Do-not-advance guards included.
- [x] Publication truth remains entirely `not-run`.
- [x] No `HARVEST_COMPLETE`, `OPERATIONAL`, or `FULLY_SEEDED` claim made.

## 18. Next operator action

Pull branch `chat-gpt-harvest` on `Capglass5708/CapitalGlass-Cross-Agent`, then run:

```bash
npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-05-bid-composer-integration-planning-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-05-bid-composer-integration-planning-v1
```

Then Cursor should run duplication preflight, derived sync, validation, autopsy validation, and tests. Publication remains an operator action.

## 19. Git push record

```text
Repo: Capglass5708/CapitalGlass-Cross-Agent
Branch: chat-gpt-harvest
File: artifacts/agent-runs/harvest-2026-08-05-bid-composer-integration-planning-v1/chatgpt-findings-source.md
Commit message: harvest(chatgpt): draft findings harvest-2026-08-05-bid-composer-integration-planning-v1
```
