# Project: active-ledger-drain-and-intelligence-hub-sync-v1

## Summary

Drain accumulated knowledge from `work-progress/ACTIVE_WORK.md` into durable owners — L: Intelligence Hub (machine-readable slices), Governance (constitutional authority), AppBuilder (export/lint), and Cross-Agent archive — then reset the live ledger surface with a recurring sync cadence.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | `active-ledger-drain-and-intelligence-hub-sync-v1` |
| Work package | `active-ledger-drain-and-intelligence-hub-sync-v1` |
| Date opened | 2026-08-02 |
| Source | Cursor |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | CG-Platform-Governance-MCP |
| Execution repo | CG-AppBuilder-MCP |
| L: publish owner | Data-Extraction |
| Status | **Phase 0 PASS** — awaiting Governance approval |

## Phase 0 gate — PASS (2026-08-03)

| Criterion | Result |
| --- | --- |
| Entries classified | 100% (27/27) |
| Pending project files | 0 |
| Unresolved destinations | 0 |
| Pre-drain snapshot | Verified |
| Secrets detected | 0 |
| Current ledger modified | **NO** |
| Governance contract | Ready for approval |

Evidence: `archive/2026-08/ledger-snapshots/phase-0-pre-drain/`

## Governance contract (approval required)

`CG-Platform-Governance-MCP/docs/platform/ACTIVE_LEDGER_RELEASE_AUTHORITY_CONTRACT.md`

**Status:** READY FOR APPROVAL — blocks Phase 1 AppBuilder implementation

## ROI (proposed trim — not activated)

| Metric | Before | Proposed | Target |
| --- | ---: | ---: | --- |
| Lines | 419 | 80 | Under 150 |
| Tokens | ~5,968 | ~1,169 | Under 1,600 |
| Reduction | — | 80.4% | ≥73% |
| Live log entries | 16 | 3 | ≤3 |

Proposed file: `archive/2026-08/ledger-snapshots/phase-0-pre-drain/ACTIVE_WORK.proposed-trimmed.md`

## Next actions

| Priority | Action | Owner | Status |
| --- | --- | --- | --- |
| 1 | **Approve Governance contract** | Operator | Pending |
| 2 | Phase 1 export/lint in AppBuilder worktree | CG-AppBuilder-MCP | Blocked |
| 3 | Extend Data-Extraction master-index sync | Data-Extraction | Blocked |
| 4 | Verify L: slices; then activate trimmed ledger | Cross-Agent | Blocked |
| 5 | Auto v3.2 material closeout | Multi-repo | Blocked |

## Update log

### 2026-08-02 22:30 CT — Phase 0 complete

- Immutable pre-drain snapshot at `archive/2026-08/ledger-snapshots/phase-0-pre-drain/`.
- Classification manifest: 27/27 items mapped.
- Resolved pending ledger updates: docling, unstructured, revu-opening project files.
- Governance authority contract copied to Governance repo — READY FOR APPROVAL.
- Proposed trimmed ledger (80 lines) — **not activated**.
- `ACTIVE_WORK.md` hash unchanged: `5e5e59d7...`.

### 2026-08-02 22:30 CT — work package drafted

- Created plan at `plans/2026-08-02-active-ledger-drain-and-intelligence-hub-sync-v1/`.
