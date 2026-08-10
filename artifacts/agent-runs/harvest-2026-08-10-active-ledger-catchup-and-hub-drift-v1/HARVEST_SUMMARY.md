# Harvest summary — derived view

**Authority:** `harvest-manifest-v1.json` (`063617f7dae9…`)
**Work package:** `harvest-2026-08-10-active-ledger-catchup-and-hub-drift-v1`
**Mission class:** `chat-thread-closeout-autopsy-harvest-v1`
**Verdict:** `HARVEST_VALIDATED`
**Retrieval:** `INDEX_HIT`

> This file is a generated view. Do not edit independently — update the manifest.

## Packets harvested

| Packet | State | Verdict | Owner |
| --- | --- | --- | --- |
| `active-ledger-catchup-2026-08-10` | COMPLETE | LEDGER_CURRENT | CapitalGlass-Cross-Agent |
| `ledger-staleness-gate-v1` | COMPLETE | ADOPTED | CG-AppBuilder-MCP |
| `index-only-ledger-updates-v1` | RESOLVED | ROOT_CAUSE_IDENTIFIED | CapitalGlass-Cross-Agent |
| `hub-active-work-slice-drift-v1` | RESOLVED | REPAIRED | Data-Extraction |
| `harvest-git-durability-v1-2-context` | COMPLETE | RECORDED | CapitalGlass-Cross-Agent |
| `upstream-harvest-references-v1` | COMPLETE | REFERENCED | CapitalGlass-Cross-Agent |

## Global doNotAdvance

- Re-harvest Rosewood or EG-01 product outcomes — reference upstream harvests only
- Claim Supabase IN_SYNC without drift-probe proof
- Use stale L: Hub slices as authority over Git
- index:publish from Cursor without operator authorization when policy requires operator

## Projection sync

Status: `pending` (hub: `not-run`)

