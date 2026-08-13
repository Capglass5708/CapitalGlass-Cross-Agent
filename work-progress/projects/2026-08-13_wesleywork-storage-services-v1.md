# wesleywork-storage-services-v1

**Status:** `WESLEYWORK_STORAGE_SERVICES_V1_LIVE_PROOF_PASS` (2026-08-13 post-reboot)  
**Owner:** CapitalGlass-Office-Admin  
**Host:** WESLEY_WORK (`CG-WESLEYWORK-01`)  
**Related:** `2026-08-02_z-drive-disconnect-recurrence-v1.md`

## Canonical UNC (Tailscale MagicDNS only)

| Letter | UNC |
| --- | --- |
| Z | `\\cg-server\Capital Glass` |
| L | `\\wesleydesk\CapitalGlass-L` (desk-hosted transitional) |

LAN IPs are forbidden map targets.

## 2026-08-13 execution

- Storage Keeper installed to `%LOCALAPPDATA%\CapitalGlass\Storage` and `C:\ProgramData\CapitalGlass\Storage`.
- Windows Health: `GHOST_LETTER_REQUIRES_LOGOFF` on Z:; L skipped (`Z_GHOST_PURGE_FAILED`).
- New task: `CapitalGlass-WesleyWork-StorageKeeper-Health` every 3 minutes.
- Legacy Logon/Health/Unlock tasks still LAN-first (schtasks `/change` Access Denied without elevation).
- WSL independent CIFS: `/mnt/z` and `/mnt/l` HEALTHY over MagicDNS. Credential files must be LF (CRLF caused STATUS_LOGON_FAILURE).
- Hub: `BY-KIND/wesleywork-drive-mobility.json` written; active-work ledger published (`PUBLISH_PASS`) via WSL Hub root.

## Live proof (2026-08-13 after reboot)

- Elevated register disabled PreCursor ForceRemap trio + `DriveMount-Health`; Logon/Unlock invoke Storage Keeper.
- `QueryDosDevice Z:` MagicDNS `cg-server` — ghost `192.168.1.208` gone.
- `net use` / `Get-SmbMapping`: `Z:` `\\cg-server\Capital Glass`, `L:` `\\wesleydesk\CapitalGlass-L`.
- Windows health `HEALTHY`; second Health cycle left mappings unchanged.
- WSL independent CIFS HEALTHY (healer remounts as uid 1000 when boot ran as root).

Receipt: `CapitalGlass-Office-Admin/artifacts/agent-runs/wesleywork-storage-services-v1/WESLEYWORK_STORAGE_SERVICES_V1_LIVE_PROOF_PASS.json`

Optional later: `wsl --shutdown` for mirrored networking only — not required for Windows Z.

## Docs

- `CapitalGlass-Office-Admin/docs/devices/CG-WESLEYWORK-01/STORAGE-SERVICES.md`
- `CapitalGlass-Office-Admin/docs/incidents/2026-08-13-wesleywork-z-phantom-lanmanredirector-ghost.md`
