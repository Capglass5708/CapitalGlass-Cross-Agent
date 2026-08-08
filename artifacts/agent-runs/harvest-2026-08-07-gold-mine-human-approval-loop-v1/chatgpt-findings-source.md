# ChatGPT Findings Source — harvest-2026-08-07-gold-mine-human-approval-loop-v1

## 1. Final summary + verdict

**Mission:** `chat-thread-closeout-autopsy-harvest-chatgpt-v1`  
**Lane:** `CHAT_CONTEXT_ONLY`  
**Protocol:** v2.1 — Gold Mine compounding evidence  
**Mode:** `DRAFT_FILE`  
**Start verdict:** `UNHARVESTED_THREAD`  
**Target closeout:** `CHATGPT_SOURCE_PUBLISHED`

This thread established and then operationally closed a new improvement-discovery milestone named **Gold Mine**. The thread also proved the upstream historical intelligence path from Cross-Agent raw custody through Data-Extraction into the Intelligence Hub, then defined a human approval boundary immediately before implementation. The operator explicitly required that low-value, deferred, uncertain, and machine-recommended-no-action candidates remain visible; Data-Extraction may classify and rank but must not suppress distinct valid improvement signals.

The user-reported closeout states in this thread were:

- `cross-agent-raw-corpus-production-v1 = PASS — PRODUCTION_PILOT_CLOSED_READY_FOR_SCALE`
- `cross-agent-raw-corpus-bulk-ingestion-v1 = PASS — BULK_INGESTION_CLOSED_CORPUS_CURRENT`
- parent `cross-agent-raw-corpus-to-intelligence-hub-v1 = BULK_CORPUS_CURRENT / OPERATIONAL`
- `gold-mine-candidate-discovery-and-human-approval-v1 = PASS`
- parent `gold-mine-v1 = GOLD_MINE_OPERATOR_APPROVAL_LOOP_READY`
- Gold Mine operator catalog: 31 distinct candidates from 243 Hub intelligence objects / 86 propositions, with 7 HIGH, 4 MEDIUM, 20 LOW and zero low-value suppression.

**Draft verdict before Git gate:** `DRAFT_READY`  
**Final ChatGPT verdict:** supplied in chat only after remote Git verification.

---

## 2. Harvest tier rationale

**Tier:** T2

Rationale: this conversation contains durable architecture, authority, workflow, approval-boundary, and compounding-system lessons rather than a narrow one-off answer. It also contains operator corrections that materially affect future ChatGPT/agent behavior: every Gold Mine candidate must be surfaced, human approval must bind exact candidate scope, and a ChatGPT harvest closeout must actually pass the Git staging gate before claiming publication.

---

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN_BEFORE_CHATGPT_HARVEST_GIT_GATE
```

No claim is made here that the Intelligence Hub, AI cache, or canonical harvest publication was queried by ChatGPT during this lane.

---

## 4. Thread event inventory

### EVT-001 — Raw-first Cross-Agent intelligence architecture confirmed
- **evidenceClass:** `CHAT_DIRECT` + `USER_REPORTED_OPERATIONAL`
- The operator confirmed the intended sequence: Cross-Agent source reaches durable raw storage first, custody/hash/provenance are verified, then Data-Extraction processes it, then AppBuilder publishes validated intelligence to the Hub.
- Raw data remains retained for future reprocessing.
- Hard boundary discussed: unarchived source must block processing rather than bypass raw custody.
- `goldMineSignalClass: SUCCESS_PATTERN`
- `implementationState: VERIFIED_FIXED` from user-reported production pilot/bulk closeouts
- `novelty: RESOLUTION_EVIDENCE`

### EVT-002 — Bulk historical corpus became current
- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- User reported `PASS — BULK_INGESTION_CLOSED_CORPUS_CURRENT`.
- Reported corpus accounting: 812/812 raw custody verified, 17 chunks complete, 243 unique intelligence, 448 duplicate observations prevented/collapsed, zero logical Hub duplicates, 25/25 stratified retrieval PASS, full-corpus rerun PASS.
- `goldMineSignalClass: PERFORMANCE_SIGNAL`
- `implementationState: VERIFIED_FIXED`
- `novelty: RESOLUTION_EVIDENCE`

### EVT-003 — Gold Mine named as the operator-facing improvement layer
- **evidenceClass:** `CHAT_DIRECT`
- Operator selected the name **Gold Mine** for the improvement candidate inventory and review process.
- Intent: an agent retrieves the Gold Mine, operator and ChatGPT sort through it, then coding begins only for explicitly approved items.
- `goldMineSignalClass: BUSINESS_WORKFLOW_SIGNAL`
- `implementationState: IMPLEMENTED_IN_THREAD` as design/contract, later user-reported as operationally implemented
- `novelty: NEW`

### EVT-004 — Human approval placed at the finish line before coding
- **evidenceClass:** `CHAT_DIRECT`
- Human gate is intentionally late: after discovery, evidence gathering, deduplication, impact/feasibility assessment, but before implementation coding.
- Approval is bound to candidate digest; material scope change invalidates old approval and requires reapproval.
- `goldMineSignalClass: SUCCESS_PATTERN`
- `implementationState: IMPLEMENTED_IN_THREAD`
- `novelty: NEW`

### EVT-005 — Operator forbids value-based suppression
- **evidenceClass:** `CHAT_DIRECT`
- Operator explicitly stated all Gold Mine items must be brought to attention, including high value through deferred/low-value items.
- Data-Extraction may recommend DEFER/NO_ACTION but cannot decide a distinct valid candidate is worthless and hide it.
- `goldMineSignalClass: OPERATOR_FRICTION_SIGNAL`
- `implementationState: IMPLEMENTED_IN_THREAD`
- `novelty: NEW`

### EVT-006 — Gold Mine v1 user-reported PASS
- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- User reported `PASS — GOLD_MINE_OPERATOR_APPROVAL_LOOP_READY`.
- Reported discovery: 243 Hub intelligence objects → 86 propositions → 31 distinct candidates.
- Distribution: HIGH 7, MEDIUM 4, LOW 20; DE recommendations IMPLEMENT 7, INVESTIGATE 4, DEFER 20; `suppressed for low value = 0`.
- Human approval enforcement proofs were reported PASS: human override, missing-approval block, digest scope drift block.
- `goldMineSignalClass: ADOPTION_SIGNAL`
- `implementationState: VERIFIED_FIXED`
- `novelty: RESOLUTION_EVIDENCE`

### EVT-007 — Cross-chat retrieval friction exposed
- **evidenceClass:** `CHAT_DIRECT`
- Current chat could not retrieve the full generated Gold Mine operator artifact through the attempted connected intelligence path, so a cross-chat handoff Markdown file was created for a chat with working `@CG Platform Intelligence` access.
- The local handoff file was not pushed to Git because it was not itself the harvest artifact and did not include a publication instruction.
- `goldMineSignalClass: AGENT_FRICTION_SIGNAL`
- `implementationState: PARTIAL`
- `novelty: NEW`

### EVT-008 — Operator corrected Git-publication expectations
- **evidenceClass:** `CHAT_DIRECT`
- Operator challenged the earlier lack of Git push and then explicitly instructed ChatGPT to run the attached closeout protocol.
- Attached v2.1 protocol establishes mandatory `chat-gpt-harvest` Git publication for DRAFT_FILE closeout.
- `goldMineSignalClass: OPERATOR_FRICTION_SIGNAL`
- `implementationState: IMPLEMENTED_IN_THREAD`
- `novelty: RECURRENCE`

---

## 5. Harvest packets

### HP-001 — Architecture lesson: raw-before-parse durable learning spine
```yaml
packetId: HP-001
kind: architecture-lesson
goldMineSignalClass: SUCCESS_PATTERN
implementationState: VERIFIED_FIXED
novelty: RESOLUTION_EVIDENCE
statement: Cross-Agent knowledge should be copied to durable raw custody and verified before Data-Extraction parses or normalizes it; downstream intelligence can then be reprocessed later without losing the original source.
evidenceRefs:
  - EVT-001
  - EVT-002
futureAgentInstructions:
  whenThisAppears: A new source is entering Data-Extraction from Cross-Agent.
  startAt: Verify canonical raw custody and content hash.
  doNot: Parse directly from the mutable Cross-Agent worktree when raw custody is required.
  proveBeforeClaiming: Raw object identity, hash, capture receipt, and retained source.
```

### HP-002 — Product/operations pattern: Gold Mine complete visibility
```yaml
packetId: HP-002
kind: protocol-upgrade
goldMineSignalClass: BUSINESS_WORKFLOW_SIGNAL
implementationState: VERIFIED_FIXED
novelty: NEW
statement: Improvement discovery may rank and recommend, but every distinct valid candidate must remain operator-visible regardless of LOW value, DEFER, or NO_ACTION recommendation.
evidenceRefs:
  - EVT-005
  - EVT-006
futureAgentInstructions:
  whenThisAppears: An improvement discovery/ranking system prepares an operator queue.
  startAt: Reconcile discovered propositions, merged true duplicates, invalid/non-candidates, and visible operator candidates.
  doNot: Suppress a distinct valid candidate because machine-estimated value is low.
  proveBeforeClaiming: no-value-suppression accounting equals zero suppressed valid candidates.
```

### HP-003 — Human approval boundary
```yaml
packetId: HP-003
kind: validation-rule
goldMineSignalClass: SUCCESS_PATTERN
implementationState: VERIFIED_FIXED
novelty: NEW
statement: Gold Mine candidate analysis may reach feasibility-tested readiness, but implementation preparation must hard-stop until a human decision APPROVE matches the current candidate digest.
evidenceRefs:
  - EVT-004
  - EVT-006
futureAgentInstructions:
  whenThisAppears: A Gold Mine candidate is about to become an implementation work package.
  startAt: Resolve candidateDigest and latest human-decision receipt.
  doNot: Treat DE recommendation IMPLEMENT as authorization.
  proveBeforeClaiming: matching approval digest and no scope drift.
```

### HP-004 — Cross-chat capability handoff
```yaml
packetId: HP-004
kind: faster-path
goldMineSignalClass: AGENT_FRICTION_SIGNAL
implementationState: PARTIAL
novelty: NEW
situation: Current chat lacks the connected retrieval capability needed to fetch the detailed Gold Mine operator artifact.
rightFirstMove: Create a compact handoff packet that carries milestone identity, manifest digest, source snapshot, retrieval command, authority, and review rules into a chat with the required connector.
requiredGuard: The receiving chat must live-verify current manifest authority rather than trust stale handoff details.
evidenceRefs:
  - EVT-007
```

### HP-005 — Git staging is part of ChatGPT harvest closeout
```yaml
packetId: HP-005
kind: protocol-upgrade
goldMineSignalClass: OPERATOR_FRICTION_SIGNAL
implementationState: IMPLEMENTED_IN_THREAD
novelty: RECURRENCE
statement: Under ChatGPT harvest protocol v2.1 DRAFT_FILE mode, producing the findings artifact is insufficient; ChatGPT must publish that one designated file to chat-gpt-harvest and verify the remote commit before claiming CHATGPT_SOURCE_PUBLISHED.
evidenceRefs:
  - EVT-008
  - attached protocol CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1 v2.1
futureAgentInstructions:
  whenThisAppears: User says run the closeout/autopsy harvest file.
  startAt: Declare DRAFT_FILE, write only the designated findings file, then run the Git gate.
  doNot: Stop at a local download link or claim published evidence without remote SHA verification.
  proveBeforeClaiming: artifact path, branch chat-gpt-harvest, commit SHA, remote branch comparison.
```

---

## 6. Execution deltas

### ED-001 — Improvement pipeline moved from knowledge storage to system-improvement discovery
- **actual:** Thread initially focused on raw storage → DE → Hub and then recognized the need for extracted intelligence to produce testable improvement candidates.
- **optimal/future:** Treat Gold Mine as a first-class downstream stage after validated Hub intelligence, with complete candidate visibility and a human approval boundary.
- `goldMineSignalClass: SUCCESS_PATTERN`
- `novelty: NEW`

### ED-002 — Human gate placement clarified
- **actual:** The operator asked how to add human approval; architecture was refined so human approval occurs immediately before coding rather than earlier in extraction/discovery.
- **optimal/future:** Let automation do evidence collection, dedup, impact analysis, and safe feasibility checks first; make operator attention the final authorization step.
- `goldMineSignalClass: BUSINESS_WORKFLOW_SIGNAL`
- `novelty: NEW`

### ED-003 — Cross-chat handoff was initially local-only
- **actual:** A Gold Mine handoff Markdown file was created locally for another chat; no Git publication was performed.
- **optimal/future:** Distinguish normal handoff artifacts from protocol-governed harvest artifacts. When the operator invokes harvest v2.1 DRAFT_FILE, always complete the mandatory Git staging gate.
- `goldMineSignalClass: OPERATOR_FRICTION_SIGNAL`
- `novelty: RECURRENCE`

---

## 7. Observed improvement outcomes

### OUT-001 — Historical Cross-Agent corpus became operational intelligence
```yaml
outcomeId: OUT-001
beforeState: Pilot-only validated path with bulk historical corpus not yet fully accounted for.
afterState: User-reported bulk corpus current with 812/812 eligible sources terminally accounted for and zero logical Hub duplicates.
measurableChange:
  eligibleSources: 812
  rawCustodyVerified: 812
  uniqueIntelligence: 243
  duplicateObservationsPrevented: 448
  hubLogicalDuplicates: 0
  retrievalSamplesPass: 25/25
proof: User-pasted bulk-ingestion closeout and composite verify PASS.
remainingResidual: Steady-state incremental ingestion was recommended but intentionally deferred while Gold Mine review became the active priority.
improvementProven: true
```

### OUT-002 — Gold Mine operator approval loop became ready
```yaml
outcomeId: OUT-002
beforeState: Intelligence Hub contained validated intelligence but there was no named complete operator-facing improvement inventory in the thread.
afterState: User-reported Gold Mine v1 PASS with 31 distinct candidates and human approval enforcement.
measurableChange:
  hubIntelligenceEvaluated: 243
  propositions: 86
  candidates: 31
  high: 7
  medium: 4
  low: 20
  suppressedForLowValue: 0
proof: User-pasted Gold Mine v1 closeout; missing approval and scope drift blocks reported PASS.
remainingResidual: Operator review of all 31 candidates has not yet been completed in this thread.
improvementProven: true
```

### OUT-003 — Harvest closeout corrected to include mandatory Git publication
```yaml
outcomeId: OUT-003
beforeState: A prior cross-chat handoff artifact was created locally and not pushed; operator questioned whether push instructions had been followed.
afterState: Operator invoked the attached v2.1 protocol, which explicitly requires DRAFT_FILE publication to chat-gpt-harvest and remote SHA verification.
measurableChange: Current harvest execution now includes the Git gate rather than ending at local artifact creation.
proof: Operator instruction "run file" plus attached v2.1 protocol.
remainingResidual: Cursor ingest/validation and canonical main/Z/L publication remain outside ChatGPT scope.
improvementProven: true
```

---

## 8. Waste ledger

### TW-001 — Repeated clarification of whether ChatGPT should push protocol-governed artifacts
- The thread spent additional turns establishing whether a file should have been pushed.
- Root cause: previous local handoff and harvest-protocol publication semantics were conflated.
- Prevention: when a user invokes a protocol file, explicitly read its execution mode and publication gate before producing the artifact.
- `goldMineSignalClass: AGENT_FRICTION_SIGNAL`
- `novelty: RECURRENCE`

### TW-002 — Attempted Gold Mine retrieval through an unavailable/stale surface
- The current chat could not retrieve the generated operator artifact through the attempted platform-intelligence path, causing a handoff detour.
- Prevention: registry pointer + canonical retrieval command should be the durable fallback; receiving chat must live-verify manifest currentness.
- `goldMineSignalClass: OBSERVABILITY_GAP`
- `novelty: NEW`

---

## 9. Duplication detector

### DUP-001 — Gold Mine ordinals are presentation, not durable identity
- The thread commonly referenced `GOLD-0001`...`GOLD-0031` for review convenience.
- Protocol v2.1 requires digest-aware identity; downstream durable references should preserve `candidateDigest` / content-derived identity rather than ordinal alone.
- **Disposition:** `NEEDS_REGISTRY_LOOKUP_FIRST` for any future merge/approval operation where only the ordinal is available.

### DUP-002 — Machine recommendation and human decision are separate concepts
- Multiple turns reiterated that DE recommendation is advisory and human decision is authoritative.
- **Disposition:** not a duplicate candidate; treat repeated discussion as reinforcement/adoption evidence for the same approval-boundary rule.

---

## 10. Operator friction

### OF-001 — Operator does not want hidden low-value candidates
```yaml
operatorFrictionId: OF-001
problem: Automated ranking could hide seemingly low-value or deferred opportunities before operator review.
operatorRequirement: Surface all distinct valid candidates; machine may rank but not suppress.
goldMineSignalClass: OPERATOR_FRICTION_SIGNAL
implementationState: VERIFIED_FIXED
novelty: NEW
```

### OF-002 — Operator expects protocol instructions to be executed, including Git publication
```yaml
operatorFrictionId: OF-002
problem: A local file response is insufficient when the governing protocol requires a Git staging push.
operatorRequirement: Follow the file's execution contract, not an inferred lightweight interpretation.
goldMineSignalClass: OPERATOR_FRICTION_SIGNAL
implementationState: IMPLEMENTED_IN_THREAD
novelty: RECURRENCE
```

---

## 11. Observability gaps

### OG-001 — Current Gold Mine detailed catalog was not directly retrievable in this chat
```yaml
observabilityGapId: OG-001
whatWeNeededToKnow: Full problem/proposal/evidence details for all 31 current Gold Mine candidates.
whyItWasNotObservable: The current chat did not have a working connected retrieval path to the generated operator artifact during the attempted review.
workflow: Gold Mine operator review
missingMetricOrReceipt: Current full operator manifest payload with candidateDigest and evidence details.
recommendedInstrumentation: Make the Gold Mine operator manifest directly retrievable through the registered platform-intelligence surface and include current manifestDigest/sourceHubSnapshot in the result.
goldMineSignalClass: OBSERVABILITY_GAP
```

### OG-002 — Gold Mine outcome value is not yet measurable
```yaml
observabilityGapId: OG-002
whatWeNeededToKnow: Which machine-ranked candidates ultimately create the most operator/platform/business value after implementation.
whyItWasNotObservable: No Gold Mine candidate had been implemented yet in the thread.
workflow: Gold Mine compounding loop
missingMetricOrReceipt: Candidate approval → implementation → verified outcome linkage and before/after value receipt.
recommendedInstrumentation: Preserve candidateDigest through implementation and feed verified outcome receipts back into Cross-Agent/DE/Hub so future ranking can be calibrated against actual results.
goldMineSignalClass: OBSERVABILITY_GAP
```

---

## 12. Success patterns

### SUCCESS-001 — Raw-first immutability enables safe reprocessing
- Raw custody before extraction lets newer DE processing identities re-evaluate the same original source while retaining history.
- `goldMineSignalClass: SUCCESS_PATTERN`

### SUCCESS-002 — Global dedup plus complete visibility
- The reported bulk pipeline collapsed repeated intelligence observations without deleting provenance, and Gold Mine similarly correlates duplicate propositions while retaining all distinct candidates.
- `goldMineSignalClass: SUCCESS_PATTERN`

### SUCCESS-003 — Late human gate minimizes operator burden without surrendering control
- Machines perform discovery/evidence/feasibility work first; operator decides only at the implementation boundary.
- `goldMineSignalClass: SUCCESS_PATTERN`

### SUCCESS-004 — Digest-bound approval prevents scope laundering
- Human approval applies to exact candidate scope; material change requires reapproval.
- `goldMineSignalClass: SUCCESS_PATTERN`

---

## 13. ROI backlog

### ROI-001 — Complete Gold Mine review and establish first approved implementation cohort
- **rank:** 1
- **improvementType:** `business_workflow`
- **operatorValue:** HIGH
- **businessValue:** UNKNOWN from current evidence
- **platformValue:** HIGH
- **agentValue:** HIGH
- **reliabilityValue:** MEDIUM
- **automationLeverage:** HIGH
- **estimatedComplexity:** MEDIUM
- **blastRadius:** MEDIUM
- **confidence:** HIGH that review is the next required human action
- **evidenceDiversity:** Hub-derived candidate catalog + user design requirement + Gold Mine v1 closeout
- **rootCauseLeverage:** HIGH
- **goldMineSignalClass:** BUSINESS_WORKFLOW_SIGNAL
- **novelty:** NEW
- **proposal:** Retrieve the full current 31-candidate Gold Mine catalog, review every item, preserve low/deferred items, and record human decisions before any implementation prompt.
- **optimalFutureWorkflow:**
  1. Retrieve current manifest with digest and source snapshot.
  2. Show all candidates with problem, proposal, evidence, affected repos, feasibility, value, and risk.
  3. Operator + ChatGPT decide APPROVE / DEFER / REJECT / REQUEST_MORE_EVIDENCE.
  4. Persist digest-bound decision receipts.
  5. Only approved candidates enter SDLC preparation.

### ROI-002 — Close the Gold Mine implementation-outcome feedback loop
- **rank:** 2
- **improvementType:** `platform_compounding`
- **operatorValue:** HIGH
- **businessValue:** UNKNOWN
- **platformValue:** HIGH
- **agentValue:** HIGH
- **reliabilityValue:** HIGH
- **automationLeverage:** HIGH
- **estimatedComplexity:** HIGH
- **blastRadius:** MEDIUM
- **confidence:** MEDIUM-HIGH
- **evidenceDiversity:** Gold Mine architecture discussion + protocol v2.1 compounding requirements
- **rootCauseLeverage:** HIGH
- **goldMineSignalClass:** PERFORMANCE_SIGNAL
- **novelty:** NEW
- **proposal:** After the first approved improvements are implemented, bind candidateDigest → implementation work package → test/deploy receipt → verified outcome, then feed the result back through Cross-Agent/raw/DE/Hub.
- **optimalFutureWorkflow:**
  1. Preserve candidate digest into SDLC prepare.
  2. Capture before-state metrics.
  3. Implement only approved scope.
  4. Capture after-state and regression evidence.
  5. Publish implementation outcome as resolution/adoption evidence.
  6. Re-score future Gold Mine recommendations using observed outcomes.

### ROI-003 — Make Gold Mine retrieval a first-class connected tool surface
- **rank:** 3
- **improvementType:** `observability_and_operator_experience`
- **operatorValue:** HIGH
- **businessValue:** LOW/UNKNOWN
- **platformValue:** MEDIUM
- **agentValue:** HIGH
- **reliabilityValue:** MEDIUM
- **automationLeverage:** HIGH
- **estimatedComplexity:** MEDIUM
- **blastRadius:** LOW
- **confidence:** HIGH
- **evidenceDiversity:** direct retrieval failure + registry pointer + command fallback
- **rootCauseLeverage:** MEDIUM
- **goldMineSignalClass:** OBSERVABILITY_GAP
- **novelty:** NEW
- **proposal:** Expose current Gold Mine manifest retrieval through the platform-intelligence connector with currentness, candidate digest, and evidence drilldown.
- **optimalFutureWorkflow:**
  1. Call a single Gold Mine retrieval tool.
  2. Receive manifestDigest/sourceHubSnapshot/currentness.
  3. Fetch candidate details by stable digest/ID.
  4. Record human decisions through a governed write path.
  5. Avoid cross-chat/manual artifact handoff for normal review.

### ROI-004 — Enforce protocol execution mode before artifact creation
- **rank:** 4
- **improvementType:** `agent_protocol_reliability`
- **operatorValue:** MEDIUM
- **platformValue:** MEDIUM
- **agentValue:** HIGH
- **reliabilityValue:** HIGH
- **automationLeverage:** MEDIUM
- **estimatedComplexity:** LOW
- **blastRadius:** LOW
- **confidence:** HIGH
- **evidenceDiversity:** operator correction + attached v2.1 protocol
- **rootCauseLeverage:** MEDIUM
- **goldMineSignalClass:** AGENT_FRICTION_SIGNAL
- **novelty:** RECURRENCE
- **proposal:** When the user says run an attached protocol file, parse its mode/write/publication rules first and treat those as the source authority over conversational habit.

---

## 14. Product-workflow coverage

| Domain | Coverage | Evidence in thread |
|---|---|---|
| Computer Estimator | NOT_OBSERVED | No direct CE functionality work in this thread |
| Human Estimator | NOT_OBSERVED | No direct HE functionality work |
| Document Center | NOT_OBSERVED | No direct DC implementation work |
| plan-set processing | NOT_OBSERVED | No plan-set extraction implementation |
| OCR/parser | NOT_OBSERVED | No OCR/parser feature work |
| Revu/Bluebeam | NOT_OBSERVED | Explicitly not part of this Gold Mine work |
| Bid Composer | NOT_OBSERVED | No BC feature implementation |
| proposals | NOT_OBSERVED | No proposal feature implementation |
| VAE | NOT_OBSERVED | No VAE work |
| Scraper | NOT_OBSERVED | No Scraper work |
| cross-app handoffs | OBSERVED | Cross-Agent → raw → DE → AppBuilder → Hub → Gold Mine |
| operator re-entry | OBSERVED | Human Gold Mine approval/review is intentional final gate |
| manual intervention | OBSERVED | Operator reviews all candidates; cross-chat handoff was required when connected retrieval was unavailable |

---

## 15. Corpus bias note

`corpusBiasNote: Thread evidence is heavily SDLC/governance/intelligence-pipeline/operator-approval oriented; product-specific application workflows are under-observed.`

`underObservedDomains: [Computer Estimator, Human Estimator, Document Center, plan-set processing, OCR/parser, Revu/Bluebeam, Bid Composer, proposals, VAE, Scraper]`

A zero review queue in DE Phase G or a complete Gold Mine catalog must not be interpreted as estate-wide product optimization because many product domains were not directly observed in this thread.

---

## 16. Do-not-advance guards

1. Do not implement a Gold Mine candidate without an explicit human APPROVE decision bound to the current candidate digest.
2. Do not treat DE recommendation `IMPLEMENT` as human authorization.
3. Do not suppress LOW, DEFER, NO_ACTION, blocked, or uncertain distinct valid candidates from operator review.
4. Do not use `GOLD-####` ordinal alone as durable identity for approval/implementation; preserve digest identity.
5. Do not let a materially changed candidate reuse an approval for an older digest.
6. Do not bypass raw custody when reprocessing Cross-Agent intelligence.
7. Do not claim this ChatGPT harvest is `HARVEST_COMPLETE`, `OPERATIONAL`, `INDEX_HIT`, or `FULLY_SEEDED`.
8. Do not merge this ChatGPT draft to `main`; Cursor owns ingest/validation/canonical promotion.
9. Do not hand off a DRAFT_FILE harvest as published evidence unless the `CHATGPT_HARVEST_GIT_GATE` passes.
10. Do not infer product-wide optimization from an SDLC/governance-heavy corpus.

---

## 17. Seed packet candidates

### Seed candidate 1
```json
{
  "seedId": "IH-THREAD-GOLD-MINE-NO-VALUE-SUPPRESSION-V1",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "goldMineSignalClass": "BUSINESS_WORKFLOW_SIGNAL",
  "novelty": "NEW",
  "summary": "Improvement discovery may score and recommend disposition, but every distinct valid candidate must remain operator-visible regardless of machine-estimated value.",
  "retrievalQuestions": [
    "Should low-value Gold Mine candidates be hidden from the operator?",
    "What is the no-value-suppression rule for improvement discovery?"
  ],
  "evidenceRefs": ["EVT-005", "EVT-006", "HP-002"],
  "futureAgentInstructions": {
    "whenThisAppears": "An automated improvement miner prepares an operator-facing candidate set.",
    "startAt": "Reconcile all discovered candidate propositions against visible candidates and true duplicates.",
    "doNot": "Suppress distinct valid candidates because they are low value, deferred, or recommended no-action.",
    "proveBeforeClaiming": "Suppressed-for-value count is zero and true duplicate evidence is retained."
  }
}
```

### Seed candidate 2
```json
{
  "seedId": "IH-THREAD-DIGEST-BOUND-HUMAN-APPROVAL-V1",
  "kind": "validation-rule",
  "status": "CANDIDATE",
  "goldMineSignalClass": "SUCCESS_PATTERN",
  "novelty": "NEW",
  "summary": "Implementation authorization for machine-discovered improvements must require a human APPROVE receipt bound to the exact candidate digest; material scope drift invalidates prior approval.",
  "retrievalQuestions": [
    "How should human approval be bound to a Gold Mine candidate?",
    "What happens when an approved improvement candidate changes scope?"
  ],
  "evidenceRefs": ["EVT-004", "EVT-006", "HP-003"],
  "futureAgentInstructions": {
    "whenThisAppears": "A Gold Mine candidate is entering implementation preparation.",
    "startAt": "Load current candidate digest and latest human decision receipt.",
    "doNot": "Authorize code from DE recommendation or stale approval.",
    "proveBeforeClaiming": "Approval digest matches current candidate digest and approved scope."
  }
}
```

### Seed candidate 3
```json
{
  "seedId": "IH-THREAD-GOLD-MINE-OUTCOME-COMPOUNDING-V1",
  "kind": "architecture-lesson",
  "status": "CANDIDATE",
  "goldMineSignalClass": "PERFORMANCE_SIGNAL",
  "novelty": "NEW",
  "summary": "Gold Mine compounding should preserve candidate identity through implementation and feed verified before/after outcomes back through Cross-Agent, raw custody, Data-Extraction, and the Hub so future ranking learns from real results.",
  "retrievalQuestions": [
    "How should Gold Mine learn whether an approved improvement actually worked?",
    "How should an implemented Gold Mine candidate feed evidence back into future discovery?"
  ],
  "evidenceRefs": ["ROI-002", "OG-002", "SUCCESS-003", "SUCCESS-004"],
  "futureAgentInstructions": {
    "whenThisAppears": "An approved Gold Mine candidate has been implemented and verified.",
    "startAt": "Record candidateDigest, before state, implementation receipt, after state, and residual risk.",
    "doNot": "Treat implementation as proof of improvement without measurable verification.",
    "proveBeforeClaiming": "Outcome receipt shows before/after/proof and returns as resolution/adoption evidence."
  }
}
```

---

## 18. Future-agent instructions

1. Before working on Gold Mine implementations, retrieve the **current** Gold Mine manifest and verify `manifestDigest` / source snapshot.
2. Show the operator the complete catalog, not only high-priority machine recommendations.
3. Use ordinal IDs only for display; preserve candidate digest for durable decisions.
4. Keep `deRecommendation` separate from `humanDecision`.
5. When the operator approves a candidate, bind approval to exact digest and constraints.
6. If scope changes, require reapproval before implementation preparation.
7. Preserve evidence provenance to Hub intelligence, DE evidence, raw object, and Cross-Agent source.
8. After implementation, capture measurable before/after outcomes and feed them back into the intelligence pipeline.
9. If connected retrieval is unavailable, use a verified manifest handoff rather than guessing candidate details.
10. When invoking this ChatGPT harvest protocol, complete the Git staging gate before claiming source publication.

---

## 19. Publication truth table

| Layer | State at artifact construction |
|---|---|
| Git draft (`chat-gpt-harvest`) | pending current ChatGPT Git gate |
| `CHATGPT_HARVEST_GIT_GATE` | pending current ChatGPT Git gate |
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

The final Git commit/remote SHA receipt is emitted in the ChatGPT closeout after this artifact is committed and pushed. It is intentionally not self-embedded because adding the final commit SHA to the committed file would mutate that same SHA.

---

## 20. gitPublicationReceipt

`PENDING_CHAT_CLOSEOUT_AFTER_REMOTE_SHA_VERIFICATION`

The authoritative receipt for this ChatGPT lane is emitted in chat after the `chat-gpt-harvest` remote branch is verified to resolve to the created commit.

---

## 21. Cursor handoff command

After ChatGPT reports `CHATGPT_SOURCE_PUBLISHED`, Cursor may ingest this draft source according to the attached protocol:

```bash
git fetch origin chat-gpt-harvest && git checkout chat-gpt-harvest && git pull --ff-only origin chat-gpt-harvest

npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-07-gold-mine-human-approval-loop-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-07-gold-mine-human-approval-loop-v1

npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-07-gold-mine-human-approval-loop-v1
npm run harvest:sync-derived -- harvest-2026-08-07-gold-mine-human-approval-loop-v1
npm run harvest:validate -- harvest-2026-08-07-gold-mine-human-approval-loop-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-07-gold-mine-human-approval-loop-v1
npm run test:harvest
```

Operator publication remains separate:

```bash
npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-07-gold-mine-human-approval-loop-v1
```

ChatGPT does not claim those Cursor/operator steps ran.
