# Harvest summary — derived view

**Authority:** `harvest-manifest-v1.json` (`d52fcaf351a4…`)
**Work package:** `harvest-2026-08-06-wesleywork-l-wsl-remount-session-v1`
**Mission class:** `chat-thread-closeout-autopsy-harvest-v1`
**Verdict:** `HARVEST_COMPLETE`
**Retrieval:** `INDEX_HIT_AI_CACHE`

> This file is a generated view. Do not edit independently — update the manifest.

## Packets harvested

| Packet | State | Verdict | Owner |
| --- | --- | --- | --- |
| `wsl-l-unmounted-windows-ok-v1` | RESOLVED | BOOTSTRAP_HEALTHY | CG-AppBuilder-MCP |
| `wsl-bootstrap-l-research-command-v1` | RECORDED | PASS | CG-AppBuilder-MCP |
| `wsl-l-fstab-persistence-gap-v1` | OPEN | OPERATOR_ACTION | CG-AppBuilder-MCP |
| `scout-l-unavailable-layer-alignment-v1` | RECORDED | CONFIRMED | CG-AppBuilder-MCP |
| `wesleywork-l-remount-faster-path-v1` | RECORDED | LESSON_RECORDED | CG-AppBuilder-MCP |
| `l-remount-recurrence-indexed-v1` | RECORDED | INDEXED_NOT_NEW | CapitalGlass-Cross-Agent |
| `l-remount-session-decision-v1` | RECORDED | ACCEPTED | CG-AppBuilder-MCP |
| `powershell-path-wsl-diagnosis-v1` | RECORDED | WORKAROUND_APPLIED | CG-AppBuilder-MCP |

## Global doNotAdvance

- Remap Windows L: when wsl:bootstrap-l-research:verify shows windowsDriveAvailable true
- Claim L_DRIVE_NOT_MOUNTED_IN_WSL for WSL-only drvfs gap when Windows L: is healthy
- Run index:publish or harvest:publish-hub-seed from Cursor
- Skip wsl:install-l-fstab recommendation after successful bootstrap when fstab empty

## Projection sync

Status: `not-run` (hub: `not-run`)

