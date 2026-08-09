# Harvest summary — derived view

**Authority:** `harvest-manifest-v1.json` (`ab2a8022b090…`)
**Work package:** `harvest-2026-08-07-cursor-healthkeeper-preflight-dedupe-v1`
**Mission class:** `chat-thread-closeout-autopsy-harvest-v1`
**Verdict:** `HARVEST_COMPLETE`
**Retrieval:** `INDEX_HIT_AI_CACHE`

> This file is a generated view. Do not edit independently — update the manifest.

## Packets harvested

| Packet | State | Verdict | Owner |
| --- | --- | --- | --- |
| `cursor-healthkeeper-dedupe-milestone-closed-v1` | COMPLETE | MILESTONE_CLOSED | CG-AppBuilder-MCP |
| `healthkeeper-v12-dedupe-outcome-v1` | COMPLETE | PROVEN_EFFECTIVE | CG-AppBuilder-MCP |
| `healthkeeper-integration-sha-bf6c38c-v1` | COMPLETE | VERIFIED | CG-AppBuilder-MCP |
| `healthkeeper-dedupe-sha-d18bb643-v1` | COMPLETE | VERIFIED | CG-AppBuilder-MCP |
| `cursor-wsl-health-preflight-gate-v1` | COMPLETE | PASS | CG-AppBuilder-MCP |
| `cursor-healthkeeper-dedupe-tests-v1` | COMPLETE | PASS | CG-AppBuilder-MCP |
| `healthkeeper-v11-owned-downstream-checks-v1` | RESOLVED | CORRECTED | CG-AppBuilder-MCP |
| `healthkeeper-duplicated-preflight-checks-v1` | COMPLETE | REMEDIATED | CG-AppBuilder-MCP |
| `healthkeeper-ownership-matrix-first-v1` | COMPLETE | DOCUMENTED | CG-AppBuilder-MCP |
| `healthkeeper-substrate-only-ownership-v12-v1` | COMPLETE | DOCUMENTED | CG-AppBuilder-MCP |
| `app-builder-preflight-downstream-blockers-v1` | ACTIVE | BLOCKED | CG-AppBuilder-MCP |

## Global doNotAdvance

- Reopen cg-cursor-healthkeeper-preflight-dedupe-v1 for mcp:doctor or Bible sync failures
- Claim healthkeeper BLOCKED when only downstream preflight failed
- Run index:publish or harvest:publish-hub-seed from Cursor
- Claim FULLY_SEEDED without index:freshness-gate receipt

## Projection sync

Status: `not-run` (hub: `not-run`)

