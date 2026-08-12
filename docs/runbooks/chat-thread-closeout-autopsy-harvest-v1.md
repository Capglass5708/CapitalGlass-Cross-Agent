# Chat Thread Closeout Autopsy, Harvest, and Intelligence Hub Seed Protocol v1

**Work package pattern:** `chat-thread-closeout-autopsy-harvest-v1` or `harvest-YYYY-MM-DD-<slug>-v1`  
**Authority repo:** CapitalGlass-Cross-Agent  
**Companion:** [Intelligence Hub accommodation](../../harvest/protocol/thread-autopsy-hub-accommodation-v1.md)  
**Base harvest runbook:** [harvest-record-validate-sync.md](./harvest-record-validate-sync.md)

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

Cross-Agent records coordination, receipts, ledger updates, and seed manifests only. Implementation code belongs in owner repos.

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

---

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

## Eight mandatory packet kinds

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
| **6. ROI & seeds** | `roiBacklog`, `seed-packets/` | Ranked ROI; seeds with retrieval questions |
| **7. Do-not-advance sync** | Global + `work-progress/do-not-advance-registry.json` | No PASS without `lastKnownEvidence` |
| **8. Validate & handoff** | `validation-result.json` | `harvest:validate` PASS |

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
  "linkedWasteIds": ["TW-004"]
}
```

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

---

## Intelligence Hub publication

After Git harvest validates:

1. `harvest:compile-seed-packets` — bundle → `qa-index.json` + catalog stubs
2. `harvest:publish-hub-seed` — writes `02-catalog/knowledge-objects/cross-agent-harvest/` + `BY-KIND/thread-autopsy-index.json`
3. Operator runs ledger publish + `index:freshness-gate`

See [thread-autopsy-hub-accommodation-v1.md](../../harvest/protocol/thread-autopsy-hub-accommodation-v1.md) for hub paths and schemas.

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
Execution deltas: <n> | Seed packets: <n>
ROI top-3: 1) <title> 2) <title> 3) <title>

Do-not-advance:
- <guard>

Future agent (#1 lesson):
When <situation> → start at <index> → run <preflight> → do not <forbidden>

Publication: Git <sha> | Hub <not-run|published> | Freshness <PASS|NOT_RUN_BY_CURSOR>

Next operator action: <one sentence>
```

---

## Acceptance checklist

- [ ] Scout/index preflight attempted and logged
- [ ] Thread event inventory exists (T1+)
- [ ] Harvest manifest + compact records exist
- [ ] Thread autopsy bundle exists (T1+)
- [ ] Waste ledger or `NONE_FOUND` with proof
- [ ] ROI backlog ranked
- [ ] Duplication check logged
- [ ] Do-not-advance map + registry updated when reusable
- [ ] Seed packets atomic with retrieval questions (T2+)
- [ ] `harvest:validate` PASS or gaps labeled `HARVEST_PARTIAL`
- [ ] Publication truthfully labeled; no false FULLY_SEEDED

---

## Cursor opener prompt

```text
Run chat-thread-closeout-autopsy-harvest-v1.

Review this entire thread and harvest it into durable Intelligence Hub seed material.

Tier: T1 (use T2 if long thread, user frustration, multi-repo, or repeated work).

Start with Intelligence Hub / Cross-Agent index. Log INDEX_HIT_AI_CACHE, INDEX_HIT, INDEX_MISS, L_DRIVE_NOT_MOUNTED_IN_WSL, FAILOVER_SUPABASE, or FAILOVER_GIT_LEDGER. Do not broad-scan repos before compact index retrieval unless rawScanRequired=true.

Produce structured closeout autopsy (not prose summary):
- thread event inventory with evidenceRefs
- harvest manifest packets (8 kinds as applicable)
- thread-autopsy-bundle.json (waste ledger, execution deltas, duplicates, ROI, operator friction, do-not-advance map)
- code-touch summary with SHAs where available
- atomic seed-packets/ with futureAgentInstructions (T2+)

Separate actual execution from optimal execution for every mistake.
Force waste ledger and ROI ranking.
Consult harvest-packet-registry, command-index, and hub BY-KIND slices before recording duplicate work.

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
