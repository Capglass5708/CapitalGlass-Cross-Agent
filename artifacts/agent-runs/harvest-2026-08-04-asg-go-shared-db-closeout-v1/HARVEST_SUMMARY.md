# Harvest summary — derived view

**Authority:** `harvest-manifest-v1.json` (`9b0a4e08b0e0…`)
**Work package:** `harvest-2026-08-04-asg-go-shared-db-closeout-v1`
**Mission class:** `chat-thread-closeout-autopsy-harvest-v1`
**Verdict:** `HARVEST_COMPLETE`
**Retrieval:** `INDEX_HIT_AI_CACHE`

> This file is a generated view. Do not edit independently — update the manifest.

## Packets harvested

| Packet | State | Verdict | Owner |
| --- | --- | --- | --- |
| `ultimate-sdlc-runner-go-v1` | GO | PASS | CG-AppBuilder-MCP |
| `shared-db-reconciliation-v1` | RECONCILIATION_COMPLETE | PASS | CG-AppBuilder-MCP |
| `wsl-supabase-cli-spawn-v1` | SHIPPED | PASS | CG-AppBuilder-MCP |
| `asg-shared-db-gate-alignment-v1` | SHIPPED | PASS | CG-AppBuilder-MCP |
| `asg-go-command-v1` | PROVEN | PASS | CG-AppBuilder-MCP |
| `harvest-2026-08-04-asg-go-shared-db-closeout-v1` | HARVEST_COMPLETE | HARVEST_COMPLETE | CapitalGlass-Cross-Agent |

## Global doNotAdvance

- systemsGoVerdict GO without live-capable run when WSL Supabase CLI works
- Refresh shared-db snapshot while requires-investigation > 0
- Claim cg:shared-db:audit exit 0 while 169 EXPECTED_MIGRATION files remain unapplied
- OPERATIONAL before harvest:publish-intelligence-full PASS
- Run refresh-worker script for ASG closeout

## Projection sync

Status: `synced` (hub: `published`)

