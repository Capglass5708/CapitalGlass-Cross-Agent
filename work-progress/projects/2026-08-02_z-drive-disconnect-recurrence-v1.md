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
| Status | **SUPERSEDED** 2026-08-13 by `wesleywork-storage-services-v1` |

## Agent Fast Path

**Failure code:** `Z_DRIVE_NOT_MOUNTED_IN_DAILY_SESSION`  
**FI record:** `FI-20260802-z-drive-unmapped-in-wesle-session-net-use-z-retu`  
**Owner route:** `office-admin` / CapitalGlass-Office-Admin  
**Shortcut:** Storage Keeper Health (ForceRemap shortcut retired)  
**Rejected approach:** `RA-004` (do not grep repos or improvise `net use` loops). Also reject ForceRemap / LAN-first Ensure.

**Canonical repair (WESLEY_WORK):**

```powershell
cd C:\
& "$env:LOCALAPPDATA\CapitalGlass\Storage\Invoke-CgStorageKeeper.ps1" -Mode Health
```

If Health reports `GHOST_LETTER` / `GHOST_LETTER_REQUIRES_LOGOFF`: **STOP**. Do not ForceRemap. Log off Windows.

**Verify probe:** `Z:\Capital-Glass-Dev` must exist before material agent work that needs Z. Cursor/ext4 work does not require Windows Z/L.

**Do not:** run `Ensure-CgWesleyWorkDriveMounts.ps1 -Mode ForceRemap`; re-enable PreCursor; patch consumer apps for Z: mapping; rediscover UNC paths via repo search.

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

### 2026-08-04 — Thread harvest harvest-2026-08-04-z-l-drive-offlan-session-v1

- Off-LAN ForceRemap: **Z OK** (Tailscale cg-server), **L blocked** (desk SMB unreachable).
- WSL drvfs ghost mount documented (WM-001).
- Seeds: IH-Z-L-OFFLAN-PARTIAL-001, IH-WSL-DRVF-GHOST-002, IH-Z-FORCE-REMAP-CWD-003.

### 2026-08-04 — Thread harvest harvest-2026-08-04-wesleywork-l-windows-closeout-v1

- Windows L: remapped via Tailscale wesleydesk; ext4 repos root fix in mount gate.
- Seeds: IH-WESLEYWORK-L-TAILSCALE-REMAP-001, IH-MOUNT-AUTHORITY-EXT4-REPOS-001, IH-WINDOWS-L-VS-WSL-L-001.

### 2026-08-12 — Major recurring issue recorded (office ↔ home)

- Operator: **Z and L break every laptop move** between office and home.
- Root cause class: SMB session drop + **missing `cg-server` Credential Manager entries** off-LAN; `drive-mapping.protected` in ProgramData is the working credential layer (not Hub, not git).
- Incident: `CapitalGlass-Office-Admin/docs/incidents/2026-08-12-wesleywork-z-l-drive-office-home-mobility.md`
- Hub slice: `work-progress/intelligence-hub-slices/wesleywork-drive-mobility.json`
- AppBuilder incident memory: `CG-AppBuilder-MCP/docs/incident-memory/workspace-wesleywork-z-l-office-home-mobility.md`
- Automation WP: `cg-wesleywork-offlan-smb-credential-persistence-v1` (Office Admin owner)

### 2026-08-13 — Phantom Z: LanmanRedirector + storage services architecture

- Ghost: `QueryDosDevice(Z:)` → `\Device\LanmanRedirector\;Z:...\192.168.1.208\Capital Glass`; ERROR 85; no `net use` row.
- Must-fix WP: `wesleywork-storage-services-v1` — Tailscale-only UNC, Storage Keeper, independent WSL CIFS.
- Incident: `CapitalGlass-Office-Admin/docs/incidents/2026-08-13-wesleywork-z-phantom-lanmanredirector-ghost.md`
- Architecture: `CapitalGlass-Office-Admin/docs/devices/CG-WESLEYWORK-01/STORAGE-SERVICES.md`
- L remains desk-hosted (`wesleydesk`) until always-on NAS migration; `L_ENDPOINT_OFFLINE` is the honest code.
- **2026-08-13 post-reboot:** `WESLEYWORK_STORAGE_SERVICES_V1_LIVE_PROOF_PASS` — Z/L MagicDNS HEALTHY; ghost `192.168.1.208` gone; LAN-first tasks disabled.

### 2026-08-13 — Protocol contradiction remediation

- This project is **SUPERSEDED**. Agent Fast Path no longer ForceRemaps.
- Successor: `wesleywork-storage-services-v1` + `wesleywork-storage-protocol-contradiction-remediation-v1`.
- Retired scripts hard-fail `RETIRED_USE_STORAGE_KEEPER`.

