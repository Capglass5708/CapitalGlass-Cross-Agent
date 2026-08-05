# Chat Thread Closeout Autopsy Findings — Formal-GO Recovery and Reconciliation

Mission: `chat-thread-closeout-autopsy-harvest-chatgpt-v1`  
Lane: `CHAT_CONTEXT_ONLY`  
Start verdict: `UNHARVESTED_THREAD`  
Target tier: `T2`  
Output verdict: `DRAFT_READY_FOR_CURSOR_VALIDATION`

## 1. Final summary

This thread captured three closely related operational closeout tracks:

1. A Phase A harvest identity and ledger synchronization was completed at commit `c42c369`, with Phase B publication capability operational but operator approval and implementation-readiness milestones intentionally left unset.
2. Visual-Asset-Engine was fully reconciled and pushed at commit `6f8bc8b`, reaching clean local/remote parity with no semantic fixture change.
3. CG-AppBuilder-MCP formal-GO recovery repaired stale three-way agent-rule synchronization, but preflight remained blocked by:
   - uncommitted generated rule-sync artifacts,
   - unresolved Document Center Bible authority drift,
   - two Document Layer `project_documents` write paths outside the documented runtime ownership model,
   - and a pending Doppler-backed shared-database audit.

The thread’s durable value is not merely the status reports. It exposes a reusable closeout discipline:

- separate hygiene blockers from architectural blockers,
- never resolve authority drift by timestamp alone,
- distinguish expected policy classifications from actual audit failures,
- require clean-tree verification before interpreting gate failures,
- and withhold formal GO until preflight passes.

**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

## 2. Harvest verdict and tier rationale

### Harvest verdict

`DRAFT_READY_FOR_CURSOR_VALIDATION`

### Tier

`T2`

### Rationale

The thread contains multiple repositories, several commits, authority-direction decisions, a repaired sync failure, a real contract-enforcement failure, and explicit instructions not to advance to All Systems Go. It also contains repeated closeout-style summaries and multiple potential reusable seeds. That is beyond a simple single-topic summary but does not require a T3 incident reconstruction because no destructive action or production outage occurred in the visible conversation.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

No live Intelligence Hub, Git, L:, Z:, Supabase, Doppler, or repo commands were executed by ChatGPT in this lane. All technical state below comes from user-provided reports in the visible conversation and must be verified by Cursor before canonical publication.

## 4. Thread event inventory

### EVT-001 — Phase A harvest commit completed

The user reported completion of Phase A for:

`harvest-2026-08-04-document-center-adaptive-details-w17-v1`

Commit:

`c42c369 — harvest(phase-a): freeze document-center adaptive W17 thread autopsy identity`

Committed files included the harvest manifest, harvest summary, operational publication receipt, project work-package file, W17 packet registry additions, owner-repo boundary index, and generated project index rows.

Bundle, seeds, and compact records remained L:-only by protocol.

### EVT-002 — Ledger and publication indexes synchronized

From a clean worktree at `c42c369`, the user reported:

- cross-agent ledger ingest: `APPLIED`
- 15 actions
- 5 blockers
- active-work ledger L: publication: `PUBLISH_PASS`
- thread-autopsy Supabase projection: `THREAD_AUTOPSY_SUPABASE_PROJECTION_APPLIED`
- 23 harvests
- 89 seeds
- index freshness gate: `PASS`

This report is evidence only in the ChatGPT lane and must not be restated as a live verified result without Cursor rerun.

### EVT-003 — W17 advancement boundary remained intentionally closed

The user explicitly reported:

- Phase B publication: `OPERATIONAL`
- `W17_OPERATOR_APPROVED`: not set
- `MILESTONE_ADAPTIVE_DOCUMENT_DETAILS_IMPLEMENTATION_READY`: not set

The assistant correctly preserved the boundary and did not equate publication capability with implementation authorization.

### EVT-004 — Visual-Asset-Engine normalization verified

The user reported a dedicated fixture normalization commit:

`6f8bc8b — chore: normalize proposal cover fixture line endings`

Pre-commit verification:

- `git diff --cached --ignore-space-at-eol` empty
- `git diff --cached --check` clean
- no semantic changes

Push:

`4355946..6f8bc8b → origin/main`

Final state:

- ahead / behind: `0 / 0`
- working tree: clean
- scout rules present remotely
- no local drift

### EVT-005 — Formal-GO recovery started from aligned AppBuilder HEAD

The user reported CG-AppBuilder-MCP at:

`b55f244075dd55a1474b4e353c4353c1f59f1586`

with `0/0` parity against `origin/main`.

The mission scope was:

- rule-sync repair,
- Bible drift diagnosis without blind overwrite,
- MCP contract-audit diagnosis,
- preflight rerun.

### EVT-006 — Three-way rule-sync repaired

Before repair:

`check:three-way-agent-rule-sync` failed with:

`intelligence-hub-first-read/CG-AppBuilder-MCP [STALE_HASH]`

After:

- canonical rule synchronization ran,
- `.cursor/rules/intelligence-hub-first-read.mdc` was aligned to canonical v1.2.0,
- generated rule-sync manifest was refreshed,
- the dedicated rule-sync check passed,
- the same sub-check inside the suite contract gate passed.

### EVT-007 — Suite contract gate remained blocked by working-tree hygiene

The overall suite contract gate still failed with:

`generated-bible-source-change`

The user diagnosed this as local uncommitted generated manifest and `.cursor` copy changes without a staged canonical rule edit.

This is a key distinction:

- the rule-sync mechanism was repaired,
- but the repository had not yet converted those generated changes into a clean committed state.

### EVT-008 — Document Center Bible drift was inventoried without overwrite

The user reported the authority model as:

- Git canonical:
  `CapitalGlass-Documents/docs/application-bible/`
- Z mirror:
  `/mnt/z/Capital-Glass-Dev/Application Bibles/Document Center Bible/`

Reported drift:

- 27 files total
- 17 content differences
- 8 Z-only
- 0 Git-only

The user explicitly avoided publishing, deleting, or force-syncing Bible content.

The reported file classes included:

- substantive Markdown content requiring operator decision,
- generated JSON/manifest files requiring regeneration,
- expected runtime/generated drift,
- Z-only ChatGPT consumption-pack files allowed by mirror-only policy.

### EVT-009 — Timestamp recency was rejected as sufficient authority proof

The user highlighted a representative conflict:

`00-DOCUMENT-CENTER-FULL-SUMMARY.md`

- Git mtime: 2026-07-27
- Z mtime: 2026-08-05
- hashes differed
- last Git commit for that file: 2026-07-01

The correct conclusion was that a newer Z timestamp did not by itself authorize Z→Git restoration or Git→Z overwrite.

### EVT-010 — MCP contract audit policy classification separated from real failure

The user established that `DOC_ONLY` for CG-AppBuilder-MCP was expected by policy because the audit script intentionally classifies that repository based on CI presence.

The real audit failure was Document Layer route ownership.

Two files were reported as posting to `project_documents` outside the allowed runtime ownership model:

- `api/lib/engines/document-storage-engine/document-synology-primary-register.ts`
- `api/lib/plan-summary-generation-core.ts`

### EVT-011 — Final preflight remained blocked

The user reported:

`agent:preflight:app-builder-mcp → BLOCKED`

Checked at:

`2026-08-05T20:56:31Z`

Blocking gates:

- suite contract gate
- application Bible sync
- MCP contract audit
- generated Bible source-change guard

A Doppler-backed shared-database audit also remained pending.

### EVT-012 — All Systems Go explicitly deferred

The user’s report concluded:

`Do not rerun All Systems Go until preflight reaches PASS.`

The assistant preserved that instruction and recommended resolving blockers in sequence rather than interpreting partial repairs as formal GO.

## 5. Harvest packets

### HP-001 — `decision`

**Title:** Publication capability does not equal implementation authorization

**Finding:** W17 Phase B publication could be operational while operator approval and implementation-readiness milestones remained unset.

**Durable rule:** Systems must distinguish “the publication path works” from “the operator authorized advancement.”

**Evidence refs:** EVT-001, EVT-002, EVT-003

**Status:** `CANDIDATE`

---

### HP-002 — `lesson`

**Title:** Separate repaired sub-gates from remaining aggregate-gate failures

**Finding:** Three-way rule sync passed after repair, while the overall suite contract gate continued to fail for a separate dirty-tree guard.

**Durable rule:** A successful repair must be recorded at the narrowest gate level. Do not report the aggregate gate as repaired until all independent blockers clear.

**Evidence refs:** EVT-006, EVT-007

**Status:** `CANDIDATE`

---

### HP-003 — `failure-pattern`

**Title:** Generated synchronization changes can masquerade as authority-source violations

**Finding:** Correctly regenerated `.cursor` and manifest files triggered a source-change guard because they remained uncommitted in the working tree.

**Durable rule:** After generated rule synchronization, immediately classify changes as expected generated output, inspect the diff, and commit or revert them before interpreting downstream gate failures.

**Evidence refs:** EVT-006, EVT-007

**Status:** `CANDIDATE`

---

### HP-004 — `authority-decision`

**Title:** Bible divergence requires content review, not timestamp arbitration

**Finding:** Git was canonical by policy, but Z carried newer timestamps and different hashes. Neither direction was safe without operator confirmation.

**Durable rule:** For authority conflicts, mtime is context only. Reconcile by provenance, content diff, generation path, and explicit operator choice.

**Evidence refs:** EVT-008, EVT-009

**Status:** `CANDIDATE`

---

### HP-005 — `protocol-upgrade`

**Title:** Regenerate generated Bible artifacts before choosing sync direction

**Finding:** Several drifted files were generated manifests or suite-derived JSON rather than human-authored authority content.

**Durable rule:** Rebuild generated artifacts first, then compare residual human-authored drift. This reduces false conflict volume before an operator chooses Git→Z or Z→Git.

**Evidence refs:** EVT-008

**Status:** `CANDIDATE`

---

### HP-006 — `failure-pattern`

**Title:** Expected repository classification can hide the true contract blocker

**Finding:** `DOC_ONLY` was initially visible in the audit report but was policy-expected. The actual failure was unauthorized write-route ownership.

**Durable rule:** Audit output must separate repository posture labels from failing assertions. Operators should act on the failed contract clause, not the most prominent status label.

**Evidence refs:** EVT-010

**Status:** `CANDIDATE`

---

### HP-007 — `architecture`

**Title:** Document write ownership must be centralized or explicitly governed

**Finding:** Two files posted directly to `project_documents` outside the documented runtime ownership model.

**Durable rule:** Shared-table writes must go through the owning runtime/service or be explicitly allowlisted with documented ownership, rationale, and tests.

**Evidence refs:** EVT-010

**Status:** `CANDIDATE`

---

### HP-008 — `closeout-pattern`

**Title:** Formal GO requires clean-tree, authority, contract, and shared-DB proof

**Finding:** Remote parity and a repaired rule-sync gate were insufficient for formal GO because authority drift, write ownership, and shared-DB audit remained unresolved.

**Durable rule:** Do not rerun or claim All Systems Go until preflight is PASS and substantive blockers—not only local hygiene blockers—are closed.

**Evidence refs:** EVT-005 through EVT-012

**Status:** `CANDIDATE`

## 6. Execution deltas

### ED-001 — Rule-sync execution

**Actual:**

- detected stale hash,
- ran synchronization,
- inspected changed files,
- reran the narrow sync gate,
- identified the remaining aggregate-gate failure.

**Optimal:**

- perform the same sequence,
- then immediately stage and inspect only the generated rule-sync outputs,
- commit them as a dedicated hygiene commit,
- rerun the aggregate suite gate from a clean tree.

**Delta:** The repair itself was correct; closeout stopped one commit short of converting the repaired state into a clean gate baseline.

---

### ED-002 — Bible reconciliation

**Actual:**

- inventoried both authority surfaces,
- classified drift,
- preserved both copies,
- avoided blind overwrite.

**Optimal:**

1. regenerate manifest and generated JSON on the intended source side,
2. isolate human-authored residual diffs,
3. produce a per-file semantic summary,
4. require operator selection of authority direction,
5. commit restored Git truth before republishing.

**Delta:** Diagnosis was strong; operator-facing semantic diff condensation remains to be produced by Cursor.

---

### ED-003 — Contract audit

**Actual:**

- explained why `DOC_ONLY` was expected,
- identified two real rogue POST routes.

**Optimal:**

- map each route to current owner, caller, and business purpose,
- decide refactor vs governed allowlist,
- add tests proving no additional direct writes exist,
- rerun the audit in CapitalGlass-Documents and AppBuilder.

**Delta:** Root cause was found; implementation decision and proof remain outstanding.

---

### ED-004 — Formal-GO sequencing

**Actual:**

- preflight rerun exposed remaining blockers,
- All Systems Go was deferred.

**Optimal:**

Use a fixed recovery sequence:

1. clean-tree hygiene,
2. authority reconciliation,
3. contract repair,
4. shared-DB audit,
5. preflight PASS,
6. then All Systems Go.

**Delta:** The sequence was inferred and recommended, but should become a reusable recovery checklist.

## 7. Waste ledger

### TW-001 — Repeated status restatement

The thread repeatedly restated “fully reconciled,” “recorded,” and “no further cleanup required” after user-supplied verification.

**Cost:** Low token waste, but it risks conflating ChatGPT acknowledgment with independent verification.

**Improvement:** Use a compact acknowledgment that explicitly labels the state as user-reported and only persists the durable boundary or next action.

---

### TW-002 — Premature closure language

The assistant said “No further VAE cleanup is required.”

**Risk:** In CHAT_CONTEXT_ONLY, that wording is stronger than the evidence authority allows because ChatGPT did not run the checks.

**Improvement:** Prefer:

“Based on the reported clean parity and verification, no additional VAE cleanup is indicated.”

---

### TW-003 — Commit recommendation before full worktree evidence

The assistant recommended committing the two rule-sync files. That was likely correct from the pasted report, but the report also mentioned pre-existing dirty runtime/artifact paths.

**Risk:** A careless operator could stage more than intended.

**Improvement:** Require path-scoped staging plus `git status --short`, `git diff --cached --name-only`, and `git diff --cached --check` before commit.

---

### TW-004 — Large pasted reports without a standardized blocker ledger

The user supplied highly detailed state, but key blockers were embedded across multiple sections.

**Cost:** Agents must reread the report to reconstruct the actionable sequence.

**Improvement:** End every formal-GO recovery report with a normalized blocker ledger:

- blocker ID,
- repo owner,
- gate,
- exact file(s),
- decision required,
- command to verify closure,
- do-not-advance condition.

## 8. Duplication detector

### DUP-001 — Repeated reconciliation closeouts

The thread contains multiple “final state clean / aligned / no drift” closeouts across VAE and AppBuilder contexts.

**Classification:** `NEEDS_REGISTRY_LOOKUP_FIRST`

**Potential duplicate themes:**

- clean-tree closeout pattern,
- generated-file normalization with no semantic diff,
- remote parity proof,
- formal-GO precondition checklist.

Before creating new seeds, Cursor should inspect the existing thread-autopsy registry and known seed index for equivalent entries.

---

### DUP-002 — Authority drift handling may overlap existing Bible authority seeds

The visible broader context already contains established Bible authority and Z/Git mirror rules.

**Classification:** `NEEDS_REGISTRY_LOOKUP_FIRST`

The new value here is narrower:

- newer mirror timestamp is not sufficient authority,
- generated files should be regenerated before directional reconciliation,
- no blind overwrite during formal-GO recovery.

---

### DUP-003 — Shared-table write ownership may overlap shared-DB governance seeds

The architecture already contains shared-database ownership and route controls.

**Classification:** `NEEDS_REGISTRY_LOOKUP_FIRST`

The unique candidate is the audit interpretation pattern:

“expected repository status is not the failing assertion; inspect the exact route ownership clause.”

## 9. Operator friction

### OF-001 — Authority-direction decision burden

The operator must decide Git→Z versus Z→Git across 17 substantive files without a summarized semantic comparison.

**Mitigation:** Cursor should produce a concise per-file semantic diff matrix grouped by:

- Git-only meaning,
- Z-only meaning,
- conflict severity,
- generated vs human-authored,
- recommended direction.

---

### OF-002 — Gate names obscure root cause

`generated-bible-source-change` appeared during a rule-sync repair even though the changed files were generated rule artifacts.

**Mitigation:** Gate output should include:

- triggering paths,
- whether each path is generated,
- whether canonical source changed,
- likely remediation: commit, revert, or regenerate.

---

### OF-003 — Audit posture labels compete with assertion failures

`DOC_ONLY` can draw attention despite being expected policy.

**Mitigation:** Present audit results in two sections:

1. repository posture/classification,
2. failing contract assertions.

---

### OF-004 — Cross-repo ownership repair requires context switching

The AppBuilder preflight blocker is implemented in CapitalGlass-Documents.

**Mitigation:** Every blocker should name:

- detecting repo,
- owning repo,
- authoritative file,
- validating command in both repos.

## 10. ROI backlog

### ROI-001 — Formal-GO recovery blocker ledger

**Priority:** 1  
**Value:** Very high  
**Effort:** Low to medium

Create a machine-readable blocker ledger emitted by preflight and All Systems Go recovery tooling.

Minimum fields:

- blockerId
- gate
- detectingRepo
- owningRepo
- files
- classification
- operatorDecisionRequired
- remediation
- closureCommand
- doNotAdvanceUntil

### ROI-002 — Bible drift semantic classifier

**Priority:** 2  
**Value:** Very high  
**Effort:** Medium

Extend Bible sync diagnostics to classify:

- human-authored content,
- generated manifest,
- generated runtime state,
- mirror-only consumption layer,
- probable format-only drift,
- substantive semantic divergence.

Produce a directional recommendation but never auto-overwrite substantive conflicts.

### ROI-003 — Contract-audit result normalization

**Priority:** 3  
**Value:** High  
**Effort:** Low

Separate:

- expected repo policy posture,
- warning classifications,
- failed contract assertions,
- exact remediation owner.

### ROI-004 — Generated-sync clean-close helper

**Priority:** 4  
**Value:** High  
**Effort:** Low

After three-way rule sync:

1. print expected changed files,
2. verify only those paths changed,
3. run diff checks,
4. offer a deterministic commit command,
5. rerun the suite gate.

### ROI-005 — Cross-repo write-route registry

**Priority:** 5  
**Value:** High  
**Effort:** Medium

Create an explicit registry for shared-table writers, with:

- table,
- route,
- owner repo,
- service boundary,
- allowlist status,
- rationale,
- tests,
- last review commit.

## 11. Do-not-advance guards

1. Do not claim `HARVEST_COMPLETE`.
2. Do not claim `OPERATIONAL` for this ChatGPT-produced harvest.
3. Do not claim `INDEX_HIT`, `INDEX_HIT_AI_CACHE`, or Supabase freshness from this lane.
4. Do not publish Git→Z or restore Z→Git based only on modification time.
5. Do not treat generated manifest drift as equivalent to human-authored Bible drift.
6. Do not add allowlist entries merely to silence the MCP contract audit.
7. Do not rerun All Systems Go until `agent:preflight:app-builder-mcp` passes.
8. Do not stage unrelated runtime or artifact WIP with the rule-sync commit.
9. Do not set `W17_OPERATOR_APPROVED` or `MILESTONE_ADAPTIVE_DOCUMENT_DETAILS_IMPLEMENTATION_READY` without explicit operator action.
10. Do not describe ChatGPT acknowledgments as independent verification.

## 12. Seed packet candidates

### Seed candidate 1 — Generated sync hygiene

```json
{
  "seedId": "IH-THREAD-GENERATED-SYNC-CLEAN-TREE-V1",
  "kind": "failure-pattern",
  "title": "Generated rule synchronization can remain blocked until committed or reverted",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why does generated-bible-source-change fail immediately after a successful three-way rule sync?",
    "What should an agent verify and commit after sync:three-way-agent-rule changes generated copies?"
  ],
  "evidenceRefs": [
    "EVT-006",
    "EVT-007",
    "ED-001",
    "TW-003"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A narrow rule-sync gate passes but the aggregate suite gate fails on generated source-change or dirty-tree guards.",
    "startAt": "Inspect git status and restrict review to the expected generated rule-copy and manifest paths.",
    "runPreflight": [
      "git status --short",
      "git diff --check",
      "git diff -- <expected-paths>",
      "npm run check:three-way-agent-rule-sync",
      "npm run suite:contract-gate"
    ],
    "doNot": [
      "Do not stage unrelated artifact/runtime files.",
      "Do not claim the suite gate is repaired because the narrow sync gate passed."
    ],
    "proveBeforeClaiming": [
      "Expected files only",
      "Clean staged diff",
      "Dedicated commit or explicit revert",
      "Aggregate suite gate rerun from clean tree"
    ]
  }
}
```

### Seed candidate 2 — Bible drift authority decision

```json
{
  "seedId": "IH-THREAD-BIBLE-DRIFT-NO-MTIME-AUTHORITY-V1",
  "kind": "authority-decision",
  "title": "Never resolve Git versus mirror Bible drift by timestamp alone",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Should a newer Z: Application Bible file automatically replace Git canonical content?",
    "How should agents reconcile substantive Bible drift when mirror mtimes are newer than Git?"
  ],
  "evidenceRefs": [
    "EVT-008",
    "EVT-009",
    "HP-004",
    "HP-005"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "Git canonical and Z mirror hashes differ, especially when Z has newer mtimes.",
    "startAt": "Classify files into human-authored, generated, runtime-state, and mirror-only categories.",
    "runPreflight": [
      "Regenerate manifests and generated JSON where supported.",
      "Produce semantic diffs for remaining human-authored files.",
      "Confirm policy authority and provenance.",
      "Request explicit operator direction."
    ],
    "doNot": [
      "Do not overwrite either side based only on mtime.",
      "Do not delete mirror-only consumption packs.",
      "Do not call generated drift substantive authority drift without classification."
    ],
    "proveBeforeClaiming": [
      "Per-file hashes",
      "Per-file semantic summary",
      "Explicit operator direction",
      "Committed Git state before republish"
    ]
  }
}
```

### Seed candidate 3 — Audit posture versus failing assertion

```json
{
  "seedId": "IH-THREAD-CONTRACT-AUDIT-POSTURE-VS-FAILURE-V1",
  "kind": "lesson",
  "title": "Separate expected audit classification from the actual failed contract assertion",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Is CG-AppBuilder-MCP DOC_ONLY itself an MCP contract-audit failure?",
    "How should an agent identify the real blocker in a mixed policy-classification and assertion audit report?"
  ],
  "evidenceRefs": [
    "EVT-010",
    "HP-006",
    "OF-003"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "An audit output contains posture labels such as DOC_ONLY or PARTIAL alongside failed route or ownership checks.",
    "startAt": "Read the audit policy branch to determine whether the posture label is expected.",
    "runPreflight": [
      "Identify the exact failed assertion.",
      "List offending files and routes.",
      "Map each route to the owning runtime/service.",
      "Choose refactor or governed allowlist.",
      "Rerun contract audit."
    ],
    "doNot": [
      "Do not treat an expected posture label as the root cause.",
      "Do not add allowlist entries without ownership documentation and tests."
    ],
    "proveBeforeClaiming": [
      "Policy classification explained",
      "Failed assertion named",
      "Owning repo identified",
      "Audit rerun passes"
    ]
  }
}
```

### Seed candidate 4 — Formal-GO advancement boundary

```json
{
  "seedId": "IH-THREAD-FORMAL-GO-PREFLIGHT-FIRST-V1",
  "kind": "protocol-upgrade",
  "title": "Do not rerun All Systems Go while preflight remains blocked",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "When should All Systems Go be rerun during a formal-GO recovery mission?",
    "Which blocker classes must be closed before a clean parity state can become formal GO?"
  ],
  "evidenceRefs": [
    "EVT-011",
    "EVT-012",
    "HP-008",
    "ED-004"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "Remote parity is clean and one or more narrow gates pass, but preflight still reports authority, contract, database, or dirty-tree blockers.",
    "startAt": "Normalize blockers into hygiene, authority, architecture, shared-DB, and environment classes.",
    "runPreflight": [
      "Resolve clean-tree hygiene.",
      "Resolve authority direction.",
      "Repair contract ownership.",
      "Run shared-DB audit.",
      "Run agent preflight.",
      "Run All Systems Go only after preflight PASS."
    ],
    "doNot": [
      "Do not use All Systems Go as a substitute for unresolved preflight work.",
      "Do not claim GO from remote parity alone."
    ],
    "proveBeforeClaiming": [
      "agent:preflight PASS",
      "clean worktree",
      "authority drift resolved",
      "contract audit PASS",
      "shared-DB audit complete"
    ]
  }
}
```

## 13. Future-agent instructions

When a future agent encounters this mission class:

1. Treat user-pasted command output as evidence to verify, not as a live tool result.
2. Start with a clean status and parity snapshot.
3. Separate each gate into:
   - narrow check,
   - aggregate check,
   - policy classification,
   - failing assertion.
4. For generated synchronization:
   - verify expected changed paths,
   - inspect semantic diff,
   - commit or revert before rerunning aggregate gates.
5. For Bible divergence:
   - regenerate generated artifacts,
   - classify mirror-only paths,
   - summarize substantive diffs,
   - obtain explicit authority direction.
6. For shared-table contract failures:
   - identify the write owner,
   - prefer routing through the owner service,
   - allowlist only with explicit governance and tests.
7. Require preflight PASS before formal-GO rerun.
8. Preserve milestone boundaries. Operational tooling does not set operator approval.
9. Before creating any seed from this file, run the registry duplication lookup.
10. Cite the exact commit, gate, file, and verification command in closeout receipts.

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

## 15. Acceptance checklist

- [x] Mode declared as `DRAFT_FILE`
- [x] Mission and lane declared
- [x] Start and output verdicts declared
- [x] Retrieval state uses `INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT`
- [x] Thread event inventory included
- [x] Eight harvest packet kinds represented as applicable
- [x] Execution deltas included
- [x] Waste ledger included
- [x] Duplication detector included
- [x] Operator friction included
- [x] ROI backlog ranked
- [x] Do-not-advance guards included
- [x] Seed candidates included
- [x] Each seed contains at least two retrieval questions
- [x] Each seed contains evidence references
- [x] Each seed contains future-agent instructions
- [x] All seed statuses are `CANDIDATE`
- [x] Publication truth table states all layers `not-run`
- [x] No claim of `HARVEST_COMPLETE`
- [x] No claim of live `INDEX_HIT`
- [x] No claim of ChatGPT publication

## 16. Next operator action

Hand this findings file to Cursor and ingest it into a new harvest identity.

```text
Ingest ChatGPT thread autopsy findings per chat-thread-closeout-autopsy-harvest-chatgpt-v1.

npm run harvest:ingest-chatgpt-findings -- --input=<findings.md> --harvest-id=harvest-2026-08-05-formal-go-recovery-and-reconciliation-v1

Then run duplication-preflight, sync-derived, validate, validate-autopsy, test:harvest, and only after operator approval publish-intelligence-full.
```

Cursor validation chain:

```bash
npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-05-formal-go-recovery-and-reconciliation-v1
npm run harvest:sync-derived -- harvest-2026-08-05-formal-go-recovery-and-reconciliation-v1
npm run harvest:validate -- harvest-2026-08-05-formal-go-recovery-and-reconciliation-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-05-formal-go-recovery-and-reconciliation-v1
npm run test:harvest
# operator only:
npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-05-formal-go-recovery-and-reconciliation-v1
```
