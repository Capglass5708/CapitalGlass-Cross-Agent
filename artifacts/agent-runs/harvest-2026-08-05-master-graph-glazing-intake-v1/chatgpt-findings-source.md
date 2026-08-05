# ChatGPT Findings Source

## Final Summary

Mission: `chat-thread-closeout-autopsy-harvest-chatgpt-v1`  
Lane: `CHAT_CONTEXT_ONLY`  
Start verdict: `UNHARVESTED_THREAD`  
Target tier: `T2`  
Output verdict: `DRAFT_READY_FOR_CURSOR_VALIDATION`

This thread established the operating model for a staging/design side chat that prepares controlled contributions to `CG-MASTER-GRAPH` for commercial glazing estimating. The durable lessons are: preserve source authority, phase-gate graph growth, require provenance from the first phase, separate assertions from canonical nodes and edges, and never use sheet labels as sole identity. The thread also exposed a real blocker: Documents schema drift must be reconciled before Rosewood plan-structure records can be ingested or compiled.

## Harvest Verdict and Tier Rationale

**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`  
**Tier:** T2

The thread contains multiple corrections, a reusable intake artifact, concrete graph-growth rules, and an execution-order decision. It does not independently prove repository runtime state, live Supabase seed state, or graph compilation success.

## Retrieval Preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

## Scope Ledger

### Primary mission

Structure information pasted into a side chat so it can be evaluated and prepared for later contribution to `CG-MASTER-GRAPH` for glazing estimating.

### Closed lanes

- Corrected the chat role from persistence owner to Master Graph side-chat consumer.
- Created a reusable Markdown intake questionnaire.
- Reviewed and improved the intake into a phase-gated v2 operating document.
- Accepted a Wave 0 verdict for Documents schema reconciliation before graph ingestion.

### Open lanes

- Reconcile Documents hybrid persistence schema and superseded table/view names.
- Confirm live Rosewood plan-set and sheet IDs.
- Define durable review-decision persistence.
- Expand Master Graph registry types and Phase 1 edge types.
- Generate a valid contribution envelope from verified source records.

### Deferred work

- Openings, assemblies, quantities, pricing, and Bid Composer projection.
- R1B glazing classification beyond assertion-only staging.
- Canonical graph compilation of Rosewood plan structure.

### Do-not-merge boundaries

- Do not make Master Graph authoritative for PDFs, OCR bodies, Revu markup files, prices, or application workflow state.
- Do not treat proposed seed IDs as live.
- Do not use sheet numbers or OCR strings as sole identity.
- Do not compile Phase 2–5 concepts while Phase 1 identity is unresolved.

## Correction Ledger

### COR-001 — Chat ownership model

- **priorAssumption:** This chat owned Documents persistence only.
- **correction:** The user clarified that coding occurs in `CG-MASTER-GRAPH`, while this chat is a side-chat consumer and staging/design lane.
- **correctedModel:** This chat structures facts, authority, IDs, nodes, edges, provenance, and growth recommendations for later graph contribution.
- **affectedFindings:** EVT-001, EVT-002, ROI-001
- **futurePrevention:** Confirm the active repo, authority repo, and chat role before assigning mission scope.
- **evidence:** `CHAT_DIRECT`

### COR-002 — Provenance is not a late phase

- **priorAssumption:** Review and provenance appeared as Phase 5 after estimating intelligence.
- **correction:** Provenance and evidence must apply to every graph phase; only accepted human truth belongs in a later trust state.
- **correctedModel:** Use separate domain-growth phases and trust/review states.
- **affectedFindings:** EVT-004, HP-002, ROI-002
- **futurePrevention:** Never phase-gate evidence behind domain maturity.
- **evidence:** `CHAT_DIRECT`

### COR-003 — Sheet labels are not canonical identity

- **priorAssumption:** A readable graph ID such as `sheet:a.520.1` was presented as an example.
- **correction:** Rosewood contains duplicate sheet labels; source UUIDs must anchor canonical sheet identity.
- **correctedModel:** Use `sheet:<document_sheet_uuid>` and retain the printed sheet number as a property or alias.
- **affectedFindings:** EVT-004, HP-003, ROI-003
- **futurePrevention:** Reject label-only and OCR-only graph identities during intake.
- **evidence:** `CHAT_DIRECT`

## Thread Event Inventory

### EVT-001 — Master Graph side-chat role established

- **event:** The user defined this chat as a side-chat consumer where completed work will be pasted and structured for graph growth.
- **result:** The chat became a controlled staging/design lane rather than an implementation or source-authority lane.
- **evidenceClass:** `CHAT_DIRECT`
- **futureEfficiencyImpact:** Future chats can classify contributions without repeatedly re-establishing repo ownership and authority boundaries.

### EVT-002 — Reusable graph-growth intake created

- **event:** A comprehensive Markdown intake was created for entities, relationships, stable IDs, authority, provenance, Revu, Data Extraction, Computer Estimator, VAE, Human Estimator, Bid Composer, products, quantities, pricing traceability, revisions, security, and testing.
- **artifact:** `CG-MASTER-GRAPH-GLAZING-ESTIMATING-GROWTH-INTAKE.md`
- **evidenceClass:** `CHAT_DIRECT`
- **futureEfficiencyImpact:** Side chats can produce structured graph recommendations from one reusable prompt instead of ad hoc questioning.

### EVT-003 — Intake v2 introduced phase gates and repo alignment

- **event:** The uploaded v2 added compact/Rosewood/full modes, separation buckets, real repository paths, contribution-envelope alignment, compiler flow, and Rosewood fixtures.
- **result:** The intake became operationally aligned with `CG-MASTER-GRAPH` rather than a generic ontology questionnaire.
- **evidenceClass:** `ATTACHMENT_SOURCE`
- **futureEfficiencyImpact:** Agents can begin with the shortest appropriate mode and avoid proposing nonexistent paths or bespoke packet formats.

### EVT-004 — Three architecture safeguards identified

- **event:** The review identified three critical improvements: provenance in every phase, a first-class assertion layer, and UUID-backed sheet identity.
- **result:** These safeguards became durable design rules for later graph contributions.
- **evidenceClass:** `CHAT_DIRECT`
- **futureEfficiencyImpact:** Prevents unsupported canonical truth, confidence overwrites, and identity collisions across plan sets and revisions.

### EVT-005 — Wave 0 verdict accepted

- **event:** A detailed intake result concluded that Rosewood graph ingestion is blocked by Documents schema drift, unconfirmed live seeds, unresolved review persistence, and missing registry types.
- **result:** The next work remains Documents Wave 0/schema reconciliation, followed by `document-center-r1a-master-graph-contribution-v1`.
- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **futureEfficiencyImpact:** Prevents premature graph adapter and registry work against an unstable source contract.

## Harvest Packets

### HP-001 — Side-chat staging contract

- **kind:** protocol lesson
- **status:** durable
- **finding:** A graph-growth side chat should classify pasted work into graph-ready, needs IDs, needs schema, needs human interpretation, or outside, while preserving source authority.
- **evidenceClass:** `CHAT_DIRECT`
- **futureEfficiencyImpact:** Reduces repeated scope corrections and keeps implementation repos from absorbing source-owned data.

### HP-002 — Assertions are distinct from canonical graph facts

- **kind:** architecture lesson
- **status:** durable
- **finding:** Machine-derived classifications and extracted values should enter as evidence-backed assertions that can be accepted, rejected, corrected, or superseded, not directly as canonical edges.
- **evidenceClass:** `CHAT_DIRECT`
- **futureEfficiencyImpact:** Makes conflicting OCR, parser, Revu, and human interpretations reviewable without corrupting canonical relationships.

### HP-003 — UUID-first sheet identity

- **kind:** validation rule
- **status:** durable
- **finding:** Printed sheet labels are display properties. Canonical graph identity must bind to stable Documents UUIDs because labels can duplicate within a plan set and recur across revisions and projects.
- **evidenceClass:** `CHAT_DIRECT`
- **futureEfficiencyImpact:** Avoids merge repair and cross-project collisions later in the graph lifecycle.

### HP-004 — Documents contract before graph contribution

- **kind:** stop condition
- **status:** durable
- **finding:** Do not generate a canonical contribution envelope until Documents table naming, live plan-set/sheet IDs, review persistence, and current-plan-set selection are reconciled.
- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **futureEfficiencyImpact:** Prevents writing adapters twice against competing schemas.

## Execution Deltas

### ED-001 — Initial scope was assigned too narrowly

- **actual:** The chat was first framed as owning persistence only.
- **optimal:** Confirm the active coding repo and side-chat role before defining the mission.
- **lesson:** Repository ownership and chat purpose are separate dimensions.
- **linkedROI:** ROI-001

### ED-002 — First intake was comprehensive but too monolithic

- **actual:** The original file was broad and lengthy.
- **optimal:** Provide compact, Rosewood, full-intake, and staging-board modes, with a companion agent contract.
- **lesson:** Reusable protocols need entry modes, not just exhaustive coverage.
- **linkedROI:** ROI-001

### ED-003 — Domain phases mixed with trust maturity

- **actual:** Review/provenance appeared as a final growth phase.
- **optimal:** Apply provenance to every domain phase and model review/acceptance as trust states.
- **lesson:** Domain maturity and evidence maturity must be orthogonal.
- **linkedROI:** ROI-002

## Waste Ledger

### TW-001 — Repeated role correction

- **waste:** Multiple turns were required to distinguish Documents persistence, Master Graph coding, and the side-chat consumer role.
- **cause:** Mission scope was inferred before the user’s repo/chat boundary was fully captured.
- **prevention:** Begin graph threads with three explicit fields: `active_repo`, `source_authorities`, and `chat_role`.
- **evidenceClass:** `CHAT_DIRECT`

### TW-002 — Risk of designing beyond source readiness

- **waste:** Early graph-growth discussion could have advanced into later ontology layers before stable plan-set and sheet IDs were live.
- **cause:** Domain enthusiasm exceeded source-contract readiness.
- **prevention:** Enforce the phase lock and contribution-envelope gate.
- **evidenceClass:** `CHAT_DIRECT`

## Duplication Detector

### DUP-001

- **classification:** `REPEATED_DISCUSSION`
- **subject:** Whether Documents or Master Graph owns the work.
- **resolution:** Documents owns source identity and plan facts; Master Graph owns compiled relationships; this chat stages contributions.
- **status:** resolved in visible context
- **evidenceClass:** `CHAT_DIRECT`

### DUP-002

- **classification:** `POSSIBLE_EXISTING_IMPLEMENTATION`
- **subject:** Older Documents run/field/review table names versus hybrid persistence migrations.
- **resolution:** `NEEDS_REGISTRY_LOOKUP_FIRST` and repo verification before creating new schemas or adapters.
- **status:** open
- **evidenceClass:** `USER_REPORTED_OPERATIONAL`

## Operator Friction

### OF-001 — Ambiguous meaning of “here”

The phrase “what we are doing here” referred to the broader Revu/estimating program, while “coding in” referred specifically to `CG-MASTER-GRAPH`. Future responses should restate both the current chat role and active repository in one sentence.

### OF-002 — Large intake usability

The full intake is valuable but too large for every paste. Keep the compact prompt and minimum fact block at the top, and split operator prompts, agent contract, questionnaire, and Rosewood fixture when maintained in-repo.

## ROI Backlog

### ROI-001 — Standard graph-intake front door

- **rank:** 1
- **improvementType:** `prompt_compression`
- **proposal:** Use a short mode selector and minimum fact block before the full questionnaire.
- **evidence:** The thread moved from a broad intake to a v2 with compact, Rosewood, full, and staging modes.
- **futureSavings:**
  - tokenSavingsEstimate: `high`
  - timeSavingsEstimate: `high`
  - toolCallsAvoided: 3
  - repeatedInvestigationAvoided: true
  - implementationReworkAvoided: true
  - appliesTo: `cursor_planning`, `repository_retrieval`, `coding`
  - futureEfficiencyImpact: Agents can classify one pasted artifact without rereading the entire ontology and repo architecture.
- **optimalFutureWorkflow:**
  1. Declare active repo, source authority, and chat role.
  2. Choose Compact, Rosewood, Full, or Staging mode.
  3. Return the five separation buckets.
  4. Stop if stable IDs or source contracts are missing.
  5. Create a work package only after the contribution-envelope gate is satisfiable.

### ROI-002 — Orthogonal domain phase and trust state

- **rank:** 2
- **improvementType:** `planning_technique`
- **proposal:** Model domain growth separately from evidence/review maturity.
- **evidence:** The thread corrected the idea that provenance belongs only in a final phase.
- **futureSavings:**
  - tokenSavingsEstimate: `medium`
  - timeSavingsEstimate: `high`
  - toolCallsAvoided: 2
  - repeatedInvestigationAvoided: true
  - implementationReworkAvoided: true
  - appliesTo: `planning`, `coding`, `testing`
  - futureEfficiencyImpact: Every phase receives the same evidence discipline, avoiding later migrations from unreviewed canonical edges to assertion records.
- **optimalFutureWorkflow:**
  1. Select the domain phase.
  2. Classify each claim as observed, machine asserted, human reviewed, accepted, rejected, or superseded.
  3. Require evidence pointers before promotion.
  4. Compile only accepted canonical relationships.

### ROI-003 — UUID-first graph identity gate

- **rank:** 3
- **improvementType:** `validation_rule`
- **proposal:** Reject label-only, filename-only, and OCR-only canonical identities.
- **evidence:** Rosewood duplicate labels made `sheet:a.520.1` unsafe.
- **futureSavings:**
  - tokenSavingsEstimate: `medium`
  - timeSavingsEstimate: `high`
  - toolCallsAvoided: 2
  - repeatedInvestigationAvoided: true
  - implementationReworkAvoided: true
  - appliesTo: `coding`, `testing`, `debugging`
  - futureEfficiencyImpact: Prevents duplicate-node cleanup and cross-revision merge repair.
- **optimalFutureWorkflow:**
  1. Retrieve the source UUID.
  2. Build graph ID from stable source identity.
  3. Store printed labels as aliases/properties.
  4. Test duplicate labels in the Rosewood fixture.
  5. Reject contributions missing stable source IDs.

## Do-Not-Advance Guards

- Do not ingest or compile Rosewood plan structure until the Documents schema contract is reconciled.
- Do not treat `a2033260-0001-4000-8000-000000000001` as confirmed live without source verification.
- Do not create `Sheet` nodes from printed labels alone.
- Do not promote `CLASSIFIED_AS glazing_relevant` to canonical truth without evidence and review.
- Do not introduce openings, assemblies, quantities, prices, or Bid Scope into the Phase 1 contribution.
- Do not invent a bespoke contribution packet; use `schemas/contribution-envelope.v1.schema.json`.
- Do not claim graph validation, publication, L: movement, or Supabase projection from this ChatGPT run.

## Seed Packet Candidates

### Seed Candidate 1

```json
{
  "seedId": "IH-THREAD-GRAPH-INTAKE-FRONT-DOOR-V1",
  "kind": "protocol-upgrade",
  "improvementType": "prompt_compression",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How should a side chat classify work before contributing to CG-MASTER-GRAPH?",
    "What is the minimum prompt for glazing-estimating graph intake?"
  ],
  "evidenceRefs": [
    {
      "ref": "Current thread: creation and review of CG-MASTER-GRAPH glazing estimating intake",
      "classification": "CHAT_DIRECT"
    },
    {
      "ref": "Attached CG Master Graph Glazing Estimating Growth Intake v2",
      "classification": "ATTACHMENT_SOURCE"
    }
  ],
  "futureSavings": {
    "tokenSavingsEstimate": "high",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 3,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["cursor_planning", "repository_retrieval", "coding"],
    "futureEfficiencyImpact": "A short mode-based intake prevents full-ontology analysis for every artifact and stops work when source identity is not ready."
  },
  "optimalFutureWorkflow": [
    "1. Declare active repo, source authority, and chat role.",
    "2. Choose Compact, Rosewood, Full, or Staging mode.",
    "3. Classify every fact into one separation bucket.",
    "4. Require stable IDs, allowed types, authority pointers, and provenance before Ready.",
    "5. Produce a contribution-envelope sketch only when the gate is satisfied."
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A user pastes repo work and asks how it should grow CG-MASTER-GRAPH.",
    "startAt": "Use the compact intake and identify the domain phase.",
    "runPreflight": "Inspect real registry, schemas, and source authority before proposing paths.",
    "doNot": "Do not invent IDs, direct-edit compiled graph releases, or pull later-phase estimating concepts forward.",
    "proveBeforeClaiming": "Stable source IDs, evidence pointer, registry support, and contribution-envelope validation."
  }
}
```

### Seed Candidate 2

```json
{
  "seedId": "IH-THREAD-GRAPH-ASSERTION-UUID-GUARDS-V1",
  "kind": "lesson",
  "improvementType": "validation_rule",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why must machine classifications be assertions instead of canonical graph edges?",
    "Why can sheet numbers not serve as canonical Master Graph IDs?"
  ],
  "evidenceRefs": [
    {
      "ref": "Current thread: intake improvement review",
      "classification": "CHAT_DIRECT"
    },
    {
      "ref": "User-reported Rosewood duplicate sheet-label condition",
      "classification": "USER_REPORTED_OPERATIONAL"
    }
  ],
  "futureSavings": {
    "tokenSavingsEstimate": "medium",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 2,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["planning", "coding", "testing", "debugging"],
    "futureEfficiencyImpact": "Assertion records preserve disagreement and UUID-first identity prevents graph collisions across plan revisions and projects."
  },
  "optimalFutureWorkflow": [
    "1. Bind canonical entities to source UUIDs.",
    "2. Store labels and OCR values as properties or observations.",
    "3. Create evidence-backed assertions for machine-derived predicates.",
    "4. Record human accept, reject, or correct decisions append-oriented.",
    "5. Promote only accepted durable relationships into compiled graph truth."
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A contribution contains OCR values, classifications, sheet labels, or inferred relationships.",
    "startAt": "Determine source UUID and evidence pointer.",
    "runPreflight": "Check duplicate labels and revision behavior.",
    "doNot": "Do not use labels, filenames, or OCR strings as sole identity; do not overwrite canonical edges with confidence values.",
    "proveBeforeClaiming": "Source identity, assertion provenance, review state, and supersession behavior."
  }
}
```

## Future-Agent Instructions

1. Begin every graph-growth thread by declaring the active implementation repo, source-authority repo/system, and chat role.
2. Select the smallest intake mode that fits the pasted work.
3. Separate domain phase from trust/review state.
4. Require stable source IDs and evidence pointers before marking anything Ready.
5. Prefer assertions for machine-derived values and classifications.
6. Use contribution envelopes, not hand-edited compiled graph files.
7. Stop at Wave 0 when source schema, IDs, or review persistence are unresolved.
8. Use Rosewood as a reusable fixture, not a one-off ontology.
9. Keep PDF bytes, OCR dumps, markup bodies, pricing bodies, and UI state outside the graph.
10. Never claim live seed, compile, validation, or publication status from pasted reports alone.

## Publication Truth Table

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

## Acceptance Checklist

- [x] Compression mindset applied
- [x] Findings traceable to visible chat or attachment
- [x] Corrections override earlier assumptions
- [x] Operational claims classified as user-reported or cross-check candidates
- [x] No live retrieval or publication claim
- [x] No `HARVEST_COMPLETE`, `OPERATIONAL`, or `FULLY_SEEDED` claim
- [x] ROI limited to thread-supported improvements
- [x] Seed candidates marked `CANDIDATE`
- [x] Publication layers remain not-run
- [ ] Cursor duplication preflight
- [ ] Cursor validation
- [ ] Operator publication

## Next Operator Action

After this file is pushed to `chat-gpt-harvest`, Cursor should pull the branch and run:

```bash
npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-05-master-graph-glazing-intake-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-05-master-graph-glazing-intake-v1
```

Then run duplication preflight, sync-derived, validation, autopsy validation, tests, and operator publication only after those gates pass.
