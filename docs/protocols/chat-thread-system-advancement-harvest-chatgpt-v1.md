# Chat Thread System Advancement Harvest — ChatGPT Protocol v1

**Work package pattern:** `chat-thread-system-advancement-harvest-chatgpt-v1`  
**Sibling (OBSERVED intelligence):** [chat-thread-closeout-autopsy-harvest-chatgpt-v1.md](./chat-thread-closeout-autopsy-harvest-chatgpt-v1.md)  
**Gated waves:** [gated-wave-lifecycle-v1.md](./gated-wave-lifecycle-v1.md)  
**Quality gate:** [system-advancement-quality-gate.md](./system-advancement-quality-gate.md)  
**Cycle taxonomy:** [advancement-cycle-taxonomy-v1.md](./advancement-cycle-taxonomy-v1.md)  
**Findings template:** [chatgpt-system-advancement-findings-template.md](./chatgpt-system-advancement-findings-template.md)  
**Authority repo:** CapitalGlass-Cross-Agent  
**Lane:** `CHAT_CONTEXT_ONLY` — visible conversation + attachments only

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

---

## Operating verdict

```text
Mission: chat-thread-system-advancement-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Start verdict: UNHARVESTED_THREAD
Target tier: T2
Output verdict: SYSTEM_ADVANCEMENT_DRAFT_READY
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

Phase 1: copy findings to run dir (Phase 2 adds structured ingest).

```text
Pull branch chat-gpt-harvest on CapitalGlass-Cross-Agent.

# Phase 2 (when available):
npm run harvest:ingest-chatgpt-advancement -- \
  --input=artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/system-advancement-findings-source.md \
  --harvest-id=harvest-YYYY-MM-DD-<slug>-v1

Cursor verifies CROSS_CHECK_REQUIRED, runs duplication-preflight, validate, (operator) publish-intelligence-full.
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

1. Run novelty self-check ([system-advancement-quality-gate.md](./system-advancement-quality-gate.md)).
2. Checkout `chat-gpt-harvest`.
3. Write `system-advancement-findings-source.md` under `artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/`.
4. Commit: `harvest(chatgpt): system advancement draft harvest-YYYY-MM-DD-<slug>-v1`
5. Push to `origin chat-gpt-harvest` — not `main`.
6. Report commit SHA and path.

| Claim after push | Allowed? |
| --- | --- |
| Findings on `chat-gpt-harvest` | Yes |
| `SYSTEM_ADVANCEMENT_DRAFT_READY` | Yes |
| Gate passes / `WAVE_CLOSED` / `PUBLICATION_PASS` | **No** |

---

## Related files

| File | Role |
| --- | --- |
| [chat-thread-closeout-autopsy-harvest-chatgpt-v1.md](./chat-thread-closeout-autopsy-harvest-chatgpt-v1.md) | OBSERVED intelligence lane |
| `scripts/harvest/schema/advancement-intelligence-v1.schema.json` | `ADV-###` provenance |
| `scripts/harvest/schema/gated-wave-state-v1.schema.json` | Wave state stub (Phase 6) |
| `scripts/harvest/schema/system-advancement-seed-packet-v1.schema.json` | Advancement seeds |

---

## Design principle

The thread makes the **next wave** better — not merely remembered. Advancement intelligence compounds; observed intelligence grounds it.
