# Project: claude-code-mcp-wiring-v1

## Summary

Wire Claude Code to the same Capital Glass MCP definitions used by Cursor,
with bounded read-only proof and no exposure of secret values.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | `claude-code-mcp-wiring-v1` |
| Work package | `claude-code-mcp-wiring-v1` |
| Date opened | 2026-08-18 |
| Source | Claude + Cursor |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | CG-AppBuilder-MCP / Cursor-MCP-Kit |
| Execution repo | CapitalGlass-Cross-Agent (onboarding and handoff artifacts) |
| Status | Connected; hygiene fix published; ledger landing pending |

## Repositories involved

| Repo | Role |
| --- | --- |
| CapitalGlass-Cross-Agent | Integration records, onboarding source, handoff protocol |
| CG-AppBuilder-MCP | MCP control plane and WSL runtime authority |
| Cursor-MCP-Kit | MCP inventory and launcher authority |
| CapitalGlass-Office-Admin | Office Admin MCP knowledge authority |

## Authority / ownership rule

Cursor owns repository writes and commits for this wave. Claude may investigate,
invoke bounded read-only MCP tools, and prepare handoffs. No raw secret values
are retrieved or stored.

## Valuable decisions

| Date/time | Decision | Reason |
| --- | --- | --- |
| 2026-08-18 | Classify MCP parity as `CONNECTED`, not `PROVEN` | Nine required MCP servers returned live read-only data, but no Claude-originated closeout receipt exists |
| 2026-08-18 | Promote `Cursur Help Claude/` into Git source | Z-only handoff requests violate Git-as-source-of-truth |
| 2026-08-18 | Replace all five Doppler token probes with `doppler me` identity checks | Redirecting token output does not prevent credential retrieval |

## Delivered / reported complete

- Claude Code local configuration contains 26 MCP definitions.
- 19 stdio servers connected during handshake; hosted OAuth servers remain optional.
- Nine required servers returned live read-only data:
  Office Admin, Doppler, CG App Builder, Diagnostic, Suite Wiring, Agent Loop,
  GitHub, SharePoint, and Failure Intelligence.
- `Cursur Help Claude/` promoted into `agent-onboarding/claude/`.
- Five unsafe Doppler token-check sites replaced and recursively mirrored to Z:.
- Recursive Git-to-Z verification returned `CLEAN` and `MIRROR_IN_SYNC`.
- Matrix delta: MCP invocation `BLOCKED` → `CONNECTED`; coupling risk `CRITICAL` → `MEDIUM`.

## Historical defects retained for audit

- The published package previously contained five Doppler checks that
  retrieved a raw token before the hygiene fix; all five are now replaced and
  verified clean.
- `CURRENT_HANDOFF.md` was stale and contained the repeated
  `/home/wesle/repos` path typo.
- `luna:retrieve --director` reported no write side effect while creating a
  commit-eligible capsule in the AppBuilder repository.
- Office Admin knowledge artifacts were older than the current repository
  state and require fresh receipts before operational decisions.

## Open risks / next actions

1. Cursor must review and commit the source and ledger changes.
2. Update `CURRENT_HANDOFF.md` separately; it is stale and contains a
   `/home/wesle/repos` path typo.
3. Add `clientSurface: "CLAUDE"` to the closeout/receipt schema.
4. Run a Claude-originated material mission and emit a valid closeout receipt.
5. Only then change the relevant matrix capability from `CONNECTED` to `PROVEN`.
6. Keep Doppler `secrets_get` and `secrets_download` off-limits.

## Verification

| Check | Result |
| --- | --- |
| Nine required MCP read-only probes | PASS |
| Secret values retrieved | NO |
| Git source to Z recursive parity | PASS |
| Hygiene grep for `doppler configure get token --plain` | CLEAN |
| Formal Claude closeout receipt | NOT YET PRESENT |

## Retrieval / lane

- `clientSurface`: `CLAUDE`
- `parallelWith`: `CURSOR`
- Cursor write lane: active
- Mission class: `investigate`
