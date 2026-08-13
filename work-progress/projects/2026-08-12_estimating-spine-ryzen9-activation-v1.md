# Project: estimating-spine-ryzen9-activation-v1

## Summary

Activate **RYZEN9DESK** as the remote **WSL/GHA execution lane** for estimating-spine work (Computer Estimator GPU parsing, validation, storage proofs), coordinated from **WESLEY_WORK** via Direct Connect — without claiming Revu Windows-interactive proof from WSL runner online alone.

## Workspace

| Field | Value |
| --- | --- |
| Work package | `estimating-spine-ryzen9-activation-v1` |
| Date | 2026-08-12 |
| Control host | `CG-WESLEYWORK-01` (integration captain) |
| Execution host | `CG-RYZEN9DESK-01` (managed executor) |
| Coordination repo | CapitalGlass-Cross-Agent |
| Execution repo | CG-AppBuilder-MCP |
| Status | **WSL_EXECUTOR_READY_ESTIMATING_PARTIAL** |
| Harvest | `harvest-2026-08-12-estimating-spine-ryzen9-activation-v1` |

## Verdict matrix

| Gate | Result | Evidence |
| --- | --- | --- |
| Direct Connect front door | PASS | `office.get_direct_connect_auto_connect_profile` — `allowsDispatch: true`, live `gh_api` |
| Runner online idle | PASS | `ryzen9desk-wsl2-CG-RYZEN9DESK-01` |
| Z continuity on RYZEN9 | PASS | GHA `31560060271` |
| Full acceptance read-only | PARTIAL_REMOTE_PASS | GHA `31560093006` |
| GPU RTX 5080 | PASS | GHA `31560113697` |
| Core estimating repos ext4 | PASS | GHA `31560137506` |
| L: + Z: on RYZEN9 WSL | PASS | GHA `31560208328` |
| CE opening stack | PENDING | Desk run: `Computer Estimator/scripts/install_opening_stack_ryzen9desk.sh` |
| Revu Windows interactive | PENDING | Handoff `revu-remote-ryzen-terminal-proof-v1` |

## Two execution planes (invariant)

| Plane | Remote from WESLEY_WORK? | Use for |
| --- | --- | --- |
| **WSL_GHA_EXECUTOR** | Yes | CE GPU, validation, repo sync, storage/Z proofs |
| **WINDOWS_INTERACTIVE** | No | Revu UI, Revu MCP markup, Gate 1 live proof |

## Handoff bus

| Path | Role |
| --- | --- |
| `Z:\Office\Wes\Direct Connect\handoffs\estimating-spine-ryzen9-activation-v1\` | Mission handoff + STATUS |
| `mission-handoff.json` | Canonical cross-desk contract |
| `START_HERE.md` | Operator entry |

## RYZEN9 WSL repos (core lane)

Root: `/home/wesley/repos` — present: `CG-AppBuilder-MCP`, `CapitalGlass-Cross-Agent`, `Computer Estimator`, `CapitalGlassRevu`. Dirty worktrees advisory. Full estimating-spine pin optional via `wsl2-canonical-setup` with `approval_ref=estimating-spine-ryzen9-activation-v1`.

## Related packages

| Package | Relationship |
| --- | --- |
| `ryzen9desk-managed-executor-v1` | Transport foundation — advance to **MANAGED_EXECUTOR_ONLINE** after this activation harvest |
| `revu-remote-ryzen-terminal-proof-v1` | Windows Revu lane — sibling handoff |
| `revu-production-plan-markup-readiness-v1` | Suite critical path — Revu policy blocker `revu-mcp-production-workflow-locked` |
| `direct-connect-first-read-enforcement-v1` | Retrieval rule authority |

## Evidence (AppBuilder)

- `CG-AppBuilder-MCP/artifacts/agent-runs/estimating-spine-ryzen9-activation-v1/activation-manifest.json`
- `CG-AppBuilder-MCP/artifacts/agent-runs/estimating-spine-ryzen9-activation-v1/remote-probes/` (GHA receipts when downloaded)

## WESLEY_WORK standing commands

```bash
npm run dual-machine:ryzen:status -- --json
npm run dual-machine:ryzen:exec -- --job=dual-machine-remote-status --json
gh workflow run ryzen9desk-executor-dispatch.yml \
  -f work_package_id=ryzen9desk-managed-executor-v1 \
  -f job_profile=gpu-smoke
```

## Next actions

1. **RYZEN9 desk:** install CE opening stack (`install_opening_stack_ryzen9desk.sh`; needs `~/paddle-wheels`).
2. **RYZEN9 Windows:** complete `revu-remote-ryzen-terminal-proof-v1`.
3. **Optional:** dispatch `wsl2-canonical-setup` for full repo library pin.
4. **Operator:** commit Cross-Agent harvest + run hub index publication on WESLEYDESK GHA if `INDEX.md` derived block must refresh.
