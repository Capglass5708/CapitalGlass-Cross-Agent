# Project: compounding-intelligence-unified-loop-v1

## Summary

Follow-on to `compounding-intelligence-v2-implementation-v1` (PR #43, merged). Wesley specified a unified, deterministic execution loop — hot AI cache → L: Hub → Supabase → Git fallback → mission context → WaveRunner → closeout → Gold Mine → publish → refresh cache/index — and identified a concrete first gap: `intelligence.preflight()`'s mission-context capability wasn't registered in this repo's own MCP/query-routing layer. This work package closes that gap and everything else in the loop that this repo's own boundary (no WaveRunner repo access, no live Supabase credentials, no physical hot-cache mount in this container) actually allows, built and tested rather than merely proposed. Full architecture: `plans/2026-08-25_compounding-intelligence-unified-loop-v1.md`.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | `compounding-intelligence-unified-loop-v1` |
| Work package | Follow-on to `compounding-intelligence-v2-implementation-v1` |
| Date opened | 2026-08-25 |
| Source | Claude (agent), at Wesley's request (unified-loop architecture message, selecting "Merge PR #43" then "Proceed") |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | CapitalGlass-Cross-Agent (`contracts/intelligence/OWNERSHIP.md` names Cross-Agent `INTELLIGENCE_OWNER`) |
| Execution repo | CapitalGlass-Cross-Agent only — WaveRunner and CG-AppBuilder-MCP not in this session's scope |
| Status | **COMPLETE — PR #45 MERGED** (`e5f2fea`); WaveRunner wiring and live-cache verification carried forward into `compounding-intelligence-v2-live-integration-proof` |

## Repositories involved

| Repo | Role |
| --- | --- |
| CapitalGlass-Cross-Agent | Sole repo touched |
| CG-AppBuilder-MCP | Referenced only — real consumer of the query-routing/dataset registries this work package extends; not checked out in this session |
| WaveRunner | Referenced only — the WaveRunner-preflight consumption contract specifies what it would need to adopt; not in this session's scope |

## Authority / ownership rule

Stays inside `contracts/intelligence/OWNERSHIP.md`'s existing boundary. Does not edit that file (`ARCHITECTURE_LOCKED`) or either locked schema (`intelligence-handoff-v1`, `operational-intelligence-envelope-v1`). The new WaveRunner contract is a separate, additive document, not a change to the locked ownership table.

## Valuable decisions

| Date/time | Decision | Reason |
| --- | --- | --- |
| 2026-08-25 | Registered a new, distinctly-named `mission-intelligence` queryClass/dataset rather than reusing the pre-existing `"preflight"` queryClass | The existing `"preflight"` route already means something else (routes to `all-systems-go`, an infra-readiness check) — reusing it would have been a silent naming collision |
| 2026-08-25 | SHA-based freshness verification implemented as consumer-side logic in `preflight-v1.mjs`/`hot-ai-cache-plane-v1.mjs`, not as a change to the shared `hot-cache-dataset-registry.v1.schema.json` freshness taxonomy | That schema's `freshnessClasses` is shared by ~20 unrelated datasets this repo doesn't own the freshness semantics of; scoping the stricter check to the one dataset this repo does own is lower blast radius and within actual authority |
| 2026-08-25 | Did not build a live Supabase publish path for `/goldmine` in this work package either | Wesley's explicit instruction: integrate as one governed loop, don't start with Supabase alone. Still blocked on live credentials this container doesn't have regardless. |
| 2026-08-25 | WaveRunner Rules 3–4 documented as a precise contract, not implemented | WaveRunner's repo isn't in this session's scope — implementing against a system this session can't verify would risk exactly the "false success" pattern this whole effort has been rigorous about avoiding |

## Delivered / reported complete

- **Rule 1 — registered, not just proposed:** `mission-intelligence` added to `registry/query-routing/query-routing-manifest.v1.json` and `registry/datasets/hot-cache-dataset-registry.v1.json` — the real, already-cross-repo-consumed (by `CG-AppBuilder-MCP`) routing/dataset authority. `registry/mission-intelligence/README.md` documents why this dataset has no single `manifestPath` (its real source is the pipeline-derived Git mirror, not a hand-authored `registry/` file).
- **Rule 2 — hot-ai-cache ladder rung + real SHA freshness:** `scripts/intelligence/lib/hot-ai-cache-plane-v1.mjs`, reusing the existing, already-proven `resolveZCacheRoot`/`resolveHostHotCacheRoot` (Z: canonical authority, then per-host read-through replicas — independently confirmed correct against decision `CAD-20260802-z-ai-cache-single-canonical-authority`). Added as the first-checked rung in `runIntelligencePreflight()`. New outcome codes: `CACHE_HIT_FRESH` / `CACHE_HIT_STALE` / `CACHE_MISS` / `CACHE_ROOT_UNAVAILABLE`.
- **Rule 6 — graph-aware mission context:** `scripts/intelligence/lib/mission-graph-queries-v1.mjs` — real traversal over the raw intelligence index's `relationships[]`/`supersededBy`/`lifecycleState` fields and the real `decisions/DECISION_LOG.md`. `buildMissionContextBundle()` gained `recentlyCorrectedOrSuperseded`, `relationshipGraph`, `unmodeledEvidence`, `governingDecisions`.
- **Rule 7 — unified receipt:** `contracts/intelligence/unified-mission-receipt-v1.schema.json` + `scripts/intelligence/lib/unified-mission-receipt-v1.mjs`. Every field this repo can populate for real does so from actual `runIntelligencePreflight()`/`runGoldMineProtocol()` output; `waverunner` and `cacheRefresh` default to `NOT_YET_INTEGRATED` and require explicit caller-supplied evidence to be anything else — enforced by the builder, not just documented.
- **Rules 3–4 — WaveRunner contract:** `contracts/intelligence/waverunner-preflight-consumption-contract-v1.md` — precise enough (exact CLIs, exact real AppBuilder registry file to wire into) to be a small, mechanical follow-up once that repo is in scope.
- **Architecture doc:** `plans/2026-08-25_compounding-intelligence-unified-loop-v1.md` — full loop, what's built vs. open, and why.
- Five new self-contained test files (34 new tests total, all passing): `run-hot-ai-cache-plane.test.mjs` (5), `run-mission-graph-queries.test.mjs` (7), `run-unified-mission-receipt.test.mjs` (5), plus 2 new tests added to `run-query-routing-authority.test.mjs` and 2 new + 1 updated in `run-intelligence-preflight.test.mjs`.
- Found and fixed one bug in my own new test (`run-unified-mission-receipt.test.mjs`'s `withTempRepoRoot`): the same async-race pattern already documented as a reusable lesson in the prior work package (`finally` block deleting the temp dir before an unwrapped async callback finished) — recurred because I wrote a fresh, naive version instead of reusing the fixed one. Caught immediately because the test failed loudly rather than silently passing.

## Evidence / artifact paths

| Artifact | Path / link | Status |
| --- | --- | --- |
| Routing/dataset registration | `registry/query-routing/query-routing-manifest.v1.json`, `registry/datasets/hot-cache-dataset-registry.v1.json`, `registry/mission-intelligence/README.md` | Committed |
| Hot AI cache plane | `scripts/intelligence/lib/hot-ai-cache-plane-v1.mjs` | Committed |
| Graph-aware queries | `scripts/intelligence/lib/mission-graph-queries-v1.mjs` | Committed |
| Unified receipt | `contracts/intelligence/unified-mission-receipt-v1.schema.json`, `scripts/intelligence/lib/unified-mission-receipt-v1.mjs` | Committed |
| WaveRunner contract | `contracts/intelligence/waverunner-preflight-consumption-contract-v1.md` | Committed |
| Architecture plan | `plans/2026-08-25_compounding-intelligence-unified-loop-v1.md` | Committed |
| Tests | `scripts/tests/run-hot-ai-cache-plane.test.mjs`, `run-mission-graph-queries.test.mjs`, `run-unified-mission-receipt.test.mjs`, plus updates to `run-query-routing-authority.test.mjs` and `run-intelligence-preflight.test.mjs` | Committed, all passing |
| This project file | `work-progress/projects/2026-08-25_compounding-intelligence-unified-loop-v1.md` | Committed |

## Verification

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm run test:intelligence-contracts` | PASS 14/14 | Pre-existing, re-verified green |
| `npm run test:intelligence-relationship-registry` | PASS 9/9 | Pre-existing, re-verified green |
| `npm run test:intelligence-preflight` | PASS 9/9 | +1 lane in the ladder test, +1 new repoRoot-isolation test for the graph queries integration |
| `npm run test:intelligence-hot-ai-cache` | PASS 7/7 | New (+2 after Bugbot fixes) — real SHA-freshness and scope-gating logic proven via env-injected fixtures (Z:-authority path); the physical per-host replica paths have no override and genuinely aren't present in this container, which is itself asserted, not worked around |
| `npm run test:intelligence-mission-graph` | PASS 7/7 | New — includes a test against the real `decisions/DECISION_LOG.md`, not a fixture |
| `npm run test:intelligence-goldmine` | PASS 8/8 | Pre-existing, re-verified green |
| `npm run test:intelligence-unified-receipt` | PASS 6/6 | New (+1 after Bugbot fixes) — full schema validation against real (not mocked) preflight + goldmine output |
| `npm run validate:query-routing`, `validate:hot-cache-dataset-registry` | Both PASS | Confirms the new registrations satisfy the real cross-repo-consumed schemas |
| `npm run test:query-routing`, `test:hot-cache-dataset-registry` | PASS 9/9, 5/5 | Includes a dedicated test proving the new `mission-intelligence` route doesn't collide with the pre-existing `"preflight"` queryClass |
| `run-harvest-hub-slice-retrieval.test.mjs`, `run-harvest-ranked-view-no-loss.test.mjs` | PASS (re-verified) | Adjacent pre-existing tests, confirmed no regression |
| Total | **60 self-contained tests + 14 registry validation/tests = 74 checks, all passing** | |

### Cursor Bugbot findings (PR #45, first review pass)

| Finding | Severity | Verified | Fix |
| --- | --- | --- | --- |
| Cache hit skips mission filtering | High | Real — a fresh hit returned `hotCache.bundle` unconditionally, ignoring caller `concepts`/`repos` filters | `testHotAiCachePlane()` now only reports `available: true` for a fresh hit when the query is unscoped; `cacheStatus` still honestly reports real freshness either way |
| Cache root skips RYZEN9DESK | High | Real — host enumeration used `DEFAULT_SYNC_HOSTS` (a publish-fanout default), omitting a host with a real defined cache path | Now walks all 3 known host IDs (`ALL_KNOWN_CACHE_HOST_IDS`, exported and tested directly) |
| Receipt falsifies plane reachability | Medium | Real — a short-circuited (never-probed) L:/Supabase lane was mapped to `UNAVAILABLE`, indistinguishable from probed-and-failed | Added `NOT_CHECKED` to the schema and builder, distinct from `UNAVAILABLE` |

All 3 fixed with a dedicated regression test each; all 3 threads resolved.

## Blockers / warnings

| Blocker | Owner repo | Required action |
| --- | --- | --- |
| Full acceptance test (a real WaveRunner mission → new agent session → automatic retrieval) not run | WaveRunner, CapitalGlass-Cross-Agent | Needs WaveRunner's repo in scope and Rules 3–4 actually wired into its code |
| Hot-ai-cache plane's live behavior against a real cache hit unverified | N/A (environment) | No `/mnt/z`, `/mnt/s`, `/mnt/d`, `/mnt/c` mount in this container — verify on WESLEYDESK/WESLEY_WORK/RYZEN9DESK |
| WaveRunner code changes (contract Rules 3–4) not implemented | CG-AppBuilder-MCP (registers WaveRunner capabilities) | See `contracts/intelligence/waverunner-preflight-consumption-contract-v1.md` for exact wiring |
| Live Supabase publish path for `/goldmine` still not built | CapitalGlass-Cross-Agent | Deliberately deferred again per Wesley's explicit instruction; still needs live credentials this container doesn't have |
| Charter wording (proposal 1), `CONFLICTED` lifecycle state (proposal 6) | CapitalGlass-Cross-Agent | Unchanged from the prior work package — needs operator decision + superseding-plan process |

## Commits / PRs

| Repo | Commit / PR | Status |
| --- | --- | --- |
| CapitalGlass-Cross-Agent | Commits `51a11e8`..`c8d11e9` on branch `claude/intelligence-hub-compounding-4f208p` (reset to latest `main` post-PR-#43-merge), PR #45 | **Merged** (`e5f2fea`) |

## Next actions

All four items below were carried forward into `plans/2026-08-25_compounding-intelligence-v2-live-integration-proof.md` as the next mission's four ordered phases, per Wesley's explicit direction to freeze this layer and move to a real cross-system proof rather than expand this work package further.

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | Verify the hot-ai-cache plane against a real cache hit on all three hosts (WESLEY_WORK, WESLEYDESK, RYZEN9DESK) | CapitalGlass-Cross-Agent | Open — see live-integration-proof plan, phase 1 |
| 2 | Add WaveRunner's repo to a session's scope and wire `contracts/intelligence/waverunner-preflight-consumption-contract-v1.md`'s Rules 3–4 into its capability registry | WaveRunner, CG-AppBuilder-MCP | Open — phase 3 |
| 3 | Run the full acceptance test once Rules 3–4 are wired | WaveRunner | Open — phase 4, blocked on #2 |
| 4 | Live Supabase publish path for `/goldmine`, through the existing governed projection path (no second implementation) | CapitalGlass-Cross-Agent | Open — phase 2 |
| 5 | Operator decision on charter wording + `CONFLICTED` lifecycle state | CapitalGlass-Cross-Agent | Open — parallel governance track, does not block the live-integration mission |

## Reusable lessons

- Before assuming "the AI cache" needs new integration code, check for existing infrastructure the exact same way this repo's own harvest pipeline already solved host/path resolution: `host-ai-cache-fanout-lib.mjs` and `z-cache-publication-adapter-lib.mjs` already had the correct, tested Z:-authority-then-host-replica resolution logic. Reused directly rather than reinvented.
- The same async-race bug pattern (a `finally` block deleting a temp dir before an un-awaited async callback finishes) recurred in a brand-new test file even though it was already documented as a lesson from the prior work package. Documenting a lesson doesn't prevent re-writing the same bug from scratch — the fix that actually generalizes is: always make `withTempRepoRoot`-style helpers `async`/`await` by default, never add a synchronous fast path "for tests that don't need it."
- A repo's own decision log (`decisions/DECISION_LOG.md`) is a legitimate, parseable, already-correct source of "what governs this subsystem" — cheaper and more reliable than trying to infer governance from code alone. It independently validated the hot-ai-cache plane's design before any code review could have.

## Update log

### 2026-08-25 CT — Claude

- Registered `mission-intelligence` in the query-routing + hot-cache dataset registries, closing the gap Wesley found. Built the hot-ai-cache ladder rung with real SHA-based freshness, graph-aware mission-context queries, the unified end-to-end receipt contract, and the WaveRunner-preflight consumption contract. 34 new tests, all passing; 71 total checks across the affected suites, all green. Opened PR #45.
- Cursor Bugbot's first review pass on PR #45 found 3 real issues (cache hits silently ignoring scoped queries, RYZEN9DESK never probed, short-circuited lanes falsely reported as `UNAVAILABLE`). All 3 verified and fixed with a dedicated regression test each; all 3 threads resolved. 60 self-contained tests + 14 registry checks, all green.
- Bugbot's re-review of the first fix found one more real issue: the scope gate correctly blocked the ladder from *using* a fresh-but-scoped-out cache hit, but the raw bundle was still attached to the lane-check record, reachable through preflight receipts / `--json` output — the exact side channel the scope gate was meant to close. Fixed and tested; Bugbot's next pass returned 0 new findings (3 → 1 → 0 across three rounds). All 4 threads resolved. PR #45 merged as `e5f2fea`.
- Per Wesley's explicit direction, froze further work on this layer and wrote `plans/2026-08-25_compounding-intelligence-v2-live-integration-proof.md`: the four-phase next mission (real hot-cache proof on all 3 hosts, Supabase publication+readback through the existing projection path, WaveRunner integration, full end-to-end compounding proof), plus a durable note on the deferred scope-aware-cache-keys design improvement. None of the four phases are executable from this container (need physical host access, live Supabase credentials, and WaveRunner repo access respectively) — documented precisely so starting any of them is mechanical once that access exists.
