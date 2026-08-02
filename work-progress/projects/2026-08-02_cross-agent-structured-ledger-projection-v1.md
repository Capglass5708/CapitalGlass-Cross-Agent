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
| Status | **MILESTONE PASS** — Phases 0–3 operational; drift `IN_SYNC` |

## Prerequisite

`cross-agent-registry-onboard-v1` — **COMPLETE** (`38a162da`, Supabase id `f43b1467-7226-4eb5-9acb-7862a0a6bbd6`)

## Phase status

| Phase | Scope | Status | Evidence |
| --- | --- | --- | --- |
| 0 | Governance schema + approval | **CURRENT** | Governance `a5ce4c3`; approval `cross-agent-structured-ledger-schema-approval-v1` |
| 1 | AppBuilder ingestion adapter | **COMPLETE** | AppBuilder `63dbeb8c`; live ingest applied |
| 2 | Drift detection | **COMPLETE** | `npm run cross-agent-ledger:drift-probe` → `IN_SYNC` |
| 3 | Platform Health / preflight | **COMPLETE** | `openActions` + `blockers` only; `currentFocus` human-only |
| 4 | Governance material closeout | Optional | Compounding proof when scheduled |

## Authority artifacts

| Artifact | Location | Status |
| --- | --- | --- |
| Constitutional contract | `CG-Platform-Governance-MCP/docs/platform/CROSS_AGENT_STRUCTURED_LEDGER_CONTRACT.md` | **CURRENT** |
| Event schema | `CG-Platform-Governance-MCP/schemas/cross-agent-ledger-event-v1.schema.json` | **CURRENT** |
| Projection schema | `CG-Platform-Governance-MCP/schemas/cross-agent-ledger-projection-v1.schema.json` | **CURRENT** |
| Work package authority | `CG-Platform-Governance-MCP/docs/work-packages/cross-agent-structured-ledger-projection-v1.md` | **MILESTONE PASS** |
| Milestone receipt | `CG-AppBuilder-MCP/artifacts/agent-runs/cross-agent-structured-ledger-projection-v1/milestone-closeout-v1.json` | **PASS** |

## Operating model

- **Git (Cross-Agent)** = canonical human ledger
- **Supabase (`coordination.*`)** = derived append-only events + current projection — not constitutional authority
- **Default agent injection** = `openActions` + `blockers` only
- **`currentFocus`** = human/operator surfaces only (`whats-active-now --include-current-focus`)

## Next actions

| Priority | Action | Owner | Status |
| --- | --- | --- | --- |
| 1 | Re-run gated ingest after ledger updates | CG-AppBuilder-MCP | Recurring |
| 2 | Run drift probe before material sessions when hub/projection may be stale | CG-AppBuilder-MCP | Recurring |
| 3 | Publish L: hub slices after ledger edits | Data-Extraction | Recurring |
| 4 | Phase 4 governance material closeout (optional) | Governance + AppBuilder | When scheduled |

## Update log

### 2026-08-02 CT — Phases 1–3 milestone PASS

- AppBuilder `63dbeb8c`: ingest/apply, derived-only verify, drift probe, preflight wiring, Supabase CLI envelope fix.
- Live control-plane migration applied; projection `capital-glass-cross-agent/current` `IN_SYNC` with Git `474fa8d7`.
- Governance Phase 0 **CURRENT** since `a5ce4c3`.
- PR #264 superseded by merged #265 (`ledgerOnly` compact v2).

### 2026-08-02 CT — Phase 0 schema opened

- Governance contract + JSON schemas drafted.
- Investigation plan references updated in `plans/2026-08-01_cross-agent-supabase-hardening-investigation.md`.
- No implementation in Cross-Agent (meeting repo only).
