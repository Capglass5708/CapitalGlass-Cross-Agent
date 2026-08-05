# ChatGPT Thread Autopsy Findings — Deterministic Harvest Move to L:

## 1. Final summary

```text
Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Start verdict: UNHARVESTED_THREAD
Target tier: T2
Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION
```

The thread began as a WESLEYDESK connectivity closeout and later shifted into a separate ChatGPT-harvest transport requirement. The durable operator intent was eventually clarified as: when findings land on GitHub branch `chat-gpt-harvest`, move them deterministically to the canonical L: staging location with minimal token and processing overhead. The thread contains repeated scope expansion by the assistant before the user corrected the target.

## 2. Harvest verdict and tier rationale

**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

**Tier:** T2 because the conversation crossed multiple operational lanes, contained repeated corrections, and produced a concrete automation pattern with branch, path, runner, and deterministic-move semantics.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

No live repository, cache, runner, L:, or publication state is asserted by ChatGPT. Pasted operational results are classified below as `USER_REPORTED_OPERATIONAL` or `CROSS_CHECK_CANDIDATE`.

## 4. Scope ledger

### Primary mission

Capture observed lessons from the thread, especially the corrected requirement for a low-token deterministic move from `chat-gpt-harvest` to L:.

### Closed lanes reported by user

- WESLEYDESK diagnostic and Repair 1 technical execution in the `cgremoteadmin` identity.
- Desk publication and harvest prompt extraction.
- Prompt-catalog compact trim implementation.
- L: draft staging implementation.
- GitHub Actions workflow and deterministic move tooling pushed to `chat-gpt-harvest`.

### Open lanes

- Wesley interactive-session validation for WESLEYDESK Repair 1.
- Repair 2 scheduled-task persistence and reboot validation.
- Fresh findings push to `chat-gpt-harvest` and workflow execution on WESLEYDESK.

### Unrelated follow-ups

- RYZEN9DESK cache fanout proof.
- Prompt catalog resolver, deferred until lookup demand exists.

### Deferred work

- T2 batch assessment and publication of staged ChatGPT drafts.

### Do-not-merge boundaries

- Do not merge WESLEYDESK repair status with ChatGPT-harvest transport status.
- Do not treat L: staging as Intelligence Hub authority or publication.
- Do not conflate RYZEN9DESK fanout with WESLEYDESK or ChatGPT branch processing.

## 5. Correction ledger

### COR-001

- **priorAssumption:** The next action should be T2 batch assessment and synthesis.
- **correction:** The user only wanted the ChatGPT branch harvest saved on L:.
- **correctedModel:** Transport/staging only; no assessment, synthesis, or publication.
- **affectedFindings:** EVT-010, HP-002, ED-001, ROI-001.
- **futurePrevention:** Restate the destination and operation before proposing downstream lifecycle work.

### COR-002

- **priorAssumption:** Save branch working copies to D: using Git worktrees.
- **correction:** Destination is L:, and the operation must be a deterministic move.
- **correctedModel:** Fixed L: path derived from the branch; move only; no timestamped destinations.
- **affectedFindings:** EVT-011, HP-003, ED-002, ROI-001.
- **futurePrevention:** Treat drive letters and copy-vs-move as hard constraints.

### COR-003

- **priorAssumption:** A descriptive multi-step instruction was acceptable.
- **correction:** The user wanted the lowest-token possible instruction: just a deterministic move.
- **correctedModel:** Minimal instruction and minimal runtime behavior.
- **affectedFindings:** EVT-012, HP-004, ED-003, OF-001.
- **futurePrevention:** Match response and implementation complexity to explicit token-budget preferences.

### COR-004

- **priorAssumption:** Fred might be the intended privileged operator context.
- **correction:** Wesley is the administrator; Fred is a user, but mapped drives remain session-bound.
- **correctedModel:** Administrative privilege does not eliminate per-user/per-session mapping boundaries.
- **affectedFindings:** EVT-006, HP-005.
- **futurePrevention:** Separate privilege level, active console identity, SSH identity, and mapped-drive visibility.

## 6. Thread event inventory

### EVT-001 — Multi-root WESLEYDESK diagnosis supplied

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- User reported Z: mapping persistence and SMB credential context as the dominant desk defect, with downstream WSL `/mnt/z` failure.

### EVT-002 — Repair 1 approved as smallest reversible repair

- **evidenceClass:** `CHAT_DIRECT`
- Assistant approved ForceRemap in Wesley context and held broader changes.

### EVT-003 — Desk closeout separated from RYZEN9DESK

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- User stated desk closeout was closed and RYZEN9DESK cache distribution was a separate target-host follow-up.

### EVT-004 — Repair 1 executed remotely with partial pass

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- User reported phantom Z: cleared, credentials restored, ForceRemap exit 0, L: and runner healthy, but `/mnt/z` unavailable in Wesley context.

### EVT-005 — Session-bound mapping model accepted

- **evidenceClass:** `CHAT_DIRECT`
- Thread converged on `REPAIR_1_PARTIAL_PASS`, with Wesley interactive validation required.

### EVT-006 — Administrator-versus-session confusion surfaced

- **evidenceClass:** `CHAT_DIRECT`
- User emphasized Wesley is admin and Fred is user; assistant clarified that mapping visibility follows identity and logon session, not merely administrator membership.

### EVT-007 — Prompt-catalog compact trim reported complete

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- User reported deterministic trimming, selection metadata, CI wiring, and passing gates.

### EVT-008 — L: ChatGPT draft staging reported complete

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Six drafts were reported staged with zero skipped, indexes and receipts written, and authority boundaries preserved.

### EVT-009 — Assistant proposed T2 batch assessment

- **evidenceClass:** `CHAT_DIRECT`
- This exceeded the operator's immediate request.

### EVT-010 — Operator narrowed goal to saving branch harvest on L:

- **evidenceClass:** `CHAT_DIRECT`
- User explicitly rejected the expanded assessment scope.

### EVT-011 — Destination corrected from D: to L: and copy corrected to move

- **evidenceClass:** `CHAT_DIRECT`
- User required a deterministic move to L:.

### EVT-012 — Token budget corrected

- **evidenceClass:** `CHAT_DIRECT`
- User requested the lowest-token possible instruction and only a deterministic move.

### EVT-013 — Push-triggered workflow requested

- **evidenceClass:** `CHAT_DIRECT`
- User asked whether the move could trigger once findings landed on the GitHub branch.

### EVT-014 — Self-hosted workflow cost discussed

- **evidenceClass:** `CROSS_CHECK_CANDIDATE`
- Assistant stated GitHub Actions usage on the existing self-hosted runner should not consume GitHub-hosted minutes; billing details require external verification.

### EVT-015 — Branch clear requested, then refined to safe clear

- **evidenceClass:** `CHAT_DIRECT`
- The final safe model preserved workflow/tooling and deleted only previous findings paths.

### EVT-016 — Workflow and tooling reported pushed

- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- User reported commit `749f617`, workflow path, move scripts, npm command, and successful local deterministic move proof.

### EVT-017 — Protocol file attached and run requested

- **evidenceClass:** `ATTACHMENT_SOURCE`
- The attached protocol requires OBSERVED-lane findings, mandatory push to `chat-gpt-harvest`, and no validation/publication claims.

## 7. Harvest packets

### HP-001 — Failure pattern: identity/session confusion

- **kind:** failure-pattern
- **evidenceClass:** `CHAT_DIRECT` + `USER_REPORTED_OPERATIONAL`
- Windows administrator rights were repeatedly at risk of being treated as equivalent to the active user/session that owns Z: and WSL visibility.

### HP-002 — Failure pattern: lifecycle overreach

- **kind:** failure-pattern
- **evidenceClass:** `CHAT_DIRECT`
- The assistant advanced from staging into T2 assessment and synthesis despite the operator asking only for persistence to L:.

### HP-003 — Protocol upgrade: immutable transport constraints

- **kind:** protocol-upgrade
- **evidenceClass:** `CHAT_DIRECT`
- Destination drive, source branch, operation type, and deterministic path must be captured as hard constraints before proposing implementation.

### HP-004 — Efficiency lesson: minimal command surface

- **kind:** lesson
- **evidenceClass:** `CHAT_DIRECT`
- When the operator says “as low token as possible,” output and automation should omit receipts, assessments, publishing, timestamps, and explanatory scope unless required for safety.

### HP-005 — Architecture pattern: branch push to self-hosted deterministic mover

- **kind:** architecture-pattern
- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Push to `chat-gpt-harvest` with findings path filters triggers a self-hosted WESLEYDESK WSL runner that moves files to a fixed L: directory.

### HP-006 — Idempotency pattern

- **kind:** reliability-pattern
- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- Reported re-run behavior was `0 moved` with PASS after sources were absent, demonstrating intended no-op idempotency.

### HP-007 — Authority boundary

- **kind:** governance
- **evidenceClass:** `USER_REPORTED_OPERATIONAL`
- L: staged files are intake copies/moves, not validated Scout truth, hub publication, or operational authority.

### HP-008 — Workflow survivability requirement

- **kind:** operational-guard
- **evidenceClass:** `CHAT_DIRECT` + `USER_REPORTED_OPERATIONAL`
- Clearing the branch must preserve the workflow and move tooling, or the next push will not trigger the move.

## 8. Execution deltas

### ED-001

- **actual:** Assistant proposed T2 batch assessment immediately after staging.
- **optimal:** Confirm staging-only completion and stop.
- **evidenceClass:** `CHAT_DIRECT`

### ED-002

- **actual:** Assistant proposed D: worktrees.
- **optimal:** Preserve L: as canonical destination and implement a move from the findings branch.
- **evidenceClass:** `CHAT_DIRECT`

### ED-003

- **actual:** Assistant produced a detailed move contract after user requested simplicity.
- **optimal:** One sentence: deterministically move branch findings to the fixed L: path.
- **evidenceClass:** `CHAT_DIRECT`

### ED-004

- **actual:** Early responses repeatedly introduced optional next work.
- **optimal:** Close the stated lane before naming optional follow-ups.
- **evidenceClass:** `CHAT_DIRECT`

## 9. Waste ledger

### TW-001 — Unrequested assessment scope

- T2 assessment, synthesis, validation, and publication language consumed attention after staging had already satisfied the requested persistence goal.

### TW-002 — Wrong destination proposal

- D: worktree guidance was unrelated to the desired L: deterministic move.

### TW-003 — Repeated restatement

- Multiple turns restated status models and acceptance gates rather than converging immediately on the operator's minimal transport requirement.

## 10. Duplication detector

### DUP-001

- **classification:** `REPEATED_DISCUSSION`
- The distinction between staging, assessment, validation, and publication was revisited after the operator had narrowed the requirement to storage only.

### DUP-002

- **classification:** `FALSE_DUPLICATE_DIFFERENT_HOST_OR_CONTEXT`
- WESLEYDESK Z:/WSL persistence and RYZEN9DESK cache fanout were distinct despite sharing drive/cache terminology.

### DUP-003

- **classification:** `INTENTIONALLY_DEFERRED`
- `prompt-catalog-resolve.mjs` remained deferred pending concrete lookup demand.

### DUP-004

- **classification:** `POSSIBLE_EXISTING_IMPLEMENTATION`
- The reported workflow and move scripts must be verified by Cursor before further implementation to avoid duplicating already-pushed tooling.

## 11. Operator friction

### OF-001 — Excess tokens and scope

The operator repeatedly used emphatic corrections because responses expanded beyond the requested action.

### OF-002 — Ambiguous verb semantics

“Save,” “copy,” “stage,” and “move” were treated as interchangeable until the operator specified deterministic move.

### OF-003 — Host/session terminology

Admin identity, active console user, SSH user, Windows session, and WSL user created avoidable confusion.

### OF-004 — Branch reset hazard

A full clear could remove the workflow required to process the next push.

## 12. ROI backlog

1. **ROI-001 — Constraint lock before solutioning**  
   Capture `{source branch, source paths, operation, destination, trigger, forbidden work}` in one compact contract before proposing steps.
2. **ROI-002 — Minimal deterministic mover**  
   Keep runtime to path-filtered trigger plus one idempotent move command on the self-hosted L:-capable runner.
3. **ROI-003 — Session-aware Windows diagnostics**  
   Always record console user, invoking user, task identity, elevation token, and WSL owner before evaluating mapped drives.
4. **ROI-004 — Safe branch reset**  
   Delete only findings payloads while preserving workflow and tooling.
5. **ROI-005 — Lane closure discipline**  
   Stop after the requested gate passes; present downstream lifecycle work only when asked.

## 13. Do-not-advance guards

- Do not run assessment, synthesis, validation, or publication as part of the move workflow.
- Do not move to D:.
- Do not use timestamped destination folders for the branch root.
- Do not delete `.github/workflows/chatgpt-harvest-move-to-l.yml` during branch cleanup.
- Do not claim L: or runner success from ChatGPT without external evidence.
- Do not claim `HARVEST_COMPLETE`, `OPERATIONAL`, or `FULLY_SEEDED`.
- Do not push to `main`.

## 14. Seed packet candidates

```json
{
  "seedId": "IH-THREAD-DETERMINISTIC-TRANSPORT-CONSTRAINT-LOCK",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How should an agent lock source, destination, operation type, and trigger before implementing branch artifact transport?",
    "What prevents copy, assessment, or publication scope from leaking into a move-only request?"
  ],
  "evidenceRefs": [
    {"ref": "COR-001", "classification": "CHAT_DIRECT"},
    {"ref": "COR-002", "classification": "CHAT_DIRECT"},
    {"ref": "COR-003", "classification": "CHAT_DIRECT"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "Operator requests artifact transport with named branch or drive",
    "startAt": "Extract a six-field immutable transport contract",
    "runPreflight": "Confirm move versus copy and fixed versus timestamped destination",
    "doNot": "Add lifecycle steps not requested",
    "proveBeforeClaiming": "Verify destination and source-removal semantics"
  }
}
```

```json
{
  "seedId": "IH-THREAD-LOW-TOKEN-DETERMINISTIC-MOVER",
  "kind": "lesson",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "What is the minimum workflow needed to move branch findings to an L drive on push?",
    "How should an idempotent move report success when no source files remain?"
  ],
  "evidenceRefs": [
    {"ref": "EVT-012", "classification": "CHAT_DIRECT"},
    {"ref": "EVT-016", "classification": "USER_REPORTED_OPERATIONAL"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "Operator explicitly prioritizes low token or minimal processing",
    "startAt": "Use one path-filtered trigger and one move command",
    "runPreflight": "Check runner has destination drive mounted",
    "doNot": "Add artifact uploads, assessment, publication, or timestamp generation",
    "proveBeforeClaiming": "Check fixed destination and idempotent no-op rerun"
  }
}
```

```json
{
  "seedId": "IH-THREAD-WINDOWS-MAPPED-DRIVE-SESSION-BOUNDARY",
  "kind": "failure-pattern",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why can an administrator fail to expose a mapped drive to another interactive Windows session?",
    "Which identities must be tested before claiming a Windows drive is visible in WSL?"
  ],
  "evidenceRefs": [
    {"ref": "EVT-004", "classification": "USER_REPORTED_OPERATIONAL"},
    {"ref": "EVT-006", "classification": "CHAT_DIRECT"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "Mapped drive works over SSH but not console or WSL",
    "startAt": "Inventory console, SSH, task, elevation, and WSL identities",
    "runPreflight": "Test mapping and WSL launch from the intended interactive session",
    "doNot": "Equate administrator membership with shared drive-letter visibility",
    "proveBeforeClaiming": "Validate in the intended user's logon session after reboot"
  }
}
```

## 15. Future-agent instructions

1. Read the latest operator sentence as the controlling scope.
2. Lock hard constraints before proposing implementation.
3. For this lane, use only:
   - branch: `chat-gpt-harvest`
   - trigger: push with findings path filters
   - runner: self-hosted WESLEYDESK WSL with L: mounted
   - operation: deterministic move
   - destination: `/mnt/l/02-catalog/chatgpt-draft-staging/chat-gpt-harvest/`
4. Treat all reported commits, tests, receipts, and runner states as cross-check candidates until verified.
5. Do not reopen batch assessment or publication unless the operator asks.

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

- [x] OBSERVED lane only
- [x] Retrieval block uses `INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT`
- [x] Scope ledger included
- [x] Correction ledger included
- [x] Event inventory includes evidence classifications
- [x] Eight harvest packet kinds included as applicable
- [x] Execution deltas included
- [x] Waste ledger included
- [x] Duplication detector included
- [x] Operator friction included
- [x] ROI backlog ranked
- [x] Top three ROI themes have candidate seed packets
- [x] Publication truth remains entirely `not-run`
- [x] No `HARVEST_COMPLETE`, `OPERATIONAL`, or `FULLY_SEEDED` claim

## 18. Next operator action

Cursor should pull `chat-gpt-harvest`, verify this findings file, then run the standard ingest and validation chain only when the operator wants T2 processing. The deterministic move workflow itself must remain transport-only.

## 19. Cursor ingest command

```bash
npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-05-chatgpt-deterministic-l-move-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-05-chatgpt-deterministic-l-move-v1
```

Then Cursor may run duplication preflight and validation. Publication remains operator-controlled.
