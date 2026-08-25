# Project: compounding-intelligence-v2-implementation-v1

## Summary

Implements the four pieces of `plans/2026-08-24_compounding-intelligence-v2-proposal.md` that are entirely Cross-Agent-owned and require no locked-schema edit and no other repo: the governed relationship-type registry with real enforcement (proposal 5), freshness/provenance fields threaded into the envelope's open `extensions` bag (proposal 3), `intelligence.preflight()`'s physical L:→Supabase→Git retrieval ladder and mission-context bundle (proposal 2), and the canonical `/goldmine` command implementation (proposal 9). Everything else in the V2 proposal (the charter wording, the `CONFLICTED` lifecycle state, cross-repo adoption of preflight/`/goldmine` in Cursor/AppBuilder/WaveRunner) stays out of scope — it needs an operator decision or repo access this session doesn't have.

**Follow-on (same day):** found that `/goldmine` and `intelligence.preflight()`, though both built and tested individually, weren't actually wired to each other — a goldmine run never regenerated the compact retrieval slice preflight reads, so within this repo's own boundary a fresh preflight call could not see what a prior goldmine run had just harvested. Closed that loop and proved it with an in-repo two-agent test (proposal 4's "harder real-mission proof," run against real code instead of a fabricated cross-session claim). Also applied the previously-disclosed-but-unapplied `harvest-risk-gates` CI fix.

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
- **Retrieval-loop closure:** `runGoldMineProtocol()` now calls the pre-existing (previously orphaned) `writeHarvestIntelligenceRetrievalArtifacts()` compiler right after the local index merge, regenerating `work-progress/intelligence-hub-slices/harvest-intelligence.json` — the exact file `buildMissionContextBundle()` reads for `knownFailures`/`successPatterns`/`relatedMissions`. Before this, that slice was a checked-in snapshot dated 2026-08-17 (confirmed via direct inspection) with no writer wired to it anywhere in the pipeline; a `/goldmine` run would merge into the raw entity index but be invisible to any subsequent `intelligence.preflight()` call. New receipt fields: `retrievalSliceRegenerated`, `retrievalSlicePath`, `retrievalSliceRowCount`.
- `buildMissionContextBundle()`, `testGitLedgerPlane()`, and `runIntelligencePreflight()` (`preflight-v1.mjs`) now accept an optional `repoRoot` (defaults to the real repo, so all existing callers are unaffected) — needed so the retrieval loop is testable against an isolated temp directory instead of the real repo's `work-progress/`.
- New test `testGoldMineOutputIsRetrievableByFreshPreflight` (in `run-goldmine-protocol.test.mjs`): harvests a distinctive concept via `/goldmine` in an isolated repoRoot, then calls `buildMissionContextBundle()` scoped only to that concept — simulating a brand-new agent that never saw the first mission run — and asserts the concept is retrieved via `relatedMissions`, plus a negative control that an unrelated concept is not. This is proposal 4's two-agent proof, run end-to-end against real code rather than described as a future test methodology.
- Applied the `harvest-risk-gates` CI fix that was previously only proposed in a PR comment: added `- run: npm ci` to `.github/workflows/harvest-risk-gates.yml` (the only one of this repo's 4 workflows on ephemeral `ubuntu-latest` — the other 3 run on the persistent self-hosted WESLEYDESK runner and were never affected). Verified `npm ci --dry-run` succeeds against the committed `package-lock.json`.

## Evidence / artifact paths

| Artifact | Path / link | Status |
| --- | --- | --- |
| Registry | `contracts/intelligence/registries/knowledge-relationship-types-v1.json` | Committed |
| Preflight | `scripts/intelligence/preflight.mjs`, `lib/preflight-v1.mjs` | Committed |
| Goldmine | `scripts/harvest/goldmine.mjs`, `lib/goldmine-protocol-v1.mjs` | Committed |
| Tests | `scripts/tests/run-intelligence-relationship-registry.test.mjs`, `run-intelligence-preflight.test.mjs`, `run-goldmine-protocol.test.mjs` | Committed, all passing |
| CI fix | `.github/workflows/harvest-risk-gates.yml` | Committed |
| This project file | `work-progress/projects/2026-08-25_compounding-intelligence-v2-implementation-v1.md` | Committed |

## Verification

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm run test:intelligence-contracts` | PASS 14/14 | Pre-existing suite, re-verified green after every change |
| `npm run test:intelligence-relationship-registry` | PASS 8/8 | New — includes a full-pipeline-coverage check that every edge type the real `buildRelationshipEdges()` emits validates against the registry |
| `npm run test:intelligence-preflight` | PASS 9/9 | New — exercises the real ladder end to end; in this container it genuinely falls through to `L_HUB_UNAVAILABLE_USING_GIT_LEDGER` (no `/mnt/l`, no sibling AppBuilder checkout for Supabase). +2 tests: `repoRoot` override honored, isolated-root data doesn't leak into/from the real repo |
| `npm run test:intelligence-goldmine` | PASS 8/8 | New — runs against an isolated temp `repoRoot`, never touches the real `work-progress/harvest-intelligence-index.json`. +1 test: the two-agent retrieval proof |
| `run-harvest-hub-slice-retrieval.test.mjs`, `run-harvest-ranked-view-no-loss.test.mjs` | PASS (re-verified) | Pre-existing tests of the compiler goldmine now calls — re-run to confirm no regression from the new call site |
| `npm ci --dry-run` | Succeeds, lockfile in sync | Verifies the `harvest-risk-gates` CI fix will actually work, not just silence the symptom |
| `run-harvest-git-retention.test.mjs` under a simulated identity-less runner (`HOME`/`GIT_CONFIG_GLOBAL` pointed at an empty dir) | Reproduced the failure, then fixed | After the `npm ci` fix actually landed on CI, `harvest-risk-gates` still failed — but with a **different** error: `run-harvest-git-retention.test.mjs`'s `withRepo()` does a real `git commit` in a throwaway temp repo, which needs a git identity the `ubuntu-latest` runner never configures. This test had never once reached that line in CI before, because the `ajv` crash always fired first — my own local dev container has a global git identity already set, which is why this didn't show up in local verification. Reproduced with an isolated `HOME`, confirmed the fix (a `git config --global user.email/user.name` step using the standard `github-actions[bot]` identity) makes all 12 tests pass under the same isolated conditions. |
| `npm run test:intelligence-ingest`, `test:intelligence-first-real-mission`, `test:intelligence-verification`, `test:intelligence-correlation-markers`, `test:intelligence-correlate`, `test:intelligence-semantic-w1` | Pre-existing FAIL, unchanged by this work | All require a sibling `CG-AppBuilder-MCP` checkout this container doesn't have — confirmed as the baseline before touching any code, not a regression. Untestable from here; should be re-run on a host with the full estate checked out before this is trusted as fully green. |
| CLI smoke tests (`preflight.mjs`, `goldmine.mjs --preview/--status`) | Manual, all produced expected output | Smoke-test artifacts (a fake harvest entity, a fake receipt) were reverted / deleted before commit — confirmed clean via `git status` |

## Blockers / warnings

| Blocker | Owner repo | Required action |
| --- | --- | --- |
| ~~`harvest-risk-gates` CI workflow was red on this PR~~ — **FIXED.** Confirmed pre-existing on `main` (reproduced identically on `origin/main` `0261f45` in an isolated worktree with none of this PR's changes present), reported on the PR, and now fixed: added `- run: npm ci` after `actions/setup-node@v4`. | CapitalGlass-Cross-Agent | Closed 2026-08-25 |
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
- **Building two ends of a pipeline separately, each with its own tests, does not prove they're connected.** Both `/goldmine` and `intelligence.preflight()` had full test coverage individually and both reported success — but nothing ever asserted that one's output was the other's input. The gap only surfaced by manually inspecting file timestamps (the slice preflight reads was 8 days stale) rather than by any test failing. Any future "does A's output reach B" claim in this pipeline should get its own end-to-end test, not just unit coverage of A and B separately — this is the same lesson the V2 proposal's freshness-acceptance-chain requirement was already pointing at, just rediscovered by hand here.
- Before assuming a broken pipeline step needs new code, check for an orphaned one: `writeHarvestIntelligenceRetrievalArtifacts()` already existed, was already tested, and did exactly what was needed — it just had no caller in the goldmine path. Grep for the target file path's other read/write sites before writing a new compiler.
- **A CI failure that's "fixed" can be masking a second failure underneath.** After adding `npm ci`, `harvest-risk-gates` stayed red — not because the fix was wrong, but because the workflow had a second, independent pre-existing bug (`run-harvest-git-retention.test.mjs` needs a git identity the runner never configures) that the first bug's crash had always prevented from ever executing. Don't treat "still red after the fix" as proof the fix didn't work — re-check the actual error before assuming so; it may be a genuinely different, previously-invisible failure one layer deeper. Also: this repo's own dev container has a global git identity already configured, which silently passes tests that would fail on a truly clean `ubuntu-latest` runner — a "passes locally" check on git-invoking tests isn't sufficient proof for CI; reproduce with an isolated `HOME`/`GIT_CONFIG_GLOBAL` when in doubt.

## Update log

### 2026-08-25 CT — Claude

- Implemented the four Cross-Agent-scoped pieces of the V2 proposal end to end, with real code, real tests, and two adjacent pre-existing bugs fixed along the way. All new work verified passing; pre-existing sibling-repo-dependent test failures confirmed unchanged (not caused by this work).

### 2026-08-25 CT — Claude (follow-on)

- Wired `/goldmine`'s local index merge to actually regenerate the compact retrieval slice `intelligence.preflight()` reads, closing a real gap between two independently-tested-but-disconnected systems. Added a real in-repo two-agent retrieval proof test. Applied the previously-proposed `harvest-risk-gates` `npm ci` fix after confirming it's the only one of this repo's 4 workflows on an ephemeral runner. All 38 of this work package's own tests pass (was 36); 2 pre-existing adjacent test files re-verified for no regression.
- CI confirmed the `npm ci` fix worked (the `ajv` crash is gone) but surfaced a second, previously-masked pre-existing bug one layer deeper: `run-harvest-git-retention.test.mjs` needs a git identity the `ubuntu-latest` runner never configured, and had simply never run far enough to hit that before. Reproduced under a simulated identity-less runner, fixed with a `git config --global user.email/user.name` step (`github-actions[bot]` identity), reproduced-then-verified fixed under the same isolated conditions before pushing.
