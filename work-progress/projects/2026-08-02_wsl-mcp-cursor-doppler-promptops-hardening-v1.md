# Project: wsl-mcp-cursor-doppler-promptops-hardening-v1

## Summary

Capture the WSL MCP repair waves, Cursor terminal-flash diagnosis, Doppler MCP token repair, PromptOps CI unblocker, and related operator actions so future agents can recover the Capital Glass Cursor/MCP control-plane state without relying on pasted chat notes.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | `wsl-mcp-cursor-doppler-promptops-hardening-v1` |
| Work package | `wsl-mcp-cursor-doppler-promptops-hardening-v1` |
| Date opened | 2026-08-02 |
| Source | Wesley pasted Cursor output / ChatGPT extraction |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | CG-Platform-Governance-MCP for protocol/closeout authority |
| Execution repo | CG-AppBuilder-MCP |
| Related repos | CapitalGlassRevu, cg-apps-hub, CapitalGlass-BidComposer, CapitalGlass-Office-Admin, Computer Estimator |
| Status | **Active — L: online via Tailscale; seed in progress; Cursor still HOST_MODE_BLOCKED until ext4 reopen** |

## Repositories involved

| Repo | Role |
| --- | --- |
| `CG-AppBuilder-MCP` | Execution owner for WSL MCP repair, PromptOps, app spoke wiring, repair pipeline, attest/smoke/gate scripts |
| `CapitalGlass-Cross-Agent` | Coordination ledger and project notes only |
| `CapitalGlassRevu` | PR #5 Revu foundation/doc/preflight fixes |
| `cg-apps-hub` | Downstream PromptOps/Validate rerun target; latest observed Vercel failures after PR #267 merge |
| `CapitalGlass-BidComposer` | Downstream PromptOps/Validate rerun target; latest observed Vercel success |
| `CapitalGlass-Office-Admin` | Separate deploy-gate / Windows actor investigation if still failing |
| `Computer Estimator` | WSL `~/repos` clone/symlink target for learning-scope and MCP coherence |

## Authority / ownership rule

Cross-Agent records status, decisions, evidence pointers, and next actions. Implementation remains in the owning repos. WSL MCP repair and PromptOps fixes belong in `CG-AppBuilder-MCP`; Revu preflight/doc fixes belong in `CapitalGlassRevu`; downstream workflow reruns belong in their app repos or GitHub Actions.

## Valuable decisions

| Date/time | Decision | Reason |
| --- | --- | --- |
| 2026-08-02 CT | WSL2 ext4 `~/repos` is canonical for Cursor/MCP/app-agent work | Avoids stale `/mnt/c` clones, Windows path mangling, NTFS perf/path issues, and inconsistent MCP launcher roots |
| 2026-08-02 CT | Cursor may run on Windows, but active repos should open via Remote WSL / Ubuntu-24.04 | Keeps UI/native apps on Windows while agent shell, npm, MCP, and tests run in bash on ext4 |
| 2026-08-02 CT | Doppler MCP launchers should read `integrations.env` directly, not wrap with `doppler run` | Missing/stale token env caused Doppler launcher exit; `doppler run` pattern hid the real source of truth |
| 2026-08-02 CT | Cloudflare MCP should stay disabled/stopped until OAuth loopback port `127.0.0.1:15170` is stable | Prevents reconnect/OAuth browser loop and startup cmd flashes |
| 2026-08-02 CT | PromptOps collect must prefer ext4 `$HOME/repos` when `CG_REPOS_ROOT` points at `/mnt/*` | Stale NTFS clones caused refreshed suite indexes to appear unchanged and kept CI red |
| 2026-08-02 CT | Do not chase BidComposer PromptOps drift before AppBuilder PR #267 is merged | PR #267 refreshes upstream suite prompt index and ext4 fallback |

## Delivered / reported complete

### WSL MCP repair Wave 1 / Wave 2

- `npm run wsl:mcp:repair-all` unified the repair pipeline.
- `docs/runbooks/wsl-mcp-repair.md` and `docs/runbooks/wsl-mcp-next-roi.md` document repair and ROI waves.
- `Repair-Cursor-McpJson-Wsl.sh` wired preflight behavior.
- `resolveConfig` now prefers `~/repos` over `/mnt/c` when the control plane exists on ext4.
- User-level `~/.cursor/mcp.json` now uses `/home/wesle/repos/...` paths instead of `/mnt/c`.
- Both `~/repos` and `/mnt/c` project trees were repaired across 23 project MCP files.
- App spokes were patched with `MCP_API_URL`, `CG_APP_MCP_KIT`, and related env wiring.
- BidComposer `launch-tsx.mjs` launch pattern was applied, including `/mnt/c` clone compatibility pointing at the `~/repos` launcher.
- Duplicate `sharepoint` and `office-admin-mcp` project entries were deduped; empty Office Admin project `mcp.json` was deleted because Office Admin is served from user-level config.
- `wire-cursor-app-mcps.mjs` is WSL-aware and wires 8 app spokes into user MCP.
- `add-mcp-config.mjs` uses absolute Platform Intelligence paths on WSL.
- Railway session bridge is logged in.
- Durable bootstrap tests passed 20/20.

### WSL MCP Wave 3

| Item | Result |
| --- | --- |
| Computer Estimator on `~/repos` | Symlink created; learning-scope venv and `PYTHONPATH` patched |
| Doppler secret audit | `npm run wsl:mcp:audit-secrets`; `RAILWAY_API_TOKEN` still missing and optional |
| Single-tree policy | Repairs target `~/repos` only and skip `/mnt/c` when home clone exists |
| Launcher smoke test | `npm run wsl:mcp:smoke`; 31/31 pass |
| Pre-commit hook | Installed at `.githooks/pre-commit` via `npm run wsl:mcp:install-hooks` |
| Workspace validator | `npm run wsl:mcp:validate-workspace`; WSL workspace PASS; Data-Extraction still NTFS-only as expected |
| `launch-tsx` template | `templates/mcp/launch-tsx.mjs` plus `npm run scaffold:mcp:launch-tsx -- <repo>` |
| Drift detection | `npm run wsl:mcp:drift-check` plus weekly GitHub workflow |
| Doppler audit in repair-all | Added as Step 10 |
| `mcp:attest` in repair-all | Added as Step 11; verdict BLOCKED due to auth smoke / index parity, separate from MCP path repair |

Additional Wave 3 updates:

- `Capital Glass Suite.WSL.code-workspace` points Computer Estimator at `~/repos`.
- `repair-all-wsl-mcp.sh` expanded to 11 steps.
- `docs/runbooks/wsl-mcp-next-roi.md` updated with Wave 3 status and Wave 4 recommendations.

### Cursor flashing / terminal windows

Root cause was three stacked spawn sources:

1. Azure Cursor plugin `PostToolUse` hook fired after every agent tool call and spawned `pwsh.exe -> bash track-telemetry.sh`.
2. Windows-hosted agent shell commands spawned `Cursor.exe -> pwsh.exe -> powershell.exe`.
3. MCP startup/reconnects spawned bursts of `cmd.exe`, especially Cloudflare OAuth loopback failure on `127.0.0.1:15170`.

Current verification:

- Cursor via WSL/Ubuntu: Yes, Ubuntu-24.04.
- Workspace path: `/home/wesle/repos/CG-AppBuilder-MCP`.
- Agent shell: `/bin/bash`.
- `AZURE_MCP_COLLECT_TELEMETRY=false`.
- Current WSL window: Azure hook still no-ops through bash, 0 path failures.
- Legacy Windows-hosted window had 130 mangled path failures before WSL switch.
- 30-second process poll showed `pwsh.exe` count 0, `powershell.exe` count 3, `cmd.exe` count 8, `node.exe` count 28.
- No active Cloudflare reconnect storm in the last observed window; Cloudflare remained stopped/failed.


### WSL MCP path coherence verification

Latest pasted Cursor verification returned:

```text
VERDICT: PARTIAL
```

Fixed WSL-canonical env roots:

| Location | Value |
| --- | --- |
| `~/.cursor/integrations.env` | `LOOP_REPO_ROOT=/home/wesle/repos` |
| `~/.cursor/integrations.env` | `PROCEDURES_REPO_ROOT=/home/wesle/repos/Capital-Glass-Procedures-` |
| `~/.cursor/integrations.env` | `RAILWAY_MCP_PO_SERVER_CWD=/home/wesle/repos/capital-glass-po-app/server` |

Already WSL-canonical:

- `~/.cursor/mcp.json`: all 18 stdio/HTTP launchers use `/home/wesle/repos/...`.
- Active suite project `.cursor/mcp.json` files: clean.

Still Windows-pathed or not yet authoritative:

| Location | Reason |
| --- | --- |
| Cursor workspace root `/mnt/c/Developer/repos/*` | Session was opened from NTFS mount, not `/home/wesle/repos`; the `/mnt/c` project-dir was newer than the ext4 project-dir in Cursor metadata |
| `/mnt/c/Users/wesle/.cursor/mcp.json` | Windows-side config preserved intentionally; 8 servers still point at `C:/Developer/repos/...` |
| `/mnt/c/Users/wesle/.cursor/integrations.env` | Windows profile still has `RAILWAY_MCP_PO_SERVER_CWD=C:/Cursor Projects/...`; not WSL authority |
| Legacy worktree/archive `mcp.json` files | Inactive archives, not loaded by Cursor |
| `npm run wsl:mcp:preflight`, `gate`, `repair-all` in that session | Scripts were not present in the active `package.json`; `npm run wsl:mcp:verify` passed and `npm run wsl:mcp:repair` reported `NO_CHANGE` instead |

MCP status from the path-coherence check:

| State | Servers |
| --- | --- |
| Green / connected | `cg-app-mcp`, `cg-diagnostic`, `cg-suite-wiring`, `sharepoint`, `railway`, `github`, `doppler`, `agent-loop`, `failure-intelligence-mcp`, `office-admin-mcp`, `supabase`, `supabase-mcp-control`, Cloudflare HTTP variants, `capital-glass-platform-intelligence`, `azure` |
| Red / needs auth | `vercel` plugin, needs `mcp_auth` |
| Stopped / not active | Cloudflare stdio launcher absent from config; HTTP variants only |

Log checks:

- No new `pwsh.exe` storm.
- No mangled Azure hook `ENOENT` failures after WSL reopen.
- No new `EADDRINUSE 127.0.0.1:15170`; last conflict was earlier on stdio `user-cloudflare`, now disabled.

Required next action from that verification:

```text
Close the Cursor window and reopen the suite workspace from /home/wesle/repos/CG-AppBuilder-MCP, or the .code-workspace under ~/repos, not /mnt/c/Developer/repos.
```

### Doppler MCP repair

Root cause:

- `~/.cursor/integrations.env` had no working `DOPPLER_TOKEN` / `DOPPLER_MCP_TOKEN`.
- Doppler `cg-shared/dev` token copies were stale.
- `~/.cursor/mcp.json` used `doppler run ... node mcp-doppler-launch.mjs`; launchers should read from `integrations.env` directly.

Fixes reported:

- Refreshed token from working CLI auth.
- Updated `~/.cursor/integrations.env` and mirrored to `C:\Users\wesle\.cursor\integrations.env`.
- Updated Doppler canonical secrets: `DOPPLER_MCP_TOKEN`, `DOPPLER_TOKEN`, `CURSOR_DOPPLER_SERVICE_TOKEN`.
- Fixed Doppler MCP launcher to `node .../mcp-doppler-launch.mjs` only.
- Created encrypted vault backups under `D:\Admin Keys\Capital-Glass-IT-Vault\02-Secrets\04-Apps-Doppler`.
- Created no-secrets receipt: `D:\Admin Keys\CG-MACHINE-2\DOPPLER-MCP-REPAIR-2026-08-02.txt`.

Verification:

- `doppler me`: OK, Capital Glass Suite.
- MCP initialize probe: OK, `doppler-api-readonly` responded.
- `npm run integrations:sync-doppler`: OK.

### GitHub CI / PromptOps audit

Root cause:

- Stale `promptops/generated/suite-prompt-index.json` in `CG-AppBuilder-MCP` broke Closeout gate and app PromptOps gates.
- On WSL, `CG_REPOS_ROOT=/mnt/c/Developer/repos` caused `npm run prompts:collect` to index stale NTFS clones instead of ext4 `$HOME/repos`.

Live GitHub verification via connector:

| Repo | PR | Status | Merge commit |
| --- | --- | --- | --- |
| `Capglass5708/CG-AppBuilder-MCP` | #267 | Merged | `a3c967845542f1b21b680c0b22733c1bceaed747` |
| `Capglass5708/CapitalGlassRevu` | #5 | Merged | `94745296cefd3b900f50abc98ab19b9aa7fb57dc` |

PR #267 changed:

- `promptops/collect-lib.mjs`
- `promptops/generated/suite-prompt-index.json`
- `promptops/resolve-repos-root.mjs`
- `scripts/lib/app-bible-paths.mjs`
- `scripts/lib/ext4-protocol-repos-root.mjs`
- `scripts/tests/run-active-ledger-export.test.mjs`

PR #5 changed Revu application bible docs/status artifacts, `foundation-ci.mjs`, `controlled-proof.mjs`, WSL root-fs debris preflight guard, and WSL sync/publish scripts.

Downstream status checked before inspection stopped:

- `Capglass5708/cg-apps-hub` latest commit `ba2fb27d4f7f0e89aaf42e54b39b527b133badf4` still showed two Vercel failures: `Vercel - v0-capital-glass-apps-dashboard` and `Vercel - cg-apps-hub`.
- `Capglass5708/CapitalGlass-BidComposer` latest commit `93d87a27bcd6c925bb50d3a85c65573a0d6db773` showed Vercel success.


### Clean MCP authority state

Latest pasted Cursor status reports a cleaner MCP authority split:

| Item | State |
| --- | --- |
| Windows-host MCP config | Disabled by renaming `mcp.json` to `mcp.json.windows-disabled` |
| Active MCP authority | WSL `~/.cursor/mcp.json` only |
| Repo paths in `integrations.env` | Pointed at `/home/wesle/repos` |
| Flash recurrence warning | If flashes return, likely MCP reconnecting on Windows host again |
| Windows-side file to watch | `C:\Users\wesle\.cursor\mcp.json` should not be silently recreated |
| Remaining recommended alignment | Reopen workspace from `/home/wesle/repos/...`, not `/mnt/c/Developer/repos/...` |

Interpretation: the original Windows-host MCP flash source is disabled. The remaining recommendation is workspace-root alignment so the active Cursor session also matches WSL authority.


### WSL2 infrastructure and L: mount blocker

Latest pasted Cursor result reports WSL2 infrastructure is in place, but seeding remains blocked by host mode and L: reachability.

Root causes fixed or identified:

| Issue | Cause |
| --- | --- |
| `HOST_MODE_BLOCKED` | Cursor workspace opened on `/mnt/c/Developer/repos/...` NTFS instead of ext4 |
| Wrong `CG_REPOS_ROOT` | `.profile` and `.bashrc` forced `/mnt/c/Developer/repos` |
| Agent shells missed env | Non-interactive shells returned before `cursor-wsl.env` was sourced |
| Cross-Agent missing on ext4 | Repo only existed under NTFS |
| L: not readable in WSL | Windows L: unmapped; `\\\\192.168.1.109\\CapitalGlass-L` unreachable, error 67 |

Created / fixed in shell configuration:

| File | Change |
| --- | --- |
| `~/.bashrc` | Sources `cursor-wsl.env` before the interactive-only gate; removed NTFS `CG_REPOS_ROOT` override |
| `~/.profile` | Canonical ext4 paths only; sources `cursor-wsl.env` |
| `~/.config/capital-glass/cursor-wsl.env` | `CG_REPOS_ROOT=/home/wesle/repos`; `CG_AUTHORITY_CACHE_ROOT=/mnt/d/AI Cursur Cache`; hub path vars for L: plus Z: fallback |

New scripts reported in `~/repos/CG-AppBuilder-MCP`:

| Script | Purpose |
| --- | --- |
| `scripts/ci/ensure-wsl-l-hub-mount.sh` | Mount L: at `/mnt/l` using drvfs with SMB fallback |
| `scripts/ci/install-wsl-hub-drive-fstab.sh` | Persist Z:/L: in `/etc/fstab` |
| `scripts/wsl/bootstrap-cross-agent-ext4.sh` | Symlink Cross-Agent into `~/repos` |
| `scripts/wsl/ensure-windows-drive-maps.ps1` | Map Z:/L: on Windows |

Bootstrapped state:

| Item | Status |
| --- | --- |
| `/home/wesle/repos/CapitalGlass-Cross-Agent` | Symlink to NTFS checkout; readable; `ACTIVE_WORK.md` OK |
| Z: in WSL | Mounted at `/mnt/z` |
| WSL MCP repair | Applied through `Repair-Cursor-McpJson-Wsl.sh` |

Current status from pasted result:

| Check | Status |
| --- | --- |
| `CG_REPOS_ROOT=/home/wesle/repos` | PASS when `cursor-wsl.env` is sourced |
| Cross-Agent on ext4 | PASS |
| CG-AppBuilder-MCP on ext4 | PASS |
| Z: in WSL `/mnt/z` | PASS |
| L: in WSL `/mnt/l` | FAIL, WESLEYDESK LAN offline / `192.168.1.109` unreachable |
| `00-master-index` on L: | BLOCKED until L: maps |
| Cursor workspace path | FAIL, still `/mnt/c/Developer/repos` / `HOST_MODE_BLOCKED` |

Required operator sequence:

1. Reopen Cursor from WSL ext4:

```text
WSL: Connect to WSL -> Open Folder -> /home/wesle/repos/CG-AppBuilder-MCP
```

or use `Capital Glass Suite.WSL.code-workspace` from that path.

2. When on LAN with WESLEYDESK, map L: from Windows PowerShell:

```powershell
& \\\\wsl$\\Ubuntu-24.04\\home\\wesle\\repos\\CG-AppBuilder-MCP\\scripts\\wsl\\ensure-windows-drive-maps.ps1
```

3. Then in WSL:

```bash
sudo bash ~/repos/CG-AppBuilder-MCP/scripts/ci/install-wsl-hub-drive-fstab.sh
bash ~/repos/CG-AppBuilder-MCP/scripts/ci/ensure-wsl-l-hub-mount.sh
```

4. Re-run seed mission `cross-agent-seed-wsl-mcp-backfill-v1` from the ext4 workspace once L: shows `00-master-index`.

Important rule:

```text
L: cannot be faked locally. It depends on \\\\192.168.1.109\\CapitalGlass-L on WESLEYDESK. Z: is up, but the Intelligence Hub lives on L:, not Z:.
```


### Seed mission report - cross-agent-seed-wsl-mcp-backfill-v1

Latest pasted seed mission report:

| Field | Value |
| --- | --- |
| Verdict | **HOLD (partial PASS)** |
| Core seed promotion | PASS |
| Structured-ledger ingest | BLOCKED by operator approval gate |
| Drift | UNKNOWN because Supabase projection was not refreshed |
| Project ID | `wsl-mcp-cursor-doppler-promptops-hardening-v1` |
| Seed ID | `wsl-mcp-cursor-doppler-promptops-hardening-v1` |
| Cross-Agent commit | `1c0bd9f` pushed to `origin/main` |
| Source commit (Agent Fast Path) | `f2b3cfa` |
| Compact hash | `5b619c288243af955efdea51b359349834284abb998f92d8186d8149d479aacb` |
| L: mirror | `/mnt/l/Capital-Glass-Intelligence-Hub/02-catalog/cross-agent-notes/wsl-mcp-cursor-doppler-promptops-hardening-v1.json` |
| `cross-agent-notes:seed --apply` | PASS |
| `cross-agent-notes:verify` | PASS |

Drift result:

```text
cross-agent-ledger:drift-probe -> SUPABASE_PROJECTION_MISSING
```

Ingest receipt reported:

```text
BLOCKED_OPERATOR_APPROVAL
11 actions, 10 blockers exported
```

Evidence paths:

| Evidence | Path / Status |
| --- | --- |
| Apply receipt | `~/repos/CG-AppBuilder-MCP/artifacts/agent-runs/cross-agent-notes-seeding-v1/wsl-mcp-cursor-doppler-promptops-hardening-v1/apply-result.json` |
| Ingest receipt | `~/repos/CG-AppBuilder-MCP/artifacts/agent-runs/cross-agent-structured-ledger-projection-v1/ingest-apply-receipt.json` |
| L: hub index | `/mnt/l/Capital-Glass-Intelligence-Hub/00-master-index`, readable |

Host check:

| Check | Status |
| --- | --- |
| Workspace PWD | `/mnt/c/Developer/repos/CG-AppBuilder-MCP` — `HOST_MODE_BLOCKED` |
| `CG_REPOS_ROOT` | `/home/wesle/repos` PASS |
| L: mounted | PASS through `\\\\wesleydesk\\CapitalGlass-L` via Tailscale |
| `00-master-index` | PASS |

What was delivered in Cross-Agent:

- Agent Fast Path section on the WSL MCP project file.
- Seed manifest and provenance pins.
- Handoff updated: L: blocker cleared, ext4 workspace still HOLD.
- Cross-Agent pushed at `1c0bd9f`.

Required next action:

```bash
export CG_PLATFORM_GOVERNANCE_ROOT=/mnt/c/Developer/repos/CG-Platform-Governance-MCP
cd ~/repos/CG-AppBuilder-MCP
npm run cross-agent-ledger:ingest -- --apply
npm run cross-agent-ledger:drift-probe
```

But first reopen Cursor from:

```text
/home/wesle/repos/CG-AppBuilder-MCP
```

Note: ext4 `~/repos/CG-Platform-Governance-MCP` is missing the schema approval file. Sync or symlink that repo to unblock ingest without NTFS fallback.

## Evidence / artifact paths

| Artifact | Path / link | Status |
| --- | --- | --- |
| WSL repair runbook | `CG-AppBuilder-MCP/docs/runbooks/wsl-mcp-repair.md` | Reported updated |
| WSL next ROI runbook | `CG-AppBuilder-MCP/docs/runbooks/wsl-mcp-next-roi.md` | Reported updated through Wave 3 |
| Repair orchestrator | `CG-AppBuilder-MCP/scripts/wsl/repair-all-wsl-mcp.sh` | Reported expanded to 11 steps |
| Doppler no-secrets receipt | `D:\Admin Keys\CG-MACHINE-2\DOPPLER-MCP-REPAIR-2026-08-02.txt` | Reported written |
| Doppler encrypted vault backups | `D:\Admin Keys\Capital-Glass-IT-Vault\02-Secrets\04-Apps-Doppler` | Reported written; secrets not copied here |
| AppBuilder PR #267 | `https://github.com/Capglass5708/CG-AppBuilder-MCP/pull/267` | Merged |
| Revu PR #5 | `https://github.com/Capglass5708/CapitalGlassRevu/pull/5` | Merged |

## Verification

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm run wsl:mcp:repair-all` | PASS | Full 11-step pipeline after Wave 3 except `mcp:attest` BLOCKED on auth/index parity |
| `npm run wsl:mcp:preflight` | PASS | Project config check |
| `npm run wsl:mcp:gate` | PASS reported | CI-style gate on tracked `mcp.json` |
| `npm run wsl:mcp:smoke` | 31/31 PASS | Launcher syntax checks |
| `npm run wsl:mcp:validate-workspace` | PASS | Data-Extraction remains NTFS-only as expected |
| `npm run wsl:mcp:audit-secrets` | WARN | `RAILWAY_API_TOKEN` missing in Doppler `cg-shared/dev` |
| `npm run wsl:mcp:verify` | PASS | Path-coherence verification fallback command |
| `npm run wsl:mcp:repair` | `NO_CHANGE` | Path-coherence session fallback command |
| `test:wsl-mcp-durable-bootstrap` | 20/20 PASS | Durable bootstrap test |
| `doppler me` | OK | Capital Glass Suite |
| Doppler MCP initialize probe | OK | `doppler-api-readonly` responded |
| `npm run integrations:sync-doppler` | OK | Doppler sync successful |

## Blockers / warnings

| Blocker / warning | Owner repo / surface | Required action |
| --- | --- | --- |
| Cursor MCP reload needed after repair waves | Cursor / operator | `Cursor -> Settings -> MCP -> Reload` |
| Workspace-root alignment still recommended | Cursor / operator | Reopen from `/home/wesle/repos/CG-AppBuilder-MCP` or WSL `.code-workspace`, not `/mnt/c/Developer/repos` |
| Vercel MCP plugin red / needs auth | Cursor MCP / Vercel | Complete `mcp_auth` when Vercel MCP is needed |
| L: hub now readable in WSL | WESLEYDESK / L: hub | L: mounted via Tailscale; blocker cleared for L: access, but ingest still HOLD on host mode/operator approval |
| Cloudflare MCP stopped/failed on `EADDRINUSE 127.0.0.1:15170` | Cursor MCP / Cloudflare | Keep disabled or clear loopback port/OAuth conflict before enabling |
| Legacy Windows-hosted Cursor windows can still produce mangled Azure hook path failures | Cursor / operator | Close all Windows-hosted Cursor repo windows; keep only WSL workspace open |
| Some MCP launchers still referenced `C:/Developer/repos/...` during flash verification | CG-AppBuilder-MCP / Cursor MCP config | Finish WSL ext4 path migration if still present after reload |
| `RAILWAY_API_TOKEN` missing from Doppler `cg-shared/dev` | Doppler / Railway | Add token only if headless Railway fallback is needed |
| `mcp:attest` Step 11 BLOCKED | CG-AppBuilder-MCP | Investigate auth smoke / index parity separately from path repair |
| `cg-apps-hub` Vercel failures remained after PR #267 merge check | cg-apps-hub / Vercel | Re-run/inspect Validate and Vercel failures after PromptOps index merge |
| CapitalGlass-Office-Admin deploy-gate / MCP smoke may require Windows actor | Office Admin | Separate Windows actor investigation if still failing |

## Commits / PRs

| Repo | Commit / PR | Status |
| --- | --- | --- |
| `CG-AppBuilder-MCP` | PR #267 | Merged |
| `CG-AppBuilder-MCP` | Merge `a3c967845542f1b21b680c0b22733c1bceaed747` | Merged |
| `CapitalGlassRevu` | PR #5 | Merged |
| `CapitalGlassRevu` | Merge `94745296cefd3b900f50abc98ab19b9aa7fb57dc` | Merged |
| `cg-apps-hub` | `ba2fb27d4f7f0e89aaf42e54b39b527b133badf4` | Latest observed; Vercel failures |
| `CapitalGlass-BidComposer` | `93d87a27bcd6c925bb50d3a85c65573a0d6db773` | Latest observed; Vercel success |

## Next actions

| Priority | Action | Owner repo / surface | Status |
| --- | --- | --- | --- |
| 1 | Reload Cursor MCP after WSL repair waves | Cursor / operator | Pending operator action |
| 2 | Re-run or inspect `cg-apps-hub` Validate/Vercel failures after PR #267 merge | cg-apps-hub | Pending |
| 3 | Keep Cloudflare MCP disabled until `127.0.0.1:15170` OAuth loopback conflict is resolved | Cursor MCP / Cloudflare | Pending |
| 4 | Add `RAILWAY_API_TOKEN` to Doppler `cg-shared/dev` only if headless fallback is required | Doppler / Railway | Optional |
| 5 | Investigate `mcp:attest` auth smoke / index parity separately | CG-AppBuilder-MCP | Pending |
| 6 | Investigate Office Admin deploy-gate / Windows actor only if still failing | CapitalGlass-Office-Admin | Pending |
| 7 | After ledger updates, run Cross-Agent ingest/drift flow | CG-AppBuilder-MCP | Recurring |

## Reusable lessons

- WSL ext4 `~/repos` must be treated as canonical for agent/MCP/runtime work; `/mnt/c` clones are compatibility/migration surfaces only.
- PromptOps and MCP repair commands should pin or resolve `CG_REPOS_ROOT` defensively so stale NTFS clones cannot silently drive CI state.
- Cursor terminal flashing can be a stacked systems issue: plugin hook, host-mode shell chain, and MCP reconnect loops can all contribute.
- Token-bearing MCP launchers should have one clear local env source; wrapping MCP launchers with secret-manager commands can obscure failures.
- Cross-Agent should store operational facts, decisions, artifact pointers, verification results, and next actions, not secrets or implementation code.

## Agent Fast Path

**Work package:** `cross-agent-seed-wsl-mcp-backfill-v1`  
**Failure codes:** `HOST_MODE_BLOCKED`, `L_DRIVE_LAN_UNREACHABLE_USE_TAILSCALE`, `L_DRIVE_NOT_MOUNTED_IN_WSL`  
**Owner route:** CG-AppBuilder-MCP + Cursor-MCP-Kit (WSL repair); CapitalGlass-Office-Admin (Windows drive maps)  
**Canonical host:** WSL ext4 `$HOME/repos` — not `/mnt/c/Developer/repos`  
**Env authority:** `~/.config/capital-glass/cursor-wsl.env` (`CG_REPOS_ROOT=/home/wesle/repos`)

**Windows L: (WESLEY_WORK) — LAN first, Tailscale fallback:**

```powershell
net use L: \\192.168.1.109\CapitalGlass-L /persistent:yes
# if error 67:
net use L: \\wesleydesk\CapitalGlass-L /persistent:yes
```

**Scripted:** `CG-AppBuilder-MCP/scripts/wsl/ensure-windows-drive-maps.ps1`

**WSL after Windows L: mapped:**

```bash
bash ~/repos/CG-AppBuilder-MCP/scripts/ci/ensure-wsl-l-hub-mount.sh
```

**MCP repair:** `bash /mnt/c/Developer/repos/Cursor-MCP-Kit/Repair-Cursor-McpJson-Wsl.sh`

**Verify before material work:**

- `pwd` under `/home/wesle/repos` (not `/mnt/c/Developer/repos`)
- `test -d /mnt/l/Capital-Glass-Intelligence-Hub/00-master-index`
- `curl -fsS --max-time 3 "$MCP_API_URL/health"`

**Do not:** Git-mutate from NTFS workspace; use LAN-only L: map when Tailscale `wesleydesk` is reachable; paste secrets into env files.

## Update log

### 2026-08-02 CT — L: remounted via Tailscale; seed pipeline unblocked

- Windows L: mapped to `\\wesleydesk\CapitalGlass-L` (LAN `192.168.1.109` offline).
- WSL `/mnt/l/Capital-Glass-Intelligence-Hub/00-master-index` readable.
- Agent Fast Path added for `cross-agent-notes-seeding-v1` compact projection.
- Cursor workspace still on `/mnt/c/Developer/repos` until operator reopens ext4 root.

### 2026-08-02 CT — seed mission HOLD (partial PASS)

- `cross-agent-notes:seed --apply` PASS and `cross-agent-notes:verify` PASS.
- L: mirror written under `/mnt/l/Capital-Glass-Intelligence-Hub/02-catalog/cross-agent-notes/`.
- L: `00-master-index` readable; L: blocker cleared.
- Structured-ledger ingest blocked by operator approval gate: `BLOCKED_OPERATOR_APPROVAL`.
- Drift probe result: `SUPABASE_PROJECTION_MISSING`; drift remains UNKNOWN.
- Cursor session still opened from `/mnt/c/Developer/repos/CG-AppBuilder-MCP`, so `HOST_MODE_BLOCKED` remains.
- Next: reopen Cursor from `/home/wesle/repos/CG-AppBuilder-MCP`, sync/symlink Governance ext4 schema approval file, rerun ingest and drift probe.

### 2026-08-02 CT — WSL2 infrastructure in place; seed blocked by L: and host mode

- Shell config repaired so all shells can source `cursor-wsl.env` and resolve `CG_REPOS_ROOT=/home/wesle/repos`.
- Cross-Agent bootstrapped under `/home/wesle/repos/CapitalGlass-Cross-Agent` as a readable symlink to the NTFS checkout.
- Z: mounted at `/mnt/z`; L: failed because `\\192.168.1.109\CapitalGlass-L` is unreachable from the current network state.
- Cursor still needs to reopen from `/home/wesle/repos/CG-AppBuilder-MCP`; current session remains `HOST_MODE_BLOCKED` if opened from `/mnt/c/Developer/repos`.
- Seed mission must wait until L: shows `L:\Capital-Glass-Intelligence-Hub\00-master-index\`.

### 2026-08-02 CT — clean MCP authority state reported

- Windows-host MCP disabled by renaming `mcp.json` to `mcp.json.windows-disabled`.
- WSL `~/.cursor/mcp.json` is now the only active MCP authority.
- `integrations.env` repo paths point at `/home/wesle/repos`.
- Remaining recommendation: reopen Cursor workspace from `/home/wesle/repos/...` instead of `/mnt/c/Developer/repos/...`.
- Watch item: if flashes return, check whether `C:\Users\wesle\.cursor\mcp.json` was recreated.

### 2026-08-02 CT — path-coherence and Doppler backfill

- Backfilled latest Cursor path-coherence verdict: `PARTIAL`.
- Recorded fixed WSL env roots, clean WSL MCP launcher state, preserved Windows-side config, Vercel auth red state, and required reopen-from-`/home/wesle/repos` action.
- Reconfirmed Doppler MCP repair details and Wave 3 completion details from repeated pasted Cursor summaries.

### 2026-08-02 CT — ChatGPT extraction from pasted Cursor notes

- Extracted WSL MCP repair Waves 1-3, Cursor flash diagnosis, Doppler MCP repair, PromptOps CI audit, GitHub merge state, and remaining blockers from pasted notes.
- Created this project file as the durable Cross-Agent record.
- Secrets were not copied into this repo; only no-secret receipt and vault path pointers were recorded.
