# Project: compounding-intelligence-v2-implementation-v1

## Summary

Implements the four pieces of `plans/2026-08-24_compounding-intelligence-v2-proposal.md` that are entirely Cross-Agent-owned and require no locked-schema edit and no other repo: the governed relationship-type registry with real enforcement (proposal 5), freshness/provenance fields threaded into the envelope's open `extensions` bag (proposal 3), `intelligence.preflight()`'s physical L:→Supabase→Git retrieval ladder and mission-context bundle (proposal 2), and the canonical `/goldmine` command implementation (proposal 9). Everything else in the V2 proposal (the charter wording, the `CONFLICTED` lifecycle state, cross-repo adoption of preflight/`/goldmine` in Cursor/AppBuilder/WaveRunner) stays out of scope — it needs an operator decision or repo access this session doesn't have.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | `compounding-intelligence-v2-implementation-v1` |
| Work package | Follow-on to `capital-glass-compounding-operational-measurement-v1` |
| Date opened | 2026-08-25 |
| Source | Claude (agent), at Wesley's request ("start the in-scope pieces now") |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | CapitalGlass-Cross-Agent (`contracts/intelligence/OWNERSHIP.md` names Cross-Agent `INTELLIGENCE_OWNER`) |
| Execution repo | CapitalGlass-Cross-Agent only — no other repo in this session's scope |
| Status | Complete (in-scope pieces only) |

## Repositories involved

| Repo | Role |
| --- | --- |
| CapitalGlass-Cross-Agent | Sole repo touched — all four pieces live entirely under `scripts/intelligence/`, `scripts/harvest/`, and `contracts/intelligence/` |

## Authority / ownership rule

Stays inside the existing `contracts/intelligence/OWNERSHIP.md` boundary: this adds orchestration/derivation code Cross-Agent already owns (registry, preflight, goldmine, envelope provenance). Nothing here touches `operational-intelligence-envelope-v1.md`'s closed core (still `ARCHITECTURE_LOCKED`) — the new freshness fields live in the envelope's already-open `extensions` bag, non-breaking, no superseding plan required.

## Valuable decisions

| Date/time | Decision | Reason |
| --- | --- | --- |
| 2026-08-25 | Collapsed the proposal's `PREDICTS`/`STRONGLY_PREDICTS` into one `PREDICTS` type with an edge-level `confidence` field | Mirrors the `derivation.derivedFrom[].evidenceWeight` precedent already in the schema; encoding confidence in a type name left the actual PREDICTS/STRONGLY_PREDICTS threshold undefined |
| 2026-08-25 | `/goldmine`'s "Hub publication" step checks L:/Supabase reachability via the new preflight before claiming success; local intelligence-index merge always completes regardless | Matches the freshness proposal's own rule — never silently claim a publication succeeded when the planes it depends on are unreachable |
| 2026-08-25 | Did not implement `CONFLICTED` lifecycle state or promote provenance fields to closed core | Both touch the `ARCHITECTURE_LOCKED` schema and need the formal superseding-plan process, not a same-session code change |

## Delivered / reported complete

- `contracts/intelligence/registries/knowledge-relationship-types-v1.json` — 18-type governed registry (13 existing + `SUPPORTED_BY`, `REQUIRES_EVIDENCE`, `PREDICTS`, `SIMILAR_TO`, `PREVENTS`), with semantics, inverse/symmetry, ownership, and versioning rules per entry.
- `validateRelationshipEdges()` added to `schema-validate.mjs`, wired into `ingest-pipeline-v1.mjs` right after `buildRelationshipEdges()` — hard-fails ingest (`RELATIONSHIP_TYPE_NOT_REGISTERED`) on any unregistered or non-`ACTIVE` relationship type, and on a `PREDICTS` edge missing a numeric `confidence`. Verified there was previously zero validation on relationship edges at all.
- `envelope-builder-v1.mjs` now stamps `extensions.provenance = {sourceRepo, sourceSha, indexedSha, capturedAt}` on every derived object, threaded from the handoff's already-required `source.repo`/`source.commitSha`. `hub-compact-compiler-v1.mjs` carries `sourceRepo`/`sourceSha`/`indexedSha`/`publishedAt` through to the Hub-facing compact payload. New `repo-state-v1.mjs` resolves Cross-Agent's own current commit SHA (never throws — returns `null` outside a git checkout).
- `scripts/intelligence/preflight.mjs` (CLI) + `lib/preflight-v1.mjs`: physically tests `/mnt/l/Capital-Glass-Intelligence-Hub/00-master-index`, then the Supabase `intelligence_hub` projection, then the Git-tracked local mirror — returns exactly one of `L_HUB_READ_OK` / `L_HUB_UNAVAILABLE_USING_SUPABASE` / `L_HUB_UNAVAILABLE_USING_GIT_LEDGER` / `ALL_HUB_PLANES_UNAVAILABLE`, assembles a mission-context bundle (active blockers, repo ownership, known failures, success patterns, related missions, unresolved contradictions) from whichever plane succeeded, and writes a receipt.
- `scripts/harvest/goldmine.mjs` (CLI) + `lib/goldmine-protocol-v1.mjs`: one canonical protocol — capture (caller-supplied evidence manifest) → classify/dedupe via the existing `mergeManifestIntoIntelligenceIndex()` → publish (local index always; Hub publication gated on preflight reachability) → `GOLD_MINE_COMPLETE`/`GOLD_MINE_PARTIAL` receipt with graph-effect fields. `--preview` (no writes) and `--status=<harvestId>` (read last receipt) both implemented.
- Found and fixed two adjacent pre-existing bugs while implementing the above: `hub-compact-compiler-v1.mjs` was reading `object.authority.evidenceReality`/`object.authority.measurementQuality` (wrong path — always `undefined`; correct paths are `object.evidenceReality`/`object.measurement.measurementQuality`), and `supabase-intelligence-store-v1.mjs`'s `loadLiveSupabaseClient()` crashed the whole process with an unhandled `ERR_MODULE_NOT_FOUND` whenever the sibling `CG-AppBuilder-MCP` repo wasn't checked out, instead of degrading gracefully like the rest of that function already does.
- Four new self-contained test files (36 tests total, all passing): `run-intelligence-relationship-registry.test.mjs`, `run-intelligence-preflight.test.mjs`, `run-goldmine-protocol.test.mjs`, plus the pre-existing `run-intelligence-contracts.test.mjs` re-verified green.

## Evidence / artifact paths

| Artifact | Path / link | Status |
| --- | --- | --- |
| Registry | `contracts/intelligence/registries/knowledge-relationship-types-v1.json` | Committed |
| Preflight | `scripts/intelligence/preflight.mjs`, `lib/preflight-v1.mjs` | Committed |
| Goldmine | `scripts/harvest/goldmine.mjs`, `lib/goldmine-protocol-v1.mjs` | Committed |
| Tests | `scripts/tests/run-intelligence-relationship-registry.test.mjs`, `run-intelligence-preflight.test.mjs`, `run-goldmine-protocol.test.mjs` | Committed, all passing |
| This project file | `work-progress/projects/2026-08-25_compounding-intelligence-v2-implementation-v1.md` | Committed |

## Verification

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm run test:intelligence-contracts` | PASS 14/14 | Pre-existing suite, re-verified green after every change |
| `npm run test:intelligence-relationship-registry` | PASS 8/8 | New — includes a full-pipeline-coverage check that every edge type the real `buildRelationshipEdges()` emits validates against the registry |
| `npm run test:intelligence-preflight` | PASS 7/7 | New — exercises the real ladder end to end; in this container it genuinely falls through to `L_HUB_UNAVAILABLE_USING_GIT_LEDGER` (no `/mnt/l`, no sibling AppBuilder checkout for Supabase) |
| `npm run test:intelligence-goldmine` | PASS 7/7 | New — runs against an isolated temp `repoRoot`, never touches the real `work-progress/harvest-intelligence-index.json` |
| `npm run test:intelligence-ingest`, `test:intelligence-first-real-mission`, `test:intelligence-verification`, `test:intelligence-correlation-markers`, `test:intelligence-correlate`, `test:intelligence-semantic-w1` | Pre-existing FAIL, unchanged by this work | All require a sibling `CG-AppBuilder-MCP` checkout this container doesn't have — confirmed as the baseline before touching any code, not a regression. Untestable from here; should be re-run on a host with the full estate checked out before this is trusted as fully green. |
| CLI smoke tests (`preflight.mjs`, `goldmine.mjs --preview/--status`) | Manual, all produced expected output | Smoke-test artifacts (a fake harvest entity, a fake receipt) were reverted / deleted before commit — confirmed clean via `git status` |

## Blockers / warnings

| Blocker | Owner repo | Required action |
| --- | --- | --- |
| `harvest-risk-gates` CI workflow is red on this PR, but confirmed **pre-existing on `main`** — `.github/workflows/harvest-risk-gates.yml` has no `npm ci` step, so `test:harvest:git-retention`'s `ajv` dependency (via `scripts/harvest/lib/schema-validate.mjs`) can't resolve in a clean checkout. Reproduced identically on `origin/main` (`0261f45`) in an isolated worktree with none of this PR's changes present. This PR only surfaced it by being the first recent change under `scripts/harvest/**` (the workflow's path trigger). | CapitalGlass-Cross-Agent | Add `- run: npm ci` after the `actions/setup-node@v4` step. Not fixed here to avoid widening this PR's scope — documented on the PR (comment) and here for whoever picks it up. |
| Six pre-existing intelligence tests can't run in this container (sibling repo dependency) | CapitalGlass-Cross-Agent / CG-AppBuilder-MCP | Re-run `npm run test:intelligence` on a host with `CG-AppBuilder-MCP` checked out alongside this repo before treating the full suite as verified |
| `/mnt/l` and Supabase credentials aren't reachable from this container | N/A (environment) | The `L_HUB_READ_OK` and `L_HUB_UNAVAILABLE_USING_SUPABASE` lanes of `intelligence.preflight()` are implemented and unit-testable but not exercised end to end from here — verify on the real WSL host |
| Cross-repo adoption (Cursor `.mdc` rule calling `intelligence.preflight()`, AppBuilder emit-hook changes, WaveRunner `/goldmine` wiring) not done | CG-AppBuilder-MCP, Cursor config, WaveRunner | Needs those repos added to a session's scope, or separate sessions per repo |
| Charter wording (proposal 1), `CONFLICTED` lifecycle state (proposal 6) not implemented | CapitalGlass-Cross-Agent | Needs operator decision + (for the lifecycle state) the formal superseding-plan process against the locked schema |

## Commits / PRs

| Repo | Commit / PR | Status |
| --- | --- | --- |
| CapitalGlass-Cross-Agent | This commit, branch `claude/intelligence-hub-compounding-4f208p`, PR #43 | Pushed |

## Next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | Re-run `npm run test:intelligence` on a host with the full Capital Glass estate checked out to confirm no regressions in the sibling-repo-dependent tests | CapitalGlass-Cross-Agent | Open |
| 2 | Verify the L:/Supabase lanes of `intelligence.preflight()` on the real WSL host where they're reachable | CapitalGlass-Cross-Agent | Open |
| 3 | Operator decision on proposal 1 (charter) and proposal 6 (`CONFLICTED` state) | CapitalGlass-Cross-Agent | Open |
| 4 | Cross-repo adoption of preflight/`/goldmine` in Cursor, AppBuilder, WaveRunner | CG-AppBuilder-MCP + others | Open, needs repo access |

## Reusable lessons

- `resolveAppBuilderRoot()` (`scripts/index/lib/resolve-repo-roots.mjs`) always returns a path string, even when no sibling repo exists — it's a resolver, not an existence check. Any caller doing a dynamic `import()` from its result must verify existence first (`paths.mjs`'s own `resolveProducerRepoRoot` already does this correctly; `supabase-intelligence-store-v1.mjs` didn't, and crashed the whole process outside a full-estate checkout).
- The graph-dividend gate reads *pre-reconciliation* classified objects, so a pure-reinforcement mission already passes it today — confirmed in practice by the goldmine test's "repeat run reinforces instead of duplicating" case (`newKnowledgeNodes: 0, existingNodesReinforced: 1, graphDividend: PASS`).
- Only `run-intelligence-contracts.test.mjs` was self-contained before this work; four intelligence test files now run standalone without a sibling repo. Follow this pattern (temp `repoRoot`, no live network/credentials) for any future intelligence test.

## Update log

### 2026-08-25 CT — Claude

- Implemented the four Cross-Agent-scoped pieces of the V2 proposal end to end, with real code, real tests, and two adjacent pre-existing bugs fixed along the way. All new work verified passing; pre-existing sibling-repo-dependent test failures confirmed unchanged (not caused by this work).
