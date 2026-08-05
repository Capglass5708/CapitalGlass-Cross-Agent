# ChatGPT OBSERVED Thread Autopsy — Hot-Cache Platform

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

The conversation is long, correction-heavy, multi-topic, and contains reusable architecture, failure, governance, and execution patterns.

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
- **Reported open lanes:** Workflow Estate merge/verification; GHA recurring proof; measurement/observability. (`CROSS_CHECK_CANDIDATE`)
- **Deferred:** real estate-wide bulk pull, Supabase expansion, project/business datasets.
- **Do not merge:** this draft branch lane; OBSERVED and ADVANCEMENT intelligence; host-specific incidents.

## 5. Correction ledger

### COR-001
- **priorAssumption:** The earlier attached protocol required only a downloadable draft.
- **correction:** The current source-authority protocol mandates a push to `chat-gpt-harvest` in `DRAFT_FILE` mode.
- **correctedModel:** Push findings to the dedicated branch, report SHA/path, then hand off to Cursor.
- **affectedFindings:** EVT-012, HP-006, ED-006, ROI-003.

### COR-002
- **priorAssumption:** A branch-lane status message was a new Pilot A request.
- **correction:** The user clarified it described cleanup of an existing push.
- **correctedModel:** Treat status reports as reports unless execution is explicitly requested.
- **affectedFindings:** EVT-011, ED-007.

### COR-003
- **priorAssumption:** “Index everything” implied one broad index.
- **correction:** Use a federated set of governed datasets.
- **correctedModel:** Cache compact retrieval intelligence and authority pointers, not uncontrolled source copies.
- **affectedFindings:** EVT-002, HP-001, ED-001.

## 6. Thread event inventory

### EVT-001 — Expansion requested
**Evidence:** `CHAT_DIRECT`  
The user requested broader AI caching and indexing.

### EVT-002 — Git Estate plan supplied
**Evidence:** `ATTACHMENT_SOURCE`  
The plan defined Cross-Agent authority, AppBuilder compilation, full/compact/machine indexes, pull safety, and L publication.

### EVT-003 — Federated platform established
**Evidence:** `CHAT_DIRECT`  
Dataset registry, shared schemas, stable identities, query routing, freshness, ACLs, and compiler plugins were proposed.

### EVT-004 — Hardening added
**Evidence:** `CHAT_DIRECT`  
Dependencies, immutable generations, checksums, provenance, conflicts, budgets, ranking, and authorization-aware reads were added.

### EVT-005 — Foundation reported implemented
**Evidence:** `USER_REPORTED_OPERATIONAL`  
The user reported Git Estate, atomic publication, query routing, ACL-aware reads, and passing tests.

### EVT-006 — Scout, authority, refusal, and L fallback reported
**Evidence:** `USER_REPORTED_OPERATIONAL`  
The user reported routed compact retrieval, Authority Estate, valid bulk-pull refusal, durable L publication, hash alignment, and `DATASET_HIT_L` without raw scan.

### EVT-007 — Active Ledger and Closeout Index reported
**Evidence:** `USER_REPORTED_OPERATIONAL`  
The user reported 78 discovered records partitioned into 53 active and 25 closed with zero overlap.

### EVT-008 — Cache-root inconsistency observed
**Evidence:** `USER_REPORTED_OPERATIONAL`  
A stripped scout environment lacked the expected D:/S: root and used ext4 fallback.

### EVT-009 — Prompt extraction and projection reported
**Evidence:** `CROSS_CHECK_CANDIDATE`  
PRs, candidate registry, catalog delta, projection script, migration, and command entries were reported.

### EVT-010 — Workflow Estate reported opened
**Evidence:** `CROSS_CHECK_CANDIDATE`  
Eight workflows, stable command IDs, compiler gates, and explicit prompt-promotion approval were reported.

### EVT-011 — Existing push cleanup clarified
**Evidence:** `CHAT_DIRECT`  
The user corrected the interpretation of a branch-lane status message.

### EVT-012 — Current protocol mandates Git push
**Evidence:** `ATTACHMENT_SOURCE`  
The protocol requires OBSERVED `DRAFT_FILE` findings on `chat-gpt-harvest`, never `main`.

## 7. Harvest packets

### HP-001 — Federated governed datasets
- **Kind:** architecture-decision
- **Evidence:** `CHAT_DIRECT`
- Use one authority source, deterministic compiler, purpose-built variants, atomic publication, and retrieval contract per dataset.

### HP-002 — Derivative-only cache
- **Kind:** governance-pattern
- **Evidence:** `CHAT_DIRECT`
- Hot cache is rebuildable and never authoritative; retain source, hash, provenance, freshness, and classification.

### HP-003 — Immutable generation publication
- **Kind:** implementation-pattern
- **Evidence:** `USER_REPORTED_OPERATIONAL`
- Write immutable generation artifacts and checksums, verify, then flip `current.json` last.

### HP-004 — Routed compact retrieval
- **Kind:** performance-pattern
- **Evidence:** `USER_REPORTED_OPERATIONAL`
- Classify query, resolve aliases, load routed compact slices, apply ACLs/budgets, and escalate only on miss or insufficient detail.

### HP-005 — Safety refusal is success
- **Kind:** lesson
- **Evidence:** `USER_REPORTED_OPERATIONAL`
- Zero eligible mutations is correct when repositories are materially dirty, detached, diverged, missing, or otherwise unsafe.

### HP-006 — ChatGPT draft branch lane
- **Kind:** protocol-upgrade
- **Evidence:** `ATTACHMENT_SOURCE`
- Push OBSERVED findings only to `chat-gpt-harvest`; do not merge or claim validation/publication.

## 8. Execution deltas

### ED-001
**Evidence:** `CHAT_DIRECT`  
**Actual:** Git Estate-specific mechanism.  
**Optimal:** Git Estate as first plugin of a shared platform.

### ED-002
**Evidence:** `CHAT_DIRECT`  
**Actual:** TTL-centered freshness.  
**Optimal:** Per-dataset TTL fallback plus event invalidation.

### ED-003
**Evidence:** `CHAT_DIRECT`  
**Actual:** Individual atomic writes.  
**Optimal:** Dataset-generation atomicity and pointer-last activation.

### ED-004
**Evidence:** `USER_REPORTED_OPERATIONAL`  
**Actual:** Desire for estate-wide pull.  
**Optimal:** Mutation disabled until a clean fixture proves fetch, reevaluation, ff-only pull, SHA receipt, and isolation.

### ED-005
**Evidence:** `USER_REPORTED_OPERATIONAL`  
**Actual:** Temp cache test compared with real mounted L.  
**Optimal:** Isolated temporary Intelligence Hub root.

### ED-006
**Evidence:** `ATTACHMENT_SOURCE`  
**Actual:** Earlier chat-only findings output.  
**Optimal:** Mandatory branch push before Cursor ingest.

### ED-007
**Evidence:** `CHAT_DIRECT`  
**Actual:** Status report misread as a task.  
**Optimal:** Distinguish reporting from imperative execution.

## 9. Waste ledger

### TW-001
Repeated local/durable/fallback status restatement. (`CHAT_DIRECT`)  
**Improve:** Maintain one canonical status matrix and report deltas only.

### TW-002
Repeated architecture recapitulation after implementation reports. (`CHAT_DIRECT`)  
**Improve:** Use `confirmed / changed / blocked / next proof`.

### TW-003
Large duplicated conversation payloads. (`CHAT_DIRECT`)  
**Improve:** Parse the latest status section and treat replayed text as context.

### TW-004
Token savings estimated before instrumentation. (`CHAT_DIRECT`)  
**Improve:** Measure bytes/tokens, routing, escalation, misses, and raw scans.

## 10. Duplication detector

### DUP-001
- **Class:** `POSSIBLE_EXISTING_HARVEST`
- **Evidence:** `USER_REPORTED_OPERATIONAL`
- Search first for `HOT_CACHE_PLATFORM_OPERATIONAL` and `capital-glass-ai-hot-cache-consumption-authority-operations-v1`.
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
- WESLEY_WORK missing D:/S: and WESLEYDESK mounted L: are related but distinct host incidents.

## 11. Operator friction

- **OF-001:** Self-hosted WESLEYDESK runner queue. (`USER_REPORTED_OPERATIONAL`)
- **OF-002:** D:/S:/L mount variation by host/session. (`USER_REPORTED_OPERATIONAL`)
- **OF-003:** Stripped hook environment losing cache-root configuration. (`USER_REPORTED_OPERATIONAL`)
- **OF-004:** Materially dirty repo estate blocking mutation. (`USER_REPORTED_OPERATIONAL`)
- **OF-005:** Cross-repo merge dependency ordering. (`CHAT_DIRECT`)
- **OF-006:** GitHub mutation requiring user approval/login. (`CHAT_DIRECT`)
- **OF-007:** Protocol version drift. (`ATTACHMENT_SOURCE`)

## 12. ROI backlog

1. **Measurement/observability:** persist query class, datasets, tier, bytes/tokens, latency, ACL filtering, budget truncation, escalation, raw scans, and live compiles.
2. **Cache-root telemetry:** deterministic env → machine profile → mounted root → ext4 fallback resolution with selected-root reporting.
3. **ChatGPT branch-lane enforcement:** require `chat-gpt-harvest`, pre-push self-check, SHA/path report, and no direct merge.
4. **Workflow Estate verification:** validate command IDs, approvals, machines, mutation scopes, receipts, and rollback links.
5. **Failure Intelligence cache:** error fingerprints, proven fixes, failed attempts, host specificity, and operator actions.
6. **Infrastructure Estate:** machines, mounts, runner labels, roots, workloads, and service state.

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
  "seedId": "IH-THREAD-HOT-CACHE-FEDERATED-DATASETS-V1",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How should a new AI hot-cache domain be governed?",
    "Why should Capital Glass avoid one monolithic everything index?"
  ],
  "evidenceRefs": [
    {"ref":"EVT-002","classification":"ATTACHMENT_SOURCE"},
    {"ref":"EVT-003","classification":"CHAT_DIRECT"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears":"A new domain is proposed for caching.",
    "startAt":"Dataset registry and authority source.",
    "runPreflight":["Search dataset registry","Search Authority Estate","Run duplication preflight"],
    "doNot":["Create a bespoke cache","Make hot cache authoritative"],
    "proveBeforeClaiming":["Schema pass","Deterministic compile","Atomic publish","ACL-aware routed read"]
  }
}
```

### Seed B

```json
{
  "seedId": "IH-THREAD-HOT-CACHE-ROOT-RESOLUTION-V1",
  "kind": "failure-pattern",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why did scout report HOT_CACHE_ROOT_MISSING?",
    "What is the canonical cache-root resolution order?"
  ],
  "evidenceRefs": [
    {"ref":"EVT-008","classification":"USER_REPORTED_OPERATIONAL"},
    {"ref":"OF-003","classification":"USER_REPORTED_OPERATIONAL"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears":"A hook cannot find D:/S: or silently uses ext4.",
    "startAt":"Resolve and report the selected root.",
    "runPreflight":["Check CG_AUTHORITY_CACHE_ROOT","Load machine profile","Probe mounted roots","Check fallback generation"],
    "doNot":["Assume shell env inheritance","Hide fallback use"],
    "proveBeforeClaiming":["resolvedHotCacheRoot","hotCacheRootSource","fallbackUsed","hash verification"]
  }
}
```

### Seed C

```json
{
  "seedId": "IH-THREAD-CHATGPT-HARVEST-BRANCH-LANE-V1",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Which branch receives ChatGPT OBSERVED findings?",
    "What must happen before Cursor ingest?"
  ],
  "evidenceRefs": [
    {"ref":"EVT-012","classification":"ATTACHMENT_SOURCE"},
    {"ref":"COR-001","classification":"ATTACHMENT_SOURCE"}
  ],
  "futureAgentInstructions": {
    "whenThisAppears":"A completed conversation is harvested in DRAFT_FILE mode.",
    "startAt":"Confirm OBSERVED lane and harvest ID.",
    "runPreflight":["Confirm chat-gpt-harvest","Check target path","Run self-check","Record SHA/path"],
    "doNot":["Push to main","Merge draft","Claim validation"],
    "proveBeforeClaiming":["File on branch","Commit SHA","not-run publication footer","Cursor ingest command"]
  }
}
```

## 15. Future-agent instructions

1. Pull `chat-gpt-harvest` and inspect this file.
2. Run duplication preflight before accepting seed IDs.
3. Verify reported merges, commits, generations, tests, and receipts.
4. Confirm Workflow Estate state and command-ID integrity.
5. Verify prompt approval in code/tests.
6. Verify root resolution under stripped hook environments.
7. Preserve evidence classifications during ingest.
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
- [x] Waste, operator friction, and ranked ROI.
- [x] Top-three ROI seed candidates with multiple retrieval questions.
- [x] All seeds are `CANDIDATE`.
- [x] Do-not-advance guards.
- [x] Publication truth entirely `not-run`.
- [x] No validation, completion, operational, or live retrieval claim.
- [x] Target branch is `chat-gpt-harvest`.

## 18. Next operator action

```bash
npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-04-hot-cache-platform-thread-autopsy-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-04-hot-cache-platform-thread-autopsy-v1
npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-04-hot-cache-platform-thread-autopsy-v1
npm run harvest:sync-derived -- harvest-2026-08-04-hot-cache-platform-thread-autopsy-v1
npm run harvest:validate -- harvest-2026-08-04-hot-cache-platform-thread-autopsy-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-04-hot-cache-platform-thread-autopsy-v1
npm run test:harvest
```

## 19. Git push closeout

```text
Repo: Capglass5708/CapitalGlass-Cross-Agent
Branch: chat-gpt-harvest
File: artifacts/agent-runs/harvest-2026-08-04-hot-cache-platform-thread-autopsy-v1/chatgpt-findings-source.md
Commit: harvest(chatgpt): draft findings harvest-2026-08-04-hot-cache-platform-thread-autopsy-v1
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
