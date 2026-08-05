# Workflow Estate hot-cache v1

**Work package:** `workflow-estate-hot-cache-v1`  
**Status:** IN_PROGRESS  
**Owner repos:** CapitalGlass-Cross-Agent (manifest + workflow-index), CG-AppBuilder-MCP (compiler + hot-cache publication)

## Objective

Link stable **workflow IDs** to Command Estate `entryCommandIds` without copying raw command strings into workflow records. Workflows describe operator lanes for hot-cache compile/publication, harvest sync, prompt promotion/projection, and mission closeout.

## Artifacts

| Artifact | Path |
| --- | --- |
| Workflow manifest | `registry/workflow-estate/workflow-estate-manifest.v1.json` |
| Workflow index | `work-progress/workflow-index.json` |
| Dataset registry entry | `registry/datasets/hot-cache-dataset-registry.v1.json` (`workflow-estate`) |
| Compiler | `CG-AppBuilder-MCP/scripts/hot-cache-platform/datasets/workflow-estate/` |

## Gates

```bash
# Cross-Agent
npm run test:harvest:prompt-post-merge-acceptance

# AppBuilder
npm run test:workflow-estate-hot-cache-gates
npm run workflow-estate:compile-index
```

## Policy

- Prompt extraction produces **candidates only**; `wf-prompt-candidate-promotion-v1` requires `operator-explicit-prompt-approval`.
- Unapproved candidates must never reach `wf-prompt-catalog-projection-v1` Supabase projection.

## Depends on

- `command-estate-hot-cache-v1` (merged)
- `harvest-prompt-extraction-v1` / AppBuilder #286 (merged)
