# Work package: wesleywork-drive-mount-task-dedupe-v1

**Verdict:** **SUPERSEDED** 2026-08-13 by `wesleywork-storage-services-v1`  
**Protocol:** Office Admin Protocol v1.5 (historical)  
**Owner repo:** CapitalGlass-Office-Admin  
**Endpoint:** CG-WESLEYWORK-01 (WESLEY_WORK)  
**Last updated:** 2026-08-13

Do **not** deploy `Install-CgWesleyWorkDriveMountPersistence.ps1`. That installer re-enables PreCursor ForceRemap and LAN-first Health. Use Storage Keeper.

---

## Goal

Stop duplicate/flashing WESLEY_WORK PowerShell drive-mount health windows.

---

## Root cause

Three scheduled tasks ran `Ensure-CgWesleyWorkDriveMounts.ps1 -Mode Health` every 15 minutes **without** `IgnoreNew` / `Hidden` discipline:

| Task | Disposition |
|------|-------------|
| `CapitalGlass-WesleyWork-DriveMount-Health` | **Kept** — sole periodic Health runner |
| `CapitalGlass-WesleyWork-DriveMount-LanRecheck` | **Removed** |
| `CapitalGlass-WesleyWork-DriveMount-User-Health` | **Removed** |

---

## Key changes (CapitalGlass-Office-Admin)

- New `Register-OfficeHiddenScheduledTask.ps1` helper
- XML scheduled task registration
- `MultipleInstancesPolicy=IgnoreNew`
- `Hidden=true`
- Scheduled health runs use `-Quiet`
- Duplicate `LanRecheck` / `User-Health` tasks removed
- User task registration no longer creates `User-Health`
- New `Test-CgWesleyWorkDriveMountTaskRegistration.ps1` verifier
- Receipt: [`artifacts/agent-runs/wesleywork-drive-mount-task-dedupe-v1/receipt.json`](../../artifacts/agent-runs/wesleywork-drive-mount-task-dedupe-v1/receipt.json)

---

## Final task model

| Task | Role |
|------|------|
| `DriveMount-Health` | Only periodic Health, every 15m |
| `DriveMount-Logon` | Logon remap |
| `DriveMount-Unlock` | Post-logon Health, 30s delay |
| `DriveMount-Startup` | SYSTEM boot kick |
| `PreCursorDriveGate*` | ForceRemap when Z: missing — distinct 1m path |

---

## Deploy (DO NOT RUN — retired)

The installer below is retired and hard-fails `RETIRED_USE_STORAGE_KEEPER`.

```powershell
# RETIRED — do not run
# .\Install-CgWesleyWorkDriveMountPersistence.ps1
cd C:\
& "$env:LOCALAPPDATA\CapitalGlass\Storage\Invoke-CgStorageKeeper.ps1" -Mode Health
```

---

## Verification

| Check | Status |
|-------|--------|
| Unit tests | **PASS** 7/7 |
| Live probe after elevated deploy on WESLEY_WORK | **SUPERSEDED** — Storage Keeper live proof 2026-08-13 |

---

## Next action

Do not re-enable PreCursor or LAN-first `DriveMount-Health`. Keep Storage Keeper Health every 3 minutes.
