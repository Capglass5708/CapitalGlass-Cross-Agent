# Active Work Progress

This is the shared editable valuable-work ledger for Wesley, ChatGPT, Cursor, and other agents.

Purpose: keep current work, project IDs, status, blockers, evidence, commits, verification, and next actions in one durable place.

**Operating rules:** `runbooks/AGENT_LEDGER_UPDATE_RUNBOOK.md`  
**Entry format:** `work-progress/projects/README.md`  
**Canonical knowledge map:** `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md`

## Current active status

| Field | Value |
| --- | --- |
| Last updated | 2026-08-02 |
| Current focus | Cross-agent registry + active-ledger drain **closed out**; structured ledger projection Phase 0 schema drafted; merge AppBuilder PR #264 (ledgerOnly compact v2) |
| Primary authority repo | CG-Platform-Governance-MCP |
| Execution repo | CG-AppBuilder-MCP |
| Coordination repo | CapitalGlass-Cross-Agent |
| Project index | `work-progress/projects/INDEX.md` |

## Current saved work

| Repo | Commit | Status | Notes |
| --- | --- | --- | --- |
| CG-AppBuilder-MCP | `eeaae5ec` | Merged | Active-ledger compact preflight (PR #263); closeout evidence `cd4a9005` |
| CG-AppBuilder-MCP | PR #264 | Open | ledgerOnly compact v2 for `capital-glass-cross-agent` |
| CG-Platform-Governance-MCP | `dc49d9c` | Pushed | Structured ledger schema contract (Phase 0 DRAFT) |
| CapitalGlass-Cross-Agent | `dc4d8d2` | Pushed | Closeout docs + investigation plan |
| Data-Extraction | `e6311b5` | Pushed | L: active-work publisher (Phase 1B) |

Full pre-drain commit table: `archive/2026-08/ledger-snapshots/phase-0-pre-drain/ACTIVE_WORK-2026-08-02-pre-drain.md`

## Operating rules (pointers)

| Rule | Authority |
| --- | --- |
| Governance decides what counts; AppBuilder executes | `CG-Platform-Governance-MCP/docs/platform/ACTIVE_LEDGER_RELEASE_AUTHORITY_CONTRACT.md` |
| Drained authority rules | `CG-Platform-Governance-MCP/docs/platform/ACTIVE_LEDGER_AUTHORITY_RULES.md` |
| Structured ledger schema (DRAFT) | `CG-Platform-Governance-MCP/docs/platform/CROSS_AGENT_STRUCTURED_LEDGER_CONTRACT.md` |
| Bible-dependent work | `npm run bible:authority:gate` from CG-AppBuilder-MCP |
| GPU host authority | `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md` § GPU Host Authority |

## Open next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | Merge AppBuilder PR #264 (ledgerOnly compact v2) | CG-AppBuilder-MCP | Pending CI / merge |
| 2 | Approve Governance structured ledger schema (`dc49d9c`) | CG-Platform-Governance-MCP | Pending operator |
| 3 | Begin `cross-agent-structured-ledger-projection-v1` Phase 1 (AppBuilder ingestion) | CG-AppBuilder-MCP | Blocked on schema approval |
| 4 | Restart MCP for Governance compounding tools | Cursor / local MCP | Pending |
| 5 | After ledger updates: `npm run agent-research-library:publish-active-work-ledger` | Data-Extraction | Recurring |

**Default agent preflight (machine-readable):** `L:/Capital-Glass-Intelligence-Hub/00-master-index/BY-KIND/active-work-open-actions.json` and `active-work-blockers.json` only — not full ledger.

## Progress log (last 3 entries)

### 2026-08-02 CT — cross-agent registry + active-ledger drain closeout

| Field | Value |
| --- | --- |
| Work packages | `cross-agent-registry-onboard-v1`, `active-ledger-drain-and-intelligence-hub-sync-v1` |
| Status | **Closeout PASS** — governance authorized, corpus synced, lifecycle `CLOSEOUT_AUTHORIZED` |
| Evidence | `CG-AppBuilder-MCP/artifacts/agent-runs/active-ledger-drain-and-intelligence-hub-sync-v1/session-closeout-v3.2.json` |
| Next WP | `cross-agent-structured-ledger-projection-v1` (Governance schema `dc49d9c` DRAFT) |

Registry onboard: AppBuilder `38a162da` / `48a1bff1`. Structured projection schema opened at Governance `dc49d9c`.

### 2026-08-02 CT — active ledger drain activated (trimmed live ledger)

| Field | Value |
| --- | --- |
| Work package | `active-ledger-drain-and-intelligence-hub-sync-v1` |
| Status | Phases 0–3 complete; Phase 5 closeout recorded |
| Repos | Cross-Agent `d25b79b`, AppBuilder `348b2133`/`cd4a9005`, Data-Extraction `e6311b5`, Governance `c40eb48` |

Project file: `work-progress/projects/2026-08-02_active-ledger-drain-and-intelligence-hub-sync-v1.md`

### 2026-08-02 21:02 CT — north-star-compounding-proof-v1 pushed with evidence

| Field | Value |
| --- | --- |
| Work package | `north-star-compounding-proof-v1` |
| Status | Pushed |
| Next action | Restart MCP; begin `north-star-compounding-vertical-pilot-v1` |

Older entries: `archive/2026-08/ledger-snapshots/phase-0-pre-drain/ACTIVE_WORK-2026-08-02-pre-drain.md`
