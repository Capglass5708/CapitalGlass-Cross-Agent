# ChatGPT Findings Source — L: Harvest Runner Recovery

## 1. Final summary

```text
Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Start verdict: UNHARVESTED_THREAD
Target tier: T2
Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION
```

This thread established that the ChatGPT findings-to-L: pipeline already existed and was correctly registered, but failed operationally because the self-hosted runner lived inside a stopped WSL distribution on WESLEYDESK. The durable lesson is to distinguish indexed configuration from live execution health: an `INDEX_HIT_AI_CACHE` can correctly describe a workflow and runner while the execution layer is unavailable. The immediate recovery was to wake WSL and rerun the cancelled workflow; the durable repair is reliable WSL autostart/watchdog behavior plus stable drive initialization.

Evidence basis: visible conversation and the attached ChatGPT autopsy protocol. Operational results pasted by the operator are classified as `USER_REPORTED_OPERATIONAL`; runner, workflow, file, receipt, and L: path claims remain `CROSS_CHECK_CANDIDATE` until Cursor validates them.

## 2. Harvest verdict and tier rationale

**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

**Tier:** T2

Rationale: the thread contains a material correction to the initial diagnosis, a verified recovery sequence, a backlog move, and a durable infrastructure lesson about self-hosted runners inside WSL. It is narrower than the earlier North Star lifecycle harvest but distinct enough to retain as an operational failure/recovery pattern.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

No `INDEX_HIT`, `INDEX_HIT_AI_CACHE`, `FAILOVER_SUPABASE`, `HARVEST_COMPLETE`, `OPERATIONAL`, or `FULLY_SEEDED` claim is made by ChatGPT.

## 4. Scope ledger

### Primary mission

Compress the observed failure and recovery of the ChatGPT harvest move-to-L pipeline into reusable intelligence.

### Closed lanes reported in the thread

- ChatGPT findings were committed to `chat-gpt-harvest`.
- The existing GitHub Action was identified.
- WESLEYDESK was reachable.
- Ubuntu-24.04 WSL was found stopped.
- WSL was started and the runner reconnected.
- Workflow run `31021280032` completed successfully.
- Eleven pending ChatGPT drafts were reported moved to L:, including the North Star findings.
- Retrieval by harvest ID was reported successful.

Classification: `USER_REPORTED_OPERATIONAL` / `CROSS_CHECK_CANDIDATE`.

### Open lane

- Repair WESLEYDESK watchdog/autostart reliability so WSL wakes after reboot, sleep, or idle stop without manual intervention.
- Repair Z:/drive initialization persistence where it interferes with scheduled recovery.
- Optionally add `workflow_dispatch` to the workflow for clean manual triggering.

### Unrelated follow-ups

- North Star lifecycle deployment and merge verification.
- Other estate-wide registry backfill work.

### Do-not-merge boundaries

- Do not replace the existing harvest workflow merely because the runner was offline.
- Do not treat index configuration as proof of live execution.
- Do not claim L: publication based only on a queued workflow.
- Do not hand-edit L: receipts to bypass the move pipeline.

## 5. Correction ledger

### COR-001 — Missing automation was the wrong diagnosis

- **priorAssumption:** No GitHub Action existed to move ChatGPT findings to L:.
- **correction:** The workflow existed; the registered self-hosted runner was offline because Ubuntu-24.04 WSL on WESLEYDESK was stopped.
- **correctedModel:** Workflow presence, runner registration, host reachability, and live listener state are separate gates.
- **affectedFindings:** EVT-001, HP-001, ED-001, ROI-001.
- **futurePrevention:** Inspect workflow existence, runner registration, host reachability, WSL state, listener state, and queue state in that order before proposing new automation.
- **evidenceRef:** operator live diagnostic report — `USER_REPORTED_OPERATIONAL`.

### COR-002 — `gh workflow run` was not available

- **priorAssumption:** The move workflow could be manually dispatched with `gh workflow run`.
- **correction:** The workflow lacked `workflow_dispatch`; the cancelled run was restarted with `gh run rerun 31021280032` after waking WSL.
- **correctedModel:** Manual trigger method depends on workflow triggers; rerun is available for an existing cancelled run, while `workflow_dispatch` must be declared explicitly.
- **affectedFindings:** EVT-004, HP-003, ROI-003.
- **futurePrevention:** Inspect workflow triggers before prescribing a CLI invocation.
- **evidenceRef:** operator proof report — `USER_REPORTED_OPERATIONAL`.

## 6. Thread event inventory

### EVT-001 — Existing move-to-L automation was initially mistaken as absent

- ChatGPT initially inferred that a missing push-triggered action caused the findings to stop at Git.
- The operator later showed that the workflow and runner registration already existed.
- **Evidence classification:** `CHAT_DIRECT` and `USER_REPORTED_OPERATIONAL`.
- **futureEfficiencyImpact:** Future responders should verify each execution layer before designing replacement automation.

### EVT-002 — WSL dormancy caused the runner outage

- WESLEYDESK was reachable, but Ubuntu-24.04 was stopped, so `Runner.Listener` was not running and GitHub reported the runner offline.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL` / `CROSS_CHECK_CANDIDATE`.
- **futureEfficiencyImpact:** A single WSL-state probe can avoid hours of workflow and registration investigation.

### EVT-003 — Watchdog failure prevented autonomous recovery

- The scheduled watchdog reportedly returned `4294967295` and did not wake WSL.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL` / `CROSS_CHECK_CANDIDATE`.
- **futureEfficiencyImpact:** Monitoring the watchdog result provides an earlier, cheaper signal than waiting for queued GitHub jobs.

### EVT-004 — Recovery succeeded after waking WSL and rerunning the cancelled job

- After WSL started, the runner logged “Connected to GitHub,” and run `31021280032` completed successfully in 16 seconds.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL` / `CROSS_CHECK_CANDIDATE`.

### EVT-005 — Backlog synchronization moved eleven drafts

- The desk-side move reportedly transferred eleven pending ChatGPT drafts to L:, including the North Star findings.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL` / `CROSS_CHECK_CANDIDATE`.

### EVT-006 — North Star findings became retrievable from L:

- The canonical L: and WSL paths were reported present, with a receipt hash and successful retrieval by harvest ID.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL` / `CROSS_CHECK_CANDIDATE`.

### EVT-007 — Layer alignment drift was correctly interpreted

- The index correctly described the workflow and runner, while the execution layer was unavailable because WSL was dormant.
- **Evidence classification:** `CHAT_DIRECT` and `USER_REPORTED_OPERATIONAL`.
- **futureEfficiencyImpact:** Separating knowledge-layer truth from runtime-layer truth prevents false configuration fixes.

## 7. Harvest packets

### HP-001 — Failure pattern: registered self-hosted runner inside dormant WSL

- **Kind:** failure-pattern
- A Windows host may be reachable while the GitHub runner is offline because the runner process lives inside a stopped WSL distribution.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL` / `CROSS_CHECK_CANDIDATE`.
- **Durable:** yes, pending estate verification.

### HP-002 — Debugging heuristic: inspect execution layers in order

- **Kind:** lesson
- Check workflow existence → runner registration → host reachability → WSL state → listener service → queued run.
- **Evidence classification:** `CHAT_DIRECT` and `USER_REPORTED_OPERATIONAL`.
- **Durable:** yes.
- **futureEfficiencyImpact:** This sequence reduces unnecessary workflow redesign and narrows root cause quickly.

### HP-003 — Operator recovery pattern: wake WSL, then rerun existing job

- **Kind:** lesson
- When a run already exists and the workflow lacks `workflow_dispatch`, wake the runner and rerun the cancelled workflow run instead of attempting a nonexistent manual dispatch.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL`.
- **Durable:** yes, subject to CLI verification.

### HP-004 — Validation rule: L: storage requires path and retrieval proof

- **Kind:** validation-rule
- A successful workflow conclusion is not enough; verify the canonical L: path, receipt entry, hash, and retrieval by harvest ID.
- **Evidence classification:** `CHAT_DIRECT` and `USER_REPORTED_OPERATIONAL`.
- **Durable:** yes.

## 8. Execution deltas

### ED-001 — Actual vs optimal: proposed new workflow before checking runner liveness

- **Actual:** The response recommended creating a new workflow and self-hosted runner integration.
- **Optimal:** Verify existing workflow, runner registration, host reachability, WSL state, and listener status first.
- **Evidence classification:** `CHAT_DIRECT`.
- **Reusable lesson:** Missing execution does not imply missing automation.

### ED-002 — Actual vs optimal: manual trigger command assumed unsupported trigger

- **Actual:** `gh workflow run` was recommended.
- **Optimal:** Inspect the workflow YAML; use `gh run rerun` for an existing cancelled run or add `workflow_dispatch` in a separate change.
- **Evidence classification:** `CHAT_DIRECT` and `USER_REPORTED_OPERATIONAL`.

### ED-003 — Actual vs optimal: pipeline success was only complete after retrieval proof

- **Actual:** Initial discussion focused on whether the action ran.
- **Optimal:** Treat path existence, receipt hash, and retrieval by harvest ID as the closeout gate.
- **Evidence classification:** `CHAT_DIRECT`.

## 9. Waste ledger

### TW-001 — Unnecessary automation redesign

- The thread spent effort specifying a new workflow even though the existing workflow was present.
- **Evidence classification:** `CHAT_DIRECT`.
- **Cost:** prompt tokens, design time, and risk of duplicate automation.
- **Prevention:** Run the layered execution diagnostic before proposing architecture changes.

### TW-002 — Queue delay hidden behind offline runner state

- Jobs reportedly sat pending for hours because WSL was dormant and the watchdog failed.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL`.
- **Cost:** delayed ingestion and accumulated backlog.
- **Prevention:** runner-offline alerting and watchdog health verification.

## 10. Duplication detector

### DUP-001

- **Classification:** `POSSIBLE_EXISTING_HARVEST`
- The broader North Star lifecycle thread was already harvested as `harvest-2026-08-05-north-star-lifecycle-thread-v1`.
- This draft should remain limited to the distinct L:-move runner failure and recovery pattern.
- **Action:** `NEEDS_REGISTRY_LOOKUP_FIRST` before creating overlapping North Star seeds.
- **Evidence classification:** `CHAT_DIRECT`.

### DUP-002

- **Classification:** `POSSIBLE_EXISTING_IMPLEMENTATION`
- Runner autostart/watchdog scripts and estate diagnostics were reported to already exist.
- **Action:** Validate and repair existing scripts before creating replacements.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL` / `CROSS_CHECK_CANDIDATE`.

## 11. Operator friction

### OF-001 — Operator expected Git push to trigger L: delivery automatically

- The operator’s intended completion point was durable storage on L:, after which another application could process the findings.
- **Evidence classification:** `CHAT_DIRECT`.
- **Preference:** Treat Git commit as the trigger, not the final outcome; report L: delivery proof when available.

### OF-002 — Operator prefers root-cause correction over speculative redesign

- The operator supplied live diagnostics and corrected the automation diagnosis.
- **Evidence classification:** `CHAT_DIRECT`.
- **Preference:** Verify existing estate mechanisms before proposing new components.

## 12. ROI backlog

### ROI-001 — Layered self-hosted-runner diagnostic gate

- **Rank:** 1
- **improvementType:** `debugging_heuristic`
- **Why:** The thread showed that workflow and registration were valid while WSL dormancy caused the outage.
- **Evidence classification:** `CHAT_DIRECT` and `USER_REPORTED_OPERATIONAL`.

```json
{
  "futureSavings": {
    "tokenSavingsEstimate": "high",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 6,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["repository_retrieval", "debugging", "deployment"],
    "futureEfficiencyImpact": "A fixed workflow→registration→host→WSL→listener→queue diagnostic avoids duplicate workflow design and isolates dormant-runner failures quickly."
  },
  "optimalFutureWorkflow": [
    "1. Confirm the workflow file and trigger exist.",
    "2. Confirm the runner registration and labels.",
    "3. Confirm the host is reachable.",
    "4. Check WSL distribution state.",
    "5. Check Runner.Listener/service state.",
    "6. Wake WSL, rerun the existing job, and verify L: retrieval."
  ]
}
```

### ROI-002 — Runner watchdog health receipt and alert

- **Rank:** 2
- **improvementType:** `automation_concept`
- **Why:** The watchdog reportedly failed silently, allowing jobs to queue until manual diagnosis.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL` / `CROSS_CHECK_CANDIDATE`.

```json
{
  "futureSavings": {
    "tokenSavingsEstimate": "medium",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 5,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": false,
    "appliesTo": ["debugging", "deployment"],
    "futureEfficiencyImpact": "A watchdog receipt and offline alert turns a hidden dormant-runner failure into an immediate actionable signal."
  },
  "optimalFutureWorkflow": [
    "1. Run the WSL wake watchdog on schedule and at startup.",
    "2. Record last result, WSL state, and runner connectivity.",
    "3. Alert when the runner remains offline beyond the threshold.",
    "4. Verify drive initialization separately from runner startup.",
    "5. Prove recovery after reboot without manual SSH."
  ]
}
```

### ROI-003 — Add manual dispatch to move-to-L workflow

- **Rank:** 3
- **improvementType:** `tool_order_optimization`
- **Why:** The workflow could not be started with `gh workflow run`; recovery depended on rerunning a prior cancelled run.
- **Evidence classification:** `USER_REPORTED_OPERATIONAL` / `CROSS_CHECK_CANDIDATE`.

```json
{
  "futureSavings": {
    "tokenSavingsEstimate": "low",
    "timeSavingsEstimate": "medium",
    "toolCallsAvoided": 2,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": false,
    "appliesTo": ["deployment"],
    "futureEfficiencyImpact": "A declared workflow_dispatch trigger gives operators a clean recovery path after waking the runner without relying on an existing cancelled run."
  },
  "optimalFutureWorkflow": [
    "1. Wake or verify the self-hosted runner.",
    "2. Dispatch the move-to-L workflow explicitly.",
    "3. Verify deterministic move receipt.",
    "4. Confirm L: path and retrieval by harvest ID."
  ]
}
```

## 13. Do-not-advance guards

- Do not create a second move-to-L workflow until the existing workflow is verified insufficient.
- Do not claim runner health from registration alone.
- Do not claim workflow success while the job is queued.
- Do not claim L: completion without canonical path, receipt, and retrieval proof.
- Do not classify an index hit as live execution proof.
- Do not claim the watchdog repair complete until reboot/sleep recovery is demonstrated without manual SSH.

## 14. Seed packet candidates

### Seed candidate 1

```json
{
  "seedId": "IH-THREAD-WSL-RUNNER-DORMANCY-DIAGNOSTIC-V1",
  "kind": "failure-pattern",
  "improvementType": "debugging_heuristic",
  "status": "CANDIDATE",
  "futureSavings": {
    "tokenSavingsEstimate": "high",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 6,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["debugging", "deployment"],
    "futureEfficiencyImpact": "Future agents can distinguish missing automation from a dormant WSL-hosted listener before proposing architectural changes."
  },
  "optimalFutureWorkflow": [
    "1. Verify workflow and runner registration.",
    "2. Verify host reachability.",
    "3. Inspect WSL state and listener service.",
    "4. Wake WSL and rerun the queued/cancelled job.",
    "5. Verify destination retrieval."
  ],
  "retrievalQuestions": [
    "Why is a self-hosted GitHub runner offline while the Windows host is reachable?",
    "How do I diagnose a GitHub Actions runner installed inside WSL?",
    "Why are harvest jobs queued even though the runner is registered?"
  ],
  "evidenceRefs": [
    {
      "ref": "operator WESLEYDESK live diagnostic and workflow proof report",
      "classification": "USER_REPORTED_OPERATIONAL"
    },
    {
      "ref": "visible correction from missing-workflow diagnosis to WSL dormancy",
      "classification": "CHAT_DIRECT"
    }
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A self-hosted runner is offline or jobs remain queued while the host is reachable.",
    "startAt": "Check WSL distribution state before editing workflow or runner registration.",
    "runPreflight": "Verify workflow, registration, host, WSL, listener, and queue layers.",
    "doNot": "Create duplicate automation or re-register the runner before proving the listener is absent for another reason.",
    "proveBeforeClaiming": "Runner online, workflow completed, destination receipt exists, and retrieval succeeds."
  }
}
```

### Seed candidate 2

```json
{
  "seedId": "IH-THREAD-HARVEST-L-DELIVERY-CLOSEOUT-GATE-V1",
  "kind": "protocol-upgrade",
  "improvementType": "validation_rule",
  "status": "CANDIDATE",
  "futureSavings": {
    "tokenSavingsEstimate": "medium",
    "timeSavingsEstimate": "medium",
    "toolCallsAvoided": 3,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": false,
    "appliesTo": ["testing", "deployment"],
    "futureEfficiencyImpact": "A standard closeout gate prevents treating Git push or workflow completion as equivalent to durable, retrievable L: storage."
  },
  "optimalFutureWorkflow": [
    "1. Commit findings to chat-gpt-harvest.",
    "2. Confirm the move workflow ran on the self-hosted runner.",
    "3. Verify the canonical L: path and receipt hash.",
    "4. Retrieve by harvest ID.",
    "5. Report delivery complete and stop."
  ],
  "retrievalQuestions": [
    "How do I prove ChatGPT findings reached the L: Intelligence Hub?",
    "What is the closeout gate for the ChatGPT harvest move-to-L workflow?"
  ],
  "evidenceRefs": [
    {
      "ref": "operator-stated goal that L: storage is the completion point",
      "classification": "CHAT_DIRECT"
    },
    {
      "ref": "reported North Star L: path, receipt hash, and retrieval proof",
      "classification": "USER_REPORTED_OPERATIONAL"
    }
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A findings file was pushed and an operator asks whether ingestion is complete.",
    "startAt": "Check the move workflow and destination receipt.",
    "runPreflight": "Verify runner online, workflow success, canonical path, receipt hash, and retrieval by harvest ID.",
    "doNot": "Stop at Git commit or queued workflow status.",
    "proveBeforeClaiming": "The file is present on L: and retrievable by harvest ID."
  }
}
```

## 15. Future-agent instructions

1. Treat index/cache retrieval as configuration context, not live runner proof.
2. When a self-hosted runner is offline, check whether it lives inside WSL.
3. Verify WSL state before editing runner registration or workflow files.
4. Distinguish Windows host reachability from Linux listener availability.
5. Verify workflow triggers before recommending `gh workflow run`.
6. Use `gh run rerun` only when an existing run can be retried.
7. Close the harvest move only after canonical L: path, receipt, and retrieval proof.
8. Repair existing watchdog/autostart mechanisms before adding replacements.
9. Keep drive initialization failures separate from runner listener diagnosis, but test their interaction during headless startup.
10. Stop after durable L: storage is proven; downstream apps own later processing.

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
- [x] CHAT_CONTEXT_ONLY evidence boundary maintained.
- [x] Operational claims labeled as user-reported or cross-check candidates.
- [x] Correction ledger overrides the initial missing-workflow diagnosis.
- [x] Findings limited to the distinct runner/L:-delivery pattern.
- [x] Waste and duplication recorded without inflating scope.
- [x] ROI items are thread-grounded.
- [x] Candidate seeds remain `CANDIDATE`.
- [x] No `HARVEST_COMPLETE`, `OPERATIONAL`, or `FULLY_SEEDED` claim.
- [x] Publication layers remain `not-run`.

## 18. Next operator action

Cursor should pull `chat-gpt-harvest`, ingest this findings file, run duplication preflight, validate the autopsy, and allow the existing move-to-L workflow to stage the validated draft for downstream applications.

```bash
npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-05-chatgpt-l-drive-runner-recovery-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-05-chatgpt-l-drive-runner-recovery-v1

npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-05-chatgpt-l-drive-runner-recovery-v1
npm run harvest:sync-derived -- harvest-2026-08-05-chatgpt-l-drive-runner-recovery-v1
npm run harvest:validate -- harvest-2026-08-05-chatgpt-l-drive-runner-recovery-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-05-chatgpt-l-drive-runner-recovery-v1
npm run test:harvest
```

## 19. Git push record

```text
Repo: Capglass5708/CapitalGlass-Cross-Agent
Branch: chat-gpt-harvest
File: artifacts/agent-runs/harvest-2026-08-05-chatgpt-l-drive-runner-recovery-v1/chatgpt-findings-source.md
Commit message: harvest(chatgpt): draft findings harvest-2026-08-05-chatgpt-l-drive-runner-recovery-v1
```
