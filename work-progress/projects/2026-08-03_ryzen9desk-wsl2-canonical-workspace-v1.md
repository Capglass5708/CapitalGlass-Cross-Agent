# Work package: ryzen9desk-wsl2-canonical-workspace-v1

**Verdict:** `BLOCKED` (wrong execution host — prepared on WESLEY_WORK)  
**Owner repo:** `CG-AppBuilder-MCP` (tooling + receipts); live execution on RYZEN9DESK  
**Last updated:** 2026-08-03

---

## Goal

Make RYZEN9DESK use WSL2 as the default Cursor and Capital Glass agent environment, reusing the proven WESLEY_WORK WSL-first model with RYZEN9DESK-specific paths, RTX 5080 GPU role, and estimating workspace.

---

## Status

| Phase | Status |
| --- | --- |
| Intelligence Hub / prior-work acknowledgement | Done on WESLEY_WORK |
| Machine profile + parameterized scripts | Implemented in AppBuilder |
| RYZEN9DESK on-host discovery | **Not run** |
| ext4 repo library pin | **Not run** |
| Cursor shortcut + default workspace | **Not run** |
| MCP repair/verify | **Not run** |
| L:/Z: mount verification on RYZEN9DESK | **Not run** |
| GPU / Computer Estimator smoke | **Not run** |
| Restart + reopen acceptance | **Not run** |

---

## Prepared tooling (CG-AppBuilder-MCP)

- `scripts/wsl/machines/ryzen9desk.machine.json`
- `scripts/lib/wsl-machine-profile.mjs`
- `scripts/wsl/run-ryzen9desk-wsl2-canonical-workspace.mjs`
- `npm run ryzen9desk:wsl2-canonical`
- `npm run cursor:wsl-default:ryzen9desk`
- Target workspace: `~/Capital-Glass-RYZEN9DESK.WSL.code-workspace`
- Target shortcut: `Capital Glass Cursor (RYZEN9DESK WSL)`

---

## Receipts

`CG-AppBuilder-MCP/artifacts/agent-runs/ryzen9desk-wsl2-canonical-workspace-v1/`

- `previous-work-acknowledgement.json`
- `discovery-receipt.json`
- `wesleywork-parity-matrix.json`
- `repo-library-receipt.json`
- `cursor-launch-receipt.json`
- `mcp-verification-receipt.json`
- `storage-mount-receipt.json`
- `gpu-smoke-receipt.json`
- `FINAL_REPORT.md`

---

## Next operator action

### A. WESLEY_WORK first

Commit and push `CG-AppBuilder-MCP` ryzen9desk tooling to a branch RYZEN9DESK can fetch. Cross-Agent ledger on `origin/main` (`d0fe917`) does **not** include `npm run ryzen9desk:wsl2-canonical`. See AppBuilder `prep-accessibility-receipt.json`.

### B. RYZEN9DESK (no blind `git pull`)

```bash
hostname
whoami
wslpath -w /
cd ~/repos/CG-AppBuilder-MCP
git status --short --branch
git remote -v
git fetch origin
git log --oneline --left-right --cherry HEAD...@{upstream}
```

If clean and no unpublished local commits:

```bash
git pull --ff-only
npm run ryzen9desk:wsl2-canonical
nvidia-smi
```

Windows PowerShell: `wsl --shutdown`

Launch **Capital Glass Cursor (RYZEN9DESK WSL)**, then:

```bash
cd ~/repos/CG-AppBuilder-MCP
npm run cursor:wsl-default:ryzen9desk:verify:json
npm run wsl:mcp:verify
nvidia-smi
```

**Unproven until acceptance:** WSL user `wesley`, distro `Ubuntu-24.04`, repo migration safety, L:/Z:, RTX 5080 in WSL, workspace reopen, MCP on target. Update verdict to `PASS` only after restart-and-reopen acceptance.

---

## Index / cache log

- `INDEX_HIT` (L: master index slices)
- `CACHE_MISS` (harvest compact pack not in ext4 checkout)
