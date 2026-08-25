# Plan: compounding-intelligence-v2-live-integration-proof

## Origin

PR #45 (`compounding-intelligence-unified-loop-v1`) merged. Bugbot's review sequence on it converged cleanly — 3 findings → 1 follow-up side-channel finding on the first fix → 0 findings — with a dedicated regression test added at every step. The most important correction was `NOT_CHECKED` vs. `UNAVAILABLE` on the unified receipt: a short-circuited lane that was never probed now says so, instead of silently reading the same as a lane that was probed and failed. That distinction is the whole point of a receipt — it has to be truthful about what actually happened, not just report an end state.

Wesley's instruction closing out that PR: merge it, freeze this layer, and move directly into a real cross-system integration proof — "more local plumbing without a real cross-system proof starts giving diminishing returns." This plan is that next mission. Charter wording (proposal 1) and the `CONFLICTED` lifecycle state (proposal 6) remain open governance decisions, tracked in parallel — neither blocks this work.

## Deferred design improvement (not this phase): scope-aware cache keys

The current hot-ai-cache behavior, from PR #45: a fresh cache hit only satisfies an **unscoped** query (`concepts=[]`, `repos=[]`). A scoped query (e.g. `repos=[Revu, CE]` or `concepts=[STOREFRONT]`) always falls through to live retrieval, even if the cache is fresh, because the cached bundle's own compilation scope isn't verifiable from this repo — using it for a scoped query risked either returning unfiltered data or silently leaking it through the receipt (both were real Bugbot findings, both fixed).

That's the correct, safe behavior today. It's also intentionally inefficient: every scoped query pays the live-retrieval cost even when a perfectly good cache exists. The real fix is **scope-aware cache keys or filtered derived bundles** — e.g. a compiled bundle per `(repos, concepts)` signature, or a base bundle plus a cheap local filter step with a verified-safe filtering contract — so a scoped query can still get a legitimate hot-cache hit without exposing unrelated intelligence. This needs real design work (bundle key scheme, who compiles filtered variants, cache-explosion limits) and is explicitly **not** part of this plan's phases below. Tracking it here so it isn't lost, not building it now.

## The one uncompromising success condition

Everything below serves one test. Wesley set it explicitly, after PR #45 merged, so it can't be softened by phase-by-phase partial credit:

> After a commit lands on `main`, a fresh agent must automatically receive intelligence derived from that commit without Wesley manually refreshing anything.

That single test forces Git freshness, Platform Intelligence, Supabase, the L-drive cache, the hot AI cache, preflight, graph traversal, and agent retrieval to operate as one system rather than a collection of good subsystems that happen to sit next to each other. Every phase below — including Phase 0 — exists to make that test pass for real, not to add another isolated proof.

## The architectural rule for all five phases: no component reimplements another's responsibility

Wesley set this explicitly, after reviewing the merged Phase 0 design, as a rule that governs *how* every phase below gets built, not just what it proves. It exists because the fastest way to fake this proof green is for one plane to quietly absorb another's job — a scoped agent could always make its own lane report success by reimplementing what it was supposed to be *reading from*. That is never an acceptable way to close a phase:

- Cross-Agent does not become Platform Intelligence.
- WaveRunner does not build another preflight.
- Hot cache does not become authority.
- Supabase does not become authority.
- L: does not become authority.
- Gold Mine does not bypass the graph.
- Preflight does not silently tolerate stale provenance.

Git `main` is the only authority. Every other plane (Platform Intelligence, the index, the L-drive Hub, Supabase, the hot AI cache) is a retrieval or projection surface that must faithfully reflect it, never a second source of truth for it. If a phase can only go green by having one component do another's job, the phase isn't done — the real integration gap it was supposed to prove is still open.

## The mission: Compounding Intelligence V2 — Live Integration Proof

Everything built so far (registry registration, the hot-ai-cache ladder rung, graph-aware mission context, the unified receipt contract, the local `/goldmine` loop) is real and tested, but only ever proven against this container: no physical cache mount, no live Supabase credentials, no WaveRunner repo access. This mission proves the same loop works across real, separate systems — in this order, because each phase needs the one before it to mean anything:

### Phase 0 — Close automatic intelligence freshness

**Why this phase exists, and why it comes first.** Wesley checked live status after PR #45 merged onto `main` at `e5f2feab...` and found Platform Intelligence still serving the Cross-Agent index at `5f3de962...`:

```
driftClassificationV1f: BEHIND_REMOTE
driftStatus: INDEX_BEHIND
autoPublishEnabled: false
mode: DETECT_ONLY
```

reported *alongside*:

```
publicationStatus: CURRENT
currentPublication: true
```

The freshness problem survived the merge exactly as expected — everything built through PR #45 is real, but it has only ever been proven inside this container, never across the live systems it's meant to keep in sync. Until this closes, proving the hot AI cache is fast is misleading: it would only prove that all three machines can very quickly retrieve *old* intelligence. That's why this phase runs before, not alongside, Phases 1–4.

**Investigation finding (this session): Cross-Agent does not own Platform Intelligence's code.** A repo-wide search for the exact fields Wesley reported (`driftClassificationV1f`, `driftStatus`, `autoPublishEnabled`, `mode: DETECT_ONLY`, `currentPublication`) turns up no schema or script in `scripts/` that defines or emits them. Every match is either this repo's own prior record of the *same* operator-reported signal (`plans/2026-08-24_compounding-intelligence-v2-proposal.md`, written the day before, already noting `currentPublication: true` alongside a stale cached SHA and `autoPublishEnabled: false` / `mode: DETECT_ONLY` on several repos), or harvested historical evidence of what "(CG) Platform Intelligence" reported when queried in past threads (`work-progress/harvest-intelligence-index.json`, the 2026-08-07 harvest artifacts, `verification/CURRENT_GATES.md`'s note on the "Platform Intelligence Bible connector"). Platform Intelligence is a live external system this repo observes, harvests from, and is harvested about — not one it implements. This session cannot patch its status vocabulary directly; that has to be a hand-off, the same way the WaveRunner integration is a contract handed to a repo Cross-Agent doesn't own.

What Cross-Agent *does* already own, and what this phase actually has to wire up, is real:

- **Detection already exists and is accurate.** `scripts/index/freshness-gate.mjs` is a fail-closed, three-way SHA comparison — Git HEAD vs. the L: drive's `active-work-ledger/LATEST.json` `sourceCommitSha` vs. a live Supabase drift-probe (via AppBuilder's `cross-agent-ledger:drift-probe`) — and it already fails loudly on any mismatch. This is almost certainly the mechanism behind Platform Intelligence's `mode: DETECT_ONLY`: detection is real, it's just never wired to run itself.
- **The gap is automation and propagation, not detection.** `freshness-gate.mjs` is operator-invoked, not triggered by a `main` push. And even a passing gate today only reports drift — nothing downstream (index, publication, graph projection, L-drive compact cache, hot-ai-cache) is invalidated or rebuilt as a consequence. That is exactly the shape of the gap this whole plan exists to close, restated precisely in `plans/2026-08-24_compounding-intelligence-v2-proposal.md`: *"A system that reports `autoPublishEnabled: false` / `mode: DETECT_ONLY` — accurately telling you it's stale, without repairing it — has not met this bar, regardless of how good its detection is."*

**The proof, exactly as specified:**

```
Git main changes
  → freshness gate detects SHA mismatch
  → correct repo is incrementally re-indexed
  → new publication becomes authoritative-current
  → L-drive compact Hub slices refresh
  → Supabase projection refreshes
  → hot AI cache is invalidated/rebuilt
  → intelligence.preflight() reads the new generation
  → receipt reports the source SHA it actually consumed
```

without an operator manually kicking it off at any step. Two details in that chain are load-bearing, not stylistic: "**correct** repo is incrementally re-indexed" — this repo tracks work across many sibling repos, so the proof has to show the gate identifies *which* repo drifted and re-indexes that one, not just Cross-Agent's own SHA; and "receipt reports the source SHA it actually consumed" — `FRESH` alone is not sufficient evidence, the receipt must name the exact SHA so the claim is independently checkable, not asserted.

**Status vocabulary fix — a required deliverable of this phase, not a suggestion.** Nothing may report a combination of "current" and "behind" that an agent can misread as safe. Concretely: `currentPublication: true` co-occurring with `driftStatus: INDEX_BEHIND` is dangerously easy to interpret as *current with source*, when it actually only means *current generation of what was last published*. Two separate fields, stated as a hard requirement on every Cross-Agent-owned freshness/publication contract going forward (`contracts/intelligence/unified-mission-receipt-v1.schema.json`, `work-progress/intelligence-hub-slices/freshness-dashboard.json`, and any future Phase 0 receipt), replace that ambiguity:

```
publicationPosition: LATEST_PUBLISHED   # is this the most recent thing that was ever published?
authorityFreshness:  STALE              # does it match current Git authority?
```

so an agent can accurately say two separate things instead of one confusing one: *"Latest available publication: yes. Matches Git authority: no."* This vocabulary is also the precise hand-off recommendation for whatever service implements Platform Intelligence, since this repo can describe the fix but can't merge it into code it doesn't own.

**Requires:** the same live access as Phases 1–4 below — a real `main` push observed end-to-end across Git, the index publisher, the L: drive, the hot AI cache, and Supabase, with nothing manually re-run in between. Not available from this container; this is the first thing the host-based execution session should attempt, because every later phase's proof is worthless if intelligence doesn't refresh itself first.

### Phase 1 — Real hot-AI-cache proof, all three hosts

Prove `WESLEY_WORK`, `WESLEYDESK`, and `RYZEN9DESK` each:
- resolve their actual cache root (`resolveMissionIntelligenceCacheRoot()` in `scripts/intelligence/lib/hot-ai-cache-plane-v1.mjs`, already host-aware after the PR #45 Bugbot fix — this is the first real test of that fix against real mounts, not the env-injected fixtures used in this container)
- write and read the *same* `mission-intelligence` bundle contract (`CACHE_BUNDLE_REL = '00-master-index/BY-KIND/mission-intelligence.json'`)
- preserve scope isolation (an unscoped hit satisfies the ladder; a scoped query still falls through, per the deferred-improvement note above)
- expose freshness/provenance correctly (`cachedSha` vs. `authoritySha`, `CACHE_HIT_FRESH`/`CACHE_HIT_STALE`/`CACHE_MISS` all reachable for real, not just via fixtures)

**Requires:** physical access to those three hosts. Not available from this container — needs to run on the real WSL/Windows environments.

### Phase 2 — Supabase publication + readback

`/goldmine`'s `hubPublication: 'NOT_IMPLEMENTED'` (`scripts/harvest/lib/goldmine-protocol-v1.mjs`) is exactly right as it stands — it was built that way specifically so it would never claim a publish that didn't happen. This phase wires it through the **existing governed projection path** from the OP-00A pipeline — `hub-supabase-projection-map-v1.mjs`, `supabase-intelligence-store-v1.mjs`, `hub-operational-intelligence-publish-v1.mjs` — rather than inventing a second Supabase implementation for the Gold Mine loop. Then prove `intelligence_hub.knowledge_objects` and `.relationships` can genuinely be published and read back with provenance intact.

**Requires:** live Supabase credentials (`CROSS_AGENT_INTELLIGENCE_HUB_PROJECTION_APPROVED`, `INTELLIGENCE_HUB_LIVE_WRITES`), not available in this container. The wiring code itself could potentially be drafted here (same pattern as everything else this session: build + unit-test the code path, defer live verification) — but per Wesley's explicit instruction on the prior mission not to build the Supabase piece in isolation, this stays sequenced as phase 2 of the live-integration mission, not pulled forward on its own.

### Phase 3 — WaveRunner integration

WaveRunner requires a valid `intelligence.preflight()` receipt before Wave 0, and emits the intelligence handoff automatically at closeout — consuming the shared contract (`contracts/intelligence/waverunner-preflight-consumption-contract-v1.md`, already written and precise: exact CLIs, exact real AppBuilder registry file `CG-AppBuilder-MCP/scripts/sdlc-protocol-cursor/waverunner-capability-registry-v1.json`) rather than implementing its own cache/Hub search ladder.

**Requires:** WaveRunner's repo added to session scope. Not currently available.

### Phase 4 — True end-to-end compounding proof

Run one real WaveRunner mission → Gold Mine / graph mutation → Supabase + L-drive/cache refresh → start a completely fresh agent session → prove its preflight call actually retrieves the new intelligence and its behavior changes because of it. This is the two-agent proof (proposal 4) at full scale — the in-repo version already exists and passes (`testGoldMineOutputIsRetrievableByFreshPreflight` in `run-goldmine-protocol.test.mjs`); this phase is the same proof run for real, across all the systems above. It is also the direct, full-scale instance of **the one uncompromising success condition** stated at the top of this plan.

**Requires:** Phase 0 and Phases 1–3 actually working on real infrastructure.

## Target unified receipt

The proof this mission is building toward, expressed as one receipt (extending `contracts/intelligence/unified-mission-receipt-v1.schema.json` once `waverunner` and `cacheRefresh` have real evidence to report instead of `NOT_YET_INTEGRATED`):

```
PUBLICATION_POSITION: LATEST_PUBLISHED  (new field — phase 0: replaces ambiguous currentPublication)
AUTHORITY_FRESHNESS: FRESH              (new field — phase 0: replaces ambiguous currentPublication)
AUTO_PROPAGATION: PROVEN                (new field — phase 0: no manual refresh anywhere in the chain)
PREFLIGHT: PASS
AI_CACHE: HIT_FRESH          (a real host, not an env-injected fixture)
L_HUB / SUPABASE_PROJECTION: VERIFIED / CURRENT
WAVERUNNER: COMPLETE          (real evidence, never inferred)
GOLDMINE: GOLD_MINE_COMPLETE
GRAPH_DIVIDEND: PASS
SUPABASE: PUBLISHED           (new field — phase 2)
CACHE_REFRESH: PASS           (real evidence, never inferred)
FRESH_AGENT_RETRIEVAL: PROVEN (new field — phase 4, the one uncompromising success condition)
```

The first three fields are the point: without them, every other line in this receipt can be true while the underlying intelligence is still stale, exactly as Wesley caught right after PR #45 merged.

## This plan is the durable spec, not the next session

Nothing in Phase 0 or Phases 1–4 is directly executable from this container — each needs either physical host access, live credentials, or a repository this session's scope doesn't include. That is a true statement about *this execution environment*, and it stops being a project blocker the moment the next session runs somewhere else. This plan document is what makes that handoff mechanical instead of another round of investigation: a precise enough spec — proof chains, exact field names, exact existing code to wire up (`freshness-gate.mjs`, `hot-ai-cache-plane-v1.mjs`, the OP-00A Supabase projection path, the WaveRunner consumption contract) — that starting any phase, once the relevant access exists, is execution, not design.

**The next agent session should be an execution session on the host, not another Cross-Agent research session:** WSL host → real `L:` mount → real hot cache → live Supabase credentials → WaveRunner runtime. PR #46 stays the durable plan; it should not accumulate more local plumbing in place of that live proof. When repo/host access for a given phase becomes available, that phase's own work package should be opened separately, on the host, rather than bundled here — and it should be measured against the one uncompromising success condition above, not against how many of these phases it individually completes.
