# Capital Glass AI Hot-Cache Manifest-Index Platform

**Status:** IN_PROGRESS  
**Parent WP:** `capital-glass-ai-hot-cache-manifest-index-platform-v1`  
**First implementation:** `capital-glass-git-estate-manifest-index-hot-cache-v1`

## Objective

Federated governed indexes for AI retrieval — not one monolithic cache. Each domain has:

1. Human-maintained manifest (Cross-Agent)
2. Deterministic compiler plugin (AppBuilder)
3. Generation-based hot-cache publication (derivative mirror)
4. Query-routed compact injection (scout)

## Hardening incorporated

- Dataset compile dependencies + `dependencyPolicy`
- Publication generations + `current.json` pointer (generation atomicity)
- Per-artifact `checksums.json`
- Record `provenance` + `verification` + `conflicts`
- Identity alias registry
- Authorization-aware reader (`allowedSensitivity`)
- Index budgets in dataset registry defaults
- Platform acceptance gates (13 gates)

## Delivered in this package (initial)

| Artifact | Location |
|---|---|
| Dataset registry | `registry/datasets/hot-cache-dataset-registry.v1.json` |
| Query routing | `registry/query-routing/query-routing-manifest.v1.json` |
| Identity aliases | `registry/identity/` |
| Git estate manifest (30 repos) | `registry/git-estate/git-estate-manifest.v1.json` |
| Platform lib | `CG-AppBuilder-MCP/scripts/hot-cache-platform/` |
| Git estate compiler | `scripts/hot-cache-platform/datasets/git-estate/compiler.mjs` |

## Next

1. Authority estate manifest seed (from MCP ownership registry)
2. Scout router integration in `scout-brief.mjs`
3. `git-estate:bulk-pull` plugin
4. L: BY-KIND publication for git-estate compact
5. Application estate compiler (depends on git + authority)

## Acceptance (git-estate v1)

- [ ] MANIFEST_COMPLETE
- [ ] INDEX_GENERATED
- [ ] GENERATION_ATOMICITY_PASS
- [ ] ARTIFACT_CHECKSUM_PASS
- [ ] HOT_CACHE_PUBLISH_PASS
- [ ] SCOUT_FIRST_READ_PASS (after scout integration)
- [ ] BULK_PULL_DRY_RUN_PASS
