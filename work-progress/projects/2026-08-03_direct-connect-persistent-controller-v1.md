# Project: direct-connect-persistent-controller-v1

## Summary

Persistent controller package for **Direct Connect** on RYZEN9DESK — keeps WESLEY_WORK → GitHub Actions → RYZEN9DESK WSL runner available without manual SSH recovery after reboot.

## Workspace

| Field | Value |
| --- | --- |
| Work package | `direct-connect-persistent-controller-v1` |
| Date opened | 2026-08-03 |
| Owner repo | CapitalGlass-Office-Admin |
| Coordination repo | CapitalGlass-Cross-Agent |
| Status | **INSTALLED — persistence not proven** |

## Current state

| Item | Value |
| --- | --- |
| Install location | `Z:\Office\Wes\Direct Connect\Ryzen Direct Connect\persistent-controller\` |
| SYSTEM tasks | `CapitalGlass-DirectConnect-PersistentController-Startup`, `CapitalGlass-DirectConnect-PersistentController-Health` |
| Storage verify | PASS on run `30859284939` **after SSH/manual recovery** — does not prove cold-boot persistence |
| `PERSISTENT_AVAILABILITY_PASS` | **NOT awarded** |
| Cold reboot self-heal | Previously **failed** |

## Required next proof

Cold reboot or `wsl --shutdown` **without** SSH repair → controller receipt PASS → runner online ≥5 min → WESLEY_WORK `storage-verify` PASS.

## Do not advance

- `PERSISTENT_AVAILABILITY_PASS`
- Treating post-SSH storage verify as persistence proof
