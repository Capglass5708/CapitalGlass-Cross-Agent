# Gated Wave Lifecycle v1 — Concept to Completion

**Companion to:** [chat-thread-system-advancement-harvest-chatgpt-v1.md](./chat-thread-system-advancement-harvest-chatgpt-v1.md)  
**Wave state schema:** `scripts/harvest/schema/gated-wave-state-v1.schema.json`  
**Runtime owner:** Cursor (Gated Wave Controller — Phase 6 design; not ChatGPT)

## Target lifecycle

```text
CONCEPT → DISCOVERED → DEFINED → ARCHITECTED → PLANNED → SLICED
  → IMPLEMENTED → INTEGRATED → VALIDATED → APPROVED → DEPLOYED
  → VERIFIED → PUBLISHED → HARVESTED → CLOSED
```

Each transition requires evidence, ownership, artifacts, acceptance criteria, and a **machine-readable verdict**. ChatGPT may **propose** improvements to this model; only Cursor/operator may claim gate passes.

## Wave phases

| Wave | Phase | Example artifacts | Gate verdict (Cursor-verified only) |
| --- | --- | --- | --- |
| 0 | Concept intake | `concept-brief.md` | `CONCEPT_CAPTURED` |
| 1 | Discovery | `discovery-report.md`, `authority-map.json`, `dependency-map.json`, `duplication-preflight.json` | `DISCOVERY_PASS` |
| 2 | Product/workflow | `workflow-design.md`, `user-stories.json`, `acceptance-outcomes.json` | `WORKFLOW_DEFINITION_PASS` |
| 3 | Architecture | ADRs, `target-architecture.md`, `data-contracts/`, `migration-plan.md` | `ARCHITECTURE_APPROVED` |
| 4 | Planning/slicing | `wave-plan.md`, `slice-manifest.json`, `gate-manifest.json` | `IMPLEMENTATION_PLAN_APPROVED` |
| 5 | Implementation | per-slice receipts, branch/SHA | `SLICE_IMPLEMENTED` / `SLICE_BLOCKED` / `SLICE_FAILED` / `SLICE_OPERATOR_ACTION_REQUIRED` |
| 6 | Integration | `integration-matrix.json`, `contract-validation.json`, `cross-repo-receipt.json` | `INTEGRATION_PASS` |
| 7 | Validation | `validation-report.json`, `test-receipts/`, `known-risk-register.json` | `VALIDATION_PASS` |
| 8 | Operator approval | approval summary tied to wave state | `OPERATOR_APPROVED` / `OPERATOR_REJECTED` / `OPERATOR_CHANGES_REQUIRED` |
| 9 | Deployment | deployment/migration receipts | `DEPLOYMENT_PASS` / `DEPLOYMENT_PARTIAL` / `DEPLOYMENT_FAILED` / `ROLLBACK_PASS` |
| 10 | Production verification | prod-context proofs | `PRODUCTION_VERIFICATION_PASS` |
| 11 | Publication | hub/cache/supabase/git sync receipts | `PUBLICATION_PASS` |
| 12 | Harvest/advancement | `wave-autopsy.md`, `system-advancement-findings-source.md`, seeds | `SYSTEM_ADVANCEMENT_DRAFT_READY` |
| 13 | Closeout | final receipt; deferred work separated | `WAVE_CLOSED` |

## Hard rules

- `DISCOVERY_PASS` does **not** authorize implementation.
- Material architecture questions unresolved → no Wave 5.
- `DEPLOYMENT_PASS` ≠ `PRODUCTION_VERIFICATION_PASS`.
- Publication follows validation; never inferred from ChatGPT drafts.
- `WAVE_CLOSED` requires traceable concept → delivered outcome.

## Context tiers (token reduction)

| Tier | When | Contents |
| --- | --- | --- |
| T0 | Routine next step | objective, phase, gate, blocker, next action, forbidden reopenings |
| T1 | Slice execution | current slice, deps, tests, acceptance |
| T2 | Architecture decisions | authority map, contracts, ADR pointers |
| T3 | Full wave history | autopsy, dispute, major redesign, closeout only |

## Concept traceability chain

```text
Concept → outcome → workflow req → arch decision → slice → change → test
  → validation → production behavior → delivered outcome
```

Advancement harvest should flag gaps: requirements without implementation, tests that do not prove outcome, deferred requirements treated as complete.

## Slice manifest fields (Wave 4)

```text
sliceId, goal, scope, nonGoals, repositories, owner, dependencies,
inputs, implementationSteps, tests, acceptanceCriteria, rollback,
expectedArtifacts, nextGate
```

## Gated Wave Controller (future)

Tracks wave identity, phases, gates, slices, repos/branches/commits, hosts, owners, approvals, artifacts, receipts, resume point, publication, closeout. Resumes from last verified checkpoint; prevents silent reopen of completed phases. See plan Phase 6 — **propose via `IMP-###` / `ADV-###` only in ChatGPT lane**.
