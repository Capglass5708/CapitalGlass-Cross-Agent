# Plan: compounding-intelligence-v2-live-integration-proof

## Origin

PR #45 (`compounding-intelligence-unified-loop-v1`) merged. Bugbot's review sequence on it converged cleanly — 3 findings → 1 follow-up side-channel finding on the first fix → 0 findings — with a dedicated regression test added at every step. The most important correction was `NOT_CHECKED` vs. `UNAVAILABLE` on the unified receipt: a short-circuited lane that was never probed now says so, instead of silently reading the same as a lane that was probed and failed. That distinction is the whole point of a receipt — it has to be truthful about what actually happened, not just report an end state.

Wesley's instruction closing out that PR: merge it, freeze this layer, and move directly into a real cross-system integration proof — "more local plumbing without a real cross-system proof starts giving diminishing returns." This plan is that next mission. Charter wording (proposal 1) and the `CONFLICTED` lifecycle state (proposal 6) remain open governance decisions, tracked in parallel — neither blocks this work.

## Deferred design improvement (not this phase): scope-aware cache keys

The current hot-ai-cache behavior, from PR #45: a fresh cache hit only satisfies an **unscoped** query (`concepts=[]`, `repos=[]`). A scoped query (e.g. `repos=[Revu, CE]` or `concepts=[STOREFRONT]`) always falls through to live retrieval, even if the cache is fresh, because the cached bundle's own compilation scope isn't verifiable from this repo — using it for a scoped query risked either returning unfiltered data or silently leaking it through the receipt (both were real Bugbot findings, both fixed).

That's the correct, safe behavior today. It's also intentionally inefficient: every scoped query pays the live-retrieval cost even when a perfectly good cache exists. The real fix is **scope-aware cache keys or filtered derived bundles** — e.g. a compiled bundle per `(repos, concepts)` signature, or a base bundle plus a cheap local filter step with a verified-safe filtering contract — so a scoped query can still get a legitimate hot-cache hit without exposing unrelated intelligence. This needs real design work (bundle key scheme, who compiles filtered variants, cache-explosion limits) and is explicitly **not** part of this plan's four phases below. Tracking it here so it isn't lost, not building it now.

## The mission: Compounding Intelligence V2 — Live Integration Proof

Everything built so far (registry registration, the hot-ai-cache ladder rung, graph-aware mission context, the unified receipt contract, the local `/goldmine` loop) is real and tested, but only ever proven against this container: no physical cache mount, no live Supabase credentials, no WaveRunner repo access. This mission proves the same loop works across real, separate systems — in this order, because each phase needs the one before it to mean anything:

### 1. Real hot-AI-cache proof, all three hosts

Prove `WESLEY_WORK`, `WESLEYDESK`, and `RYZEN9DESK` each:
- resolve their actual cache root (`resolveMissionIntelligenceCacheRoot()` in `scripts/intelligence/lib/hot-ai-cache-plane-v1.mjs`, already host-aware after the PR #45 Bugbot fix — this is the first real test of that fix against real mounts, not the env-injected fixtures used in this container)
- write and read the *same* `mission-intelligence` bundle contract (`CACHE_BUNDLE_REL = '00-master-index/BY-KIND/mission-intelligence.json'`)
- preserve scope isolation (an unscoped hit satisfies the ladder; a scoped query still falls through, per the deferred-improvement note above)
- expose freshness/provenance correctly (`cachedSha` vs. `authoritySha`, `CACHE_HIT_FRESH`/`CACHE_HIT_STALE`/`CACHE_MISS` all reachable for real, not just via fixtures)

**Requires:** physical access to those three hosts. Not available from this container — needs to run on the real WSL/Windows environments.

### 2. Supabase publication + readback

`/goldmine`'s `hubPublication: 'NOT_IMPLEMENTED'` (`scripts/harvest/lib/goldmine-protocol-v1.mjs`) is exactly right as it stands — it was built that way specifically so it would never claim a publish that didn't happen. This phase wires it through the **existing governed projection path** from the OP-00A pipeline — `hub-supabase-projection-map-v1.mjs`, `supabase-intelligence-store-v1.mjs`, `hub-operational-intelligence-publish-v1.mjs` — rather than inventing a second Supabase implementation for the Gold Mine loop. Then prove `intelligence_hub.knowledge_objects` and `.relationships` can genuinely be published and read back with provenance intact.

**Requires:** live Supabase credentials (`CROSS_AGENT_INTELLIGENCE_HUB_PROJECTION_APPROVED`, `INTELLIGENCE_HUB_LIVE_WRITES`), not available in this container. The wiring code itself could potentially be drafted here (same pattern as everything else this session: build + unit-test the code path, defer live verification) — but per Wesley's explicit instruction on the prior mission not to build the Supabase piece in isolation, this stays sequenced as phase 2 of the live-integration mission, not pulled forward on its own.

### 3. WaveRunner integration

WaveRunner requires a valid `intelligence.preflight()` receipt before Wave 0, and emits the intelligence handoff automatically at closeout — consuming the shared contract (`contracts/intelligence/waverunner-preflight-consumption-contract-v1.md`, already written and precise: exact CLIs, exact real AppBuilder registry file `CG-AppBuilder-MCP/scripts/sdlc-protocol-cursor/waverunner-capability-registry-v1.json`) rather than implementing its own cache/Hub search ladder.

**Requires:** WaveRunner's repo added to session scope. Not currently available.

### 4. True end-to-end compounding proof

Run one real WaveRunner mission → Gold Mine / graph mutation → Supabase + L-drive/cache refresh → start a completely fresh agent session → prove its preflight call actually retrieves the new intelligence and its behavior changes because of it. This is the two-agent proof (proposal 4) at full scale — the in-repo version already exists and passes (`testGoldMineOutputIsRetrievableByFreshPreflight` in `run-goldmine-protocol.test.mjs`); this phase is the same proof run for real, across all the systems above.

**Requires:** phases 1–3 actually working on real infrastructure.

## Target unified receipt

The proof this mission is building toward, expressed as one receipt (extending `contracts/intelligence/unified-mission-receipt-v1.schema.json` once `waverunner` and `cacheRefresh` have real evidence to report instead of `NOT_YET_INTEGRATED`):

```
PREFLIGHT: PASS
AI_CACHE: HIT_FRESH          (a real host, not an env-injected fixture)
L_HUB / SUPABASE_PROJECTION: VERIFIED / CURRENT
WAVERUNNER: COMPLETE          (real evidence, never inferred)
GOLDMINE: GOLD_MINE_COMPLETE
GRAPH_DIVIDEND: PASS
SUPABASE: PUBLISHED           (new field — phase 2)
CACHE_REFRESH: PASS           (real evidence, never inferred)
FRESH_AGENT_RETRIEVAL: PROVEN (new field — phase 4)
```

## What this session can do right now

Nothing in phases 1–4 is directly executable from this container — each needs either physical host access, live credentials, or a repository this session's scope doesn't include. What's available now is exactly what this plan document is: a precise enough spec that starting any phase, once the relevant access exists, is mechanical rather than another round of investigation. When repo/host access for a given phase becomes available, that phase's own work package should be opened separately rather than bundled here.
