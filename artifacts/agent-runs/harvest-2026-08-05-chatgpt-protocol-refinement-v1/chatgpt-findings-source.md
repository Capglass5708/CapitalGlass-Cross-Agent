# ChatGPT Findings Source — ChatGPT Harvest Protocol Refinement Thread

## 1. Final summary

```text
Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Start verdict: UNHARVESTED_THREAD
Target tier: T2
Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION
```

This thread established two durable protocol corrections: the OBSERVED report lane must remain separate from system-advancement synthesis, and the findings protocol should optimize for compression and selectivity rather than template completion. The thread also confirmed the first pilot should keep the existing `harvest-*` run identity and distinguish lanes by filename.

## 2. Harvest verdict and tier rationale

**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

**Tier:** T2

The thread contains multiple corrections, a protocol-design decision, a frozen-candidate refinement, and an explicit empirical-validation plan. It warrants a compact T2 harvest, but not a broad packet inventory.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

The user referenced a scout result (`INDEX_HIT_AI_CACHE`) in a pasted work package, but ChatGPT did not execute that retrieval in this session. It is therefore not promoted as live retrieval evidence.

## 4. Scope ledger

### Primary mission

Refine the ChatGPT OBSERVED-harvest protocol so it produces a higher-signal `chatgpt-findings-source.md` from completed threads.

### Closed lanes

- Clarified OBSERVED versus ADVANCEMENT output responsibilities.
- Chose existing `harvest-*` directory identity for the first dual-lane pilot.
- Defined compression, extraction, selectivity, and thread-grounded ROI rules.
- Froze structural protocol edits pending empirical samples.

### Open lanes

- Run empirical samples across thin, medium, architectural, debugging, and planning threads.
- Review signal density and edit burden.
- Decide from observed output whether any further structural protocol change is justified.

### Deferred work

- Downstream ingest, validation, schemas, registries, L: publication, retrieval filters, and T2 batch synthesis.
- Separate ADVANCEMENT protocol implementation and validation.

### Do-not-merge boundaries

- Do not mix synthesized concepts into `chatgpt-findings-source.md`.
- Do not judge protocol quality by downstream validator success.
- Do not structurally revise the frozen candidate before empirical evidence.

## 5. Correction ledger

### COR-001 — ROI question scope corrected

- **priorAssumption:** The user was asking for the ROI of the Revu estimator-productivity system.
- **correction:** The user meant the ChatGPT report/harvest protocol that creates a findings report, pushes it to Git, and moves it toward L: staging/publication.
- **correctedModel:** Confirm the target system before applying an ROI model when several systems are active in the same thread.
- **affectedFindings:** EVT-002, HP-001, ROI-001.
- **evidenceRef:** `CHAT_DIRECT`.

### COR-002 — Conceptual enhancements corrected into a separate lane

- **priorAssumption:** Conceptual enhancements could be treated as part of the OBSERVED findings report.
- **correction:** The user clarified they meant entirely new ways of working and new concepts at the system level.
- **correctedModel:** OBSERVED captures what happened and what was learned; ADVANCEMENT creates new products, workflows, automations, and architectures.
- **affectedFindings:** EVT-003, HP-002, ROI-002.
- **evidenceRef:** `CHAT_DIRECT`.

### COR-003 — New advancement run identity rejected for first pilot

- **priorAssumption:** Use `advancement-YYYY-MM-DD-<slug>-v1` directories.
- **correction:** Choose existing `harvest-*` run directories and distinguish lanes by filename.
- **correctedModel:** One completed thread uses one harvest identity; OBSERVED and ADVANCEMENT outputs coexist under that run when both are present.
- **affectedFindings:** EVT-004, HP-003.
- **evidenceRef:** `CHAT_DIRECT`.

## 6. Thread event inventory

| ID | Event | Evidence class | Future efficiency impact |
| --- | --- | --- | --- |
| EVT-001 | The thread produced and pushed an OBSERVED Revu findings report, then verified that the Cursor ingest/validation commands were included in the report. | USER_REPORTED_OPERATIONAL | Established the draft-to-Git handoff pattern and exposed ambiguity about which actions belong in the report versus chat closeout. |
| EVT-002 | The user asked for a grade and ROI, then clarified the target was the harvest protocol rather than Revu. | CHAT_DIRECT | Future agents should resolve the object of evaluation before calculating ROI. |
| EVT-003 | The user distinguished thread autopsy from creating new methods and concepts; the ADVANCEMENT lane was defined as separate. | CHAT_DIRECT | Prevents synthesis from contaminating observed evidence and gives new concepts a governed home. |
| EVT-004 | For the first pilot, the user selected the existing `harvest-*` directory pattern, with lane-specific filenames. | CHAT_DIRECT | Avoids introducing a second run-identity model before the advancement lane is operational. |
| EVT-005 | The protocol refinement work package reframed the model around compression, selectivity, thread traceability, and justified future savings. | ATTACHMENT_SOURCE | Directly reduces low-signal, template-padded findings artifacts. |
| EVT-006 | The refined protocol was frozen at commit `e48b793`, with further structural edits blocked until real-thread samples are reviewed. | USER_REPORTED_OPERATIONAL | Creates an empirical stop condition and prevents speculative protocol growth. |

## 7. Harvest packets

### HP-001 — Planning technique: resolve the target system before grading ROI

- **kind:** lesson
- **durability:** medium
- **rule:** When a thread contains several nested systems, restate the exact system being evaluated before assigning a grade, ROI, or roadmap.
- **evidenceRef:** `CHAT_DIRECT`.
- **futureEfficiencyImpact:** Avoids producing a polished analysis for the wrong target.

### HP-002 — Protocol boundary: OBSERVED and ADVANCEMENT are separate artifacts

- **kind:** protocol-upgrade
- **durability:** high
- **rule:** `chatgpt-findings-source.md` contains traceable observed intelligence; `system-advancement-findings-source.md` contains synthesized new concepts. They may share one harvest identity but must not share epistemic status.
- **evidenceRef:** `CHAT_DIRECT`, `ATTACHMENT_SOURCE`.
- **futureEfficiencyImpact:** Preserves trust while still enabling innovation.

### HP-003 — Protocol rule: optimize for signal density, not section completion

- **kind:** protocol-upgrade
- **durability:** high
- **rule:** Treat sections as a menu, rank ROI only when earned, prefer `NONE_FOUND` or omission to fabricated content, and justify future savings from the thread.
- **evidenceRef:** `ATTACHMENT_SOURCE`.
- **futureEfficiencyImpact:** Reduces token use, review burden, and weak intelligence publication.

## 8. Execution deltas

### ED-001 — Evaluation target ambiguity

- **actual:** A detailed ROI analysis was produced for Revu before the user clarified the target was the harvest protocol.
- **optimal:** Ask or infer from the immediately preceding object, then explicitly state the evaluated system in the first sentence.
- **evidenceRef:** `CHAT_DIRECT`.

### ED-002 — Protocol design before empirical evidence

- **actual:** Several conceptual refinements were proposed before the user supplied the frozen-candidate work package.
- **optimal:** Once a candidate is frozen, stop structural speculation and run diverse sample threads.
- **evidenceRef:** `CHAT_DIRECT`, `USER_REPORTED_OPERATIONAL`.

## 9. Waste ledger

### TW-001 — Wrong-target ROI analysis

- **waste:** A long Revu ROI analysis did not answer the user’s intended question.
- **cause:** Multiple active systems in the conversation and no explicit target restatement.
- **prevention:** Use a one-line target confirmation in the answer itself: “Grading the harvest protocol, not Revu.”
- **evidenceRef:** `CHAT_DIRECT`.

## 10. Duplication detector

### DUP-001

- **classification:** REPEATED_DISCUSSION
- **theme:** The OBSERVED-versus-ADVANCEMENT distinction was explained multiple times.
- **action:** Preserve one canonical boundary statement in both protocols and reference it rather than re-deriving it.
- **evidenceRef:** `CHAT_DIRECT`.

## 11. Operator friction

### OF-001 — Ambiguous “run file” trigger

The user’s terse trigger depended on the attached protocol for mode, branch, output, and closeout behavior. The protocol handled this, but future interfaces should surface the chosen tier and output path automatically.

## 12. ROI backlog

### ROI-001 — Add explicit target-object restatement before system grading

- **rank:** 1
- **improvementType:** planning_technique
- **futureSavings:**
  - **tokenSavingsEstimate:** high
  - **timeSavingsEstimate:** medium
  - **toolCallsAvoided:** 0
  - **repeatedInvestigationAvoided:** false
  - **implementationReworkAvoided:** true
  - **appliesTo:** `cursor_planning`
  - **futureEfficiencyImpact:** Prevents long analyses of the wrong system when several products or protocols are active in one thread.
- **optimalFutureWorkflow:**
  1. Identify the noun phrase immediately referenced by the user.
  2. Restate it in the opening sentence.
  3. Grade only that system.
  4. Separate assumptions from measured evidence.

### ROI-002 — Enforce lane separation through filename and evidence status

- **rank:** 2
- **improvementType:** validation_rule
- **futureSavings:**
  - **tokenSavingsEstimate:** medium
  - **timeSavingsEstimate:** high
  - **toolCallsAvoided:** 2
  - **repeatedInvestigationAvoided:** true
  - **implementationReworkAvoided:** true
  - **appliesTo:** `cursor_planning`, `testing`
  - **futureEfficiencyImpact:** Prevents teams from treating synthesized concepts as observed operational truth.
- **optimalFutureWorkflow:**
  1. Classify the requested lane before drafting.
  2. Write OBSERVED and ADVANCEMENT to separate filenames.
  3. Keep both under one `harvest-*` identity when they originate from the same thread.
  4. Validate and publish them independently.

### ROI-003 — Empirically score signal density before further protocol edits

- **rank:** 3
- **improvementType:** stop_condition
- **futureSavings:**
  - **tokenSavingsEstimate:** high
  - **timeSavingsEstimate:** high
  - **toolCallsAvoided:** 3
  - **repeatedInvestigationAvoided:** true
  - **implementationReworkAvoided:** true
  - **appliesTo:** `cursor_planning`, `testing`
  - **futureEfficiencyImpact:** Stops speculative protocol expansion and directs effort to observed output weaknesses.
- **optimalFutureWorkflow:**
  1. Run the frozen protocol on diverse completed threads.
  2. Score durability, traceability, selectivity, ROI credibility, and edit burden.
  3. Record recurring failure patterns.
  4. Change the protocol only when the same weakness appears across samples.

## 13. Do-not-advance guards

1. Do not mix ADVANCEMENT synthesis into this OBSERVED artifact.
2. Do not claim the L: move or Cursor ingest ran merely because Git push occurred.
3. Do not claim `INDEX_HIT_AI_CACHE` from a pasted report as if ChatGPT executed it.
4. Do not add more structural protocol fields until empirical sample review identifies a recurring weakness.
5. Do not use packet count or file length as a quality metric.

## 14. Seed packet candidates

### Seed candidate 1

```json
{
  "seedId": "IH-THREAD-OBSERVED-ADVANCEMENT-LANE-SEPARATION-V1",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "improvementType": "validation_rule",
  "summary": "Keep observed findings and synthesized system advancements in separate files under one harvest identity.",
  "futureSavings": {
    "tokenSavingsEstimate": "medium",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 2,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["cursor_planning", "testing"],
    "futureEfficiencyImpact": "Prevents concept drafts from being mistaken for verified operational intelligence."
  },
  "optimalFutureWorkflow": [
    "1. Classify OBSERVED versus ADVANCEMENT before drafting.",
    "2. Use chatgpt-findings-source.md for observed material.",
    "3. Use system-advancement-findings-source.md for synthesis.",
    "4. Store both under one harvest-* run when sourced from the same thread.",
    "5. Validate and publish independently."
  ],
  "retrievalQuestions": [
    "Where should new system concepts from a completed thread be recorded?",
    "Can observed facts and advancement synthesis share one findings file?"
  ],
  "evidenceRefs": [
    {
      "classification": "CHAT_DIRECT",
      "ref": "User clarified that new ways of working and entirely new concepts belong to a separate conceptual lane."
    },
    {
      "classification": "ATTACHMENT_SOURCE",
      "ref": "Attached protocol defines OBSERVED and ADVANCEMENT as separate outputs."
    }
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A completed thread contains both lessons and new product or architecture ideas",
    "startAt": "Lane classification",
    "runPreflight": "Determine whether each statement is observed, reported operationally, or synthesized",
    "doNot": "Place synthesized concepts in chatgpt-findings-source.md",
    "proveBeforeClaiming": "Independent validation for each lane"
  }
}
```

### Seed candidate 2

```json
{
  "seedId": "IH-THREAD-SIGNAL-DENSITY-BEFORE-PROTOCOL-EXPANSION-V1",
  "kind": "lesson",
  "status": "CANDIDATE",
  "improvementType": "stop_condition",
  "summary": "Freeze the findings protocol and use diverse real-thread samples to justify further structural edits.",
  "futureSavings": {
    "tokenSavingsEstimate": "high",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 3,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["cursor_planning", "testing"],
    "futureEfficiencyImpact": "Prevents speculative complexity and keeps protocol changes tied to observed model behavior."
  },
  "optimalFutureWorkflow": [
    "1. Freeze the candidate protocol.",
    "2. Run thin, medium, architectural, debugging, and planning samples.",
    "3. Score signal density and edit burden.",
    "4. Identify repeated failure modes.",
    "5. Edit only when evidence supports a change."
  ],
  "retrievalQuestions": [
    "When should the ChatGPT harvest protocol be structurally changed again?",
    "How should findings quality be evaluated after the compression refinement?"
  ],
  "evidenceRefs": [
    {
      "classification": "USER_REPORTED_OPERATIONAL",
      "ref": "User reported protocol frozen at commit e48b793 pending empirical samples."
    }
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A protocol refinement is proposed after the candidate has been frozen",
    "startAt": "Empirical sample outputs",
    "runPreflight": "Check whether the weakness recurs across multiple thread types",
    "doNot": "Add fields or sections based only on speculation",
    "proveBeforeClaiming": "Observed low-signal or high-edit-burden outputs"
  }
}
```

## 15. Future-agent instructions

1. State the exact system being evaluated before grading or estimating ROI.
2. Use one `harvest-*` identity per completed thread; distinguish intelligence lanes by filename.
3. Keep OBSERVED and ADVANCEMENT epistemically separate.
4. Optimize `chatgpt-findings-source.md` for signal density, not packet count.
5. Prefer omission or `NONE_FOUND` over weak entries.
6. Treat future-savings claims as evidence-backed or write `none`.
7. Keep the protocol frozen until empirical outputs show a recurring problem.

## 16. Publication truth table

| Layer | State |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | `not-run` until push completes |
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

## 17. Acceptance checklist

- [x] OBSERVED lane only.
- [x] Compression over replay.
- [x] Corrections override earlier assumptions.
- [x] Findings are traceable to chat or attachment.
- [x] No unsupported packet categories were manufactured.
- [x] ROI is tied to observed waste or rework.
- [x] Seed candidates are distinct and marked `CANDIDATE`.
- [x] No live retrieval or downstream publication claim.
- [ ] Cursor duplication preflight.
- [ ] Cursor validation.
- [ ] Empirical sample scoring.

## 18. Next operator action

Pull branch `chat-gpt-harvest` on `Capglass5708/CapitalGlass-Cross-Agent`, then run:

```bash
npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-05-chatgpt-protocol-refinement-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-05-chatgpt-protocol-refinement-v1

npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-05-chatgpt-protocol-refinement-v1
npm run harvest:sync-derived -- harvest-2026-08-05-chatgpt-protocol-refinement-v1
npm run harvest:validate -- harvest-2026-08-05-chatgpt-protocol-refinement-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-05-chatgpt-protocol-refinement-v1
npm run test:harvest
```

Operator publication remains separate:

```bash
npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-05-chatgpt-protocol-refinement-v1
```

## 19. Git push instructions

- **Repository:** `Capglass5708/CapitalGlass-Cross-Agent`
- **Branch:** `chat-gpt-harvest`
- **File:** `artifacts/agent-runs/harvest-2026-08-05-chatgpt-protocol-refinement-v1/chatgpt-findings-source.md`
- **Commit message:** `harvest(chatgpt): draft findings harvest-2026-08-05-chatgpt-protocol-refinement-v1`
