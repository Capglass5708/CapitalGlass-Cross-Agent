# Query routing authority (Cross-Agent)

**Canonical location:** `registry/query-routing/query-routing-manifest.v1.json`

**Owner repo:** `CapitalGlass-Cross-Agent`  
**Work package:** `cross-agent-query-routing-authority-publication-v1`

## Purpose

Deterministic scout / hot-cache query routing: maps natural-language scout queries to hot-cache dataset ids without repo-wide grep or archive-branch reads.

## Supported manifest forms

Both forms are valid and must resolve identically when normalized:

| Legacy keywords form | Alternate matchPatterns form |
| --- | --- |
| `keywords[]` | `matchPatterns[]` |
| `primaryDataset` | `primaryDatasetId` |
| `supportingDatasets[]` | `datasetIds[]` (primary excluded from supporting) |

Fallback accepts `fallback` or `defaultRoute` with the same field pairs.

## Consumers

- `CG-AppBuilder-MCP` — `scripts/hot-cache-platform/lib/query-router.mjs`, scout brief integration (PR #281)
- Cross-Agent validation — `npm run validate:query-routing`, `npm run test:query-routing`

## Validation

```bash
npm run validate:query-routing
npm run test:query-routing
```

## Forbidden

- Reading routing manifests from `archive/*` branches or host-local untracked copies
- Duplicating this manifest in App Builder or other consumer repos
