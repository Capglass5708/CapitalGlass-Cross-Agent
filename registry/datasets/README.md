# Hot-cache dataset registry authority (Cross-Agent)

**Canonical location:** `registry/datasets/hot-cache-dataset-registry.v1.json`

**Owner repo:** `CapitalGlass-Cross-Agent`  
**Work package:** `cross-agent-hot-cache-dataset-registry-publication-v1`

## Published dataset manifests

| Dataset | Manifest | Required |
| --- | --- | --- |
| `git-estate` | `registry/git-estate/git-estate-manifest.v1.json` | yes (`missOk: false`) |
| `authority-estate` | `registry/authority-estate/authority-estate-manifest.v1.json` | yes (`missOk: false`) |
| Other query-routing dataset IDs | registry entry only (`missOk: true`) | optional at runtime |

Query routing authority lives in `registry/query-routing/` (PR #8).

## Source contracts

- `git-estate` repo rows derive from `CG-AppBuilder-MCP/scripts/wsl/wsl-repo-library-manifest.v1.json` (folder/github identity only — no host paths in Cross-Agent authority)
- `authority-estate` domain rows are Cross-Agent governance records (mutation owner + derivative consumers)

## Validation

```bash
npm install
npm run validate:hot-cache-dataset-registry
npm run test:hot-cache-dataset-registry
```

## Forbidden

- Machine-specific absolute paths in tracked registry JSON
- Generated hot-cache output, runtime receipts, harvest artifacts
- Reading dataset authority from archive branches or host-local untracked trees
