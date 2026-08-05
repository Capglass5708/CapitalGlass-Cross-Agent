# ChatGPT Findings Source — Branch Creation and Protocol Push Closeout

## 1. Final summary

```text
Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Mode: DRAFT_FILE
Start verdict: UNHARVESTED_THREAD
Target tier: T2
Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION
Intelligence kind: OBSERVED
```

This thread established the dedicated Git branch `chat-gpt-harvest`, clarified that the requested spaced branch name must be represented with hyphens, reviewed the repository protocol copies, identified that the GitHub copies were stale relative to the operator-reported local/Z copy, and then executed the attached ChatGPT closeout-autopsy protocol by writing and pushing this findings file to the dedicated branch.

## 2. Harvest verdict and tier rationale

**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

**Tier:** T2

Rationale: the thread contains a branch-creation action, a correction from a spaced to a hyphenated branch name, a user-reported protocol synchronization, GitHub verification showing stale repository copies, an explicit operational handoff, and a final attached protocol that changes the required ChatGPT closeout behavior. These are durable process and validation lessons, but no Cursor ingest, duplication-preflight, validation, publication, or merge was run here.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

No live Intelligence Hub retrieval command was executed. The user-provided `Retrieval: INDEX_HIT_AI_CACHE` statement is recorded only as `USER_REPORTED_OPERATIONAL` and is not adopted as a verified retrieval result.

## 4. Scope ledger

- **Primary mission:** create and use the dedicated ChatGPT harvest branch, then execute the attached OBSERVED closeout-autopsy protocol.
- **Closed lanes:** branch creation; branch-name normalization; GitHub inspection of two protocol copies; creation and push of this findings file.
- **Open lanes:** Cursor ingest; duplication-preflight; derived sync; autopsy validation; test suite; publication; merge decision.
- **Unrelated follow-ups:** none.
- **Deferred work:** syncing the updated protocol content itself into both repository protocol paths remains separate from this findings commit unless already performed by another actor.
- **Do-not-merge boundary:** do not merge `chat-gpt-harvest` to `main` from ChatGPT.

## 5. Correction ledger

### COR-001

- **priorAssumption:** the requested branch could be named `chat gpt harvest` with spaces.
- **correction:** the branch was created as `chat-gpt-harvest`.
- **correctedModel:** use the hyphenated branch name consistently in documentation, commits, pushes, and Cursor handoffs.
- **affectedFindings:** EVT-001, HP-001, ROI-001, SEED-001.
- **futurePrevention:** normalize proposed branch names before creation and echo the exact created ref in the same response.

### COR-002

- **priorAssumption:** ChatGPT could only draft findings and hand them to Cursor.
- **correction:** the attached source-authority protocol states that `DRAFT_FILE` includes committing and pushing findings to `chat-gpt-harvest` when GitHub access is available.
- **correctedModel:** a ChatGPT DRAFT_FILE closeout is incomplete until push, SHA reporting, and Cursor ingest handoff are provided.
- **affectedFindings:** EVT-006, HP-004, ED-002, ROI-002, SEED-002.
- **futurePrevention:** read the attached protocol's execution-mode and mandatory-push sections before beginning output.

## 6. Thread event inventory

| ID | Event | Evidence class | Durable lesson | futureEfficiencyImpact |
| --- | --- | --- | --- | --- |
| EVT-001 | User requested a branch named “chat gpt harvest” on the Cross-Agent repo. | CHAT_DIRECT | User intent may require Git-safe normalization. | Normalizing once avoids failed branch commands and later documentation drift. |
| EVT-002 | GitHub repository `Capglass5708/CapitalGlass-Cross-Agent` was resolved with `main` as default. | CROSS_CHECK_CANDIDATE | Resolve exact repo identity and default branch before mutation. | Prevents writes to similarly named repositories or wrong bases. |
| EVT-003 | Branch `chat-gpt-harvest` was created. | CROSS_CHECK_CANDIDATE | Report the actual branch ref, not the user's informal phrasing. | Reduces downstream checkout and push errors. |
| EVT-004 | User reported updating the Z operator copy and two repository protocol copies with mandatory push instructions. | USER_REPORTED_OPERATIONAL | Local/operator state must not be treated as repository state without verification. | Avoids false completion claims and duplicate manual debugging. |
| EVT-005 | GitHub inspection showed both repository protocol copies still contained the older text. | CROSS_CHECK_CANDIDATE | Compare remote branch contents before saying a sync or commit exists. | Replaces assumption with one targeted fetch per file. |
| EVT-006 | User attached the updated source-authority protocol and commanded “RUN THIS FILE.” | CHAT_DIRECT + ATTACHMENT_SOURCE | Attached protocol overrides earlier conversational assumptions. | Prevents following stale operating rules and eliminates correction cycles. |
| EVT-007 | The protocol requires a complete findings file, commit to `chat-gpt-harvest`, SHA report, and Cursor ingest handoff. | ATTACHMENT_SOURCE | DRAFT_FILE has an operational Git closeout, not chat-only delivery. | Makes handoff atomic and removes manual copy/paste ambiguity. |
| EVT-008 | This findings file was written directly to the required branch and path. | CROSS_CHECK_CANDIDATE | Use the connected GitHub write path when available. | Avoids operator-side file creation and reduces branch drift. |

## 7. Harvest packets

### HP-001 — lesson

- **Evidence:** EVT-001 to EVT-003
- **Classification:** CHAT_DIRECT + CROSS_CHECK_CANDIDATE
- **Finding:** branch names requested in prose should be normalized to a Git-safe canonical ref and immediately reflected back to the operator.
- **Durable:** yes
- **futureEfficiencyImpact:** prevents repeated checkout/push failures and mismatched documentation.

### HP-002 — failure-pattern

- **Evidence:** EVT-004 to EVT-005
- **Classification:** USER_REPORTED_OPERATIONAL + CROSS_CHECK_CANDIDATE
- **Finding:** treating local/Z edits as already present on GitHub produces false sync assumptions.
- **Durable:** yes
- **futureEfficiencyImpact:** one remote file fetch is cheaper than planning or committing against stale assumptions.

### HP-003 — protocol-upgrade

- **Evidence:** EVT-006 to EVT-007
- **Classification:** ATTACHMENT_SOURCE
- **Finding:** `DRAFT_FILE` now includes mandatory commit and push to `chat-gpt-harvest`, plus SHA/path reporting and Cursor ingest handoff.
- **Durable:** yes
- **futureEfficiencyImpact:** creates a deterministic closeout contract across ChatGPT and Cursor.

### HP-004 — operator-preference

- **Evidence:** user repeatedly emphasized the dedicated branch and mandatory push closeout.
- **Classification:** CHAT_DIRECT
- **Finding:** the operator expects ChatGPT to execute repository writes when GitHub is connected rather than merely print manual commands.
- **Durable:** yes
- **futureEfficiencyImpact:** avoids unnecessary operator intervention and duplicated command execution.

### HP-005 — validation-rule

- **Evidence:** protocol prohibitions and publication table.
- **Classification:** ATTACHMENT_SOURCE
- **Finding:** a successful Git push allows only `DRAFT_READY_FOR_CURSOR_VALIDATION`; it does not permit claims of validation, harvest completion, operation, publication, or merge.
- **Durable:** yes
- **futureEfficiencyImpact:** prevents false completion states and preserves clean responsibility boundaries.

### HP-006 — repeated-work

- **Evidence:** user reported syncing duplicate protocol copies under `harvest/protocol/` and `docs/protocols/`.
- **Classification:** USER_REPORTED_OPERATIONAL
- **Finding:** duplicated protocol copies create drift risk and require explicit synchronized updates.
- **Durable:** yes
- **futureEfficiencyImpact:** a documented sync rule or generated copy can prevent repeated manual comparison.
- **Flag:** `NEEDS_REGISTRY_LOOKUP_FIRST`

### HP-007 — tool-order

- **Evidence:** branch creation followed by direct remote fetch of target files.
- **Classification:** CROSS_CHECK_CANDIDATE
- **Finding:** resolve repo → create/verify branch → fetch exact target files → write artifact is the cheapest reliable tool sequence.
- **Durable:** yes
- **futureEfficiencyImpact:** avoids broad repository searches and redundant local instructions.

### HP-008 — handoff-contract

- **Evidence:** attached protocol and this run.
- **Classification:** ATTACHMENT_SOURCE + CROSS_CHECK_CANDIDATE
- **Finding:** the handoff must include branch, findings path, commit SHA, and exact Cursor ingest command.
- **Durable:** yes
- **futureEfficiencyImpact:** Cursor can pull and ingest without clarification.

## 8. Execution deltas

### ED-001

- **Actual:** after the user reported local and duplicate-copy updates, GitHub was checked and shown to still contain older protocol text.
- **Optimal:** immediately classify local/Z update statements as unverified, fetch both remote paths, then state the discrepancy.
- **Reusable lesson:** link operational claims to remote evidence before advising commit or handoff.
- **Linked ROI:** ROI-003.

### ED-002

- **Actual:** an earlier response instructed the operator to run Git commands manually.
- **Optimal:** once the source-authority protocol was attached and GitHub access was available, execute the DRAFT_FILE push directly.
- **Reusable lesson:** connected write capability plus explicit user authorization should replace a manual command-only handoff.
- **Linked ROI:** ROI-002.

### ED-003

- **Actual:** the branch was created correctly and its normalized name was reported.
- **Optimal:** same as actual, with an explicit note that normalization is a Git ref decision.
- **Reusable lesson:** preserve the user's semantic name while using a canonical machine-safe ref.
- **Linked ROI:** ROI-001.

## 9. Waste ledger

### TW-001

- **Waste:** a manual-commands-only response after GitHub connectivity was already available.
- **Cause:** earlier operating assumptions said ChatGPT could not perform repo implementation/push work.
- **Impact:** added an unnecessary operator step and deferred completion.
- **Prevention:** source-authority protocol check before choosing `REVIEW_ONLY` versus `DRAFT_FILE` behavior.

### TW-002

- **Waste:** potential duplicate maintenance of protocol copies in `harvest/protocol/` and `docs/protocols/`.
- **Cause:** two authoritative-looking repository locations.
- **Impact:** drift and repeated verification work.
- **Prevention:** designate one source and generate/sync the duplicate copy, or add a test comparing them.

## 10. Duplication detector

### DUP-001

- **Class:** `POSSIBLE_EXISTING_IMPLEMENTATION`
- **Observation:** the operator reported that updated protocol copies existed locally/Z, while GitHub branch copies were stale.
- **Action:** Cursor should verify whether a local unpushed commit or workspace diff already contains the protocol update before recreating it.

### DUP-002

- **Class:** `REPEATED_DISCUSSION`
- **Observation:** branch naming and push target were reiterated multiple times.
- **Action:** treat `chat-gpt-harvest` as fixed protocol metadata and avoid reopening the naming decision.

### DUP-003

- **Class:** `POSSIBLE_EXISTING_HARVEST`
- **Observation:** this thread concerns protocol setup and may overlap with prior pilot harvest artifacts.
- **Action:** Cursor must run duplication-preflight before validation or publication.

## 11. Operator friction

### OF-001

The operator had to restate that the branch is hyphenated and that push is mandatory. Encode these as protocol constants and surface them in every closeout report.

### OF-002

The operator expected execution, not another set of commands. When the GitHub connector is available and the user says “RUN THIS FILE,” perform the permitted write rather than shifting work back to the operator.

### OF-003

Duplicate protocol locations increase uncertainty about which copy is current. A source-of-truth marker and automated sync check would reduce friction.

## 12. ROI backlog

### ROI-001 — Canonical branch normalization

- **improvementType:** `validation_rule`
- **Priority:** 1
- **Finding:** convert informal/spaced branch requests to a canonical Git ref and echo the exact ref before subsequent writes.
- **futureSavings:**
  - **tokenSavingsEstimate:** medium
  - **timeSavingsEstimate:** medium
  - **toolCallsAvoided:** 2
  - **repeatedInvestigationAvoided:** true
  - **implementationReworkAvoided:** true
  - **appliesTo:** [cursor_planning, repository_retrieval, coding, deployment]
  - **futureEfficiencyImpact:** future agents avoid failed checkout/push attempts and branch-name correction loops.
- **optimalFutureWorkflow:**
  1. Resolve repository and default branch.
  2. Normalize requested branch to a Git-safe ref.
  3. Create or verify the exact ref.
  4. Reuse that exact ref in all paths, commits, pushes, and handoffs.

### ROI-002 — Execute mandatory Git closeout when connected

- **improvementType:** `tool_order_optimization`
- **Priority:** 2
- **Finding:** when mode is `DRAFT_FILE`, the user authorized execution, and GitHub is connected, write and commit the findings directly before giving Cursor the ingest command.
- **futureSavings:**
  - **tokenSavingsEstimate:** high
  - **timeSavingsEstimate:** high
  - **toolCallsAvoided:** 4
  - **repeatedInvestigationAvoided:** true
  - **implementationReworkAvoided:** false
  - **appliesTo:** [cursor_planning, repository_retrieval, deployment]
  - **futureEfficiencyImpact:** removes manual copy, local file creation, commit, and push steps from the operator workflow.
- **optimalFutureWorkflow:**
  1. Read the source-authority protocol.
  2. Declare `DRAFT_FILE`.
  3. Produce the complete artifact content.
  4. Run the pre-push self-check.
  5. Create/update the findings file on `chat-gpt-harvest`.
  6. Report commit SHA and Cursor ingest command.

### ROI-003 — Verify remote state before accepting sync claims

- **improvementType:** `retrieval_technique`
- **Priority:** 3
- **Finding:** classify local/Z update reports as unverified and fetch the exact remote files before stating repository status.
- **futureSavings:**
  - **tokenSavingsEstimate:** medium
  - **timeSavingsEstimate:** high
  - **toolCallsAvoided:** 3
  - **repeatedInvestigationAvoided:** true
  - **implementationReworkAvoided:** true
  - **appliesTo:** [repository_retrieval, testing, debugging, deployment]
  - **futureEfficiencyImpact:** future agents avoid planning from stale local-only edits and can identify the exact missing push immediately.
- **optimalFutureWorkflow:**
  1. Record the user claim as `USER_REPORTED_OPERATIONAL`.
  2. Fetch the exact branch/path pairs from GitHub.
  3. Compare presence of the claimed section or marker.
  4. Report verified remote state and only then choose create/update actions.

### ROI-004 — Eliminate duplicate protocol drift

- **improvementType:** `automation_concept`
- **Priority:** 4
- **Finding:** add a sync/generation mechanism or CI equality check for `harvest/protocol/` and `docs/protocols/` copies.
- **futureSavings:**
  - **tokenSavingsEstimate:** medium
  - **timeSavingsEstimate:** medium
  - **toolCallsAvoided:** 2
  - **repeatedInvestigationAvoided:** true
  - **implementationReworkAvoided:** true
  - **appliesTo:** [coding, testing, deployment]
  - **futureEfficiencyImpact:** prevents protocol divergence and repeated manual file comparisons.

## 13. Do-not-advance guards

- Do not claim `INDEX_HIT`, `INDEX_HIT_AI_CACHE`, or any live cache/hub result.
- Do not claim `harvest:validate` PASS.
- Do not claim `HARVEST_COMPLETE`, `OPERATIONAL`, or `FULLY_SEEDED`.
- Do not merge or push to `main`.
- Do not treat the user-reported Z/local protocol update as a verified GitHub commit.
- Do not publish to the Intelligence Hub from ChatGPT.
- Cursor must run duplication-preflight and validation before any advancement claim.

## 14. Seed packet candidates

### SEED-001

```json
{
  "seedId": "IH-THREAD-BRANCH-NORMALIZATION-001",
  "kind": "lesson",
  "improvementType": "validation_rule",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "What exact Git-safe branch ref should be used when the operator supplies a spaced informal name?",
    "Has the canonical branch ref already been created and echoed back to the operator?"
  ],
  "evidenceRefs": [
    {"ref": "EVT-001", "classification": "CHAT_DIRECT"},
    {"ref": "EVT-003", "classification": "CROSS_CHECK_CANDIDATE"}
  ],
  "futureSavings": {
    "tokenSavingsEstimate": "medium",
    "timeSavingsEstimate": "medium",
    "toolCallsAvoided": 2,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["cursor_planning", "repository_retrieval", "deployment"],
    "futureEfficiencyImpact": "Agents avoid invalid refs, repeated clarification, and mismatched push instructions."
  },
  "optimalFutureWorkflow": [
    "1. Resolve the exact repository.",
    "2. Normalize the requested name to a Git-safe ref.",
    "3. Create or verify the branch.",
    "4. Reuse the exact ref everywhere."
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A user gives an informal branch name containing spaces or ambiguous punctuation.",
    "startAt": "Normalize and echo the canonical ref.",
    "runPreflight": "Verify repo and default branch before creation.",
    "doNot": "Silently use a different ref without reporting it.",
    "proveBeforeClaiming": "Return the created or fetched branch name from GitHub."
  }
}
```

### SEED-002

```json
{
  "seedId": "IH-THREAD-CHATGPT-GIT-CLOSEOUT-002",
  "kind": "protocol-upgrade",
  "improvementType": "tool_order_optimization",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Does the active ChatGPT protocol define DRAFT_FILE as including a mandatory Git push?",
    "Is GitHub connected and is the user authorizing execution rather than review-only output?"
  ],
  "evidenceRefs": [
    {"ref": "EVT-006", "classification": "ATTACHMENT_SOURCE"},
    {"ref": "EVT-007", "classification": "ATTACHMENT_SOURCE"},
    {"ref": "EVT-008", "classification": "CROSS_CHECK_CANDIDATE"}
  ],
  "futureSavings": {
    "tokenSavingsEstimate": "high",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 4,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": false,
    "appliesTo": ["cursor_planning", "repository_retrieval", "deployment"],
    "futureEfficiencyImpact": "Agents finish the authorized Git closeout directly instead of handing four manual steps back to the operator."
  },
  "optimalFutureWorkflow": [
    "1. Read the attached source-authority protocol.",
    "2. Declare DRAFT_FILE.",
    "3. Build and self-check the findings artifact.",
    "4. Commit it to chat-gpt-harvest.",
    "5. Report SHA, path, and Cursor ingest command."
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "The user says RUN THIS FILE and the attached protocol requires push closeout.",
    "startAt": "Use the attached file as authority.",
    "runPreflight": "Confirm branch, path, prohibited claims, and GitHub connectivity.",
    "doNot": "Return only manual push commands when a permitted connector write is available.",
    "proveBeforeClaiming": "Report the GitHub commit SHA returned by the write."
  }
}
```

### SEED-003

```json
{
  "seedId": "IH-THREAD-REMOTE-STATE-VERIFY-003",
  "kind": "failure-pattern",
  "improvementType": "retrieval_technique",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Are the claimed local or Z-drive edits present on the target GitHub branch?",
    "Do all duplicate repository copies contain the same mandatory section?"
  ],
  "evidenceRefs": [
    {"ref": "EVT-004", "classification": "USER_REPORTED_OPERATIONAL"},
    {"ref": "EVT-005", "classification": "CROSS_CHECK_CANDIDATE"}
  ],
  "futureSavings": {
    "tokenSavingsEstimate": "medium",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 3,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["repository_retrieval", "testing", "debugging", "deployment"],
    "futureEfficiencyImpact": "Agents distinguish local intent from remote repository truth before planning writes or declaring completion."
  },
  "optimalFutureWorkflow": [
    "1. Label local update claims USER_REPORTED_OPERATIONAL.",
    "2. Fetch exact files from the named branch.",
    "3. Search for the claimed marker section.",
    "4. Report remote status and choose create/update actions."
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "An operator reports local, mounted-drive, or Cursor edits without a commit SHA.",
    "startAt": "Fetch the remote branch files.",
    "runPreflight": "Check all named duplicate paths.",
    "doNot": "Equate workspace state with GitHub state.",
    "proveBeforeClaiming": "Use returned file content and SHA or commit evidence."
  }
}
```

## 15. Future-agent instructions

1. Treat attached protocol files explicitly named as source authority as stronger than earlier conversational assumptions.
2. Use `chat-gpt-harvest` exactly; never substitute `main` or the spaced phrase.
3. Classify operator-reported local/Z/index state as unverified until checked through the relevant connector or Cursor command.
4. In `DRAFT_FILE`, complete the Git write when connected, then report branch, path, and SHA.
5. Hand off to Cursor only after the findings push is complete.
6. Preserve the boundary: ChatGPT drafts and pushes; Cursor ingests and validates; the operator publishes or merges.

## 16. Acceptance checklist

- [x] Mode declared as `DRAFT_FILE`.
- [x] OBSERVED lane only.
- [x] Retrieval block uses `INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT`.
- [x] Scope ledger included.
- [x] Correction ledger included.
- [x] Events and operational claims classified.
- [x] Eight harvest packet kinds represented as applicable.
- [x] Execution deltas, waste, duplication, and operator friction included.
- [x] ROI backlog includes `improvementType` and `futureSavings`.
- [x] ROI top three include `optimalFutureWorkflow`.
- [x] At least one seed exists for each top-three ROI item.
- [x] Seed candidates include two or more retrieval questions and classified evidence refs.
- [x] No live index, validation, publication, or completion claim is made.
- [x] Findings path targets `chat-gpt-harvest`, not `main`.
- [x] Cursor handoff included.

## 17. Next operator action — Cursor handoff

```text
Pull branch chat-gpt-harvest on Capglass5708/CapitalGlass-Cross-Agent.

Ingest ChatGPT thread autopsy findings per chat-thread-closeout-autopsy-harvest-chatgpt-v1.

npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-05-chatgpt-branch-protocol-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-05-chatgpt-branch-protocol-v1

Then run:

npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-05-chatgpt-branch-protocol-v1
npm run harvest:sync-derived -- harvest-2026-08-05-chatgpt-branch-protocol-v1
npm run harvest:validate -- harvest-2026-08-05-chatgpt-branch-protocol-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-05-chatgpt-branch-protocol-v1
npm run test:harvest
# operator only:
npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-05-chatgpt-branch-protocol-v1
```

## 18. Git push closeout

```text
Repo: Capglass5708/CapitalGlass-Cross-Agent
Branch: chat-gpt-harvest
File: artifacts/agent-runs/harvest-2026-08-05-chatgpt-branch-protocol-v1/chatgpt-findings-source.md
Commit message: harvest(chatgpt): draft findings harvest-2026-08-05-chatgpt-branch-protocol-v1
Push target: origin/chat-gpt-harvest
```

## Publication truth

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
