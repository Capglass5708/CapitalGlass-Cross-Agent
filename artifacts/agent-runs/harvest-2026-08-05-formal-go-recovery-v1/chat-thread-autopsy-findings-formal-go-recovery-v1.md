# Chat Thread Closeout Autopsy Findings — Formal-GO Recovery

**Mission:** `chat-thread-closeout-autopsy-harvest-chatgpt-v1`  
**Lane:** `CHAT_CONTEXT_ONLY`  
**Start verdict:** `UNHARVESTED_THREAD`  
**Target tier:** `T2`  
**Output verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`  
**Mode:** `DRAFT_FILE`

---

## 1. Final summary

This thread centered on recovering `CG-AppBuilder-MCP` from an `All Systems Go` WARN state toward formal GO without weakening controls.

The key durable conclusion is that the WARN was correct and protective. The prior formal-GO baseline at `4ff9eaa3` was stale relative to current `main` at `b55f244075dd55a1474b4e353c4353c1f59f1586`, which had advanced by 27 commits. The cache miss and live observe fallback were therefore safer than serving the old GO envelope.

Local verification then established:

- `HEAD == origin/main == b55f244075dd55a1474b4e353c4353c1f59f1586`
- ahead/behind = `0 / 0`
- 37 dirty paths were generated runtime or mission evidence, not intended source drift
- refreshing preflight removed the freshness ambiguity but exposed real blockers
- rule-sync drift was repaired
- Document Center Bible drift remained unresolved
- `mcp:contract-audit` correctly exposed two unapproved `project_documents` POST paths
- live shared-database reconciliation remained blocked by missing Supabase credentials

The correct next architecture is:

1. preserve Git as Application Bible edit authority;
2. semantically reconcile Z-only differences before publishing Git to Z;
3. centralize `project_documents` writes behind one approved Document Layer registration boundary;
4. achieve preflight PASS;
5. then run Doppler-backed shared-database reconciliation;
6. only then rerun All Systems Go.

**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

---

## 2. Harvest verdict and tier rationale

**Harvest verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

**Tier:** `T2`

**Rationale:**

- The thread contains multiple corrective turns and progressively refined evidence.
- It spans Git parity, runtime artifacts, preflight freshness, rule synchronization, Bible authority, MCP contract enforcement, Supabase migration visibility, and formal-GO sequencing.
- Several operator decisions and architectural guardrails were clarified.
- The thread contains durable failure patterns and protocol improvements that should be validated and indexed by Cursor.
- ChatGPT cannot verify current repository state beyond the pasted evidence, so all findings remain draft candidates.

---

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

No `INDEX_HIT`, `INDEX_HIT_AI_CACHE`, `FAILOVER_SUPABASE`, `HARVEST_COMPLETE`, `FULLY_SEEDED`, or `OPERATIONAL` claim is made.

---

## 4. Thread event inventory

### EVT-001 — All Systems Go WARN reported

The thread began with an observe-mode, zero-write All Systems Go result on `CG-RYZEN9DESK-01`.

Key lane results:

- `gate-dry-run`: PASS
- `shared-db-impact`: WARN
- `git-parity`: WARN
- `closeout-observe`: WARN
- `auto-v32-observe`: PASS
- `z-pre-session-observe`: PASS

Initial blockers:

- three migration entries marked `requires-investigation`
- stale preflight artifacts beyond the 24-hour window
- 37 uncommitted paths
- live shared-DB ledger unavailable
- Windows `npm` path conflict; WSL nvm Node succeeded

### EVT-002 — GitHub-side investigation

The GitHub investigation established that:

- the prior formal-GO baseline was `4ff9eaa3`
- current `main` was `b55f244075dd55a1474b4e353c4353c1f59f1586`
- `main` was 27 commits ahead and 0 behind the old GO baseline
- the intervening work included hot-cache, projection, migration, receipt-lineage, and collision-preflight changes
- current head lacked discoverable commit-status or workflow-run evidence
- old formal-GO authority could not safely be reused

### EVT-003 — Local Git classification

The user verified:

- branch `main`
- `HEAD == origin/main`
- ahead/behind `0 / 0`
- all 37 dirty paths were generated runtime or mission evidence
- no intended source edits, secrets, or unrelated active work were present

This refined `git-parity` from possible branch drift to local artifact-noise classification.

### EVT-004 — Preflight refresh

The stale preflight was refreshed.

Result:

- freshness issue resolved
- verdict changed from stale WARN context to explicit BLOCKED
- blockers:
  - `check:three-way-agent-rule-sync`
  - `suite:contract-gate`
  - `check:application-bibles-sync`
  - `mcp:contract-audit`

This proved the 24-hour freshness policy was working as intended.

### EVT-005 — Rule-sync repair

The user ran:

```bash
npm run sync:three-way-agent-rule
```

Result:

- `check:three-way-agent-rule-sync`: FAIL → PASS
- `.cursor/rules/intelligence-hub-first-read.mdc` updated
- `docs/generated/three-way-agent/rule-sync-manifest.json` refreshed
- `suite:contract-gate` still failed due to uncommitted generated source-change hygiene

### EVT-006 — Document Center Bible drift diagnosis

The user identified:

- Git authority path: `CapitalGlass-Documents/docs/application-bible/`
- Z mirror path: `/mnt/z/Capital-Glass-Dev/Application Bibles/Document Center Bible/`
- 27 drifted files
- 17 content differences
- 8 Z-only `ChatGPT-Bible-Pack/**` files
- no Git-only files

The key unresolved issue was that Z files had newer mtimes but did not match Git hashes. The thread correctly rejected mtime as sufficient authority evidence.

### EVT-007 — MCP contract-audit diagnosis

The user established:

- `CG-AppBuilder-MCP` being classified `DOC_ONLY` was expected policy behavior
- the actual failure was two direct `project_documents` POST paths in `CapitalGlass-Documents`:
  - `api/lib/engines/document-storage-engine/document-synology-primary-register.ts`
  - `api/lib/plan-summary-generation-core.ts`

These were classified as actual contract drift, not stale metadata.

### EVT-008 — Recovery sequencing refined

The thread converged on this sequence:

1. commit deterministic rule-sync output only
2. semantically reconcile Bible drift
3. regenerate Bible manifests
4. publish Git → Z only after Git authority is correct
5. centralize `project_documents` writes
6. achieve preflight PASS
7. run Doppler-backed shared-DB audit
8. classify the three migrations
9. rerun All Systems Go

---

## 5. Harvest packets

### HP-001 — Failure pattern

**Kind:** `failure-pattern`  
**Title:** Stale GO envelope reused after material repository evolution

**Problem:** A previously valid formal-GO receipt can become unsafe when `main` advances materially.

**Evidence:** Prior GO at `4ff9eaa3`; current `main` at `b55f244...`; 27 intervening commits.

**Durable lesson:** Formal-GO authority must be pinned to the exact current Git SHA and invalidated on material source, migration, contract, or authority changes.

### HP-002 — Protocol upgrade

**Kind:** `protocol-upgrade`  
**Title:** Preflight freshness should expose current blockers, not merely be refreshed

**Problem:** Refreshing stale preflight may reveal real failures.

**Evidence:** After freshness was repaired, preflight became BLOCKED on rule sync, Bible drift, and contract audit.

**Upgrade:** Recovery runbooks should explicitly state that a refresh is diagnostic, not a guaranteed return to PASS.

### HP-003 — Failure pattern

**Kind:** `failure-pattern`  
**Title:** Generated runtime artifacts misread as Git parity drift

**Problem:** Dirty worktrees can trigger parity warnings even when `HEAD == origin/main`.

**Evidence:** 37 dirty paths were all runtime or mission evidence.

**Durable lesson:** Git parity gates should distinguish:
- commit graph drift
- intended source drift
- generated artifact drift
- mission evidence drift

### HP-004 — Architecture lesson

**Kind:** `lesson`  
**Title:** Modification time is not authority

**Problem:** Z files were newer than Git but policy defined Git as edit authority.

**Evidence:** Z mtimes from 2026-08-05; Git content from July; hashes diverged.

**Durable lesson:** Reconciliation direction must follow authority policy and semantic content, not file timestamps.

### HP-005 — Protocol upgrade

**Kind:** `protocol-upgrade`  
**Title:** Bible drift requires semantic diff before mirror publication

**Problem:** Blind Git→Z or Z→Git sync risks destroying legitimate knowledge or importing unauthorized drift.

**Upgrade:** Require per-file semantic classification:
- formatting/timestamp only
- Z stale
- legitimate Z-only knowledge
- policy conflict
- unexplained mutation

### HP-006 — Architecture lesson

**Kind:** `lesson`  
**Title:** Centralize Document Layer writes

**Problem:** Two components directly POSTed to `project_documents`.

**Evidence:** `document-synology-primary-register.ts` and `plan-summary-generation-core.ts`.

**Durable lesson:** One approved registration boundary should own document creation, validation, idempotency, metadata normalization, and audit.

### HP-007 — Failure pattern

**Kind:** `failure-pattern`  
**Title:** Live migration counts are not actionable without ledger visibility

**Problem:** Aggregate counts of 170 pending and 16 duplicate versions could not be safely interpreted while the live ledger was unavailable.

**Durable lesson:** Do not mass-apply, rename, or delete migrations from snapshot counts alone. Restore live-ledger visibility first.

### HP-008 — Operator procedure

**Kind:** `operator-procedure`  
**Title:** WSL Node authority for All Systems Go

**Problem:** Windows `npm` on PATH caused a UNC-path failure.

**Durable lesson:** Load WSL nvm Node before running repository gates on `CG-RYZEN9DESK-01`.

---

## 6. Execution deltas

### ED-001 — Formal GO baseline validation

**Actual:** Initial state focused on fixing freshness and worktree dirtiness.

**Optimal:** First pin:
- current HEAD
- origin/main
- ahead/behind
- prior GO SHA
- commits since GO

**Delta:** GitHub history analysis should be an early formal-GO recovery step.

### ED-002 — Dirty worktree handling

**Actual:** Initial recommendation included commit-or-stash language.

**Optimal:** Classify dirty paths before any stash:
- generated runtime
- mission evidence
- intended source
- unrelated active work
- machine-local
- secret-bearing

**Delta:** Blanket stash should be prohibited unless a manifest is recorded.

### ED-003 — Bible reconciliation

**Actual:** Initial choices were framed as Git→Z versus Z→Git.

**Optimal:** First perform semantic diff and preserve bounded legitimate Z-only content in Git.

**Delta:** Authority direction and knowledge preservation are separate decisions.

### ED-004 — Contract-audit repair

**Actual:** Allowlist or refactor were both initially possible.

**Optimal:** Prove the approved write boundary first; refactor callers; allowlist only the true boundary.

**Delta:** Contract enforcement should guide architecture, not be silenced.

### ED-005 — Shared-DB sequencing

**Actual:** Shared-DB audit was listed early in recovery.

**Optimal:** Achieve repository preflight PASS before mixing in live database reconciliation, unless DB visibility is itself needed to clear preflight.

**Delta:** Separate deterministic repo repair from live operational reconciliation.

---

## 7. Waste ledger

### TW-001 — Repeatedly re-establishing that WARN was legitimate

The thread revisited the same conclusion multiple times:

- WARN was not a broken runner
- cache miss was correct
- stale GO reuse was unsafe

**Cause:** Each new evidence layer independently confirmed the same point.

**Reduction:** Store this as a reusable formal-GO recovery pattern so future agents start from the established model.

### TW-002 — Git dirtiness ambiguity

Time was spent treating 37 paths as possible source drift before classification showed they were artifacts.

**Reduction:** Add automatic dirty-path classification to `git-parity`.

### TW-003 — DOC_ONLY distraction

`DOC_ONLY` appeared important but was not the actual audit failure.

**Reduction:** Audit output should separate:
- informational repository classification
- blocking contract violations

### TW-004 — Timestamp-based Bible ambiguity

Newer Z mtimes created uncertainty.

**Reduction:** Bible reconciliation tooling should emit authority-policy status and semantic diff summaries, not just mtimes and hashes.

---

## 8. Duplication detector

### DUP-001 — Formal-GO validity theme

**Repeated theme:** “The WARN is doing its job.”

**Status:** `NEEDS_REGISTRY_LOOKUP_FIRST`

Potential duplicate of existing:
- All Systems Go signal-trust guidance
- receipt-lineage hardening
- stale-authority prevention

### DUP-002 — Git vs Z Bible authority

**Repeated theme:** Git edit authority, Z mirror authority.

**Status:** `NEEDS_REGISTRY_LOOKUP_FIRST`

Potential duplicate of existing:
- Application Bible authority model
- Z publication mirror policy
- Bible authority gate documentation

### DUP-003 — Generated artifact dirtiness

**Repeated theme:** Runtime and mission artifacts should not be treated as source drift.

**Status:** `NEEDS_REGISTRY_LOOKUP_FIRST`

Potential duplicate of:
- repository guardian dirty-ignore rules
- hot-cache dirty-ignore logic
- executor dirty advisory work

### DUP-004 — Shared database migration reconciliation

**Repeated theme:** Do not act on aggregate migration counts without live ledger visibility.

**Status:** `NEEDS_REGISTRY_LOOKUP_FIRST`

Potential duplicate of:
- shared-db impact protocol
- migration collision preflight
- shared-db ledger documentation

---

## 9. Operator friction

### OF-001 — Windows npm contamination

The operator had to recover from Windows `npm` appearing in a WSL execution path.

### OF-002 — Artifact-heavy dirty tree

The operator had to manually classify 37 paths before understanding parity.

### OF-003 — Bible drift volume

Twenty-seven drifted files made safe reconciliation expensive.

### OF-004 — Mixed audit messaging

Expected `DOC_ONLY` status and real route violations appeared in the same audit context.

### OF-005 — Credential context mismatch

The shared-DB audit command was available, but the shell lacked `SUPABASE_ACCESS_TOKEN`.

### OF-006 — Gate coupling

A repaired rule sync still caused `suite:contract-gate` failure until generated outputs were committed, making the distinction between semantic repair and worktree hygiene less obvious.

---

## 10. ROI backlog

### ROI-001 — Add dirty-path classification to All Systems Go

**Priority:** 1  
**Value:** High  
**Effort:** Medium

Automatically classify dirty paths and report separate verdicts for:
- source drift
- generated runtime
- mission evidence
- ignored/disposable
- secret risk

### ROI-002 — Add semantic Application Bible reconciliation report

**Priority:** 2  
**Value:** High  
**Effort:** Medium

Generate per-file:
- authority side
- hashes
- semantic summary
- generated/manual classification
- recommended disposition
- mirror-only exclusions

### ROI-003 — Centralize `project_documents` registration

**Priority:** 3  
**Value:** High  
**Effort:** Medium to high

Create one approved registration boundary and refactor all direct writers.

### ROI-004 — Separate audit info from blockers

**Priority:** 4  
**Value:** Medium  
**Effort:** Low

Render `DOC_ONLY` as informational and route violations as blocking findings.

### ROI-005 — Add formal-GO SHA invalidation rule

**Priority:** 5  
**Value:** High  
**Effort:** Low to medium

Invalidate hot GO authority when:
- HEAD changes
- migration inventory changes
- contract hashes change
- Bible authority hashes change
- preflight lineage expires

### ROI-006 — Add Doppler-aware shared-DB wrapper

**Priority:** 6  
**Value:** Medium  
**Effort:** Low

Provide a standard command that verifies credential context before running audits.

---

## 11. Do-not-advance guards

1. Do not claim formal GO while preflight is BLOCKED.
2. Do not widen the 24-hour freshness window to silence stale evidence.
3. Do not reuse the `4ff9eaa3` GO envelope for `b55f244...`.
4. Do not blanket-stash the 37 dirty paths without a manifest.
5. Do not treat newer Z mtimes as proof of authority.
6. Do not wholesale pull Z Bible content into Git.
7. Do not publish Git to Z until semantic reconciliation is complete.
8. Do not add allowlist entries solely to silence `mcp:contract-audit`.
9. Do not mass-apply or rename migrations without live-ledger visibility.
10. Do not rerun All Systems Go until preflight reaches PASS.

---

## 12. Seed packet candidates

### Seed candidate 1

```json
{
  "seedId": "IH-THREAD-FORMAL-GO-SHA-INVALIDATION-V1",
  "kind": "protocol-upgrade",
  "title": "Invalidate formal-GO authority after material repository evolution",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why is an older All Systems Go receipt unsafe after main advances?",
    "What must match before a formal-GO envelope can be reused?"
  ],
  "evidenceRefs": [
    "EVT-001",
    "EVT-002",
    "HP-001"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A prior GO receipt exists but the repository has advanced.",
    "startAt": "Compare prior GO SHA to current HEAD and origin/main.",
    "runPreflight": "Run Git parity, receipt-lineage freshness, migration inventory, and contract hash checks.",
    "doNot": [
      "Reuse stale GO authority",
      "Treat cache hit as valid without SHA and authority alignment"
    ],
    "proveBeforeClaiming": [
      "Current HEAD equals the authority SHA",
      "Preflight evidence is fresh",
      "Migration and contract inventories are reconciled"
    ]
  }
}
```

### Seed candidate 2

```json
{
  "seedId": "IH-THREAD-BIBLE-SEMANTIC-RECONCILIATION-V1",
  "kind": "protocol-upgrade",
  "title": "Semantically reconcile Git and Z Bible drift before publication",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How should Application Bible drift between Git and Z be resolved?",
    "Does a newer Z modification time make Z authoritative?"
  ],
  "evidenceRefs": [
    "EVT-006",
    "HP-004",
    "HP-005"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "Git and Z Bible hashes differ.",
    "startAt": "Load the documented authority model and classify each divergent file.",
    "runPreflight": "Run Bible sync check and semantic diff before any publish or pull.",
    "doNot": [
      "Use mtime as authority",
      "Blindly overwrite either side",
      "Modify mirror-only consumption packs"
    ],
    "proveBeforeClaiming": [
      "Legitimate Z-only knowledge is preserved in Git",
      "Generated manifests are regenerated from canonical source",
      "Git and Z hashes align after approved publication"
    ]
  }
}
```

### Seed candidate 3

```json
{
  "seedId": "IH-THREAD-DOCUMENT-LAYER-SINGLE-WRITE-AUTHORITY-V1",
  "kind": "architecture-lesson",
  "title": "Use one approved Document Layer registration boundary",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why did mcp:contract-audit flag project_documents POST routes?",
    "How should plan-summary and Synology-primary registration create document records?"
  ],
  "evidenceRefs": [
    "EVT-007",
    "HP-006"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A component directly writes project_documents outside the approved runtime.",
    "startAt": "Trace the documented ownership boundary and all write call paths.",
    "runPreflight": "Run route-ownership audit and relevant idempotency tests.",
    "doNot": [
      "Add allowlists merely to silence the audit",
      "Duplicate registration logic across producers"
    ],
    "proveBeforeClaiming": [
      "Only the approved boundary writes project_documents",
      "Registration remains idempotent",
      "Ownership metadata is preserved"
    ]
  }
}
```

### Seed candidate 4

```json
{
  "seedId": "IH-THREAD-GIT-PARITY-ARTIFACT-CLASSIFICATION-V1",
  "kind": "failure-pattern",
  "title": "Separate source drift from generated artifact dirtiness",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why can git-parity WARN when HEAD equals origin/main?",
    "How should runtime and mission artifacts be classified during formal-GO recovery?"
  ],
  "evidenceRefs": [
    "EVT-003",
    "HP-003",
    "TW-002"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A repository is dirty during parity checks.",
    "startAt": "Compare HEAD to origin/main, then classify every dirty path.",
    "runPreflight": "Run status, diff stat, staged diff, and secret-risk checks.",
    "doNot": [
      "Blanket stash without a manifest",
      "Assume all dirty files are source changes"
    ],
    "proveBeforeClaiming": [
      "Ahead/behind is known",
      "No intended source drift is hidden",
      "Artifact categories are documented"
    ]
  }
}
```

---

## 13. Future-agent instructions

When resuming this work:

1. Read the latest repository and Cross-Agent authority before acting.
2. Verify `HEAD`, `origin/main`, and current dirty-path classification.
3. Confirm whether the deterministic rule-sync commit was created and pushed.
4. Do not repeat the debate over whether the original WARN was legitimate; treat that as established unless new evidence contradicts it.
5. Continue with semantic Bible reconciliation, not timestamp comparison.
6. Preserve Git as edit authority unless an explicit authority decision changed.
7. Refactor direct `project_documents` writes into one approved boundary.
8. Require preflight PASS before shared-DB and All Systems Go closure.
9. Run shared-DB audit only with proper Doppler/Supabase credentials.
10. Verify the three migrations individually:
   - `cache_generations_v1`
   - `execution_packet_projections_v1`
   - `harvest_prompt_projections_v1`
11. Never claim GO, HARVEST_COMPLETE, OPERATIONAL, or FULLY_SEEDED without Cursor/operator receipts.

---

## 14. Publication truth table

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

---

## 15. Acceptance checklist

- [x] Final summary included
- [x] Harvest verdict and tier rationale included
- [x] Retrieval preflight declared
- [x] Thread event inventory included
- [x] Harvest packets included
- [x] Execution deltas included
- [x] Waste ledger included
- [x] Duplication detector included
- [x] Operator friction included
- [x] ROI backlog ranked
- [x] Do-not-advance guards included
- [x] At least one seed candidate per ROI top-three
- [x] Each seed has at least two retrieval questions
- [x] Future-agent instructions included
- [x] Publication truth table set to `not-run`
- [x] No `HARVEST_COMPLETE` claim
- [x] No `OPERATIONAL` claim
- [x] No live index claim
- [ ] Cursor duplication preflight
- [ ] Cursor schema validation
- [ ] Cursor harvest validation
- [ ] Operator publication

---

## 16. Next operator action

Hand this file to Cursor and run:

```text
Ingest ChatGPT thread autopsy findings per chat-thread-closeout-autopsy-harvest-chatgpt-v1.

npm run harvest:ingest-chatgpt-findings -- --input=<findings.md> --harvest-id=harvest-2026-08-05-formal-go-recovery-v1

Then run duplication-preflight, validate, and operator publish-intelligence-full.
```

Cursor command chain:

```bash
npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-05-formal-go-recovery-v1
npm run harvest:sync-derived -- harvest-2026-08-05-formal-go-recovery-v1
npm run harvest:validate -- harvest-2026-08-05-formal-go-recovery-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-05-formal-go-recovery-v1
npm run test:harvest
# operator only:
npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-05-formal-go-recovery-v1
```

**Final verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`
