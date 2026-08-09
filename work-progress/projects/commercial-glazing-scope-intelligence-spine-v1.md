# Commercial Glazing Scope Intelligence Spine v1

**Parent milestone:** `commercial-glazing-scope-intelligence-spine-v1`
**Mode:** SKELETON_AND_CONCEPT_BUILD — LIVE_VERIFICATION_PENDING

## North star

Create a coordinated commercial-glazing intelligence spine that can discover likely Capital Glass scope from drawings, mark and measure it in Revu, expose evidence/conflicts for estimator review, learn from reviewed historical work, and route approved scope to the correct proposal consumer while preserving repo authority boundaries.

## Branch family

| Repo | Branch | Role |
|---|---|---|
| `Computer-Estimator-` | `feat/commercial-glazing-scope-candidates-v1` | Plan evidence → commercial glazing candidates |
| `CG-Computer-Estimator-MCP` | `feat/commercial-glazing-scope-candidates-v1` | Read-only candidate spoke |
| `CapitalGlassRevu` | `feat/revu-window-door-markup-validation-v1` | Revu markup, measurement, read-back, evidence |
| `CG-Human-Estimator-MCP` | `feat/commercial-glazing-scope-review-intelligence-v1` | Read-only review intelligence; neutral runtime migration in progress |
| `Data-Extraction` | `feat/historical-commercial-glazing-scope-evidence-v1` | Historical bid-sheet / reviewed-scope evidence |
| `CG-Platform-Governance-MCP` | `feat/commercial-glazing-agent-governance-v1` | Agent permissions, canonical contracts, lifecycle, release policy |
| `CG-AppBuilder-MCP` | `feat/commercial-glazing-agent-orchestration-v1` | Agent orchestration, run state, compatibility gate, routing |
| `CapitalGlass-BidComposer` | `feat/commercial-glazing-remodel-scope-consumer-v1` | Remodel proposal consumer |
| `Cursor-ProposalGenerator` | `feat/commercial-glazing-new-construction-scope-consumer-v1` | New-construction proposal consumer |
| `CapitalGlass-Cross-Agent` | `work/commercial-glazing-scope-intelligence-spine-v1` | Coordination only; no product implementation |

## Routing invariant

- `REMODEL` → Bid Composer.
- `NEW_CONSTRUCTION` → Proposal Generator.
- Upstream CE/Revu/Human Estimator scope objects are proposal-consumer-neutral.

## Structural hardening now implemented

1. Governance owns `commercial-glazing-contract-registry-v1`; consumers must use compatible/hash-bound mirrors and fail closed on drift.
2. Governance owns `project-context-packet-v1`; spokes must not independently reinterpret project routing when a packet is present.
3. CE separates exact `observationId` from durable `scopeIdentity` so revisions do not automatically create unrelated business objects.
4. Governance owns `commercial-glazing-scope-lifecycle-v1`; AI may advance through review-required states but human disposition is required before `APPROVED_SCOPE`.
5. AppBuilder owns `commercial-glazing-agent-run-state-v1` with resumable `runId`, transition receipts, partial-failure accounting and no-repeat verified mutation semantics.
6. AppBuilder owns the fail-closed `commercial-glazing-contract-compatibility-gate-v1`.
7. Human Estimator launcher now supports an explicit neutral runtime migration path; legacy Bid Composer hosting stays default until parity gates pass.
8. CE MCP, Revu, HE, Data Extraction, Bid Composer and Proposal Generator declare canonical contract consumption and `BLOCKED_CONTRACT_DRIFT` behavior.

## Agent lane

Agent is an operator, not commercial authority.

Permission levels:
1. `READ` — query spoke MCPs and evidence.
2. `PROPOSE` — classify, group assemblies, identify omissions, generate review questions.
3. `EXECUTE_CONTROLLED` — Revu markup only with explicit project/run authorization.
4. `WRITE_REVIEWED` — only through owning app after human disposition.
5. `COMMERCIAL_RELEASE` — human-only in v1.

## Shared capability lanes

- Project context/routing.
- Drawing relationship joins: plan ↔ elevation ↔ schedule ↔ detail ↔ addenda.
- Assembly grouping.
- Omission/coverage analysis.
- Revision identity/change detection.
- Historical bid-sheet intelligence.
- Scope provenance ledger/envelope.
- Regression/evaluation harness; Beacon Hill / CG-2036-26 is the preferred first real-project anchor once its plans are available on the host.

## Live verification gates

1. Governance canonical contract registry resolves and all consumer declarations pass compatibility gate.
2. CE real DB schema + candidate generation smoke, including `observationId`/`scopeIdentity` behavior.
3. CE MCP candidate exposure smoke.
4. Revu fixture markup/read-back with lifecycle/provenance preservation.
5. Human Estimator review packet against Revu evidence.
6. Neutral HE runtime reaches tool parity before changing the default away from legacy host.
7. Historical bid-sheet + matching-plan pilot.
8. Agent orchestration dry-run across read-only spokes with resumable run-state receipt.
9. Beacon Hill single-sheet reviewed truth set.
10. Remodel routing proof to Bid Composer.
11. New-construction routing proof to Proposal Generator.
12. Explicit governance approval before any production/autonomous commercial write.

## Hard boundaries

Cross-Agent stores coordination only. Governance owns policy and canonical cross-spoke contracts. AppBuilder executes orchestration adapters only. CE discovers; Revu marks/proves; Human Estimator reviews; downstream apps own estimator disposition and proposal application. No agent may silently approve scope, price, graph facts, or proposal issuance.
