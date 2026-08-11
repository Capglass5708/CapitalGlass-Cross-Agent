# two-desk-operating-v1

| Field | Value |
| --- | --- |
| Project ID | `two-desk-operating-v1` |
| Related | `dual-machine-session-start-cheap-v1`, `dual-machine-session-gate-matrix-v1` |
| Status | **COMPLETE** — `TWO_DESK_OPERATING_BOTH_READY` |
| Owner repo | `CG-AppBuilder-MCP` |
| Coordination | CapitalGlass-Cross-Agent (this file) |
| Ops plane | CapitalGlass-Office-Admin / Direct Connect Z handoffs |
| Last commit (AppBuilder) | `2c36e40eb8aa2d52bba024c16b38c557b8a88dcd` (merge PR #350) |
| Recorded | 2026-08-11 |

## Outcome

WESLEYWORK (integration captain) and RYZEN9DESK (execution engine) operate as one system:

- Code authority: GitHub `origin/main`
- Shared authority: Z: / L: mirrors
- Session open: `npm run dual-machine:session-start -- --cheap --pull --json` (~3s)
- Ship stack only for material mutate/closeout/PI publish
- Soft-block prevents `closeout:gate` as hop hygiene

## Evidence

| Artifact | Path |
| --- | --- |
| Dual-desk proof | `Z:\Office\Wes\Direct Connect\handoffs\HANDOFF 8-11-26\TWO_DESK_OPERATING-PROOF-BOTH-READY.json` |
| WORK results | `...\HANDOFF 8-11-26\RESULTS-WESLEYWORK.json` (`PASS_READY`) |
| Direct Connect STATUS | `Z:\Office\Wes\Direct Connect\handoffs\STATUS-UPDATE.json` |
| Network-Admin twin | `Z:\Capital-Glass-Network-Admin\handoff\two-desk-operating\` |
| Network-Admin status | `Z:\Capital-Glass-Network-Admin\status\dual-desk\two-desk-operating.latest.json` |

## Desk table

| Desk | workStatus | hopPass | L: hub | elapsed |
| --- | --- | --- | --- | --- |
| RYZEN9DESK | READY | true | yes | ~3s |
| WESLEYWORK | READY | true | yes | ~3s |

## Next actions

1. Operator on WESLEYDESK: `index:publish` / GHA `index-publication.yml` so L: `BY-KIND` open-actions reflect this completion.
2. Optional: reconnect `user-office-admin-mcp` on Ryzen for OA read tools.
3. Backlog (not this WP): peer live-proof bridge for machine-readiness `DURABLE_COMPLETE`; PR #349 incremental PI.

## Forbidden

Do not treat this as requiring persistence-gate `PERSISTENT_AVAILABILITY_PASS`. Do not hand-edit L: from Cursor.
