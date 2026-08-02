# Project: cross-agent-registry-onboard-v1

## Summary

Register `CapitalGlass-Cross-Agent` as a first-class coordination repository in the MCP control-plane Supabase registry and align suite/RI registries with `ledgerOnly` parity rules.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | `cross-agent-registry-onboard-v1` |
| Work package | `cross-agent-registry-onboard-v1` |
| Date opened | 2026-08-02 |
| Source | Cursor |
| Coordination repo | CapitalGlass-Cross-Agent |
| Execution repo | `CG-AppBuilder-MCP` |
| Status | **Complete — pushed** |

## Registry record

| Field | Value |
| --- | --- |
| `repo_key` | `capital-glass-cross-agent` |
| `local_folder` | `CapitalGlass-Cross-Agent` |
| `github_repo` | `Capglass5708/CapitalGlass-Cross-Agent` |
| Supabase id | `f43b1467-7226-4eb5-9acb-7862a0a6bbd6` |
| Classification | `control_plane` |
| `ledgerOnly` | `true` (no `package.json` required; `AGENT_START_HERE.md` marker) |
| RI pilot order | 14 |

## AppBuilder deliverables

| Artifact | Path |
| --- | --- |
| Register script | `scripts/roi/register-cross-agent-repo.mjs` |
| npm alias | `npm run roi:cross-agent:register` |
| RI registry | `intelligence-hub/domains/repository-intelligence/mappings/repository-id-registry.v1.json` |
| Suite registry | `docs/suite-control-plane/SUITE_REPO_REGISTRY.json` |
| Seed data | `scripts/platform-registry/lib/seed-data.mjs` |
| Live onboard receipt | `artifacts/agent-runs/cross-agent-registry-onboard-v1/cross-agent-registry-onboard.json` |

## Verification

| Check | Result |
| --- | --- |
| Live Supabase insert | PASS — `register-cross-agent-repo` gate |
| Registry parity | PASS — 14 active repositories |
| Foundation tests | PASS — 20/20 |

## Commits

| Repo | Commit | Status |
| --- | --- | --- |
| `CG-AppBuilder-MCP` | `38a162da` | Pushed `origin/main` |

## Next action

Begin `cross-agent-structured-ledger-projection-v1` under Governance schema contract + AppBuilder ingestion adapter. Do not add `supabase/` or implementation code to Cross-Agent.

## Update log

### 2026-08-02 CT — registry onboard complete

- Registered `capital-glass-cross-agent` in MCP control-plane `registry.repositories`.
- Added RI repo #14 with `ledgerOnly` parity rules.
- Investigation plan updated to mark Phase 0 complete.
