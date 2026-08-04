# Harvest summary — derived view

**Authority:** `harvest-manifest-v1.json` (`d969a38ea496…`)
**Work package:** `harvest-2026-08-04-ultimate-sdlc-runner-dark-package-v1`
**Mission class:** `chat-thread-closeout-autopsy-harvest-chatgpt-v1`
**Verdict:** `HARVEST_COMPLETE`
**Retrieval:** `INDEX_HIT`

> This file is a generated view. Do not edit independently — update the manifest.

## Packets harvested

| Packet | State | Verdict | Owner |
| --- | --- | --- | --- |
| `ultimate-sdlc-dark-package-go-v1` | GO | PASS | CG-AppBuilder-MCP |
| `receipt-lineage-warn-to-go-v1` | RECORDED | PASS | CG-AppBuilder-MCP |
| `shared-db-investigate-first-v1` | RECONCILIATION_COMPLETE | PASS | CG-AppBuilder-MCP |
| `bounded-command-closeout-v1` | RECORDED | PASS | CG-AppBuilder-MCP |
| `adjacent-repo-local-drift-v1` | LOCAL_ONLY | PASS | Cursor-ProposalGenerator |
| `chatgpt-ultimate-sdlc-thread-v1` | HARVEST_COMPLETE | HARVEST_COMPLETE | CapitalGlass-Cross-Agent |

## Global doNotAdvance

- Treat ChatGPT draft as repository authority without Cursor receipt verification
- Claim OPERATIONAL before harvest:publish-intelligence-full PASS
- Invoke refresh-worker script in closeout gates
- Force snapshot refresh before requires-investigation cleared
- Merge adjacent-repo local migration work into AppBuilder mission closeout

## Projection sync

Status: `synced` (hub: `published`)

