# Chat Thread Closeout Autopsy, Harvest, and Intelligence Hub Seed Protocol v1

**Work package pattern:** `chat-thread-closeout-autopsy-harvest-v1` or `harvest-YYYY-MM-DD-<slug>-v1`  
**Authority repo:** CapitalGlass-Cross-Agent  
**Companion:** [Intelligence Hub accommodation](../intelligence-hub/thread-autopsy-hub-accommodation-v1.md)  
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

The **chat thread is source truth** — what actually happened in the conversation (commands run, mistakes made, user corrections, evidence produced). The harvest **encodes** that truth into structured artifacts. Publication **makes it operational** so future agents retrieve it from L:, Z:, and C: without re-reading the chat.

Cross-Agent records coordination, receipts, ledger updates, and seed manifests only. Implementation code belongs in owner repos.

---

## Authority model — chat thread is truth

| Layer | Role |
| --- | --- |
| **Chat thread** | What really happened — turns, commands, corrections, frustration |
| **Structured harvest** | Machine encoding of that truth (`harvest-manifest-v1.json`, `thread-autopsy-bundle.json`, `seed-packets/`) |
| **Git (Cross-Agent)** | Durable authority — `artifacts/agent-runs/<harvest-id>/` |
| **L: Intelligence Hub** | Published catalog + `BY-KIND/thread-autopsy-index.json` — retrieval authority |
| **Z: AI cache index** | Estate-wide index bundle for scout/cache lanes |
| **C: hot routing index** | Machine-local scout preflight (open-actions, blockers, critical seed IDs) |

**Rule:** Do not invent facts not supported by the thread or evidence refs. Structured fields must trace to what actually occurred.

---

## Make it operational (one command)

After the agent records and validates the harvest in Git, **one operator command** publishes thread truth to all intelligence layers:

```bash
cd CapitalGlass-Cross-Agent
npm run harvest:publish-intelligence-full -- --harvest-id=<harvest-id>
```

**Prerequisites:** L: mounted (`/mnt/l/Capital-Glass-Intelligence-Hub`), Doppler for ledger sync, CG-AppBuilder-MCP sibling repo.

**What this command does:**

| Stage | Layer | Output |
| --- | --- | --- |
| Validate + test | Git | `harvest:validate`, autopsy gate, `test:harvest` |
| Compile seeds (T2+) | Git | `qa-index.json`, `hub-catalog-stubs/` |
| Blind retrieval (T2+) | Git | `BLIND_RETRIEVAL_PASS` from seed questions |
| Publish hub seed | **L:** | `02-catalog/knowledge-objects/cross-agent-harvest/<SEED-ID>.json` |
| Thread autopsy index | **L:** | `BY-KIND/thread-autopsy-index.json` |
| Do-not-advance sync | **L:** | `BY-KIND/do-not-advance.json` |
| Ledger publication | **L:** + Supabase | `index:sync-publication` |
| Hot routing index | **C:** | Scout preflight routing index |
| AI cache index bundle | **Z:** | `intelligence-hub:index-freshness:publish` |

**Receipt:** `artifacts/agent-runs/<harvest-id>/operational-publication-receipt.json`  
**Manifest update:** `projection.hubPublishStatus` → `published`

Dry-run plan only:

```bash
npm run harvest:publish-intelligence-full -- --harvest-id=<id> --dry-run
```

**T1 without seed packets:** publishes index pointer + do-not-advance + ledger sync (bundle authority on Git; no catalog seeds).  
**T2+:** full catalog seeds + blind retrieval required.

Do not claim `OPERATIONAL` or `FULLY_SEEDED` without `operational-publication-receipt.json` or `index:freshness-gate` PASS.

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
| `HARVEST_COMPLETE` | Structured packets + autopsy bundle validate; ready for operational publish |
| `HARVEST_PARTIAL` | Prose-heavy or missing evidence; not ship-ready |
| `HARVEST_BLOCKED` | Missing authority, repo access, or index state |
| `NO_HARVEST_NEEDED` | No durable operational, code, architecture, or decision value |
| `OPERATIONAL` | Harvest published to L:, Z:, C: — receipt exists |

Recording completes at `HARVEST_COMPLETE`. Operational status requires `harvest:publish-intelligence-full` PASS (`projection.hubPublishStatus`: `not-run` | `published` | `drift` | `blocked`).

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
7. **Phase A (Cursor):** record structured truth from the chat thread into Git artifacts.
8. **Phase B (operator):** run `harvest:publish-intelligence-full` to make harvest operational on L:, Z:, C:.
9. Cursor must **not** run publish commands unless the operator explicitly says **"make operational"** or **"run full publish"** in the same session.

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
| **T3** | Operational closeout | T2 + `harvest:publish-intelligence-full` PASS; `hubPublishStatus: published` |

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
| **9. Make operational** | `operational-publication-receipt.json` | `harvest:publish-intelligence-full` PASS (operator) |

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

### Duplication detector (T1+) — automated + fail-closed

Duplication prevention is **machine-enforced**, not honor-system checkboxes.

#### Step 1 — Run automated preflight (required)

```bash
npm run harvest:duplication-preflight -- --harvest-id=<id>
```

This **automatically consults**:

1. `work-progress/harvest-packet-registry.json`
2. `work-progress/command-index.json`
3. L: `BY-KIND/active-work-blockers.json`
4. L: `BY-KIND/thread-autopsy-index.json`
5. L: `02-catalog/knowledge-objects/cross-agent-harvest/*.json` (existing seeds)

Writes `duplication-preflight-receipt.json` and stamps `thread-autopsy-bundle.json`:

```json
"duplicationCheck": {
  "registryConsulted": true,
  "commandIndexConsulted": true,
  "hubSlicesConsulted": ["active-work-blockers.json", "thread-autopsy-index.json"],
  "checkedAt": "2026-08-04T00:00:00.000Z",
  "preflightReceiptHash": "<sha256-of-receipt>"
}
```

**Do not hand-edit** `preflightReceiptHash` — re-run preflight after bundle changes.

#### Step 2 — Record overlaps in `duplicateWork[]`

When preflight finds registry, subject, or semantic overlap, `duplicateWork[]` is **required**:

```json
{
  "duplicateId": "DW-001",
  "subject": "Staging alias verification",
  "whyRepeated": "Agent did not consult thread-autopsy-index before investigating",
  "firstKnownInstance": "harvest-existing-subject-v1 / IH-EXISTING-001",
  "priorIndexSlice": "BY-KIND/thread-autopsy-index.json",
  "whyMissed": "Skipped harvest:duplication-preflight",
  "avoidableBy": "npm run harvest:duplication-preflight before recording",
  "recommendedAction": "Load existing seed; do not create IH-NEW-SEMANTIC"
}
```

#### Hard blocks (fail-closed)

| Check | When | Override |
| --- | --- | --- |
| **Stale preflight hash** | `preflightReceiptHash` ≠ current receipt | Re-run `harvest:duplication-preflight` |
| **Duplicate `seedId` on L:** | Catalog already has seed | `seed.supersedes: ["IH-OLD"]` or `--allow-supersede-seed=<id>` |
| **Semantic duplicate questions** | Jaccard ≥ 0.65 vs existing seed | Change questions or supersede existing seed |
| **Duplicate harvest subject** | Same subject in `thread-autopsy-index` | New `harvest-id` slug or record in `duplicateWork[]` |
| **Republish same harvest-id** | L: index SHA ≠ current Git HEAD | `manifest.supersession.replacesHarvestId` or `--allow-republish` |
| **Missing `duplicateWork[]`** | Preflight found overlap | Record overlap before validate passes |

#### Enforced in

- `harvest:validate-autopsy` — runs preflight in `validate` mode
- `harvest:publish-hub-seed` — blocks duplicate seeds on L:
- `harvest:publish-intelligence-full` — runs preflight before all publish stages

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
  duplication-preflight-receipt.json
  validation-result.json
  operational-publication-receipt.json   # after publish-intelligence-full
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

### Phase A — Record truth (Cursor / agent)

| Step | Command | Who |
| --- | --- | --- |
| 1 | Structure manifest + autopsy bundle + seed packets from **this chat thread** | Agent |
| 2 | `npm run harvest:sync-derived -- <harvest-id>` | Agent |
| 3 | `npm run harvest:render-index` | Agent |
| 4 | `npm run harvest:duplication-preflight -- --harvest-id=<id>` | Agent |
| 5 | `npm run harvest:validate -- <harvest-id>` | Agent |
| 6 | `npm run harvest:validate-autopsy -- --harvest-id=<id>` | Agent (when `threadAutopsy` set) |
| 7 | `npm run test:harvest` | Agent |
| 8 | Commit Cross-Agent harvest artifacts | Operator or agent when asked |

### Phase B — Make operational (operator one-shot)

| Step | Command | Who |
| --- | --- | --- |
| 8 | `npm run harvest:publish-intelligence-full -- --harvest-id=<id>` | **Operator** (L: mounted, Doppler) |

This single command runs: duplication preflight → validate → compile → blind retrieval (T2+) → L: catalog + index slices → ledger sync → C: hot routing → Z: AI cache index → writes `operational-publication-receipt.json`.

### Phase B — Manual steps (break-glass only)

| Step | Command | Who |
| --- | --- | --- |
| 8a | `npm run harvest:compile-seed-packets -- --harvest-id=<id>` | Operator |
| 8b | `npm run harvest:blind-retrieval -- --harvest-id=<id>` | Operator (T2+) |
| 8c | `npm run harvest:publish-hub-seed -- --harvest-id=<id>` | Operator |
| 9 | `npm run index:sync-publication` | Operator |
| 10 | `npm run intelligence-hub:publish-hot-routing-index` | Operator (CG-AppBuilder-MCP) |
| 11 | `npm run intelligence-hub:index-freshness:publish` | Operator (CG-AppBuilder-MCP) |
| 12 | `npm run index:freshness-gate` | Operator |

Prefer step 8 one-shot over 8a–12 unless debugging a failed stage.

---

## Intelligence Hub publication

After Git harvest validates, run **one command** to populate all layers:

```bash
npm run harvest:publish-intelligence-full -- --harvest-id=<id>
```

Manual breakdown (same outcome):

1. `harvest:compile-seed-packets` — bundle → `qa-index.json` + catalog stubs
2. `harvest:publish-hub-seed` — writes `02-catalog/knowledge-objects/cross-agent-harvest/` + `BY-KIND/thread-autopsy-index.json`
3. `index:sync-publication` — Supabase + L: active-work ledger + freshness gate
4. `intelligence-hub:publish-hot-routing-index` — C: scout routing
5. `intelligence-hub:index-freshness:publish` — Z: AI cache index bundle

See [thread-autopsy-hub-accommodation-v1.md](../intelligence-hub/thread-autopsy-hub-accommodation-v1.md) for hub paths and schemas.

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
7. `duplicationCheck.preflightReceiptHash` matches `duplication-preflight-receipt.json` for T1+
8. Automated duplication preflight PASS (no semantic/seedId/subject collisions unless `duplicateWork[]` recorded)
9. Secret scan (existing)

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

Publication: Git <sha> | Hub <not-run|published|OPERATIONAL> | Freshness <PASS|NOT_RUN>
Operational receipt: artifacts/agent-runs/<harvest-id>/operational-publication-receipt.json

Next operator action: <one sentence — usually "run harvest:publish-intelligence-full" or "commit and publish">
```

---

## Acceptance checklist

- [ ] Scout/index preflight attempted and logged
- [ ] Thread event inventory exists (T1+)
- [ ] Harvest manifest + compact records exist
- [ ] Thread autopsy bundle exists (T1+)
- [ ] Waste ledger or `NONE_FOUND` with proof
- [ ] ROI backlog ranked
- [ ] Duplication check logged via `harvest:duplication-preflight` + receipt hash stamped
- [ ] `duplicateWork[]` populated when preflight detects overlap
- [ ] Do-not-advance map + registry updated when reusable
- [ ] Seed packets atomic with retrieval questions (T2+)
- [ ] `harvest:validate` PASS or gaps labeled `HARVEST_PARTIAL`
- [ ] Chat-thread facts encoded with `evidenceRefs` (no invented claims)
- [ ] `harvest:publish-intelligence-full` PASS for T3 / when operator requests operational
- [ ] `operational-publication-receipt.json` exists before claiming OPERATIONAL

---

## Cursor opener prompt

```text
Run chat-thread-closeout-autopsy-harvest-v1.

Review this entire chat thread. The thread is source truth — encode what actually happened, not a summary.

Tier: T1 (use T2 if long thread, user frustration, multi-repo, or repeated work; T3 if operator will publish immediately after).

Start with Intelligence Hub / Cross-Agent index. Log INDEX_HIT_AI_CACHE, INDEX_HIT, INDEX_MISS, L_DRIVE_NOT_MOUNTED_IN_WSL, FAILOVER_SUPABASE, or FAILOVER_GIT_LEDGER. Do not broad-scan repos before compact index retrieval unless rawScanRequired=true.

Produce structured closeout autopsy (not prose summary):
- thread event inventory with evidenceRefs tied to real turns/commands
- harvest manifest packets (8 kinds as applicable)
- thread-autopsy-bundle.json (waste ledger, execution deltas, duplicates, ROI, operator friction, do-not-advance map)
- code-touch summary with SHAs where available
- atomic seed-packets/ with futureAgentInstructions (T2+)

Separate actual execution from optimal execution for every mistake.
Force waste ledger and ROI ranking.
Consult harvest-packet-registry, command-index, and hub BY-KIND slices before recording duplicate work.

Respect Cross-Agent boundaries: coordination, receipts, ledger, manifests only. Implementation in owner repos.

Phase A — record:
harvest:sync-derived, harvest:duplication-preflight, harvest:validate, harvest:validate-autopsy (when threadAutopsy set), test:harvest.

Phase B — make operational (ONLY when operator says "make operational" or "run full publish"):
npm run harvest:publish-intelligence-full -- --harvest-id=<id>

Do NOT run publish-intelligence-full without explicit operator approval in this session.

Final answer: verdict, tier, retrieval code, packet/waste/seed counts, ROI top-3, do-not-advance guards, future-agent #1 lesson, hubPublishStatus, next action (commit? publish?).
```

---

## Design principle

A future agent answers in **under 30 seconds** from a seed packet on L: or scout hot cache on C:

> When this issue appears again, start at X index, run Y preflight, do not do Z — with receipt proof.

The chat thread happened once. The harvest made it operational so it never has to be re-lived.
