# estate-hot-cache-layer-alignment-v1

**Status:** ACTIVE — **run before** `autonomous-sdlc-durability-friction-hardening-v1`  
**Owner repo:** `CG-AppBuilder-MCP` (estate sync tooling) + operator host  
**Coordination:** `CapitalGlass-Cross-Agent`  
**Lane:** estate synchronization / retrieval authority (not harvest, not SDLC implementation)

## Problem

Scout reports `layerAlignment: DRIFT` — local hot-ai-cache (`~/.local/share/capital-glass/hot-ai-cache`) is behind L: publication authority @ `CapitalGlass-Cross-Agent@73b2fe2`. Fast retrieval can feed **stale** context into the next material execution wave.

**Not a harvest blocker.** Must be cleared before `autonomous-sdlc-durability-friction-hardening-v1` to avoid polluting friction-hardening proof with stale scout/index context.

## Source evidence

- Universal harvest closeout: `harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1` — `DURABLE_COMPLETE` @ `73b2fe2`
- Scout: `INDEX_HIT_AI_CACHE`, `layerAlignment: DRIFT`, `sourceCommitSha: f8ba6061…` (stale vs L:)
- L: mounted: `/mnt/l/Capital-Glass-Intelligence-Hub/00-master-index`
- Index freshness gate: **PASS** @ `73b2fe2` (`artifacts/agent-runs/cross-agent-index-freshness-gate-v1/latest.json`)

## End state

| Field | Target |
| --- | --- |
| `layerAlignment` | `ALIGNED` (or documented equivalent pass) |
| Hot-cache `sourceCommitSha` | Matches L: active-work-ledger `LATEST.json` / freshness gate `gitHead` |
| Scout preflight | No DRIFT on material session start |

## Scope

- Refresh hot-ai-cache from L: / publication receipts (estate-sync action)
- Verify scout `agent:index:scout` / `agent:index:preflight` reports aligned layers
- **Out of scope:** SDLC orchestrator changes, Gold Mine projection schema, Z mirror (Z unmounted)

## Commands (indicative — use repo-native estate sync)

```bash
# From CG-AppBuilder-MCP — confirm exact script from docs/CURSOR_WSL_REMOTE_SETUP.md or sync:intelligence-hub-scout-hooks lane
npm run agent:index:scout -- --json
npm run agent:index:preflight -- --json
# Estate hot-cache refresh per operator runbook when layerAlignment=DRIFT
```

## Do not advance

- Start `autonomous-sdlc-durability-friction-hardening-v1` MILESTONE_WAVE while scout still reports `layerAlignment: DRIFT`
- Treat hot-cache hit as authoritative when L: freshness gate SHA is newer

## Deferred (separate WPs)

- `gold-mine-projection-schema-hardening-v1`
- Z mirror parity when Z mountable
- Governance authority merge (`CG-Platform-Governance-MCP`)

## Update notes

- **2026-08-07:** Queued as precursor to friction-hardening wave per universal-harvest ROI / operator sequencing lock.
