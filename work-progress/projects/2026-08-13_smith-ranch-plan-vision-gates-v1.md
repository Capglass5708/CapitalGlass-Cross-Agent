# Project: smith-ranch-plan-vision-gates-v1

## Summary

Smith Ranch Plan Vision expansion blocked by missing CAS rasters on Ryzen admit and SMB `copystat` failures on L: harvest publication. Gate fixes shipped on Computer-Estimator- feature branch and CG-AppBuilder-MCP main executor.

## Workspace

| Field | Value |
| --- | --- |
| Work package | `smith-ranch-plan-vision-admit-v1` / `rtx5080-vision-plane-w7-dino-sam2-corpus-v1` |
| Date | 2026-08-13 |
| Coordination | CapitalGlass-Cross-Agent |
| Execution | Computer-Estimator- + CG-AppBuilder-MCP (Ryzen) |

## Evidence

| Artifact | Location |
| --- | --- |
| CE fix | PR #26 @ c3965d7 |
| Executor CAS sync | PR #374 @ a031d062 |
| Admit dispatch | GHA 31748183973 |
| Harvest | `harvest-2026-08-13-smith-ranch-plan-vision-gates-v1` |

## Update log

### 2026-08-13 — Gate fixes + harvest Git durability

- SMB-safe L publish, CAS resolve, partial admit verdict on CE feature branch.
- CAS shard sync in Ryzen admit/harvest executor profiles on AppBuilder main.
