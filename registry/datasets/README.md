# AI Hot-Cache Platform Registry

**Parent work package:** `capital-glass-ai-hot-cache-manifest-index-platform-v1`  
**First dataset:** `capital-glass-git-estate-manifest-index-hot-cache-v1`

Cross-Agent owns **human-maintained manifests** and the **dataset registry**.  
CG-AppBuilder-MCP owns **compile, publish, and consumption** plugins.

## Layout

- `datasets/hot-cache-dataset-registry.v1.json` — table of contents for all hot-cache datasets
- `datasets/schemas/` — shared JSON schemas (registration, checksums, index records)
- `query-routing/query-routing-manifest.v1.json` — keyword → dataset routing
- `identity/` — canonical IDs and aliases (shared identity service)
- `{dataset-id}/*-manifest.v1.json` — per-domain authority manifests

## Publication generations (atomic)

Hot-cache publishes use generation directories:

```text
objects/{datasetId}/generations/{publicationGeneration}/
  full.json
  compact.json
  by-machine.{role}.json
  meta.json
  checksums.json
objects/{datasetId}/current.json   # pointer — flipped last
```

## Edit rules

1. Never store secret values in manifests or indexes — references only.
2. `contentHash` on manifests is computed from canonical record IDs (regenerate on validate).
3. New datasets must register in `hot-cache-dataset-registry.v1.json` before publishing.
4. L: publication runs via WESLEYDESK GHA — not from Cursor agent preflight.

## Commands (AppBuilder)

```bash
npm run hot-cache:compile -- --dataset=git-estate
npm run hot-cache:publish -- --dataset=git-estate
npm run hot-cache:route-query -- "can I pull all repos"
npm run test:hot-cache-platform
```
