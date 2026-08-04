# Project: chat-thread-harvest-protocol-hot-cache-roi-v1

## Summary

Add explicit hot-cache scout proof, recommended ROI output, command indexing, and stale-authority reconciliation to the Cross-Agent chat-thread harvest protocol.

This project is documentation/coordination only. It does not implement harvest tooling. Implementation belongs in `CG-AppBuilder-MCP`; protocol authority belongs in `CG-Platform-Governance-MCP`.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | chat-thread-harvest-protocol-hot-cache-roi-v1 |
| Work package | chat-thread-harvest-protocol-hot-cache-roi-v1 |
| Date opened | 2026-08-03 |
| Source | Wesley / ChatGPT |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | CG-Platform-Governance-MCP |
| Execution repo | CG-AppBuilder-MCP |
| Status | Indexed / docs added |

## Repositories involved

| Repo | Role |
| --- | --- |
| CapitalGlass-Cross-Agent | Coordination ledger, runbook, receipt, project file |
| CG-AppBuilder-MCP | Future execution owner for schema/tooling changes |
| CG-Platform-Governance-MCP | Future authority owner if protocol validation changes |

## Authority / ownership rule

Cross-Agent records the protocol additions and where they belong. AppBuilder may implement generator/validator behavior. Governance decides whether the capture/closeout rules count.

## Valuable decisions

| Date/time | Decision | Reason |
| --- | --- | --- |
| 2026-08-03 CT | Add hot-cache scout proof to harvest protocol | Prevents scout from silently falling back to Git ledger or stale cache |
| 2026-08-03 CT | Add recommended ROI output to harvest protocol | Harvest should create prioritized next improvements, not only summaries |
| 2026-08-03 CT | Add command indexing as first-class harvest data | Commands are high-value proof and rerun affordances |
| 2026-08-03 CT | Add stale authority reconciliation | Prevents old L: slices from overwriting newer receipt truth |

## Delivered / reported complete

- Created `runbooks/CHAT_THREAD_HARVEST_PROTOCOL.md`.
- Added machine-readable receipt and protocol addition artifacts.
- Added recommended ROI artifact.
- Updated project index and active ledger.

## Evidence / artifact paths

| Artifact | Path / link | Status |
| --- | --- | --- |
| Protocol runbook | `runbooks/CHAT_THREAD_HARVEST_PROTOCOL.md` | Added |
| Receipt | `artifacts/agent-runs/chat-thread-harvest-protocol-hot-cache-roi-v1/receipt.json` | Added |
| ROI list | `artifacts/agent-runs/chat-thread-harvest-protocol-hot-cache-roi-v1/recommended-roi.json` | Added |
| Protocol additions | `artifacts/agent-runs/chat-thread-harvest-protocol-hot-cache-roi-v1/protocol-additions.json` | Added |

## Verification

| Command / check | Result | Notes |
| --- | --- | --- |
| GitHub contents API writes | PASS | Files created/updated on main |
| Runtime harvest validation | NOT_RUN | This change is docs-only in Cross-Agent; tooling implementation belongs in AppBuilder |

## Blockers / warnings

| Blocker | Owner repo | Required action |
| --- | --- | --- |
| Harvest tooling does not yet enforce all fields | CG-AppBuilder-MCP | Add schema/generator validation for new fields |
| Governance may need to bless any mandatory capture-rule changes | CG-Platform-Governance-MCP | Promote to governance if changing pass/fail protocol authority |

## Commits / PRs

| Repo | Commit / PR | Status |
| --- | --- | --- |
| CapitalGlass-Cross-Agent | Created through GitHub contents API | Pushed to main |

## Next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | Add schema enforcement for `scoutHotCacheProof`, `recommendedRoi`, `commands`, and `authorityLineage` | CG-AppBuilder-MCP | Proposed |
| 2 | Decide whether Governance should own these fields as constitutional capture requirements | CG-Platform-Governance-MCP | Proposed |
| 3 | Publish updated Cross-Agent ledger/hub slices after this commit if needed | CG-AppBuilder-MCP / Data-Extraction | Recurring |

## Reusable lessons

- Cross-Agent already has the harvest skeleton; do not invent a parallel protocol.
- The correct improvement is to extend the manifest and generated views with hot-cache proof, ROI, commands, and stale-authority comparison.
- Keep implementation in owner repos.

## Update log

### 2026-08-03 CT — ChatGPT

- Read Cross-Agent authority docs via GitHub connector.
- Added this project file and runbook.
- Captured the requested protocol additions for future harvest/tooling work.
