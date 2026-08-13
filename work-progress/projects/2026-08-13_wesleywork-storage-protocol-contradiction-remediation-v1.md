# wesleywork-storage-protocol-contradiction-remediation-v1

**Status:** IN PROGRESS (2026-08-13)  
**Mission class:** `fix`  
**Owner:** CapitalGlass-Office-Admin  
**Coordination:** this repo (INDEX / ACTIVE_WORK)  
**Host:** WESLEY_WORK (`CG-WESLEYWORK-01`)

## Why

Storage is live-proven healthy. Governance was not: stale INDEX / mobility / offlan WP / vault JSON still told agents to ForceRemap or reinstall LAN-first persistence.

## Agent Fast Path

```powershell
cd C:\
& "$env:LOCALAPPDATA\CapitalGlass\Storage\Invoke-CgStorageKeeper.ps1" -Mode Health
```

Retired scripts hard-fail `RETIRED_USE_STORAGE_KEEPER`. Do not ForceRemap. Do not re-enable PreCursor.

## This package

- Tombstone WESLEYWORK-only Ensure / PreCursor / LAN Map / old installer scripts
- Tombstone ProgramData copies
- Sync copies Storage Keeper only
- Close `z-drive-disconnect-recurrence-v1` and `wesleywork-drive-mount-task-dedupe-v1`
- Do **not** republish Intelligence Hub from Cursor

## Next

Operator/CI Hub republish on WESLEYDESK after Office Admin + Cross-Agent land.
