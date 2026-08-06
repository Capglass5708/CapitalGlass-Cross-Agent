# WESLEY_WORK terminal-flash elimination closeout

**Work package:** `wesleywork-terminal-flash-closeout-v1`  
**Harvest:** `harvest-2026-08-06-wesleywork-terminal-flash-closeout-v1`  
**Owner repo:** CapitalGlass-Office-Admin  
**Host:** WESLEY_WORK  
**Status:** CLOSED — `WESLEY_WORK_TERMINAL_FLASH_CLOSEOUT_VERIFIED_WITH_ADVISORIES`

## Outcome

Recurring Windows Terminal flash families from unattended CapitalGlass scheduled tasks were converted to `wscript.exe //B //Nologo -> VBS -> hidden PowerShell/Node` and verified under real cadences. Final reconcile-boundary poll recorded zero attributable `WindowsTerminal.exe -Embedding` spawns.

## Verified converted tasks (Phase 2 — do not reopen without regression proof)

- `CapitalGlass-WesleyWork-DriveMount-Health`
- `CapitalGlass-WesleyWork-PreCursorDriveGate`
- `CapitalGlass-WesleyWork-DriveMount-Unlock`
- `CapitalGlass-BibleZMaster-Reconcile`
- `CapitalGlass-AiCacheZMaster-Reconcile`

## Advisory tasks (non-blocking at closeout)

- `CapitalGlass-WesleyWork-DailyMaintenance`
- `CapitalGlass-Peer-Board`
- `CapitalGlass-Sync-AiCache-Portable`
- Weekly maintenance tasks (cache union, ROI health)

Reopen only if new flash is machine-attributed to one of these families.

## Frozen evidence

```text
C:\Users\wesle\AppData\Local\CapitalGlass\WesleyWork\logs\terminal-flash-audit-apply-latest.json
C:\Users\wesle\AppData\Local\CapitalGlass\WesleyWork\logs\terminal-flash-poll-latest.json
```

## Proof commands

```powershell
Test-CgWesleyWorkTerminalFlashScheduledTaskAudit.ps1 -Phase full
Invoke-CgWesleyWorkTerminalFlashPoll.ps1
```

## Do not advance

- Run boundary polls after closeout without operator request
- Disable reconcile, drive mounts, MCP, or PM2 to suppress flashes
- Claim advisory tasks fully converted at closeout
