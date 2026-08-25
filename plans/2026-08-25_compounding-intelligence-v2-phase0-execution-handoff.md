# Handoff: Compounding Intelligence V2 — Phase 0 execution

**Read this first, before the plan.** This document briefs an agent starting cold, with no memory of the Cross-Agent research session that wrote the plan below. If you're that agent: read this whole file first, then read the plan it points to, then start work. Don't skip to the plan and start improvising — the parts of this handoff that aren't in the plan exist because they matter.

## What this is and isn't

This is an **execution** handoff, not a design document. The design is done and merged: `plans/2026-08-25_compounding-intelligence-v2-live-integration-proof.md`, in this same directory. That plan is the single source of truth for what Phase 0 through Phase 4 mean, what each requires, and the target receipt shape. This handoff does not repeat that content — it tells you how to *start*, what governs *how* you build, and how you'll know you're actually done. If anything here and the plan ever disagree, the plan wins; come back and fix this file rather than trusting a stale copy.

## Why you're needed and the prior session wasn't

The plan was written inside a container scoped to the `CapitalGlass-Cross-Agent` repo only: no physical host access, no live Supabase credentials, no WaveRunner repo, no real `L:` mount. Everything in that session was real code, real tests, real merged PRs (#43, #45, #46) — but every claim about live systems was necessarily either an investigation finding or a deferred requirement. You are the session that has what that one didn't. Confirm you actually do before starting:

- [ ] Running on a real Capital Glass host (WESLEY_WORK, WESLEYDESK, or RYZEN9DESK — see `work-progress/intelligence-hub-slices/host-authority.json` for what each host is for)
- [ ] The `L:` drive (or its WSL mount, `/mnt/l/Capital-Glass-Intelligence-Hub`) is actually mounted and readable
- [ ] A real hot-cache path resolves for this host (`S:`, `D:`, or `C:` "AI Cursur Cache" per host — see `scripts/intelligence/lib/hot-ai-cache-plane-v1.mjs`'s `ALL_KNOWN_CACHE_HOST_IDS`)
- [ ] Live Supabase credentials are actually available (`CROSS_AGENT_INTELLIGENCE_HUB_PROJECTION_APPROVED`, `INTELLIGENCE_HUB_LIVE_WRITES`, plus whatever Doppler config `freshness-gate.mjs` expects — it shells out via `doppler run --project cg-mcp --config dev`)
- [ ] If you're touching Phase 3, WaveRunner's repo (or `CG-AppBuilder-MCP`, which hosts `scripts/sdlc-protocol-cursor/waverunner-capability-registry-v1.json`) is actually reachable from here

If any of these are false, say so plainly and stop rather than simulating the missing piece — see the architectural rule below. A phase that can't be verified for real is not a phase you can close, even partially.

## Start at Phase 0. Do not start at Phase 1.

The plan is explicit about why: proving the hot AI cache is fast (Phase 1) is worthless — actively misleading — if what it's fast at retrieving is stale. Phase 0 has to close first because every later phase's proof depends on intelligence actually refreshing itself.

## The one uncompromising success condition

This is the test every phase, including Phase 0, ultimately serves. It's stated in full in the plan; repeating it here because it's the thing to hold in mind while you work, not just read once:

> After a commit lands on `main`, a fresh agent must automatically receive intelligence derived from that commit without Wesley manually refreshing anything.

Not "detects it's stale." Not "can refresh on request." *Automatically receives it*, with nothing manually triggered anywhere in the chain.

## The architectural rule — read this before writing any code

No component is allowed to reimplement another component's responsibility just to make a proof go green:

- Cross-Agent does not become Platform Intelligence.
- WaveRunner does not build another preflight.
- Hot cache does not become authority.
- Supabase does not become authority.
- L: does not become authority.
- Gold Mine does not bypass the graph.
- Preflight does not silently tolerate stale provenance.

Git `main` is the only authority. Everything else — Platform Intelligence, the index, the L-drive Hub, Supabase, the hot AI cache — is a retrieval or projection surface that must faithfully reflect `main`, never a second source of truth for it. Concretely: if you find yourself writing code where, say, the hot-cache plane starts deciding freshness on its own instead of comparing against `getCrossAgentIndexedSha()`, or WaveRunner grows its own Hub search instead of calling `intelligence.preflight()`, stop — that's the shortcut this rule exists to block, and the phase isn't done, it's faked.

## What already exists — wire these up, don't rebuild them

Everything below is real, tested code from this repo. Phase 0's job is proving these connect end-to-end automatically, not writing new detection or new planes:

| Responsibility | Where it already lives |
| --- | --- |
| Freshness detection (Git vs. L: vs. Supabase SHA) | `scripts/index/freshness-gate.mjs` — fail-closed, three-way SHA comparison. Currently operator-invoked; Phase 0's job is triggering it automatically on a `main` push and propagating its result, not rewriting its detection logic. |
| Hot AI cache resolution + freshness | `scripts/intelligence/lib/hot-ai-cache-plane-v1.mjs` — `resolveMissionIntelligenceCacheRoot()`, `testHotAiCachePlane()`. Host-aware as of PR #45; this is its first real test against physical mounts. |
| Mission-context retrieval ladder | `scripts/intelligence/lib/preflight-v1.mjs` — `runIntelligencePreflight()`, the hot-cache → L: → Supabase → Git ladder. |
| Gold Mine / compounding ingest | `scripts/harvest/lib/goldmine-protocol-v1.mjs` — `runGoldMineProtocol()`. `hubPublication: 'NOT_IMPLEMENTED'` is intentional, not a bug — Phase 2 wires it through the paths below, it doesn't get its own Supabase client. |
| Supabase projection (the *existing*, governed path) | `scripts/intelligence/lib/hub-supabase-projection-map-v1.mjs`, `supabase-intelligence-store-v1.mjs`, `hub-operational-intelligence-publish-v1.mjs` — Phase 2 is wiring Gold Mine through these, never a second implementation. |
| WaveRunner's contract with all of the above | `contracts/intelligence/waverunner-preflight-consumption-contract-v1.md` — already written, already precise about exact CLIs and the exact AppBuilder registry file. Phase 3 is WaveRunner consuming this, not this repo guessing at WaveRunner's internals. |
| The unified receipt shape | `contracts/intelligence/unified-mission-receipt-v1.schema.json`, built by `scripts/intelligence/lib/unified-mission-receipt-v1.mjs`. Extend it for Phase 0's `publicationPosition`/`authorityFreshness`/source-SHA fields; don't start a parallel receipt format. |

## How you'll know Phase 0 is actually done

Not "the freshness gate ran and reported drift" — it already does that today, and that's the problem, not the proof. The proof is the full loop with nothing manual:

1. Commit something material to `main` in a repo this system tracks.
2. Touch nothing else. No manual re-index, no manual publish, no manual cache refresh, no manually re-running `freshness-gate.mjs`.
3. Verify, in order, that each of these becomes true **on its own**: the drift is detected → the correct repo is incrementally re-indexed → the new publication becomes authoritative-current → L-drive Hub slices refresh → the hot AI cache is invalidated/rebuilt → the Supabase projection refreshes → a fresh `intelligence.preflight()` call reports `FRESH` and names the exact SHA it consumed.
4. Then the test that actually matters: open a **brand-new agent session** (not this one, not a continuation) and ask it something whose correct answer depends on the content of the commit from step 1. Confirm it retrieves and uses that intelligence without being told to refresh anything.

If step 4 fails while step 3 passes, that gap — something refreshed but didn't actually reach a retrieving agent — is itself the next Phase 0 bug. Don't call Phase 0 done until step 4 passes for real.

## Where to record what happens

Same conventions the rest of this repo uses — don't invent a new format:

- Open a new work-progress project file for the execution work itself (`work-progress/projects/<date>_compounding-intelligence-v2-phase0-execution-v1.md`), following the existing pattern in this directory: Commits/PRs, Next actions, Update log, Reusable lessons.
- Update `work-progress/ACTIVE_WORK.md` and `work-progress/projects/INDEX.md` when Phase 0's status changes.
- If you hit a real governance question (not the charter-wording or `CONFLICTED`-lifecycle-state tracks — those are parallel and don't block this), log it in `decisions/DECISION_LOG.md` rather than deciding silently.
- If a phase turns out to need a design decision this handoff didn't anticipate, that's a real stopping point for Wesley, not something to resolve solo — same posture this repo has used throughout: confident and small, fix it; ambiguous or architecturally significant, ask first.

## What not to do

- Don't re-litigate charter wording (`scripts/` vs. the "must not become the work" rule) or the `CONFLICTED` lifecycle state. Both are open, tracked separately, and explicitly don't block this mission.
- Don't build Phase 2's Supabase wiring in isolation from Phase 0/1, and don't build any phase out of order without a reason tied to the dependency (each phase's `Requires:` line in the plan explains why the order matters).
- Don't treat a single phase's local success as the mission's success. The mission is the one uncompromising success condition above, end to end.
