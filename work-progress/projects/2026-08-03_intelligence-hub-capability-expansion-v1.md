# Intelligence Hub Capability Expansion v1

| Field | Value |
| --- | --- |
| Work package | `intelligence-hub-capability-expansion-v1` |
| Date | 2026-08-03 |
| Owner repo | CapitalGlass-Cross-Agent |
| Verdict | `EXPANSION_CONTRACT_NEEDED` → wave 1 **IN_PROGRESS** |
| Mission class | harvest / index / organize |

## Objective

Expand Intelligence Hub retrieval with machine-readable control slices so agents get answers from compact index data before repo scans — building on shipped hot AI-cache scout routing.

## Deliverables (wave 1)

| Artifact | Path | Status |
| --- | --- | --- |
| ROI ranking | `artifacts/agent-runs/intelligence-hub-capability-expansion-v1/recommended-roi.json` | DONE |
| Expansion contract | `artifacts/agent-runs/intelligence-hub-capability-expansion-v1/expansion-contract-v1.json` | DONE |
| Blocker → action map | `work-progress/blocker-to-action-map.json` | DONE |
| Do-not-advance registry | `work-progress/do-not-advance-registry.json` | DONE |
| Command index v1.1 | `work-progress/command-index.json` (`provesGate`, `gateId`) | DONE |
| Compile script | `scripts/index/compile-control-slices.mjs` | DONE |
| Compiled slices | `work-progress/intelligence-hub-slices/` | DONE (regenerate via `npm run index:compile-control-slices`) |
| Tests | `npm run test:index-control-slices` | DONE |

## Retrieval chain

scout hook → hot AI cache → compact index slice → repo source only if miss

## Next actions

1. Commit expansion artifacts + slices to Cross-Agent `main`
2. Run `npm run index:compile-control-slices` before publish
3. Operator: `index:publish` on WESLEYDESK after Slice 6 publication workflow 30861642734 completes
4. Wave 2: freshness dashboard live probe, auto-publisher activation, Revu/DC/PG domain pack content

## Preserved non-claims

- `THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL` — blocked until post-merge publication + blind retrieval
- `PERSISTENT_AVAILABILITY_PASS` / `MANAGED_EXECUTOR_ONLINE` — blocked until RYZEN9DESK persistence proof
- `AUTO_PUBLISHER_V1_1_ACTIVE` — staged not active

## Related

- Harvest: `harvest-current-cross-thread-state-v2` (HARVEST_COMPLETE)
- Hot cache scout: CG-AppBuilder-MCP `intelligence-hub-hot-cache-scout-optimization-v1`
- Slice 6 pointer: `work-progress/pointers/three-way-agent-improvement-intelligence-v1.json`
