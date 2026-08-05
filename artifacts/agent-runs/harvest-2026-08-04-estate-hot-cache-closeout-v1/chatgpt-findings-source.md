# ChatGPT Findings Source — Estate Hot-Cache and Scout-Hook Closeout

## 1. Final summary

```text
Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Start verdict: UNHARVESTED_THREAD
Target tier: T2
Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION
```

This thread documents a multi-repository closeout sequence that began with branch normalization and local-drift cleanup, progressed through preservation of uncommitted work, published missing query-routing and dataset-registry authority, and ended with clean-checkout verification of App Builder hot-cache consumption. The conversation repeatedly converted broad estate-cleanup requests into narrowly scoped missions with explicit merge order and acceptance gates.

The durable observed value is not merely that specific PRs merged. The thread shows a reusable operational pattern:

1. Preserve local work before restoring repository parity.
2. Keep branch-specific or generated material off `main`.
3. Convert machine-local dependencies into tracked authority through narrowly scoped PRs.
4. Require clean-checkout tests before declaring deterministic consumption.
5. Separate infrastructure synchronization work from functional authority publication.

The final closed work package reported Cross-Agent and App Builder aligned with `origin/main`, all hot-cache consumption verdicts passing, and a final scout result of `INDEX_HIT_AI_CACHE`, `CURRENT`, `PUBLICATION_PASS`, and `rawScanRequired: false`. Those are user-reported operational results and require Cursor verification before publication.

The only explicitly remaining lane was `estate-scout-hook-sync-v1`, covering twelve repositories missing canonical scout hooks. The final assistant instruction added a preflight requirement to classify seven local App Builder modifications before any restore operation.

## 2. Harvest verdict and tier rationale

**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

**Tier:** T2

**Rationale:** The thread contains multiple corrections, several repository-specific operational reports, staged dependency discovery, branch and stash decisions, two merged authority PRs, one merged App Builder PR, and an unresolved estate-wide follow-up. It is more than a simple status update, but it remains one coherent operational closeout family rather than a broad system-advancement synthesis.

This findings file records observed behavior only. It does not claim repository truth, validation completion, publication completion, or operational authority.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

The visible thread includes pasted retrieval and scout statuses, but ChatGPT did not execute the referenced repository commands in this session. Therefore every retrieval, SHA, test, branch, PR, and publication statement from the thread is classified as `USER_REPORTED_OPERATIONAL` or `CROSS_CHECK_CANDIDATE`.

## 4. Scope ledger

### Primary mission

Harvest the observed closeout of a seven-repository estate normalization and App Builder hot-cache authority publication sequence.

### Closed lanes

- Seven repositories brought to commit parity with `origin/main`.
- App Builder local work preserved, then reconciled on a dedicated feature branch.
- Cross-Agent local harvest/runtime work preserved on a remote archive branch.
- Four stale scout-rule working-tree copies normalized to canonical content already on remote main.
- Cross-Agent query-routing authority published through PR #8.
- Cross-Agent dataset registry authority published through PR #9.
- App Builder hot-cache expansion published through PR #281.
- Clean-checkout hot-cache consumption gates reported passing.

### Open lane

- `estate-scout-hook-sync-v1`: canonical hook installation in twelve repositories previously reporting `would-sync`.

### Unrelated or deferred follow-ups

- Governance `.cursor/mcp.json` ignore-policy chore.
- CapitalGlass-Documents `isolated-verifier-report.json` closeout decision.
- Cross-Agent dedicated CI workflow for query-routing and dataset-registry validation.
- Classification and preservation of seven App Builder tracked modifications reported after PR #281 merged.

### Do-not-merge boundaries

- Do not mix scout-hook rollout with query-routing or dataset-registry authority PRs.
- Do not commit machine-local `.cursor/mcp.json`.
- Do not commit generated hot-cache outputs, runtime receipts, diagnostics, or host-specific paths as durable authority.
- Do not pop branch-specific stashes onto `main`.
- Do not wholesale-commit candidate registry trees without classifying minimum canonical authority.

## 5. Correction ledger

### COR-001 — Initial clean-estate assumption was premature

- **priorAssumption:** After branch pulls, the estate could be treated as clean except for a small stash and one receipt.
- **correction:** Final parity inspection showed App Builder behind remote with local edits, Cross-Agent carrying extensive WIP, four consumer rule edits, Governance machine-local noise, and Documents verifier WIP.
- **correctedModel:** Commit parity and working-tree cleanliness are separate dimensions and must be reported independently.
- **affectedFindings:** EVT-002, EVT-003, HP-001, ROI-001.
- **futurePrevention:** Always produce per-repository SHA parity and tree-status columns before declaring estate cleanup complete.

### COR-002 — App Builder local work should not be restored onto main

- **priorAssumption:** A stash-and-pull closeout might imply immediately popping the stash.
- **correction:** The assistant explicitly directed that the named stash be preserved and restored only on a dedicated branch or worktree.
- **correctedModel:** Preservation and reconciliation must occur off `main`, after main is fast-forwarded and verified clean.
- **affectedFindings:** EVT-004, HP-002, ED-002.

### COR-003 — Scout-rule drift was not remote drift

- **priorAssumption:** Four consumer repositories required governed commits for stale scout-rule copies.
- **correction:** Canonical sync normalized local files back to copies already present on `origin/main`; no PR was required.
- **correctedModel:** `would-sync` or local edit status does not by itself prove unpublished canonical drift.
- **affectedFindings:** EVT-006, DUP-002, ROI-002.
- **futurePrevention:** Run canonical check and compare against remote before opening synchronization PRs.

### COR-004 — Query-routing publication alone did not unblock full App Builder consumption

- **priorAssumption:** Publishing `registry/query-routing/` would fully remove App Builder's machine-local dependency.
- **correction:** Query-router tests passed from a clean clone, but `test:hot-cache-consumption-gates` still failed because dataset registry and authority manifests were absent.
- **correctedModel:** Routing authority and dataset authority are separate contracts; both must be tracked and clean-clone accessible.
- **affectedFindings:** EVT-009, EVT-010, HP-004, ED-004.

### COR-005 — Exact historical PR file count changed after merge

- **priorAssumption:** Cross-Agent PR #9 would merge as exactly nine files.
- **correction:** User later reported the squash landed seventeen files plus subsequent Wave A commits on main.
- **correctedModel:** Acceptance should focus on authority scope and absence of forbidden artifacts, while historical file-count assertions must be verified against the merged diff.
- **affectedFindings:** EVT-012, HP-006.

### COR-006 — App Builder main was SHA-aligned but not fully clean after merge

- **priorAssumption:** Post-merge App Builder would be both aligned and clean.
- **correction:** User reported seven modified tracked files on top of aligned main.
- **correctedModel:** Do not recommend `git restore .` until those files are classified and valid WIP is preserved.
- **affectedFindings:** EVT-013, OF-004, ROI-003.

## 6. Thread event inventory

### EVT-001 — Seven repositories moved to main and pulled

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **observation:** The user reported Governance MCP and Cross-Agent updated to main, with one Cross-Agent stash and one Governance receipt modification remaining.
- **significance:** Established the initial normalization target but not a clean estate.

### EVT-002 — First full parity check exposed hidden drift

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **observation:** App Builder was behind two commits and blocked by local `package.json` changes; six other repositories were SHA-aligned but several had modified or untracked files.
- **significance:** Forced separation of commit parity, working-tree cleanliness, intentional WIP, and machine-local drift.

### EVT-003 — Obsolete stash and receipt were removed safely

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **observation:** Cross-Agent `stash@{0}` was inspected and dropped after its two files were classified obsolete; Governance `equivalence-receipt.json` was reverted as a host-local rerun rather than newer constitutional authority.
- **significance:** Demonstrated evidence-based cleanup instead of blind restoration or deletion.

### EVT-004 — App Builder was fast-forwarded with WIP preserved

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **observation:** App Builder local work was stashed with untracked files, main was fast-forwarded from `dc22ab00` to `3ed4746a`, and the named stash remained unpopped.
- **significance:** Recovered estate commit parity without contaminating main.

### EVT-005 — Cross-Agent WIP was archived off main

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **observation:** Forty-two dirty paths were preserved on `archive/local-harvest-wip-2026-08-04` at commit `6737c8c`, pushed to origin, and Cross-Agent main was returned clean.
- **significance:** Converted fragile local WIP into durable remote preservation while maintaining main cleanliness.

### EVT-006 — Four scout-rule edits normalized without PRs

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **observation:** `sync:three-way-agent-rule` and its check reported all four consumers synchronized to v1.2.0 and identical to remote main.
- **significance:** Avoided unnecessary commits and exposed stale local sync rather than unpublished remote drift.

### EVT-007 — App Builder hot-cache stash reconciled on a feature branch

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **observation:** The stash was applied on `feat/app-builder-hot-cache-expansion-reconciliation-v1`, classified, committed as twenty-four files, pushed, and opened as PR #281. Generated/runtime evidence was excluded.
- **significance:** Preserved valid implementation while maintaining deterministic scope.

### EVT-008 — Query-router manifest compatibility was expanded

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **observation:** `query-router.mjs` was reported updated to accept both `keywords/primaryDataset` and `matchPatterns/primaryDatasetId/datasetIds` manifest forms.
- **significance:** Prevented schema-form incompatibility between candidate registry variants.

### EVT-009 — Cross-Agent query-routing authority published through PR #8

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **observation:** A canonical manifest, dual-form schema, alternate fixture, README, validation scripts, and seven routing tests were published on a focused branch and PR.
- **significance:** Removed archive-branch dependence for routing reads.

### EVT-010 — Clean query-routing checkout still failed full consumption gates

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **observation:** App Builder query-routing tests passed against a clean Cross-Agent root, but full consumption gates failed because `registry/datasets/` and `authority-estate/` remained unpublished.
- **significance:** Exposed the second authority layer and prevented premature App Builder merge.

### EVT-011 — Dataset registry authority published through PR #9

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **observation:** The user reported a scoped dataset registry, schema, README, git-estate folder identity manifest, authority-estate compile-gate manifest, and focused validation/tests. Candidate registries unrelated to the blocker were left uncommitted.
- **significance:** Replaced remaining machine-local registry dependence with tracked authority.

### EVT-012 — Clean-checkout App Builder consumption passed after authority publication

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **observation:** Five consumption verdicts passed in a detached clean setup: router integration, authority estate foundation, bulk-pull dry run, L-by-kind publication, and scout L fallback.
- **significance:** Supplied the key deterministic-consumption proof for the merge chain.

### EVT-013 — Cross-Agent #9 and App Builder #281 merged

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **observation:** Cross-Agent #9 and App Builder #281 were reported merged; Cross-Agent was aligned and clean, App Builder aligned with seven local tracked modifications.
- **significance:** Closed the hot-cache authority publication chain but left local WIP classification necessary.

### EVT-014 — Final scout reported hot AI cache success

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **observation:** The reported final scout returned `INDEX_HIT_AI_CACHE`, `hot-ai-cache`, `CURRENT`, `PUBLICATION_PASS`, `rawScanRequired: false`, and router integration pass.
- **significance:** User-reported acceptance signal for the completed hot-cache chain; must be independently verified before publication.

### EVT-015 — Twelve-repository scout-hook rollout remained deferred

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **observation:** A check reported twenty-one of thirty-three repositories synced and twelve missing `.cursor/hooks.json` plus scout shim installation.
- **significance:** Defined the sole remaining estate-wide work package after the hot-cache closeout.

## 7. Harvest packets

### HP-001 — `failure-pattern`: parity conflated with cleanliness

- **evidenceClass:** `CHAT_DIRECT`
- **pattern:** Early progress reports emphasized branch and SHA parity while substantial local drift remained.
- **impact:** Risk of declaring an estate clean while local modifications, untracked files, or branch-specific work remain.
- **prevention:** Require separate metrics for SHA alignment, clean trees, intentional WIP, and machine-local drift.

### HP-002 — `lesson`: preserve before normalize

- **evidenceClass:** `CHAT_DIRECT`
- **lesson:** Named stashes, archive branches, and dedicated worktrees are safer than restoring branch-specific work directly onto main.
- **proofInThread:** App Builder stash preservation and Cross-Agent archive branch both enabled clean main alignment without data loss.

### HP-003 — `protocol-upgrade`: remote comparison before sync PR

- **evidenceClass:** `CHAT_DIRECT`
- **upgrade:** Before opening rule or hook synchronization PRs, run canonical sync/check and compare resulting files with `origin/main`.
- **benefit:** Prevents PR churn for local-only stale copies.

### HP-004 — `architecture`: routing authority and dataset authority are distinct

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **finding:** A clean query-routing manifest was insufficient because routed dataset IDs still lacked tracked registry records and authority manifests.
- **implication:** Clean-clone determinism requires an end-to-end authority chain: route -> dataset record -> compile source/manifest -> consumption gate.

### HP-005 — `scope-control`: publish minimum durable authority

- **evidenceClass:** `CHAT_DIRECT`
- **finding:** The assistant repeatedly directed extraction of only required registry contracts while excluding generated caches, receipts, diagnostics, archive references, and host paths.
- **benefit:** Reduced accidental publication of runtime state as canonical authority.

### HP-006 — `verification`: clean-checkout tests are the merge gate

- **evidenceClass:** `CHAT_DIRECT`
- **finding:** Local passing tests were treated as insufficient until the App Builder gates passed with `CROSS_AGENT_ROOT` pointing to clean tracked Cross-Agent authority.
- **benefit:** Detects hidden dependencies on local untracked or archive content.

### HP-007 — `operator-safety`: destructive cleanup requires classification

- **evidenceClass:** `CHAT_DIRECT`
- **finding:** The final instruction rejected blind `git restore .` and required classification of seven modified App Builder files.
- **benefit:** Prevents valid post-merge WIP from being discarded in pursuit of a clean tree.

### HP-008 — `repeated-work`: status reports repeatedly reopened next-mission planning

- **evidenceClass:** `CHAT_DIRECT`
- **finding:** Each completed mission produced a new assistant-authored mission directive, often with detailed scope and acceptance criteria.
- **classification:** `INTENTIONALLY_DEFERRED`
- **note:** This was productive while blockers remained, but future automation could convert repeated mission scaffolding into a standardized closeout-to-next-lane generator.

## 8. Execution deltas

### ED-001 — Actual: broad cleanup; optimal: structured estate matrix first

- **actual:** Cleanup began repository by repository, and the full drift picture emerged later.
- **optimal:** Start with a seven-repository matrix showing branch, HEAD, origin parity, modified count, untracked count, stash count, and WIP owner.
- **delta:** Extra conversational turns were needed to discover the real closeout state.

### ED-002 — Actual: stash handling became explicit after prompting; optimal: default off-main restoration policy

- **actual:** The assistant had to state repeatedly that stashes should not be popped onto main.
- **optimal:** Make `restore only on a dedicated branch/worktree` a standard invariant in the closeout protocol.

### ED-003 — Actual: scout-rule edits were initially framed as needing commits; optimal: check remote identity before commit planning

- **actual:** A mission proposed governed commits for four rule files.
- **optimal:** Run sync/check and remote comparison before deciding whether a PR exists.
- **delta:** No harmful change occurred, but planning overhead was unnecessary.

### ED-004 — Actual: query-routing PR preceded discovery of dataset-registry blocker; optimal: dependency graph before first authority PR

- **actual:** Query-routing publication solved only part of the clean-clone dependency chain.
- **optimal:** Trace every file read by `test:hot-cache-consumption-gates` and enumerate all missing tracked authorities before splitting PRs.
- **delta:** Required a second Cross-Agent authority mission and PR.

### ED-005 — Actual: historical file-count acceptance became stale; optimal: distinguish proposal scope from merged-main state

- **actual:** The planned nine-file assertion did not match later merged history.
- **optimal:** Record both `proposed PR diff` and `current main contents`, with verification timestamps.

## 9. Waste ledger

### TW-001 — Repeated reclassification of estate cleanliness

- **evidenceClass:** `CHAT_DIRECT`
- **waste:** Multiple turns refined the same estate scorecard because `aligned`, `clean`, `preserved WIP`, and `intentional drift` were initially blended.
- **reduction:** Adopt a fixed four-axis scorecard from the first closeout report.

### TW-002 — Repeated hand-authored mission templates

- **evidenceClass:** `CHAT_DIRECT`
- **waste:** The assistant generated several long mission instructions with overlapping guards: do not pop on main, exclude runtime artifacts, use clean checkouts, keep scout hooks separate.
- **reduction:** Store reusable mission templates keyed by operation type: stash reconciliation, authority publication, clean-clone closeout, estate sync.

### TW-003 — Partial dependency discovery

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **waste:** Query-routing was published before full dataset-registry requirements were mapped.
- **reduction:** Add a dependency closure test that enumerates every routed dataset ID and resolves it to tracked records before the first PR.

## 10. Duplication detector

### DUP-001 — Main-cleanliness guidance repeated

- **classification:** `REPEATED_DISCUSSION`
- **evidenceClass:** `CHAT_DIRECT`
- **observation:** The thread repeatedly restated that branch-specific work must not be restored onto main.
- **action:** Encode as a protocol invariant.

### DUP-002 — Scout-rule drift appeared actionable but was already on remote

- **classification:** `FALSE_DUPLICATE_DIFFERENT_HOST_OR_CONTEXT`
- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **observation:** Local newer-looking paragraphs created apparent drift, but canonical sync returned files to content already on remote main.
- **action:** Compare canonical hash and remote blob before generating work.

### DUP-003 — Registry candidate tree contained unrelated authority families

- **classification:** `POSSIBLE_EXISTING_IMPLEMENTATION`
- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **observation:** Local registry candidates included active-ledger, command-estate, identity, domain, receipt, and work-progress content not required by the blocker.
- **action:** `NEEDS_REGISTRY_LOOKUP_FIRST`; do not assume candidate WIP is unpublished canonical authority.

### DUP-004 — Scout-hook rollout remained intentionally separate

- **classification:** `INTENTIONALLY_DEFERRED`
- **evidenceClass:** `CHAT_DIRECT`
- **observation:** Hook synchronization was repeatedly deferred to prevent scope mixing with functional hot-cache authority PRs.
- **action:** Preserve as a standalone mission after hot-cache merge verification.

## 11. Operator friction

### OF-001 — Local Windows/WSL artifacts obscured authority

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **examples:** `nul`, WSL path variants, machine-local `.cursor/mcp.json`, and host-local receipt regeneration.
- **effect:** Required manual classification to distinguish noise from constitutional evidence.

### OF-002 — Untracked local registry content created hidden test dependencies

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **effect:** Local tests could pass while clean-clone tests failed.
- **mitigation:** Force clean-root environment variables and detached worktree tests.

### OF-003 — Repository-wide synchronization spans many governed repos

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **effect:** Twelve hook installations require separate branch/PR handling and repository-specific CI rather than one local sync command alone.

### OF-004 — Aligned main can still carry unclassified tracked edits

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **effect:** A simplistic cleanup command could destroy valid WIP even after merge success.
- **mitigation:** Classify, preserve, then clean.

## 12. ROI backlog

### ROI-001 — Standard estate closeout matrix

- **rank:** 1
- **value:** High
- **proposal:** Add a canonical command/report that emits per-repo HEAD, origin parity, modified paths, untracked paths, stashes, WIP classification, and clean-tree state.
- **expectedReturn:** Fewer repeated status turns and safer cleanup decisions.

### ROI-002 — Authority dependency closure validator

- **rank:** 2
- **value:** High
- **proposal:** Validate that every query route resolves to a tracked dataset record and every required compile manifest exists before authority PR publication.
- **expectedReturn:** Prevents split discovery of query-routing and dataset-registry blockers.

### ROI-003 — Safe WIP preservation preflight

- **rank:** 3
- **value:** High
- **proposal:** Provide a reusable preflight that classifies tracked/untracked changes, creates a named preservation branch or stash, verifies remote durability, and only then allows restore/clean operations.
- **expectedReturn:** Reduces accidental data loss and keeps main clean.

### ROI-004 — Sync dry-run with remote equivalence classification

- **rank:** 4
- **value:** Medium
- **proposal:** Make rule/hook sync report `already-on-origin`, `local-only-stale`, `missing-installation`, or `canonical-update-needed`.
- **expectedReturn:** Avoids unnecessary PR planning.

### ROI-005 — Cross-Agent authority CI workflow

- **rank:** 5
- **value:** Medium
- **proposal:** Add dedicated validation for query-routing and dataset-registry contracts on PRs.
- **expectedReturn:** Converts local acceptance proof into repeatable repository enforcement.

## 13. Do-not-advance guards

- Do not claim any pasted SHA, PR state, test result, retrieval result, or scout verdict is verified until Cursor checks repository state.
- Do not claim `HARVEST_COMPLETE`, `OPERATIONAL`, or `FULLY_SEEDED`.
- Do not publish this findings draft directly to main.
- Do not ingest candidate registry families unrelated to the observed hot-cache blocker without duplication preflight.
- Do not run destructive cleanup against the seven App Builder modifications until they are classified and preserved or proven obsolete.
- Do not mix the twelve-repository scout-hook rollout into closed hot-cache authority work.
- Do not commit machine-local `.cursor/mcp.json`.

## 14. Seed packet candidates

### Seed candidate for ROI-001

```json
{
  "seedId": "IH-THREAD-ESTATE-CLOSEOUT-MATRIX-V1",
  "kind": "protocol-upgrade",
  "title": "Separate repository parity, cleanliness, WIP, and machine-local drift",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How should an estate closeout report distinguish SHA alignment from working-tree cleanliness?",
    "What minimum per-repository fields prevent premature clean-estate claims?"
  ],
  "evidenceRefs": [
    {
      "ref": "EVT-002",
      "classification": "USER_REPORTED_OPERATIONAL"
    },
    {
      "ref": "COR-001",
      "classification": "CHAT_DIRECT"
    }
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A multi-repository cleanup or parity mission is being closed",
    "startAt": "Generate a fixed estate matrix before recommending cleanup actions",
    "runPreflight": "Collect HEAD, origin relation, modified count, untracked count, stash count, and preservation status",
    "doNot": "Equate 7/7 SHA alignment with 7/7 clean trees",
    "proveBeforeClaiming": "Show per-repository evidence for both parity and cleanliness"
  }
}
```

### Seed candidate for ROI-002

```json
{
  "seedId": "IH-THREAD-AUTHORITY-DEPENDENCY-CLOSURE-V1",
  "kind": "failure-pattern",
  "title": "Routing authority can pass while dataset authority remains unresolved",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why can query-routing tests pass while hot-cache consumption gates fail?",
    "How do we prove every routed dataset has tracked compile and authority records?"
  ],
  "evidenceRefs": [
    {
      "ref": "EVT-010",
      "classification": "USER_REPORTED_OPERATIONAL"
    },
    {
      "ref": "COR-004",
      "classification": "CHAT_DIRECT"
    }
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A router or manifest publication is proposed as a clean-clone unblocker",
    "startAt": "Trace every route to dataset record, source manifest, output contract, and consuming test",
    "runPreflight": "Resolve all dataset IDs using only tracked files in a clean checkout",
    "doNot": "Treat a passing router unit test as proof of full consumption determinism",
    "proveBeforeClaiming": "Run the complete consumption gates with no archive or untracked registry dependency"
  }
}
```

### Seed candidate for ROI-003

```json
{
  "seedId": "IH-THREAD-SAFE-WIP-PRESERVATION-V1",
  "kind": "lesson",
  "title": "Preserve local work off main before normalization or cleanup",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "What is the safe sequence for pulling main when tracked and untracked WIP exists?",
    "When should a stash, archive branch, or worktree be used for local repository drift?"
  ],
  "evidenceRefs": [
    {
      "ref": "EVT-004",
      "classification": "USER_REPORTED_OPERATIONAL"
    },
    {
      "ref": "EVT-005",
      "classification": "USER_REPORTED_OPERATIONAL"
    },
    {
      "ref": "COR-006",
      "classification": "CHAT_DIRECT"
    }
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A pull, restore, reset, clean, or branch switch is blocked by local changes",
    "startAt": "Classify changes and choose durable off-main preservation",
    "runPreflight": "Verify the preservation object exists and, when appropriate, is pushed remotely",
    "doNot": "Pop branch-specific work onto main or run git restore before classification",
    "proveBeforeClaiming": "Show clean main plus recoverable WIP location"
  }
}
```

## 15. Future-agent instructions

When continuing from this thread:

1. Verify the current repository state rather than trusting pasted historical SHAs.
2. Treat Cross-Agent #8, Cross-Agent #9, and App Builder #281 as cross-check candidates until GitHub and local repository state confirm merge history and contents.
3. Before `estate-scout-hook-sync-v1`, classify the seven App Builder tracked modifications and preserve valid work off main.
4. Run the canonical hook check and record exact repository outputs.
5. For each of the twelve missing installations, distinguish:
   - missing tracked hook files,
   - ignored machine-local configuration,
   - repository-specific policy conflicts,
   - already-landed remote content,
   - generated or host-only differences.
6. Use governed per-repository branches and PRs where tracked files change.
7. After merge, require 33/33 synchronized status and representative consumer scout smoke tests.
8. Keep publication and validation claims in the Cursor/operator lane.

## 16. Publication truth table

| Layer | State |
| --- | --- |
| Git authority | `not-run` |
| L: Hub catalog | `not-run` |
| Z: AI cache | `not-run` |
| Supabase projection | `not-run` |
| Freshness gate | `not-run` |

```text
Publication: NOT_RUN_BY_CURSOR
projection.hubPublishStatus: not-run
```

## 17. Acceptance checklist

- [x] OBSERVED lane only.
- [x] Retrieval block uses `INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT`.
- [x] Scope ledger precedes event inventory.
- [x] Correction ledger included.
- [x] Operational claims classified as `USER_REPORTED_OPERATIONAL` or `CROSS_CHECK_CANDIDATE`.
- [x] Event inventory included.
- [x] Eight harvest packet kinds represented as applicable.
- [x] Execution deltas included.
- [x] Waste ledger included.
- [x] Duplication detector uses required classifications.
- [x] Operator friction included.
- [x] ROI backlog ranked.
- [x] ROI top three each have a seed candidate with at least two retrieval questions.
- [x] Seed status is `CANDIDATE` only.
- [x] Do-not-advance guards included.
- [x] Publication truth remains entirely `not-run`.
- [x] Output verdict is `DRAFT_READY_FOR_CURSOR_VALIDATION`.

## 18. Next operator action

After this file is committed and pushed to `chat-gpt-harvest`, Cursor should pull that branch and run:

```bash
npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-04-estate-hot-cache-closeout-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-04-estate-hot-cache-closeout-v1

npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-04-estate-hot-cache-closeout-v1
npm run harvest:sync-derived -- harvest-2026-08-04-estate-hot-cache-closeout-v1
npm run harvest:validate -- harvest-2026-08-04-estate-hot-cache-closeout-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-04-estate-hot-cache-closeout-v1
npm run test:harvest
```

Only the operator/Cursor lane may run publication and claim final harvest completion.

## 19. Git push record

```text
Repo: Capglass5708/CapitalGlass-Cross-Agent
Branch: chat-gpt-harvest
File: artifacts/agent-runs/harvest-2026-08-04-estate-hot-cache-closeout-v1/chatgpt-findings-source.md
Commit message: harvest(chatgpt): draft findings harvest-2026-08-04-estate-hot-cache-closeout-v1
```

This file is draft seed material for Cursor validation. It must not be merged directly to main as operational truth.
