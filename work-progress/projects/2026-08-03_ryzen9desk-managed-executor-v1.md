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
| Status | **CODE_READY_FOR_RUNNER_BOOTSTRAP** |

**State machine (honest progression — do not skip):**

| Verdict | Meaning | Gate |
| --- | --- | --- |
| `CODE_READY_FOR_RUNNER_BOOTSTRAP` | Phase 0 code complete on WESLEY_WORK; PR open | **Current** — awaiting PR #268 merge to `main` |
| `MANAGED_EXECUTOR_ONLINE` | Persistent runner proven on RYZEN9DESK | `executor-smoke` receipt from RYZEN9DESK only |
| `PARTIAL_REMOTE_PASS` | Remote acceptance without GUI | After full readonly profile chain |
| `PASS` | Operator GUI acceptance recorded | Cursor Remote-WSL confirmed on RYZEN9DESK |

**Next real checkpoint:** [PR #268](https://github.com/Capglass5708/CG-AppBuilder-MCP/pull/268) merged to `main` — not runner install yet.

**After merge:** install from RYZEN9DESK WSL on `main`. First meaningful proof = `executor-smoke` receipt produced by RYZEN9DESK → advance to `MANAGED_EXECUTOR_ONLINE`.

Do not claim RYZEN9DESK outcomes from WESLEY_WORK preparation.

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
| 2026-08-03 | `workflow_dispatch` requires workflow on `main` — feature branch alone insufficient | GitHub only exposes dispatch reliably from default branch |

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
| 1 | **Merge PR #268 to `main`** | WESLEY_WORK / reviewer | **Next checkpoint** |
| 2 | Create runner group + environment (after merge) | Operator (GitHub UI) | Blocked on #1 |
| 3 | RYZEN9DESK WSL: `main` pull + runner install | RYZEN9DESK | Blocked on #1–#2 |
| 4 | Dispatch `executor-smoke` → receipt from RYZEN9DESK → `MANAGED_EXECUTOR_ONLINE` | WESLEY_WORK dispatch | Blocked on #3 |
| 5 | Remaining dispatch chain (host-preflight → … → full-acceptance-readonly) | Operator | After #4 |

## Reusable lessons

- **Wrong-host execution is a class of failure** — persistent executor + machine-identity preflight prevents WESLEY_WORK agents from claiming RYZEN9DESK outcomes.
- **GitHub Actions self-hosted runner is the fastest managed-executor MVP** before building custom Supabase job queue.
- **Allowlist job profiles, not commands** — workflow inputs select profiles; profiles map to fixed npm scripts.

### Dispatch order (after merge to `main` + runner online)

1. `executor-smoke`
2. `host-preflight`
3. `repo-library-preflight`
4. `wsl2-canonical-setup` (requires environment approval)
5. `gpu-smoke`
6. `mcp-verify` (requires environment approval)
7. `storage-verify`
8. `full-acceptance-readonly`

## Update log

### 2026-08-03 — State machine discipline

- Verdict stays `CODE_READY_FOR_RUNNER_BOOTSTRAP` until PR #268 merges — not runner install.
- Advance to `MANAGED_EXECUTOR_ONLINE` only after `executor-smoke` receipt from RYZEN9DESK.
- Avoids “prepared on WESLEY_WORK, claimed on RYZEN9DESK” failure mode.
