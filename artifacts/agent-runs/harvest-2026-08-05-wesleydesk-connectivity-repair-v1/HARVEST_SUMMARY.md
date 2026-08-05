# Harvest summary — derived view

**Authority:** `harvest-manifest-v1.json` (`091e36a13b3a…`)
**Work package:** `harvest-2026-08-05-wesleydesk-connectivity-repair-v1`
**Mission class:** `chat-thread-closeout-autopsy-harvest-v1`
**Verdict:** `HARVEST_COMPLETE`
**Retrieval:** `INDEX_HIT_AI_CACHE`

> This file is a generated view. Do not edit independently — update the manifest.

## Packets harvested

| Packet | State | Verdict | Owner |
| --- | --- | --- | --- |
| `wesleydesk-z-session-identity-blocker-v1` | OPEN | ACTIVE_USER_Z_MAPPING_NOT_PROVEN | CapitalGlass-Office-Admin |
| `phantom-z-net-use-insufficient-v1` | DOCUMENTED | PASS | CapitalGlass-Office-Admin |
| `ssh-forceremap-as-wesley-gate-v1` | DOCUMENTED | PASS | CG-AppBuilder-MCP |
| `define-dosdevice-before-z-remap-v1` | RECORDED | PASS | CapitalGlass-Office-Admin |
| `map-z-from-vault-wesleywork-v1` | PROVEN | PASS | CapitalGlass-Office-Admin |
| `wesley-interactive-gate-script-v1` | STAGED | PENDING_OPERATOR | CapitalGlass-Office-Admin |
| `repair-1-partial-pass-receipt-v1` | FROZEN | REPAIR_1_PARTIAL_PASS | CG-AppBuilder-MCP |
| `windows-session-drive-mapping-guard-v1` | CANDIDATE | POLICY_GATED | CapitalGlass-Office-Admin |
| `repair1-partial-accept-operator-gate-v1` | ACCEPTED | PASS | CapitalGlass-Cross-Agent |
| `z-drive-session-recurrence-v1` | EXTENDS_PRIOR | PASS | CapitalGlass-Cross-Agent |

## Global doNotAdvance

- Claim REPAIR_1_PASS from cgremoteadmin SSH ForceRemap alone
- Validate WSL /mnt/z from SSH session without Wesley console login
- Claim WESLEYDESK_CONNECTIVITY_ROOT_CAUSES_REPAIRED_AND_VERIFIED before cold-reboot gate
- Run CapitalGlass-EnsureDeskDriveMounts-Once (Fred identity)

## Projection sync

Status: `synced` (hub: `published`)

