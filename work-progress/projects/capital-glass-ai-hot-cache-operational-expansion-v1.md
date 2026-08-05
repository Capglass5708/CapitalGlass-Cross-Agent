# capital-glass-ai-hot-cache-operational-expansion-v1

| Field | Value |
| --- | --- |
| Work package | `capital-glass-ai-hot-cache-operational-expansion-v1` |
| Owner repo | CG-AppBuilder-MCP |
| Mission class | fix |
| Verdict | OPERATIONAL (`ACTIVE_LEDGER_HOT_CACHE_OPERATIONAL`) |
| Target milestone | `ACTIVE_LEDGER_HOT_CACHE_OPERATIONAL` |

## Objective

Wave 1 of hot-cache operational expansion: fix consumption-gates L dry-run isolation, ship Active Ledger compiler + hot-cache publication, and Closeout Index from closed/superseded ledger records.

## Scope (in)

- `run-hot-cache-consumption-gates.test.mjs` — isolated `CG_INTELLIGENCE_HUB_ROOT` for L dry-run probe
- Active Ledger compiler (`active-ledger`) with required v1 gates
- Closeout Index compiler (`closeout-index`) from closed/superseded sources
- Cross-Agent dataset registry + manifests

## Boundaries (out)

- Real bulk pull: **disabled**
- Supabase projection: **deferred**
- Project/business datasets: **deferred**
- Unrelated AppBuilder preflight repair: **excluded**

## Required gates

- `ACTIVE_LEDGER_MANIFEST_PASS`
- `ACTIVE_LEDGER_COMPILE_PASS`
- `ACTIVE_LEDGER_COMPACT_PASS`
- `ACTIVE_LEDGER_HOT_CACHE_PUBLISH_PASS`
- `ACTIVE_LEDGER_SCOUT_ROUTING_PASS`
- `ACTIVE_LEDGER_NO_RAW_SCAN_PASS`

## Next actions

1. Run `npm run test:active-ledger-hot-cache-gates` and `npm run test:hot-cache-consumption-gates`
2. `npm run active-ledger:compile-index -- --json` and `active-ledger:publish-hot-cache`
3. `npm run closeout-index:compile-index -- --json`
