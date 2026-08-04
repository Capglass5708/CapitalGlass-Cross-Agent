# Project: direct-connect-persistent-controller-v1

## Summary

RYZEN9DESK Direct Connect **persistent controller** — idempotent systemd/Windows task layer that keeps the WSL GitHub Actions runner available across reboot without manual SSH repair.

## Workspace

| Field | Value |
| --- | --- |
| Work package | `direct-connect-persistent-controller-v1` |
| Owner repo | CapitalGlass-Office-Admin |
| Kit path | `Z:\Office\Wes\Direct Connect\Ryzen Direct Connect\persistent-controller\` |
| Install path | `C:\ProgramData\CapitalGlass\DirectConnect` on RYZEN9DESK |
| Status | **INSTALLED_PERSISTENCE_UNPROVEN** |
| Verdict | **HOLD** |

## Thread evidence (2026-08-03)

- Controller scripts deployed with file lock, Windows mutex, health-mode noop when healthy
- `TEST_PROTOCOL.md` step 1 attempted; cold-reboot / 10-min soak **not completed**
- Run `30859284939` PASS **excluded** — storage-verify succeeded only after SSH/manual recovery
- Run `30861386284` connectivity `storage-verify` PASS — does **not** prove persistence

## Do not advance

- `PERSISTENT_AVAILABILITY_PASS` until clean post-reboot dispatch without SSH repair

## Next action

Complete `TEST_PROTOCOL.md`: soak → cold reboot without logon/SSH → `DISPATCH_PERSISTENCE_GATE.sh` from WESLEY_WORK → controller receipt PASS.
