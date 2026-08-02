# Active Work Progress

This is the shared editable valuable-work ledger for Wesley, ChatGPT, Cursor, and other agents.

Purpose: keep current work, project IDs, status, blockers, evidence, commits, verification, and next actions in one durable place.

**Operating rules:** `runbooks/AGENT_LEDGER_UPDATE_RUNBOOK.md`  
**Entry format:** `work-progress/projects/README.md`  
**Canonical knowledge map:** `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md`

> **PROPOSED TRIM — NOT ACTIVE.** Activate only after Phase 1 JSON exports verify zero data loss. Pre-drain snapshot: `archive/2026-08/ledger-snapshots/phase-0-pre-drain/ACTIVE_WORK-2026-08-02-pre-drain.md`

## Current active status

| Field | Value |
| --- | --- |
| Last updated | 2026-08-02 |
| Current focus | North Star compounding proof pushed; Cross-Agent organized; drain WP `active-ledger-drain-and-intelligence-hub-sync-v1` Phase 0 complete; next WP `north-star-compounding-vertical-pilot-v1` after operator blockers |
| Primary authority repo | CG-Platform-Governance-MCP |
| Execution repo | CG-AppBuilder-MCP |
| Coordination repo | CapitalGlass-Cross-Agent |
| Project index | `work-progress/projects/INDEX.md` |

## Current saved work

| Repo | Commit | Status | Notes |
| --- | --- | --- | --- |
| CG-Platform-Governance-MCP | `8ebcdf4` | Pushed | Evidence receipts for `north-star-compounding-proof-v1` |
| CG-AppBuilder-MCP | `3772d491` | Pushed | Evidence receipts + gate fixtures |
| CapitalGlass-Cross-Agent | `506a229` | Pushed | Master work document + canonical knowledge map |

Full commit table preserved in pre-drain archive.

## Operating rules (pointers)

| Rule | Authority |
| --- | --- |
| Governance decides what counts; AppBuilder executes | `CG-Platform-Governance-MCP/docs/platform/ACTIVE_LEDGER_RELEASE_AUTHORITY_CONTRACT.md` |
| Bible-dependent work | `npm run bible:authority:gate` from CG-AppBuilder-MCP |
| GPU host authority | `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md` § GPU Host Authority |

## Open next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | Approve Governance `ACTIVE_LEDGER_RELEASE_AUTHORITY_CONTRACT.md` | CG-Platform-Governance-MCP / operator | Pending |
| 2 | Restart MCP for Governance compounding tools | Cursor / local MCP | Pending |
| 3 | Clear `CG_AUTO_V32_*` env vars; rerun `closeout:gate` | CG-AppBuilder-MCP | Pending |
| 4 | Run `north-star-compounding-vertical-pilot-v1` | Governance + AppBuilder | Recommended |
| 5 | Phase 1 export/lint after Governance approval | CG-AppBuilder-MCP | Blocked on approval |

Machine-readable preflight (Phase 1+): `L:/00-master-index/BY-KIND/active-work-open-actions.json` and `active-work-blockers.json` only — not full ledger.

## Progress log (last 3 entries)

### 2026-08-02 21:02 CT — north-star-compounding-proof-v1 pushed with evidence

| Field | Value |
| --- | --- |
| Work package | `north-star-compounding-proof-v1` |
| Status | Pushed |
| Repos | Governance, AppBuilder, Cross-Agent |
| Next action | Restart MCP; clear Auto v3.2 env; begin `north-star-compounding-vertical-pilot-v1` |

Project file: `work-progress/projects/2026-08-01_north-star-compounding-proof-v1.md`

### 2026-08-02 CT — Cross-Agent repo cleanup and folder organization

- Folder READMEs, repo map, decisions, runbooks, handoff, verification structure added.
- Read order updated to include `CANONICAL_KNOWLEDGE_LOCATIONS.md`.

### 2026-08-02 CT — cross-agent master work L: ingest

| Field | Value |
| --- | --- |
| Work package | `cross-agent-master-work-ingest-v1` |
| Status | Published to L: |
| L: path | `L:/Capital-Glass-Intelligence-Hub/00-master-index/cross-agent-master-work/` |

Older entries (10): archived at `archive/2026-08/ledger-snapshots/phase-0-pre-drain/ACTIVE_WORK-2026-08-02-pre-drain.md`
