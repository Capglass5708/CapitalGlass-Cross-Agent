# Project: WESLEYDESK_DIRECT_CONNECT_EXECUTION_V1

## Summary

Register **CG-WESLEYDESK-01** as a deterministic Direct Connect execution target. Direct Connect itself already works. This work package is blocked until Desk exists as a fail-closed, pin-only executor — not because the bus is down, and not by sending the mission to Ryzen.

## Workspace

| Field | Value |
| --- | --- |
| Work package | `WESLEYDESK_DIRECT_CONNECT_EXECUTION_V1` |
| Alias | `wesleydesk-direct-connect-execution-v1` |
| Owner repo (control-plane) | CapitalGlass-Office-Admin |
| Index repo | CapitalGlass-Cross-Agent |
| Host activation | CG-WESLEYDESK-01 (later slice; not this WESLEY_WORK slice) |
| Expected runner | `wesleydesk-wsl2-CG-WESLEYDESK-01` |
| Dispatch workflow (declared, not proven) | `wesleydesk-executor-dispatch.yml` |
| `targetHost` | `CG-WESLEYDESK-01` |
| Current state | **REGISTERED_PENDING_HOST_ACTIVATION** |
| PASS state | **INDEXED_READY** only |
| Current verdict | **HOLD:NO_RUNNER_BINDING+INDEX_MISS+CONTROLLER_LEASE_LOST** until this slice lands; then HOLD for host activation, not for “Direct Connect generally” |

## State machine (do not skip)

`UNKNOWN` → `REGISTERED_PENDING_HOST_ACTIVATION` → `HOST_IDENTITY_PROVEN` → `EXECUTOR_BOUND` → `ONLINE_IDLE` → `DISPATCH_PROVEN` → `INDEXED_READY`

Indexing Desk **before** live host proof is allowed **only** as declared/pending. Git/Hub must not claim READY, ONLINE, or executable until a WESLEYDESK host session supplies that evidence.

`WESLEYDESK_DIRECT_CONNECT_EXECUTION_V1=PASS` is permitted **only** at `INDEXED_READY`.

## Sequence (fixed)

1. **WESLEY_WORK control-plane** (this slice): valid controller lease; isolated worktree; do not dispatch to Ryzen; add Desk to target/routing; WP/index pointer; declare expected runner; mark pending host activation.
2. **CG-WESLEYDESK-01 host activation**: machine registry resolves Desk; recover GHA runner; bind; persist service; prove GitHub ONLINE/IDLE; publish host capability evidence.
3. **Deterministic routing convergence**: `targetHost=CG-WESLEYDESK-01` resolves only to Desk; scheduler must not choose Ryzen; unknown/offline Desk fail closed.
4. **Real governed dispatch**: bounded Direct Connect mission on `wesleydesk-wsl2-CG-WESLEYDESK-01`; actual host CG-WESLEYDESK-01; GitHub run/job evidence; runner returns ONLINE/IDLE.
5. **Index publication**: receipt in Git; Hub/cross-desk/host-authority update; fresh-session `INDEX_HIT`; `Raw scan required: NO`.

## Do not

- Manufacture ONLINE/READY/executable proof from this WESLEY_WORK session
- Dispatch this WP to RYZEN9DESK
- Treat Ryzen runner-online as Desk proof
- Write L: from Cursor; Hub publication is a later step after Git truth
- Conflate the old kit runner `wesleydesk-wsl2-cross-agent` (`wesleydesk-direct-connect-kit-v1`) with `wesleydesk-wsl2-CG-WESLEYDESK-01`

## Next action

CG-WESLEYDESK-01 host activation session: inspect/recover the existing GHA runner, bind the exact name above, persist as a service, prove GitHub ONLINE/IDLE. Do not claim PASS.
