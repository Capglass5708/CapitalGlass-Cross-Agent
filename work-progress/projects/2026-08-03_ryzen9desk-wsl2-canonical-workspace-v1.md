# Work package: ryzen9desk-wsl2-canonical-workspace-v1

**Verdict:** `IN_PROGRESS` — `vscode-automation` GHA PASS; VS Code remote workspace launched from Ryzen executor  
**Owner repo:** `CG-AppBuilder-MCP` (tooling + receipts); live execution on RYZEN9DESK  
**Last updated:** 2026-09-05

---

## Goal

Make RYZEN9DESK use WSL2 as the default Cursor/VS Code and Capital Glass agent environment, reusing the proven WESLEY_WORK WSL-first model with RYZEN9DESK-specific paths, RTX 5080 GPU role, and estimating workspace. **VS Code + Claude Code** is the primary chat surface (estate direction).

---

## Status (2026-09-05 remote CLI from CG-NIMO-01)

| Phase | Status |
| --- | --- |
| Managed executor runner online | **PASS** — `ryzen9desk-wsl2-CG-RYZEN9DESK-01` |
| `host-preflight` GHA | **PASS** — run `33932903479` |
| `dev-env-parity-apply` GHA | **PASS** — run `33932929030` |
| Claude CLI + admission gate | **PASS** — CLI 2.1.261; gate pinned to stable runtime |
| VS Code Windows + server + extensions | **PASS** — 1.136.1; `anthropic.claude-code` installed |
| `vscode-automation` GHA (pre-fix) | **FAIL** — false `VSCODE_NOT_INSTALLED` (wrong path check) |
| `vscode-automation` script fix | **MERGED** — AppBuilder `main` @ `94c71cca2`, `1346d1415` |
| `vscode-automation` GHA | **PASS** — run `33933473045` (`AUTOMATED_SETUP_COMPLETE`) |
| `mcp-verify` GHA | **FAIL** — `GATEWAY_HEALTH_VALIDATION_FAILED` (headless; Windows gateway) |
| ext4 repo library pin / wsl2-canonical full runbook | **Not run** |
| Restart + reopen acceptance | **Not run** |

---

## Index slice

`work-progress/intelligence-hub-slices/ryzen9desk-vscode-remote-bootstrap-v1.json`

Cross-desk routing pointer: `cross-desk-routing.json` → `ryzen9deskVscodeRemoteBootstrap`

---

## Prepared tooling (CG-AppBuilder-MCP)

- `scripts/wsl/machines/ryzen9desk.machine.json`
- `scripts/wsl/run-ryzen9desk-wsl2-canonical-workspace.mjs`
- `scripts/wsl/run-ryzen9desk-vscode-automation.mjs` — **fixed 2026-09-05** (`94c71cca2`, `1346d1415`): `/mnt/c` Code.exe discovery, CLI via Windows exe, remote workspace launch
- `npm run ryzen9desk:wsl2-canonical`
- `npm run ryzen9desk:vscode-automation:json`
- Target workspace: `~/repos/CG-AppBuilder-MCP/Capital-Glass-RYZEN9DESK.WSL.code-workspace`

---

## Remote dispatch (any host with `gh` + workflow scope)

```bash
gh workflow run ryzen9desk-executor-dispatch.yml \
  --repo Capglass5708/CG-AppBuilder-MCP \
  -f work_package_id=ryzen9desk-wsl2-canonical-workspace-v1 \
  -f job_profile=vscode-automation \
  -f approval_ref=remote-vscode-claude-bootstrap-v1
```

**Note:** `npm run dual-machine:ryzen:exec` remains **WESLEY_WORK-only**; use `gh workflow run` from other hosts.

---

## Receipts

- GHA artifacts: `ryzen9desk-executor-receipt-ryzen9desk-wsl2-canonical-workspace-v1-*`
- Parity apply: `ryzen9desk-dev-env-parity-apply-v1.json` (run `33932929030`)
- Index: `work-progress/intelligence-hub-slices/ryzen9desk-vscode-remote-bootstrap-v1.json`

---

## Next operator action

1. RDP to Ryzen to confirm VS Code + Claude Code panel if Windows session was inactive during launch.
2. Headless agent work: `npm run claude40:front-door -- --wp=<mission-id>` on Ryzen WSL.
3. Optional: dispatch `wsl2-canonical-setup` for full Cursor runbook; `mcp-verify` when Windows gateway reachable.

---

## Index / cache log

- `INDEX_HIT` / `FAILOVER_GIT_LEDGER` (L: stale; Git slice updated)
- `DIRECT_CONNECT_HIT` (runner online; SSH break-glass unavailable from NIMO)
