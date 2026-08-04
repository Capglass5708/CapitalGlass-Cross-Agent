# Project: cross-agent-harvest-owner-boundary-v1

## Summary

Prerequisite gate repair — harvest authority test derives expected boundary packet IDs from `harvest-packet-registry.json` instead of hardcoded count.

## Workspace

| Field | Value |
| --- | --- |
| Work package | `cross-agent-harvest-owner-boundary-v1` |
| Owner repo | CapitalGlass-Cross-Agent |
| Status | **GATE_REPAIR_COMPLETE — needs scoped PR** |

## Root cause

Boundary index is cumulative (11+ packets); test hardcoded 6.

## Verification

| Gate | Result |
| --- | --- |
| `npm run test:harvest` | 11/11 PASS |
| `npm run harvest:validate` | PASS |

## Next action

Scoped PR from `main` with harvest-boundary files only.

## Authority

See `docs/work-packages/cross-agent-harvest-owner-boundary-v1.md`.
