# Chat Thread System Advancement Harvest — ChatGPT Protocol v2

**Z operator path:** `Z:\Capital-Glass-Dev\Harvest\protocol\CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md`  
**Intelligence kind:** **ADVANCEMENT** — synthesized/invented designs (not observed replay).  
**Shared Git contract:** [CHATGPT-HARVEST-GIT-PUBLICATION-CONTRACT-V1.md](./CHATGPT-HARVEST-GIT-PUBLICATION-CONTRACT-V1.md) — `CHATGPT_HARVEST_GIT_GATE`, verdict stages, `chat-gpt-harvest` branch rules.

**Work package pattern:** `chat-thread-system-advancement-harvest-chatgpt-v1`  
**Sibling (OBSERVED intelligence):** [chat-thread-closeout-autopsy-harvest-chatgpt-v1.md](./chat-thread-closeout-autopsy-harvest-chatgpt-v1.md)  
**Gated waves:** [gated-wave-lifecycle-v1.md](./gated-wave-lifecycle-v1.md)  
**Quality gate:** [system-advancement-quality-gate.md](./system-advancement-quality-gate.md)  
**Cycle taxonomy:** [advancement-cycle-taxonomy-v1.md](./advancement-cycle-taxonomy-v1.md)  
**Findings template:** [chatgpt-system-advancement-findings-template.md](./chatgpt-system-advancement-findings-template.md)  
**Authority repo:** CapitalGlass-Cross-Agent  
**Lane:** `CHAT_CONTEXT_ONLY` — visible conversation + attachments only  
**Lane alias:** `ADVANCEMENT_SYNTHESIS` (same lane; use either label in ChatGPT opener)

---

## Operator quick start (advancement harvest)

| Field | Value |
| --- | --- |
| **Lane** | ADVANCEMENT synthesis (not OBSERVED autopsy) |
| **Output file** | `artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/system-advancement-findings-source.md` |
| **Example harvest id** | `harvest-2026-08-04-wesleydesk-session-repair-v1` |
| **Branch** | `chat-gpt-harvest` (never `main`) |
| **Template** | [chatgpt-system-advancement-findings-template.md](./chatgpt-system-advancement-findings-template.md) |

**Steps**

1. Paste the **full WESLEYDESK / session-bound repair Cursor thread** into ChatGPT.
2. @ `CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md` on Z (this file).
3. Declare `DRAFT_FILE` in your first sentence.
4. Produce `system-advancement-findings-source.md` with **SYNTHESIZED** and **INVENTED** `IMP-###` / `ADV-###` (not summary-only).
5. Push to `chat-gpt-harvest`; pass `CHATGPT_HARVEST_GIT_GATE`; claim `CHATGPT_SOURCE_PUBLISHED` only after remote SHA verification.
6. **Do not** run Cursor ingest, L: move verification, or Data-Extraction — Git staging + SHA receipt only.

**One-line trigger**

```text
Run chat-thread-system-advancement-harvest-chatgpt-v1 per Z:\Capital-Glass-Dev\Harvest\protocol\CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md — DRAFT_FILE, harvest-2026-08-04-wesleydesk-session-repair-v1, push to chat-gpt-harvest.
```

**OBSERVED autopsy** (what happened only): use `CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md` instead.

### Verdict truth (ADVANCEMENT lane)

| Stage | ChatGPT may claim |
| --- | --- |
| Draft complete | `SYSTEM_ADVANCEMENT_DRAFT_READY` (alias: `DRAFT_READY`) |
| Git gate PASS | `CHATGPT_SOURCE_PUBLISHED` |
| Cursor validate / publish | `HARVEST_COMPLETE` — **forbidden in ChatGPT** |

Git gate failure: `BLOCKED_GIT_PUBLICATION` — see shared contract.

---

## Purpose

Use **ChatGPT** to synthesize **new system advancements** from completed work — workflows, architecture, cross-app integration, agent coordination, token efficiency, retrieval/cache, long-running SDLC, validation, closeout, and platform capabilities.

This is **not** deterministic replay of the thread. Past conversation, artifacts, failures, corrections, and decisions are **evidence and constraints**. ChatGPT composes **genuinely new** concepts from that evidence.

```text
History supplies constraints.
ChatGPT supplies synthesis.
Cursor supplies verification.
The Intelligence Hub supplies durable reuse.
New work supplies the next generation of evidence.
```

**ChatGPT is never source of truth** for code, deploy status, index state, or gate verdicts.

---

## Intelligence Hub — two knowledge kinds

| Kind | Protocol | Content |
| --- | --- | --- |
| **OBSERVED** | Autopsy harvest | What happened, failed, passed, was learned |
| **ADVANCEMENT** | This protocol | New designs, improvements, experiments, future-state concepts |

Hub records must tag `intelligenceKind`. `ADV-###` provenance prevents invented ideas being mistaken for observed facts or shipped features.

### Required separation from OBSERVED lane

| Lane | Protocol | Output | Content |
| --- | --- | --- | --- |
| **OBSERVED** | [chat-thread-closeout-autopsy-harvest-chatgpt-v1.md](./chat-thread-closeout-autopsy-harvest-chatgpt-v1.md) | `chatgpt-findings-source.md` | What happened, failed, passed, was learned |
| **ADVANCEMENT** | This file | `system-advancement-findings-source.md` | New capabilities, processes, automation, architecture, products |

**Governing rule:** Observed facts may support an advancement, but an advancement must **never** be represented as already implemented or operational.

Every advancement candidate must include an **advancement category** (orthogonal to SYNTHESIZED/INVENTED):

`CONCEPT` | `ARCHITECTURE_CANDIDATE` | `AUTOMATION_CANDIDATE` | `PRODUCT_CANDIDATE` | `PROTOCOL_UPGRADE` | `PLATFORM_CAPABILITY` | `EXPERIMENT_CANDIDATE`

ChatGPT may only set `status: CANDIDATE`. Cursor and the operator control all later lifecycle states.

---

## Tiered closeout (when to run this protocol)

See OBSERVED protocol § Tiered closeout classifier. Run **this file** only for **T3** threads (or advancement-only when no OBSERVED autopsy is needed and operator approves).

| Tier | ADVANCEMENT? |
| --- | --- |
| T0–T1 | No |
| T2 | OBSERVED only — use sibling autopsy protocol |
| T3 | Yes — `system-advancement-findings-source.md` alongside `chatgpt-findings-source.md` in the same `harvest-YYYY-MM-DD-<slug>-v1/` directory |

---

## ChatGPT → Git → L: pipeline (automatic after push)

Same estate pipeline as OBSERVED autopsy. ChatGPT **only** pushes to `chat-gpt-harvest`.

```text
ChatGPT DRAFT_FILE
  → push system-advancement-findings-source.md to chat-gpt-harvest
  → GitHub Actions: chatgpt-harvest-move-to-l.yml
  → L: 02-catalog/chatgpt-draft-staging/chat-gpt-harvest/<harvest-id>/
  → (later) Data-Extraction advancement:ingest — Phase 2; not ChatGPT
  → Cursor harvest:ingest-chatgpt-advancement (when shipped) + novelty/duplication checks
```

**Workflow:** `.github/workflows/chatgpt-harvest-move-to-l.yml` — triggers on `**/system-advancement-findings-source.md` pushes.  
**Future graph lane:** `Data-Extraction/docs/platform/SUITE_ADVANCEMENT_GRAPH_LANE.md` (`advancement:ingest`, scoring, MG envelope).

---

## Operating verdict

```text
Mission: chat-thread-system-advancement-harvest-chatgpt-v1
Lane: ADVANCEMENT_SYNTHESIS (alias: CHAT_CONTEXT_ONLY)
Start verdict: UNSYNTHESIZED_THREAD (alias: UNHARVESTED_THREAD)
Target tier: T3 when paired with OBSERVED; T2 advancement-only when operator directs
Output verdict: DRAFT_ADVANCEMENTS_FOR_CURSOR_VALIDATION (alias: SYSTEM_ADVANCEMENT_DRAFT_READY)
```

| Verdict | Meaning |
| --- | --- |
| `SYSTEM_ADVANCEMENT_DRAFT_READY` | Advancement findings complete; novel synthesis present |
| `DRAFT_READY_FOR_CURSOR_VALIDATION` | Hand off to Cursor |
| `HARVEST_PARTIAL` | Missing sections, seeds, or failed novelty gate |
| `NO_NEW_ADVANCEMENT` | Honest close — thread adds no meaningful improvement |
| `HARVEST_COMPLETE` | **Forbidden in ChatGPT** |
| `OPERATIONAL` | **Forbidden in ChatGPT** |
| `FULLY_SEEDED` | **Forbidden in ChatGPT** |
| `IMPLEMENTED` / `DEPLOYED` / `VALIDATED` | **Forbidden in ChatGPT** |

### Retrieval code (ChatGPT)

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

Do **not** claim `INDEX_HIT`, `INDEX_HIT_AI_CACHE`, `FAILOVER_*`, or any live hub code.

---

## Forbidden advancement output

Do **not** merely restate:

- prior commands, status tables, existing architecture
- previously suggested fixes, historical summaries, reorganized autopsy prose

See [system-advancement-quality-gate.md](./system-advancement-quality-gate.md).

---

## Evidence classification (mandatory)

Every `EVT`, `HP`, `ED`, `DUP`, `TW`, `OF`, seed `evidenceRef`, and `IMP` evidence link must include one:

| Class | Meaning |
| --- | --- |
| `CHAT_DIRECT` | Visible user/assistant statement |
| `ATTACHMENT_SOURCE` | Attached file the model can read |
| `USER_REPORTED_OPERATIONAL` | Pasted output not verified in session |
| `CROSS_CHECK_CANDIDATE` | Code, test, deploy, branch, receipt, runtime, index, publication |

Operational/runtime claims default to `CROSS_CHECK_CANDIDATE` unless Cursor verifies later.

---

## Proposal classification

| Class | Meaning |
| --- | --- |
| `EXTRACTED` | Directly suggested in conversation |
| `SYNTHESIZED` | Combined from multiple observations — **not explicit in thread** |
| `INVENTED` | New design from first principles (evidence-linked problem) |
| `CROSS_CHECK_REQUIRED` | Depends on repo, runtime, cost, ownership facts |

May combine (e.g. `SYNTHESIZED` + `CROSS_CHECK_REQUIRED`).

---

## Advancement provenance (`ADV-###`)

Schema: `scripts/harvest/schema/advancement-intelligence-v1.schema.json`

```json
{
  "conceptId": "ADV-THREAD-001",
  "intelligenceKind": "advancement",
  "classification": ["SYNTHESIZED"],
  "derivedFrom": ["EVT-006", "TW-001"],
  "novelContribution": "...",
  "status": "CANDIDATE",
  "verificationRequired": true,
  "implementationStatus": "NOT_STARTED"
}
```

Each `IMP-###` links to `ADV-###` with `smallestUsefulVersion`, `fullVision`, `acceptanceProof`.

### Candidate JSON shape (preferred per `ADV-###`)

```json
{
  "advancementId": "ADV-001",
  "title": "Concise concept name",
  "advancementCategory": "AUTOMATION_CANDIDATE",
  "classification": ["SYNTHESIZED", "CROSS_CHECK_REQUIRED"],
  "problem": "The current limitation or opportunity.",
  "newCapability": "What should exist.",
  "whyNow": "What this thread proved or enabled.",
  "sourceObservations": [{ "ref": "EVT-001", "evidenceClass": "CHAT_DIRECT" }],
  "authorityModel": {
    "owner": "proposed owner repo",
    "sourceOfTruth": "proposed authority",
    "humanApproval": "required | not required"
  },
  "expectedValue": {
    "timeSavings": "low | medium | high",
    "tokenSavings": "low | medium | high",
    "riskReduction": "low | medium | high",
    "reusePotential": "low | medium | high"
  },
  "implementationSize": "XS | S | M | L | XL",
  "confidence": "low | medium | high",
  "noveltyStatus": "NEEDS_REGISTRY_LOOKUP",
  "nextProof": "Cheapest experiment or verification step.",
  "status": "CANDIDATE"
}
```

### Opportunity map (before candidate inventory)

Classify each observation into one or more:

`REMOVE` | `SIMPLIFY` | `AUTOMATE` | `COMBINE` | `CENTRALIZE` | `DELEGATE` | `PRODUCTIZE` | `GENERALIZE` | `PREDICT` | `SELF_HEAL` | `MONETIZE`

### ROI scoring (Cursor validates; ChatGPT drafts)

Score each candidate 1–5 on: Novelty, Impact, Feasibility, Reuse, Urgency, Evidence, Time to value, Strategic fit.

Weighted bands (Cursor-side): 85–100 `ADVANCE_TO_EXPERIMENT`; 70–84 `ADVANCE_TO_DESIGN`; 55–69 `HOLD_FOR_RESEARCH`; 40–54 `PARK`; 0–39 `REJECT`.

Do not invent precise dollar values — use ranges and label assumptions.

### Novelty status (per candidate)

`NOVEL` | `PARTIAL_OVERLAP` | `EXISTING_IMPLEMENTATION` | `EXISTING_CONCEPT` | `DUPLICATE` | `COMBINE_WITH_EXISTING` | `NEEDS_REGISTRY_LOOKUP`

---

## Advancement lifecycle states (ChatGPT vs Cursor)

ChatGPT may only create `CANDIDATE`. Cursor/operator own:

`NOVELTY_VERIFIED` → `DESIGN_APPROVED` → `EXPERIMENT_APPROVED` → `EXPERIMENT_RUNNING` → `EXPERIMENT_VERIFIED` → `IMPLEMENTATION_APPROVED` → `IMPLEMENTED` → `PILOT_VERIFIED` → `PRODUCTION_APPROVED` | `REJECTED` | `PARKED`

---

## Advancement cycle assessment

Per [advancement-cycle-taxonomy-v1.md](./advancement-cycle-taxonomy-v1.md): `NEW_EVIDENCE`, `NEW_SYNTHESIS`, `DUPLICATE_CONCEPT`, `REFINEMENT`, `VALIDATED_ADVANCEMENT`, `NO_NEW_ADVANCEMENT`.

---

## Analysis domains (required inspection)

1. Application workflow  
2. Application architecture  
3. Token and context efficiency  
4. Long-running SDLC / gated waves ([gated-wave-lifecycle-v1.md](./gated-wave-lifecycle-v1.md))  
5. Agent and cross-repository coordination  
6. Reliability and recovery  
7. Operator experience  
8. New application and platform capabilities  

---

## Minimum proposal counts

| Category | Min |
| --- | --- |
| Workflow improvements | 3 |
| Architecture improvements | 3 |
| Token-efficiency improvements | 3 |
| SDLC / long-run improvements | 3 |
| Operator-experience improvements | 2 |
| Reliability improvements | 2 |
| New platform capabilities | 2 |

When SDLC work is substantial, also meet gated-wave minimums in [gated-wave-lifecycle-v1.md](./gated-wave-lifecycle-v1.md).

Each `IMP-###` includes `wavePhaseImproved` where applicable (`Wave0`–`Wave13` or `CROSS_WAVE`).

---

## Required output structure

Use [chatgpt-system-advancement-findings-template.md](./chatgpt-system-advancement-findings-template.md).

Minimum sections: executive summary, retrieval preflight, scope ledger, correction ledger (`COR-###`), advancement cycle assessment, EVT inventory, system diagnosis, `IMP-###` / `ADV-###` proposals, workflow redesign, token analysis, SDLC model, architecture horizons, reusable components, waste (`TW-###`), duplication (`DUP-###` with five-class taxonomy), ranked backlog, experiments, advancement seeds, capabilities, Cursor cross-check plan, novelty self-check, publication truth (all `not-run`), handoff.

### Duplication classes (per `DUP-###`)

`REPEATED_DISCUSSION` | `POSSIBLE_EXISTING_IMPLEMENTATION` | `POSSIBLE_EXISTING_HARVEST` | `INTENTIONALLY_DEFERRED` | `FALSE_DUPLICATE_DIFFERENT_HOST_OR_CONTEXT`

Use `NEEDS_REGISTRY_LOOKUP_FIRST` when registry/harvest lookup required.

---

## Git branch (findings placement)

| Field | Value |
| --- | --- |
| GitHub repo | `Capglass5708/CapitalGlass-Cross-Agent` |
| Branch | `chat-gpt-harvest` |
| Draft-only | Do **not** merge to `main` |

**File path:**

```text
artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/system-advancement-findings-source.md
```

Distinct from autopsy `chatgpt-findings-source.md` on the same harvest id.

---

## Handoff to Cursor

**Push first.** GitHub Action moves draft to L: staging; Cursor pulls from `chat-gpt-harvest`.

Phase 1: manual validation from Markdown. Phase 2: structured ingest (not shipped).

```text
Pull branch chat-gpt-harvest on CapitalGlass-Cross-Agent.

# Phase 2 (when available):
npm run harvest:ingest-chatgpt-advancement -- \
  --input=artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/system-advancement-findings-source.md \
  --harvest-id=harvest-YYYY-MM-DD-<slug>-v1

# Planned Cursor chain (Phase 2):
npm run advancement:duplication-preflight -- --harvest-id=<id>
npm run advancement:novelty-check -- --harvest-id=<id>
npm run advancement:score -- --harvest-id=<id>
npm run advancement:validate -- --harvest-id=<id>

# Future Data-Extraction (from L: staging):
# cd Data-Extraction && npm run advancement:ingest -- --source=<findings.md> --advancement-id=<ADV-id>

Cursor verifies CROSS_CHECK_REQUIRED; operator approves candidates before publish-intelligence-full.
```

---

## ChatGPT opener prompt (copy/paste)

```text
Run chat-thread-system-advancement-harvest-chatgpt-v1.

Lane: CHAT_CONTEXT_ONLY. Treat visible conversation and attachments as the only available evidence.

Declare mode in your first sentence: REVIEW_ONLY or DRAFT_FILE.

Start with:

Mission: chat-thread-system-advancement-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Start verdict: UNHARVESTED_THREAD
Target tier: T2
Output verdict: SYSTEM_ADVANCEMENT_DRAFT_READY

Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN

Do NOT claim INDEX_HIT, INDEX_HIT_AI_CACHE, HARVEST_COMPLETE, OPERATIONAL,
FULLY_SEEDED, IMPLEMENTED, DEPLOYED, VALIDATED, or any live gate pass.

This is SYNTHESIS not replay. Do not merely summarize or reorganize the thread.

Evidence classification on every evidenceRef:
CHAT_DIRECT | ATTACHMENT_SOURCE | USER_REPORTED_OPERATIONAL | CROSS_CHECK_CANDIDATE

Proposal classification:
EXTRACTED | SYNTHESIZED | INVENTED | CROSS_CHECK_REQUIRED

Before EVT inventory: Scope ledger + Correction ledger (COR-###).
Include Advancement cycle assessment (NEW_SYNTHESIS | NO_NEW_ADVANCEMENT | ...).

Produce system-advancement-findings-source.md per chatgpt-system-advancement-findings-template.md.

Minimum: SYNTHESIZED (not explicit in thread) + INVENTED + failure-class removal
+ token reduction + gated-wave improvement + acceptance proofs for top-3.

Pass system-advancement-quality-gate.md novelty checks before push.

Commit to:
Repo: Capglass5708/CapitalGlass-Cross-Agent
Branch: chat-gpt-harvest
File: artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/system-advancement-findings-source.md

End with SYSTEM_ADVANCEMENT_DRAFT_READY and Cursor handoff command.
Honor CONCEPT_ONLY_NO_WRITE / STOP_NOW if applicable.
```

---

## ChatGPT push instructions (mandatory closeout)

Follow [CHATGPT-HARVEST-GIT-PUBLICATION-CONTRACT-V1.md](./CHATGPT-HARVEST-GIT-PUBLICATION-CONTRACT-V1.md) — `CHATGPT_HARVEST_GIT_GATE`.

1. Run novelty self-check ([system-advancement-quality-gate.md](./system-advancement-quality-gate.md)).
2. Checkout `chat-gpt-harvest`.
3. Write `system-advancement-findings-source.md` under `artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/`.
4. Commit: `harvest(chatgpt): system advancement draft harvest-YYYY-MM-DD-<slug>-v1`
5. Push to `origin chat-gpt-harvest` — not `main`.
6. Verify remote SHA == local SHA; emit `gitPublicationReceipt`.
7. Claim `CHATGPT_SOURCE_PUBLISHED` only if gate PASS; else `BLOCKED_GIT_PUBLICATION`.
8. State `L: move: NOT_RUN_BY_CHATGPT` (GitHub Action when workflow on `main`).
9. State `Advancement status: CANDIDATE`; `Publication: NOT_RUN_BY_CURSOR`; `Implementation: NOT_AUTHORIZED`.

| Claim after push | Allowed? |
| --- | --- |
| `CHATGPT_SOURCE_PUBLISHED` + SHA receipt | Yes (gate PASS) |
| `SYSTEM_ADVANCEMENT_DRAFT_READY` only | Yes if push not yet verified |
| L: staging move complete | **No** — Action only |
| `HARVEST_COMPLETE` / gate passes / `PUBLICATION_PASS` | **No** |
| Data-Extraction ingest complete | **No** — deferred |

### Publication truth (mandatory footer)

| Layer | State |
| --- | --- |
| Git draft | `not-run` or commit SHA |
| L: draft staging (GitHub Action) | `not-run` |
| Cursor ingest | `not-run` |
| Novelty verification | `not-run` |
| Architecture verification | `not-run` |
| L: Hub publication | `not-run` |
| Z: cache projection | `not-run` |
| Supabase projection | `not-run` |
| Data-Extraction advancement ingest | `not-run` |
| Backlog creation | `not-run` |
| Implementation authorization | `not-run` |

---

## Related files

| File | Role |
| --- | --- |
| [chat-thread-closeout-autopsy-harvest-chatgpt-v1.md](./chat-thread-closeout-autopsy-harvest-chatgpt-v1.md) | OBSERVED intelligence lane |
| [chatgpt-system-advancement-findings-template.md](./chatgpt-system-advancement-findings-template.md) | Findings template |
| `.github/workflows/chatgpt-harvest-move-to-l.yml` | Push → L: staging |
| `Data-Extraction/docs/platform/SUITE_ADVANCEMENT_GRAPH_LANE.md` | Future scoring/graph ingest |
| `scripts/harvest/schema/advancement-intelligence-v1.schema.json` | `ADV-###` provenance |
| `scripts/harvest/schema/gated-wave-state-v1.schema.json` | Wave state stub (Phase 6) |
| `scripts/harvest/schema/system-advancement-seed-packet-v1.schema.json` | Advancement seeds |

---

## Design principle

The thread makes the **next wave** better — not merely remembered. Advancement intelligence compounds; observed intelligence grounds it.
