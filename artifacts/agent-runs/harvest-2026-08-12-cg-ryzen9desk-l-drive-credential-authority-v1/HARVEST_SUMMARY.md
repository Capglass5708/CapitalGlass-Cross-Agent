# Harvest summary — derived view

**Authority:** `harvest-manifest-v1.json` (`dd4ff543f78b…`)
**Work package:** `harvest-2026-08-12-cg-ryzen9desk-l-drive-credential-authority-v1`
**Mission class:** `chat-thread-closeout-autopsy-harvest-v1`
**Verdict:** `HARVEST_COMPLETE`
**Retrieval:** `INDEX_HIT`

> This file is a generated view. Do not edit independently — update the manifest.

## Packets harvested

| Packet | State | Verdict | Owner |
| --- | --- | --- | --- |
| `ryzen9desk-l-drive-recovered-2026-08-12` | COMPLETE | PROVEN_EFFECTIVE | CapitalGlass-Office-Admin |
| `wsl-smb-l-credential-authority-v1` | COMPLETE | ADOPTED | CapitalGlass-Office-Admin |
| `vault-bootstrap-overwrite-protected-store-v1` | RESOLVED | ROOT_CAUSE_IDENTIFIED | CapitalGlass-Office-Admin |
| `vault-l-cred-stale-v1` | OPEN | OPEN | CapitalGlass-Office-Admin |
| `user-session-net-use-before-force-remap-v1` | COMPLETE | ADOPTED | CapitalGlass-Office-Admin |
| `cmd-ryzen9desk-l-probe` | COMPLETE | PASS | CapitalGlass-Office-Admin |
| `cmd-wsl-mount-authority` | COMPLETE | PASS | CapitalGlass-Office-Admin |
| `ev-hub-seeds-published` | COMPLETE | PASS | CapitalGlass-Cross-Agent |
| `pu-ryzen9desk-l-remap-v1` | COMPLETE | CANDIDATE | CapitalGlass-Office-Admin |

## Global doNotAdvance

- Run Import-DriveCredentialsFromVaultBootstrap when L: hub index already healthy on RYZEN9DESK
- Trust D:\Admin Keys vault L entry without live net use proof against wesleydesk
- Stage credentials only under WSL /tmp for elevated Windows consumption
- Run Ensure-CgWesleyWorkDriveMounts or net use from WSL UNC working directory
- ForceRemap with -RequireL when L:\Capital-Glass-Intelligence-Hub\00-master-index already True
- index:publish or harvest:publish-hub-seed from Cursor when operator lane required

## Projection sync

Status: `synced` (hub: `published`)

