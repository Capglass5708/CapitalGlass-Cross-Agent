# Intelligence Hub Capability Expansion — Recommended ROI

**Work package:** `intelligence-hub-capability-expansion-v1`  
**Verdict:** `EXPANSION_CONTRACT_NEEDED`  
**Owner repo:** CapitalGlass-Cross-Agent

## Principle

Expand **retrieval and gates**, not narrative surface area.

**Retrieval chain:** scout hook → hot AI cache → compact index slice → repo files only if miss.

## Completed baseline (rank 1)

| Item | Status |
|------|--------|
| Hot AI-cache scout routing | **SHIPPED** |

Evidence: CG-AppBuilder-MCP `run-intelligence-hub-scout.mjs`, `hot-routing-index.mjs`; Cross-Agent `.cursor/hooks/intelligence-hub-scout-inject.sh`.

## Recommended rankings

| Rank | Capability | Phase | Status |
|------|------------|-------|--------|
| 1 | Hot AI-cache scout routing | — | SHIPPED |
| 2 | Command index expansion | Immediate | IN_PROGRESS |
| 3 | Blocker → next-action map | Immediate | IN_PROGRESS |
| 4 | Receipt registry | Phase 1 | SCAFFOLDED |
| 5 | Owner-repo boundary index | Phase 1 | PARTIAL |
| 6 | Do-not-advance registry | Phase 1 | IN_PROGRESS |
| 7 | Host authority map | Phase 1 | SCAFFOLDED |
| 8 | Freshness dashboard slice | Phase 2 | PLANNED |
| 9 | Per-domain compact packs | Phase 2 | SCAFFOLDED |
| 10 | Auto-publisher activation | Phase 2 | STAGED_NOT_ACTIVE |

## Next implementation wave

1. **Command index expansion** — `provesGate` / `gateId` on every proof command.
2. **Blocker → next-action map** — blocker id → owner, host, command id, receipt ref.

## Machine-readable outputs

Compiled by `npm run index:compile-control-slices` into `work-progress/intelligence-hub-slices/`:

- `current-state.json`
- `blockers.json`
- `commands.json`
- `receipts.json`
- `owner-boundaries.json`
- `do-not-advance.json`
- `host-authority.json`
- `work-package-registry.json`
- `freshness-dashboard.json`
- `domains/*.json`

Publication target: `L:/Capital-Glass-Intelligence-Hub/00-master-index/BY-KIND/` after freshness gate PASS on WESLEYDESK.

## Forbidden expansions

- Long markdown dumps to L: without machine-readable slices
- Claiming hub current without freshness gate PASS
- Duplicating owner-repo truth only in chat or harvest prose

## Related artifacts

- `recommended-roi.json` — machine ranking
- `expansion-contract-v1.json` — slice catalog and compile contract
- `work-progress/blocker-to-action-map.json` — authoritative blocker actions
- `work-progress/do-not-advance-registry.json` — non-claims registry
