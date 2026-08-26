# Harvest summary — derived view

**Authority:** `harvest-manifest-v1.json` (`42d65de2435e…`)
**Work package:** `harvest-2026-08-25-mcp-estate-remediation-v1`
**Mission class:** `FULL_CLOSEOUT_INTELLIGENCE_HARVEST`
**Verdict:** `PASS`
**Retrieval:** `PENDING`

> This file is a generated view. Do not edit independently — update the manifest.

## Packets harvested

| Packet | State | Verdict | Owner |
| --- | --- | --- | --- |
| `mcp-verification-methodology-v1` | PROVEN | PASS | estate-wide |
| `claude-code-cwd-unsupported-v1` | PROVEN | PASS | estate-wide |
| `tsx-path-alias-resolution-failure-v1` | PROVEN | PASS | estate-wide |
| `mcp-dotted-tool-names-superseded-v1` | SUPERSEDED | PASS | estate-wide |
| `mcp-estate-final-status-v1` | PROVEN | PASS | estate-wide |
| `github-mcp-credential-defect-v1` | CONFIRMED_CREDENTIAL_DEFECT | OPEN | cg-shared |
| `cloudflare-mcp-scope-defect-v1` | CONFIRMED_SCOPE_OR_AUTHORITY_DEFECT | OPEN | cg-shared |
| `platform-intelligence-mcp-oauth-v1` | REGISTERED_AWAITING_AUTHORIZATION | OPEN | CG-AppBuilder-MCP |
| `product-catalog-planned-spoke-v1` | PLANNED_CORRECTLY_ABSENT | PASS | capital-glass-product-catalog |
| `revu-mcp-authority-correction-v1` | CORRECTED | PASS | CG-AppBuilder-MCP |
| `mcp-estate-remediation-commits-v1` | LOCAL_COMMIT_NOT_YET_MERGED | OPEN | multiple |
| `human-estimator-knowledge-client-ownership-v1` | PROVEN | PASS | CG-AppBuilder-MCP |
| `computer-estimator-dependency-governance-v1` | PROVEN | PASS | Computer-Estimator |
| `worktree-sibling-resolution-lesson-v1` | PROVEN | PASS | estate-wide |
| `mcp-readiness-attestation-resolved-v1` | RESOLVED | PASS | CG-AppBuilder-MCP |
| `mcp-api-service-lifecycle-v1` | PROVEN | PASS | CG-AppBuilder-MCP |
| `mcp-registry-authority-reconciliation-v1` | PROVEN | PASS | CG-AppBuilder-MCP |
| `wsl-validator-host-path-defect-v1` | WINDOWS_PATH_DEPENDENT_NOT_VALID_ON_WSL | OPEN | CG-AppBuilder-MCP |
| `ryzen9desk-host-constraints-v1` | PROVEN | PASS | estate-wide |

## Global doNotAdvance

- Claim MCP_ESTATE_REMEDIATION fully merged -- three commits (0b389796, 049c439, 80a1167) are local-only, NOT_YET_MERGED
- Claim the dotted-tool-name hypothesis is true for any MCP server -- disproven with direct evidence, see packet mcp-dotted-tool-names-superseded-v1
- Claim readiness attestation is broken -- resolved, see packet mcp-readiness-attestation-resolved-v1, supersedes prior belief
- Claim GitHub or Cloudflare Workers MCP credentials are fixed -- both remain Tier 2, operator decision required
- Treat validate-mcp-workspaces.mjs's WSL 0/20 result as real estate state -- invalidated by a proven host-path defect
- Assume Human Estimator's knowledge corpus is populated -- module-path crash is fixed, but 'compiled records not found' is a separate, legitimate, unresolved data-state

## Projection sync

Status: `not-run` (hub: `not-run`)

