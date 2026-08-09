# Commercial Glazing Scope Intelligence Spine v1 — Canonical Build Roadmap

**Parent milestone:** `commercial-glazing-scope-intelligence-spine-v1`
**Current mode:** `SKELETON_AND_CONCEPT_BUILD — LIVE_VERIFICATION_PENDING`
**Primary real-project regression anchor:** `Beacon Hill / CG-2036-26`

## North star
Build a production-safe commercial glazing intelligence spine that can locate likely Capital Glass scope in drawings, relate it across schedules/elevations/details, create controlled Bluebeam Revu markups, detect omissions, support human estimator review, and route reviewed scope to the correct proposal application.

## Ownership map
- `Computer-Estimator-` — drawing evidence, plan-vision candidate detection, drawing relationships, assembly grouping, omission/coverage, revision identity.
- `CG-Computer-Estimator-MCP` — read-only exposure of CE candidate/evidence/relationship/omission tools.
- `CapitalGlassRevu` — controlled markup planning/execution, measurement, read-back, omission-review overlays.
- `CG-Human-Estimator-MCP` — review intelligence, conflicts, missing evidence, review questions; neutral runtime target.
- `Data-Extraction` — historical bid-sheet and reviewed-scope evidence.
- `CG-Platform-Governance-MCP` — canonical contract registry, permissions, lifecycle, release policy.
- `CG-AppBuilder-MCP` — agent orchestration, routing, resumable run state, compatibility gate.
- `CapitalGlass-BidComposer` — remodel proposal consumer only.
- `Cursor-ProposalGenerator` — new-construction proposal consumer only.
- `CapitalGlass-Cross-Agent` — coordination/ledger only; no product implementation.

## Phase 0 — Recover exact branch family and contract authority
**Goal:** another agent can resume safely without relying on chat history.

Required:
1. Check out each branch named in the parent project file.
2. Read every repo-local `docs/integration/commercial-glazing-scope-intelligence-spine-v1/README.md`.
3. Run Governance contract compatibility/hash sync once tooling is available.
4. Block on any `BLOCKED_CONTRACT_DRIFT`.
5. Resolve canonical `project-context-packet-v1` before any cross-spoke run.

Exit gate: all required branches located, 0 unexplained drift, contract versions mutually compatible.

## Phase 1 — Live CE evidence binding
**Goal:** prove the candidate generator against the real CE database and READY evidence packages.

Tasks:
1. Inspect real `current_*` relations and columns under `DATABASE_URL`.
2. Adapt defensive relation readers only where the live schema requires it.
3. Run `scripts/emit_commercial_glazing_candidates.py` on a known document.
4. Verify canonical page-relative geometry and source row provenance.
5. Verify `scopeIdentity` versus exact `observationId` behavior.
6. Measure weak-term false positives, especially generic `glass`, `window`, `door`, `frame`, `lite`, `panel`.

Exit gate: deterministic candidate batch from real plan evidence with provenance and no silent schema assumptions.

## Phase 2 — Real plan-vision adapter
**Goal:** replace temporary evidence-derived vision signals with actual geometry/vision signals.

Preferred implementation order:
1. Vector-first PDF geometry extraction where available.
2. Raster page rendering adapter for sheets without useful vector structure.
3. Opening-region proposal layer.
4. Repeated mullion/transom/grid feature extraction.
5. Entrance/door-leaf-in-glazed-assembly feature extraction.
6. Optional model lane (SAM/object detector/other) behind the detector contract.
7. Preserve raw detector observations separately from commercial-scope classification.

Do not make model output commercial truth.

Exit gate: vision detector can emit bounded opening/assembly observations on controlled sheets with stable coordinate conversion.

## Phase 3 — Drawing relationship engine
**Goal:** corroborate each opening across the drawing set.

Build relationships:
- plan mark -> door/window schedule
- plan opening -> elevation
- elevation -> detail
- detail -> section
- keynote/spec note -> assembly/system context
- addendum/revision -> changed opening

Requirements:
1. Preserve unresolved and conflicting links.
2. Produce confidence per relationship, not one global score.
3. Keep manufacturer/system inference separate from scope classification.

Exit gate: reviewed examples show correct plan/schedule/elevation/detail linkage with traceable evidence.

## Phase 4 — Assembly intelligence
**Goal:** group components the way commercial glazing is estimated.

Target hierarchy:
`Project -> Scope Assembly -> Opening/Component -> Observation -> Evidence`

Examples:
- storefront assembly with entrance pair, sidelites, transoms and framing zone
- curtain wall bay system
- interior office-front/glass partition system

Exit gate: assembly IDs remain stable across reruns and support downstream Revu/Human Estimator use.

## Phase 5 — Revu controlled markup proof
**Goal:** convert CE evidence-backed candidates into Bluebeam markups safely.

Sequence:
1. Revu capability discovery/preflight.
2. Plan-only run.
3. Controlled fixture markup.
4. Read markup back.
5. Verify page, shape, subject, IDs and custom metadata.
6. Re-run identical candidate and prove no duplicate markup.
7. Rollback test markup.
8. Record receipt.

Production stays locked.

Exit gate: fixture `CREATE -> READBACK -> IDEMPOTENT -> ROLLBACK` proof passes.

## Phase 6 — Omission/coverage lane
**Goal:** use independent evidence paths to find scope the primary detector may miss.

Compare:
- schedule marks versus CE candidates
- elevation assemblies versus plan candidates
- CE candidates versus verified Revu markups
- prior revision versus current revision
- historical expected scope patterns where appropriate

Revu output for suspected misses must use `CG_GLAZING_OMISSION_REVIEW`, never normal approved-scope markup semantics.

Exit gate: controlled truth set proves omission lane catches intentionally removed candidates without converting them to approved scope.

## Phase 7 — Human Estimator integration
**Goal:** present evidence, conflicts and questions without auto-approving scope.

Tasks:
1. Validate current legacy Bid Composer-hosted HE runtime.
2. Build neutral-runtime parity for required read-only tools.
3. Compare legacy versus neutral outputs.
4. Switch default only after parity and suite registration pass.
5. Ensure review packet includes candidate, Revu proof, relationship evidence, omissions and prior human corrections.

Exit gate: Human Estimator produces deterministic review packets from CE/Revu evidence; no scope approval is performed by HE.

## Phase 8 — Historical bid-sheet intelligence
**Goal:** teach the system what Capital Glass actually bids.

Pilot with 5-10 matched historical jobs where possible:
1. ingest bid sheets
2. link bid items to source drawings
3. normalize scope classes
4. preserve human inclusion/exclusion/correction evidence
5. expose read-only context to CE/HE
6. no durable Master Graph promotion without human-approved promotion gate

Exit gate: historical references improve review/classification context without overriding drawing evidence.

## Phase 9 — Beacon Hill regression truth set
**Goal:** establish the first real new-construction benchmark.

Project: `Beacon Hill / CG-2036-26`.

When plans are available:
1. bind canonical document/drawing-set IDs
2. choose 3-5 high-value sheets
3. manually establish reviewed truth for glazing scope
4. run CE candidates
5. run relationship engine
6. run Revu markup/read-back
7. run omission pass
8. run Human Estimator review
9. score recall, false positives, classification, relationship linkage, duplicate rate and review rate

Exit gate: benchmark receipt exists and can be rerun deterministically.

## Phase 10 — Agent orchestration dry-run
**Goal:** allow an AI agent to operate the spine safely.

Required sequence:
`DISCOVER -> CONTRACT GATE -> CONTEXT -> PLAN -> AUTHORIZE -> EXECUTE -> VERIFY -> REVIEW -> OMIT/COVERAGE -> ROUTE`

Use `commercial-glazing-agent-run-state-v1` and durable transition receipts.

Agent permissions:
- READ
- PROPOSE
- EXECUTE_CONTROLLED
- WRITE_REVIEWED through owning app only
- COMMERCIAL_RELEASE human-only

Exit gate: interrupted run can resume by `runId` without duplicate Revu writes or lost state.

## Phase 11 — Downstream proposal consumers
### New construction
Route reviewed scope to `Cursor-ProposalGenerator` only.
Validate drawing refs, assemblies, addenda/revisions, alternates and proposal population.

### Remodel
Route reviewed scope to `CapitalGlass-BidComposer` only.
Validate remodel-specific scope language, existing-condition context and proposal population.

Exit gate: routing invariant proven in both directions and no cross-application ownership leak.

## Phase 12 — Production/autonomy review
Do not unlock merely because tests pass.

Required before production writes:
1. contract compatibility PASS
2. MCP health PASS
3. CE real evidence proof
4. Revu controlled write/readback proof
5. omission proof
6. HE review proof
7. Beacon Hill benchmark acceptable
8. resumable agent run proof
9. human approval of production authorization policy
10. explicit Governance production unlock

Terminal production decision: `GO`, `PASS_WITH_WARN`, or `BLOCKED` only.

## Core quality metrics
Track per benchmark/run:
- scope recall
- false-positive rate
- missed-scope count
- correct assembly classification
- schedule/elevation/detail link accuracy
- geometry/read-back agreement
- duplicate markup count
- omission detection precision/recall
- human correction rate
- human review rate
- revision identity continuity
- agent resume/idempotency success

## Critical architectural invariants
- Drawing evidence outranks advisory historical/graph context.
- Detection is not approval.
- Revu markup is evidence, not commercial release.
- Missing detection is not proof of absence.
- `scopeIdentity` survives revisions; `observationId` represents an exact observation.
- Master Graph is read-only for this wave.
- HE is review intelligence, not scope approval authority.
- Remodel -> Bid Composer.
- New Construction -> Proposal Generator.
- All writes go through the owning spoke.
- Commercial release remains human-only in v1.

## Resume instruction for another agent
When this roadmap is discovered, do not start by inventing a new milestone. Resume `commercial-glazing-scope-intelligence-spine-v1`, read the parent project file and repo-local integration README, recover current branch/parity state, run the earliest unproven phase gate above, and advance only after preserving receipts and authority boundaries.
