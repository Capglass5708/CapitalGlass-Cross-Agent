# Chat Thread Closeout Autopsy Findings — Prompt Cache, Harvest Publication, and Desk Connectivity

## 1. Final summary

```text
Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Start verdict: UNHARVESTED_THREAD
Target tier: T2
Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION
```

This OBSERVED autopsy records what was reported, corrected, gated, closed, deferred, and learned across prompt harvesting, prompt-cache hardening, L/Z publication, RYZEN9DESK distribution, and WESLEYDESK connectivity. It does not claim repository, index, cache, Supabase, or publication truth beyond the visible conversation.

## 2. Harvest verdict and tier rationale

**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

**Tier:** T2 because the thread contains multiple corrections, operational reports, host-specific blockers, repeated gate clarification, cache-routing defects, closeout boundaries, and reusable procedures.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

## 4. Scope ledger

### Primary mission

Capture observed lessons and reusable candidates from the prompt-harvest, prompt-cache hardening, publication, and host-connectivity thread.

### Closed lanes — user reported, not independently verified

- `supabase-hot-cache-execution-packets-v1`
- prompt extraction and approval path
- Supabase prompt projection/retrieval
- Z protocol mirror verification
- L Gate 4 publication
- prompt-catalog routing and lazyCatalog repair

### Open lanes

- RYZEN9DESK local AI-cache sync proof
- prompt-catalog compact trimming when source records exceed `maxRecords`
- CI/closeout wiring for prompt-catalog gates

### Unrelated follow-ups

- `thread-autopsy-supabase` 401
- WESLEYDESK broad connectivity diagnosis
- WESLEYDESK auto-publisher activation

### Deferred work

- prompt-catalog resolver by prompt ID
- additional host fanout architecture
- further prompt-pack expansion

### Do-not-merge boundaries

- Shared L publication is not the same as target-host local cache distribution.
- Prompt extraction defects are not the same as drive-mount or publication defects.
- Host connectivity records may guide diagnostics but cannot replace live verification.

## 5. Correction ledger

### COR-001

- **priorAssumption:** WESLEYDESK had to perform the L publication for the closeout to be valid.
- **correction:** The user reported that WESLEY_WORK completed publication and L is shared NAS authority.
- **correctedModel:** Any approved host with L mounted may publish shared hub authority; target-host cache distribution remains local.
- **affectedFindings:** EVT-008, HP-005, ROI-004.
- **futurePrevention:** Separate shared-authority publication from host-local derivative cache sync in every gate matrix.

### COR-002

- **priorAssumption:** `--allow-republish` would be sufficient to republish the harvest.
- **correction:** Duplicate seed IDs still required explicit `--allow-supersede-seed=<id>` arguments.
- **correctedModel:** Harvest-level republish permission and seed-level supersession are independent controls.
- **affectedFindings:** EVT-006, HP-004, ROI-003.
- **futurePrevention:** Run duplicate-seed preflight and generate the exact supersede command before long tests.

### COR-003

- **priorAssumption:** A Scout `DATASET_HIT` implied the compact prompt-catalog slice was present.
- **correction:** The user reported 40 records exceeded `maxRecords: 25`, allowing a hit while the compact slice could be omitted.
- **correctedModel:** Routing success, dataset resolution, compact inclusion, and byte/record budgets require separate assertions.
- **affectedFindings:** EVT-011, HP-007, HP-008, ROI-001.
- **futurePrevention:** Add below-limit, exact-limit, and over-limit compact tests.

### COR-004

- **priorAssumption:** Host connectivity problems should be solved by one broad diagnosis first.
- **correction:** The thread showed known repeat signatures around mapped drives, `drvfs`, service identity, and target-local cache roots.
- **correctedModel:** Resolve cached host profile and run a bounded classifier before escalating to full diagnostics.
- **affectedFindings:** EVT-009, HP-006, ROI-002.
- **futurePrevention:** Cache non-secret host connectivity and recovery packets with live-check requirements.

## 6. Thread event inventory

| ID | Evidence class | Observed event | Future efficiency impact |
| --- | --- | --- | --- |
| EVT-001 | `CHAT_DIRECT` | User required Cursor-chat prompt extraction to be added to the harvest Markdown, index, and Supabase seeding. | Makes paid reasoning reusable instead of rediscovered. |
| EVT-002 | `CHAT_DIRECT` | User required Cursor’s implementation to be independently tested and gated. | Prevents acceptance based on an agent’s narrative summary. |
| EVT-003 | `USER_REPORTED_OPERATIONAL` | Z harvest mirror and ingestion wiring were reported implemented; Z was initially unavailable on the current host. | Separates code completion from environment-dependent proof. |
| EVT-004 | `USER_REPORTED_OPERATIONAL` | Gates 2 and 3 were reported complete while Gate 1 and part of Gate 4 were blocked by unmounted drives. | Lets future agents rerun only unresolved gates. |
| EVT-005 | `USER_REPORTED_OPERATIONAL` | Gate 4 first failed because publication was interrupted and duplicate seed IDs were blocked. | Enables preflight before expensive publication runs. |
| EVT-006 | `CROSS_CHECK_CANDIDATE` | Exact supersede seed IDs and `--skip-tests` were supplied for a bounded republish. | Avoids another long test pass when same-SHA receipts already exist. |
| EVT-007 | `USER_REPORTED_OPERATIONAL` | Gate 4 later reported `OPERATIONAL`, receipt present, L prompt-harvest index present, and approved prompt recorded. | Closes publication without reopening extraction or Supabase. |
| EVT-008 | `USER_REPORTED_OPERATIONAL` | Publication ran on WESLEY_WORK, with the assertion that shared L authority made the publish host-independent. | Prevents false host coupling. |
| EVT-009 | `USER_REPORTED_OPERATIONAL` | RYZEN9DESK fanout failed because its local cache root was unreachable from WESLEY_WORK. | Directs the next action to target-local sync instead of more shared publication work. |
| EVT-010 | `CHAT_DIRECT` | User directed that WESLEYDESK and RYZEN9DESK connectivity intelligence be cached. | Reduces repeated SSH, SMB, WSL, runner, and mount rediscovery. |
| EVT-011 | `USER_REPORTED_OPERATIONAL` | Prompt-catalog routing, packet dependencies, publish ordering, and lazyCatalog payload-hash handling were reported fixed. | Reuses proven routing fixes and narrows remaining work. |
| EVT-012 | `USER_REPORTED_OPERATIONAL` | Prompt-catalog had 40 records against `maxRecords: 25`; Scout could hit the dataset while omitting compact data. | Identifies the exact runtime gap without redesigning the pipeline. |
| EVT-013 | `CHAT_DIRECT` | User chose the next milestone and closeout rather than indefinite expansion. | Encodes the operator preference for bounded, gated slices. |

## 7. Harvest packets

### HP-001 — architecture-decision — durable

**Evidence:** `CHAT_DIRECT`, `USER_REPORTED_OPERATIONAL`

PromptOps remains the authority for approved prompt bodies and versions. Harvest discovers candidates; Supabase, prompt catalog, execution packets, and hot cache remain derivative.

**futureEfficiencyImpact:** Future agents can reuse approved prompts without debating authority or loading full chat history.

### HP-002 — protocol-upgrade — durable

**Evidence:** `CHAT_DIRECT`

Every completed Cursor thread should evaluate prompt extraction, classification, deduplication, provenance, review/promotion, prompt-catalog update, packet binding, indexing, Supabase projection, and receipt status.

**futureEfficiencyImpact:** Converts already-paid reasoning into bounded reusable assets.

### HP-003 — validation-rule — durable

**Evidence:** `CHAT_DIRECT`

Cursor completion summaries are candidate evidence, not acceptance authority. Independent gates must inspect diffs, schemas, tests, indexes, projections, receipts, and live retrieval where applicable.

**futureEfficiencyImpact:** Prevents false closeout and expensive later rework.

### HP-004 — failure-pattern — durable

**Evidence:** `USER_REPORTED_OPERATIONAL`, `CROSS_CHECK_CANDIDATE`

`--allow-republish` does not supersede colliding seed IDs. Republish requires explicit seed-level supersession.

**futureEfficiencyImpact:** Avoids discovering duplicate blocks after long test stages.

### HP-005 — lesson — durable

**Evidence:** `USER_REPORTED_OPERATIONAL`

Shared L authority publication can be valid from any approved host with L mounted; local AI-cache distribution must be proven on the target host.

**futureEfficiencyImpact:** Prevents redundant reruns on a specific desk and clarifies where local proof is actually required.

### HP-006 — architecture-decision — durable

**Evidence:** `CHAT_DIRECT`

Cache non-secret connectivity intelligence for WESLEYDESK and RYZEN9DESK: role, approved routes, SSH identity pattern, SMB shares, WSL mounts, runner procedures, failure signatures, bounded recovery, validation, freshness, and authority boundaries.

**futureEfficiencyImpact:** Reduces repeated broad diagnostics and operator prompting.

### HP-007 — failure-pattern — durable

**Evidence:** `USER_REPORTED_OPERATIONAL`

A prompt-catalog query may return `DATASET_HIT` while the compact slice is absent when the source exceeds the record cap.

**futureEfficiencyImpact:** Future tests can detect the real failure in one gate instead of diagnosing routing, publication, and cache separately.

### HP-008 — coding-pattern — durable

**Evidence:** `CHAT_DIRECT`

For over-budget prompt catalogs: filter approved/runtime-eligible records, rank `usageRank` descending, tie-break `promptId` ascending, take `maxRecords`, preserve counts, and produce a stable hash independent of source order.

**futureEfficiencyImpact:** Preserves useful compact routing data while respecting budgets and determinism.

## 8. Execution deltas

### ED-001

- **Actual:** Long publish began before duplicate-seed supersession was fully known.
- **Optimal:** Run duplicate preflight, generate supersede arguments, verify mounted roots, then run tests/publish.
- **Reusable lesson:** Link to ROI-003 and seed `IH-THREAD-HARVEST-REPUBLISH-PREFLIGHT-003`.

### ED-002

- **Actual:** Completed extraction, Supabase, and test gates were repeatedly restated while only storage publication remained.
- **Optimal:** Maintain a gate-state matrix and rerun unresolved gates only.
- **Reusable lesson:** Link to ROI-004 and seed `IH-THREAD-GATE-SEPARATION-004`.

### ED-003

- **Actual:** Broad connectivity diagnosis was drafted before a compact host-connectivity profile existed.
- **Optimal:** Resolve host profile, run a fast layer classifier, then escalate only if the failure remains unknown.
- **Reusable lesson:** Link to ROI-002 and seed `IH-THREAD-HOST-CONNECTIVITY-CACHE-002`.

### ED-004

- **Actual:** Prompt-catalog routing was considered healthy before over-budget compact behavior was gated.
- **Optimal:** Gate routing, resolution, compact presence, record cap, byte cap, and determinism separately.
- **Reusable lesson:** Link to ROI-001 and seed `IH-THREAD-PROMPT-CATALOG-COMPACT-001`.

## 9. Waste ledger

- **TW-001:** Repeatedly explaining already-passed prompt extraction and Supabase gates.
- **TW-002:** Treating WESLEYDESK as mandatory for shared L publication.
- **TW-003:** Discovering seed collisions after long-running tests began.
- **TW-004:** Repeating broad host diagnostics without a reusable host profile.
- **TW-005:** Treating `DATASET_HIT` as sufficient proof of compact payload inclusion.

## 10. Duplication detector

### DUP-001

- **class:** `POSSIBLE_EXISTING_HARVEST`
- **evidence:** `USER_REPORTED_OPERATIONAL`
- **finding:** Prompt extraction verification and publication were reported closed; new work must check receipts and registry first.
- **guard:** `NEEDS_REGISTRY_LOOKUP_FIRST`

### DUP-002

- **class:** `INTENTIONALLY_DEFERRED`
- **evidence:** `CHAT_DIRECT`
- **finding:** Prompt-catalog resolver was explicitly deferred behind compact trimming.
- **guard:** Do not add resolver work to the compact-trim milestone.

### DUP-003

- **class:** `FALSE_DUPLICATE_DIFFERENT_HOST_OR_CONTEXT`
- **evidence:** `USER_REPORTED_OPERATIONAL`
- **finding:** RYZEN9DESK local cache sync is not duplicate L publication; it is target-local distribution proof.
- **guard:** Keep the lane separate.

### DUP-004

- **class:** `REPEATED_DISCUSSION`
- **evidence:** `CHAT_DIRECT`
- **finding:** The meaning of Gate 4 and which parts were already proven were repeatedly revisited.
- **guard:** Require a concise gate-state receipt in future closeout replies.

## 11. Operator friction

- **OF-001:** Manual `drvfs` mounts for Z and L.
- **OF-002:** Long tests obscured whether publication had actually started.
- **OF-003:** Manual seed supersession arguments.
- **OF-004:** Remote fanout could not reach RYZEN9DESK local cache root.
- **OF-005:** Scout status did not reveal compact-slice omission clearly enough.
- **OF-006:** User had to repeatedly constrain scope and prevent extra closeout waves.

## 12. ROI backlog

### ROI-001 — Deterministic prompt-catalog compact trim

- **improvementType:** `coding_pattern`
- **futureSavings:**
  - tokenSavingsEstimate: `high`
  - timeSavingsEstimate: `high`
  - toolCallsAvoided: 6
  - repeatedInvestigationAvoided: true
  - implementationReworkAvoided: true
  - appliesTo: `["cursor_planning","coding","testing","debugging"]`
  - futureEfficiencyImpact: Agents retain the highest-value prompt metadata instead of reloading the catalog or debugging a missing compact slice.
- **optimalFutureWorkflow:**
  1. Confirm source, eligible, and cap counts.
  2. Apply approved/runtime eligibility filtering.
  3. Sort by `usageRank desc`, then `promptId asc`.
  4. Take `maxRecords` and preserve total/included/omitted metadata.
  5. Run over-limit, reordered-input, byte-budget, and stable-hash tests.
  6. Wire the named gate into existing CI/closeout and stop.

### ROI-002 — Host-connectivity cache and recovery packets

- **improvementType:** `retrieval_technique`
- **futureSavings:**
  - tokenSavingsEstimate: `high`
  - timeSavingsEstimate: `high`
  - toolCallsAvoided: 12
  - repeatedInvestigationAvoided: true
  - implementationReworkAvoided: false
  - appliesTo: `["repository_retrieval","debugging","deployment"]`
  - futureEfficiencyImpact: Agents begin with the approved connection path and known failure signatures instead of rebuilding host knowledge from scratch.
- **optimalFutureWorkflow:**
  1. Resolve `host-connectivity-<host>` and query-class packet.
  2. Verify profile freshness and live host identity.
  3. Test the cheapest layer first: name/IP, port, service, share, WSL mount, local cache root.
  4. Run the bounded recovery tied to the observed signature.
  5. Escalate to full diagnostics only if classification remains unknown.

### ROI-003 — Republish preflight and command generation

- **improvementType:** `tool_order_optimization`
- **futureSavings:**
  - tokenSavingsEstimate: `medium`
  - timeSavingsEstimate: `high`
  - toolCallsAvoided: 5
  - repeatedInvestigationAvoided: true
  - implementationReworkAvoided: false
  - appliesTo: `["testing","debugging","deployment"]`
  - futureEfficiencyImpact: Duplicate collisions and mount blockers are found before lengthy tests and publication.
- **optimalFutureWorkflow:**
  1. Read prior publication and test receipts.
  2. Verify current source SHA matches the tested SHA.
  3. Run duplicate-seed preflight.
  4. Generate exact `--allow-supersede-seed` arguments.
  5. Verify L/Z mounts and output roots.
  6. Use receipt-backed `--skip-tests` only when policy permits.
  7. Run publication once and verify receipt plus named index record.

### ROI-004 — Explicit gate-state matrix

- **improvementType:** `validation_rule`
- **futureSavings:**
  - tokenSavingsEstimate: `medium`
  - timeSavingsEstimate: `medium`
  - toolCallsAvoided: 4
  - repeatedInvestigationAvoided: true
  - implementationReworkAvoided: true
  - appliesTo: `["cursor_planning","testing","debugging","deployment"]`
  - futureEfficiencyImpact: Future agents rerun only unresolved gates and avoid reopening closed missions.

### ROI-005 — Operator preference: bounded closeout

- **improvementType:** `operator_preference`
- **futureSavings:**
  - tokenSavingsEstimate: `high`
  - timeSavingsEstimate: `medium`
  - toolCallsAvoided: 3
  - repeatedInvestigationAvoided: true
  - implementationReworkAvoided: true
  - appliesTo: `["cursor_planning","coding","testing","deployment"]`
  - futureEfficiencyImpact: Agents stop after the named milestone rather than creating extra observation, host, or optimization waves.

## 13. Do-not-advance guards

- Do not claim `INDEX_HIT`, `OPERATIONAL`, `HARVEST_COMPLETE`, or `FULLY_SEEDED` from this ChatGPT lane.
- Do not reopen prompt extraction or Supabase projection without direct regression evidence.
- Do not make RYZEN9DESK local cache proof block the closed shared publication milestone.
- Do not cache credentials, tokens, private keys, or unrestricted remote-mutation authority.
- Do not create a second prompt authority beside PromptOps.
- Do not add resolver, Supabase 401 repair, host fanout redesign, or observation waves to compact trimming.
- Do not push this findings draft to `main`.

## 14. Seed packet candidates

### Seed A

```json
{
  "seedId": "IH-THREAD-PROMPT-CATALOG-COMPACT-001",
  "kind": "protocol-upgrade",
  "title": "Deterministic over-budget prompt-catalog compact selection",
  "status": "CANDIDATE",
  "improvementType": "coding_pattern",
  "futureSavings": {
    "tokenSavingsEstimate": "high",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 6,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["cursor_planning", "coding", "testing", "debugging"],
    "futureEfficiencyImpact": "Preserves the most useful approved prompt metadata within budget instead of dropping the complete slice."
  },
  "optimalFutureWorkflow": [
    "1. Measure source, eligible, maxRecords, and byte budget.",
    "2. Filter approved and runtime-eligible records.",
    "3. Sort usageRank descending and promptId ascending.",
    "4. Take maxRecords and emit total/included/omitted metadata.",
    "5. Prove stable hash under source reordering and run the named gate."
  ],
  "retrievalQuestions": [
    "Why can prompt-catalog return DATASET_HIT but be absent from runtime compact?",
    "How should prompt-catalog be trimmed when records exceed maxRecords?",
    "Which deterministic tie-break applies to equal usageRank values?"
  ],
  "evidenceRefs": [
    {"ref": "EVT-012", "classification": "USER_REPORTED_OPERATIONAL"},
    {"ref": "HP-008", "classification": "CHAT_DIRECT"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "Prompt catalog routes but compact output is missing or over budget.",
    "startAt": "Compact builder and runtime eligibility filters.",
    "runPreflight": ["Count source and eligible records", "Read maxRecords and byte budget", "Run over-limit fixture"],
    "doNot": ["Drop the full dataset", "Promote records during trimming", "Depend on source order"],
    "proveBeforeClaiming": ["Compact slice present", "Budget respected", "Stable hash", "Expected top-ranked records retained"]
  }
}
```

### Seed B

```json
{
  "seedId": "IH-THREAD-HOST-CONNECTIVITY-CACHE-002",
  "kind": "architecture-decision",
  "title": "Cache non-secret connectivity intelligence for WESLEYDESK and RYZEN9DESK",
  "status": "CANDIDATE",
  "improvementType": "retrieval_technique",
  "futureSavings": {
    "tokenSavingsEstimate": "high",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 12,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": false,
    "appliesTo": ["repository_retrieval", "debugging", "deployment"],
    "futureEfficiencyImpact": "Agents retrieve approved routes, mounts, services, and known failure signatures before launching broad diagnostics."
  },
  "optimalFutureWorkflow": [
    "1. Resolve the host-connectivity record and matching execution packet.",
    "2. Verify freshness, live host identity, and route.",
    "3. Test name/IP, port, service, share, WSL mount, and local cache root in that order.",
    "4. Apply the bounded recovery for the matched signature.",
    "5. Escalate only if no known signature matches."
  ],
  "retrievalQuestions": [
    "How do I connect to WESLEYDESK or RYZEN9DESK using the approved route?",
    "Which SMB shares, WSL mounts, runner services, and cache roots belong to each host?",
    "What is the cheapest diagnostic sequence for a desk that appears unreachable?"
  ],
  "evidenceRefs": [
    {"ref": "EVT-009", "classification": "USER_REPORTED_OPERATIONAL"},
    {"ref": "EVT-010", "classification": "CHAT_DIRECT"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A desk must be connected, diagnosed, mounted, or cache-synced.",
    "startAt": "Host-connectivity profile, not repo-wide search.",
    "runPreflight": ["Verify host identity", "Verify profile freshness", "Run live read-only connection tests"],
    "doNot": ["Cache secrets", "Assume observed IP is current", "Mutate before live verification"],
    "proveBeforeClaiming": ["Approved route works", "Expected service/storage is reachable", "Target-local state is verified"]
  }
}
```

### Seed C

```json
{
  "seedId": "IH-THREAD-HARVEST-REPUBLISH-PREFLIGHT-003",
  "kind": "failure-pattern",
  "title": "Generate republish supersession command before long tests",
  "status": "CANDIDATE",
  "improvementType": "tool_order_optimization",
  "futureSavings": {
    "tokenSavingsEstimate": "medium",
    "timeSavingsEstimate": "high",
    "toolCallsAvoided": 5,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": false,
    "appliesTo": ["testing", "debugging", "deployment"],
    "futureEfficiencyImpact": "Finds duplicate-seed and mount blockers before expensive publication stages."
  },
  "optimalFutureWorkflow": [
    "1. Read prior publication and test receipts.",
    "2. Confirm the tested source SHA.",
    "3. Run duplication preflight and enumerate seed collisions.",
    "4. Generate exact allow-supersede-seed arguments.",
    "5. Verify L/Z mounts, then publish once and inspect the receipt."
  ],
  "retrievalQuestions": [
    "Why did allow-republish still return DUPLICATE_BLOCKED?",
    "How should exact allow-supersede-seed arguments be generated?",
    "When is skip-tests permitted for a republish?"
  ],
  "evidenceRefs": [
    {"ref": "EVT-005", "classification": "USER_REPORTED_OPERATIONAL"},
    {"ref": "EVT-006", "classification": "CROSS_CHECK_CANDIDATE"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A previously published harvest must be republished.",
    "startAt": "Prior receipts and duplicate-seed preflight.",
    "runPreflight": ["Verify same SHA", "Enumerate seed IDs", "Verify storage roots"],
    "doNot": ["Assume allow-republish supersedes seeds", "Delete prior seeds", "Rerun long tests without checking receipts"],
    "proveBeforeClaiming": ["Final publication receipt", "Expected BY-KIND record", "No unresolved duplicate block"]
  }
}
```

### Seed D

```json
{
  "seedId": "IH-THREAD-GATE-SEPARATION-004",
  "kind": "lesson",
  "title": "Separate extraction, projection, shared publication, and host-local distribution gates",
  "status": "CANDIDATE",
  "improvementType": "validation_rule",
  "futureSavings": {
    "tokenSavingsEstimate": "medium",
    "timeSavingsEstimate": "medium",
    "toolCallsAvoided": 4,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": true,
    "appliesTo": ["cursor_planning", "testing", "debugging", "deployment"],
    "futureEfficiencyImpact": "Agents rerun only the unresolved layer and avoid reopening completed work."
  },
  "optimalFutureWorkflow": [
    "1. Read the latest gate-state receipt.",
    "2. Check extraction and approval evidence.",
    "3. Check Supabase projection/retrieval evidence.",
    "4. Check shared L publication receipt and index.",
    "5. Check target-host local cache distribution separately.",
    "6. Execute only missing gates and stop."
  ],
  "retrievalQuestions": [
    "Which prompt-harvest gate is actually failing?",
    "Does failed shared publication mean extraction or Supabase is broken?",
    "When is target-host cache sync a separate follow-up?"
  ],
  "evidenceRefs": [
    {"ref": "EVT-004", "classification": "USER_REPORTED_OPERATIONAL"},
    {"ref": "EVT-008", "classification": "USER_REPORTED_OPERATIONAL"},
    {"ref": "EVT-009", "classification": "USER_REPORTED_OPERATIONAL"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A closeout has mixed pass, blocked, and host-local states.",
    "startAt": "Gate-state matrix and receipts.",
    "runPreflight": ["Classify each layer", "Identify unresolved gates", "Check host-local versus shared authority"],
    "doNot": ["Reopen passed gates", "Bind shared authority to one host", "Treat local cache as authority"],
    "proveBeforeClaiming": ["Every gate has evidence", "Next actions include unresolved gates only", "Stop condition is explicit"]
  }
}
```

## 15. Future-agent instructions

1. Read the gate-state receipt and registry before creating new work.
2. Treat pasted operational claims as `USER_REPORTED_OPERATIONAL` until verified.
3. Separate shared authority, durable projection, and host-local derivative cache.
4. Resolve host-connectivity intelligence before broad diagnosis.
5. Check compact payload presence separately from route/dataset hit.
6. Generate seed supersession arguments before long publication tests.
7. Use same-SHA receipts before choosing `--skip-tests`.
8. Honor bounded milestone scope and stop after the named receipt is written.
9. Keep PromptOps as approved prompt authority.
10. Run duplication preflight before promoting any seed in this draft.

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

- [x] Final summary and T2 rationale
- [x] Retrieval preflight uses ChatGPT-safe values
- [x] Scope ledger precedes event inventory
- [x] Correction ledger overrides earlier assumptions
- [x] Every EVT has an evidence class
- [x] Eight harvest packets included
- [x] Durable EVT/HP findings include future efficiency impact
- [x] Execution deltas link to ROI/seeds
- [x] Waste, duplication, and operator friction included
- [x] Every ROI item has `improvementType` and `futureSavings`
- [x] ROI ranks 1–3 include `optimalFutureWorkflow`
- [x] Every seed has required fields, classified evidence references, and candidate status
- [x] Publication truth is entirely `not-run`
- [x] No ChatGPT claim of live index, validation, operational publication, or completed harvest
- [x] Draft pushed only to `chat-gpt-harvest`

## 18. Next operator action

Cursor must pull the `chat-gpt-harvest` branch, ingest this findings draft, run duplication preflight, validate the generated harvest, and leave publication to the operator-controlled path.

## 19. Cursor ingest handoff

```bash
npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-05-prompt-cache-connectivity-observed-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-05-prompt-cache-connectivity-observed-v1

npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-05-prompt-cache-connectivity-observed-v1
npm run harvest:sync-derived -- harvest-2026-08-05-prompt-cache-connectivity-observed-v1
npm run harvest:validate -- harvest-2026-08-05-prompt-cache-connectivity-observed-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-05-prompt-cache-connectivity-observed-v1
npm run test:harvest
# operator only after validation:
npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-05-prompt-cache-connectivity-observed-v1
```

```text
Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION
```
