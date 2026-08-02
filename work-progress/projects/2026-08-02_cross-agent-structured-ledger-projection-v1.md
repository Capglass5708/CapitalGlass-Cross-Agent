# Project: cross-agent-structured-ledger-projection-v1

## Summary

Governance-owned schema contract and AppBuilder ingestion adapter for append-only Cross-Agent coordination events and a current-state Supabase projection. Git remains canonical; Supabase is a derived operational index.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | `cross-agent-structured-ledger-projection-v1` |
| Work package | `cross-agent-structured-ledger-projection-v1` |
| Date opened | 2026-08-02 |
| Authority repo | CG-Platform-Governance-MCP |
| Execution repo | CG-AppBuilder-MCP |
| Coordination repo | CapitalGlass-Cross-Agent |
| Status | **Phase 0 DRAFT** — Governance schema contract opened |

## Prerequisite

`cross-agent-registry-onboard-v1` — **COMPLETE** (`38a162da`, Supabase id `f43b1467-7226-4eb5-9acb-7862a0a6bbd6`)

## Phase 0 — Governance schema (DRAFT)

| Artifact | Location | Status |
| --- | --- | --- |
| Constitutional contract | `CG-Platform-Governance-MCP/docs/platform/CROSS_AGENT_STRUCTURED_LEDGER_CONTRACT.md` | DRAFT |
| Event schema | `CG-Platform-Governance-MCP/schemas/cross-agent-ledger-event-v1.schema.json` | DRAFT |
| Projection schema | `CG-Platform-Governance-MCP/schemas/cross-agent-ledger-projection-v1.schema.json` | DRAFT |
| Work package authority | `CG-Platform-Governance-MCP/docs/work-packages/cross-agent-structured-ledger-projection-v1.md` | DRAFT |

## Next actions

| Priority | Action | Owner | Status |
| --- | --- | --- | --- |
| 1 | Approve Governance schema contract (Phase 0) | Operator / Governance | Pending |
| 2 | Implement AppBuilder ingestion adapter | CG-AppBuilder-MCP | Blocked |
| 3 | Drift detection probe | CG-AppBuilder-MCP | Blocked |
| 4 | Platform Health integration | CG-AppBuilder-MCP | Blocked |
| 5 | Fix `ledgerOnly` compact v2 RI profile | CG-AppBuilder-MCP | In progress (`cross-agent-ledger-only-compact-v1`) |

## Update log

### 2026-08-02 CT — Phase 0 schema opened

- Governance contract + JSON schemas drafted.
- Investigation plan references updated in `plans/2026-08-01_cross-agent-supabase-hardening-investigation.md`.
- No implementation in Cross-Agent (meeting repo only).
