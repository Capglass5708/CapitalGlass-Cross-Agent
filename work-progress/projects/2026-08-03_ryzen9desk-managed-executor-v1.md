# Project: ryzen9desk-managed-executor-v1

## Summary

Make RYZEN9DESK a **persistent managed execution node** so WESLEY_WORK submits approved jobs instead of opening a fresh SSH session (or pretending to be the target host) for every mission. Solves the `ryzen9desk-wsl2-canonical-workspace-v1` wrong-host blocker and establishes the operating model for GPU, estimating, MCP, and verification work on the RTX 5080 desk.

## Workspace

| Field | Value |
| --- | --- |
| Work package | `ryzen9desk-managed-executor-v1` |
| Date opened | 2026-08-03 |
| Source | Wesley / Cursor architecture recommendation |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | CapitalGlass-Office-Admin (network/Tailscale), CG-Platform-Governance-MCP (ledger) |
| Execution repo | CG-AppBuilder-MCP (runner install, workflows, allowlists) |
| Status | **Phase 0 — CODE_READY_FOR_RUNNER_BOOTSTRAP** |

## Repositories involved

| Repo | Role |
| --- | --- |
| CG-AppBuilder-MCP | Self-hosted runner install scripts, dispatch workflow, allowlisted job profiles, receipt emitters |
| CapitalGlass-Cross-Agent | Work package ledger, approval references, operator runbooks |
| CapitalGlass-Office-Admin | Tailscale/MagicDNS identity (`cg-ryzen9desk-01`), Windows host bridge allowlist |
| capital-glass-agent-ops | Future: durable job queue if GitHub dispatch is insufficient |

## Architecture layers

| Layer | Purpose |
| --- | --- |
| Tailscale / MagicDNS | Stable private identity (`cg-ryzen9desk-01` / `ryzen9desk`) |
| Key-based SSH | Bootstrap, repair, emergency access only — not daily operations |
| RYZEN9DESK WSL worker | Always-on service: Git, agents, builds, GPU jobs, verification |
| Windows host bridge | Scheduled/service execution for Windows-only ops (narrow allowlist) |
| Cross-Agent / Supabase | Job state, approvals, receipts, machine status |
| GitHub | Source transport — **not** live folder sync |

## Valuable decisions

| Date/time | Decision | Reason |
| --- | --- | --- |
| 2026-08-03 | Fastest ROI = self-hosted GitHub Actions runner in RYZEN9DESK WSL2 as systemd service | Official service support; no custom remote shell; concurrency + artifacts built in |
| 2026-08-03 | No arbitrary workflow inputs become shell commands | `job_profile` maps to fixed allowlisted npm scripts only |
| 2026-08-03 | SSH retained as recovery channel only | Operator bootstrap and break-glass |
| 2026-08-03 | No Synology/OneDrive/SMB live git sync | GitHub is transport; ext4 `~/repos` is canonical on each host |
| 2026-08-03 | Windows bridge is separate narrow allowlist | WSL cannot do taskbar pins, drive maps, Revu host ops reliably |
| 2026-08-03 | Supersedes ad-hoc SSH-per-mission for routine work | Prior WP blocked because agent ran on WESLEY_WORK |

## Relationship to prior work

| Prior package | Relationship |
| --- | --- |
| `ryzen9desk-wsl2-canonical-workspace-v1` | **First dispatched job** — `job_profile: wsl2-canonical-setup` on RYZEN9DESK executor |
| `wsl-mcp-cursor-doppler-promptops-hardening-v1` | WESLEY_WORK model to reuse; executor runs same scripts on RYZEN9DESK profile |

## Delivered / reported complete

- Architecture decision record (this file)
- AppBuilder work package spec: `CG-AppBuilder-MCP/docs/work-packages/ryzen9desk-managed-executor-v1.md`
- Dispatch workflow scaffold: `.github/workflows/ryzen9desk-executor-dispatch.yml`
- Allowlist + preflight scripts under `scripts/executor/`
- Runner install script: `scripts/executor/install-github-runner-wsl-service.sh`

## Evidence / artifact paths

| Artifact | Path | Status |
| --- | --- | --- |
| Work package spec | `CG-AppBuilder-MCP/docs/work-packages/ryzen9desk-managed-executor-v1.md` | Scaffolded |
| Dispatch workflow | `CG-AppBuilder-MCP/.github/workflows/ryzen9desk-executor-dispatch.yml` | Scaffolded |
| Job allowlist | `CG-AppBuilder-MCP/scripts/executor/ryzen9desk-executor-allowlist.json` | Scaffolded |
| Executor preflight | `CG-AppBuilder-MCP/scripts/executor/ryzen9desk-executor-preflight.mjs` | Scaffolded |
| Runner install | `CG-AppBuilder-MCP/scripts/executor/install-github-runner-wsl-service.sh` | Scaffolded |
| First job receipts | `CG-AppBuilder-MCP/artifacts/agent-runs/ryzen9desk-managed-executor-v1/` | Pending on RYZEN9DESK |

## Verification

| Command / check | Result | Notes |
| --- | --- | --- |
| Runner registered with labels `self-hosted,ryzen9desk,wsl2,gpu` | Pending | One-time on RYZEN9DESK |
| `workflow_dispatch` smoke job | Pending | `job_profile: executor-smoke` |
| `ryzen9desk-wsl2-canonical` via dispatch | Pending | Unblocks prior WP |
| Machine identity preflight on runner | Pending | Must FAIL on WESLEY_WORK, PASS on RYZEN9DESK |

## Blockers / warnings

| Blocker | Owner | Required action |
| --- | --- | --- |
| Runner not installed on RYZEN9DESK | Operator | Run install script once; register with GitHub org/repo |
| Prior WP tooling may not be on `main` | CG-AppBuilder-MCP | Push executor scaffold + ryzen9desk runbook branch |
| Windows bridge not built | CapitalGlass-Office-Admin | Phase 2 — scheduled-task allowlist |
| Cursor shortcut / Remote-WSL confirm | Operator | Remains manual; not automatable via WSL worker |

## Daily operation (target)

On WESLEY_WORK Cursor:

> Submit `ryzen9desk-wsl2-canonical-workspace-v1` to the RYZEN9DESK executor and monitor its receipt.

Executor returns: `PASS` | `HOLD` | `BLOCKED` | `FAILED` with artifact receipts. No interactive SSH.

## Phase plan

| Phase | Scope | Status |
| --- | --- | --- |
| 0 | GitHub self-hosted runner + dispatch workflow + allowlist | **In progress** |
| 1 | First production job: `ryzen9desk-wsl2-canonical-workspace-v1` | Pending runner |
| 2 | Windows host bridge (drive maps, MCP quarantine, shortcuts) | Planned |
| 3 | Cross-Agent / Supabase job ledger + approval gates | Planned |
| 4 | Agent-loop mission integration | Planned |

## Forbidden

- Live-sync git working directories via Synology, OneDrive, or SMB
- Share one `.git` directory between Windows and WSL
- Unrestricted remote shell through Supabase
- Arbitrary workflow inputs → shell commands
- Eliminate SSH entirely (recovery channel stays)

## Next actions

| Priority | Action | Owner | Status |
| --- | --- | --- | --- |
| 1 | Push AppBuilder executor scaffold to branch RYZEN9DESK can fetch | CG-AppBuilder-MCP | Pending |
| 2 | On RYZEN9DESK WSL: install runner service + labels | Operator | Pending |
| 3 | Dispatch `executor-smoke` workflow; confirm receipt artifact | Operator | Pending |
| 4 | Dispatch `wsl2-canonical-setup` for prior WP | Operator | Pending |
| 5 | Document Windows bridge allowlist in Office-Admin | CapitalGlass-Office-Admin | Planned |

## Reusable lessons

- **Wrong-host execution is a class of failure** — persistent executor + machine-identity preflight prevents WESLEY_WORK agents from claiming RYZEN9DESK outcomes.
- **GitHub Actions self-hosted runner is the fastest managed-executor MVP** before building custom Supabase job queue.
- **Allowlist job profiles, not commands** — workflow inputs select profiles; profiles map to fixed npm scripts.

## Update log

### 2026-08-03 — Cursor

- Architecture approved; work package opened as successor to blocked `ryzen9desk-wsl2-canonical-workspace-v1`.
- Phase 0 scaffolding prepared in CG-AppBuilder-MCP.
