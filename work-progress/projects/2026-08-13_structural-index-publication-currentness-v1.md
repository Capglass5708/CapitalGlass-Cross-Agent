# Project: structural-index-publication-currentness-v1

## Summary

Platform Intelligence **structural index publication currentness** — cohort audit, manual operator publication lane (`v1e-live`), and targeted refresh for repos behind `origin/main`.

## Workspace

| Field | Value |
| --- | --- |
| Work package | `structural-index-publication-currentness-v1` |
| Owner repo (implementation) | CG-AppBuilder-MCP |
| Harvest authority | CapitalGlass-Cross-Agent |
| Status | **COHORT_REFRESH_IN_PROGRESS** |
| Verdict | **HOLD** (until `inSyncCount` materially improves) |

## Evidence (2026-08-13)

- Trigger audit: `MANUAL_OPERATOR_PUBLICATION_LANE` — no unattended post-push structural reindex on main advance
- Cohort tooling shipped on branch `feat/structural-index-publication-currentness-v1` — PR [#375](https://github.com/Capglass5708/CG-AppBuilder-MCP/pull/375) commit `ffda4c1e358e48d565d9caa6fbbd2415454cc6ca`
- Publications VERIFIED: `CapitalGlass-Office-Admin` @ `20e31990048fe5d2aae67324eb62a14dcd8fd86f`; `capital-glass-cross-agent` @ `9b8c661ab1e7af2ad4b803b197387d6687b95184`
- Ryzen handoff: `artifacts/agent-runs/structural-index-publication-currentness-v1/ryzen9desk-handoff.md` + Z: Direct Connect handoff bus

## Do not advance

- `STRUCTURAL_INDEX_COHORT_CURRENT` until trigger audit shows improved `inSyncCount` vs latest `origin/main`
- Treating single-repo publish SHA as estate-wide current without re-audit after long runs

## Next action

On RYZEN9DESK (or WESLEY_WORK after PR merge): `platform-intelligence:structural-cohort-refresh --apply` for `Visual-Asset-Engine` + remaining `INDEX_BEHIND_REMOTE` cohort; re-run trigger audit.
