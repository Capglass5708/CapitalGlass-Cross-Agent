# ChatGPT Findings Source — WaveRunner Control-Plane Context Resolution Closeout

**Harvest ID:** `harvest-2026-08-09-waverunner-control-plane-context-resolution-v1`  
**Mission:** `chat-thread-closeout-autopsy-harvest-chatgpt-v1`  
**Lane:** `CHAT_CONTEXT_ONLY`  
**Protocol:** v2.1  
**Mode:** `DRAFT_FILE`  
**Source:** Current visible ChatGPT thread + attached protocol only  
**Target tier:** T2  
**Initial verdict:** `DRAFT_READY`  
**Closeout target:** `CHATGPT_SOURCE_PUBLISHED` — never `HARVEST_COMPLETE`

---

## 1. Final summary + verdict

This thread completed a major WaveRunner control-plane rail. The system progressed from a state where the operator and conversation frequently carried milestone identity, continuation, and large execution prompts into a state where the literal operator front door:

`npm run sdlc:waverunner`

can discover governed milestone candidates, deterministically resolve the active milestone, fail closed on ambiguity before material mutation, recover authoritative continuation state, compile a minimum sufficient execution context, and feed that compact context into the real WaveRunner execution path without historical-prompt fallback.

The terminal control-plane milestone, `waverunner-deterministic-milestone-context-resolution-v1`, was reported `DURABLE_COMPLETE`, with implementation SHA `ff00de1fc470513c61c78ca6059911f83d5d3383` and final receipt closeout SHA `17a2a86d9a8eb46819b16513ee66a51d723895e9`, `HEAD == origin`. The exact no-flag operator command acceptance passed. The verified compact context was actually consumed by execution, semantic equivalence passed, authority rediscovery in the compiler lane remained zero, historical context and secrets were excluded, and ambiguity was proven to produce zero material writes.

A significant thread-management failure also occurred: the conversation temporarily drifted from WaveRunner control-plane evolution into Computer Estimator / Revu commercial-glazing domain work. That work produced real value, including a commercial-glazing scope intelligence spine and opening-mark association layer, but it did not belong on this control-plane thread. The operator explicitly detected and corrected the drift. `commercial-glazing-schedule-join-v1` was then parked and remained outside this thread.

A separate MCP estate-health recovery later restored 14/14 MCP health and a fully green AppBuilder preflight. That recovery also surfaced operational lessons about governance-proof branch hygiene and the 300-second runtime freshness window. These are operational evidence, not reasons to reopen the frozen WaveRunner architecture.

A remaining open issue is distinct from this completed rail: with the production execution lock restored to `pg-estimator-trust-closure-recovery-v1`, the same bare WaveRunner command reportedly selects the PG milestone but fails at `VERIFIED_CONTEXT_COMPILE_FAILED` on a `governedSpineHash` semantic subcheck. This is a separate PG projection/currentness recovery lane and must not be used to reopen deterministic milestone resolution.

**Artifact verdict before Git gate:** `DRAFT_READY`

---

## 2. Harvest tier rationale

**Tier:** T2

T2 is justified because the thread contains multiple durable, reusable system lessons rather than a simple status recap:

- a new deterministic operator front door,
- stable milestone identity and continuation roots,
- compact verified context with measured size reduction,
- fail-closed ambiguity and mutation barriers,
- exact-command acceptance semantics,
- thread-lane drift and recovery,
- MCP currentness/branch-hygiene operational lessons,
- product-workflow side-lane evidence,
- an unresolved PG projection issue that should remain isolated.

This thread is strongly SDLC/governance weighted, with a smaller but material CE/Revu product-workflow side lane.

---

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

No claim is made that Intelligence Hub, Z, L, Supabase, or AI-cache retrieval was executed by ChatGPT in this harvest session.

---

## 4. Thread event inventory

### EVT-001 — Material Preflight ownership frozen

`material-preflight-orchestration-cleanup-v1` was accepted as architecturally complete/frozen even when one live acceptance was `PASS_WITH_WARN` because canonical MCP health was degraded. The negative-path proof remained valid: MCP health authority blocked → MaterialPreflightAuthorityBundle propagated the block → Auto-v32 consumed it with zero authority rediscovery.

### EVT-002 — Token-economy rail started

`ai-context-compiler-token-economy-v1` was started on `88d230512`. The initial fixture proved identical governed spine and approximately 35.6% estimated token reduction. The thread then re-anchored token economy as a control-plane optimization rather than another authority-discovery layer.

### EVT-003 — Commercial glazing side lane drifted into the thread

The conversation temporarily shifted to `commercial-glazing-scope-intelligence-spine-v1` in Computer Estimator and Revu. The spine reached `PASS_WITH_WARN`; CE became the intelligence owner while Revu remained markup executor. A follow-on `commercial-glazing-opening-mark-association-v1` also reached `PASS_WITH_WARN`, including 9/9 identified mark-bearing Lookout candidates, 172/172 Morton Ranch candidates preserved as unresolved, zero false identity merges, and zero candidate suppression.

### EVT-004 — Operator detected thread-purpose drift

The operator explicitly stated that the conversation had drifted from the purpose of the thread. The thread was re-locked to `WAVERUNNER_CONTROL_PLANE_EVOLUTION`; CE schedule join was parked and raster/vision remained stopped.

### EVT-005 — Deterministic milestone-context resolution rail defined

The successor milestone `waverunner-deterministic-milestone-context-resolution-v1` was defined to remove the need for conversational milestone pinning. Its core invariant became:

`RESOLVE IDENTITY → VERIFY AUTHORITY → COMPILE COMPACT CONTEXT → EXECUTE GOVERNED SPINE`

### EVT-006 — Slice 0 planning authority made durable

Slice 0 added the work-package authority and `waverunner-milestone-resolution-v1` schema, then committed/pushed them separately.

### EVT-007 — Slice 1 resolved WHO?

Slice 1 shipped `resolve-milestone-identity.mjs` and deterministic multi-candidate resolution. It supported `RESOLVED`, `AMBIGUOUS`, `BLOCKED`, and `EMPTY`; introduced `MILESTONE_RESOLUTION_AMBIGUOUS`; prevented terminal milestones from reactivation; kept parked CE work visible but non-competing; and produced a stable `identityRootDigest`. Slice 1 completed at `57fedbf80f94314ba967bc5a592abbf4706cba2f` with 12/12 tests passing.

### EVT-008 — Slice 2 resolved WHERE?

Slice 2 shipped `recover-milestone-continuation.mjs`. It recovered `baselineSha`, `continuationSha`, authoritative receipt lineage, `resumePoint`, completed/remaining phases, recovery tracks, and `continuationDigest`, then combined identity + continuation into `milestoneContextRootDigest`. It rejected stale/wrong-lineage receipts with structured reasons including `BRANCH_MISMATCH`, `MILESTONE_ID_MISMATCH`, `SHA_NONEXISTENT`, `ABANDONED_ATTEMPT`, and `SUPERSEDED_ATTEMPT`. Slice 2 completed at `8ee27cd0bff6875a5fb41466b4f86b22ea6a6379`, 25/25 tests passing.

### EVT-009 — Slice 3 resolved WHAT NOW?

Slice 3 shipped `compileVerifiedMilestoneContext`, `build-compact-execution-context.mjs`, and a compiler CLI. The compiler became a fail-closed consumer of verified identity and continuation, not a discovery layer. Fixture context fell from 7,709 bytes to 2,488 bytes (67.7% reduction); semantic equivalence passed; authority rediscovery calls were zero; historical prompt content, duplicate authority bodies, and secret values were absent. Tests: 20/20 compiler, 45/45 milestone-context, 6/6 token-economy regression. Slice 3 completed at `2f977222ff8a29c6df545d2d1700719948bcd0b5`.

### EVT-010 — Slice 4 wired the real bare front door

Slice 4 integrated the deterministic chain into the existing `npm run sdlc:waverunner` entry point. New front-door logic enforced a mutation barrier for `AMBIGUOUS` / `EMPTY` / `BLOCKED` / `TERMINAL`, and the prepare path consumed `verifiedAgentContext.compactPromptBody` with no legacy full-prompt fallback. Implementation SHA: `ff00de1fc470513c61c78ca6059911f83d5d3383`. Tests: 66/66 milestone-context, 21/21 bare-front-door cases, 6/6 token-economy regression. Ambiguity case returned `MILESTONE_RESOLUTION_AMBIGUOUS` with `materialWrites=0`.

### EVT-011 — Initial terminal proof was correctly challenged

The first reported live proof used the real front door with no `--milestone`, but it still included `--resolve-only --mcp-root=<fixture>`. That proved bare milestone resolution architecture but did not literally satisfy the terminal contract requiring exact `npm run sdlc:waverunner` with no flags. The acceptance classification was narrowed rather than overstated.

### EVT-012 — MCP estate-health recovery restored green control plane

A separate recovery run restored MCP authority to 14/14 `MCP_100_PERCENT_HEALTHY`, doctor gate PASS, application-bible sync PASS, runtime freshness PASS, suite contract gate PASS, and AppBuilder preflight PASS. Operational findings included: use governance-current `origin/main` for governance proof rather than a stale orchestration branch; repair broken Railway CLI postinstall when needed; refresh Cloudflare environment names from Doppler; and account for a 300-second health freshness window during an approximately 8-minute preflight.

### EVT-013 — Exact no-flag command acceptance passed

The literal command `npm run sdlc:waverunner` was executed with `milestonePinUsed=false` and `fixtureRootOverrideUsed=false`. It resolved `waverunner-deterministic-milestone-context-resolution-v1`, used `DETERMINISTIC_MILESTONE_CONTEXT_COMPILER`, set `contextConsumedByExecution=true`, used no legacy full-prompt fallback, preserved semantic equivalence, performed zero compiler-lane authority rediscovery, exposed no secrets, and only allowed mutation after resolution. The downstream prepare gate then legitimately blocked on `BLOCK_BASELINE_DIRTY`.

### EVT-014 — Production lock behavior proved machine authority but exposed PG projection drift

After the acceptance lock was restored to production `pg-estimator-trust-closure-recovery-v1`, the same bare command selected PG rather than the WaveRunner milestone. That is positive evidence that the resolver follows machine authority instead of hardcoding the acceptance milestone. The PG run then failed at `VERIFIED_CONTEXT_COMPILE_FAILED` on `governedSpineHash`; this remained a separate PG projection/currentness problem.

### EVT-015 — Terminal receipts were committed and the rail frozen

A receipt-only closeout commit `17a2a86d9a8eb46819b16513ee66a51d723895e9` pinned terminal exact-command acceptance. `HEAD == origin/milestone-orchestration-push`. `waverunner-deterministic-milestone-context-resolution-v1` was frozen as `DURABLE_COMPLETE`, and the normal operator front door became `npm run sdlc:waverunner`.

---

## 5. Harvest packets

### HP-001 — Machine authority replaces conversational milestone pinning

- **candidateDigest:** `sha256:e8b2a741eeb3d5586392aa2e01aadbb8e7dfbfb7e8cb17fc5202a3b747d562c8`
- **kind:** success-pattern
- **goldMineSignalClass:** `SUCCESS_PATTERN`
- **implementationState:** `ADOPTED`
- **novelty:** `RESOLUTION_EVIDENCE`
- **observed:** The operator can invoke `npm run sdlc:waverunner` without `--milestone`; governed machine state selects the milestone and continuation.
- **value:** Conversation is no longer the milestone state-management system for this rail.
- **evidenceRefs:** implementation SHA `ff00de1fc470513c61c78ca6059911f83d5d3383`; final closeout SHA `17a2a86d9a8eb46819b16513ee66a51d723895e9`; terminal exact-command receipt.

### HP-002 — Compact verified context preserves decisions while shrinking agent input

- **candidateDigest:** `sha256:c3c81d4d810c89fab2f7b547337af1e58f8422020952993ff20591db82d63bb3`
- **kind:** performance-improvement
- **goldMineSignalClass:** `PERFORMANCE_SIGNAL`
- **implementationState:** `VERIFIED_FIXED`
- **novelty:** `RESOLUTION_EVIDENCE`
- **observed:** Slice 3 fixture reduced context 7,709 → 2,488 bytes (67.7%). Slice 4 live front-door report used 7,907 → 2,488 bytes (68.5%).
- **proof:** `SEMANTIC_EQUIVALENCE=PASS`; `authorityRediscoveryCalls=0`; historical context false; duplicate authority bodies false; secrets false.
- **residual:** Token counts remain estimator-based where reported; byte metrics are the stronger deterministic measurement.

### HP-003 — Ambiguity is a pre-mutation safety condition

- **candidateDigest:** `sha256:e2e82e57e122b65f5ebb9874ad73ec42314653f049904a422cf5373919951b3a`
- **kind:** safety-pattern
- **goldMineSignalClass:** `SUCCESS_PATTERN`
- **implementationState:** `VERIFIED_FIXED`
- **novelty:** `RESOLUTION_EVIDENCE`
- **observed:** Equal-authority candidate ties return `MILESTONE_RESOLUTION_AMBIGUOUS`.
- **proof:** Slice 4 ambiguity case: `materialWrites=0`, no receipt, no execution.
- **future use:** Apply this pattern to any agent front door that must choose among multiple governed work targets.

### HP-004 — Continuation lineage must be governed, not newest-file wins

- **candidateDigest:** `sha256:2e925eb6fdb7a8bd23fc516f31462d29c8338f0dee2ff407bdbe3c3fe5d04ae5`
- **kind:** authority-lesson
- **goldMineSignalClass:** `RESOLUTION_SIGNAL`
- **implementationState:** `VERIFIED_FIXED`
- **novelty:** `RESOLUTION_EVIDENCE`
- **observed:** Continuation recovery validates milestone, branch, commit existence, lineage, lifecycle stage, and supersession before selecting the continuation point.
- **proof:** Structured rejection reasons for stale/wrong-lineage receipts.
- **future use:** Reuse the same principle for deployments, evidence caches, and publication receipts.

### HP-005 — Thread/lane drift required manual re-anchoring

- **candidateDigest:** `sha256:2d1e789d19d21ad82038e33546d01438f29e4541be5a47bf7bf9b0f67b86aa0d`
- **kind:** operator-friction
- **goldMineSignalClass:** `OPERATOR_FRICTION_SIGNAL`
- **implementationState:** `PARTIAL`
- **novelty:** `RECURRENCE`
- **observed:** A WaveRunner control-plane thread drifted into CE/Revu product implementation despite an active control-plane rail. The operator had to explicitly call out the drift.
- **resolution in thread:** CE schedule join was parked; thread purpose was relocked.
- **residual:** No machine-level chat/thread lane guard was demonstrated.

### HP-006 — Terminal proof must validate literal invocation, not only architectural equivalence

- **candidateDigest:** `sha256:c42d00eeb0cb4e2b69b49560b911b68ad0702dfac45935cff92a771b6d8e89f6`
- **kind:** protocol-upgrade
- **goldMineSignalClass:** `OBSERVABILITY_GAP`
- **implementationState:** `PARTIAL`
- **novelty:** `NEW`
- **observed:** A real front-door invocation with `--resolve-only --mcp-root=<fixture>` initially appeared sufficient, but the terminal contract required the exact zero-flag command.
- **resolution in thread:** A second exact-command acceptance was run and pinned.
- **recommended upgrade:** Terminal receipts should machine-assert `argv`, `milestonePinUsed`, `fixtureRootOverrideUsed`, and exact-command identity.

### HP-007 — PG governed-spine projection failure is isolated, unresolved evidence

- **candidateDigest:** `sha256:b6dfb265fbb4134dbaa376d51c01e1bd56f5e34161df87f2b958822968fa85f2`
- **kind:** failure-pattern
- **goldMineSignalClass:** `PROBLEM_SIGNAL`
- **implementationState:** `OBSERVED_OPEN`
- **novelty:** `NEW`
- **observed:** With production lock restored to `pg-estimator-trust-closure-recovery-v1`, bare WaveRunner resolves PG but fails `VERIFIED_CONTEXT_COMPILE_FAILED` on `governedSpineHash`.
- **important boundary:** This is not evidence of a deterministic milestone-resolution regression.
- **resolutionTarget:** PG projection/currentness recovery lane.

### HP-008 — MCP estate-health recovery validates authority separation

- **candidateDigest:** `sha256:9bff2e4f855b7f236f74338b8ed1863981be6621f0fa381a1a9b32093c8a7636`
- **kind:** recovery-pattern
- **goldMineSignalClass:** `RESOLUTION_SIGNAL`
- **implementationState:** `VERIFIED_FIXED`
- **novelty:** `RESOLUTION_EVIDENCE`
- **observed:** MCP health returned to 14/14 and full AppBuilder preflight PASS without reopening WaveRunner architecture.
- **proof:** `mcp-health-authority`, doctor, Bible sync, runtime freshness, contract gate, AppBuilder preflight all PASS.
- **lesson:** Environmental recovery and control-plane architecture must remain separate lanes.

### HP-009 — CE commercial-glazing intelligence gained real capability despite being off-thread

- **candidateDigest:** `sha256:5073eaf7710c437a3d17a7a14999931460ab0e34bf5ebe922e9f8dae8e60377b`
- **kind:** product-functionality
- **goldMineSignalClass:** `BUSINESS_WORKFLOW_SIGNAL`
- **implementationState:** `VERIFIED_FIXED`
- **novelty:** `NEW`
- **observed:** CE now owns scope intelligence contracts and opening-mark association while Revu remains markup executor.
- **proof:** Scope-spine and opening-mark milestones both reported `PASS_WITH_WARN`; opening-mark fixture 9/9 identified and Morton Ranch 172/172 unresolved retained, zero false merges/suppression.
- **residual:** Schedule joins, structured operator ground truth, and production Revu takeoff remain future work.
- **thread note:** Valuable outcome, but it was scope drift relative to the control-plane thread.

### HP-010 — Governance proof needs branch-currentness discipline

- **candidateDigest:** `sha256:cb4eef3353d3d3af1bb69cd1c473e06ba6577b7e2f129966ae33139e64a71f6f`
- **kind:** protocol-lesson
- **goldMineSignalClass:** `RESOLUTION_SIGNAL`
- **implementationState:** `VERIFIED_FIXED`
- **novelty:** `RESOLUTION_EVIDENCE`
- **observed:** MCP recovery proof was valid on governance-current `origin/main`; `milestone-orchestration-push` had stale PG prompt-index state and was explicitly rejected for that governance proof.
- **future use:** Authority-sensitive verification should expose and enforce branch/currentness compatibility before proving health.

### HP-011 — Deterministic context removes repeated agent-history reasoning

- **candidateDigest:** `sha256:769b4f54e9b354abf1ca65c927ec63220769c35b8aa0c7eb4709efd8224c105a`
- **kind:** agent-efficiency
- **goldMineSignalClass:** `AGENT_FRICTION_SIGNAL`
- **implementationState:** `VERIFIED_FIXED`
- **novelty:** `RESOLUTION_EVIDENCE`
- **before:** Long prompts repeatedly restated milestone, branch, frozen architecture, completed phases, blockers, and return contracts.
- **after:** `identityRootDigest` + `continuationDigest` + compact verified context provide these facts as machine state.
- **residual:** Further opportunities remain for evidence cache, capability discovery, partial preflight reuse, and execution delta; these were explicitly out of scope.

### HP-012 — Long preflight can outrun MCP freshness SLA

- **candidateDigest:** `sha256:0102bba88e2a6c21d5865d962bb0a35a2b57fb260e026b157bfa9ef6b7a6ca59`
- **kind:** operator-friction
- **goldMineSignalClass:** `OPERATOR_FRICTION_SIGNAL`
- **implementationState:** `PARTIAL`
- **novelty:** `NEW`
- **observed:** Approx. 8-minute AppBuilder preflight can exceed a 300-second MCP health freshness window. Recovery scheduled a strict health refresh around T+480s before the freshness guard.
- **residual:** Manual timing remains operational friction.
- **resolutionTarget:** Just-in-time freshness scheduling/refresh owned by canonical MCP Health / Material Preflight orchestration, without creating a parallel health stack.

---

## 6. Execution deltas

### ED-001 — Operator-pinned milestone → machine-resolved milestone

**Before:** Operator/conversation had to identify and pin milestone context.  
**After:** Bare WaveRunner discovers governed candidates and selects deterministically; ambiguity blocks.

### ED-002 — Receipt/history reconstruction → verified continuation root

**Before:** Continuation often required interpreting prior receipts/history.  
**After:** `recoverMilestoneContinuation()` emits baseline, continuation SHA, last verified receipt, resume point, completed/remaining phases, recovery track, and digest.

### ED-003 — Full prompt → compact verified context

**Before:** Baseline fixture context 7.7–7.9 KB.  
**After:** 2,488-byte compact context; semantic equivalence PASS.

### ED-004 — Sidecar compiler → real execution consumption

**Before:** Compact compiler could be prepared without proving the main runner consumed it.  
**After:** `agentContextSource=DETERMINISTIC_MILESTONE_CONTEXT_COMPILER`, `contextConsumedByExecution=true`, legacy full prompt fallback false.

### ED-005 — Ambiguity after discovery → mutation barrier

**Before:** No explicit multi-candidate ambiguity model.  
**After:** Ambiguity returns a distinct blocker before resolve/prepare/execute/receipt persistence.

### ED-006 — Thread scope drift → explicit lane parking

**Before:** CE/Revu domain milestones temporarily became the active subject inside the WaveRunner thread.  
**After:** Thread purpose relocked; CE schedule join parked; raster/vision stayed STOPPED.

---

## 7. Observed improvement outcomes

### OUT-001 — Compact execution context

- **beforeState:** 7,709-byte Slice 3 full fixture context / 7,907-byte Slice 4 baseline.
- **afterState:** 2,488-byte compact verified context.
- **measurableChange:** 67.7% Slice 3 byte reduction; 68.5% Slice 4 reported reduction.
- **proof:** semantic equivalence PASS; compiler tests and front-door tests PASS.
- **remainingResidual:** token estimate is not the strongest deterministic metric; byte metrics are authoritative within this thread.
- **improvementProven:** true

### OUT-002 — Exact operator front door

- **beforeState:** normal safe continuation still expected milestone/context pinning.
- **afterState:** exact `npm run sdlc:waverunner` resolves governed work with no milestone pin or fixture override.
- **measurableChange:** `milestonePinUsed=false`, `fixtureRootOverrideUsed=false`, `contextConsumedByExecution=true`.
- **proof:** terminal exact-command acceptance receipt.
- **remainingResidual:** downstream gates can still block for legitimate reasons, as demonstrated by `BLOCK_BASELINE_DIRTY`.
- **improvementProven:** true

### OUT-003 — Fail-closed multi-candidate resolution

- **beforeState:** resolver did not express governed multi-candidate ambiguity.
- **afterState:** `MILESTONE_RESOLUTION_AMBIGUOUS` blocks before material writes.
- **measurableChange:** ambiguity proof `materialWrites=0`.
- **proof:** Slice 4 adversarial case.
- **remainingResidual:** none observed for this milestone.
- **improvementProven:** true

### OUT-004 — MCP estate health recovery

- **beforeState:** MCP/runtime currentness blocked background preflight.
- **afterState:** 14/14 MCP healthy; doctor, Bible sync, runtime freshness, contract gate, AppBuilder preflight all PASS.
- **measurableChange:** full preflight gate stack green in reported recovery.
- **proof:** `runtime/agent-preflight/app-builder-mcp/latest.json` reported artifact hash prefix `b91c8125…`.
- **remainingResidual:** 300-second freshness window can still require timing-aware refresh on long preflights.
- **improvementProven:** true

### OUT-005 — Commercial glazing identity side lane

- **beforeState:** scope spine could classify what/why/system but Morton Ranch had 172/172 unresolved opening identities.
- **afterState:** deterministic opening-mark association proved 9/9 identified in a mark-bearing Lookout fixture; zero false identity merges; Morton Ranch no-mark candidates retained.
- **measurableChange:** mark-bearing Lookout 9/9 identified; suppressed candidates 0.
- **proof:** reported opening-mark acceptance receipts/tests.
- **remainingResidual:** live multi-sheet association, schedule join, ground truth, production Revu pilot.
- **improvementProven:** true for bounded deterministic association, not production takeoff.

---

## 8. Waste ledger

### TW-001 — Product-domain scope drift inside control-plane thread

Extended CE/Revu work occurred in a thread whose active purpose was WaveRunner control-plane evolution. This consumed context, prompted additional long continuation specifications, and increased risk of conflating unrelated milestone authority. The work was useful, so it is not “wasted output,” but its placement was inefficient.

### TW-002 — Repeated prose re-pinning of frozen architecture

Many continuation prompts repeatedly restated the same frozen architecture, parked lane, `doNotReopen` rules, and completed milestone state. The deterministic context compiler now converts much of this into machine-resolved state.

### TW-003 — Near-miss terminal acceptance

The first terminal proof used real front-door code but not the exact no-flag command required by the acceptance contract, forcing an additional acceptance cycle. A machine-checkable invocation contract would have prevented the near-overclaim.

### TW-004 — Manual health-freshness timing

Scheduling a health refresh roughly 8 minutes into a long preflight is operational choreography that should ideally be calculated by the system.

### TW-005 — Temporary execution-lock change for acceptance

The exact-command acceptance temporarily placed WaveRunner as `ACTIVE`, then restored the production PG lock. This was disclosed and restored correctly, but changing lock authority for an acceptance proof is high-sensitivity operational work and should be minimized or formally represented by an acceptance-scoped authority mechanism if one exists.

---

## 9. Duplication detector

### DUP-001 — Frozen architecture repeatedly re-explained

- **finding:** Material Preflight → authority bundle → Auto-v32 consumer → WaveRunner, plus MCP/environment/substrate ownership, was restated across several prompts.
- **dedup identity:** use protocol/contract hashes and `doNotReopen` refs instead of prose.
- **status:** `NEEDS_REGISTRY_LOOKUP_FIRST`
- **recommendation:** future prompts consume compact authority refs generated by WaveRunner rather than restating architecture.

### DUP-002 — Parked CE / raster STOP repeatedly re-pinned

- **finding:** `commercial-glazing-schedule-join-v1=PARKED` and `RASTER_VISION=STOPPED` were restated repeatedly after thread re-lock.
- **status:** `NEEDS_REGISTRY_LOOKUP_FIRST`
- **recommendation:** carry parked/frozen lanes as deterministic candidate diagnostics.

### DUP-003 — Terminal proof semantics repeated manually

- **finding:** exact-command / no-pin / no-fixture / actual-consumption criteria were manually restated multiple times.
- **status:** `NEEDS_REGISTRY_LOOKUP_FIRST`
- **recommendation:** define a reusable terminal proof contract whose validator inspects command argv + execution receipt.

No distinct valid improvement signal is suppressed by these duplication observations.

---

## 10. Operator friction

### OF-001 — Thread-purpose drift

The operator had to explicitly state that the thread had drifted. This is the clearest human-friction signal in the conversation.

### OF-002 — Proof wording vs literal command mismatch

The operator and agent had to distinguish “real bare front door without milestone pin” from “literal exact no-flag operator command.” This is subtle and should be machine-observable.

### OF-003 — Long preflight freshness choreography

A ~300-second freshness SLA interacting with an ~8-minute preflight led to scheduled manual health refresh timing.

### OF-004 — Branch hygiene during governance proof

The operator/recovery agent had to know that `origin/main` was governance-current while `milestone-orchestration-push` was stale for PG prompt-index proof.

### OF-005 — Production PG compile failure after rail closeout

Bare WaveRunner works as intended, but the production lock resolves PG and then hits a `governedSpineHash` semantic mismatch. This forces a separate recovery decision before PG can use the same front door successfully.

---

## 11. Observability gaps

### OG-001 — Exact CLI invocation provenance

- **whatWeNeededToKnow:** Did terminal acceptance literally execute `npm run sdlc:waverunner` with no hidden milestone/fixture flags?
- **whyItWasNotObservable:** Initial proof described front-door behavior but the command included `--resolve-only --mcp-root`.
- **workflow:** WaveRunner terminal acceptance
- **missingMetricOrReceipt:** canonical `argv`, `milestonePinUsed`, `fixtureRootOverrideUsed`, exact command digest
- **recommendedInstrumentation:** make exact invocation provenance mandatory in terminal acceptance schema and validator.
- **goldMineSignalClass:** `OBSERVABILITY_GAP`

### OG-002 — Future freshness at downstream guard

- **whatWeNeededToKnow:** Will the selected MCP health receipt still be fresh when runtime-freshness guard executes later in a long preflight?
- **whyItWasNotObservable:** Freshness was evaluated at current time, while preflight duration could exceed the 300-second SLA.
- **workflow:** AppBuilder material preflight
- **missingMetricOrReceipt:** projected guard ETA, receipt expiry ETA, minimum freshness budget
- **recommendedInstrumentation:** emit `receiptExpiresAt`, `estimatedFreshnessGuardAt`, and auto-refresh eligibility.
- **goldMineSignalClass:** `OBSERVABILITY_GAP`

### OG-003 — Governance-proof branch suitability

- **whatWeNeededToKnow:** Is this checkout/branch suitable for authoritative governance proof?
- **whyItWasNotObservable:** A stale PG prompt-index on the orchestration branch only became obvious during recovery.
- **workflow:** governance/currentness verification
- **missingMetricOrReceipt:** branch currentness classification vs canonical authority source
- **recommendedInstrumentation:** pre-proof `GOVERNANCE_PROOF_CHECKOUT_ELIGIBLE` classification with reason codes.
- **goldMineSignalClass:** `OBSERVABILITY_GAP`

### OG-004 — PG `governedSpineHash` mismatch provenance

- **whatWeNeededToKnow:** Which exact authority/input hash differs under the production PG lock, and whether the mismatch is stale projection, stale cache, or current work-package divergence.
- **whyItWasNotObservable:** Thread reports only the failing semantic subcheck, not the full expected/actual lineage.
- **workflow:** PG deterministic context compile
- **missingMetricOrReceipt:** expected vs actual `governedSpineHash`, source refs/hashes, invalidation reason
- **recommendedInstrumentation:** emit a bounded projection-diff receipt for compiler semantic mismatches.
- **goldMineSignalClass:** `OBSERVABILITY_GAP`

---

## 12. Success patterns

### SUCCESS_PATTERN-001 — Authority selection before cache trust

Minimal identity resolution occurs before blindly reusing cached execution context. This prevents a stale cache from deciding which milestone is active.

### SUCCESS_PATTERN-002 — Consumer boundaries remain explicit

Material Preflight owns authority composition; Auto-v32 consumes it; the compact compiler consumes verified projections. The thread repeatedly protected the rule that consumers must not rediscover their upstream authorities.

### SUCCESS_PATTERN-003 — Failure states are information, not reasons to guess

Ambiguity, terminal state, no candidates, stale receipts, external subsystem blocks, and dirty baseline all remain distinct. The system blocks for the correct reason instead of flattening everything into generic failure.

### SUCCESS_PATTERN-004 — Exact acceptance caught the last contract gap without reopening implementation

The terminal command gap was fixed with an acceptance-only proof rather than changing already-correct Slice 4 architecture.

### SUCCESS_PATTERN-005 — Compact refs preserve explainability

Authority bodies and full receipt histories were removed from the current action context, but digests/refs and semantic-equivalence gates preserved provenance.

### SUCCESS_PATTERN-006 — Domain-owner separation in CE/Revu

Even during the off-thread product work, CE remained scope-intelligence owner and Revu markup executor. This avoided embedding commercial-glazing domain authority into the markup tool.

---

## 13. ROI backlog

### ROI-001 — Exact-command acceptance validator

- **candidateDigest:** `sha256:c42d00eeb0cb4e2b69b49560b911b68ad0702dfac45935cff92a771b6d8e89f6`
- **proposal:** Add a reusable terminal-proof validator that machine-checks exact argv, forbidden overrides, resolved milestone, context-consumption source, mutation barrier, and receipt lineage.
- **operatorValue:** HIGH
- **businessValue:** MEDIUM
- **platformValue:** HIGH
- **agentValue:** HIGH
- **reliabilityValue:** HIGH
- **automationLeverage:** HIGH
- **estimatedComplexity:** LOW_MEDIUM
- **blastRadius:** LOW
- **confidence:** HIGH
- **evidenceDiversity:** HIGH — prompt contract, fixture proof, exact-command proof
- **rootCauseLeverage:** HIGH
- **goldMineSignalClass:** `OBSERVABILITY_GAP`
- **novelty:** `NEW`
- **businessImpact:** INDIRECT_HIGH

### ROI-002 — Preflight freshness deadline planner / JIT canonical refresh

- **candidateDigest:** `sha256:0102bba88e2a6c21d5865d962bb0a35a2b57fb260e026b157bfa9ef6b7a6ca59`
- **proposal:** Calculate whether canonical MCP health will expire before runtime-freshness guard and trigger an authorized just-in-time refresh through MCP Health Authority, not an ad-hoc parallel path.
- **operatorValue:** HIGH
- **businessValue:** MEDIUM
- **platformValue:** HIGH
- **agentValue:** MEDIUM
- **reliabilityValue:** HIGH
- **automationLeverage:** HIGH
- **estimatedComplexity:** MEDIUM
- **blastRadius:** MEDIUM
- **confidence:** HIGH
- **evidenceDiversity:** MEDIUM
- **rootCauseLeverage:** HIGH
- **goldMineSignalClass:** `OPERATOR_FRICTION_SIGNAL`
- **novelty:** `NEW`
- **businessImpact:** INDIRECT_HIGH

### ROI-003 — Thread/lane scope guard

- **candidateDigest:** `sha256:2d1e789d19d21ad82038e33546d01438f29e4541be5a47bf7bf9b0f67b86aa0d`
- **proposal:** Project current thread/work lane and parked milestones into a compact machine contract so an agent must explicitly request/operator-authorize a lane switch before beginning unrelated domain implementation.
- **operatorValue:** HIGH
- **businessValue:** MEDIUM
- **platformValue:** MEDIUM_HIGH
- **agentValue:** HIGH
- **reliabilityValue:** MEDIUM_HIGH
- **automationLeverage:** HIGH
- **estimatedComplexity:** MEDIUM
- **blastRadius:** MEDIUM
- **confidence:** HIGH
- **evidenceDiversity:** MEDIUM
- **rootCauseLeverage:** HIGH
- **goldMineSignalClass:** `OPERATOR_FRICTION_SIGNAL`
- **novelty:** `RECURRENCE`
- **businessImpact:** INDIRECT_HIGH

### ROI-004 — PG governed-spine semantic-diff recovery

- **candidateDigest:** `sha256:b6dfb265fbb4134dbaa376d51c01e1bd56f5e34161df87f2b958822968fa85f2`
- **proposal:** Open a separate PG projection/currentness recovery milestone that emits expected vs actual governed spine hashes, source refs, invalidation route, and repair owner.
- **operatorValue:** HIGH
- **businessValue:** HIGH
- **platformValue:** HIGH
- **agentValue:** MEDIUM_HIGH
- **reliabilityValue:** HIGH
- **automationLeverage:** MEDIUM_HIGH
- **estimatedComplexity:** MEDIUM
- **blastRadius:** MEDIUM
- **confidence:** MEDIUM_HIGH
- **evidenceDiversity:** LOW_MEDIUM — one production-lock failure report
- **rootCauseLeverage:** HIGH
- **goldMineSignalClass:** `PROBLEM_SIGNAL`
- **novelty:** `NEW`
- **businessImpact:** DIRECT_HIGH

### ROI-005 — Governance-proof checkout eligibility guard

- **candidateDigest:** `sha256:cb4eef3353d3d3af1bb69cd1c473e06ba6577b7e2f129966ae33139e64a71f6f`
- **proposal:** Before authority-sensitive proof, classify whether the current branch/worktree is governance-current and refuse stale prompt/index projections.
- **operatorValue:** MEDIUM_HIGH
- **businessValue:** MEDIUM
- **platformValue:** HIGH
- **agentValue:** HIGH
- **reliabilityValue:** HIGH
- **automationLeverage:** HIGH
- **estimatedComplexity:** LOW_MEDIUM
- **blastRadius:** LOW_MEDIUM
- **confidence:** MEDIUM_HIGH
- **evidenceDiversity:** MEDIUM
- **rootCauseLeverage:** MEDIUM_HIGH
- **goldMineSignalClass:** `RESOLUTION_SIGNAL`
- **novelty:** `UNKNOWN_PENDING_DEDUP`
- **businessImpact:** INDIRECT_HIGH

### ROI-006 — Commercial-glazing schedule join after parked-lane reauthorization

- **candidateDigest:** `sha256:5073eaf7710c437a3d17a7a14999931460ab0e34bf5ebe922e9f8dae8e60377b`
- **proposal:** When explicitly reopened in the proper CE thread/lane, join stable opening identities to schedule rows before operator ground truth and Revu production pilot.
- **operatorValue:** HIGH
- **businessValue:** HIGH
- **platformValue:** MEDIUM
- **agentValue:** MEDIUM_HIGH
- **reliabilityValue:** MEDIUM_HIGH
- **automationLeverage:** HIGH
- **estimatedComplexity:** MEDIUM
- **blastRadius:** MEDIUM
- **confidence:** HIGH
- **evidenceDiversity:** MEDIUM
- **rootCauseLeverage:** HIGH
- **goldMineSignalClass:** `BUSINESS_WORKFLOW_SIGNAL`
- **novelty:** `KNOWN_EXISTING`
- **businessImpact:** DIRECT_HIGH
- **guard:** Do not execute from this WaveRunner closeout thread.

---

## 14. Product-workflow coverage

| Surface | Coverage | Thread evidence |
| --- | --- | --- |
| Computer Estimator | OBSERVED | Scope intelligence spine + opening-mark association side lane |
| Human Estimator | OBSERVED | Mentioned as downstream consumer; no implementation executed |
| Document Center | NOT_OBSERVED | No durable workflow evidence in this thread |
| Plan-set processing | OBSERVED | Morton Ranch / Lookout deterministic text evidence and opening identity |
| OCR/parser | OBSERVED | Text-only evidence limitations; dimension false-positive filtering; raster/vision stopped |
| Revu / Bluebeam | OBSERVED | Revu markup contract/executor boundary; production markup not executed |
| Bid Composer | OBSERVED | Mentioned as downstream consumer; no implementation executed |
| Proposals / Proposal Generator | OBSERVED | PG production lock and governedSpineHash compile issue; PG milestone remained closed otherwise |
| VAE | NOT_OBSERVED | No durable VAE work |
| Scraper | NOT_OBSERVED | Used only as generic external-blocker example, not an observed workflow |
| Cross-app handoffs | OBSERVED | CE intelligence → Revu markup contract; CE normalized scope objects → downstream estimators |
| Operator re-entry | OBSERVED | Thread re-anchor, exact-command acceptance decision, milestone freeze |
| Manual intervention | OBSERVED | Lane re-lock, execution-lock acceptance handling, MCP recovery/freshness timing |

---

## 15. Corpus bias note

`corpusBiasNote: Thread evidence is heavily SDLC/WaveRunner governance and execution-control oriented. Computer Estimator/Revu appears only because the conversation drifted into a side lane; several product surfaces are reference-only or unobserved.`

`underObservedDomains: [Document Center, VAE, Scraper, Human Estimator runtime workflow, Bid Composer runtime workflow, Revu production takeoff, end-to-end Proposal Generator user workflow]`

No estate-wide product optimization conclusion should be inferred from this thread.

---

## 16. Do-not-advance guards

1. Do **not** reopen `waverunner-deterministic-milestone-context-resolution-v1`; it is frozen `DURABLE_COMPLETE`.
2. Do **not** change Material Preflight, Auto-v32 authority-consumer boundaries, MCP Health Authority, or execution-context cache to solve the PG `governedSpineHash` issue.
3. Treat PG `governedSpineHash` as a separate projection/currentness recovery lane.
4. `commercial-glazing-schedule-join-v1` remains parked in this control-plane thread; do not auto-start it here.
5. Raster/plan vision remains STOPPED until separately authorized.
6. Do not treat operational MCP recovery rituals as new constitutional health architecture.
7. Do not treat historical ChatGPT prompts as authority; the new bare WaveRunner front door is the operator contract for this rail.
8. ChatGPT harvest output is draft evidence only until Cursor validates and publishes; do not claim `HARVEST_COMPLETE`, `OPERATIONAL`, `INDEX_HIT`, or `FULLY_SEEDED`.

---

## 17. Seed packet candidates

```json
{
  "seedId": "IH-THREAD-waverunner-machine-authority-front-door-v1",
  "kind": "lesson",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How should WaveRunner determine the active milestone without conversation history?",
    "What proof shows the bare WaveRunner front door consumes deterministic compact context?"
  ],
  "evidenceRefs": [
    "waverunner implementation ff00de1fc470513c61c78ca6059911f83d5d3383",
    "closeout 17a2a86d9a8eb46819b16513ee66a51d723895e9",
    "terminal-operator-exact-command-acceptance.json"
  ],
  "futureAgentInstructions": "Prefer governed machine state for milestone identity and continuation. Never use conversation recency as tie-break authority. Fail closed before mutation when identity is ambiguous."
}
```

```json
{
  "seedId": "IH-THREAD-exact-command-proof-argv-integrity-v1",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How do I prove a terminal CLI acceptance used the exact operator command?",
    "What flags or fixture overrides must be absent before claiming bare-command acceptance?"
  ],
  "evidenceRefs": [
    "initial resolve-only fixture proof",
    "terminal-operator-exact-command-acceptance.json"
  ],
  "futureAgentInstructions": "Record and validate literal argv, milestonePinUsed, fixtureRootOverrideUsed, execution context source, and mutation barrier before claiming exact-command terminal proof."
}
```

```json
{
  "seedId": "IH-THREAD-mcp-preflight-freshness-deadline-v1",
  "kind": "failure-pattern",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why can a healthy MCP receipt fail runtime freshness later in a long preflight?",
    "How should a long preflight schedule canonical MCP health refresh without a parallel health stack?"
  ],
  "evidenceRefs": [
    "cg-mcp-estate-health-auth-recovery-v1 recovery receipt",
    "reported 300-second freshness window and approximately 8-minute preflight"
  ],
  "futureAgentInstructions": "Project receipt expiry against expected freshness-guard time. If refresh is required, route it through canonical MCP Health Authority and preserve receipt-selection eligibility rules."
}
```

```json
{
  "seedId": "IH-THREAD-control-plane-thread-lane-drift-v1",
  "kind": "failure-pattern",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How did a WaveRunner control-plane thread drift into CE/Revu product implementation?",
    "What machine state should prevent a parked product milestone from taking over an unrelated active thread?"
  ],
  "evidenceRefs": [
    "commercial-glazing-scope-intelligence-spine-v1 side-lane reports",
    "operator message identifying thread-purpose drift",
    "commercial-glazing-schedule-join-v1 PARKED"
  ],
  "futureAgentInstructions": "Before starting a materially different repo/lane milestone, compare proposed work to the thread/work-lane lock. Require explicit operator lane switch if it conflicts."
}
```

```json
{
  "seedId": "IH-THREAD-pg-governed-spine-projection-drift-v1",
  "kind": "failure-pattern",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why does bare WaveRunner resolve the production PG lock but fail the governedSpineHash semantic subcheck?",
    "Which expected and actual authority inputs produced the governedSpineHash mismatch?"
  ],
  "evidenceRefs": [
    "production lock pg-estimator-trust-closure-recovery-v1",
    "VERIFIED_CONTEXT_COMPILE_FAILED governedSpineHash report"
  ],
  "futureAgentInstructions": "Open a separate PG projection/currentness recovery lane. Do not modify frozen WaveRunner milestone-resolution architecture unless new authoritative evidence proves a resolver regression."
}
```

---

## 18. Future-agent instructions

1. Start normal WaveRunner continuation with `npm run sdlc:waverunner`; do not reconstruct milestone identity from this chat.
2. Treat `waverunner-deterministic-milestone-context-resolution-v1` as frozen; only reopen on authoritative regression evidence.
3. If bare WaveRunner selects PG and fails `governedSpineHash`, isolate the expected/actual spine projection and repair that PG lane.
4. If MCP health/currentness blocks a later run, use canonical MCP Health Authority and receipt selection. Do not invent a verify-worktree health authority.
5. When running terminal CLI acceptance, store literal invocation provenance and prove forbidden overrides are absent.
6. Keep CE/Revu work in its own domain lane/thread. `commercial-glazing-schedule-join-v1` is parked here.
7. Preserve non-suppression: `distinctValidSuppressed=0` remains an important harvest and candidate-handling invariant.
8. Before implementing any ROI candidate from this draft, run canonical duplication/preflight and registry lookup in Cursor.

---

## 19. Publication truth table

| Layer | State (ChatGPT closeout) |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | `not-run` |
| `CHATGPT_HARVEST_GIT_GATE` | `not-run` |
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

---

## 20. gitPublicationReceipt

`PENDING_CHATGPT_HARVEST_GIT_GATE`

This section will be updated only after the designated artifact is committed to `chat-gpt-harvest` and the remote commit is verified.

---

## 21. Cursor handoff command

After `CHATGPT_HARVEST_GIT_GATE=PASS`, Cursor should run:

```text
Ingest ChatGPT thread autopsy findings per chat-thread-closeout-autopsy-harvest-chatgpt-v1 v2.1.

git fetch origin chat-gpt-harvest && git checkout chat-gpt-harvest && git pull --ff-only origin chat-gpt-harvest

npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-09-waverunner-control-plane-context-resolution-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-09-waverunner-control-plane-context-resolution-v1

Then: duplication-preflight, sync-derived, validate, validate-autopsy, test:harvest.
Operator: harvest:publish-intelligence-full.
```

ChatGPT does not run Cursor validation, main promotion, Z/L publication, indexing, or AI-cache publication.
