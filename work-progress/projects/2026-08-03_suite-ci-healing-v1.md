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
| Status | **PARTIAL PASS — three surfaces green; Document Center production smoke blocked by deployed SHA secret mismatch** |

## Fixed and green

| Repo | Fix | Status |
| --- | --- | --- |
| `capital-glass-product-catalog` | Added `publish-door-hardware-sets.ts` to cross-app write allowlist; PromptOps index refreshed | Validate green |
| `Cursor-ProposalGenerator` | Roy Street anchor marked `optionalOnForbidden`, so smoke actor skips the anchor when it receives 403 | Drift canary green |
| `CapitalGlass-Office-Admin` | Added CI test-actor for deploy gate and MCP smoke; refreshed knowledge index; merged PR #51 | `validate-code` green on fix branch and merged to main |

## Partially fixed

| Repo | Change | Current blocker | Required action |
| --- | --- | --- | --- |
| `CapitalGlass-Documents` | Workflow now uses `EXPECTED_DOCUMENT_CENTER_GIT_SHA` from Doppler/GitHub secrets instead of `github.sha`; commit `482561e` | Production smokes still fail because expected SHA does not match deployed `/api/version` SHA | Update `EXPECTED_DOCUMENT_CENTER_GIT_SHA` to deployed SHA `f16b4ff334affe8c900cded6a6feac6480c0d848`, or redeploy Document Center from main and set the secret to the new deploy SHA |

Production observation:

```text
Document Center /api/version reports f16b4ff on branch feat/storage-orchestrator-persistence-v1
```

## Root causes

| Surface | Root cause |
| --- | --- |
| Office Admin | GitHub Windows runners cannot resolve a real Windows actor identity; deploy gate dry-runs need the CI test-actor adapter. Main also had stale `mcp/knowledge-index/manifest.json`. |
| Product Catalog | New door-hardware publish module was missing from mutation allowlist; this was not PromptOps drift. |
| Proposal Generator | Morton/Magnolia pass; Roy Street returns 403 because the smoke session lacks project membership. |
| Document Center | Production smoke expected SHA is now correctly externalized, but the configured secret does not match the deployed SHA. |

## Open actions

| Priority | Action | Owner | Status |
| --- | --- | --- | --- |
| 1 | Update `EXPECTED_DOCUMENT_CENTER_GIT_SHA` in Doppler / synced GitHub secrets to `f16b4ff334affe8c900cded6a6feac6480c0d848`, or redeploy Document Center from main and set the secret to that deploy SHA | CapitalGlass-Documents / Doppler | Pending ops secret update |
| 2 | Re-run Document Center Production Hardening Smokes after secret/deploy alignment | CapitalGlass-Documents | Pending |
| 3 | Review stale AppBuilder PRs #254, #252, #228, #227, #216 after Document Center false-red clears | CG-AppBuilder-MCP | Pending |
| 4 | Keep self-hosted nightly full `closeout:gate` on backlog | CG-AppBuilder-MCP / CI | Pending |
| 5 | Keep CapitalGlass-Cross-Agent ext4 clone + ledger publish on backlog | CapitalGlass-Cross-Agent / Data-Extraction | Pending |

## Recommendation

Update the Document Center expected deployed SHA first, because it is the shortest path to converting a known false-red production smoke into green. Then move to the stale AppBuilder PR review queue.

## Do not record secrets

Do not store Doppler token values, GitHub secret values, or production secret contents in Cross-Agent. Only record secret names, expected non-secret SHA values, and action status.