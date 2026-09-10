# Project: github-plane-legacy-path-retirement-v1

## Current milestone

| Field | Value |
| --- | --- |
| Parent milestone | `GITHUB_PLANE_ESTATE_MANDATORY_ENFORCEMENT_V1` |
| Work package | `github-plane-legacy-path-retirement-v1` |
| Current phase | **MAP_CALLER_COMPLETE** |
| Estate code | `GITHUB_PLANE_LEGACY_PATH_RETIREMENT_V1=MAP_CALLER_COMPLETE` |
| Next phase | **MIGRATE** (not DENY, not REMOVE) |
| Not claimed | `ESTATE_CALLER_INVENTORY=PASS` · `M8_GITHUB_PLANE_ESTATE_ENFORCED=PASS` · `CG_GIT_ESTATE_CONVERGENCE=DETERMINISTIC` |

Do not enable `CG_M8_DIRECT_WRITE_ENFORCEMENT=required` until MIGRATE of live callers is proven.

## Summary

Phase 2 of the parent GitHub Plane estate milestone. DISCOVER inventoried writers. MAP_CALLER bound each writer to a live caller/dependency graph. The estate can now answer who invokes each writer, what it can mutate, what depends on it, and which M8 path replaces it. Callers have not been rewritten yet.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | `github-plane-legacy-path-retirement-v1` |
| Work package | `github-plane-legacy-path-retirement-v1` |
| Date opened | 2026-09-10 |
| Source | Wesley / Cursor |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | CG-AppBuilder-MCP |
| Execution repo | CG-AppBuilder-MCP |
| Status | Active — MAP_CALLER complete on AppBuilder `main`; MIGRATE not started |

## Repositories involved

| Repo | Role |
| --- | --- |
| CG-AppBuilder-MCP | M8 plane, DISCOVER inventory, MAP_CALLER graph, G5 actuator |
| CapitalGlass-Cross-Agent | This ledger / current-milestone project file |
| Capglass5708 suite repos | Writer/caller surfaces listed in the graph (agent-ops, Revu, PG, BidComposer, Office Admin, etc.) |

## Authority / ownership rule

CG-AppBuilder-MCP owns M8 GitHub mutation. This Cross-Agent file is the coordination current-milestone pointer. Do not treat DISCOVER or MAP_CALLER as estate enforcement.

## Valuable decisions

| Date/time | Decision | Reason |
| --- | --- | --- |
| 2026-09-10 | Sequence is DISCOVER → MAP_CALLER → MIGRATE → DENY → REMOVE | Deleting `git push` from files without a caller graph leaves live bypasses |
| 2026-09-10 | Same `workId` continues across DISCOVER and MAP_CALLER | Durability ingest on MAP_CALLER hit `WORK_REF_CONTENT_CONFLICT` on `refs/cg-work/github-plane-legacy-path-retirement-v1`; PR merge is MAP_CALLER durability |
| 2026-09-10 | Operator shell and GitHub UI are not code-removable | DENY/rulesets after automation MIGRATE |

## Delivered / reported complete

- DISCOVER writer inventory on AppBuilder `main` (PR 631, merge `ff8c1a5760c075d879635bc0d40995d254e1e722`)
- MAP_CALLER live caller graph on AppBuilder `main` (PR 632, merge `96a40af6d826343880c4d993d5b6afe92cb47d45`)
- 39/39 DISCOVER writers mapped: 28 ACTIVE, 5 SUPERSEDED, 4 DORMANT, 2 RECOVERY_EXCEPTION, 0 UNRESOLVED

## Evidence / artifact paths

| Artifact | Path / link | Status |
| --- | --- | --- |
| DISCOVER inventory | `CG-AppBuilder-MCP/registry/github-plane/legacy-path-retirement-discover-inventory.v1.json` | PASS on `main` |
| MAP_CALLER graph | `CG-AppBuilder-MCP/registry/github-plane/legacy-path-retirement-map-caller-graph.v1.json` | PASS on `main` |
| WP pointer | `CG-AppBuilder-MCP/docs/work-packages/github-plane-legacy-path-retirement-v1.md` | MAP_CALLER |
| Parent milestone JSON | `CG-AppBuilder-MCP/registry/github-plane/milestone-github-plane-estate-mandatory-enforcement.v1.json` | Still ACTIVE; do not set inventory PASS |
| MAP_CALLER PR | https://github.com/Capglass5708/CG-AppBuilder-MCP/pull/632 | MERGED |
| DISCOVER PR | https://github.com/Capglass5708/CG-AppBuilder-MCP/pull/631 | MERGED |

## Verification

| Command / check | Result | Notes |
| --- | --- | --- |
| Lane0 | ALLOWED `CURRENT_CLEAN` | MAP_CALLER G5 |
| G4 | `sha256:f94fb70cce6fe79430e8bde7bd346bb8901e6af5cb2e68e6cbc4c19e6dcc1114` | LOCAL_SAME_HOST |
| G5 / G6 / G7 | APPLY_EXECUTED / DIFF_PASS / MERGE_ALLOWED | PR 632 |
| MERGE | `96a40af6d826343880c4d993d5b6afe92cb47d45` | 2026-09-10T20:04:45Z |
| Durability ingest | `WORK_REF_CONTENT_CONFLICT` | DISCOVER blob kept on work ref |

## Blockers / warnings

| Blocker | Owner repo | Required action |
| --- | --- | --- |
| `user-cg-github-plane` MCP not loaded (stale `github-main-1539f614` launcher) | Cursor-MCP-Kit / AppBuilder | Reload MCP from current tree before relying on MCP G5 |
| WaveRunner admit BRIDGE_ERROR | CG-AppBuilder-MCP | Same stale launcher; agents already use `execute-plan.mjs` CLI |
| `user-github` MCP Contents/PR/merge still live | Cursor MCP | First MIGRATE target — can write `main` with no planHash |

## Commits / PRs

| Repo | Commit / PR | Status |
| --- | --- | --- |
| CG-AppBuilder-MCP | PR 631 DISCOVER | merged `ff8c1a57…` |
| CG-AppBuilder-MCP | PR 632 MAP_CALLER | merged `96a40af6…` |

## Next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | MIGRATE highest-risk callers that can mutate `main` without planHash/G5 (`user-github-mcp`, protocol-13b ship push, sync-developer-memory, agent-ops GHA) | CG-AppBuilder-MCP + caller repos | not started |
| 2 | Keep recovery exceptions until governed replacements are proven | Office Admin / AppBuilder M6 | preserve |
| 3 | DENY only after MIGRATE proof | CG-AppBuilder-MCP | forbidden now |
| 4 | REMOVE last | CG-AppBuilder-MCP | forbidden now |

## Reusable lessons

- MAP_CALLER must precede deleting `git push` from files.
- DISCOVER classification can be stale vs live `main` (`gha-estate-index-refresh` already uses `publish-derived-state.mjs`).
- Same workId cannot overwrite a different durability ingest blob.

## Update log

### 2026-09-10 15:10 CT — Cursor

- Created this project file as the **current milestone** pointer: MAP_CALLER_COMPLETE, next MIGRATE.
