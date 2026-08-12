# ChatGPT Findings Source — Harvest Protocol Self-Learning Lane C

## 1. Final summary

```text
Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Mode: DRAFT_FILE
Harvest ID: harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1
Tier: T2
Verdict: DRAFT_READY_FOR_CURSOR_VALIDATION
```

This thread established a protocol-only self-learning lane:

```text
Cross-Agent canonical harvest
→ Data-Extraction strict protocol filter
→ L:\02-catalog\Harvest\Harvest Protocol Self Learning
→ BY-KIND/harvest-protocol-self-learning-index.json
```

ChatGPT records visible-thread reports only. Cursor must verify Git, receipts, indexes, L publication, and freshness.

## 2. Harvest verdict and tier rationale

T2 applies because the thread spans multiple repositories and authority layers, includes operator corrections, production acceptance, protocol alignment, and all-spokes verification.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

## 4. Thread event inventory

- **EVT-001:** WaveRunner self-improvement catalog created and separated from authority.
- **EVT-002:** WaveRunner flow reported implemented, production-proven, merged, and closed.
- **EVT-003:** New target created: `L:\02-catalog\Harvest\Harvest Protocol Self Learning`.
- **EVT-004:** Operator narrowed scope to improvements to the harvest protocol itself only.
- **EVT-005:** Cross-Agent export and Data-Extraction strict processing reported implemented.
- **EVT-006:** Canonical Cursor/operator and ChatGPT protocols reported aligned with Lane C.
- **EVT-007:** All spokes reported verified; AppBuilder/Governance optional, application repos N/A.
- **EVT-008:** Lane C recorded operationally complete at `GO_WITH_WARN`.
- **EVT-009:** Separate maintenance deferred: `harvest-z-mirror-source-repair-v1`.

## 5. Harvest packets

### HP-001 — decision

```json
{
  "packetId": "HP-001",
  "kind": "decision",
  "decision": "Lane C contains only evidence-backed improvements to the harvest protocol.",
  "alternativesRejected": [
    "All build findings",
    "Raw closeouts or transcripts",
    "WaveRunner improvements",
    "Automatic protocol mutation"
  ],
  "evidenceRefs": ["Operator scope correction", "Lane C target path"]
}
```

### HP-002 — decision

```json
{
  "packetId": "HP-002",
  "kind": "decision",
  "decision": "Cross-Agent owns canonical records/export; Data-Extraction owns filtering, dedupe, normalization, publication, indexing, and retrieval verification.",
  "alternativesRejected": ["Application-repo fanout", "Data-Extraction approval authority"],
  "evidenceRefs": ["Ownership discussion", "All-spokes closeout"]
}
```

### HP-003 — protocol_upgrade

```json
{
  "packetId": "HP-003",
  "kind": "protocol_upgrade",
  "seedAs": "protocol-upgrade",
  "ownerRepo": "CapitalGlass-Cross-Agent",
  "promotionClass": "POLICY_GATED",
  "title": "Fail closed on Lane C relevance",
  "summary": "Require a named harvest-protocol target, evidence, and a protocol-level correction; reject general build findings.",
  "evidenceRefs": ["Operator scope correction", "Reported production packet exclusions"],
  "futureAgentInstructions": {
    "whenThisAppears": "Mixed build and protocol findings",
    "startAt": ["protocolImprovementCandidates[]", "strict classifier", "package inventory"],
    "runPreflight": ["test:protocol-self-learning-export", "test:harvest-protocol-self-learning"],
    "doNot": ["Copy raw closeouts", "Bypass relevance with generic OTHER"],
    "proveBeforeClaiming": ["accepted protocol count", "rejected unrelated count"]
  }
}
```

### HP-004 — protocol_upgrade

```json
{
  "packetId": "HP-004",
  "kind": "protocol_upgrade",
  "seedAs": "protocol-upgrade",
  "ownerRepo": "CapitalGlass-Cross-Agent",
  "promotionClass": "POLICY_GATED",
  "title": "Report Lane C publication independently",
  "summary": "Track eligibility, rejection, export, Data-Extraction processing, catalog publication, retrieval, authority, and mutation state separately.",
  "evidenceRefs": ["Lane C protocol alignment", "Repeated publication-versus-authority distinction"],
  "futureAgentInstructions": {
    "whenThisAppears": "A closeout claims Lane C complete",
    "startAt": ["protocolSelfLearning receipt", "publication receipt", "BY-KIND index"],
    "runPreflight": ["harvest:validate", "harvest:export:protocol-self-learning", "harvest-protocol:self-learning:verify"],
    "doNot": ["Infer publication from generic harvest completion", "Treat L as authority"],
    "proveBeforeClaiming": ["content hash", "INGESTION_COMPLETE.json", "RETRIEVAL_PASS"]
  }
}
```

### HP-005 — protocol_upgrade

```json
{
  "packetId": "HP-005",
  "kind": "protocol_upgrade",
  "seedAs": "failure-pattern",
  "ownerRepo": "CapitalGlass-Cross-Agent",
  "promotionClass": "POLICY_GATED",
  "title": "Protect Git protocols from stale Z-mirror overwrite",
  "summary": "Verify source completeness, freshness, and hashes before mirror sync replaces tracked protocol files.",
  "evidenceRefs": ["Reported test:harvest warning", "Reported missing mirror source"],
  "futureAgentInstructions": {
    "whenThisAppears": "Z mirror touches tracked protocol docs",
    "startAt": ["run-harvest-z-mirror-sync.test.mjs", "Z source manifest", "Git hashes"],
    "runPreflight": ["git status --short", "source existence", "hash compare"],
    "doNot": ["Overwrite from incomplete Z", "Call this a Lane C regression"],
    "proveBeforeClaiming": ["test:harvest PASS", "tracked files unchanged"]
  }
}
```

### HP-006 — repeated_work

```json
{
  "packetId": "HP-006",
  "kind": "repeated_work",
  "duplicateId": "DUP-LANE-OWNERSHIP-001",
  "firstKnownInstance": "WaveRunner routing discussion",
  "priorIndexSlice": "NEEDS_REGISTRY_LOOKUP_FIRST",
  "whyMissed": "Record, processing, retrieval, and approval ownership were repeatedly restated.",
  "evidenceRefs": ["Repeated spoke questions"]
}
```

### HP-007 — faster_path

```json
{
  "packetId": "HP-007",
  "kind": "faster_path",
  "situation": "Designing a classified cross-repo lane",
  "whatHappened": "Required, optional, and N/A spokes were resolved over several waves.",
  "rightFirstMove": "Build a spoke matrix plus strict eligibility/exclusions before implementation.",
  "requiredGuard": "No application fanout or authority change without a confirmed gap."
}
```

### HP-008 — blocker

```json
{
  "packetId": "HP-008",
  "kind": "blocker",
  "blockerId": "BLOCK-Z-MIRROR-SOURCE-MISSING",
  "status": "OPEN_SEPARATE_MAINTENANCE",
  "proofCommandId": "test:harvest",
  "evidenceRefs": ["Deferred harvest-z-mirror-source-repair-v1"]
}
```

### HP-009 — command

```json
{
  "packetId": "HP-009",
  "kind": "command",
  "command": "npm run harvest:export:protocol-self-learning -- --harvest-id=<id> --json",
  "host": "Cross-Agent",
  "provesGate": "Protocol-only handoff export",
  "expectedPassSignal": "Only protocolImprovementCandidates exported"
}
```

### HP-010 — command

```json
{
  "packetId": "HP-010",
  "kind": "command",
  "command": "npm run harvest-protocol:self-learning:verify -- --harvest-id=<id> --json",
  "host": "Data-Extraction with L mounted",
  "provesGate": "Package/index/retrieval validation",
  "expectedPassSignal": "RETRIEVAL_PASS; rawScanRequired=false"
}
```

## 6. Execution deltas

- **ED-001:** Processing owner initially ambiguous; optimal path is to separate record owner, processor, catalog, and approval authority at the start.
- **ED-002:** “Self learning” initially too broad; optimal path is to declare the exact self-learning object and exclusions before implementation.
- **ED-003:** Optional spokes were resolved late; optimal path is a required/optional/N/A spoke matrix in initial closure criteria.

## 7. Waste ledger

- **TW-001 — operator_attention, high:** Operator corrected Lane C to protocol-only. Prevention: mandatory self-learning object and exclusion list.
- **TW-002 — context, medium:** Ownership boundaries repeated. Prevention: owner-role table and spoke matrix.
- **TW-003 — verification, high:** Z mirror can overwrite Git protocols. Prevention: source/freshness/hash guard.

## 8. Duplication detector

- **DUP-001:** Ownership-boundary discussions repeated. Status: `NEEDS_REGISTRY_LOOKUP_FIRST`.
- **DUP-002:** Publication versus authority repeated. Preserve: `L proposal ≠ approved Git change ≠ Z CURRENT`.

## 9. Operator friction

- **OF-001:** Ambiguous meaning of self-learning. Fix: required `selfLearningObject`.
- **OF-002:** Repeated closure confirmation despite separate maintenance warning. Fix: closeout states whether warning reopens architecture.

## 10. ROI backlog

1. P0 — Repair Z mirror source and add overwrite guards.
2. P1 — Add exact self-learning object and exclusions to lane templates.
3. P1 — Require spoke matrix before cross-repo lane implementation.
4. P2 — Standardize independent classified-lane publication truth.
5. P2 — Require ownership/duplication registry lookup first.

## 11. Do-not-advance guards

- Do not treat Lane C L output as approved protocol authority.
- Do not auto-merge or auto-publish harvested protocol candidates.
- Do not route raw closeouts, transcripts, app defects, or general build lessons into Lane C.
- Do not fan Lane C into application repos.
- Do not reopen Lane C because of the separate Z-mirror warning.
- ChatGPT must not claim `HARVEST_COMPLETE`, `OPERATIONAL`, or `FULLY_SEEDED`.

## 12. Seed packet candidates

```json
{
  "schemaVersion": "harvest-seed-packet-v1@1.0.0",
  "seedId": "IH-THREAD-HARVEST-PROTOCOL-STRICT-CLASSIFIER-001",
  "kind": "protocol-upgrade",
  "title": "Protocol self-learning rejects general build intelligence",
  "summary": "Lane C accepts only evidence-backed harvest-protocol changes.",
  "retrievalQuestions": ["What belongs in Lane C?", "Why was a build finding rejected?"],
  "evidenceRefs": ["Operator scope correction", "Reported production exclusions"],
  "futureAgentInstructions": {
    "whenThisAppears": "Mixed harvest findings",
    "startAt": ["protocolImprovementCandidates[]", "strict classifier"],
    "runPreflight": ["test:protocol-self-learning-export", "test:harvest-protocol-self-learning"],
    "doNot": ["Copy raw closeouts", "Bypass relevance"],
    "proveBeforeClaiming": ["accepted count", "rejected unrelated count"]
  },
  "ownerRepo": "CapitalGlass-Cross-Agent",
  "targetSlice": "BY-KIND/harvest-protocol-self-learning-index.json",
  "promotionClass": "POLICY_GATED",
  "status": "CANDIDATE"
}
```

```json
{
  "schemaVersion": "harvest-seed-packet-v1@1.0.0",
  "seedId": "IH-THREAD-HARVEST-Z-MIRROR-GIT-GUARD-001",
  "kind": "failure-pattern",
  "title": "Stale Z mirror can overwrite Git harvest protocols",
  "summary": "Mirror sync must verify source existence, freshness, and hashes.",
  "retrievalQuestions": ["Why did test:harvest overwrite docs?", "How should Git authority be protected?"],
  "evidenceRefs": ["Reported Z-mirror warning", "Reported Git restore"],
  "futureAgentInstructions": {
    "whenThisAppears": "Mirror sync touches tracked docs",
    "startAt": ["mirror-sync test", "Z manifest", "Git hashes"],
    "runPreflight": ["git status --short", "source check", "hash compare"],
    "doNot": ["Copy incomplete source", "Commit mirror regression"],
    "proveBeforeClaiming": ["test:harvest PASS", "tracked files unchanged"]
  },
  "ownerRepo": "CapitalGlass-Cross-Agent",
  "targetSlice": "BY-KIND/thread-autopsy-index.json",
  "promotionClass": "POLICY_GATED",
  "status": "CANDIDATE"
}
```

```json
{
  "schemaVersion": "harvest-seed-packet-v1@1.0.0",
  "seedId": "IH-THREAD-CLASSIFIED-LANE-SPOKE-MATRIX-001",
  "kind": "lesson",
  "title": "Classified lanes require a spoke matrix",
  "summary": "Mark every spoke required, optional, N/A, or blocked before implementation.",
  "retrievalQuestions": ["Does AppBuilder need a bridge?", "Which repos must change?"],
  "evidenceRefs": ["All-spokes verification", "Optional AppBuilder/Governance findings"],
  "futureAgentInstructions": {
    "whenThisAppears": "A lane spans multiple control/data layers",
    "startAt": ["ownership registry", "ingestion contracts", "indexes"],
    "runPreflight": ["build spoke matrix", "verify commands", "inspect receipts"],
    "doNot": ["Fan out by default", "Create parallel schemas"],
    "proveBeforeClaiming": ["evidence for every required spoke"]
  },
  "ownerRepo": "CapitalGlass-Cross-Agent",
  "targetSlice": "BY-KIND/thread-autopsy-index.json",
  "promotionClass": "HUMAN_REVIEW",
  "status": "CANDIDATE"
}
```

## 13. Future-agent instructions

Name the learning object; define positive/negative eligibility; separate record, processing, retrieval, and approval roles; build a spoke matrix; reuse existing contracts; treat L as retrieval-only; prove exclusions; keep independent warnings from reopening closed architecture.

## 14. Publication truth

| Layer | State |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | pending until push succeeds |
| L staging | not-run |
| Cursor ingest | not-run |
| Lane C catalog | not-run by ChatGPT |
| Z AI cache | not-run |
| Supabase | not-run |
| Freshness | not-run |

```text
Publication: NOT_RUN_BY_CURSOR
protocolSelfLearning.exportStatus: not-run
protocolSelfLearning.dataExtractionStatus: not-run
protocolSelfLearning.catalogPublishStatus: not-run
protocolSelfLearning.retrievalStatus: not-run
protocolSelfLearning.authorityStatus: PROPOSAL
protocolSelfLearning.automaticProtocolMutation: false
```

## 15. Acceptance checklist

- [x] T2 draft, events, packets, deltas, waste, friction, ROI, guards, and seeds
- [x] Protocol-only scope preserved
- [x] Publication truth remains not-run
- [ ] Cursor duplication preflight and ingest
- [ ] Canonical validation
- [ ] Data-Extraction Lane C processing
- [ ] L publication, retrieval, and freshness receipts

## 16. Next operator action

```bash
git checkout chat-gpt-harvest
git pull origin chat-gpt-harvest

npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1

npm run harvest:duplication-preflight -- \
  --harvest-id=harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1

npm run harvest:sync-derived -- harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1
npm run harvest:validate -- harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1
```

Then use the canonical protocol-self-learning export and Data-Extraction flow. Do not claim Lane C publication until receipts and `RETRIEVAL_PASS` verify it.
