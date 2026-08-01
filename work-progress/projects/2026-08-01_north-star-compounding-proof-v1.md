# Project: north-star-compounding-proof-v1

## Summary

Move North Star compounding proof authority into Governance so Governance defines required capture, validates whether completed work counts, and keeps AppBuilder limited to execution/receipt production.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | north-star-compounding-proof-v1 |
| Work package | north-star-compounding-proof-v1 |
| Date opened | 2026-08-01 |
| Source | Wesley / ChatGPT / Cursor |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | CG-Platform-Governance-MCP |
| Execution repo | CG-AppBuilder-MCP |
| Status | Active / pending commits |

## Repositories involved

| Repo | Role |
| --- | --- |
| CG-Platform-Governance-MCP | Authority: North Star Protocol, capture contract, compounding proof validation |
| CG-AppBuilder-MCP | Execution adapter: shims, closeout envelope, sync/cache/harvest execution |
| CapitalGlass-Cross-Agent | Meeting repo: durable project notes and ledger |

## Authority rule

Governance decides what must be captured and whether completed work counts. AppBuilder may produce receipts, but AppBuilder is not the source of truth for the protocol.

## Delivered / reported complete

- north-star-compounding-proof-v1 schema
- Governance library
- MCP tools:
  - governance_get_compounding_capture_contract
  - governance_validate_compounding_proof
- corpus-sync policy moved
- mission-front-door policy moved
- retention closeout policy moved
- AppBuilder shims
- preflight fail-closed behavior
- closeout compounding envelope

## Evidence

- CG-AppBuilder-MCP/artifacts/agent-runs/north-star-compounding-proof-v1/session-closeout-v3.2.json
- governance-material-preflight-v1.json — PASS
- governance-closeout-decision-v1.json — AUTHORIZED
- north-star-compounding-proof-v1.json
- harvest-manifest-v1.json

## Verification

- Auto v3.2 closeout gate: AUTO_V32_CLOSEOUT_GATE_PASS
- Governance tests: 6/6 PASS
- Authority manifest: OK
- Targeted corpus-sync test: 16/16 PASS
- Full closeout:gate blocked by pre-existing BIBLE_RUNTIME_PARITY_FAILED / missing list_application_bibles tool

## Key decision

Hard compounding proof BLOCK only applies when platformTier.target=Compounding or promotionCompleted. Non-compounding material missions remain advisory.

## Blockers

- Restart MCP in Cursor so new Governance tools load.
- Commit paired Governance + AppBuilder changes after operator review.
- Fix BIBLE_RUNTIME_PARITY_FAILED separately, then rerun npm run closeout:gate.

## Next work packages

- north-star-compounding-vertical-pilot-v1 — harvest → Z: → next-mission retrieval
- platform-governance-phase4-registries-v1 — program/mission/exception registries

## Ledger links

- work-progress/ACTIVE_WORK.md
- work-progress/WORKSPACE_CONTEXT.md
