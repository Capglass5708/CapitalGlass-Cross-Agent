# Harvest summary — derived view

**Authority:** `harvest-manifest-v1.json` (`fb9d074a794e…`)
**Work package:** `harvest-2026-08-12-estimating-spine-wp2-parallel-lane-closeout-v1`
**Mission class:** `chat-thread-closeout-autopsy-harvest-v1`
**Verdict:** `HARVEST_COMPLETE`
**Retrieval:** `INDEX_HIT`

> This file is a generated view. Do not edit independently — update the manifest.

## Packets harvested

| Packet | State | Verdict | Owner |
| --- | --- | --- | --- |
| `parallel-lane-published-complete-v1` | COMPLETE | PROVEN_EFFECTIVE | CG-AppBuilder-MCP |
| `revu-gate1-baseline-repair-v1` | COMPLETE | PASS | CapitalGlassRevu |
| `wp2-logic-proof-pass-v1` | ACTIVE | PASS | CG-AppBuilder-MCP |
| `wp2-live-db-proof-pending-v1` | ACTIVE | HOLD | CG-AppBuilder-MCP |
| `smith-ranch-execution-frozen-v1` | ACTIVE | HOLD | CG-AppBuilder-MCP |
| `supabase-substrate-not-preflighted-v1` | COMPLETE | DOCUMENTED | CG-AppBuilder-MCP |

## Global doNotAdvance

- Apply production est_* migrations or Smith Ranch live CE/Revu execution
- Merge PR #367 before isolated Supabase live DB receipt
- Claim WP2_ISOLATED_CATALOG_PROOF_COMPLETE from logic tests alone
- Start smith-ranch-ce-revu-controlled-pilot-v1 before live CE handoff
- Run index:publish or harvest:publish-hub-seed from Cursor

## Projection sync

Status: `not-run` (hub: `not-run`)

