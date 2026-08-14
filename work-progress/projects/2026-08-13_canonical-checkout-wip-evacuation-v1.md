# Project: canonical-checkout-wip-evacuation-v1

## Summary

Evacuated four unrelated WIP piles from dirty canonical `CG-AppBuilder-MCP` checkout without blanket stash; preserved PI and old P4/Luna work on dedicated branches; fast-forwarded canonical `main` to `origin/main` (includes merged PR #379 WR2 bind). Chat session ingested for later reuse.

## Workspace

| Field | Value |
| --- | --- |
| Work package | `canonical-checkout-wip-evacuation-v1` |
| Owner repo | CG-AppBuilder-MCP |
| Mission class | `fix` |
| Status | **EVACUATION_COMPLETE** — live MCP proof pending |
| Verdict | **MAIN_FF_DONE** |

## Branch preservation (not pushed unless operator asks)

| Branch | Commit | Worktree |
| --- | --- | --- |
| `feat/platform-intelligence-client-availability-control-v1` | `ba32eb99b` | `/home/wesle/repos/worktrees/CG-AppBuilder-MCP/platform-intelligence-client-availability-control-v1` |
| `chore/p4-continuation-packet-bind-pre-wr2-v1` | `cdc67524e` | `/home/wesle/repos/worktrees/CG-AppBuilder-MCP/p4-continuation-packet-bind-pre-wr2-v1` |

## Classification (P4 binder vs #379)

- **Shipped on main:** `scripts/protocol-40/lib/wr2-packet-bind-v1.mjs` (PR #379) — WR2 scout/executor bind.
- **Kept on branch:** `continuation-packet-bind-v1.mjs` — Luna ROI over `mission-continuation-packet-v1.json`; **not superseded**; discard not authorized.

## Artifact authority (Git)

| Artifact | Path |
| --- | --- |
| Evacuation report | `CG-AppBuilder-MCP/artifacts/agent-runs/canonical-checkout-wip-evacuation-v1/evacuation-report.json` |
| Closeout | `CG-AppBuilder-MCP/artifacts/agent-runs/canonical-checkout-wip-evacuation-v1/closeout.json` |
| Chat summary | `CG-AppBuilder-MCP/artifacts/agent-runs/canonical-checkout-wip-evacuation-v1/chat-ingest-summary.md` |
| WIP aside manifest | `/home/wesle/.local/share/capital-glass/canonical-wip-aside-2026-08-13/MANIFEST.txt` |

## Chat transcript

`e6d22337-bbc2-4790-ac8f-87eaf9185619` (CapitalGlassRevu agent transcript)

## Blockers / next work

1. **Operator:** Restart Cursor; new chat; live WR2/P4 scout bind + one `admit` → `next` cycle.
2. **Optional:** Push evacuation branches; merge PI after review.
3. **Optional:** Port/wire Luna ROI binder after PI dependency resolved.

## Anti-patterns recorded

- Blanket `git stash -u` on mixed canonical WIP → Failure Intelligence capture
- Stale `MCP_CURSOR_LIVE:false` receipts masquerading as truth post-#379

## Related prior art

- `protocol-13b-stash-classification-v1` — same one-package-per-branch philosophy
