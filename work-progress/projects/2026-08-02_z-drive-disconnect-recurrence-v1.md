# Project: z-drive-disconnect-recurrence-v1

## Summary

Recurring Z: drive disconnect on WESLEY_WORK off-LAN sessions wastes agent tokens on rediscovery. Canonical repair lives in CapitalGlass-Office-Admin; Failure Intelligence owns the proven record and preflight shortcut.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | `z-drive-disconnect-recurrence-v1` |
| Work package | `z-drive-pre-session-gate-hardening-v1` |
| Date opened | 2026-08-02 |
| Coordination repo | CapitalGlass-Cross-Agent |
| Owner repo(s) | CapitalGlass-Office-Admin |
| Status | Active |

## Agent Fast Path

**Failure code:** `Z_DRIVE_NOT_MOUNTED_IN_DAILY_SESSION`  
**FI record:** `FI-20260802-z-drive-unmapped-in-wesle-session-net-use-z-retu`  
**Owner route:** `office-admin` / CapitalGlass-Office-Admin  
**Shortcut:** `PSC-Z-DRIVE-WESLEYWORK-FORCE-REMAP`  
**Rejected approach:** `RA-004` (do not grep repos or improvise `net use` loops)

**Canonical repair (WESLEY_WORK):**

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "C:\ProgramData\CapitalGlass\OfficeAdmin\PRIVATE\Ensure-CgWesleyWorkDriveMounts.ps1" -Mode ForceRemap
```

**Verify probe:** `Z:\Capital-Glass-Dev` must exist before material agent work continues.

**Do not:** patch consumer apps for Z: mapping; rediscover UNC paths via repo search; create a second FI repair record.

## Evidence

| Evidence | Owner repo | Path (repo-relative) | Result |
| --- | --- | --- | --- |
| Reconnect receipt | `CG-AppBuilder-MCP` | `artifacts/agent-runs/z-drive-disconnect-recurrence-v1/z-drive-reconnect-receipt.json` | ForceRemap verified — **not stored in Cross-Agent** |
| Phase 2 gate | `CG-AppBuilder-MCP` | `artifacts/agent-runs/z-drive-pre-session-gate-hardening-v1/phase-2-deploy-receipt.json` | Pre-session gate shipped — **not stored in Cross-Agent** |

If a path 404s in Cross-Agent, resolve from the **owner repo** at the commit cited in `ACTIVE_WORK.md`, not from this meeting repo.

## Update Log

### 2026-08-02 — Cross-Agent note seed candidate

- Source note prepared for `cross-agent-notes-seeding-v1` compact projection.
- Full note body remains canonical here; agent layer receives pointers only.
