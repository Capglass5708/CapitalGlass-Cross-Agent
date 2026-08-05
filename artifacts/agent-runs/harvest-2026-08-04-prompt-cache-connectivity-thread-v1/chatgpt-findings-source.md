# Chat Thread Closeout Autopsy Findings — Prompt Harvest, Cache Hardening, and Host Connectivity

## 1. Final summary

```text
Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Start verdict: UNHARVESTED_THREAD
Target tier: T2
Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION
```

This thread established the harvested-prompt lifecycle from conversation review through candidate extraction, operator approval, PromptOps authority, prompt-catalog routing, execution-packet binding, Intelligence Hub publication, Supabase projection, and host-cache distribution. It also exposed durable improvements for deterministic prompt-catalog compaction and cached connectivity intelligence for WESLEYDESK and RYZEN9DESK.

All implementation and publication claims below are copied from operator/Cursor reports visible in the conversation and remain cross-check candidates until Cursor validates them against Git, receipts, indexes, and live systems.

## 2. Harvest verdict and tier rationale

**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

**Tier:** T2 — the thread contains corrections, multiple gates, host-specific environmental failures, publication recovery, cache hardening, and explicit closeout boundaries.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

ChatGPT did not execute live index, Git, L, Z, or Supabase commands in this harvest lane.

## 4. Thread event inventory

- **EVT-001:** Execution-packet/Supabase activation was reported closed; WESLEYDESK auto-publication remained separate and non-blocking.
- **EVT-002:** A harvest extension was designed to extract reusable prompt candidates, classify, deduplicate, review/promote, update PromptOps/prompt-catalog, bind execution packets, index, seed Supabase, and write receipts.
- **EVT-003:** The user required independent testing and gating of Cursor’s implementation rather than accepting its completion summary.
- **EVT-004:** Z harvest mirror and ingestion wiring were reported shipped, but the first Z write was blocked because Z was not mounted.
- **EVT-005:** Extraction, approval, Supabase, and tests were distinguished from environmental Z/L publication gates.
- **EVT-006:** Massive WESLEYDESK connectivity issues triggered a separate full-stack diagnosis covering Windows, WSL, DNS, routes, Tailscale, SSH, SMB, mapped drives, runner, cache, storage, identity, startup, and persistence.
- **EVT-007:** Gate 4 failure was diagnosed as an interrupted full publish plus duplicate seed collisions; `--allow-republish` did not replace explicit seed supersession.
- **EVT-008:** Gate 4 was reported complete with `OPERATIONAL`, an operational publication receipt, a 22-record L prompt-harvest index, and approved prompt `harvest:prompt-candidate-063359b2149d`.
- **EVT-009:** RYZEN9DESK local cache fanout remained separate because its local cache root was not reachable from WESLEY_WORK.
- **EVT-010:** The user directed that WESLEYDESK and RYZEN9DESK connectivity intelligence be cached.
- **EVT-011:** Prompt-catalog routing, execution-packet dependencies, publication ordering, and lazyCatalog payload-hash handling were reported hardened.
- **EVT-012:** A runtime compactness gap remained: 40 prompt records exceeded `maxRecords: 25`, allowing `DATASET_HIT` while omitting the compact slice.
- **EVT-013:** The next milestone was bounded to deterministic compact trimming, over-budget tests, CI wiring, receipt, and closeout.

## 5. Harvest packets

### HP-001 — architecture-decision: PromptOps remains authority

Harvest may discover reusable prompts, but approval authority remains in PromptOps. Hot cache and Supabase are derivative retrieval/projection layers. Harvested text does not gain mutation authority.

### HP-002 — protocol-upgrade: Prompt extraction belongs in closeout

Completed conversations should be reviewed for reusable prompts, command sequences, guardrails, stop conditions, expected outputs, and repeated decision logic. Candidate extraction should preserve provenance and exclude secrets/transient identifiers.

### HP-003 — failure-pattern: Publication failure misclassified as extraction failure

Prompt extraction, approval, Supabase projection, and tests may be healthy while L publication is blocked by storage, interruption, or duplicate seed IDs. These gates must remain separate.

### HP-004 — failure-pattern: Republish does not supersede seeds

`--allow-republish` bypasses harvest-level republish checks but does not bypass seed-ID collision checks. Republish preflight must enumerate exact `--allow-supersede-seed` arguments.

### HP-005 — lesson: Shared NAS publication is host-independent

A valid L publication can run from any approved host with L mounted. Host identity matters for local cache distribution, not for the authority of the shared L write.

### HP-006 — protocol-upgrade: Cache host connectivity intelligence

Create compact, non-secret host profiles and recovery packets for WESLEYDESK and RYZEN9DESK: machine role, approved connection methods, SSH identity pattern, SMB shares, WSL mounts, runner procedures, known failure signatures, validation commands, source SHA, and safety boundaries.

### HP-007 — failure-pattern: Over-budget prompt catalog drops compact slice

A catalog can route and return `DATASET_HIT` while the runtime compact payload omits the entire dataset because record count exceeds the cap.

### HP-008 — architecture-decision: Deterministic compact selection

Filter approved/runtime-eligible records, rank by `usageRank` descending, tie-break by `promptId` ascending, take `maxRecords`, preserve total/included/omitted counts, and produce a stable hash independent of source ordering.

## 6. Execution deltas

- **ED-001:** Publication prerequisites and duplicate-seed behavior were discovered after implementation rather than before the long publish run.
- **ED-002:** Shared authority publication and target-host local cache distribution were initially conflated.
- **ED-003:** Prompt-catalog routing passed before below-limit/exact-limit/over-limit compact tests existed.
- **ED-004:** Host access, WSL mounts, runner state, and recovery procedures were repeatedly rediscovered instead of resolved from a cached host profile.

## 7. Waste ledger

- **TW-001:** Completed prompt extraction, Supabase, and test gates were repeatedly restated while only publication/distribution remained.
- **TW-002:** WESLEYDESK was treated as a publication requirement even though L is shared authority.
- **TW-003:** A full connectivity diagnostic is expensive for known drive-mount signatures; use a quick classifier before escalating.
- **TW-004:** Long tests were interrupted before publication; permit receipt-backed `--skip-tests` only for the same tested source SHA.

## 8. Duplication detector

- **DUP-001 — NEEDS_REGISTRY_LOOKUP_FIRST:** Do not create another prompt-harvest verification mission before checking the existing verification receipt and approved index entry.
- **DUP-002 — NEEDS_REGISTRY_LOOKUP_FIRST:** Keep RYZEN9DESK local cache fanout separate; do not reopen prompt-harvest implementation.
- **DUP-003 — NEEDS_REGISTRY_LOOKUP_FIRST:** Resolve host-connectivity records before drafting another broad SSH/SMB/WSL/runner diagnosis.

## 9. Operator friction

- **OF-001:** Z and L required manual `drvfs` mounts.
- **OF-002:** Long publication did not provide enough stage visibility before interruption.
- **OF-003:** Five duplicate seed IDs required manually constructed supersede arguments.
- **OF-004:** RYZEN9DESK local cache root was unavailable to remote fanout.
- **OF-005:** `DATASET_HIT` did not guarantee compact-slice presence.

## 10. ROI backlog

1. **Deterministic prompt-catalog compact trim** — highest value; prevents full compact-slice omission.
2. **Host-connectivity dataset and execution packets** — reduces repeated rediscovery of connection and recovery procedures.
3. **Publication preflight with generated supersede command** — catches collisions before long tests.
4. **Receipt-backed skip-tests policy** — avoids repeating validated tests for the same SHA.
5. **Prompt-catalog resolver** — useful later, but lower priority than compact-slice presence.

## 11. Do-not-advance guards

- Do not reopen `supabase-hot-cache-execution-packets-v1`.
- Do not reopen verified prompt extraction without direct regression evidence.
- Do not make RYZEN9DESK cache distribution a blocker for the closed prompt-harvest milestone.
- Do not bind shared L publication to WESLEYDESK.
- Do not cache passwords, private keys, tokens, credentials, or unrestricted mutation authority.
- Do not auto-promote harvested prompts or create a second authority beside PromptOps.
- Do not drop a complete compact dataset solely because it exceeds `maxRecords`.
- Do not add resolver, Supabase 401 repair, host-fanout redesign, or observation waves to the compact-trim milestone.

## 12. Seed packet candidates

### Seed 1

```json
{
  "seedId": "IH-THREAD-PROMPT-CATALOG-COMPACT-TRIM-001",
  "kind": "protocol-upgrade",
  "title": "Trim over-budget prompt catalog instead of dropping compact slice",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why does Scout report DATASET_HIT while prompt-catalog is absent from the compact runtime slice?",
    "How should prompt-catalog records be selected when source records exceed maxRecords?",
    "What deterministic tie-break should equal usage ranks use?"
  ],
  "evidenceRefs": ["EVT-012", "EVT-013", "HP-007", "HP-008"],
  "futureAgentInstructions": {
    "whenThisAppears": "prompt-catalog routes but compact payload is absent or over budget",
    "startAt": "inspect compact builder and runtime eligibility filters",
    "runPreflight": ["measure source/eligible counts and budgets", "run over-limit fixture"],
    "doNot": ["drop full dataset", "promote ineligible prompts", "depend on source order"],
    "proveBeforeClaiming": ["25 of 40 selected", "stable rank/tie-break", "stable hash", "compact slice present"]
  }
}
```

### Seed 2

```json
{
  "seedId": "IH-THREAD-HOST-CONNECTIVITY-CACHE-002",
  "kind": "architecture-decision",
  "title": "Cache compact connectivity intelligence for WESLEYDESK and RYZEN9DESK",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How do I connect to WESLEYDESK or RYZEN9DESK through the approved route?",
    "Which WSL mounts, SMB shares, runner services, and validation commands belong to each host?",
    "Which failure signatures should be checked before a full diagnostic?"
  ],
  "evidenceRefs": ["EVT-006", "EVT-009", "EVT-010", "HP-006"],
  "futureAgentInstructions": {
    "whenThisAppears": "an agent must connect to, diagnose, mount storage on, or sync cache to a desk",
    "startAt": "resolve host-connectivity profile and matching packet",
    "runPreflight": ["verify live host identity/route/service", "verify profile freshness"],
    "doNot": ["cache secrets", "assume observed IP is current", "mutate without live verification"],
    "proveBeforeClaiming": ["approved route works", "required services/storage pass", "target-local state verified"]
  }
}
```

### Seed 3

```json
{
  "seedId": "IH-THREAD-HARVEST-REPUBLISH-SUPERSEDE-003",
  "kind": "failure-pattern",
  "title": "Harvest republish requires explicit seed supersession",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why did publish return DUPLICATE_BLOCKED even with allow-republish?",
    "How should required allow-supersede-seed arguments be generated before tests?",
    "When is skip-tests safe during republish closeout?"
  ],
  "evidenceRefs": ["EVT-007", "EVT-008", "HP-004", "TW-004"],
  "futureAgentInstructions": {
    "whenThisAppears": "a previously published harvest is being republished",
    "startAt": "run duplication preflight and enumerate exact seed IDs",
    "runPreflight": ["check previous receipt", "check same-SHA test receipt", "generate exact arguments"],
    "doNot": ["assume allow-republish bypasses seeds", "delete existing seeds", "rerun tests blindly"],
    "proveBeforeClaiming": ["OPERATIONAL", "publication receipt exists", "expected BY-KIND record exists"]
  }
}
```

### Seed 4

```json
{
  "seedId": "IH-THREAD-PROMPT-HARVEST-GATE-SEPARATION-004",
  "kind": "lesson",
  "title": "Separate extraction, approval, projection, publication, and host distribution gates",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Which prompt-harvest gate is actually failing?",
    "Does failed L publication mean extraction or Supabase is broken?",
    "When should target-host cache fanout be separate?"
  ],
  "evidenceRefs": ["EVT-005", "EVT-008", "EVT-009", "HP-003", "HP-005"],
  "futureAgentInstructions": {
    "whenThisAppears": "prompt-harvest closeout is partially blocked",
    "startAt": "read gate matrix and receipts",
    "runPreflight": ["check extraction", "check approval/projection", "check L receipt", "check host cache separately"],
    "doNot": ["reopen completed gates", "bind L to one host", "treat local cache as authority"],
    "proveBeforeClaiming": ["each gate has evidence", "next actions list unresolved gates only"]
  }
}
```

## 13. Future-agent instructions

1. Resolve existing receipts and harvest records before starting implementation.
2. Treat the reported prompt-harvest milestone as closed unless validation finds regression.
3. Inspect routing, lazy catalog, compact slice, and packet overrides separately.
4. Resolve a host-connectivity packet before broad diagnosis.
5. Separate shared authority layers from host-local derivative caches.
6. Run duplicate-seed preflight before republishing.
7. Use receipt-backed `--skip-tests` only for the same SHA.
8. Preserve explicit stop conditions and bounded scope.
9. Never infer mutation authority from harvested prompt text.
10. Run duplication preflight before approving these candidates.

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

- [x] Final summary and tier rationale
- [x] Retrieval preflight
- [x] Thread event inventory
- [x] Eight harvest packets
- [x] Execution deltas and waste ledger
- [x] Duplication detector and operator friction
- [x] Ranked ROI backlog and guards
- [x] Four seed candidates with retrieval questions and future-agent instructions
- [x] Publication truth table all `not-run`
- [x] Cursor handoff command
- [x] No ChatGPT claim of `HARVEST_COMPLETE`, `OPERATIONAL`, or `FULLY_SEEDED`

## 16. Next operator action

Cursor must ingest, run duplication preflight, validate, and only then permit operator-controlled publication.

## 17. Cursor ingest handoff

```bash
npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-04-prompt-cache-connectivity-thread-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-04-prompt-cache-connectivity-thread-v1

npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-04-prompt-cache-connectivity-thread-v1
npm run harvest:sync-derived -- harvest-2026-08-04-prompt-cache-connectivity-thread-v1
npm run harvest:validate -- harvest-2026-08-04-prompt-cache-connectivity-thread-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-04-prompt-cache-connectivity-thread-v1
npm run test:harvest
# operator only after validation:
npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-04-prompt-cache-connectivity-thread-v1
```

```text
Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION
```