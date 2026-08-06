# Harvest summary — derived view

**Authority:** `harvest-manifest-v1.json` (`7126926a0e73…`)
**Work package:** `harvest-2026-08-06-wesley-work-l-research-bootstrap-closeout-v1`
**Mission class:** `chat-thread-closeout-autopsy-harvest-v1`
**Verdict:** `HARVEST_COMPLETE`
**Retrieval:** `INDEX_HIT_AI_CACHE`

> This file is a generated view. Do not edit independently — update the manifest.

## Packets harvested

| Packet | State | Verdict | Owner |
| --- | --- | --- | --- |
| `de-handoff-degraded-wsl-l-unmounted-v1` | RESOLVED | BOOTSTRAP_SHIPPED | CG-AppBuilder-MCP |
| `preflight-duplicate-de-handoff-step-v1` | FIXED | PASS | CG-AppBuilder-MCP |
| `de-handoff-pipe-exit-code-trap-v1` | RECORDED | PASS | CG-AppBuilder-MCP |
| `document-layer-synology-register-false-positive-v1` | FIXED | PASS | CapitalGlass-Documents |
| `wesley-work-l-research-bootstrap-protocol-v1` | SHIPPED | PASS | CG-AppBuilder-MCP |
| `mcp-build-stamp-windows-pm2-topology-v1` | DOCUMENTED | PASS | CG-AppBuilder-MCP |
| `wesley-work-bootstrap-commands-v1` | RECORDED | PASS | CG-AppBuilder-MCP |
| `wesley-work-bootstrap-evidence-v1` | RECORDED | PASS | CG-AppBuilder-MCP |

## Global doNotAdvance

- Claim de:handoff-health PASS while /mnt/l unmounted or index unreadable
- Trust piped de:handoff-health exit code
- WSL-only mcp:build as Windows PM2 stamp authority
- Reject valid WSL2 L: mount because findmnt reports fstype 9p
- Run index:publish or harvest:publish-hub-seed from Cursor

## Projection sync

Status: `not-run` (hub: `not-run`)

