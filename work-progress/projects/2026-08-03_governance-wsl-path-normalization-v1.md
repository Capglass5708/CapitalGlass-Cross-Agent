# Project: governance-wsl-path-normalization-v1

## Summary

Prerequisite gate repair — WSL path normalization maps `C:/Developer/repos/*` → `$HOME/repos` for Governance MCP tests on WSL.

## Workspace

| Field | Value |
| --- | --- |
| Work package | `governance-wsl-path-normalization-v1` |
| Owner repo | CG-Platform-Governance-MCP |
| Status | **GATE_REPAIR_COMPLETE — needs scoped PR** |

## Verification (scoped)

| Gate | Result |
| --- | --- |
| `governance-lifecycle-equivalence.test.mjs` | 12/12 PASS |
| `cross-platform-repo-path.test.mjs` | 3/3 PASS |
| Full `npm test` on mixed branch | 138/140 (2 failures not path-related) |

## Next action

Scoped PR from `main` with path-only files.

## Do not advance

- Claim full Governance test suite PASS from mixed-branch 138/140
