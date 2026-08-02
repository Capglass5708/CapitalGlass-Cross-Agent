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
| Current focus | Active ledger drain Phases 0–3 complete; L: BY-KIND slices live; live ledger trimmed; next WP `north-star-compounding-vertical-pilot-v1` or `appbuilder-closeout-gate-ci-zmaster-hardening-v1` |
| Primary authority repo | CG-Platform-Governance-MCP |
| Execution repo | CG-AppBuilder-MCP |
| Coordination repo | CapitalGlass-Cross-Agent |
| Project index | `work-progress/projects/INDEX.md` |

## Current saved work

| Repo | Commit | Status | Notes |
| --- | --- | --- | --- |
| CG-AppBuilder-MCP | `348b2133` | Merged | Active-ledger export/lint (PR #262) |
| Data-Extraction | `e6311b5` | Pushed | L: active-work publisher (Phase 1B) |
| CG-Platform-Governance-MCP | `c40eb48` | Pushed | Drained authority rules (Phase 2.2) |
| CapitalGlass-Cross-Agent | (this commit) | Pending push | Trimmed live ledger activation |

Full pre-drain commit table: `archive/2026-08/ledger-snapshots/phase-0-pre-drain/ACTIVE_WORK-2026-08-02-pre-drain.md`

## Operating rules (pointers)

| Rule | Authority |
| --- | --- |
| Governance decides what counts; AppBuilder executes | `CG-Platform-Governance-MCP/docs/platform/ACTIVE_LEDGER_RELEASE_AUTHORITY_CONTRACT.md` |
| Drained authority rules | `CG-Platform-Governance-MCP/docs/platform/ACTIVE_LEDGER_AUTHORITY_RULES.md` |
| Bible-dependent work | `npm run bible:authority:gate` from CG-AppBuilder-MCP |
| GPU host authority | `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md` § GPU Host Authority |

## Open next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | Restart MCP for Governance compounding tools | Cursor / local MCP | Pending |
| 2 | Clear `CG_AUTO_V32_*` env vars; rerun `closeout:gate` locally | CG-AppBuilder-MCP | Pending |
| 3 | Run `north-star-compounding-vertical-pilot-v1` | Governance + AppBuilder | Recommended |
| 4 | Open/fix `appbuilder-closeout-gate-ci-zmaster-hardening-v1` (PR closeout vs Z-master CI) | CG-AppBuilder-MCP | Recommended |
| 5 | After ledger updates: `npm run agent-research-library:publish-active-work-ledger` | Data-Extraction | Recurring |

**Default agent preflight (machine-readable):** `L:/Capital-Glass-Intelligence-Hub/00-master-index/BY-KIND/active-work-open-actions.json` and `active-work-blockers.json` only — not full ledger.

## Progress log (last 3 entries)

### 2026-08-02 CT — active ledger drain activated (trimmed live ledger)

| Field | Value |
| --- | --- |
| Work package | `active-ledger-drain-and-intelligence-hub-sync-v1` |
| Status | Phase 3 trim activated |
| Repos | Cross-Agent, CG-AppBuilder-MCP, Data-Extraction, CG-Platform-Governance-MCP |

Full pre-drain snapshot preserved at `archive/2026-08/ledger-snapshots/phase-0-pre-drain/`.

Machine-readable slices are live under `L:\Capital-Glass-Intelligence-Hub\00-master-index\BY-KIND\`.

Governance authority rules are on main at `c40eb48`.

Data-Extraction publisher is on main at `e6311b5`.

AppBuilder exporter/lint is merged from PR #262 (`348b2133`).

Project file: `work-progress/projects/2026-08-02_active-ledger-drain-and-intelligence-hub-sync-v1.md`

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

Older entries (14+): archived at `archive/2026-08/ledger-snapshots/phase-0-pre-drain/ACTIVE_WORK-2026-08-02-pre-drain.md`
