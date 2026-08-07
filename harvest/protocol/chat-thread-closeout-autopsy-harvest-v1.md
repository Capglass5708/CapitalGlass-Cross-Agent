# Chat Thread Closeout Autopsy, Harvest, and Intelligence Hub Seed Protocol v1.1

**Work package pattern:** `chat-thread-closeout-autopsy-harvest-v1` or `harvest-YYYY-MM-DD-<slug>-v1`  
**Authority repo:** CapitalGlass-Cross-Agent  
**Companion:** [Intelligence Hub accommodation](../intelligence-hub/thread-autopsy-hub-accommodation-v1.md)  
**Base harvest runbook:** [harvest-record-validate-sync.md](./harvest-record-validate-sync.md)  
**Compounding context:** `L:\02-catalog\Harvest\GOLD-MINE-NORTH-STAR-CHARTER.md` (harvest → Hub → Gold Mine → implementation → remeasure)

---

## Purpose

Convert a completed ChatGPT or Cursor thread into **reusable Intelligence Hub knowledge** by extracting:

- Outcomes and current truth
- Mistakes and wrong assumptions
- Repeated work and prior solutions missed
- Missed shortcuts (index, cache, command, host lane)
- Evidence (SHAs, run IDs, receipts, DOM proofs)
- Commands that prove gates
- Blockers and do-not-advance guards
- Protocol upgrades (rules, hooks, runbooks, index slices)
- **Future-agent instructions** — start at X, run Y, never do Z

This is **not** a chat summary. It is a **thread autopsy and intelligence extraction protocol**.

**v1.1 compounding rule:** Harvest deliberately generates high-quality evidence for Gold Mine classification — problems, resolutions, adoption, performance, friction, observability gaps, and product opportunities — not narrative alone.

Cross-Agent records coordination, receipts, ledger updates, and seed manifests only. Implementation code belongs in owner repos. **Data-Extraction** owns Gold Mine discovery, candidate digests, and §10 remeasurement; harvest supplies semantic evidence upstream.

---

## Operating verdict

Start every run with:

```text
Mission: chat-thread-closeout-autopsy-harvest-v1
Start verdict: UNHARVESTED_THREAD
Target tier: T1 (default) | T2 (full autopsy) | T3 (publication intent)
```

| Verdict | Meaning |
| --- | --- |
| `HARVEST_COMPLETE` | Structured packets + autopsy bundle validate; recording done |
| `HARVEST_PARTIAL` | Prose-heavy or missing evidence; not ship-ready |
| `HARVEST_BLOCKED` | Missing authority, repo access, or index state |
| `NO_HARVEST_NEEDED` | No durable operational, code, architecture, or decision value |

Publication is **separate** from recording (`projection.hubPublishStatus`: `not-run` | `published` | `drift` | `blocked`).

Do not claim hub publication or `FULLY_SEEDED` without `index:freshness-gate` receipt.

---

## Grade target: A- → A+

| Grade | Criteria |
| --- | --- |
| **A-** | Tiered harvest composes with manifest + scout preflight |
| **A+** | Every durable claim has `evidenceRefs`; waste ledger populated or `NONE_FOUND` with proof; ROI ranked; seed packets atomic + retrieval-tested; validator fails prose-only harvests |

**Hard rule:** Mostly markdown narrative without structured packets → `HARVEST_PARTIAL`, never `HARVEST_COMPLETE`.

---

## Non-negotiable authority rules

1. Cross-Agent is coordination authority, not an implementation repo.
2. Start from Intelligence Hub or Cross-Agent index before broad repo grep.
3. Log retrieval: `INDEX_HIT_AI_CACHE` | `INDEX_HIT` | `INDEX_MISS` | `L_DRIVE_NOT_MOUNTED_IN_WSL` | `FAILOVER_SUPABASE` | `FAILOVER_GIT_LEDGER`.
4. Do not advance operational awards without receipts.
5. Do not mark a blocker closed because a prompt says so — verify artifact, command, or commit.
6. Wrong moves must be structured records, not buried prose.
7. Cursor agents **record only** — operator runs `index:publish` and hub seed publish.
8. **Stable identity invariant:** ordinals (`HP-###`, `GOLD-####`, packet sequence) are presentation only. Cross-run correlation must use content hashes, `candidateDigest`, `packetId`, `workPackageId`, `sourceCommitSha`, or other stable semantic identifiers.
9. **No distinct-signal suppression:** low-value, deferred, uncertain, or currently infeasible observations remain eligible Gold Mine evidence. Harvest may deduplicate true duplicates but must not discard valid improvement signals because they appear unimportant.
10. **Resolved-but-visible:** findings with `lifecycleState: RESOLVED_OBSERVED` (or equivalent resolution hint) must remain retrievable — resolution is not deletion.

---

## Gold Mine evidence contract (v1.1)

Each canonical packet (or parallel projection file `gold-mine-evidence-projections-v1.json`) should project into:

```json
{
  "signalClass": "PROBLEM_SIGNAL",
  "lifecycleHint": "OPEN",
  "rootCauseKey": "",
  "candidateDigestRef": "",
  "implementationDigestRef": "",
  "workPackageId": "",
  "evidenceStrength": "low|medium|high",
  "sourceDiversity": {},
  "operatorImpact": "",
  "businessImpact": "PLATFORM_INTERNAL",
  "evidenceEra": "PRE_IMPLEMENTATION",
  "observedAt": "ISO-8601",
  "sourceRunId": "",
  "sourceWorkPackageId": "",
  "sourceCommitSha": "",
  "novelty": "NEW",
  "implementationState": "OBSERVED_OPEN",
  "resolves": [],
  "supersedes": [],
  "adopts": [],
  "validatesExisting": [],
  "contradicts": [],
  "regresses": []
}
```

| `signalClass` | Use when |
| --- | --- |
| `PROBLEM_SIGNAL` | Recurring defect, friction, failure, gap |
| `RESOLUTION_SIGNAL` | Fix/adoption evidence; pair with `implementationState` |
| `ADOPTION_SIGNAL` | Contract/tooling adopted and in use |
| `PERFORMANCE_SIGNAL` | Latency, throughput, cache, duration |
| `OPERATOR_FRICTION_SIGNAL` | Manual steps, re-entry, intervention |
| `AGENT_FRICTION_SIGNAL` | Scout/cache/routing/tooling pain for agents |
| `OBSERVABILITY_GAP` | Could not measure what we needed |
| `BUSINESS_WORKFLOW_SIGNAL` | Estimating, documents, bids, proposals, field ops |
| `SUCCESS_PATTERN` | Evidence-backed pattern that worked well |

Data-Extraction remains responsible for final discovery and candidate creation. Harvest provides cleaner semantic evidence.

**Optional artifact schema:** `scripts/harvest/schema/gold-mine-evidence-projection-v1.schema.json` (Cross-Agent). Validators may warn-only until v1.1 enforcement lands.

### Compounding downstream loop (post-publication)

```text
validated harvest
→ Intelligence Hub publication
→ Gold Mine ingest / discovery (Data-Extraction)
→ operator-approved implementation wave
→ product-estate operational proof / new harvest
→ Gold Mine §10 remeasurement
→ updated manifest + open candidates
```

Harvest protocol ends at validated publication; **§10 remeasurement is a formal downstream consumer**, not harvest authority.

## Lanes

### Lane A — owner-repo material work

Single repo, code changes, gates, deploy:

1. Auto v3.2 `session-closeout-v3.2.json` in mutation repo
2. Optional `npm run harvest:closeout -- --work-package=<id>` in CG-AppBuilder-MCP
3. If operator friction or rework occurred, attach `threadAutopsy` or open a Cross-Agent coordination harvest

### Lane B — cross-thread autopsy (this protocol)

Spans hosts, blockers, awards, or multiple owner repos:

- Authority: `artifacts/agent-runs/<harvest-id>/harvest-manifest-v1.json`
- Autopsy: `thread-autopsy-bundle.json` + `seed-packets/`
- Chain: `harvest:sync-derived` → `harvest:render-index` → `harvest:validate` → `test:harvest`

### Lane C — Harvest Protocol Self-Learning

Use this lane only when a validated harvest contains evidence-backed improvements to the **harvest protocol itself**.

**Eligible examples:**

- harvest schemas and validators
- packet and evidence requirements
- duplication prevention
- retrieval preflight
- waste-ledger and operator-friction capture
- execution-delta handling
- seed-packet quality
- publication truth
- closeout handoff
- protocol routing
- prompt extraction and PromptOps promotion boundaries
- harvest indexes, freshness, commands, tests, rollback, versioning, supersession, and authority protections

**Explicitly excluded:**

- application bugs
- product ideas
- build or deployment findings
- repository-specific engineering lessons
- general SDLC improvements unrelated to harvest behavior
- raw closeouts
- full transcripts
- general Intelligence Hub seeds

**Ownership:**

- **CapitalGlass-Cross-Agent** owns canonical harvest records, provenance, validation, and protocol-improvement export.
- **Data-Extraction** owns protocol relevance filtering, deduplication, normalization, package preparation, publication, indexing, and retrieval verification.
- **L** is retrieval and proposal storage only (`PROPOSAL` / `RETRIEVAL_ONLY`).
- **Governance / Git** approves protocol changes.
- **Z** publishes approved protocol releases only.

**Target catalog:**

`L:\02-catalog\Harvest\Harvest Protocol Self Learning`

Lane C is **separate** from Lane B Intelligence Hub seed publication and from the WaveRunner self-improvement lane (`L:\02-catalog\SDLC Gated Wave Protocols\WaveRunner Self Improvements Harvesting`). Do not merge outputs.

**Lane D — Gold Mine estate projection (downstream, not Lane C):**

- **Lane C** = improve the harvest protocol itself.
- **Gold Mine projection** = improve the broader Capital Glass estate from harvested evidence.

Do not route application/product findings into Lane C. Project them via `goldMineSignalClass` / `gold-mine-evidence-projections-v1.json` for Data-Extraction discovery.

**Eligibility (all required):**

1. Identifies a defect, weakness, inefficiency, or missing control in the harvest protocol.
2. Names a harvest protocol file, schema, validator, command, index, publisher, or authority rule.
3. Contains evidence references.
4. Proposes a protocol-level improvement.
5. Is not merely a build or application lesson.

Unrelated packets remain in their existing lanes and must **not** appear in the Lane C package.

---

## Tiered depth

| Tier | When | Mandatory |
| --- | --- | --- |
| **T0** | No durable value | `NO_HARVEST_NEEDED` + 3-line rationale |
| **T1** | Default closeout | Manifest packets, `doNotAdvance`, waste ledger or `NONE_FOUND`, ROI ranked, duplication check logged, operator friction if user corrections |
| **T2** | Long thread, frustration, multi-host, rework | T1 + `executionDeltas[]`, code-touch summary, atomic seed packets |
| **T3** | Publication intent | T2 + operator publication checklist; publish commands `NOT_RUN_BY_CURSOR` |

**Auto-escalate T1→T2** when: >40 turns, ≥2 repos, user correction, same command ≥2×, or `INDEX_MISS`.

---

## Nine mandatory packet kinds

Every T1+ harvest must cover applicable kinds (structured JSON, not prose):

| Kind | Role | Key fields |
| --- | --- | --- |
| **decision** | What was decided | `decision`, `alternativesRejected`, `evidenceRefs` |
| **blocker** | What blocks progress | `blockerId`, `status`, `proofCommandId`, `evidenceRefs` |
| **mistake** | Wrong move | `wrongMoveId`, `actualExecution`, `optimalExecution`, `preventiveControl` |
| **repeated_work** | Duplication hit | `duplicateId`, `firstKnownInstance`, `priorIndexSlice`, `whyMissed` |
| **faster_path** | Execution delta | `situation`, `whatHappened`, `rightFirstMove`, `requiredGuard` |
| **command** | Proof command | `command`, `host`, `provesGate`, `expectedPassSignal` |
| **evidence** | Receipt anchor | `type`, `pathOrSha`, `provesWhat` |
| **protocol_upgrade** | Reusable guard | `seedAs`, `ownerRepo`, `promotionClass`, `futureAgentInstructions` |
| **outcome** | Post-implementation result | `changeImplemented`, `beforeState`, `afterState`, `measurement`, `expectedEffect`, `observedEffect`, `residuals`, `regressions`, `effectiveness` |

**`outcome.effectiveness`:** `PROVEN_EFFECTIVE` | `PARTIAL` | `NO_OBSERVABLE_EFFECT_YET` | `INEFFECTIVE` | `REGRESSED`

Optional on all kinds: `goldMineSignalClass`, `novelty`, `implementationState`, `businessImpact`, `evidenceEra`, `goldMineProjection` (see Gold Mine evidence contract).

Packets: `harvest-manifest-v1.json` → `packets[]` + `compact-records/<packet-id>.json`.

---

## Phase model

| Phase | Output | A+ gate |
| --- | --- | --- |
| **0. Triage & scout** | Tier, `harvest-YYYY-MM-DD-<slug>-v1`, retrieval log | `npm run agent:index:scout -- --json` attempted |
| **1. What happened** | `thread-event-inventory.json` | Events with `evidenceRefs` |
| **2. Packet harvest** | `harvest-manifest-v1.json` | Applicable packet kinds; no orphan claims |
| **3. Execution delta** | `executionDeltas[]` in autopsy bundle | Actual vs optimal for mistakes/faster-paths |
| **4. Waste & friction** | `waste[]`, `operatorFriction[]` | Ledger or `NONE_FOUND` with proof |
| **5. Duplication & commands** | `duplicateWork[]`, command-index updates | Registry + hub slices consulted |
| **6. ROI & seeds** | `roiBacklog`, `seed-packets/`, `gold-mine-evidence-projections-v1.json` (optional) | Ranked ROI; seeds with retrieval questions; Gold Mine projections |
| **6b. Product coverage & corpus bias** | `productWorkflowCoverage`, `corpusBias` in autopsy bundle | OBSERVED/NOT_OBSERVED matrix; `underObservedDomains[]` |
| **6c. Operational telemetry** | `operationalMeasurements[]` when execution occurred | Durations, retries, warnings, cache, fallbacks, interventions |
| **7. Do-not-advance sync** | Global + `work-progress/do-not-advance-registry.json` | No PASS without `lastKnownEvidence` |
| **8. Validate & handoff** | `validation-result.json` | `harvest:validate` PASS |
| **9. Protocol self-learning (Lane C, optional)** | `data-extraction-handoff/harvest-protocol-self-learning-input.json` + L catalog package | Only when `protocolImprovementCandidates[]` exist; unrelated build/app packets excluded |

**Lane C flow (separate classified projection — does not replace Hub publication):**

```text
validated harvest
→ protocol-only candidate export (Cross-Agent)
→ Data-Extraction relevance filter
→ deduplication
→ normalization
→ deterministic L publication
→ index update (BY-KIND/harvest-protocol-self-learning-index.json)
→ retrieval verification
→ Governance-ready proposal
```

---

## Phase 0 — Scout preflight

```bash
npm run agent:index:scout -- --json
```

Fallback (CG-AppBuilder-MCP or Cross-Agent):

```bash
npm run agent:index:preflight -- --work-package=chat-thread-closeout-autopsy-harvest-v1 --json
```

Record:

```text
Retrieval: <code>
Cache: CACHE_HIT|CACHE_MISS|NOT_APPLICABLE
rawScanRequired: true|false
sourceCommitSha: <sha or UNKNOWN>
```

Do not repo-wide grep unless `rawScanRequired=true`, compact index insufficient, or index points to a specific path.

For thread-autopsy retrieval (explicit only):

```text
L:/Capital-Glass-Intelligence-Hub/00-master-index/BY-KIND/thread-autopsy-index.json
```

---

## Execution delta (actual vs optimal)

Every mistake and faster-path record pairs two columns:

```json
{
  "executionDeltaId": "ED-001",
  "situation": "User asked for staging alias verification",
  "actualExecution": {
    "steps": ["Merged to dev", "Assumed Vercel green = alias correct"],
    "outcome": "FAIL",
    "evidenceRefs": ["agent-outbox/.../staging-alias-smoke-final.json"]
  },
  "optimalExecution": {
    "steps": ["Prove host identity", "Check alias → deployment mapping", "DOM markers before PASS"],
    "outcome": "Would have blocked false PASS",
    "requiredPreflight": ["agent:index:scout"]
  },
  "deltaCost": {
    "time": "high",
    "tokens": "medium",
    "operatorFrustration": "high"
  }
}
```

T2+ requires ≥1 delta or `executionDeltas: []` with `noDeltaReason` when thread had zero agent actions.

---

## Mandatory registers

### Waste ledger (T1+)

```json
{
  "wasteId": "TW-001",
  "type": "retrieval|context|tool|host|agent|deploy|verification|rework|operator_attention",
  "description": "Broad repo grep before scout preflight",
  "evidenceRefs": ["thread turn ~12"],
  "estimatedImpact": "high",
  "savedBy": "npm run agent:index:scout -- --json before any grep",
  "roiRank": 1
}
```

Empty only with `wasteLedgerStatus: "NONE_FOUND"` and `noneFoundEvidence`.

Use `operator_attention` when the user corrected the agent, re-ran commands, or expressed frustration.

### ROI backlog (T1+)

Rank up to 10 improvements. Link to `savedWasteIds`. Do not invent filler.

### Duplication detector (T1+)

Before recording repeats, consult:

1. `work-progress/harvest-packet-registry.json`
2. Hub slices: `BY-KIND/active-work-blockers.json`, `BY-KIND/thread-autopsy-index.json`
3. `work-progress/command-index.json`

### Do-not-advance (T1+)

- Global: `harvest-manifest-v1.json` → `doNotAdvance[]`
- Per award: `doNotAdvanceMap[]` in autopsy bundle
- Durable: `work-progress/do-not-advance-registry.json` → syncs to `BY-KIND/do-not-advance.json` on publish

### Operator friction (T1+ when applicable)

```json
{
  "frictionId": "OF-001",
  "trigger": "Agent asked user to paste facts already in hub",
  "operatorCost": "high",
  "systemFix": "Mandatory scout preflight before asking operator",
  "evidenceRefs": ["user correction turn 28"],
  "linkedWasteIds": ["TW-004"],
  "goldMineSignalClass": "OPERATOR_FRICTION_SIGNAL",
  "manualStep": "",
  "frequency": "observed|recurring|unknown",
  "minutesPerOccurrence": null,
  "avoidable": true,
  "automationCandidate": true,
  "businessWorkflow": "",
  "operatorRole": "",
  "rootCause": ""
}
```

Record `minutesPerOccurrence` only when actually observed — no invented estimates.

### Business impact classification (optional per candidate-worthy packet)

`PLATFORM_INTERNAL` | `OPERATOR_PRODUCTIVITY` | `ESTIMATING` | `DOCUMENT_PROCESSING` | `BID_TURNAROUND` | `PROPOSAL_QUALITY` | `DATA_QUALITY` | `CUSTOMER_DELIVERY` | `BUSINESS_RELIABILITY`

### Product-workflow coverage (T2+ mandatory)

```json
{
  "productWorkflowCoverage": {
    "computerEstimator": "OBSERVED|NOT_OBSERVED|UNKNOWN",
    "humanEstimator": "OBSERVED|NOT_OBSERVED|UNKNOWN",
    "documentCenter": "OBSERVED|NOT_OBSERVED|UNKNOWN",
    "planSetProcessing": "OBSERVED|NOT_OBSERVED|UNKNOWN",
    "ocrParser": "OBSERVED|NOT_OBSERVED|UNKNOWN",
    "revuBluebeam": "OBSERVED|NOT_OBSERVED|UNKNOWN",
    "bidComposer": "OBSERVED|NOT_OBSERVED|UNKNOWN",
    "proposals": "OBSERVED|NOT_OBSERVED|UNKNOWN",
    "vae": "OBSERVED|NOT_OBSERVED|UNKNOWN",
    "scraper": "OBSERVED|NOT_OBSERVED|UNKNOWN",
    "crossAppHandoffs": "OBSERVED|NOT_OBSERVED|UNKNOWN",
    "operatorReentry": "OBSERVED|NOT_OBSERVED|UNKNOWN"
  }
}
```

### Corpus bias detection (T2+ mandatory)

```json
{
  "corpusBias": {
    "evidenceDomainDistribution": {
      "sdlc": 0,
      "governance": 0,
      "receiptPlumbing": 0,
      "infrastructure": 0,
      "productOperation": 0,
      "operatorWorkflow": 0,
      "businessWorkflow": 0
    },
    "corpusBiasWarning": "SDLC-heavy corpus — do not interpret zero open Gold Mine candidates as estate-wide optimization",
    "underObservedDomains": ["Computer Estimator", "Revu", "Bid Composer"]
  }
}
```

Use relative weights or counts from thread evidence only.

### Operational measurements (when execution occurred)

Capture where available in `operationalMeasurements[]`:

`wallClockDurationMs`, `retries`, `failures`, `warnings`, `cacheState`, `rawScans`, `fallbackUsage`, `apiCallCount`, `manualInterventions`, `recordsProcessed`, `gateDurationMs`, `retrievalDurationMs`, `probeId`, `workflow`

### Observability gaps (`observabilityGaps[]`)

Same structure as ChatGPT `OG-###` — first-class Gold Mine material.

### Success patterns (`successPatterns[]`)

Evidence-backed positive patterns (`goldMineSignalClass: SUCCESS_PATTERN`).

### Future-agent instructions (per seed packet)

```json
{
  "futureAgentInstructions": {
    "whenThisAppears": "Staging alias returns 200 but wrong bundle",
    "startAt": ["BY-KIND/host-authority.json", "work-progress/command-index.json"],
    "runPreflight": ["npm run agent:index:scout -- --json"],
    "doNot": ["Claim deploy PASS from GitHub status alone", "Run index:publish from Cursor"],
    "proveBeforeClaiming": ["DOM marker check on stable alias"]
  }
}
```

---

## Atomic seed packets

Schema: `scripts/harvest/schema/harvest-seed-packet-v1.schema.json`

```json
{
  "schemaVersion": "harvest-seed-packet-v1@1.0.0",
  "seedId": "IH-THREAD-STAGING-ALIAS-001",
  "kind": "failure-pattern",
  "title": "Stable staging alias can lag dev HEAD",
  "summary": "One sentence, retrieval optimized",
  "retrievalQuestions": [
    "Why does staging alias show old renderer after dev merge?",
    "What proves alias serves correct deployment?"
  ],
  "evidenceRefs": ["sha or artifact path"],
  "futureAgentInstructions": {},
  "ownerRepo": "Cursor-ProposalGenerator",
  "targetSlice": "BY-KIND/thread-autopsy-index.json",
  "promotionClass": "POLICY_GATED",
  "status": "CANDIDATE"
}
```

Output: `artifacts/agent-runs/<harvest-id>/seed-packets/<seed-id>.json` + `seed-packet-index.json`.

Each seed: ≥2 `retrievalQuestions`, ≥1 `evidenceRef`, non-empty `futureAgentInstructions`.

---

## File tree

```text
artifacts/agent-runs/<harvest-id>/
  harvest-manifest-v1.json
  thread-autopsy-bundle.json
  thread-event-inventory.json
  code-touch-summary.json
  gold-mine-evidence-projections-v1.json   # optional v1.1 — Data-Extraction ingest
  seed-packets/
    <seed-id>.json
  seed-packet-index.json
  validation-result.json
  HARVEST_SUMMARY.md          # derived — do not edit
```

Autopsy bundle schema: `scripts/harvest/schema/thread-autopsy-bundle-v1.schema.json`

Manifest optional extension:

```json
"threadAutopsy": {
  "tier": "T2",
  "bundlePath": "artifacts/agent-runs/<harvest-id>/thread-autopsy-bundle.json",
  "seedPacketIndexPath": "artifacts/agent-runs/<harvest-id>/seed-packet-index.json",
  "counts": { "waste": 5, "seeds": 4, "roiItems": 8, "operatorFriction": 2 }
}
```

---

## Command chain

| Step | Command | Who |
| --- | --- | --- |
| 1 | Edit manifest + autopsy bundle + seed packets | Agent |
| 2 | `npm run harvest:sync-derived` | Agent |
| 3 | `npm run harvest:render-index` | Agent |
| 4 | `npm run harvest:validate` | Agent |
| 5 | `npm run test:harvest` | Agent |
| 6 | `npm run harvest:compile-seed-packets -- --harvest-id=<id>` | Agent (when seeds exist) |
| 7 | `npm run harvest:blind-retrieval -- --harvest-id=<id>` | Agent (T2+) |
| 8 | `npm run harvest:publish-hub-seed -- --harvest-id=<id>` | **Operator** (L: mounted) |
| 9 | `npm run index:publish` | **Operator** (WESLEYDESK GHA or break-glass) |
| 10 | `npm run index:freshness-gate` | **Operator** |

Steps 8–10 are **not** Cursor-closeout actions.

### Lane C — protocol self-learning command chain

Run only after `harvest:validate` PASS and only when the harvest contains evidence-backed `protocolImprovementCandidates[]` (or `kind: protocol-upgrade` seed packets with protocol targets).

```bash
# Cross-Agent
npm run harvest:validate -- <harvest-id>

npm run harvest:export:protocol-self-learning -- \
  --harvest-id=<harvest-id> \
  --json

# Data-Extraction
npm run harvest-protocol:self-learning:ingest -- \
  --input=<handoff-json> \
  --json

npm run harvest-protocol:self-learning:publish-l -- \
  --harvest-id=<harvest-id> \
  --json

npm run harvest-protocol:self-learning:verify -- \
  --harvest-id=<harvest-id> \
  --json
```

Optional feature-branch planning only (no auto-merge, no Z publish):

```bash
npm run harvest-protocol:self-learning:implement -- \
  --harvest-id=<harvest-id> \
  --json
```

Cross-Agent export receipt (`protocol-self-learning-export-receipt.json`) records `catalogRole: RETRIEVAL_ONLY`, `lPublicationStatus: NOT_RUN_BY_CROSS_AGENT`, and `automaticProtocolMutation: false`. Data-Extraction owns L publication and index update.

---

## Intelligence Hub publication

After Git harvest validates:

1. `harvest:compile-seed-packets` — bundle → `qa-index.json` + catalog stubs
2. `harvest:publish-hub-seed` — writes `02-catalog/knowledge-objects/cross-agent-harvest/` + `BY-KIND/thread-autopsy-index.json`
3. Operator runs ledger publish + `index:freshness-gate`

See [thread-autopsy-hub-accommodation-v1.md](../intelligence-hub/thread-autopsy-hub-accommodation-v1.md) for hub paths and schemas.

### Lane C publication truth (`protocolSelfLearning`)

Track Lane C separately from `projection.hubPublishStatus`. Use manifest provenance plus run receipts — do not treat harvested recommendations as verified truths.

```json
"protocolSelfLearning": {
  "sourceProtocolId": "chat-thread-closeout-autopsy-harvest-v1",
  "sourceProtocolVersion": "1.0.0",
  "sourceProtocolHash": "<harvest-manifest-hash>",
  "eligibleCandidates": 0,
  "rejectedUnrelatedCandidates": 0,
  "exportStatus": "not-run",
  "dataExtractionStatus": "not-run",
  "catalogPublishStatus": "not-run",
  "retrievalStatus": "not-run",
  "targetCatalog": "L:\\02-catalog\\Harvest\\Harvest Protocol Self Learning",
  "authorityStatus": "PROPOSAL",
  "automaticProtocolMutation": false
}
```

| Field | Values |
| --- | --- |
| `exportStatus` | `not-run` \| `EXPORT_PASS` \| `EXPORT_EMPTY` \| `BLOCKED` |
| `dataExtractionStatus` | `not-run` \| `ACCEPTED` \| `REJECTED` \| `BLOCKED` |
| `catalogPublishStatus` | `not-run` \| `PUBLISHED` \| `NOOP_CURRENT` \| `BLOCKED` |
| `retrievalStatus` | `not-run` \| `RETRIEVAL_PASS` \| `RETRIEVAL_BLOCKED` |

Export receipt schema: `harvest-protocol-self-learning-export-receipt-v1@1.0.0`. L package completion marker: `INGESTION_COMPLETE.json`.

**Promotion classes** (CG-AppBuilder-MCP harvest pipeline):

| Class | Examples |
| --- | --- |
| `AUTOMATIC` | Validated command receipts |
| `POLICY_GATED` | Wrong-move → `.cursor/rules` candidate |
| `HUMAN_REVIEW` | Architecture or host-authority changes |

Agents emit `status: CANDIDATE` only.

---

## Validator fail-closed (target)

`harvest:validate` should enforce:

1. T1+ → `thread-autopsy-bundle.json` exists
2. `waste` non-empty OR `wasteLedgerStatus === "NONE_FOUND"` with `noneFoundEvidence`
3. `roiBacklog.length >= 1`
4. Wrong moves have `actualExecution` / `optimalExecution`
5. Manifest packets have `evidenceRefs` unless `packetVerdict === UNKNOWN`
6. Seed packets meet retrieval + evidence + future-agent rules
7. `duplicationCheck.registryConsulted === true` for T1+
8. Secret scan (existing)

---

## Final summary template

```text
VERDICT: <overallHarvestVerdict> | Tier: <T0-T3>
Retrieval: <code> | Cache: <code>
Lane: <owner-repo|cross-agent|none>

Harvest packets: <n> | Waste: <n> | Operator friction: <n> | Duplicates: <n>
Execution deltas: <n> | Outcomes: <n> | Seed packets: <n>
Gold Mine projections: <n> | Observability gaps: <n> | Success patterns: <n>
Product coverage: <observed surfaces> | Corpus bias: <warning or none>
ROI top-3: 1) <title> 2) <title> 3) <title>

Do-not-advance:
- <guard>

Future agent (#1 lesson):
When <situation> → start at <index> → run <preflight> → do not <forbidden>

Publication: Git <sha> | Hub <not-run|published> | Freshness <PASS|NOT_RUN_BY_CURSOR>

Protocol self-learning (Lane C):
Eligible: <n> | Rejected unrelated: <n> | Duplicates: <n>
Catalog: <path or not-run>
Retrieval: <PASS|FAIL|NOT_RUN>
Authority: PROPOSAL / RETRIEVAL_ONLY
Automatic protocol mutation: false

Next operator action: <one sentence>
```

---

## Acceptance checklist

- [ ] Scout/index preflight attempted and logged
- [ ] Thread event inventory exists (T1+)
- [ ] Harvest manifest + compact records exist
- [ ] Thread autopsy bundle exists (T1+)
- [ ] Waste ledger or `NONE_FOUND` with proof
- [ ] ROI backlog ranked (expanded value fields where evidence exists)
- [ ] Duplication check logged (digest/hash identity — not ordinal-only)
- [ ] Do-not-advance map + registry updated when reusable
- [ ] Seed packets atomic with retrieval questions (T2+)
- [ ] `harvest:validate` PASS or gaps labeled `HARVEST_PARTIAL`
- [ ] Publication truthfully labeled; no false FULLY_SEEDED
- [ ] **Gold Mine:** `goldMineSignalClass` assigned where applicable
- [ ] **Gold Mine:** problem vs resolution/adoption evidence distinguished
- [ ] **Gold Mine:** stable identities used (`candidateDigest`, hashes — ordinals presentation-only)
- [ ] **Gold Mine:** `evidenceEra` / pre-post implementation recorded when relevant
- [ ] **Gold Mine:** `businessImpact` / product domain classified where applicable
- [ ] **Gold Mine:** `outcome` packets or `OUT-###` for implemented work
- [ ] **Gold Mine:** `productWorkflowCoverage` + `corpusBias` reported (T2+)
- [ ] **Gold Mine:** no distinct valid improvement signal suppressed
- [ ] **Gold Mine:** resolved evidence remains retrievable (`RESOLVED_OBSERVED` or resolution hint)
- [ ] **Gold Mine:** observability gaps + success patterns recorded or `NONE_FOUND`
- [ ] **Lane C:** protocol-only candidates selected (when lane used)
- [ ] **Lane C:** unrelated build/application/CI/product packets excluded from Lane C package
- [ ] **Lane C:** source evidence exists for each protocol-improvement candidate
- [ ] **Lane C:** Data-Extraction receipt exists when L publication is claimed
- [ ] **Lane C:** deterministic package hash + `INGESTION_COMPLETE.json` when published
- [ ] **Lane C:** `BY-KIND/harvest-protocol-self-learning-index.json` resolves package without raw scan
- [ ] **Lane C:** L remains `PROPOSAL` / `RETRIEVAL_ONLY`; Governance approval required before Git/Z promotion
- [ ] **Lane C:** no automatic main merge; no automatic Z publication

---

## Cursor opener prompt

```text
Run chat-thread-closeout-autopsy-harvest-v1 (v1.1 Gold Mine compounding).

Review this entire thread and harvest it into durable Intelligence Hub seed material **and** Gold Mine-classified evidence.

Tier: T1 (use T2 if long thread, user frustration, multi-repo, or repeated work).

Start with Intelligence Hub / Cross-Agent index. Log INDEX_HIT_AI_CACHE, INDEX_HIT, INDEX_MISS, L_DRIVE_NOT_MOUNTED_IN_WSL, FAILOVER_SUPABASE, or FAILOVER_GIT_LEDGER. Do not broad-scan repos before compact index retrieval unless rawScanRequired=true.

Produce structured closeout autopsy (not prose summary):
- thread event inventory with evidenceRefs
- harvest manifest packets (9 kinds as applicable) with goldMineSignalClass, novelty, implementationState where applicable
- thread-autopsy-bundle.json (waste ledger, execution deltas, duplicates, ROI, operator friction, do-not-advance map, productWorkflowCoverage, corpusBias, operationalMeasurements, observabilityGaps, successPatterns)
- optional gold-mine-evidence-projections-v1.json per Gold Mine evidence contract
- code-touch summary with SHAs where available
- atomic seed-packets/ with futureAgentInstructions (T2+)
- outcome packets (OUT / kind:outcome) for implemented work with before/after and effectiveness

Separate actual execution from optimal execution for every mistake.
Force waste ledger and ROI ranking.
Use stable digest/hash identity — ordinals are presentation only.
Report corpus bias and under-observed product domains explicitly.
Consult harvest-packet-registry, command-index, and hub BY-KIND slices before recording duplicate work.
Do not suppress distinct improvement signals because they seem low-value.

Respect Cross-Agent boundaries: coordination, receipts, ledger, manifests only. Implementation in owner repos.

DATA-EXTRACTION INGEST CONTRACT

The generated harvest-manifest-v1.json must identify itself as
cross-agent-harvest-manifest-v1 and must contain:

- harvestId
- sourceRepo
- sourceBranch
- sourceCommitSha as an exact 40-character Git commit SHA
- packets[] as an array
- a deterministic packetId on every packets[] entry

Do not invent any missing repository, branch, commit, packet, or finding value.

If sourceRepo, sourceBranch, sourceCommitSha, or packet identity cannot be
proven from the current repository and thread evidence, return
HARVEST_PARTIAL or HARVEST_BLOCKED rather than producing a falsely complete
manifest.

After harvest:validate passes, confirm that Data-Extraction classifies the
directory under protocol cursor-cross-agent-harvest-v1 and reports
READY_FOR_INGEST.

Validate: harvest:sync-derived, harvest:validate, test:harvest.
Do NOT run index:publish or harvest:publish-hub-seed from Cursor.

Final answer: verdict, tier, retrieval code, packet/waste/seed counts, ROI top-3, do-not-advance guards, future-agent #1 lesson, next operator action.
```

---

## Prompt Extraction and Promotion

Harvest discovers reusable **prompt candidates** from completed Cursor chat threads. **PromptOps remains the authority** for approved prompts. Execution-packet compilers consume **approved prompt IDs** only.

```text
THREAD CLOSEOUT
→ HARVEST CHAT
→ EXTRACT PROMPT CANDIDATES
→ CLASSIFY
→ DEDUPLICATE
→ REVIEW / PROMOTE
→ UPDATE PROMPT CATALOG
→ LINK EXECUTION PACKETS
→ INDEX
→ SUPABASE SEED
→ WRITE RECEIPT
```

### Authority boundaries

| Concern | Owner |
| --- | --- |
| Prompt candidate discovery | Harvest (`prompt-extraction-lib.mjs`) |
| Approved prompt authority | PromptOps manifests + suite prompt index |
| Hot-cache routing envelope | Compact metadata only — **no** full chat transcripts or prompt bodies |
| Supabase runtime retrieval | Approved projections only during seed/publish |
| Mutation authority (merge/push/deploy/delete) | **Never** granted by harvest |

### Classification

Candidates are classified separately by source:

- `cursor_agent` — assistant-generated reusable procedures
- `user_instruction` — operator instructions worth parameterizing
- `system_governance` — guards, preflight, and governance recipes

### Promotion rules

Promotion to `approved` requires **one of**:

- successful execution outcome (`provenOutcome: pass`)
- explicit operator approval (`manifest.promptHarvest.operatorApprovals`)
- match to an existing approved PromptOps recipe (deduped as `duplicate`, not re-promoted)
- repeated proven use across completed missions (registry consult)

**Forbidden promotion:**

- secret-bearing content (`containsSecrets: true` → `rejected`)
- failed or incomplete procedures (`provenOutcome: fail` → `candidate_only`)
- one-time machine paths, tokens, credentials, transient SHAs in normalized body

### Per-harvest outputs

```text
artifacts/agent-runs/<harvest-id>/
  prompt-candidates.json
  prompt-deduplication-report.json
  prompt-promotion-decisions.json
  prompt-catalog-delta.json
  execution-packet-binding-delta.json
  prompt-harvest-index-slice.json
  receipt.json                    # includes promptHarvest block
```

Aggregate catalog delta (approved only): `work-progress/harvest-prompt-catalog-delta.json`

### Receipt `promptHarvest` block

```json
{
  "promptHarvest": {
    "reviewed": true,
    "candidatesFound": 0,
    "deduplicated": 0,
    "approved": 0,
    "rejected": 0,
    "candidateOnly": 0,
    "promptCatalogUpdated": false,
    "executionPacketsUpdated": false,
    "indexUpdated": false,
    "supabaseSeeded": false,
    "candidateIds": [],
    "approvedPromptIds": [],
    "projectionReceiptIds": [],
    "verdict": "PROMPT_HARVEST_NO_CANDIDATES"
  }
}
```

Verdicts: `PROMPT_HARVEST_COMPLETE` | `PROMPT_HARVEST_NO_CANDIDATES` | `PROMPT_HARVEST_PENDING_REVIEW` | `PROMPT_HARVEST_FAILED`

`PROMPT_HARVEST_NO_CANDIDATES` is a valid **non-blocking** result.

### Command chain extension

| Step | Command | Who |
| --- | --- | --- |
| — | `harvest:sync-derived` (runs prompt extraction) | Agent |
| — | `npm run test:harvest:prompt-extraction` | Agent |
| — | `npm run promptops:project-harvest-prompts` (CG-AppBuilder-MCP) | Operator |

Hot-cache prompt catalog receives **compact metadata only**:

```text
promptId, version, type, ownerRepo, ownerMcp, queryClasses,
authorityLevel, sourcePath, contentHash, requiredGateIds
```

---

## Design principle

A future agent answers in **under 30 seconds** from a seed packet:

> When this issue appears again, start at X index, run Y preflight, do not do Z — with receipt proof.

If they must re-read the chat, the harvest failed or was tiered too low.
