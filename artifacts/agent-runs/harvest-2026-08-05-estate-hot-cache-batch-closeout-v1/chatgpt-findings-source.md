# ChatGPT Findings Source — Estate Hot-Cache Batch Closeout

## 1. Final summary

```text
Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Start verdict: UNHARVESTED_THREAD
Target tier: T2
Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION
```

This thread records an observed multi-repository closeout in which seven repositories were normalized to `main`, local work was preserved instead of discarded, Cross-Agent routing and dataset authority were published through separate PRs, App Builder hot-cache expansion was merged after clean-checkout consumption tests, and the remaining scout-hook rollout was intentionally deferred.

The strongest reusable pattern is: preserve local WIP off `main`, separate commit parity from working-tree cleanliness, publish only minimum durable authority, and require clean-checkout dependency closure before merge.

A prior ChatGPT run already created a closely related findings draft at `harvest-2026-08-04-estate-hot-cache-closeout-v1`. This run uses the updated protocol and therefore records that duplicate explicitly for later batch assessment rather than claiming a new unique harvest.

## 2. Harvest verdict and tier rationale

**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

**Tier:** T2

The thread contains multiple corrections, staged dependency discovery, repository preservation decisions, three PR milestones, final scout status, and one deferred estate-wide lane. It warrants structured harvest, but all repository and runtime claims remain unverified in ChatGPT.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

## 4. Scope ledger

### Primary mission

Document the observed closeout of estate normalization, Cross-Agent authority publication, and App Builder hot-cache reconciliation.

### Closed lanes

- Seven repositories reported aligned with `origin/main`.
- App Builder stash reconciled on a dedicated branch and merged via PR #281.
- Cross-Agent query-routing authority merged via PR #8.
- Cross-Agent dataset registry authority merged via PR #9.
- Cross-Agent local harvest/runtime WIP preserved on a remote archive branch.
- Four scout-rule edits normalized to canonical remote content without PRs.
- Clean-checkout hot-cache consumption gates reported passing.

### Open lane

- `estate-scout-hook-sync-v1` for twelve repositories missing canonical hook installation.

### Deferred work

- Governance `.cursor/mcp.json` ignore-policy chore.
- Documents `isolated-verifier-report.json` disposition.
- Cross-Agent dedicated validation workflow.
- Classification of seven local App Builder tracked modifications reported after merge.

### Do-not-merge boundaries

- Do not mix scout-hook rollout with routing/dataset authority work.
- Do not commit generated cache output, host paths, receipts, diagnostics, or machine-local MCP config as authority.
- Do not pop branch-specific work onto `main`.

## 5. Correction ledger

### COR-001

- **priorAssumption:** Seven repositories on `main` implied estate cleanup was nearly complete.
- **correction:** Later parity checks exposed App Builder behind remote, extensive Cross-Agent WIP, rule drift, machine-local files, and verifier artifacts.
- **correctedModel:** Report SHA parity, clean-tree status, intentional WIP, and machine-local drift separately.
- **affectedFindings:** EVT-002, HP-001, ROI-001.

### COR-002

- **priorAssumption:** Scout-rule drift required four commits.
- **correction:** Canonical sync restored local files to content already present on remote main.
- **correctedModel:** Run canonical sync plus remote comparison before opening PRs.
- **affectedFindings:** EVT-006, DUP-002, ROI-003.

### COR-003

- **priorAssumption:** Query-routing authority alone would unblock App Builder clean-clone tests.
- **correction:** Full consumption gates still failed because dataset registry and authority manifests were absent.
- **correctedModel:** Routing and dataset authority are separate dependency layers.
- **affectedFindings:** EVT-009, EVT-010, HP-004, ROI-002.

### COR-004

- **priorAssumption:** Post-merge App Builder main would be clean.
- **correction:** The user later reported seven modified tracked files on aligned main.
- **correctedModel:** Classify and preserve before any destructive restore.
- **affectedFindings:** EVT-013, HP-007.

### COR-005

- **priorAssumption:** Immediate per-run Cursor ingest was the default closeout.
- **correction:** The updated attached protocol makes batch queueing the default and per-run ingest optional.
- **correctedModel:** After push, report SHA and stop unless immediate ingest is explicitly requested.
- **affectedFindings:** EVT-016, HP-008.

## 6. Thread event inventory

### EVT-001 — Initial branch normalization

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Governance MCP and Cross-Agent were reported moved to `main` and pulled, with residual stash and receipt drift.

### EVT-002 — Full parity check exposed hidden local drift

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- App Builder was behind two commits; several repositories had modified or untracked files despite six of seven being SHA-aligned.

### EVT-003 — Obsolete stash and local receipt removed safely

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Cross-Agent stash contents were inspected and dropped; Governance host-local receipt rerun was reverted.

### EVT-004 — App Builder WIP preserved before fast-forward

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- A named `-u` stash preserved hot-cache/scout work while main fast-forwarded and remained clean.

### EVT-005 — Cross-Agent WIP archived off main

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Forty-two dirty paths were committed to `archive/local-harvest-wip-2026-08-04` and pushed remotely.

### EVT-006 — Four rule edits normalized without publication

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Canonical sync reported all four consumer rules identical to remote main; no PR was needed.

### EVT-007 — App Builder hot-cache branch and PR #281

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Valid stash content was reconciled, generated/runtime output excluded, tests passed, and PR #281 opened.

### EVT-008 — Dual routing schema support

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- `query-router.mjs` was reported updated to accept both manifest forms.

### EVT-009 — Cross-Agent query-routing PR #8

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Canonical routing manifest, schema, alternate fixture, README, validation, and tests were published and later reported merged.

### EVT-010 — Dataset authority dependency discovered

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Clean query-routing tests passed, but full App Builder consumption gates failed because tracked dataset authority was missing.

### EVT-011 — Cross-Agent dataset registry PR #9

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Minimum durable dataset, git-estate, and authority-estate contracts were published while unrelated local registry candidates remained excluded.

### EVT-012 — Clean-checkout consumption proof

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Router integration, authority foundation, bulk-pull dry run, L-by-kind publication, and scout fallback all reported PASS.

### EVT-013 — PR #9 and PR #281 merged

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Cross-Agent and App Builder were reported aligned with remote; App Builder still had seven local tracked modifications.

### EVT-014 — Final scout green

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- The user reported `INDEX_HIT_AI_CACHE`, `CURRENT`, `PUBLICATION_PASS`, and `rawScanRequired: false`.

### EVT-015 — Scout-hook rollout deferred

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Twelve repositories remained missing canonical hooks and shims; rollout had not started.

### EVT-016 — Updated protocol rerun

- **evidenceClass:** `ATTACHMENT_SOURCE`
- The attached protocol changed default closeout from immediate per-run ingest to queueing the draft on `chat-gpt-harvest` for later T2 batch assessment.

## 7. Harvest packets

### HP-001 — failure-pattern

- **evidenceClass:** `CHAT_DIRECT`
- **finding:** Commit parity was repeatedly mistaken for repository cleanliness.
- **lesson:** Always separate parity, clean tree, intentional WIP, and machine-local drift.

### HP-002 — lesson

- **evidenceClass:** `CHAT_DIRECT`
- **finding:** Preserve local work with named stashes, branches, or worktrees before normalizing main.

### HP-003 — protocol-upgrade

- **evidenceClass:** `CHAT_DIRECT`
- **finding:** Canonical sync must compare against remote before PR planning.

### HP-004 — architecture

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **finding:** Routing authority and dataset authority are distinct and both are required for deterministic clean-clone consumption.

### HP-005 — scope-control

- **evidenceClass:** `CHAT_DIRECT`
- **finding:** Publish only minimum durable authority; exclude generated/runtime/host-local content.

### HP-006 — verification

- **evidenceClass:** `CHAT_DIRECT`
- **finding:** Clean-checkout tests are the correct merge gate for cross-repository dependency closure.

### HP-007 — operator-safety

- **evidenceClass:** `CHAT_DIRECT`
- **finding:** Never recommend `git restore .` before classifying and preserving unknown tracked changes.

### HP-008 — workflow

- **evidenceClass:** `ATTACHMENT_SOURCE`
- **finding:** ChatGPT draft production should default to batch queueing after push, with per-run ingest only when explicitly chosen.

## 8. Execution deltas

### ED-001

- **evidenceClass:** `CHAT_DIRECT`
- **actual:** Full estate drift emerged across several turns.
- **optimal:** Produce a single estate matrix first.

### ED-002

- **evidenceClass:** `CHAT_DIRECT`
- **actual:** Stash safety rules were repeated manually.
- **optimal:** Make off-main restoration a protocol invariant.

### ED-003

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- **actual:** Query-routing publication preceded full dependency closure discovery.
- **optimal:** Resolve route -> dataset -> manifest -> consumer before first PR.

### ED-004

- **evidenceClass:** `ATTACHMENT_SOURCE`
- **actual:** The prior protocol run ended with immediate Cursor ingest commands.
- **optimal:** Under the updated protocol, queue the draft and stop unless per-run ingest is requested.

## 9. Waste ledger

### TW-001

- **evidenceClass:** `CHAT_DIRECT`
- Repeated reclassification of parity versus cleanliness consumed multiple turns.

### TW-002

- **evidenceClass:** `CHAT_DIRECT`
- Multiple long mission templates repeated the same guards and merge-order rules.

### TW-003

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Partial dependency discovery required separate query-routing and dataset-registry missions.

## 10. Duplication detector

### DUP-001

- **classification:** `POSSIBLE_EXISTING_HARVEST`
- **evidenceClass:** `CHAT_DIRECT`
- A prior draft exists at `harvest-2026-08-04-estate-hot-cache-closeout-v1` with substantially overlapping subject matter.
- **action:** `NEEDS_REGISTRY_LOOKUP_FIRST`; batch assessor should compare and consolidate rather than publish both independently.

### DUP-002

- **classification:** `FALSE_DUPLICATE_DIFFERENT_HOST_OR_CONTEXT`
- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Local rule drift appeared unpublished but normalized to content already on remote main.

### DUP-003

- **classification:** `POSSIBLE_EXISTING_IMPLEMENTATION`
- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Untracked registry candidates may overlap existing or future authority families.
- **action:** `NEEDS_REGISTRY_LOOKUP_FIRST`.

### DUP-004

- **classification:** `INTENTIONALLY_DEFERRED`
- **evidenceClass:** `CHAT_DIRECT`
- Scout-hook rollout remained separate from hot-cache authority publication.

## 11. Operator friction

### OF-001

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Windows/WSL path variants, `nul`, and machine-local MCP config obscured authority classification.

### OF-002

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Untracked registry content allowed local tests to pass while clean-clone gates failed.

### OF-003

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Twelve governed repositories require separate hook installation handling.

### OF-004

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Aligned main still carried seven unclassified tracked modifications.

## 12. ROI backlog

1. **Estate closeout matrix** — standard report for parity, cleanliness, WIP, and machine-local drift.
2. **Authority dependency closure validator** — ensure every route resolves to tracked dataset and compile authority.
3. **Safe WIP preservation preflight** — classify, preserve, verify durability, then clean.
4. **Remote-aware sync classifier** — distinguish already-on-origin from true canonical drift.
5. **Cross-Agent authority CI** — enforce routing and dataset registry validation on PRs.

## 13. Do-not-advance guards

- Do not claim repository, test, PR, index, or publication truth without Cursor verification.
- Do not claim `HARVEST_COMPLETE`, `OPERATIONAL`, or `FULLY_SEEDED`.
- Do not merge this draft directly to main.
- Do not publish both this draft and the prior overlapping draft without duplication assessment.
- Do not clean App Builder modifications before classification and preservation.
- Do not combine scout-hook rollout with closed hot-cache work.

## 14. Seed packet candidates

```json
{
  "seedId": "IH-THREAD-ESTATE-STATE-MATRIX-V2",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How should estate closeout distinguish SHA parity from working-tree cleanliness?",
    "Which fields prevent premature claims that a multi-repository estate is clean?"
  ],
  "evidenceRefs": [
    {"ref": "EVT-002", "classification": "USER_REPORTED_OPERATIONAL"},
    {"ref": "COR-001", "classification": "CHAT_DIRECT"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A multi-repository cleanup is being closed",
    "startAt": "Build a repository state matrix",
    "runPreflight": "Collect HEAD, origin relation, tracked changes, untracked changes, stashes, and preservation state",
    "doNot": "Equate aligned SHAs with clean trees",
    "proveBeforeClaiming": "Show both parity and tree evidence per repository"
  }
}
```

```json
{
  "seedId": "IH-THREAD-AUTHORITY-CLOSURE-V2",
  "kind": "failure-pattern",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why can query-routing pass while downstream consumption fails?",
    "How can every routed dataset be proven available from tracked clean-checkout authority?"
  ],
  "evidenceRefs": [
    {"ref": "EVT-010", "classification": "USER_REPORTED_OPERATIONAL"},
    {"ref": "COR-003", "classification": "CHAT_DIRECT"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A routing manifest is proposed as a dependency unblocker",
    "startAt": "Trace route to dataset record, manifest, compiler, and consumer",
    "runPreflight": "Resolve all IDs in a clean checkout",
    "doNot": "Treat router unit tests as full dependency proof",
    "proveBeforeClaiming": "Run complete clean-checkout consumption gates"
  }
}
```

```json
{
  "seedId": "IH-THREAD-SAFE-WIP-PREFLIGHT-V2",
  "kind": "lesson",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "What is the safe sequence before restoring or cleaning a repository with unknown local changes?",
    "When should a stash, archive branch, or worktree be used?"
  ],
  "evidenceRefs": [
    {"ref": "EVT-004", "classification": "USER_REPORTED_OPERATIONAL"},
    {"ref": "EVT-005", "classification": "USER_REPORTED_OPERATIONAL"},
    {"ref": "COR-004", "classification": "CHAT_DIRECT"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A pull, reset, restore, or clean is blocked by local work",
    "startAt": "Classify all changed paths",
    "runPreflight": "Create and verify durable off-main preservation",
    "doNot": "Run destructive cleanup first",
    "proveBeforeClaiming": "Show recoverable WIP plus clean main"
  }
}
```

## 15. Future-agent instructions

- Verify all pasted SHAs, PR states, and test outcomes in Cursor.
- Compare this draft with the prior `harvest-2026-08-04-estate-hot-cache-closeout-v1` draft during batch assessment.
- Consolidate duplicate seeds rather than approving both sets.
- Before scout-hook rollout, classify the seven App Builder modifications.
- Run canonical hook checks and use governed per-repository PRs where tracked files change.
- Require 33/33 synchronized status and representative scout smoke tests before closing that lane.

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

- [x] DRAFT_FILE mode declared.
- [x] OBSERVED lane only.
- [x] Retrieval uses `INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT`.
- [x] Scope and correction ledgers precede events.
- [x] EVT, HP, ED, and DUP entries have evidence classes.
- [x] Eight harvest packet kinds included as applicable.
- [x] Waste, duplication, friction, ROI, guards, and future instructions included.
- [x] Three top ROI seeds include at least two retrieval questions.
- [x] Seed status is `CANDIDATE` only.
- [x] Existing overlapping draft recorded as `POSSIBLE_EXISTING_HARVEST`.
- [x] Publication table is entirely `not-run`.
- [x] No forbidden operational claim made.

## 18. Next operator action

Default batch path: stop after this draft is committed and pushed. The draft is queued for `chatgpt-draft-batch-assessment-t2-v1`.

Optional operator collection command:

```bash
npm run harvest:collect-chatgpt-drafts
```

Per-run ingest is intentionally not requested by this run.

## 19. Git push record

```text
Repo: Capglass5708/CapitalGlass-Cross-Agent
Branch: chat-gpt-harvest
File: artifacts/agent-runs/harvest-2026-08-05-estate-hot-cache-batch-closeout-v1/chatgpt-findings-source.md
Commit message: harvest(chatgpt): draft findings harvest-2026-08-05-estate-hot-cache-batch-closeout-v1
```

This is draft seed material for batch assessment and Cursor validation. It is not operational authority.
