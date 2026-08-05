# System Advancement Harvest — ChatGPT Findings Template v1

Copy this structure into `system-advancement-findings-source.md`. Replace placeholders. Do not leave sections empty without `NONE` rationale.

**Harvest id:** `harvest-YYYY-MM-DD-<slug>-v1`  
**Protocol:** `chat-thread-system-advancement-harvest-chatgpt-v1`  
**Verdict:** `SYSTEM_ADVANCEMENT_DRAFT_READY` | `DRAFT_READY_FOR_CURSOR_VALIDATION`

---

## 1. Executive advancement summary

- Original thread goal:
- System constraints revealed:
- Top three recommended builds:
- Most valuable bold idea:
- Expected impact (cost, speed, reliability, operator effort):

## 2. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

## 3. Scope ledger

- primary mission:
- completed lanes:
- open lanes:
- blocked lanes:
- unrelated follow-ups:
- deferred work:
- do-not-merge boundaries:

## 4. Correction ledger

### COR-001

- priorAssumption:
- correction:
- correctedModel:
- affectedFindings: [EVT-..., IMP-...]
- futurePrevention:

## 5. Advancement cycle assessment

- harvestRelationship: NEW_SYNTHESIS | NEW_EVIDENCE | DUPLICATE_CONCEPT | REFINEMENT | NO_NEW_ADVANCEMENT
- priorAdvancementRefs:
- rationale:

## 6. Thread event inventory

### EVT-001

- summary:
- evidenceClassification: CHAT_DIRECT | ATTACHMENT_SOURCE | USER_REPORTED_OPERATIONAL | CROSS_CHECK_CANDIDATE

## 7. Existing-system diagnosis

(workflow, architecture, token, SDLC, reliability, operator, observability, missing capability)

## 8. Improvement proposals (IMP-###)

### IMP-001 / ADV-THREAD-001

```json
{
  "improvementId": "IMP-001",
  "conceptId": "ADV-THREAD-001",
  "classification": ["SYNTHESIZED", "CROSS_CHECK_REQUIRED"],
  "area": "workflow | architecture | token | sdlc | reliability | operator | platform",
  "wavePhaseImproved": ["Wave8", "CROSS_WAVE"],
  "problemObserved": "",
  "evidenceRefs": ["EVT-001"],
  "evidenceClassification": ["CHAT_DIRECT"],
  "proposedDesign": "",
  "novelContribution": "",
  "whyItIsBetter": "",
  "smallestUsefulVersion": "",
  "fullVision": "",
  "acceptanceProof": "",
  "crossCheckRequired": true,
  "status": "CANDIDATE",
  "implementationStatus": "NOT_STARTED"
}
```

(Repeat for minimum counts per protocol.)

## 9. Workflow redesign

## 10. Token-efficiency analysis

## 11. SDLC advancement model

## 12. Architecture advancement (incremental / structural / future state)

## 13. Reusable suite components

## 14. Waste ledger (TW-###)

## 15. Duplication detector (DUP-###)

- duplicationClass: REPEATED_DISCUSSION | POSSIBLE_EXISTING_IMPLEMENTATION | ...

## 16. Ranked advancement backlog

## 17. Experiment candidates

## 18. Seed packet candidates

(`intelligenceKind: advancement`, ≥2 retrievalQuestions, classified evidenceRefs)

## 19. New capability proposals

## 20. Cursor cross-check plan

## 21. Novelty self-check

- [ ] ≥1 SYNTHESIZED not explicit in thread
- [ ] ≥1 INVENTED evidence-linked
- [ ] ≥1 failure-class removal
- [ ] ≥1 token/context reduction
- [ ] ≥1 gated-wave improvement
- [ ] Top-3 acceptance proofs defined
- [ ] Not summary-only

## 22. Publication truth

| Layer | State |
| --- | --- |
| Git authority | not-run |
| L: Hub catalog | not-run |
| Z: AI cache | not-run |
| Supabase projection | not-run |
| Freshness gate | not-run |

```text
Publication: NOT_RUN_BY_CURSOR
projection.hubPublishStatus: not-run
```

## 23. Cursor handoff

```text
npm run harvest:ingest-chatgpt-advancement -- \
  --input=artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/system-advancement-findings-source.md \
  --harvest-id=harvest-YYYY-MM-DD-<slug>-v1
```

(Phase 2 — copy-only ingest available until parser ships.)
