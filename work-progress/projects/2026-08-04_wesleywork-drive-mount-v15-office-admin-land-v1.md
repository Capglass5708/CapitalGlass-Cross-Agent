# Work package: wesleywork-drive-mount-v15-office-admin-land-v1

**Verdict:** `CODE_LANDED_PENDING_DEPLOY`  
**Parent:** `wesleywork-drive-mount-task-dedupe-v1`  
**Owner repo:** CapitalGlass-Office-Admin  
**Endpoint:** CG-WESLEYWORK-01  
**Protocol:** Office Admin Protocol v1.5  
**Created:** 2026-08-04

---

## Why this follow-up exists

Wave A sealed green using a **one-shot remediation** (`fix-drive-mount-tasks-v15.ps1`) because ProgramData still held **v1.4** register scripts. Any re-run of `Install-CgWesleyWorkDriveMountPersistence.ps1` from stale PRIVATE copies would **re-emit** visible tasks, duplicate Health runners, and restore deprecated `LanRecheck`.

This package lands the **durable repo fix** so install cannot regress to v1.4 behavior.

---

## Repo changes (CapitalGlass-Office-Admin)

| File | Change |
|------|--------|
| `Register-CgWesleyWorkDriveMountTasks.ps1` | v1.5 hidden tasks, `-Quiet` health, `SkipLanRecheck`, deprecated purge |
| `Register-OfficeDriveMountLifecycleTasks.ps1` | Hidden unlock only; `SkipLanRecheck` switch |
| `Register-OfficeHiddenScheduledTask.ps1` | ISO delays, `Register-OfficeHiddenSystemBootTask` for SYSTEM Startup |
| `Register-CgWesleyWorkPreCursorDriveGateTask.ps1` | Hidden helper, `-Quiet`, `distinctFromHealth` |
| `Register-CgWesleyWorkDriveMountUserTasks.ps1` | Removes `User-Health`; no create |
| `Ensure-CgWesleyWorkDriveMounts.ps1` | `[switch]$Quiet` |
| `Invoke-CgWesleyWorkPreCursorDriveGate.ps1` | `[switch]$Quiet` |
| `Install-CgWesleyWorkDriveMountPersistence.ps1` | Copies hidden-task helper to PRIVATE |

---

## Verification

```bash
node --test scripts/tests/wesleywork-drive-mount-task-dedupe-v1.test.mjs
```

Elevated deploy on WESLEY_WORK (after merge):

```powershell
cd C:\Developer\repos\CapitalGlass-Office-Admin\scripts\devices\CG-WESLEYWORK-01
.\Install-CgWesleyWorkDriveMountPersistence.ps1
.\Test-CgWesleyWorkDriveMountTaskRegistration.ps1 -ExpectRegistered
```

Receipt: `CapitalGlass-Cross-Agent/artifacts/agent-runs/wesleywork-drive-mount-v15-office-admin-land-v1/receipt.json`

---

## Wave A boundary

**Do not** re-run runner, smoke, or drive verifier for infrastructure lane unless a later gate proves regression. This package is **Office Admin durability only**.
