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
| Status | **Phases 0–3 complete** — Phase 5 material closeout pending |

## Phase gates

| Phase | Scope | Result |
| --- | --- | --- |
| 0 | Classify, snapshot, reconcile project files | **PASS** |
| 1 | Export/lint (AppBuilder) | **PASS** — `348b2133` merged (PR #262) |
| 1B | L: BY-KIND publish (Data-Extraction) | **PASS** — `e6311b5` |
| 2 | Governance authority rules | **PASS** — `c40eb48` |
| 3 | Archive + activate trimmed ledger | **PASS** — Cross-Agent `d25b79b` pushed |
| 4 | Recurring sync, lint, closeout write-back | Operational — `agent-research-library:publish-active-work-ledger` |
| 5 | Material closeout + observer verification | **Pending** |

Evidence: `archive/2026-08/ledger-snapshots/phase-0-pre-drain/`

## Governance contract

`CG-Platform-Governance-MCP/docs/platform/ACTIVE_LEDGER_RELEASE_AUTHORITY_CONTRACT.md`

**Status:** APPROVED

## ROI (activated)

| Metric | Before | After | Target |
| --- | ---: | ---: | --- |
| Lines | 419 | ~93 | Under 150 |
| Live log entries | 13 (authoritative) | 3 | ≤3 |
| Default preflight | Full Markdown | Compact JSON slices | open-actions + blockers only |

Archive: `archive/2026-08/ledger-snapshots/phase-0-pre-drain/`

## Next actions

| Priority | Action | Owner | Status |
| --- | --- | --- | --- |
| 1 | Phase 5 material closeout (preflight + session closeout + `closeout:gate`) | CG-AppBuilder-MCP | In progress |
| 2 | Restart MCP for Governance compounding tools | Operator | Pending |
| 3 | Begin `cross-agent-structured-ledger-projection-v1` | Governance + AppBuilder | Ready after closeout |
| 4 | Recurring `publish-active-work-ledger` after ledger updates | Data-Extraction | Operational |

## Update log

### 2026-08-02 CT — Phases 0–3 complete; trimmed ledger activated

- Cross-Agent `d25b79b` pushed — live ledger trimmed to current status + 3 log entries.
- AppBuilder export/lint merged (`348b2133`); Data-Extraction L: publish (`e6311b5`).
- Governance authority rules pushed (`c40eb48`).
- Phase 5 material closeout remains.

### 2026-08-02 22:30 CT — Phase 0 complete

- Immutable pre-drain snapshot at `archive/2026-08/ledger-snapshots/phase-0-pre-drain/`.
- Classification manifest: 27/27 items mapped.
