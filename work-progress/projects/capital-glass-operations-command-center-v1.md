# capital-glass-operations-command-center-v1

**Owner repo:** CapitalGlass-CalendarDashBoard  
**Harvest:** `harvest-2026-08-17-capital-glass-operations-command-center-v1`  
**Bridge mission:** `occ-sdlc-harvest-bridge-v1`  
**State:** CODE_COMPLETE (WARN — browser + merge external)

## Capabilities (verified)

- Needs Attention Today exception surface
- Three-week look-ahead (this week / next week / week 3)
- Six-week procurement horizon (ON_TRACK / ORDER_NOW / AT_RISK / LATE / UNKNOWN_LEAD_TIME)
- Project risk with why-text
- Drawer provenance lineage and source deep links
- Idempotent PO pairing and latest-wins change propagation

## Hub seeds

| Seed | Topic |
| --- | --- |
| IH-OCC-LATEST-WINS-PO-001 | Latest-wins PO pairing |
| IH-OCC-UNCONFIRMED-DOC-DATES-001 | No silent OCR date promotion |
| IH-OCC-PROCUREMENT-RISK-001 | UNKNOWN_LEAD_TIME policy |
| IH-OCC-HARVEST-CLOSEOUT-001 | Wave 15 empty harvest root cause |

## Remaining gates

- PR #26 merge (operator authorization)
- Authenticated browser proof after deploy (`occ-live-browser-proof-v1`)
- Do **not** claim `CAPITAL_GLASS_OPERATIONS_COMMAND_CENTER_V1_OPERATIONALLY_PROVEN`

## Evidence

- `/home/wesle/repos/.worktrees/CapitalGlass-CalendarDashBoard/capital-glass-operations-command-center-v1/artifacts/agent-runs/capital-glass-operations-command-center-v1/closeout-manifest.json`
- `/home/wesle/repos/.worktrees/CapitalGlass-CalendarDashBoard/capital-glass-operations-command-center-v1/artifacts/current/CALENDAR_OPERATIONS_COMMAND_CENTER_V1_CODE_COMPLETE.json`
- PR: https://github.com/Capglass5708/CapitalGlass-CalendarDashBoard/pull/26
