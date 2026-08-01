# Active Work Progress

This is the shared editable working ledger for Wesley, ChatGPT, Cursor, and other agents.

Purpose: keep the current work, progress, decisions, blockers, saved commits, and next actions in one durable place.

## Rules

- This file tracks work; it does not contain implementation code.
- Do not store secrets, credentials, database dumps, Bible copies, or app source here.
- Link to owning repos, commits, PRs, runbooks, and verification files instead of copying their contents.
- Update this file whenever meaningful work starts, changes direction, gets blocked, is committed, or is pushed.
- Newest active status goes near the top. Historical detail can move to dated entries below.

## Current active status

| Field | Value |
| --- | --- |
| Last updated | 2026-08-01 |
| Current focus | Governance/North Star capture authority and Bible authority gate handoff |
| Primary authority repo | CG-Platform-Governance-MCP |
| Execution/support repo | CG-AppBuilder-MCP |
| Coordination repo | CapitalGlass-Cross-Agent |

## Current saved work

| Repo | Commit | Status | Notes |
| --- | --- | --- | --- |
| CapitalGlass-Cross-Agent | `76b34fe` | Pushed | Application Bible sync runbook updated |
| CG-AppBuilder-MCP | `dc32d991` | Pushed | `bible:authority:gate` added |

## Current operating rules

### Bible-dependent work

Before Bible-dependent work, run from CG-AppBuilder-MCP:

```powershell
cd C:\Developer\repos\CG-AppBuilder-MCP
doppler run -p cg-mcp -c dev -- npm run bible:authority:gate
```

Result handling:

| Result | Action |
| --- | --- |
| `PASS` | Proceed |
| `PASS_WITH_WARNINGS` | Proceed and note warnings |
| `BLOCKED` | Stop and fix failing layer |

### North Star / Governance work

Permanent authority rule:

> Governance decides what must be captured and whether completed work counts. AppBuilder may produce receipts, but AppBuilder is not the source of truth for the protocol.

Target direction:

- Governance MCP owns North Star Protocol, capture contract, closeout requirements, compounding proof schema, and validation.
- AppBuilder remains an execution adapter for writing/syncing/indexing/cache operations.
- Completed material work should not count unless Governance validates that it was captured, stored, indexed, and made reusable.

## Open next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | Define `north-star-compounding-proof-v1` schema and validation in Governance MCP | CG-Platform-Governance-MCP | Not started here |
| 2 | Map AppBuilder policy files to Governance authority vs execution adapter | CG-AppBuilder-MCP / CG-Platform-Governance-MCP | Drafted in chat |
| 3 | Update Governance ownership/migration docs after compounding proof design | CG-Platform-Governance-MCP | Pending |
| 4 | Keep this ledger updated as work proceeds | CapitalGlass-Cross-Agent | Active |

## Progress log

### 2026-08-01

- Bible mirror and index pipeline reported complete:
  - Z: mirror mounted and `23/23 PASS`.
  - `bible-db:index-suite --live` indexed 23 apps / 541 files.
  - `bible-db:link-cache` refreshed 60 links.
  - `bible:authority:gate` returned `PASS_WITH_WARNINGS` with exit 0.
- Pushed coordination/runbook update:
  - CapitalGlass-Cross-Agent commit `76b34fe`.
- Pushed AppBuilder gate update:
  - CG-AppBuilder-MCP commit `dc32d991`.
- Decided permanent structure:
  - Governance MCP is authority.
  - AppBuilder is execution adapter.
  - Synology/Supabase/cache are storage and reuse layers, not protocol authority.
