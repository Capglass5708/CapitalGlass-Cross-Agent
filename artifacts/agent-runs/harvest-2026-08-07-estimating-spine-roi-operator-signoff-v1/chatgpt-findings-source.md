# ChatGPT Findings Source — harvest-2026-08-07-estimating-spine-roi-operator-signoff-v1

## 1. Final summary + verdict

**Mission:** `chat-thread-closeout-autopsy-harvest-chatgpt-v1`  
**Lane:** `CHAT_CONTEXT_ONLY`  
**Protocol:** v2  
**Harvest ID:** `harvest-2026-08-07-estimating-spine-roi-operator-signoff-v1`  
**Target tier:** T2  
**Source scope:** visible conversation + attached protocol only  
**Draft verdict before Git gate:** `DRAFT_READY`

This thread records a completed transition from an estimating-spine integration program into an estimator-productivity product, followed by a deliberately narrow operator-signoff freeze. The durable value is not only the technical result; it is the sequencing discipline: first canonicalize the spine, then build the operator cockpit, then prove runtime/open-path/idempotency, then stop development and require human visual evidence before the first real commercial disposition.

At the end of the visible thread:

- `estimating-spine-roi-convergence-and-operator-value-v1` is locked as `ESTIMATING_SPINE_ROI_CONVERGENCE_VERIFIED`.
- Bid Composer is the operator cockpit; Master Graph is derived context, not authority.
- W22 remains `PENDING_REVIEW` with no human disposition executed.
- `estimating-spine-operator-pilot-signoff-v1` is frozen at `PENDING_OPERATOR_WALKTHROUGH`.
- No further dev/architecture/integration/disposition/pricing/proposal work is valid inside the signoff milestone until operator evidence exists.
- The next major program after signoff is `estimating-spine-estimator-productivity-and-learning-v1`.

## 2. Harvest tier rationale

**Tier: T2.**

Rationale: the thread contains durable cross-repo operating lessons, milestone transition rules, authority boundaries, runtime proof patterns, operator-gate design, and a reusable anti-scope-creep pattern. It is more than a one-off task result, but it does not require a full estate-wide T3 reconstruction because the important lessons are bounded and already summarized in the thread.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

No `INDEX_HIT`, `INDEX_HIT_AI_CACHE`, hub publication, Z/L publication, or `HARVEST_COMPLETE` claim is made by ChatGPT in this artifact.

## 4. Thread event inventory

### EVT-001 — Prior technical spine becomes canonical
The six-repo estimating spine was reported merged in dependency order across Governance, Data-Extraction, Computer Estimator, Revu, Bid Composer, and CG Master Graph. This converted the prior technical-integration proof into canonical branch authority.

### EVT-002 — ROI convergence wave built operator/product surfaces
Bid Composer gained operator, intelligence, readiness, learning, and operations layers, including Evidence 360, Guided Review v2, Revu visual context, lineage, health, exception inbox, conflict/freshness/reconciliation utilities, pricing/readiness utilities, replay, health, and ROI telemetry.

### EVT-003 — Rosewood open-path blocker was diagnosed as a projection gap
`active_storage_provider = null` was reported not to mean the binary was missing. The effective provider was derived from `document_storage_locations`, with Synology primary active and SharePoint mirror failed/deferred. The canonical binary digest matched and A.520.1/page 59 resolved through the Documents resolver contract.

### EVT-004 — Runtime convergence reached production-like proof
Bid Composer PR #58 and Master Graph PR #5 were reported merged. Bid Composer runtime SHA was bound to deployed SHA `65eda0f`; replay passed twice and was idempotent; production health passed including `OPEN_PATH: PASS`; revision-impact BFF passed.

### EVT-005 — Commercial authority boundaries remained intact
The thread repeatedly preserved: no autonomous disposition, no autonomous pricing approval, no autonomous proposal issue; Human Estimator recommends only; Master Graph remains derived/non-authoritative; Revu production mutation remains locked.

### EVT-006 — W22 intentionally remained pending
The correct end state after technical convergence was W22 `PENDING_REVIEW`, with no human disposition fabricated or executed.

### EVT-007 — Operator visual proof was separated from technical proof
Authenticated production visual walkthrough could not be automated. The thread explicitly retained `OPERATOR_ONLY_VISUAL_PROOF_REQUIRED` instead of fabricating PASS.

### EVT-008 — Technical milestone was closed before human signoff milestone
The ROI convergence milestone was locked as `ESTIMATING_SPINE_ROI_CONVERGENCE_VERIFIED`, while the separate small milestone `estimating-spine-operator-pilot-signoff-v1` was created for human visual validation only.

### EVT-009 — Operator signoff packet was scaffolded and frozen
A 16-check packet was created with screenshot paths, receipt schema, PASS/WARN/FAIL/NOT_APPLICABLE states, commercial-safety fields, and a validator that intentionally exits nonzero until checks are filled.

### EVT-010 — Explicit freeze prevents hidden development wave
The thread ended with the signoff milestone frozen at `PENDING_OPERATOR_WALKTHROUGH`; only checklist completion, screenshots, defect capture, operator comments, and validation are allowed until evidence exists.

### EVT-011 — Product boundary changed
The visible conclusion was that the spine is no longer primarily an integration program; it is an estimator-productivity product. Future optimization should target throughput and decision quality rather than infrastructure correctness.

## 5. Harvest packets

### HP-001 — kind: lesson
**Title:** Separate technical convergence from operator visual signoff.

A technically complete release can be truthfully closed while authenticated visual proof remains operator-owned, provided the visual gate is explicit and non-fabricated. This avoids holding a technical milestone open for a human-only action while also preventing false end-to-end UI claims.

**Future use:** create a separate controlled signoff milestone when automation cannot authenticate or when commercial actions must remain human-only.

### HP-002 — kind: lesson
**Title:** Preserve pending commercial state as a valid success state.

The thread repeatedly treated `PENDING_REVIEW` as a correct outcome. A production pilot does not need an Include/Exclude/Pricing/Proposal action merely to demonstrate completion. Human commercial action must occur because the operator intends it, not because the test wants a green status.

### HP-003 — kind: authority-decision
**Title:** Bid Composer cockpit / Master Graph derived context boundary.

Observed operating model:

- Bid Composer = operator UI + human commercial authority.
- Documents = canonical identity/open-path authority.
- Data-Extraction = parser evidence.
- Computer Estimator = neutral technical candidates.
- Revu = Bluebeam evidence/provenance.
- Human Estimator = recommendation.
- Master Graph = derived/rebuildable/non-authoritative lineage/impact context.
- Governance = constitutional contract/schema authority.

### HP-004 — kind: failure-pattern
**Title:** Nullable projection field can masquerade as missing source authority.

Rosewood `active_storage_provider = null` initially blocked the canonical open-path proof. Diagnosis found a projection gap while canonical storage-location rows still identified an active Synology primary. General lesson: when a projection/cache field is null, inspect canonical owner records and resolver semantics before assuming the underlying asset is missing or patching a consumer around the gap.

### HP-005 — kind: lesson
**Title:** Operator cockpit should unify evidence instead of forcing cross-app navigation.

Evidence 360, live lineage, Revu context, health, exceptions, pricing/readiness, and revision impact were intentionally surfaced in Scope Review. The product value is consolidation around the operator decision, not merely existence of cross-repo APIs.

### HP-006 — kind: lesson
**Title:** Canonical release order before feature accumulation reduces drift.

The thread chose to merge the proven six-repo dependency stack before continuing broad Bands B-F work. This reduced the risk of building more product work on noncanonical feature branches and created a stable baseline for later UI/runtime proof.

### HP-007 — kind: lesson
**Title:** Re-run replay/health after canonical merge and runtime binding.

Unit/library gate PASS was not treated as final proof. The wave required post-merge replay, runtime SHA match, idempotency, and production health before convergence was considered verified.

### HP-008 — kind: protocol-upgrade
**Title:** Human signoff milestones should be non-development by contract.

Once the signoff packet exists, its scope should explicitly prohibit architecture, features, integrations, disposition, pricing approval, and proposal issue. UX defects are logged for the next milestone instead of being fixed opportunistically during signoff.

### HP-009 — kind: lesson
**Title:** Validator should fail until human evidence is complete.

`estimating-spine:operator-pilot:signoff:validate` was designed to exit nonzero while checks remain unset. This is stronger than a passive checklist because incomplete human evidence cannot accidentally look closed.

### HP-010 — kind: advancement
**Title:** Shift success metrics from integration correctness to estimator performance.

After convergence, the proposed next program focuses on review items/hour, time per item, exception rate, HE recommendation acceptance, revision rework, pricing mismatch, proposal blockers, and override-learning quality. This marks a product maturity transition from plumbing to measurable operator productivity.

## 6. Execution deltas

### ED-001
From `ESTIMATING_SPINE_TECHNICAL_INTEGRATION_PASS` to a canonical six-repo spine merged on main branches.

### ED-002
From backend/library capability to live Bid Composer Scope Review cockpit wiring.

### ED-003
From Rosewood `OPEN_PATH: BLOCKED` to canonical binary open-path PASS with digest verification.

### ED-004
From local/branch Master Graph impact capability to merged impact API and live Bid Composer revision-impact BFF.

### ED-005
From library-level replay/health stubs to post-release replay x2, idempotency PASS, and production health PASS.

### ED-006
From technical operator pilot to explicit human-only visual signoff packet with 16 checks and evidence receipt.

### ED-007
From active development milestone to frozen human-validation milestone.

## 7. Waste ledger

### TW-001 — Repeated lock acknowledgements after freeze
The end of the thread contains multiple nearly identical confirmations that the signoff milestone is frozen. This repetition added little new state after the freeze was already explicit.

**Reduction:** once the frozen-state receipt is established, subsequent acknowledgements should collapse to one-line state preservation unless new evidence arrives.

### TW-002 — Large prompt expansion after convergence
Several long prompts restated already-proven architecture and authority boundaries during later closeout waves.

**Reduction:** after a verified closeout receipt, continuation prompts should reference the receipt and enumerate only delta gates, hard stops, and required return fields.

## 8. Duplication detector

### DUP-001
The thread reasserted the same frozen signoff state several times:

- `PENDING_OPERATOR_WALKTHROUGH`
- no development work
- 16 checks + screenshots
- validator PASS/PASS_WITH_WARN closes gate
- next milestone becomes productivity/learning

**Classification:** benign conversational duplication, not conflicting state.

**Action:** future agents should treat the first complete frozen-state receipt as canonical for the thread and avoid re-litigating the same boundary.

## 9. Operator friction

### OF-001 — Authenticated visual proof is not automation-friendly
The technical system reached a point where only a human-authenticated walkthrough remained. This creates a natural boundary where agents should stop instead of trying to simulate or infer visual success.

### OF-002 — Signoff evidence requires manual screenshot/receipt work
The operator must capture major panels, record 16 results, add comments/defects, and run a validator. This is acceptable for high-trust signoff but is a measurable source of friction.

### OF-003 — First real disposition intentionally delayed
The system is ready technically, but commercial action is held until visual signoff. This is correct for safety, yet the handoff should make the operator path fast and obvious so the signoff does not become stale.

## 10. ROI backlog (ranked)

1. Complete operator visual walkthrough for Rosewood W22 and close `ESTIMATING_SPINE_OPERATOR_PILOT_SIGNOFF_PASS`.
2. Capture baseline review time per item and review items/hour before adding more features.
3. Track exception counts and time-to-resolution by exception type.
4. Measure HE recommendation acceptance/override rate and collect human override reasons.
5. Measure revision-triggered re-review and stale-evidence rework.
6. Measure scope/pricing quantity mismatch rate.
7. Measure proposal blocker count and time-to-clear.
8. Rank cockpit UX defects by operator time lost, not visual preference.
9. Improve exception prioritization around the highest-cost blockers.
10. Add learning only from provenance-rich human outcomes; keep `autoRuleMutation=false` until separately governed.

## 11. Do-not-advance guards

- Do not claim operator visual PASS without authenticated operator evidence.
- Do not change signoff milestone scope to include architecture or new features.
- Do not execute a commercial disposition merely to make a pilot green.
- Do not approve pricing or issue proposal automatically.
- Do not make Master Graph authoritative or allow graph-to-source mutation.
- Do not bypass Documents canonical resolver with Bid Composer storage assumptions.
- Do not interpret null projection/cache fields as missing canonical source without owner-side diagnosis.
- Do not start the productivity milestone until signoff is PASS/PASS_WITH_WARN, unless explicitly opened as a separate parallel milestone.

## 12. Seed packet candidates

```json
{
  "seedId": "IH-THREAD-ESTIMATING-SPINE-HUMAN-VISUAL-SIGNOFF-BOUNDARY-V1",
  "kind": "lesson",
  "retrievalQuestions": [
    "How should an automated technical milestone close when authenticated visual proof is still human-only?",
    "When is PENDING_REVIEW a valid pilot outcome instead of a failure?"
  ],
  "evidenceRefs": [
    "EVT-007",
    "EVT-008",
    "EVT-009",
    "HP-001",
    "HP-002"
  ],
  "futureAgentInstructions": "Keep technical release/runtime proof separate from operator-authenticated visual proof. Never fabricate the latter. Preserve pending commercial state unless a human intentionally acts.",
  "status": "CANDIDATE"
}
```

```json
{
  "seedId": "IH-THREAD-ESTIMATING-SPINE-SIGNOFF-FREEZE-V1",
  "kind": "protocol-upgrade",
  "retrievalQuestions": [
    "How should an operator signoff milestone prevent hidden development scope creep?",
    "What actions remain valid after a signoff packet is frozen pending operator walkthrough?"
  ],
  "evidenceRefs": [
    "EVT-009",
    "EVT-010",
    "HP-008",
    "HP-009"
  ],
  "futureAgentInstructions": "After signoff scaffolding, allow only checklist results, screenshots, defects, operator comments, and validation. Route UX fixes to the next milestone unless the operator explicitly reopens scope.",
  "status": "CANDIDATE"
}
```

```json
{
  "seedId": "IH-THREAD-ESTIMATING-SPINE-PROJECTION-GAP-DIAGNOSIS-V1",
  "kind": "failure-pattern",
  "retrievalQuestions": [
    "What should agents do when active_storage_provider is null but document storage locations exist?",
    "How do you distinguish a projection gap from a missing canonical binary?"
  ],
  "evidenceRefs": [
    "EVT-003",
    "HP-004"
  ],
  "futureAgentInstructions": "Inspect canonical owner records and resolver semantics before patching consumers or declaring the binary missing. Prefer provider-neutral resolution through Documents authority.",
  "status": "CANDIDATE"
}
```

```json
{
  "seedId": "IH-THREAD-ESTIMATING-SPINE-PRODUCTIVITY-TRANSITION-V1",
  "kind": "lesson",
  "retrievalQuestions": [
    "When should an integration program transition into a productivity optimization program?",
    "Which metrics should drive the next estimating-spine milestone after technical convergence?"
  ],
  "evidenceRefs": [
    "EVT-011",
    "HP-010"
  ],
  "futureAgentInstructions": "Once canonical merge, runtime alignment, replay, health, cockpit wiring, and authority boundaries are proven, stop infrastructure-first expansion and optimize measurable estimator throughput and decision quality.",
  "status": "CANDIDATE"
}
```

## 13. Future-agent instructions

1. Treat `estimating-spine-roi-convergence-and-operator-value-v1 = ESTIMATING_SPINE_ROI_CONVERGENCE_VERIFIED` as the technical baseline for this thread.
2. Treat `estimating-spine-operator-pilot-signoff-v1 = PENDING_OPERATOR_WALKTHROUGH` as frozen until human evidence arrives.
3. Do not reopen integration architecture unless the operator explicitly starts a separate milestone or a signoff defect proves a technical blocker.
4. On operator evidence, update only the 16 checks, screenshots, defects, comments, and validator outcome.
5. If signoff returns PASS/PASS_WITH_WARN, close `ESTIMATING_SPINE_OPERATOR_PILOT_SIGNOFF_PASS` and allow the first genuine human disposition.
6. Then advance to `estimating-spine-estimator-productivity-and-learning-v1` with measured throughput/quality baselines before adding new intelligence.
7. Preserve Bid Composer commercial authority and Master Graph non-authoritative status.
8. Keep human commercial actions separate from technical proof.

## 14. Publication truth table

| Layer | State (ChatGPT closeout) |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | pending Git gate at draft creation |
| `CHATGPT_HARVEST_GIT_GATE` | pending Git gate at draft creation |
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

## 15. gitPublicationReceipt

The authoritative SHA receipt is emitted by ChatGPT after remote publication verification. This section intentionally does not predeclare a SHA before the Git publication gate executes.

## 16. Cursor handoff command

After ChatGPT reports `CHATGPT_SOURCE_PUBLISHED` and provides the verified SHA:

```bash
git fetch origin chat-gpt-harvest && git checkout chat-gpt-harvest && git pull --ff-only origin chat-gpt-harvest

npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-07-estimating-spine-roi-operator-signoff-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-07-estimating-spine-roi-operator-signoff-v1

npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-07-estimating-spine-roi-operator-signoff-v1
npm run harvest:sync-derived -- harvest-2026-08-07-estimating-spine-roi-operator-signoff-v1
npm run harvest:validate -- harvest-2026-08-07-estimating-spine-roi-operator-signoff-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-07-estimating-spine-roi-operator-signoff-v1
npm run test:harvest
# operator only after validation:
npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-07-estimating-spine-roi-operator-signoff-v1
```
