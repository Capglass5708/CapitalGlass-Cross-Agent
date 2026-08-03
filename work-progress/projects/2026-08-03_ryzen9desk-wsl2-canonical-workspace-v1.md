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

## Next operator action (RYZEN9DESK)

```bash
cd ~/repos/CG-AppBuilder-MCP
git pull
npm run ryzen9desk:wsl2-canonical
```

Then `wsl --shutdown`, reopen **Capital Glass Cursor (RYZEN9DESK WSL)**, pin taskbar, run `npm run cursor:wsl-default:ryzen9desk:verify:json`, and update this verdict to `PASS` only if full acceptance passes.

---

## Index / cache log

- `INDEX_HIT` (L: master index slices)
- `CACHE_MISS` (harvest compact pack not in ext4 checkout)
