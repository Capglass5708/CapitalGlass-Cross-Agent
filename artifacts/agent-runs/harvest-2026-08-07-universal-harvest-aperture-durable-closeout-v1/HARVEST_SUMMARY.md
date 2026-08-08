# Harvest summary — derived view

**Authority:** `harvest-manifest-v1.json` (`36ad115026ed…`)
**Work package:** `harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1`
**Mission class:** `chat-thread-closeout-autopsy-harvest-v1`
**Verdict:** `HARVEST_COMPLETE`
**Retrieval:** `INDEX_HIT_AI_CACHE`

> This file is a generated view. Do not edit independently — update the manifest.

## Packets harvested

| Packet | State | Verdict | Owner |
| --- | --- | --- | --- |
| `uh-extend-sdlc-stack-not-parallel-hub-v1` | COMPLETE | ADOPTED | CG-AppBuilder-MCP |
| `uh-z-drvfs-publish-eperm-v1` | ACTIVE | WORKAROUND_DOCUMENTED | CG-AppBuilder-MCP |
| `uh-async-test-miss-v1` | RESOLVED | FIXED | CG-AppBuilder-MCP |
| `uh-proof-wave-retry-dirty-tree-v1` | COMPLETE | DOCUMENTED | CG-AppBuilder-MCP |
| `uh-clean-tree-before-execute-v1` | COMPLETE | DOCUMENTED | CG-AppBuilder-MCP |
| `uh-sdlc-cursor-execute-v1` | COMPLETE | PROVEN | CG-AppBuilder-MCP |
| `uh-durability-receipt-v1` | COMPLETE | VERIFIED | CG-AppBuilder-MCP |
| `uh-ready-not-terminal-v1` | COMPLETE | SHIPPED | CG-AppBuilder-MCP |
| `uh-milestone-outcome-v1` | COMPLETE | PROVEN_EFFECTIVE | CG-AppBuilder-MCP |

## Global doNotAdvance

- Claim hub FULLY_SEEDED without harvest:publish-hub-seed and index:freshness-gate
- Run index:publish or harvest:publish-hub-seed from Cursor
- Treat READY or tests-pass as terminal for MILESTONE_WAVE implementation
- Suppress low-value harvest lanes — distinctValidSuppressed must remain 0

## Projection sync

Status: `synced` (hub: `published`)

