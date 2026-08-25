# Plan: compounding-intelligence-unified-loop-v1

## Origin

Follow-on to `plans/2026-08-24_compounding-intelligence-v2-proposal.md` (PR #43,
merged). After that PR shipped, Wesley pointed out that the pieces it built —
`intelligence.preflight()`, `/goldmine`, the relationship-type registry — were
each real and tested, but not integrated into one governed loop, and that a
real gap existed: **`intelligence.preflight()`'s mission-context capability was
not registered anywhere in this repo's own MCP/query-routing layer**, so no
consumer (including this repo's own tooling) had a deterministic way to find
it. This plan closes that, and the rest of the loop Wesley specified, as far
as this repo's own boundary allows.

## The target architecture (Wesley's specification, verbatim structure)

```
Agent starts
  -> Preflight
  -> AI cache
  -> L-drive Intelligence Hub
  -> Supabase projection
  -> Git/source fallback
  -> mission context
  -> WaveRunner executes
  -> closeout
  -> Gold Mine / compounding graph
  -> publish
  -> refresh cache/index
  -> next agent gets better context
```

Governing rules (see the user's own message in-session for full text):

1. Preflight is the universal entry point — every agent calls the same
   `intelligence.preflight()` contract.
2. The lookup ladder is `hot-ai-cache -> L: -> Supabase -> Git`, and a cache
   hit is only fresh if its recorded source SHA still matches authority —
   never TTL alone.
3. WaveRunner consumes preflight, not reproduces it — a valid receipt is
   required before Wave 0.
4. WaveRunner closeout automatically feeds Compounding Intelligence;
   `/goldmine` stays the explicit on-demand command.
5. Supabase is the durable searchable projection, not the authority — L:
   stays the fast compact front door.
6. The graph flows into preflight — it answers real questions (what failed,
   what enables this, what governs this, what's related, what's unresolved,
   what was corrected/superseded), not just keyword-matched facts.
7. One unified end-to-end receipt covers the whole lifecycle.
8. Acceptance test: run one real WaveRunner mission, close it, start a
   brand-new agent session, and prove the second agent automatically
   retrieves and uses intelligence the first mission produced.

## What this repo's boundary actually allows

This repo (`CapitalGlass-Cross-Agent`) owns intelligence derivation,
retrieval, and the routing/dataset registries that other repos consume. It
does **not** own WaveRunner's execution loop, the physical hot-cache compiler
(`CG-AppBuilder-MCP`'s `hot-cache-platform`), or live Supabase credentials
from this container. Everything below is scoped honestly against that
boundary — built and tested where this repo has real authority and access,
specified as a precise contract where it doesn't.

## Built and verified this work package

| Rule | What was built | Verification |
| --- | --- | --- |
| 1 (routing) | `mission-intelligence` registered as a `queryClass` + dataset in `registry/query-routing/query-routing-manifest.v1.json` and `registry/datasets/hot-cache-dataset-registry.v1.json` — the real, cross-repo-consumed (by `CG-AppBuilder-MCP`) routing layer. Deliberately distinct from the pre-existing `queryClass: "preflight"` (routes to `all-systems-go`, an unrelated infra-readiness concept). | `npm run validate:query-routing`, `npm run validate:hot-cache-dataset-registry`, `npm run test:query-routing` — includes a dedicated collision test proving the new route doesn't shadow the old one. |
| 2 (ladder + freshness) | `hot-ai-cache` added as the first-checked rung in `runIntelligencePreflight()` (`scripts/intelligence/lib/hot-ai-cache-plane-v1.mjs`), reusing the existing, proven host/root resolution (`resolveZCacheRoot`, `resolveHostHotCacheRoot` — Z: canonical authority, then per-host read-through replicas, confirmed against decision `CAD-20260802-z-ai-cache-single-canonical-authority`). SHA-based freshness (`CACHE_HIT_FRESH` / `CACHE_HIT_STALE` / `CACHE_MISS` / `CACHE_ROOT_UNAVAILABLE`), never TTL alone. | `npm run test:intelligence-hot-ai-cache` — 5 tests against real logic via env-injected fixtures (this container has no physical cache mounted, so a live hit can't be proven here, only the correctness of the fresh/stale/miss logic). |
| 3 (WaveRunner consumes preflight) | Specified precisely in `contracts/intelligence/waverunner-preflight-consumption-contract-v1.md`, naming the exact CLI calls and the real AppBuilder file (`waverunner-capability-registry-v1.json`) that would register them. | Not implementable from this session — WaveRunner's repo isn't in scope. Documented, not faked. |
| 4 (auto closeout -> compounding) | Same contract, Rule 2 — precise spec for what a closeout hook must call (`runGoldMineProtocol()`), reusing the already-built, already-tested protocol. | Same as above — spec only. |
| 5 (Supabase as projection, not authority) | Unchanged from the prior work package — `hubPublication: 'NOT_IMPLEMENTED'` in `/goldmine`'s receipt stays honest; no live-write path was added or claimed. | Covered by the existing goldmine test suite. |
| 6 (graph flows into preflight) | `buildMissionContextBundle()` extended with real graph traversal (`scripts/intelligence/lib/mission-graph-queries-v1.mjs`): `recentlyCorrectedOrSuperseded` (walks real `supersededBy`/`lifecycleState` fields), `relationshipGraph` (walks real `entity.relationships[]` edges), `unmodeledEvidence` (the unmodeled-intelligence queue), `governingDecisions` (parses the real `decisions/DECISION_LOG.md`). | `npm run test:intelligence-mission-graph` — 7 tests, including one against the real decision log and a full isolated-fixture integration test. |
| 7 (unified receipt) | `contracts/intelligence/unified-mission-receipt-v1.schema.json` + `scripts/intelligence/lib/unified-mission-receipt-v1.mjs`. Fields this repo owns (`preflight`, `aiCache`, `lHub`, `supabaseProjection`, `goldmine`, `graphDividend`, `newNodes`, `relationshipsReinforced`) come from real `runIntelligencePreflight()`/`runGoldMineProtocol()` output. `waverunner` and `cacheRefresh` default to `NOT_YET_INTEGRATED` and can only be set by a caller supplying real evidence — never inferred. | `npm run test:intelligence-unified-receipt` — 5 tests, including full schema validation against real (not mocked) preflight + goldmine output. |
| 8 (two-agent proof) | Already built in the prior work package (`testGoldMineOutputIsRetrievableByFreshPreflight` in `run-goldmine-protocol.test.mjs`) for the in-repo slice of the loop. **Not extended to cover WaveRunner** — that requires a real WaveRunner mission, which this session cannot run. | Existing test, unchanged. The full acceptance test Wesley specified (real WaveRunner mission -> new agent session -> automatic retrieval) remains open — see below. |

## What remains open, and why

| Item | Blocker |
| --- | --- |
| Full acceptance test (rule 8) | Requires a real WaveRunner mission to actually run, which requires WaveRunner's repo in scope and Rules 3–4 actually wired into its code — neither available in this container. |
| Live verification of the hot-ai-cache plane against a real cache hit | No `/mnt/z`, `/mnt/s`, `/mnt/d`, or `/mnt/c` mount in this container — verify on WESLEYDESK/WESLEY_WORK/RYZEN9DESK. |
| WaveRunner code changes (Rules 3–4) | WaveRunner's repo isn't in this session's scope. `contracts/intelligence/waverunner-preflight-consumption-contract-v1.md` is ready for whoever picks this up. |
| Live Supabase publish path for `/goldmine` | Deliberately deferred again — Wesley's explicit instruction was not to build this in isolation; it's one piece of the loop, not the whole next mission, and still needs live credentials this container doesn't have. |
| Charter wording (proposal 1), `CONFLICTED` lifecycle state (proposal 6) | Unchanged from the prior work package — still need an operator decision and, for the lifecycle state, the formal superseding-plan process. |

## Reusable finding

Registering something in `registry/query-routing/` and
`registry/datasets/hot-cache-dataset-registry.v1.json` is a real, cross-repo-
effective action from this repo alone — `CG-AppBuilder-MCP` already consumes
both files directly (no duplication permitted, per
`registry/query-routing/README.md`'s own "Forbidden" list). Any future
Cross-Agent capability meant to be discoverable by other agents should be
registered here rather than assumed to need cross-repo code changes first.
