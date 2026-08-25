# Mission-intelligence dataset authority (Cross-Agent)

**Registered in:** `registry/datasets/hot-cache-dataset-registry.v1.json` (`datasetId: "mission-intelligence"`)
**Routed by:** `registry/query-routing/query-routing-manifest.v1.json` (`queryClass: "mission-intelligence"`)
**Owner repo:** `CapitalGlass-Cross-Agent`

## Purpose

The dataset a query router sends `intelligence.preflight()`-shaped questions to: prior
failures, success patterns, related missions, unresolved contradictions, active
blockers, repo ownership, and (as of the graph-aware upgrade) relationship-graph
traversal — what enables a capability, what decisions govern a subsystem, what was
recently corrected or superseded.

## Why this dataset has no `manifestPath`

Every other entry in the dataset registry with a `manifestPath` is backed by a single
JSON file under `registry/`. This dataset isn't — its source is the Git-tracked local
mirror, spread across several files, because that mirror is compiled by an existing,
separate pipeline (`scripts/index/compile-control-slices.mjs`,
`scripts/harvest/lib/harvest-intelligence-retrieval-lib.mjs`), not authored directly as
a `registry/` manifest:

- `work-progress/intelligence-hub-slices/blockers.json`
- `work-progress/intelligence-hub-slices/owner-boundaries.json`
- `work-progress/intelligence-hub-slices/do-not-advance.json`
- `work-progress/intelligence-hub-slices/current-state.json`
- `work-progress/intelligence-hub-slices/harvest-intelligence.json`
- `work-progress/harvest-intelligence-index.json` (the raw entity/relationship authority
  the slice above is derived from — this is what the graph-aware queries actually walk)

Forcing a single `manifestPath` here would misrepresent a multi-file, pipeline-derived
dataset as a single hand-authored one. If a consumer needs one canonical entry point,
use `work-progress/intelligence-hub-slices/harvest-intelligence.json` — every row in it
carries `entityAuthorityRef` back to the raw index.

## Consumers

- `scripts/intelligence/lib/preflight-v1.mjs` — `buildMissionContextBundle()` is the
  in-repo consumer this dataset exists for.
- `scripts/harvest/lib/goldmine-protocol-v1.mjs` — `/goldmine` is this dataset's
  producer: every run regenerates `harvest-intelligence.json` via
  `writeHarvestIntelligenceRetrievalArtifacts()`, so a mission's output is immediately
  what a later `intelligence.preflight()` call retrieves.
- Cross-repo (WaveRunner, Cursor, future agents): **not yet wired.** Registering this
  dataset here is what makes that wiring possible without each consumer inventing its
  own retrieval path — see `plans/2026-08-25_compounding-intelligence-unified-loop-v1.md`
  for the full integration design.

## Freshness

`freshnessClass: "git-state"` (1 hour TTL) matches `git-estate`'s volatility — this
dataset changes whenever `/goldmine` runs or the control slices are recompiled, not on
a slow authority-registry cadence. `intelligence.preflight()`'s own hot-cache plane
layers a stricter, SHA-verified freshness check on top of this TTL (see
`scripts/intelligence/lib/preflight-v1.mjs`): a cache hit is only accepted as fresh if
its recorded `indexedSha` still matches the repo's current authority SHA, not merely
because the TTL hasn't expired yet.

## Validation

```bash
npm run validate:query-routing
npm run validate:hot-cache-dataset-registry
npm run test:query-routing
npm run test:hot-cache-dataset-registry
```
