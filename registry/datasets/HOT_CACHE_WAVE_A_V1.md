# Hot-cache Wave A authority (v1.1.0)

**Work package:** `hot-cache-expansion-capital-glass-v1`  
**Rollout classification:** `WESLEY_WORK_ROLLOUT_PASS_PENDING_GIT_AUTHORITY`

## Authority surfaces

| Surface | Path | Schema |
| --- | --- | --- |
| Dataset registry | `registry/datasets/hot-cache-dataset-registry.v1.json` | `hot-cache-dataset-registry-v1@1.1.0` |
| Query routing | `registry/query-routing/query-routing-manifest.v1.json` | `query-routing-manifest-v1@1.1.0` |
| Command estate | `registry/command-estate/command-estate-manifest.v1.json` | — |
| Active ledger | `registry/active-ledger/active-ledger-manifest.v1.json` | — |
| Receipt registry | `registry/receipt-registry/receipt-registry-manifest.v1.json` | — |
| IH domains | `registry/intelligence-hub-domains/intelligence-hub-domains-manifest.v1.json` | — |

## Bundle budgets (platform defaults)

- Routing bundle hard cap: **32768** bytes
- Always-on envelope: **8192** bytes
- Lazy catalog pointers: **4096** bytes

Hot cache remains **derivative**. Cached gate verdicts are never independent ship authorization.

## Compile before publish

```bash
npm run index:compile-control-slices
npm run validate:hot-cache-dataset-registry
npm run validate:query-routing
```

Consumer refresh (CG-AppBuilder-MCP): `npm run hot-cache:refresh-all`
