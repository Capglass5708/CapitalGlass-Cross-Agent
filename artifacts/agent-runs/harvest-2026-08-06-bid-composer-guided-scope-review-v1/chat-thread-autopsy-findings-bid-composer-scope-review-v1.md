# Chat Thread Closeout Autopsy Findings — Bid Composer Guided Scope Review

## 1. Final summary

```text
Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Start verdict: UNHARVESTED_THREAD
Target tier: T2
Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION
```

This thread moved from a broad product idea—put detected scope directly into Bid Composer—through UX definition, gated SDLC orchestration, implementation, migration, deployment, canonical Rosewood bid designation, production seeding, formal closeout, and operator handoff.

The durable outcome is that Bid Composer is now the canonical human interface for detected-scope commercial review. The canonical Rosewood estimate has 34 pending window-scope items. Human disposition is required before proposal issue.

This file is a ChatGPT draft only. All code, database, deployment, Git, migration, and runtime claims remain cross-check candidates until Cursor validates them against the repositories, receipts, Supabase, deployment state, and canonical intelligence sources.

---

## 2. Harvest verdict and tier rationale

### Verdict

`DRAFT_READY_FOR_CURSOR_VALIDATION`

### Tier

`T2`

### Rationale

This thread qualifies for T2 because it contains:

- multiple related product and architecture decisions;
- repeated corrections to milestone size and execution order;
- a major UX flow design;
- multiple repositories and shared contracts;
- migration, deployment, and runtime claims;
- authority-boundary decisions;
- a canonical-bid designation event;
- a formal production closeout;
- repeated operator friction around fragmented prompts and premature stopping;
- reusable protocol lessons for future milestone orchestration.

The thread contains durable value, but ChatGPT cannot validate the implementation or publication state.

---

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

The conversation includes pasted retrieval and cache labels from Cursor closeouts. Those labels are evidence references only and must not be promoted as live truth by ChatGPT.

---

## 4. Thread event inventory

### EVT-001 — Rosewood Computer Estimator workspace publication

The thread began from a completed workspace publication for:

`L:\Capital-Glass-Projects\CG-2033-26 - Rosewood\01 - Estimating\01 - Bid Sheets\Computer Estimator`

Reported state:

- 87 files published and hash-verified;
- 13 glazing regions;
- 33 unknown sheets;
- 34 R1B window marks;
- suggested-versus-approved boundary enforced;
- no approved takeoff;
- no synthetic opening detections;
- project folder established as a human review front door.

Significance:

This proved the data, evidence, and decision artifacts could be assembled, but exposed that the project folder was not the ideal primary operator interface.

### EVT-002 — Product-direction correction: Bid Composer as operator shell

Wesley directed that all detected scope should go directly into Bid Composer.

Locked product model:

- Bid Composer = human operator interface and commercial decision authority;
- project folder = durable export and evidence snapshot;
- Revu, Data Extraction, Documents, and Computer Estimator = upstream producers;
- human estimator makes include/exclude/alternate/allowance/clarification decisions.

### EVT-003 — Quiz-style guided review concept

The scope-review experience was shaped into an item-by-item guided flow:

- one scope item at a time;
- simple commercial choices;
- notes and customer-facing wording;
- evidence hidden until requested;
- proposal impact applied after each decision;
- All Items mode for power users.

### EVT-004 — UX and visual review

The implementation plan was reviewed for user flow and aesthetics.

Key refinements:

- landing screen before the first item;
- category-based sequencing;
- six primary dispositions;
- `Not Our Scope` moved under exclusion subtype;
- conditional follow-up fields;
- evidence drawer with Drawing / Detection / History;
- calm estimating aesthetic;
- progressive disclosure;
- proposal-readiness panel;
- no AI-dashboard visual language.

### EVT-005 — Full-wave SDLC orchestration prompt

A 12-wave milestone prompt was created for:

`bid-composer-guided-scope-review-and-proposal-disposition-v1`

The prompt covered:

- baseline;
- persistence;
- ingestion;
- estimate shell;
- guided UI;
- evidence;
- proposal compile;
- revision carry-forward;
- L: export;
- visual QA;
- integration;
- migration/deploy/live pilot;
- formal closeout.

### EVT-006 — Waves 0–4 implementation closeout

Reported implementation on:

`feat/guided-scope-review-v1`

Delivered:

- migration;
- `bid_scope_review_items`;
- current-estimate pointer;
- canonical disposition map;
- scope-review APIs;
- estimate shell;
- guided quiz;
- All Items;
- Rosewood seed route;
- issue-gate wiring;
- parser support;
- L export stub.

The thread correctly classified the milestone as partial and prohibited merge.

### EVT-007 — Waves 5–8 implementation

Reported additions:

- evidence API and drawer;
- safe batch actions;
- keyboard shortcuts;
- proposal compile;
- readiness panel;
- carry-forward;
- L-export inversion.

Remaining:

- visual QA;
- full integration;
- migration;
- production deployment;
- live pilot;
- formal closeout.

### EVT-008 — Waves 9–10 implementation and CI proof

Reported additions:

- first-run guidance;
- unresolved filter;
- batch clarification;
- persisted guided position;
- focus trap and reduced-motion;
- pricing sync;
- carry-forward filters;
- integration tests.

GitHub Actions `Validate` reportedly passed, resolving the local WSL build ambiguity as environment-specific.

### EVT-009 — Canonical Rosewood bid ambiguity

Supabase reportedly showed four Rosewood-related draft bids with no canonical pointer.

The thread rejected:

- timestamp-only selection;
- use of stale alias labels;
- use of an unrelated Rosewood Hall project.

### EVT-010 — Canonical-bid designation

The four candidates were classified as smoke-import duplicates with no human work.

Decision:

`CREATE_FRESH_CANONICAL_BID`

Reported canonical identity:

- project: `f463b1e8-e21c-419c-80d0-ea63ec47fe60`
- bid: `633908da-7098-4509-b05a-91bd683b988f`
- draft: `5ef5ab1d-0132-48c9-835a-fb3590b4ce53`

The old candidates were preserved and marked as duplicate imports.

### EVT-011 — Production-boundary execution

Reported sequence:

- migration validated and applied;
- PR #56 merged;
- merged main deployed;
- production runtime aligned to merge SHA;
- canonical Rosewood queue seeded with 34 items;
- second seed run skipped all 34;
- issue gate blocked unresolved scope;
- L: export completed.

### EVT-012 — Formal milestone closeout

Reported final verdict:

- `MILESTONE_CLOSED`
- `GO_FOR_ESTIMATOR_SCOPE_REVIEW`

Reported operator URL:

`https://bid.capitalglasstxapps.com/bids/633908da-7098-4509-b05a-91bd683b988f/scope-review`

The only remaining evidence item was an authenticated screenshot requiring Wesley’s Microsoft session.

### EVT-013 — Harvest protocol side mission

A separate closeout was pasted for CapitalGlass-Cross-Agent PR #22, improving optional Supabase harvest projection through Doppler.

This became a parallel but related closeout subject. It showed the risk of topic switching at the end of a milestone thread.

---

## 5. Harvest packets

### HP-001 — Authority decision

**Kind:** `authority-decision`

**Title:** Bid Composer is the canonical human interface for detected-scope commercial review

**Decision:**

Bid Composer owns current-estimate scope decisions, commercial disposition, proposal wording, pricing relationships, readiness, and issue gates. L: remains a generated export/evidence snapshot.

**Why durable:**

This defines the long-term ownership boundary among Bid Composer, Documents, Data Extraction, Computer Estimator, Revu, and L:.

**Evidence refs:**

- user direction that scope should go directly to Bid Composer;
- guided-scope-review milestone prompts and closeouts;
- formal closeout stating Bid Composer decision authority.

**Validation needed:**

- Application Bible;
- architecture docs;
- code ownership;
- schema contracts;
- current production behavior.

---

### HP-002 — Product workflow

**Kind:** `workflow`

**Title:** Guided scope review converts technical detection into human commercial disposition

**Workflow:**

```text
Detected scope
→ atomic review item
→ guided human decision
→ conditional notes and wording
→ proposal section mapping
→ pricing relationship
→ readiness gate
→ L: export snapshot
```

**Primary dispositions:**

- Include
- Exclude
- Alternate
- Allowance
- Clarification
- Need More Information

**Validation needed:**

- route implementation;
- API behavior;
- proposal compiler;
- issue gates;
- database records;
- production UI.

---

### HP-003 — UX pattern

**Kind:** `lesson`

**Title:** Review one commercial decision at a time, with evidence progressively disclosed

**Pattern:**

- landing screen;
- category progress;
- one main question;
- six choices;
- conditional follow-up fields;
- evidence drawer collapsed by default;
- All Items mode for power users;
- proposal destination visible;
- readiness blockers navigable.

**Why it matters:**

The estimator should feel like they are reviewing a bid, not operating an AI extraction system.

**Validation needed:**

- screenshots;
- accessibility artifacts;
- authenticated operator review;
- usability testing.

---

### HP-004 — Data model lesson

**Kind:** `architecture`

**Title:** Atomic scope-review items must be scoped to estimate revision and stable key

**Reported design:**

- `bid_scope_review_items`
- per `draft_id`
- unique `stable_key`
- evidence refs
- disposition
- note lanes
- pricing link
- proposal sections
- supersession lineage
- ingestion run

**Why durable:**

This supports idempotent imports, audit history, estimate carry-forward, and producer evidence merging.

**Validation needed:**

- migration;
- constraints;
- code;
- tests;
- production schema.

---

### HP-005 — Safety control

**Kind:** `control`

**Title:** Unresolved detected scope must block proposal issue

**Reported gate:**

`SCOPE_REVIEW_PENDING_ITEMS`

**Expected rule:**

- unresolved scope blocks issue;
- internal notes cannot leak to proposal;
- included scope requires wording;
- pricing-required items need pricing relationship;
- alternates and allowances require complete fields;
- no autonomous approval or proposal issue.

**Validation needed:**

- issue-gate code;
- unit tests;
- production API response;
- proposal issue audit.

---

### HP-006 — Canonical identity lesson

**Kind:** `failure-pattern`

**Title:** Do not infer the canonical bid from timestamp, naming, or stale validation labels

**Observed failure mode:**

Multiple same-night Rosewood smoke-import bids existed, and a stale validation alias pointed to an unrelated project.

**Correct recovery:**

- compare candidate contents;
- identify human work;
- preserve duplicates;
- create or designate one canonical bid;
- record authority in Git and DB;
- do not delete candidates.

**Validation needed:**

- canonical-bid registry;
- Supabase rows;
- audit record;
- preserved duplicate state.

---

### HP-007 — SDLC orchestration lesson

**Kind:** `protocol-upgrade`

**Title:** Production-facing milestone prompts must carry through migration, merge, deploy, live seed, and operator-visible handoff

**Problem exposed:**

Multiple intermediate closeouts stopped after code scaffolding, then after Waves 5–8, then after Waves 9–10, despite the operator goal being “I can go to Bid Composer and see the new UI.”

**Improvement:**

Milestone prompts should encode the operator-visible acceptance state from the beginning and prohibit stopping at intermediate technical boundaries unless a real authority or safety blocker exists.

**Lane C:** protocol-upgrade candidate.

**Validation needed:**

- duplication-preflight;
- protocol registry lookup;
- comparison against current WaveRunner/PromptOps rules.

---

### HP-008 — Environment classification lesson

**Kind:** `lesson`

**Title:** Distinguish branch failure from host-specific native-module failure

**Observed case:**

Local WSL build failed due to missing `lightningcss.linux-x64-gnu.node`, while governed CI later passed full validate/build.

**Lesson:**

Do not treat one unsupported host failure as a branch regression until the canonical CI or supported runtime reproduces it.

**Validation needed:**

- CI run;
- build logs;
- package-lock and platform install behavior.

---

## 6. Execution deltas

### ED-001 — Actual versus optimal milestone framing

**Actual:**

The conversation first created a project-folder workspace, then later decided Bid Composer should be the operator interface.

**Optimal:**

Lock the operator shell and authority model before investing heavily in a parallel human workspace.

**Value of actual path:**

The folder package still served as a useful evidence contract and export prototype.

---

### ED-002 — Actual versus optimal prompt progression

**Actual:**

The mission required several continuation prompts:

- Waves 0–4;
- Waves 5–8;
- Waves 9–12;
- production boundary;
- formal closeout.

**Optimal:**

One initial milestone prompt should have defined the final operator-visible end state and permitted automatic continuation through all safe waves.

**Reason for gap:**

Real authority blockers emerged, but several pauses were ordinary milestone boundaries rather than mandatory stops.

---

### ED-003 — Actual versus optimal identity handling

**Actual:**

Canonical bid identity was resolved late, after most feature work.

**Optimal:**

Resolve the pilot project, bid, and current estimate before implementation reaches production integration.

**Impact:**

Late identity ambiguity blocked the live pilot and created a separate designation wave.

---

### ED-004 — Actual versus optimal visual proof

**Actual:**

The final closeout relied on static visual/a11y artifacts plus an auth redirect screenshot.

**Optimal:**

Capture authenticated operator screenshots and one real guided-review interaction during acceptance.

**Constraint:**

Microsoft SSO required the operator session.

---

### ED-005 — Actual versus optimal cross-thread focus

**Actual:**

A separate Supabase harvest-projection PR closeout appeared before the guided-scope-review formal closeout resumed.

**Optimal:**

Close the active milestone before switching to unrelated infrastructure work, or explicitly fork the side mission into a separate thread.

---

## 7. Waste ledger

### TW-001 — Repeated restatement of the same target architecture

The Bid Composer operator-shell model was restated multiple times in prose.

**Waste type:** token repetition

**Better pattern:**

Create a stable architecture anchor once:

```text
Bid Composer = operator and decision authority
L: = export snapshot
Upstream systems = evidence producers
```

Reference the anchor in continuation prompts.

---

### TW-002 — Repeated full prompts rather than compact deltas

Several continuation prompts restated most of the milestone scope.

**Waste type:** context duplication

**Better pattern:**

Use:

- prior receipt;
- current SHA;
- changed facts;
- remaining waves;
- preserved invariants;
- exact gates.

---

### TW-003 — Premature “mission accomplished” language

The assistant used completion language after production proof but before the separate formal closeout was run.

**Waste type:** closeout ambiguity

**Risk:**

Operators may interpret runtime readiness as canonical milestone closure.

**Better pattern:**

Use separate labels:

- `OPERATIONALLY_READY`
- `FORMAL_CLOSEOUT_PENDING`
- `MILESTONE_CLOSED`

---

### TW-004 — Unnecessary re-litigation of merge timing

The thread repeatedly debated whether to merge after partial waves.

**Waste type:** governance re-decision

**Better pattern:**

Put merge authorization in the initial control anchor:

```text
Merge prohibited until migration, CI, live pilot, and closeout gates pass.
```

---

### TW-005 — Side-mission contamination

The CapitalGlass-Cross-Agent PR #22 projection closeout was inserted during the Scope Review closure sequence.

**Waste type:** topic switching

**Better pattern:**

Start a separate thread or explicitly mark it:

`SIDE_MISSION — DOES NOT ALTER ACTIVE MILESTONE`

---

## 8. Duplication detector

### DUP-001 — Bid Composer operator-shell decision repeated

The same decision was discussed in several consecutive turns.

**Status:** `NEEDS_REGISTRY_LOOKUP_FIRST`

Potential existing intelligence:

- estimating-spine architecture;
- Bid Composer as single operator shell;
- CE/DE/VAE producer model.

Do not publish a duplicate seed until Cursor checks the Intelligence Hub and existing authority records.

---

### DUP-002 — Guided review UX pattern may overlap existing proposal-review intelligence

The item-by-item quiz, evidence drawer, and proposal section mapping may overlap:

- Human Estimator workflow;
- proposal generator product-design notes;
- scope claims review;
- door schedule review.

**Status:** `NEEDS_REGISTRY_LOOKUP_FIRST`

---

### DUP-003 — Canonical-bid designation may overlap canonical project identity protocols

Search for existing intelligence around:

- canonical bid registry;
- duplicate ingestion bids;
- current estimate authority;
- project-to-bid relationship.

**Status:** `NEEDS_REGISTRY_LOOKUP_FIRST`

---

### DUP-004 — Prompt orchestration lesson likely overlaps current ChatGPT orchestration rule

The thread itself used the uploaded orchestration rule. Any new protocol seed must be a delta, not a duplicate restatement.

**Status:** `NEEDS_REGISTRY_LOOKUP_FIRST`

---

## 9. Operator friction

### OF-001 — Too many technical stopping points

Wesley repeatedly had to direct the mission to continue “all the way” until the UI was visible.

**Root cause:**

Agent execution optimized around technical wave boundaries instead of the operator-visible end state.

**Remedy:**

Prompts must define the human acceptance condition and forbid stopping at intermediate PASS states.

---

### OF-002 — The first human workspace was too file-centric

The project folder contained useful artifacts but required the estimator to open HTML, JSON, XLSX, PDFs, and decision files manually.

**Remedy:**

Make Bid Composer the review UI and use the project folder only as export/evidence.

---

### OF-003 — Too many disposition options at first glance

Seven top-level options created avoidable cognitive load.

**Remedy:**

Use six primary dispositions and put `Not Our Scope` under Exclude.

---

### OF-004 — Technical evidence threatened to clutter the commercial workflow

Raw provenance, hashes, file paths, and extraction details could overwhelm the estimator.

**Remedy:**

Use progressive disclosure and keep advanced provenance collapsed.

---

### OF-005 — Canonical identity ambiguity surfaced late

The absence of one canonical Rosewood bid blocked production at the end.

**Remedy:**

Resolve pilot identity in Wave 0 for any live-project milestone.

---

### OF-006 — SSO prevented full autonomous visual proof

The agent could verify redirect behavior but not the authenticated UI.

**Remedy:**

Define operator-only acceptance steps and a screenshot handoff contract early.

---

## 10. ROI backlog

### ROI-001 — Operator-visible end-state gate in every milestone prompt

**Impact:** Very high  
**Effort:** Low  
**Rank:** 1

Add a required field:

```text
Operator-visible acceptance:
<exact URL, screen, data state, and action the human must be able to perform>
```

Prevent closeout if this state is not proven or explicitly blocked.

---

### ROI-002 — Canonical live-pilot identity gate in Wave 0

**Impact:** Very high  
**Effort:** Low to medium  
**Rank:** 2

Before implementation:

- resolve project;
- resolve bid;
- resolve current estimate;
- classify duplicates;
- record authoritative pointers.

---

### ROI-003 — Stable continuation receipt with delta-only prompts

**Impact:** High  
**Effort:** Low  
**Rank:** 3

Generate a compact continuation block after every wave:

- milestone;
- current SHA;
- passed gates;
- remaining gates;
- changed facts;
- stop conditions;
- next execution boundary.

---

### ROI-004 — Authenticated operator acceptance capture workflow

**Impact:** High  
**Effort:** Medium  
**Rank:** 4

Create a standard operator handoff:

1. open exact URL;
2. sign in;
3. capture landing;
4. capture guided item;
5. confirm counts and controls;
6. upload screenshots;
7. close remaining operator-only gate.

---

### ROI-005 — Shared Scope Review contract for future plan sets

**Impact:** High  
**Effort:** Medium  
**Rank:** 5

Generalize:

- atomic review items;
- stable keys;
- evidence refs;
- disposition map;
- proposal mappings;
- L export.

This reduces Rosewood-specific branching.

---

### ROI-006 — Topic isolation guard

**Impact:** Medium  
**Effort:** Low  
**Rank:** 6

When a new unrelated closeout is pasted into an active mission, require:

```text
SIDE_MISSION
ACTIVE_MISSION_UNCHANGED
```

or create a new thread.

---

## 11. Do-not-advance guards

Do not advance future Scope Review milestones when:

- canonical project, bid, or current estimate is ambiguous;
- migration is not validated;
- branch-introduced CI failures exist;
- runtime SHA does not match merged authority;
- scope import is not idempotent;
- internal notes can enter proposal output;
- unresolved items do not block issue;
- L: is being used as a parallel decision editor;
- duplicate smoke bids are active;
- live operator acceptance is required but not acknowledged;
- commercial decisions would be fabricated for testing;
- the next step is actually human scope review rather than software construction.

---

## 12. Seed packet candidates

### Seed candidate 1

```json
{
  "seedId": "IH-THREAD-BID-COMPOSER-SCOPE-REVIEW-AUTHORITY-V1",
  "kind": "authority-decision",
  "title": "Bid Composer is the canonical human interface for detected-scope commercial review",
  "status": "CANDIDATE",
  "labels": [
    "bid-composer",
    "scope-review",
    "authority",
    "estimating-spine"
  ],
  "retrievalQuestions": [
    "Where should estimators review detected scope and make include or exclude decisions?",
    "Is the Computer Estimator L-drive folder the decision authority or an export snapshot?",
    "Which system owns proposal wording and commercial scope disposition?"
  ],
  "evidenceRefs": [
    "Current ChatGPT thread: operator direction to move scope review into Bid Composer",
    "Current ChatGPT thread: formal milestone closeout for guided Scope Review",
    "Attachment: CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A future plan-set workflow proposes a new standalone human review interface.",
    "startAt": "Bid Composer current-estimate Scope Review architecture and ownership boundary.",
    "runPreflight": [
      "Check Application Bible ownership",
      "Check canonical bid and current estimate",
      "Check existing Scope Review contracts"
    ],
    "doNot": [
      "Create a second decision authority",
      "Use L: as a parallel editor",
      "Auto-approve commercial scope"
    ],
    "proveBeforeClaiming": [
      "Bid Composer persistence",
      "proposal mapping",
      "issue-gate enforcement",
      "L export direction"
    ]
  }
}
```

### Seed candidate 2

```json
{
  "seedId": "IH-THREAD-OPERATOR-VISIBLE-MILESTONE-GATE-V1",
  "kind": "protocol-upgrade",
  "title": "Milestone closeout must prove the operator-visible end state, not only technical waves",
  "status": "CANDIDATE",
  "labels": [
    "protocol-upgrade",
    "prompt-orchestration",
    "formal-closeout",
    "operator-acceptance"
  ],
  "retrievalQuestions": [
    "Why did the guided Scope Review mission require repeated continuation prompts?",
    "What acceptance condition should prevent agents from stopping after scaffold, migration, or deploy only?",
    "How should prompts encode the exact URL and user action required for completion?"
  ],
  "evidenceRefs": [
    "Current ChatGPT thread: repeated operator request to continue until Bid Composer UI was visible",
    "Current ChatGPT thread: Waves 0-4, 5-8, 9-10, production-boundary, and closeout prompts",
    "Attached ChatGPT orchestration rule referenced earlier in the thread"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A milestone has an explicit human-facing outcome.",
    "startAt": "Define exact operator-visible acceptance before execution.",
    "runPreflight": [
      "Resolve canonical URL or UI entry point",
      "Resolve authoritative project identity",
      "Define final live data state"
    ],
    "doNot": [
      "Close after code exists",
      "Close after deploy without live proof",
      "Use vague language such as feature complete"
    ],
    "proveBeforeClaiming": [
      "exact production route",
      "runtime SHA",
      "expected item count",
      "human action available",
      "safety gates"
    ]
  }
}
```

### Seed candidate 3

```json
{
  "seedId": "IH-THREAD-CANONICAL-BID-DESIGNATION-V1",
  "kind": "failure-pattern",
  "title": "Do not infer canonical bid identity from timestamp or naming",
  "status": "CANDIDATE",
  "labels": [
    "failure-pattern",
    "bid-identity",
    "duplicate-import",
    "rosewood"
  ],
  "retrievalQuestions": [
    "How should an agent choose a canonical bid when multiple draft imports exist?",
    "What evidence must be compared before designating or creating a canonical bid?",
    "How should duplicate smoke-import bids be preserved?"
  ],
  "evidenceRefs": [
    "Current ChatGPT thread: four ambiguous Rosewood bid candidates",
    "Current ChatGPT thread: CREATE_FRESH_CANONICAL_BID decision",
    "Current ChatGPT thread: preservation of duplicate_import candidates"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "Multiple bids or drafts map to the same project.",
    "startAt": "Compare human edits, pricing, proposal sections, ingestion source, and audit history.",
    "runPreflight": [
      "Resolve project authority",
      "Inspect all candidate bids",
      "Check canonical registry",
      "Check current-estimate pointer"
    ],
    "doNot": [
      "Choose newest by default",
      "Delete candidates",
      "Trust stale alias labels",
      "Merge questionable smoke data into production"
    ],
    "proveBeforeClaiming": [
      "canonical bid ID",
      "canonical draft ID",
      "designation rationale",
      "preserved duplicate lineage",
      "audit record"
    ]
  }
}
```

### Seed candidate 4

```json
{
  "seedId": "IH-THREAD-GUIDED-SCOPE-REVIEW-UX-V1",
  "kind": "lesson",
  "title": "Commercial scope review should feel like a calm quiz, not an AI dashboard",
  "status": "CANDIDATE",
  "labels": [
    "ux",
    "scope-review",
    "estimating",
    "proposal"
  ],
  "retrievalQuestions": [
    "What is the preferred user flow for reviewing detected scope?",
    "How should evidence be shown without cluttering the estimator workflow?",
    "Which scope dispositions should appear as primary choices?"
  ],
  "evidenceRefs": [
    "Current ChatGPT thread: user-flow and visual-aesthetic review",
    "Current ChatGPT thread: six primary dispositions and exclusion subtypes",
    "Current ChatGPT thread: evidence drawer and proposal destination guidance"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A review UI exposes technical detections to estimators.",
    "startAt": "One item, one question, one commercial decision.",
    "runPreflight": [
      "Check existing Scope Review components",
      "Check accessibility patterns",
      "Check proposal section mappings"
    ],
    "doNot": [
      "Show raw hashes or paths by default",
      "Show every field at once",
      "Use seven or more equal top-level actions",
      "Make evidence dominate the main screen"
    ],
    "proveBeforeClaiming": [
      "guided flow",
      "conditional fields",
      "evidence drawer",
      "keyboard path",
      "proposal destination visibility"
    ]
  }
}
```

---

## 13. Future-agent instructions

When continuing from this milestone:

1. Treat the guided Scope Review interface as built and operational only after canonical retrieval confirms the formal closeout.
2. Start from the canonical Rosewood bid and current estimate, not the old smoke imports.
3. Do not reopen UI construction when the actual next milestone is human disposition.
4. Preserve all 34 real Rosewood items as pending until Wesley reviews them.
5. Never fabricate dispositions to clear readiness.
6. Use fixture or reversible records for technical path tests.
7. Keep internal notes separate from customer-facing wording.
8. Require explicit issue-gate proof before proposal issue.
9. Publish L: as a snapshot from Bid Composer decisions.
10. For new plan sets, resolve canonical bid identity in Wave 0.
11. For any future continuation prompt, use the formal receipt and current SHA rather than replaying the thread.
12. Search existing Intelligence Hub seeds before creating new protocol or architecture records.

Recommended next milestone:

`rosewood-scope-disposition-and-proposal-readiness-pilot-v1`

This is an operator workflow, not a construction milestone.

---

## 14. Publication truth table

| Layer | State |
| --- | --- |
| Git authority | `not-run` |
| L: Hub catalog | `not-run` |
| Z: AI cache | `not-run` |
| Supabase projection | `not-run` |
| Freshness gate | `not-run` |
| Lane C export (`harvest:export:protocol-self-learning`) | `not-run` |
| Lane C Data-Extraction ingest/publish | `not-run` |
| Lane C catalog (`Harvest Protocol Self Learning`) | `not-run` |
| Lane C retrieval | `not-run` |
| Lane C authority | `PROPOSAL` / `RETRIEVAL_ONLY` |
| Automatic protocol mutation | `false` |

```text
Publication: NOT_RUN_BY_CURSOR
projection.hubPublishStatus: not-run
protocolSelfLearning.exportStatus: not-run
protocolSelfLearning.catalogPublishStatus: not-run
```

---

## 15. Acceptance checklist

- [x] Final summary included
- [x] Harvest verdict declared
- [x] T2 rationale included
- [x] Retrieval preflight uses `INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT`
- [x] Thread event inventory included
- [x] Eight harvest packet kinds represented as applicable
- [x] Execution deltas included
- [x] Waste ledger included
- [x] Duplication detector included
- [x] Operator friction included
- [x] ROI backlog ranked
- [x] Do-not-advance guards included
- [x] Seed candidates included
- [x] Each seed has at least two retrieval questions
- [x] Each seed has evidence refs
- [x] Each seed has future-agent instructions
- [x] All seeds are `CANDIDATE`
- [x] Future-agent instructions included
- [x] Publication truth table included
- [x] Lane C fields remain `not-run`
- [x] No `HARVEST_COMPLETE` claim
- [x] No `OPERATIONAL` claim
- [x] No live `INDEX_HIT` claim
- [x] Cursor handoff command included

---

## 16. Next operator action

Hand this findings file to Cursor and run:

```text
Ingest ChatGPT thread autopsy findings per chat-thread-closeout-autopsy-harvest-chatgpt-v1.

npm run harvest:ingest-chatgpt-findings -- \
  --input=<findings.md> \
  --harvest-id=harvest-2026-08-06-bid-composer-guided-scope-review-v1

Then run duplication-preflight, validate, and operator publication.
```

Cursor command chain:

```bash
npm run harvest:duplication-preflight -- \
  --harvest-id=harvest-2026-08-06-bid-composer-guided-scope-review-v1

npm run harvest:sync-derived -- \
  harvest-2026-08-06-bid-composer-guided-scope-review-v1

npm run harvest:validate -- \
  harvest-2026-08-06-bid-composer-guided-scope-review-v1

npm run harvest:validate-autopsy -- \
  --harvest-id=harvest-2026-08-06-bid-composer-guided-scope-review-v1

npm run test:harvest

# Operator only:
npm run harvest:publish-intelligence-full -- \
  --harvest-id=harvest-2026-08-06-bid-composer-guided-scope-review-v1
```

ChatGPT output verdict:

`DRAFT_READY_FOR_CURSOR_VALIDATION`
