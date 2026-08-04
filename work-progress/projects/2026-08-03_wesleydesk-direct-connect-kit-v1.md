# Project: wesleydesk-direct-connect-kit-v1

## Summary

WESLEYDESK Direct Connect kit for **Cross-Agent index publication** runner — Slice 6 execution host. Deployed via `ESTABLISH_WESLEYDESK.sh` (SSH+tar; desk WSL has no Z:).

## Workspace

| Field | Value |
| --- | --- |
| Work package | `wesleydesk-direct-connect-kit-v1` |
| Owner repo | CapitalGlass-Office-Admin |
| Kit path | `Z:\Office\Wes\Direct Connect\WesleyDesk Direct Connect\` |
| Desk install | `~/direct-connect/wesleydesk` |
| Runner | `wesleydesk-wsl2-cross-agent` labels `[self-hosted, wesleydesk, wsl2]` |
| Status | **RUNNER_ONLINE_DEPS_INCOMPLETE** |
| Verdict | **HOLD** |

## Thread evidence (2026-08-03)

- Kit created: `AGENT_START_HERE.md`, `wsl/01-install-cross-agent-runner.sh`, `04-runner-health.sh`, `ESTABLISH_WESLEYDESK.sh`
- L: hub mount on desk WSL: PASS
- systemd runner service: **active**
- `wesleydesk.env` `RUNNER_SERVICE` name mismatch → health script false negative
- `CG-AppBuilder-MCP` at `/home/wesle/repos/` — clone **incomplete** (SSH timeout)
- Run `30861642734` @ `3e51aa7`: **failed** — runner `2.323.0` cannot run `actions/checkout` (`node24` unsupported); Ryzen uses `2.336.0`

## Do not advance

- `THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL` until publication + parity + blind retrieval + idempotency pass
- Re-dispatch cancelled run `30861202361`

## Next action

Upgrade desk runner to **2.336+**, complete AppBuilder clone + `/home/wesle/repos` symlink, fix `wesleydesk.env` service name, re-dispatch `index-publication.yml` at `3e51aa7`.
