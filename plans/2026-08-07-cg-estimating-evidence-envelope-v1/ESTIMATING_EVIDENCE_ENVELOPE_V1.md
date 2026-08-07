# Estimating evidence envelope v1

**Work package:** `revu-estimating-spine-and-master-graph-integration-v1`  
**Wave:** `PHASE_A_TRUTH_AUTHORITY_CONTRACTS_V1`  
**Coordination owner:** CapitalGlass-Cross-Agent (adoption plan / milestone pointers only)  
**Constitutional schema owner:** `CG-Platform-Governance-MCP`  
**Producer adapter (Phase B):** CapitalGlassRevu  
**Gate:** `ESTIMATING_EVIDENCE_ENVELOPE_AUTHORITY_PASS` (Phase 2)

## Purpose

Unify three existing package shapes into one cross-app envelope so Revu, Computer Estimator, Human Estimator, and Bid Composer can exchange estimating evidence without parallel identity or commercial write paths.

## Package mapping

| Envelope field | Source schema | Owner system | Phase A |
| --- | --- | --- | --- |
| `packages.parserEvidencePackage` | `parserEvidencePackage@1.0.0` | Computer Estimator | Contract pointer only |
| `packages.revuApprovedScopePackage` | `revu-approved-scope-package-v1` | CapitalGlassRevu | Schema exists in Revu repo |
| `packages.humanEstimatorScopeEvaluation` | `human-estimator-scope-evaluation-v1` | CG-Human-Estimator-MCP | Contract pointer only |
| `documentIdentity.documentId` | `project_documents.id` | CapitalGlass-Documents | Required on all envelopes |
| `disposition.commercialWriteAuthorized` | — | CapitalGlass-BidComposer | Always `false` from Revu |

## Provenance chain (required order)

1. `detection` — Computer Estimator (optional when manual markup only)
2. `parser_evidence` — immutable parser snapshot when present
3. `revu_markup` — Revu MCP / official host receipt
4. `human_review` — Human Estimator disposition (mandatory before BC commercial apply)
5. `scope_candidate` — envelope ready for BC scope review import
6. `commercial_disposition` — Bid Composer only; never written by Revu

## Forbidden

- Revu writing `bid_*` commercial tables
- Filename or Revu session path as `documentId`
- Skipping `human_review` for production scope export
- Activating Master Graph node IDs (`cg:{nodeType}:...`) without ADR vs `namespace:slug`

## Canonical schema (constitutional authority)

**Do not treat the copy in this directory as schema authority.**

| Field | Value |
| --- | --- |
| Owner | `CG-Platform-Governance-MCP` |
| Path | `schemas/cg-estimating-evidence-envelope-v1.schema.json` |
| Authority lock | `docs/governance/estimating-evidence-envelope-authority-v1.json` |
| Version | `1.0.0` |

The file `cg-estimating-evidence-envelope-v1.schema.json` in this directory is a **Phase A design draft** retained for milestone history. Phase 2 promoted the canonical schema to Governance.

Phase 2 closeout: `CG-Platform-Governance-MCP/artifacts/agent-runs/revu-estimating-spine-and-master-graph-integration-v1/phase-2-evidence-envelope-authority-closeout.json`

## Revu local pointers

- `CapitalGlassRevu/contracts/bid-composer-capability-boundary.json`
- `CapitalGlassRevu/contracts/revu-document-identity-open-path.json`
- `CapitalGlassRevu/schemas/revu-approved-scope-package-v1.schema.json`

## Phase B authorization

Producer adapters may emit this envelope only after:

- `ESTIMATING_EVIDENCE_ENVELOPE_CONTRACT_PASS`
- `REVU_DOCUMENT_IDENTITY_OPEN_PATH_CONTRACT_PASS`
- Controlled pilot receipt (Rosewood or successor)
