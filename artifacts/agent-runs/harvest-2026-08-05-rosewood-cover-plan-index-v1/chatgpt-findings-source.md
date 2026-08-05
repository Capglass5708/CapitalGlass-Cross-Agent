# ChatGPT Thread Autopsy Findings — Rosewood Cover Sheet and Plan Index

**Mode:** `DRAFT_FILE`  
**Mission:** `chat-thread-closeout-autopsy-harvest-chatgpt-v1`  
**Lane:** `CHAT_CONTEXT_ONLY`  
**Intelligence kind:** `OBSERVED`  
**Start verdict:** `UNHARVESTED_THREAD`  
**Target tier:** `T2`  
**Output verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`  
**Harvest ID:** `harvest-2026-08-05-rosewood-cover-plan-index-v1`

> Draft observed-thread evidence only. Not authoritative for code, schema, deployment, database state, index state, Intelligence Hub publication, or Master Graph release state.

## 1. Final summary

The thread began with a user-reported Rosewood cover-sheet extraction and partial page map. The operator then asked where the data should live. The discussion converged on normalized Supabase tables for plan-set identity, cover-sheet facts, page/sheet indexing, extraction provenance, and operator review. The operator narrowed scope to cover sheet and plan indexing, then separated CG Master Graph into a side chat until stable operational identifiers exist.

Durable observed outcomes:

1. Capital Glass internal project identity must remain separate from drawing-authored identity.
2. Cover and plan-index data should be normalized in Supabase rather than stored as one large JSON object.
3. Page 1 / `I.000.0` is cover authority; page 2 / `I.001.0` is index authority, based on user-reported extraction.
4. Master Graph should project relationships, not own extracted operational values.
5. Cursor must verify schema overlap and operational claims before implementation or publication.

**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

## 2. Harvest verdict and tier rationale

**Harvest verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`  
**Tier:** `T2`

The thread contains multiple corrections and reusable architecture decisions across identity, persistence, page indexing, operator review, and graph boundaries. Operational results were pasted by the user but not independently verified in this ChatGPT lane.

Forbidden claims intentionally not made: `INDEX_HIT`, `HARVEST_COMPLETE`, `OPERATIONAL`, `FULLY_SEEDED`, migration applied, records inserted, graph published.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

## 4. Scope ledger

### Primary mission

Produce an OBSERVED thread autopsy for Rosewood cover-sheet and plan-index persistence.

### Closed lanes

- User reported R1A extraction results.
- Operator review dispositions were discussed.
- Normalized-table direction was selected conversationally.
- Master Graph side-chat boundary was selected conversationally.

### Open lanes

- Verify current Supabase schema and overlapping tables.
- Resolve the actual project UUID for `CG-2033-26`.
- Reconcile all 192 pages.
- Persist plan-set, sheets, cover fields, runs, and reviews.
- Validate Master Graph contribution after stable IDs exist.
- Run Cursor ingest, duplication preflight, validation, and publication gates.

### Deferred work

Window/door schedules, elevations, takeoff, pricing, Bid Composer, and graph release publication.

### Do-not-merge boundaries

- Do not mix OBSERVED autopsy with ADVANCEMENT synthesis.
- Do not merge Supabase value authority with Master Graph relationship authority.
- Do not merge internal project ID with drawing project number.
- Do not merge cover/index registration with downstream estimating scope.

## 5. Correction ledger

### COR-001 — Internal project ID is not drawing project number

- **priorAssumption:** `CG-2033-26` might be the drawing project number.
- **correction:** It is the Capital Glass / Document Center identifier unless independently shown on the drawing.
- **correctedModel:** Internal project ID remains `CG-2033-26`; drawing project number is `not_shown` until verified.
- **affectedFindings:** `EVT-003`, `HP-002`, `ROI-002`
- **futurePrevention:** Require identity namespace on every project-number field.

### COR-002 — Owner/client must not be inferred

- **priorAssumption:** Owner might be inferred from project context.
- **correction:** No owner entity was confirmed.
- **correctedModel:** Null value with status `not_shown_pending_source`.
- **affectedFindings:** `EVT-003`, `HP-004`, `ROI-003`
- **futurePrevention:** Require source evidence for owner population.

### COR-003 — Page 2 is index authority

- **priorAssumption:** The cover sheet would contain the full index.
- **correction:** User reported the full index on page 2 / `I.001.0`.
- **correctedModel:** Separate cover authority from index authority.
- **affectedFindings:** `EVT-002`, `HP-001`, `ROI-001`

### COR-004 — Go directly to normalized tables

- **priorAssumption:** `project_documents.metadata` could be the initial durable store.
- **correction:** Operator explicitly chose normalized tables immediately.
- **correctedModel:** Use relational tables for plan sets, sheets, cover fields, runs, and reviews.
- **affectedFindings:** `EVT-006`, `HP-003`, `ROI-001`

### COR-005 — Master Graph belongs in a side chat

- **priorAssumption:** Graph design could continue in the same thread.
- **correction:** Operator requested separation.
- **correctedModel:** Stabilize operational IDs first; graph projection is a separate work package.
- **affectedFindings:** `EVT-009`, `HP-007`, `ROI-004`

## 6. Thread event inventory

| ID | Event | Evidence class | Future efficiency impact |
|---|---|---|---|
| EVT-001 | User reported R1A status `PASS_PENDING_OPERATOR_REVIEW`. | `USER_REPORTED_OPERATIONAL` | Future extraction can terminate in a known registration/review workflow instead of an orphan receipt. |
| EVT-002 | User reported page mappings including cover page 1, index page 2, `A.310.1 → 43`, `A.520.1 → 59`. | `USER_REPORTED_OPERATIONAL` | Future agents can skip full-PDF rescans and open target pages directly. |
| EVT-003 | Three review fields were identified: project number, owner/client, index authority. | `USER_REPORTED_OPERATIONAL` | Future systems can present only unresolved facts and avoid guesses. |
| EVT-004 | Internal project ID was separated from drawing project number. | `CHAT_DIRECT` | Prevents bad joins and false drawing metadata. |
| EVT-005 | User asked what should be done with the data. | `CHAT_DIRECT` | Future extraction protocols can declare authority and consumers up front. |
| EVT-006 | User selected normalized tables instead of JSON-first persistence. | `CHAT_DIRECT` | Avoids later backfills and schema migration rework. |
| EVT-007 | Plan-set, sheet, field, run, and review structures were discussed. | `CHAT_DIRECT` | Creates a reusable registration pattern across projects. |
| EVT-008 | User narrowed scope to cover sheet and plan indexing. | `CHAT_DIRECT` | Reduces token use and premature downstream design. |
| EVT-009 | User introduced CG Master Graph and asked for a side chat. | `CHAT_DIRECT` | Prevents context drift and authority confusion. |
| EVT-010 | Master Graph README described it as connecting authorities without replacing application databases. | `ATTACHMENT_SOURCE` | Future designs can reject duplicate operational truth stores early. |
| EVT-011 | User attached the autopsy protocol and requested the file. | `ATTACHMENT_SOURCE` | Future closeouts use a repeatable format instead of re-living the thread. |
| EVT-012 | User instructed “RUN THIS FILE” under a stricter protocol requiring Git push. | `CHAT_DIRECT` + `ATTACHMENT_SOURCE` | Future operators receive a branch-addressable artifact ready for Cursor ingest. |

## 7. Harvest packets

### HP-001 — Plan-set registration protocol

- **Kind:** `protocol-upgrade`
- **Evidence class:** `CHAT_DIRECT`
- **Durable:** yes
- **Finding:** Treat document identity, cover authority, index authority, and complete page mapping as one gate.
- **futureEfficiencyImpact:** Every downstream extraction gets stable IDs and routing data.
- **Status:** `CANDIDATE`

### HP-002 — Identity namespace rule

- **Kind:** `lesson`
- **Evidence class:** `CHAT_DIRECT`
- **Durable:** yes
- **Finding:** Separate internal project ID, drawing project number, Document Center name, and drawing title.
- **futureEfficiencyImpact:** Avoids repeated identity reconciliation across applications.
- **Status:** `CANDIDATE`

### HP-003 — Normalized persistence architecture

- **Kind:** `architecture-candidate`
- **Evidence class:** `CHAT_DIRECT`
- **Durable:** yes
- **Finding:** Use normalized Supabase tables for plan sets, sheets, cover fields, index runs, and reviews.
- **futureEfficiencyImpact:** Enables constraints, querying, and views without JSON backfill.
- **Status:** `CANDIDATE`

### HP-004 — Evidence-preserving operator review

- **Kind:** `protocol-upgrade`
- **Evidence class:** `CHAT_DIRECT`
- **Durable:** yes
- **Finding:** Preserve raw extraction and append operator decisions.
- **futureEfficiencyImpact:** Corrections remain explainable without reopening the source drawing.
- **Status:** `CANDIDATE`

### HP-005 — Index-first routing

- **Kind:** `automation-candidate`
- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- **Durable:** yes
- **Finding:** Complete page indexing before schedule/detail/elevation extraction.
- **futureEfficiencyImpact:** Avoids repeated 192-page scans and routing errors.
- **Status:** `CANDIDATE`

### HP-006 — Authority matrix

- **Kind:** `standard-candidate`
- **Evidence class:** `CHAT_DIRECT`
- **Durable:** yes
- **Finding:** Synology owns files; Supabase owns operational values; Git owns receipts; Master Graph owns relationships; Hub owns retrieval projection.
- **futureEfficiencyImpact:** Future designs resolve storage questions immediately.
- **Status:** `CANDIDATE`

### HP-007 — Master Graph side-chat boundary

- **Kind:** `agent-behavior`
- **Evidence class:** `CHAT_DIRECT`
- **Durable:** yes
- **Finding:** Open graph work only after stable Supabase IDs exist.
- **futureEfficiencyImpact:** Reduces context and identifier churn.
- **Status:** `CANDIDATE`

### HP-008 — Rosewood fixture candidate

- **Kind:** `example`
- **Evidence class:** `USER_REPORTED_OPERATIONAL`
- **Durable:** yes
- **Finding:** Rosewood can become the first validated plan-set registration fixture.
- **futureEfficiencyImpact:** Accelerates migration, API, UI, and regression testing.
- **Status:** `CANDIDATE`

## 8. Execution deltas

### ED-001 — Inventory before target schema

- **Actual:** Proposed tables before complete overlap inspection.
- **Optimal:** Search migrations/live schema, then define only the delta.
- **Evidence class:** `CHAT_DIRECT`
- **Linked ROI:** `ROI-005`

### ED-002 — Authority matrix earlier

- **Actual:** Several messages were needed to settle authority roles.
- **Optimal:** State a compact matrix immediately after extraction.
- **Evidence class:** `CHAT_DIRECT`
- **Linked ROI:** `ROI-002`

### ED-003 — Structural operator review

- **Actual:** Decisions lived in chat prose.
- **Optimal:** Bind decisions to extraction-run and field IDs.
- **Evidence class:** `CHAT_DIRECT`
- **Linked ROI:** `ROI-003`

### ED-004 — Graph after persistence

- **Actual:** Node/edge examples were discussed before operational IDs were validated.
- **Optimal:** Persist IDs, then generate a contribution envelope.
- **Evidence class:** `CHAT_DIRECT`
- **Linked ROI:** `ROI-004`

## 9. Waste ledger

### TW-001 — Repeated authority explanation

- **Evidence class:** `CHAT_DIRECT`
- **Root cause:** No compact authority matrix at the start.
- **Prevention:** Reuse `HP-006`.

### TW-002 — Premature downstream expansion

- **Evidence class:** `CHAT_DIRECT`
- **Root cause:** No scope ledger before architecture elaboration.
- **Prevention:** Declare closed/open/deferred lanes first.

### TW-003 — JSON-first detour

- **Evidence class:** `CHAT_DIRECT`
- **Root cause:** Short-term convenience was considered before lifecycle needs.
- **Prevention:** Apply normalization decision rules to durable extracted intelligence.

## 10. Duplication detector

### DUP-001 — Existing document-intelligence tables may overlap

- **Class:** `POSSIBLE_EXISTING_IMPLEMENTATION`
- **Evidence class:** `CROSS_CHECK_CANDIDATE`
- **Status:** `NEEDS_REGISTRY_LOOKUP_FIRST`
- **Targets:** parse runs, OCR, extraction evidence, document metadata, reviews.

### DUP-002 — Existing plan-set or sheet-index capability may exist

- **Class:** `POSSIBLE_EXISTING_IMPLEMENTATION`
- **Evidence class:** `CROSS_CHECK_CANDIDATE`
- **Status:** `NEEDS_REGISTRY_LOOKUP_FIRST`
- **Targets:** `document_sheets`, `plan_sets`, `sheet_index`, page-map artifacts.

### DUP-003 — Existing harvest may cover authority boundaries

- **Class:** `POSSIBLE_EXISTING_HARVEST`
- **Evidence class:** `CROSS_CHECK_CANDIDATE`
- **Status:** `NEEDS_REGISTRY_LOOKUP_FIRST`

### DUP-004 — Master Graph implementation intentionally deferred

- **Class:** `INTENTIONALLY_DEFERRED`
- **Evidence class:** `CHAT_DIRECT`
- **Status:** `DEFERRED`

## 11. Operator friction

- **OF-001:** “What should we do with this data?” — extraction lacked a declared persistence destination.
- **OF-002:** “Go straight to tables. Do it once.” — operator rejected temporary JSON-first design.
- **OF-003:** “Focus on cover sheet and plan indexing.” — operator corrected scope expansion.
- **OF-004:** “Should CG Master Graph be a side chat?” — operator identified context-boundary risk.
- **OF-005:** “Produce the file needed” / “Run this file” — operator expected execution, not acknowledgement.

## 12. ROI backlog

### ROI-001 — Canonical plan-set registration gate

- **Rank:** 1
- **improvementType:** `automation_concept`
- **futureSavings:**
  - **tokenSavingsEstimate:** high
  - **timeSavingsEstimate:** high
  - **toolCallsAvoided:** 8
  - **repeatedInvestigationAvoided:** true
  - **implementationReworkAvoided:** true
  - **appliesTo:** cursor_planning, repository_retrieval, coding, testing, debugging
  - **futureEfficiencyImpact:** Future agents start from approved identity and a complete page map instead of rescanning and redesigning persistence.
- **optimalFutureWorkflow:**
  1. Search repository and Supabase schema for existing structures.
  2. Resolve project/document IDs and source hash.
  3. Create or reuse the minimum normalized schema delta.
  4. Ingest cover facts and all page/sheet rows.
  5. Route exceptions to review.
  6. Publish current-state views after reconciliation passes.

### ROI-002 — Explicit authority and identity matrix

- **Rank:** 2
- **improvementType:** `planning_technique`
- **futureSavings:**
  - **tokenSavingsEstimate:** high
  - **timeSavingsEstimate:** medium
  - **toolCallsAvoided:** 3
  - **repeatedInvestigationAvoided:** true
  - **implementationReworkAvoided:** true
  - **appliesTo:** cursor_planning, repository_retrieval, coding, debugging
  - **futureEfficiencyImpact:** Future discussions skip repeated storage debates and avoid writing values into the wrong authority.
- **optimalFutureWorkflow:**
  1. Read owner-repository authority contracts.
  2. Classify each datum by authority class.
  3. Assign one source of truth and allowed projections.
  4. Reject duplicate writable truth.
  5. Record identity namespace on external identifiers.

### ROI-003 — Evidence-preserving review model

- **Rank:** 3
- **improvementType:** `validation_rule`
- **futureSavings:**
  - **tokenSavingsEstimate:** medium
  - **timeSavingsEstimate:** high
  - **toolCallsAvoided:** 4
  - **repeatedInvestigationAvoided:** true
  - **implementationReworkAvoided:** true
  - **appliesTo:** coding, testing, debugging, deployment
  - **futureEfficiencyImpact:** Future agents can explain every correction without reopening source pages.
- **optimalFutureWorkflow:**
  1. Persist raw extraction with confidence and evidence location.
  2. Create review tasks only where required.
  3. Append operator decision with reviewer, timestamp, reason, and approved value.
  4. Expose reviewed current-state views.
  5. Retain raw evidence for audit and quality analysis.

### ROI-004 — Master Graph side-chat boundary

- **Rank:** 4
- **improvementType:** `prompt_compression`
- **futureSavings:**
  - **tokenSavingsEstimate:** medium
  - **timeSavingsEstimate:** medium
  - **toolCallsAvoided:** 2
  - **repeatedInvestigationAvoided:** true
  - **implementationReworkAvoided:** true
  - **appliesTo:** cursor_planning, coding, testing
  - **futureEfficiencyImpact:** Graph work avoids identifier churn and does not bloat operational schema discussions.

### ROI-005 — Rosewood regression fixture

- **Rank:** 5
- **improvementType:** `coding_pattern`
- **futureSavings:**
  - **tokenSavingsEstimate:** low
  - **timeSavingsEstimate:** high
  - **toolCallsAvoided:** 3
  - **repeatedInvestigationAvoided:** true
  - **implementationReworkAvoided:** true
  - **appliesTo:** coding, testing, debugging
  - **futureEfficiencyImpact:** Future changes can be tested against a known large project instead of synthetic cases.

## 13. Do-not-advance guards

Do not claim operational registration until schema overlap, project UUID, document hash, all 192 pages, cover/index authority, review decisions, views, and write boundaries are verified.

Do not begin authoritative downstream takeoff extraction until the page-index gate passes.

Do not publish Master Graph relationships until stable IDs exist and contribution validation, orphan checks, compile stability, and publication receipts pass.

Do not merge this draft to `main`.

## 14. Seed packet candidates

```json
{
  "seedId": "IH-THREAD-PLAN-SET-REGISTRATION-GATE-V1",
  "kind": "protocol-upgrade",
  "improvementType": "automation_concept",
  "futureSavings": {
    "tokenSavingsEstimate": "high",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 8,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["cursor_planning", "repository_retrieval", "coding", "testing", "debugging"],
    "futureEfficiencyImpact": "Future plan extraction starts from approved identity and a complete page map instead of rescanning and redesigning persistence."
  },
  "optimalFutureWorkflow": [
    "1. Search existing schema and migrations for plan-set and sheet-index capabilities.",
    "2. Verify project ID, document ID, source hash, page count, cover authority, and index authority.",
    "3. Persist plan-set, sheet, field, run, and review records using the approved schema delta.",
    "4. Reconcile every PDF page and route exceptions to review.",
    "5. Expose reviewed current-state views after the completeness gate passes."
  ],
  "retrievalQuestions": [
    "How should a canonical drawing plan set be registered before downstream extraction?",
    "What proves that every PDF page has a durable sheet or non-sheet classification?"
  ],
  "evidenceRefs": [
    {"ref": "EVT-001", "classification": "USER_REPORTED_OPERATIONAL"},
    {"ref": "EVT-006", "classification": "CHAT_DIRECT"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A new project drawing PDF has completed cover or index extraction.",
    "startAt": "Resolve authoritative project and document IDs and inspect existing schema.",
    "runPreflight": "Search migrations, live tables, and active plan-set records before creating anything.",
    "doNot": ["Do not infer missing identities.", "Do not store the complete index only in opaque JSON.", "Do not begin takeoff before page reconciliation passes."],
    "proveBeforeClaiming": ["All pages reconciled.", "Cover and index authorities linked.", "Operator decisions persisted."]
  },
  "status": "CANDIDATE"
}
```

```json
{
  "seedId": "IH-THREAD-DRAWING-AUTHORITY-IDENTITY-MATRIX-V1",
  "kind": "lesson",
  "improvementType": "planning_technique",
  "futureSavings": {
    "tokenSavingsEstimate": "high",
    "timeSavingsEstimate": "medium",
    "toolCallsAvoided": 3,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["cursor_planning", "repository_retrieval", "coding", "debugging"],
    "futureEfficiencyImpact": "Future agents immediately know where each fact belongs and avoid mixing internal and drawing-authored identities."
  },
  "optimalFutureWorkflow": [
    "1. Read the authority contract for the owning repository.",
    "2. Classify the datum by authority class.",
    "3. Record its identity namespace and canonical owner.",
    "4. Permit only read projections outside the owning system.",
    "5. Reject duplicate writable truth."
  ],
  "retrievalQuestions": [
    "Which system owns canonical files, extracted values, execution evidence, graph relationships, and retrieval projections?",
    "How are Capital Glass project IDs distinguished from drawing project numbers and drawing titles?"
  ],
  "evidenceRefs": [
    {"ref": "COR-001", "classification": "CHAT_DIRECT"},
    {"ref": "EVT-010", "classification": "ATTACHMENT_SOURCE"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A workflow proposes storing or projecting extracted project information.",
    "startAt": "Classify the datum and its identity namespace.",
    "runPreflight": "Read owner-repository authority and participation contracts.",
    "doNot": ["Do not make Master Graph a second operational database.", "Do not call an internal ID a drawing-authored number without evidence."],
    "proveBeforeClaiming": ["One canonical owner is named.", "Projection direction is documented.", "Identity namespace is explicit."]
  },
  "status": "CANDIDATE"
}
```

```json
{
  "seedId": "IH-THREAD-EXTRACTION-REVIEW-LINEAGE-V1",
  "kind": "protocol-upgrade",
  "improvementType": "validation_rule",
  "futureSavings": {
    "tokenSavingsEstimate": "medium",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 4,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["coding", "testing", "debugging", "deployment"],
    "futureEfficiencyImpact": "Future agents can retrieve the original extraction, operator correction, and approved value without reopening the drawing."
  },
  "optimalFutureWorkflow": [
    "1. Persist raw extraction and exact evidence location.",
    "2. Create review task only when policy or confidence requires it.",
    "3. Append operator decision with reason and reviewer identity.",
    "4. Project reviewed current value without deleting raw evidence.",
    "5. Use review outcomes for audit and extractor quality analysis."
  ],
  "retrievalQuestions": [
    "What was originally extracted for a cover-sheet field?",
    "Who approved or corrected the value, and what source evidence supported the decision?"
  ],
  "evidenceRefs": [
    {"ref": "EVT-003", "classification": "USER_REPORTED_OPERATIONAL"},
    {"ref": "COR-002", "classification": "CHAT_DIRECT"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "An extraction includes missing, uncertain, or operator-corrected fields.",
    "startAt": "Persist the raw result before review.",
    "runPreflight": "Check whether an active review decision already exists for the same field and extraction run.",
    "doNot": ["Do not overwrite raw evidence.", "Do not infer missing values.", "Do not mark approved without reviewer evidence."],
    "proveBeforeClaiming": ["Raw and reviewed records are linked.", "Reviewer and timestamp are present.", "Current-state projection resolves deterministically."]
  },
  "status": "CANDIDATE"
}
```

## 15. Future-agent instructions

1. Treat this artifact as draft observed-thread evidence.
2. Pull `chat-gpt-harvest` before ingest.
3. Run duplication preflight before new schema or seed work.
4. Verify all user-reported operational claims against receipts, files, database state, or code.
5. Begin with the `CapitalGlass-Documents` schema inventory.
6. Keep implementation limited to cover sheet and plan indexing.
7. Preserve internal and drawing-authored identities separately.
8. Represent missing values explicitly.
9. Require complete page reconciliation.
10. Keep CG Master Graph separate until stable IDs exist.

## 16. Publication truth

| Layer | State |
|---|---|
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

- [x] `DRAFT_FILE` declared
- [x] OBSERVED lane only
- [x] Retrieval block included
- [x] Scope ledger included
- [x] Correction ledger included
- [x] Evidence classes included
- [x] ROI top three include `improvementType`, `futureSavings`, and `optimalFutureWorkflow`
- [x] At least one seed for each ROI top-three item
- [x] Seeds have two retrieval questions and classified evidence refs
- [x] Seeds remain `CANDIDATE`
- [x] Publication table remains `not-run`
- [x] No forbidden completion claims
- [ ] Cursor duplication preflight
- [ ] Cursor validation
- [ ] Operator publication

## 18. Next operator action

```bash
git fetch origin
git checkout chat-gpt-harvest
git pull origin chat-gpt-harvest

npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-05-rosewood-cover-plan-index-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-05-rosewood-cover-plan-index-v1

npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-05-rosewood-cover-plan-index-v1
npm run harvest:sync-derived -- harvest-2026-08-05-rosewood-cover-plan-index-v1
npm run harvest:validate -- harvest-2026-08-05-rosewood-cover-plan-index-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-05-rosewood-cover-plan-index-v1
npm run test:harvest
```

Operator-only after validation:

```bash
npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-05-rosewood-cover-plan-index-v1
```

## 19. Git push record

```text
Repo: Capglass5708/CapitalGlass-Cross-Agent
Branch: chat-gpt-harvest
File: artifacts/agent-runs/harvest-2026-08-05-rosewood-cover-plan-index-v1/chatgpt-findings-source.md
Commit message: harvest(chatgpt): draft findings harvest-2026-08-05-rosewood-cover-plan-index-v1
Push target: origin chat-gpt-harvest
```

## Mandatory footer

| Layer | State |
|---|---|
| Git authority | `not-run` |
| L: Hub catalog | `not-run` |
| Z: AI cache | `not-run` |
| Supabase projection | `not-run` |
| Freshness gate | `not-run` |

```text
Publication: NOT_RUN_BY_CURSOR
projection.hubPublishStatus: not-run
```
