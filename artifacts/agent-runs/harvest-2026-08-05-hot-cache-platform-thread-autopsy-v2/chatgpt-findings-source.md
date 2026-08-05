# ChatGPT OBSERVED Thread Autopsy — Hot-Cache Platform v2

## 1. Final summary

```text
Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Intelligence kind: OBSERVED
Start verdict: UNHARVESTED_THREAD
Target tier: T2
Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

This thread records the observed evolution of the Capital Glass AI hot-cache effort from a Git Estate proposal into a federated, authority-aware platform. User-reported milestones include atomic generations, routed scout retrieval, durable L fallback, Authority Estate, Active Ledger, Closeout Index, Command Estate, prompt-harvest projection, and Workflow Estate. All operational claims remain unverified until Cursor checks Git, tests, receipts, indexes, and runtime state.

## 2. Harvest verdict + tier rationale

**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`  
**Tier:** `T2`

The conversation is long, correction-heavy, multi-topic, and contains reusable architecture, failure, governance, execution, and efficiency patterns.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

## 4. Scope ledger

- **Primary mission:** OBSERVED autopsy of this visible thread.
- **Reported closed lanes:** hot-cache platform operational closeout; Active Ledger milestone; prompt-extraction post-merge acceptance. (`USER_REPORTED_OPERATIONAL`)
- **Reported open lanes:** Workflow Estate merge/verification; recurring GHA proof; measurement/observability. (`CROSS_CHECK_CANDIDATE`)
- **Unrelated follow-ups:** business/project datasets and broader operational expansion.
- **Deferred:** real estate-wide bulk pull, Supabase expansion, project/business datasets.
- **Do-not-merge boundaries:** this draft branch lane; OBSERVED vs ADVANCEMENT intelligence; host-specific incidents; `chat-gpt-harvest` vs `main`.

## 5. Correction ledger

### COR-001
- **priorAssumption:** Earlier protocol use allowed a downloadable file without Git push.
- **correction:** Current source-authority protocol mandates `chat-gpt-harvest` push in `DRAFT_FILE` mode.
- **correctedModel:** Push findings first, report SHA/path, then hand off to Cursor.
- **affectedFindings:** EVT-012, HP-006, ED-006, ROI-003.
- **futurePrevention:** Always inspect the current protocol version before running a harvest.

### COR-002
- **priorAssumption:** A branch-lane status report was a new Pilot A task.
- **correction:** User clarified it described cleanup of an existing push.
- **correctedModel:** Distinguish status reports from imperative execution.
- **affectedFindings:** EVT-011, ED-007, ROI-004.

### COR-003
- **priorAssumption:** “Index everything” implied one broad index.
- **correction:** Use federated governed datasets.
- **correctedModel:** Cache compact retrieval intelligence and authority pointers, not uncontrolled source copies.
- **affectedFindings:** EVT-002, HP-001, ED-001, ROI-001.

## 6. Thread event inventory

### EVT-001 — Expansion requested
- **Evidence:** `CHAT_DIRECT`
- The user requested broader AI caching and indexing.
- **futureEfficiencyImpact:** Establishing the objective once prevents repeated rediscovery of the platform’s intended scope.

### EVT-002 — Git Estate plan supplied
- **Evidence:** `ATTACHMENT_SOURCE`
- Cross-Agent authority, AppBuilder compilation, full/compact/machine indexes, pull safety, and L publication were defined.
- **futureEfficiencyImpact:** Future repo-health work can begin from a known manifest/index contract instead of filesystem-wide inspection.

### EVT-003 — Federated platform established
- **Evidence:** `CHAT_DIRECT`
- Dataset registry, shared schemas, stable identities, query routing, freshness, ACLs, and compiler plugins were proposed.
- **futureEfficiencyImpact:** New datasets reuse one platform and avoid bespoke cache code, duplicate tests, and repeated integration planning.

### EVT-004 — Hardening added
- **Evidence:** `CHAT_DIRECT`
- Dependencies, immutable generations, checksums, provenance, conflicts, budgets, ranking, and authorization-aware reads were added.
- **futureEfficiencyImpact:** Agents can trust bounded, consistent generations without reopening full source trees to validate every read.

### EVT-005 — Foundation reported implemented
- **Evidence:** `USER_REPORTED_OPERATIONAL`
- Git Estate, atomic publication, query routing, ACL-aware reads, and passing tests were reported.
- **futureEfficiencyImpact:** If verified, future preflight can replace broad scans with compact routed reads.

### EVT-006 — Scout, authority, refusal, and L fallback reported
- **Evidence:** `USER_REPORTED_OPERATIONAL`
- Routed compact retrieval, Authority Estate, valid bulk-pull refusal, durable L publication, hash alignment, and `DATASET_HIT_L` were reported.
- **futureEfficiencyImpact:** Agents can fail over to durable indexed state without live compile or raw scan.

### EVT-007 — Active Ledger and Closeout Index reported
- **Evidence:** `USER_REPORTED_OPERATIONAL`
- 78 records were reportedly partitioned into 53 active and 25 closed with zero overlap.
- **futureEfficiencyImpact:** Current mission and historical-closeout questions can be answered from separate focused indexes.

### EVT-008 — Cache-root inconsistency observed
- **Evidence:** `USER_REPORTED_OPERATIONAL`
- A stripped scout environment lacked the expected D:/S: root and used ext4 fallback.
- **futureEfficiencyImpact:** A canonical resolver prevents false misses and repeated host-specific debugging.

### EVT-009 — Prompt extraction and projection reported
- **Evidence:** `CROSS_CHECK_CANDIDATE`
- Candidate registry, catalog delta, projection script, migration, and command entries were reported.
- **futureEfficiencyImpact:** Reusable prompts can be harvested once and projected through an auditable approval boundary.

### EVT-010 — Workflow Estate reported opened
- **Evidence:** `CROSS_CHECK_CANDIDATE`
- Eight workflows, stable command IDs, compiler gates, and explicit prompt-promotion approval were reported.
- **futureEfficiencyImpact:** Agents can retrieve approved procedures directly instead of reconstructing command sequences.

### EVT-011 — Existing push cleanup clarified
- **Evidence:** `CHAT_DIRECT`
- The user corrected the interpretation of a branch-lane status message.
- **futureEfficiencyImpact:** Better intent classification avoids unnecessary task creation and branch mutations.

### EVT-012 — Current protocol mandates Git push
- **Evidence:** `ATTACHMENT_SOURCE`
- OBSERVED `DRAFT_FILE` findings must be pushed to `chat-gpt-harvest`, never `main`.
- **futureEfficiencyImpact:** Cursor receives a stable branch artifact and avoids copy/paste loss or ambiguous source versions.

## 7. Harvest packets

### HP-001 — Federated governed datasets
- **Kind:** architecture-decision
- **Evidence:** `CHAT_DIRECT`
- Use one authority source, deterministic compiler, purpose-built variants, atomic publication, and retrieval contract per dataset.
- **futureEfficiencyImpact:** Future datasets reuse shared code and gates, reducing architecture churn and implementation rework.

### HP-002 — Derivative-only cache
- **Kind:** governance-pattern
- **Evidence:** `CHAT_DIRECT`
- Hot cache is rebuildable and never authoritative; retain source, hash, provenance, freshness, and classification.
- **futureEfficiencyImpact:** Agents skip repeated authority debates and avoid wrong-layer edits.

### HP-003 — Immutable generation publication
- **Kind:** implementation-pattern
- **Evidence:** `USER_REPORTED_OPERATIONAL`
- Write immutable generation artifacts and checksums, verify, then flip `current.json` last.
- **futureEfficiencyImpact:** Readers avoid mixed-generation failures and operators avoid manual repair of partial publications.

### HP-004 — Routed compact retrieval
- **Kind:** performance-pattern
- **Evidence:** `USER_REPORTED_OPERATIONAL`
- Classify query, resolve aliases, load routed compact slices, apply ACLs/budgets, and escalate only when required.
- **futureEfficiencyImpact:** Cuts context size, tool calls, and repeated repo scanning.

### HP-005 — Safety refusal is success
- **Kind:** lesson
- **Evidence:** `USER_REPORTED_OPERATIONAL`
- Zero eligible mutations is correct when repos are materially dirty, detached, diverged, missing, or unauthorized.
- **futureEfficiencyImpact:** Prevents destructive recovery work and avoids treating safe refusal as a defect.

### HP-006 — ChatGPT draft branch lane
- **Kind:** protocol-upgrade
- **Evidence:** `ATTACHMENT_SOURCE`
- Push OBSERVED findings only to `chat-gpt-harvest`; do not merge or claim validation/publication.
- **futureEfficiencyImpact:** Cursor ingests a deterministic artifact path and skips manual transcript reconstruction.

## 8. Execution deltas

### ED-001 — Special case to shared platform
- **Evidence:** `CHAT_DIRECT`
- **Actual:** Git Estate-specific mechanism.
- **Optimal:** Git Estate as first plugin of a shared platform.
- **Linked ROI/seed:** ROI-001 / Seed A.

### ED-002 — TTL to event-aware freshness
- **Evidence:** `CHAT_DIRECT`
- **Actual:** TTL-centered freshness.
- **Optimal:** Per-dataset TTL fallback plus event invalidation.
- **Linked ROI/seed:** ROI-001 / Seed A.

### ED-003 — File atomicity to generation atomicity
- **Evidence:** `CHAT_DIRECT`
- **Actual:** Individual atomic writes.
- **Optimal:** Dataset-generation atomicity and pointer-last activation.
- **Linked ROI/seed:** ROI-002 / Seed B.

### ED-004 — Desired mutation to evidence-based refusal
- **Evidence:** `USER_REPORTED_OPERATIONAL`
- **Actual:** Desire for estate-wide pull.
- **Optimal:** Mutation disabled until a clean fixture proves the full safe cycle.
- **Linked ROI/seed:** ROI-005 / Seed D.

### ED-005 — Mounted-L test contamination
- **Evidence:** `USER_REPORTED_OPERATIONAL`
- **Actual:** Temp cache test compared with real mounted L.
- **Optimal:** Isolated temporary Intelligence Hub root.
- **Linked ROI/seed:** ROI-002 / Seed B.

### ED-006 — Chat-only draft to pushed branch artifact
- **Evidence:** `ATTACHMENT_SOURCE`
- **Actual:** Earlier chat-only findings output.
- **Optimal:** Mandatory branch push before Cursor ingest.
- **Linked ROI/seed:** ROI-003 / Seed C.

### ED-007 — Status report misread as task
- **Evidence:** `CHAT_DIRECT`
- **Actual:** A cleanup report triggered a new-task response.
- **Optimal:** Classify report vs imperative before acting.
- **Linked ROI/seed:** ROI-004 / Seed E.

## 9. Waste ledger

### TW-001 — Repeated status restatement
- Local/durable/fallback status was repeatedly re-described. (`CHAT_DIRECT`)
- **Avoidance:** Maintain one canonical status matrix and report only deltas.

### TW-002 — Architecture recapitulation after implementation
- Long plans were repeated after user reports showed work already completed. (`CHAT_DIRECT`)
- **Avoidance:** Use `confirmed / changed / blocked / next proof`.

### TW-003 — Duplicated conversation payload
- Prior content was pasted back with new status appended. (`CHAT_DIRECT`)
- **Avoidance:** Identify the newest authoritative status block first.

### TW-004 — Unmeasured token claims
- Token savings were estimated before instrumentation. (`CHAT_DIRECT`)
- **Avoidance:** Persist actual bytes/tokens, routing, escalation, misses, and scans.

## 10. Duplication detector

### DUP-001
- **Class:** `POSSIBLE_EXISTING_HARVEST`
- **Evidence:** `USER_REPORTED_OPERATIONAL`
- Search for `HOT_CACHE_PLATFORM_OPERATIONAL` and the consumption-authority closeout.
- `NEEDS_REGISTRY_LOOKUP_FIRST`

### DUP-002
- **Class:** `POSSIBLE_EXISTING_HARVEST`
- **Evidence:** `USER_REPORTED_OPERATIONAL`
- Search for `ACTIVE_LEDGER_HOT_CACHE_OPERATIONAL` and Closeout Index receipts.
- `NEEDS_REGISTRY_LOOKUP_FIRST`

### DUP-003
- **Class:** `POSSIBLE_EXISTING_IMPLEMENTATION`
- **Evidence:** `CROSS_CHECK_CANDIDATE`
- Search for `PROMPT_APPROVAL_BOUNDARY_PASS` and prompt-candidate workflow records.
- `NEEDS_REGISTRY_LOOKUP_FIRST`

### DUP-004
- **Class:** `FALSE_DUPLICATE_DIFFERENT_HOST_OR_CONTEXT`
- **Evidence:** `USER_REPORTED_OPERATIONAL`
- WESLEY_WORK missing D:/S: and WESLEYDESK mounted L: are related but distinct incidents.

## 11. Operator friction

- **OF-001:** Self-hosted WESLEYDESK runner queue. (`USER_REPORTED_OPERATIONAL`)
- **OF-002:** D:/S:/L mount variation by host/session. (`USER_REPORTED_OPERATIONAL`)
- **OF-003:** Stripped hook environment losing cache-root configuration. (`USER_REPORTED_OPERATIONAL`)
- **OF-004:** Materially dirty repo estate blocking mutation. (`USER_REPORTED_OPERATIONAL`)
- **OF-005:** Cross-repo merge dependency ordering. (`CHAT_DIRECT`)
- **OF-006:** GitHub mutation requiring user approval/login. (`CHAT_DIRECT`)
- **OF-007:** Protocol-version drift. (`ATTACHMENT_SOURCE`)

## 12. ROI backlog

### ROI-001 — Measurement and routed-retrieval observability
- **improvementType:** `automation_concept`
- **futureSavings:**
```json
{"tokenSavingsEstimate":"high","timeSavingsEstimate":"high","toolCallsAvoided":5,"repeatedInvestigationAvoided":true,"implementationReworkAvoided":true,"appliesTo":["cursor_planning","repository_retrieval","testing","debugging"],"futureEfficiencyImpact":"Future agents can prove cache value and stop escalating once routed evidence is sufficient."}
```
- **optimalFutureWorkflow:**
  1. Run scout with JSON telemetry.
  2. Read routed compact slices only.
  3. Escalate to specialized/full index only on insufficiency.
  4. Record bytes, estimated tokens, latency, tier, and raw-scan avoidance.
  5. Stop when named acceptance thresholds pass.

### ROI-002 — Canonical cache-root resolver
- **improvementType:** `debugging_heuristic`
- **futureSavings:**
```json
{"tokenSavingsEstimate":"medium","timeSavingsEstimate":"high","toolCallsAvoided":4,"repeatedInvestigationAvoided":true,"implementationReworkAvoided":true,"appliesTo":["repository_retrieval","testing","debugging","deployment"],"futureEfficiencyImpact":"Agents skip repeated mount and environment diagnosis by resolving and reporting one canonical cache root."}
```
- **optimalFutureWorkflow:**
  1. Check explicit `CG_AUTHORITY_CACHE_ROOT`.
  2. Read machine profile.
  3. Probe approved mounted roots.
  4. Use ext4 fallback only when allowed.
  5. Emit root source, fallback flag, generation, and checksum result.

### ROI-003 — Mandatory ChatGPT branch-lane closure
- **improvementType:** `validation_rule`
- **futureSavings:**
```json
{"tokenSavingsEstimate":"medium","timeSavingsEstimate":"medium","toolCallsAvoided":3,"repeatedInvestigationAvoided":true,"implementationReworkAvoided":false,"appliesTo":["cursor_planning","repository_retrieval","testing"],"futureEfficiencyImpact":"Cursor starts from a stable committed artifact instead of reconstructing findings from chat history."}
```
- **optimalFutureWorkflow:**
  1. Confirm OBSERVED lane and harvest ID.
  2. Produce findings with classified evidence.
  3. Run pre-push self-check.
  4. Push only to `chat-gpt-harvest`.
  5. Report SHA/path and hand off ingest command.

### ROI-004 — Report-vs-command intent classification
- **improvementType:** `operator_preference`
- **futureSavings:**
```json
{"tokenSavingsEstimate":"medium","timeSavingsEstimate":"medium","toolCallsAvoided":2,"repeatedInvestigationAvoided":true,"implementationReworkAvoided":true,"appliesTo":["cursor_planning","coding","deployment"],"futureEfficiencyImpact":"Agents avoid opening new work or mutating branches when the operator is only reporting status."}
```

### ROI-005 — Safe-mutation fixture proof
- **improvementType:** `validation_rule`
- **futureSavings:**
```json
{"tokenSavingsEstimate":"low","timeSavingsEstimate":"high","toolCallsAvoided":4,"repeatedInvestigationAvoided":true,"implementationReworkAvoided":true,"appliesTo":["testing","debugging","deployment"],"futureEfficiencyImpact":"A controlled fixture proves the mutation cycle once and prevents risky estate-wide experimentation."}
```

### ROI-006 — Workflow and command retrieval
- **improvementType:** `retrieval_technique`
- **futureSavings:**
```json
{"tokenSavingsEstimate":"high","timeSavingsEstimate":"high","toolCallsAvoided":5,"repeatedInvestigationAvoided":true,"implementationReworkAvoided":true,"appliesTo":["cursor_planning","repository_retrieval","coding","testing","deployment"],"futureEfficiencyImpact":"Agents retrieve approved commands and workflows directly rather than rediscovering scripts and gates."}
```

## 13. Do-not-advance guards

1. Do not claim live retrieval, validation, completion, publication, or operational state from this draft.
2. Do not treat reported PRs, SHAs, tests, receipts, hashes, or generations as verified.
3. Do not merge `chat-gpt-harvest` directly to `main`.
4. Do not enable estate-wide bulk pull while material dirty trees remain.
5. Do not auto-promote prompt candidates.
6. Do not cache secret values.
7. Do not create duplicate seeds before registry lookup.
8. Do not conflate OBSERVED and ADVANCEMENT lanes.
9. Do not conflate host-specific incidents.

## 14. Seed packet candidates

### Seed A
```json
{
  "seedId":"IH-THREAD-HOT-CACHE-FEDERATED-DATASETS-V2",
  "kind":"protocol-upgrade",
  "status":"CANDIDATE",
  "improvementType":"planning_technique",
  "futureSavings":{"tokenSavingsEstimate":"high","timeSavingsEstimate":"high","toolCallsAvoided":5,"repeatedInvestigationAvoided":true,"implementationReworkAvoided":true,"appliesTo":["cursor_planning","repository_retrieval","coding","testing"],"futureEfficiencyImpact":"Future datasets reuse one governed platform instead of repeating architecture and integration work."},
  "optimalFutureWorkflow":["1. Search dataset registry","2. Resolve authority owner","3. Reuse shared schemas/compiler/publisher","4. Add routed compact fixture","5. Prove atomic publication and ACL read"],
  "retrievalQuestions":["How should a new AI hot-cache domain be governed?","Why avoid one monolithic everything index?"],
  "evidenceRefs":[{"ref":"EVT-002","classification":"ATTACHMENT_SOURCE"},{"ref":"EVT-003","classification":"CHAT_DIRECT"}],
  "futureAgentInstructions":{"whenThisAppears":"A new domain is proposed for caching.","startAt":"Dataset registry and authority source.","runPreflight":["Search registry","Search Authority Estate","Run duplication preflight"],"doNot":["Create a bespoke cache","Make cache authoritative"],"proveBeforeClaiming":["Schema pass","Deterministic compile","Atomic publish","ACL-aware routed read"]}
}
```

### Seed B
```json
{
  "seedId":"IH-THREAD-HOT-CACHE-ROOT-RESOLUTION-V2",
  "kind":"failure-pattern",
  "status":"CANDIDATE",
  "improvementType":"debugging_heuristic",
  "futureSavings":{"tokenSavingsEstimate":"medium","timeSavingsEstimate":"high","toolCallsAvoided":4,"repeatedInvestigationAvoided":true,"implementationReworkAvoided":true,"appliesTo":["repository_retrieval","testing","debugging","deployment"],"futureEfficiencyImpact":"Agents resolve the correct cache location once and avoid false misses and mount-debug loops."},
  "optimalFutureWorkflow":["1. Check explicit root","2. Load machine profile","3. Probe approved mounts","4. Select fallback only if allowed","5. Emit resolution telemetry and verify generation"],
  "retrievalQuestions":["Why did scout report HOT_CACHE_ROOT_MISSING?","What is the canonical root resolution order?"],
  "evidenceRefs":[{"ref":"EVT-008","classification":"USER_REPORTED_OPERATIONAL"},{"ref":"OF-003","classification":"USER_REPORTED_OPERATIONAL"}],
  "futureAgentInstructions":{"whenThisAppears":"A hook cannot find D:/S: or silently uses ext4.","startAt":"Resolve and report the selected root.","runPreflight":["Check env","Load machine profile","Probe mounts","Check fallback generation"],"doNot":["Assume shell env inheritance","Hide fallback use"],"proveBeforeClaiming":["resolved root","root source","fallback flag","hash verification"]}
}
```

### Seed C
```json
{
  "seedId":"IH-THREAD-CHATGPT-HARVEST-BRANCH-LANE-V2",
  "kind":"protocol-upgrade",
  "status":"CANDIDATE",
  "improvementType":"validation_rule",
  "futureSavings":{"tokenSavingsEstimate":"medium","timeSavingsEstimate":"medium","toolCallsAvoided":3,"repeatedInvestigationAvoided":true,"implementationReworkAvoided":false,"appliesTo":["cursor_planning","repository_retrieval","testing"],"futureEfficiencyImpact":"Cursor consumes one stable committed findings file and skips manual transcript extraction."},
  "optimalFutureWorkflow":["1. Confirm lane and harvest ID","2. Produce classified findings","3. Run self-check","4. Push to chat-gpt-harvest","5. Report SHA/path and ingest command"],
  "retrievalQuestions":["Which branch receives ChatGPT OBSERVED findings?","What must happen before Cursor ingest?"],
  "evidenceRefs":[{"ref":"EVT-012","classification":"ATTACHMENT_SOURCE"},{"ref":"COR-001","classification":"ATTACHMENT_SOURCE"}],
  "futureAgentInstructions":{"whenThisAppears":"A completed conversation is harvested in DRAFT_FILE mode.","startAt":"Confirm OBSERVED lane and target path.","runPreflight":["Confirm branch","Check path","Run self-check","Record SHA"],"doNot":["Push to main","Merge draft","Claim validation"],"proveBeforeClaiming":["File on branch","Commit SHA","not-run footer","Cursor ingest command"]}
}
```

### Seed D
```json
{
  "seedId":"IH-THREAD-SAFE-MUTATION-REFUSAL-V2",
  "kind":"lesson",
  "status":"CANDIDATE",
  "improvementType":"validation_rule",
  "futureSavings":{"tokenSavingsEstimate":"low","timeSavingsEstimate":"high","toolCallsAvoided":4,"repeatedInvestigationAvoided":true,"implementationReworkAvoided":true,"appliesTo":["testing","debugging","deployment"],"futureEfficiencyImpact":"Agents stop before unsafe estate mutation and avoid destructive cleanup work."},
  "optimalFutureWorkflow":["1. Parse status correctly","2. Separate ignored and material dirty files","3. Check branch/divergence/storage/upstream","4. Emit dry-run receipt","5. Mutate only a clean fixture"],
  "retrievalQuestions":["Why can zero pull-safe repos be a successful result?","What evidence is required before enabling bulk pull?"],
  "evidenceRefs":[{"ref":"EVT-006","classification":"USER_REPORTED_OPERATIONAL"},{"ref":"HP-005","classification":"USER_REPORTED_OPERATIONAL"}],
  "futureAgentInstructions":{"whenThisAppears":"A bulk operation reports no eligible targets.","startAt":"Eligibility evidence and material-dirty classification.","runPreflight":["Verify parser","Apply ignore rules","Check safety blockers","Run dry-run"],"doNot":["Force mutation","Treat safe refusal as failure"],"proveBeforeClaiming":["Per-repo reasons","Receipt","Clean fixture cycle"]}
}
```

### Seed E
```json
{
  "seedId":"IH-THREAD-STATUS-VS-IMPERATIVE-INTENT-V1",
  "kind":"lesson",
  "status":"CANDIDATE",
  "improvementType":"operator_preference",
  "futureSavings":{"tokenSavingsEstimate":"medium","timeSavingsEstimate":"medium","toolCallsAvoided":2,"repeatedInvestigationAvoided":true,"implementationReworkAvoided":true,"appliesTo":["cursor_planning","coding","deployment"],"futureEfficiencyImpact":"Agents avoid creating work or mutating repos when the operator is only reporting an existing state."},
  "optimalFutureWorkflow":["1. Identify imperative verbs","2. Separate completed-status evidence from requested action","3. Confirm only when consequential mutation is ambiguous","4. Execute only explicit requested work"],
  "retrievalQuestions":["Was the operator assigning a new task or reporting a completed action?","When should an agent act on a branch-status message?"],
  "evidenceRefs":[{"ref":"EVT-011","classification":"CHAT_DIRECT"},{"ref":"COR-002","classification":"CHAT_DIRECT"}],
  "futureAgentInstructions":{"whenThisAppears":"A message contains detailed completed work and a possible next step.","startAt":"Classify report vs request.","runPreflight":["Locate imperative clause","Check whether action already happened"],"doNot":["Assume every status report is a command"],"proveBeforeClaiming":["Explicit requested action identified"]}
}
```

## 15. Future-agent instructions

1. Pull `chat-gpt-harvest` and inspect this file.
2. Run duplication preflight before accepting seed IDs.
3. Verify reported merges, commits, generations, tests, and receipts.
4. Confirm Workflow Estate state and command-ID integrity.
5. Verify prompt approval in code/tests.
6. Verify root resolution under stripped hook environments.
7. Preserve evidence classifications and future-efficiency fields during ingest.
8. Keep host-specific incidents separate.
9. Prefer measured token reduction over estimates.

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

- [x] Verdict and T2 rationale.
- [x] Required retrieval block.
- [x] Scope and correction ledgers before EVT inventory.
- [x] Classified EVT/HP/ED/DUP evidence.
- [x] Major EVT/HP future-efficiency impacts.
- [x] Waste, operator friction, and ranked ROI.
- [x] Every ROI has `improvementType` and `futureSavings`.
- [x] ROI ranks 1–3 have `optimalFutureWorkflow`.
- [x] Top-three ROI seed candidates have multiple retrieval questions.
- [x] Every seed has `improvementType`, `futureSavings`, and `optimalFutureWorkflow`.
- [x] All seeds are `CANDIDATE`.
- [x] Publication truth entirely `not-run`.
- [x] No validation, completion, operational, or live retrieval claim.
- [x] Target branch is `chat-gpt-harvest`.

## 18. Next operator action

```bash
npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-05-hot-cache-platform-thread-autopsy-v2/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-05-hot-cache-platform-thread-autopsy-v2
npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-05-hot-cache-platform-thread-autopsy-v2
npm run harvest:sync-derived -- harvest-2026-08-05-hot-cache-platform-thread-autopsy-v2
npm run harvest:validate -- harvest-2026-08-05-hot-cache-platform-thread-autopsy-v2
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-05-hot-cache-platform-thread-autopsy-v2
npm run test:harvest
```

## 19. Git push closeout

```text
Repo: Capglass5708/CapitalGlass-Cross-Agent
Branch: chat-gpt-harvest
File: artifacts/agent-runs/harvest-2026-08-05-hot-cache-platform-thread-autopsy-v2/chatgpt-findings-source.md
Commit: harvest(chatgpt): draft findings harvest-2026-08-05-hot-cache-platform-thread-autopsy-v2
```

Do not merge this draft directly to `main`.

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
