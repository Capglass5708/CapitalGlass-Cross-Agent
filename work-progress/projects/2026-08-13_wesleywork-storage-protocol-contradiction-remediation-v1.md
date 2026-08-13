# Project: wesleywork-storage-protocol-contradiction-remediation-v1

## Summary

WESLEYWORK storage is operationally healthy (`WESLEYWORK_STORAGE_SERVICES_V1_LIVE_PROOF_PASS`), but agent-facing INDEX / Fast Path / open actions still told future agents to ForceRemap and redeploy LAN-first persistence. That contradiction is closed. Storage Keeper is the only legitimate repair front door.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | `wesleywork-storage-protocol-contradiction-remediation-v1` |
| Date opened | 2026-08-13 |
| Coordination repo | CapitalGlass-Cross-Agent |
| Owner repo(s) | CapitalGlass-Office-Admin |
| Status | **LIVE_MACHINE_PROOF_PASS** |

## Agent Fast Path

**Question:** How do I repair Z/L on WESLEYWORK?

```powershell
cd C:\
& "$env:LOCALAPPDATA\CapitalGlass\Storage\Invoke-CgStorageKeeper.ps1" -Mode Health
```

**Never:** ForceRemap. Map WESLEYWORK to `192.168.*`. Treat WSL `/mnt/z` `/mnt/l` as `drvfs` of the Windows letters. Re-enable PreCursor or `DriveMount-Health`. Deploy `Install-CgWesleyWorkDriveMountPersistence.ps1`.

**Windows canonical:** Z `\\cg-server\Capital Glass` · L `\\wesleydesk\CapitalGlass-L`  
**WSL independent CIFS:** `/mnt/z` → `//cg-server/Capital Glass` · `/mnt/l` → `//wesleydesk/CapitalGlass-L`

## Live-machine closeout gate (2026-08-13)

- Elevated ProgramData tombstone PASS
- Retired ProgramData scripts print `RETIRED_USE_STORAGE_KEEPER` and exit 2
- ForceRemap / Map-Z probes did not alter Z or L
- Storage Keeper `overall=HEALTHY`
- WSL remained independent CIFS

Receipt (owner repo): `CapitalGlass-Office-Admin/artifacts/agent-runs/wesleywork-storage-protocol-contradiction-remediation-v1/live-machine-tombstone-proof.json`

## Supersedes

- `z-drive-disconnect-recurrence-v1` ForceRemap Fast Path
- `wesleywork-drive-mount-task-dedupe-v1` persistence installer deploy
- `cg-wesleywork-offlan-smb-credential-persistence-v1` (do not implement)

## Next

Hub republish is WESLEYDESK GHA `index-publication.yml` after both remotes land. Do not write L: from Cursor.
