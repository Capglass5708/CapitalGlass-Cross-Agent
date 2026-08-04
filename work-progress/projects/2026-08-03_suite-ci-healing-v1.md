# Project: suite-ci-healing-v1

## Summary

Capture the continued GitHub CI healing work across Product Catalog, Proposal Generator, Office Admin, and Document Center. This is a coordination record only; implementation and secrets remain in owning repos and secret managers.

## Workspace

| Field | Value |
| --- | --- |
| Project ID | `suite-ci-healing-v1` |
| Work package | `suite-ci-healing-v1` |
| Date opened | 2026-08-03 |
| Source | Wesley pasted Cursor CI-healing report |
| Coordination repo | CapitalGlass-Cross-Agent |
| Primary owner repos | capital-glass-product-catalog, Cursor-ProposalGenerator, CapitalGlass-Office-Admin, CapitalGlass-Documents |
| Status | **PASS** — Production Hardening Smokes green @ run [30925269106](https://github.com/Capglass5708/CapitalGlass-Documents/actions/runs/30925269106) (2026-08-04) |

## Fixed and green

| Repo | Fix | Status |
| --- | --- | --- |
| `capital-glass-product-catalog` | Added `publish-door-hardware-sets.ts` to cross-app write allowlist; PromptOps index refreshed | Validate green |
| `Cursor-ProposalGenerator` | Roy Street anchor marked `optionalOnForbidden`, so smoke actor skips the anchor when it receives 403 | Drift canary green |
| `CapitalGlass-Office-Admin` | Added CI test-actor for deploy gate and MCP smoke; refreshed knowledge index; merged PR #51 | `validate-code` green on fix branch and merged to main |

## Partially fixed

| Repo | Change | Current blocker | Required action |
| --- | --- | --- | --- |
| `CapitalGlass-Documents` | Workflow uses `EXPECTED_DOCUMENT_CENTER_GIT_SHA` from Doppler/GitHub secrets | **PASS** — pins aligned to deployed `03f6d24`; dashboard pin `1ad3312`; smokes green 2026-08-04 | Monitor only; review stale AppBuilder PRs |

Production observation:

```text
Document Center /api/version reports `03f6d24` on `main` (production deploy `dpl_F2ZTFTfb2UZ1GU4x73xyik6EebQ8` as of 2026-08-04).
```

## Root causes

| Surface | Root cause |
| --- | --- |
| Office Admin | GitHub Windows runners cannot resolve a real Windows actor identity; deploy gate dry-runs need the CI test-actor adapter. Main also had stale `mcp/knowledge-index/manifest.json`. |
| Product Catalog | New door-hardware publish module was missing from mutation allowlist; this was not PromptOps drift. |
| Proposal Generator | Morton/Magnolia pass; Roy Street returns 403 because the smoke session lacks project membership. |
| Document Center | SHA pins corrected in Doppler `cg-documents/prd` and synced to GitHub; Production Hardening Smokes **PASS** @ run 30925269106. |

## Open actions

| Priority | Action | Owner | Status |
| --- | --- | --- | --- |
| 1 | Review stale AppBuilder PRs #254, #252, #228, #227, #216 | CG-AppBuilder-MCP | **Ready** — DC false-red cleared |
| 2 | Keep self-hosted nightly full `closeout:gate` on backlog | CG-AppBuilder-MCP / CI | Pending |
| 3 | Keep CapitalGlass-Cross-Agent ext4 clone + ledger publish on backlog | CapitalGlass-Cross-Agent / Data-Extraction | Pending — Agent 3 ingest after ledger commit |

## Recommendation

Update the Document Center expected deployed SHA first, because it is the shortest path to converting a known false-red production smoke into green. Then move to the stale AppBuilder PR review queue.

**2026-08-04 update:** SHA pins corrected (`03f6d24` DC, `1ad3312` Dashboard); Production Hardening Smokes **PASS** @ [30925269106](https://github.com/Capglass5708/CapitalGlass-Documents/actions/runs/30925269106). Proceed to AppBuilder PR review queue.

## Do not record secrets

Do not store Doppler token values, GitHub secret values, or production secret contents in Cross-Agent. Only record secret names, expected non-secret SHA values, and action status.