# Harvest summary — derived view

**Authority:** `harvest-manifest-v1.json` (`73885e9d4e1a…`)
**Work package:** `harvest-2026-08-04-z-l-drive-offlan-session-v1`
**Mission class:** `chat-thread-closeout-autopsy-harvest-v1`
**Verdict:** `HARVEST_COMPLETE`
**Retrieval:** `FAILOVER_GIT_LEDGER`

> This file is a generated view. Do not edit independently — update the manifest.

## Packets harvested

| Packet | State | Verdict | Owner |
| --- | --- | --- | --- |
| `z-l-drive-offlan-partial-availability-v1` | PARTIAL_DRIVE_AVAILABILITY | Z_OK_L_BLOCKED_OFF_LAN | CapitalGlass-Office-Admin |
| `wsl-drvfs-ghost-mount-v1` | DOCUMENTED | PASS | CG-AppBuilder-MCP |
| `z-drive-force-remap-wsl-cwd-v1` | RECORDED | PASS | CapitalGlass-Office-Admin |

## Global doNotAdvance

- Claim L: INDEX_HIT when Windows Test-Path L:\...\INDEX.json is False
- Trust WSL /mnt/l alone for drive health on WESLEY_WORK
- Run ForceRemap from WSL working directory without cd C:\
- Improvise net use / UNC discovery (RA-004)

## Projection sync

Status: `not-run` (hub: `not-run`)

