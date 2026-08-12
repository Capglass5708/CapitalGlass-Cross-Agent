# CG-RYZEN9DESK-01 L: drive credential authority

**Work package:** `cg-ryzen9desk-l-drive-credential-authority-v1`  
**Harvest:** `harvest-2026-08-12-cg-ryzen9desk-l-drive-credential-authority-v1`  
**Owner repo:** CapitalGlass-Office-Admin  
**Status:** HARVEST_COMPLETE — L: operational; vault L refresh open

## Summary

RYZEN9DESK Windows L: remap failed due to stale IT Vault L secret, elevated/WSL credential staging friction, and UNC cwd breaks. Recovery via WSL smb-l authority + user-session persistent net use. Intelligence Hub seeds published.

## Authority

- `CapitalGlass-Office-Admin/docs/incidents/2026-08-12-cg-ryzen9desk-l-drive-credential-authority.md`
- `CapitalGlass-Office-Admin/docs/devices/CG-RYZEN9DESK-01/NETWORK-DRIVES.md`
- `CapitalGlass-Office-Admin/mcp/knowledge-index/cg-ryzen9desk-01-drive-mount-operations.json`

## Open

- Refresh `wesleydesk-smb-wesley.vault` on `D:\Admin Keys\Capital-Glass-IT-Vault`
- Populate `OFFICE_SMB_*` in Doppler `capital-glass-agent-ops/prd`
