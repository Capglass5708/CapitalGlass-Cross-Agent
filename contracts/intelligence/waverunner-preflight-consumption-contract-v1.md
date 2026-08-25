# WaveRunner ↔ preflight consumption contract v1

**Status:** DRAFT — not yet wired into WaveRunner's own code. WaveRunner's repo
isn't in this session's scope, so this document specifies precisely what
needs to be built there; it is not itself an implementation.

**Does not modify** `contracts/intelligence/OWNERSHIP.md` (`ARCHITECTURE_LOCKED`).
Consistent with that file's existing row — `WaveRunner / Git | progression
authority | Execution control only` — this contract only asks WaveRunner to
*consume* Cross-Agent's retrieval/publication capabilities before and after
execution. It does not give WaveRunner, or this contract, any authority over
derived intelligence, the envelope schema, or the relationship graph — those
stay exactly where `OWNERSHIP.md` already puts them.

## Why this exists

Wesley's unified-loop design: *"WaveRunner should consume preflight, not
reproduce it... WaveRunner's job is orchestration/execution."* Today nothing
enforces that — WaveRunner (or any agent) can start a mission without ever
calling `intelligence.preflight()`, and can close a mission without ever
triggering `/goldmine` or an intelligence handoff. This contract closes both
gaps, precisely enough that adopting it is a small, mechanical change once
this session (or a future one) has WaveRunner's repo in scope.

## Rule 1 — a valid preflight receipt is required before Wave 0

Before WaveRunner begins Wave 0 of a mission, it must call:

```bash
node scripts/intelligence/preflight.mjs --mission=<missionId> --repos=<repo1,repo2> --concepts=<concept1,concept2> --json
```

(from a `CapitalGlass-Cross-Agent` checkout — `scripts/intelligence/preflight.mjs`
is the CLI entry point; `runIntelligencePreflight()` in
`scripts/intelligence/lib/preflight-v1.mjs` is the underlying function if a
future integration calls it in-process instead of shelling out.)

The resulting receipt (`intelligence-preflight-receipt-v1@1.0.0`) must, at minimum, be threaded into Wave 0's own context:

| Field | Receipt path | Why WaveRunner needs it |
| --- | --- | --- |
| Mission, repos, concepts | `mission`, `repos`, `concepts` | Confirms the receipt matches the mission it's gating |
| Current SHAs | `laneChecks[].cachedSha` / `.authoritySha` (hot cache lane only) | Freshness proof, not just a claim |
| Known blockers | `bundle.activeBlockers` | What's already known to block this repo |
| Prior failures | `bundle.knownFailures` | What's already known to have failed here |
| Applicable patterns | `bundle.successPatterns` | What's already known to work |
| Graph relationships | `bundle.relationshipGraph` | What enables/depends on this concept, per real graph edges |
| Governing decisions | `bundle.governingDecisions` | What the decision log already settled about this subsystem |
| Freshness status | top-level `outcome`, plus `bundle.bundleSource` | Which plane actually answered, and whether it was a live Hub or the Git mirror |

**Fail-closed rule:** if `outcome === 'ALL_HUB_PLANES_UNAVAILABLE'`, WaveRunner
must not silently proceed as if intelligence retrieval succeeded — either halt
and surface this to the operator, or proceed only with an explicit,
logged "ran without retrieved intelligence" flag. Never treat a missing
receipt the same as a receipt that says nothing relevant was found.

## Rule 2 — closeout automatically feeds Compounding Intelligence

Today, feeding a mission's output into Compounding Intelligence requires an
operator or agent to remember to run `/goldmine` (or, for the separate OP-00A
pipeline, requires `CG-AppBuilder-MCP`'s existing `emitIntelligenceHandoff`
hook to have been called — see `OWNERSHIP.md`'s `INTELLIGENCE_HANDOFF`
capability). Per Wesley: *"It should not require you to remember `/goldmine`
after every useful mission. Normal successful closeout should emit the
intelligence handoff automatically."*

Concretely: WaveRunner's closeout step, on a **material** mission (matching
the existing `intelligence-handoff-v1.schema.json`'s `mission.material`
boolean — i.e. don't harvest trivial/non-material closeouts), should
automatically:

1. Build an evidence manifest from the mission's actual packets/outcomes
   (same shape `scripts/harvest/lib/goldmine-protocol-v1.mjs`'s
   `loadEvidenceManifest()` already validates — `harvestId`, `workPackageId`,
   `packets[]`).
2. Call the governed `/goldmine` protocol
   (`runGoldMineProtocol()` in `scripts/harvest/lib/goldmine-protocol-v1.mjs`,
   or the CLI: `node scripts/harvest/goldmine.mjs --evidence=<path>`) — this
   merges into the local intelligence index **and** regenerates the compact
   retrieval slice, so the very next `intelligence.preflight()` call
   (Rule 1, for the next mission) can already see what this one produced.
3. Compose the unified mission receipt
   (`buildUnifiedMissionReceipt()` in
   `scripts/intelligence/lib/unified-mission-receipt-v1.mjs`, validated
   against `contracts/intelligence/unified-mission-receipt-v1.schema.json`),
   passing real evidence for the `waverunner` field (`'COMPLETE'`, once
   WaveRunner's own execution genuinely finished) — **never** default it to
   `'COMPLETE'` from this contract's side; that value must come from
   WaveRunner's own closeout state.

`/goldmine` remains the explicit, operator/conversational command for
harvesting a session or body of work **on demand** (a mission that wasn't run
through WaveRunner, or one an operator wants harvested outside the normal
closeout path). Rule 2 does not remove `/goldmine` — it removes the
requirement to remember it after every WaveRunner-run mission.

## Rule 3 — cache refresh is reported honestly, not assumed

The unified receipt's `cacheRefresh` field
(`contracts/intelligence/unified-mission-receipt-v1.schema.json`) must stay
`NOT_YET_INTEGRATED` unless whatever actually recompiles the physical hot
cache (today, `CG-AppBuilder-MCP`'s `npm run hot-cache:refresh-all`, per
`registry/datasets/HOT_CACHE_WAVE_A_V1.md`) genuinely ran and reports back.
This contract does not grant permission to set `cacheRefresh: 'PASS'` from
guesswork.

## Where the real wiring goes (for whoever has WaveRunner repo access)

- `CG-AppBuilder-MCP/scripts/sdlc-protocol-cursor/waverunner-capability-registry-v1.json`
  — the existing WaveRunner capability registry named in `OWNERSHIP.md`. Rule 1
  and Rule 2 should be registered as pre-Wave-0 and closeout capabilities
  there, pointing at the Cross-Agent CLIs above.
- Whatever module currently calls `emitIntelligenceHandoff` at AppBuilder
  closeout is the natural place to also trigger Rule 2's `/goldmine` call —
  the two shouldn't be reimplemented separately.

## What this contract deliberately does not do

- It does not implement anything in WaveRunner's own code — that repo isn't
  in this session's scope.
- It does not change `intelligence-handoff-v1.schema.json` or
  `operational-intelligence-envelope-v1.schema.json` (both `ARCHITECTURE_LOCKED`).
- It does not claim `waverunner` or `cacheRefresh` PASS anywhere in this
  repo's own code — see `scripts/intelligence/lib/unified-mission-receipt-v1.mjs`,
  which defaults both to `NOT_YET_INTEGRATED`.
