# Chat Thread Closeout Autopsy — ChatGPT Protocol v1

**Z operator path:** `Z:\Capital-Glass-Dev\Harvest\protocol\CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md`  
**Intelligence kind:** **OBSERVED** — what happened, failed, passed, was learned (not synthesis).

**Work package pattern:** `chat-thread-closeout-autopsy-harvest-chatgpt-v1`  
**Parent protocol (Cursor / operator):** [chat-thread-closeout-autopsy-harvest-v1.md](./chat-thread-closeout-autopsy-harvest-v1.md)  
**Preferred input (Cursor → ChatGPT):** [chat-improvement-extract-chatgpt-v1.md](./chat-improvement-extract-chatgpt-v1.md) — improvements + cross-check only  
**Authority repo:** CapitalGlass-Cross-Agent  
**Lane:** `CHAT_CONTEXT_ONLY` — visible conversation + attachments only

---

## Operator quick start (run this in ChatGPT)

| Question | Answer |
| --- | --- |
| **OBSERVED autopsy (this file)?** | Yes — thread facts, packets, waste, seeds. Output: `chatgpt-findings-source.md` |
| **ADVANCEMENT synthesis?** | **No** — use `CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md` → `system-advancement-findings-source.md` |
| **Branch** | `chat-gpt-harvest` on `Capglass5708/CapitalGlass-Cross-Agent` (never `main`) |

**Steps**

1. Paste or attach the **full completed Cursor chat** (or export) into ChatGPT.
2. @ this protocol file on Z, or paste the **ChatGPT opener** (§ below).
3. First sentence must declare `REVIEW_ONLY` or `DRAFT_FILE`.
4. For `DRAFT_FILE`: produce complete findings Markdown, then **push** per § ChatGPT push instructions.
5. End with Cursor handoff: `npm run harvest:ingest-chatgpt-findings`.

**One-line trigger (paste after the thread)**

```text
Run chat-thread-closeout-autopsy-harvest-chatgpt-v1 per Z:\Capital-Glass-Dev\Harvest\protocol\CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md — DRAFT_FILE, OBSERVED lane only, push to chat-gpt-harvest.
```

---

## Purpose

Use **ChatGPT** to draft findings from a completed conversation when Cursor, L:, Git, and index commands are **not available**.

**Default use:** feed [chat-improvement-extract-chatgpt-v1.md](./chat-improvement-extract-chatgpt-v1.md) with a Cursor chat — extract token/architecture/speed/intelligence improvements; treat code claims as **cross-check candidates only** (not source of truth).

**Full autopsy lane:** this file — eight packet kinds, waste ledger, full thread autopsy when you need maximum structure.

ChatGPT produces **draft seed material**. Cursor **verifies** code cross-checks and validates before Intelligence Hub publication.

**ChatGPT is never source of truth** for code, deploy status, or index state.

For **synthesized system improvements** (not observed replay), use sibling protocol [chat-thread-system-advancement-harvest-chatgpt-v1.md](./chat-thread-system-advancement-harvest-chatgpt-v1.md) — **ADVANCEMENT** intelligence lane.

---

## Operating verdict

Start every ChatGPT harvest with:

```text
Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Start verdict: UNHARVESTED_THREAD
Target tier: T2 (default for ChatGPT threads with corrections or multi-topic scope)
Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION
```

| Verdict | Meaning |
| --- | --- |
| `DRAFT_READY_FOR_CURSOR_VALIDATION` | Full autopsy findings complete; hand off to Cursor |
| `DRAFT_IMPROVEMENTS_FOR_CURSOR_VALIDATION` | Improvement-extract lane complete ([chat-improvement-extract-chatgpt-v1.md](./chat-improvement-extract-chatgpt-v1.md)) |
| `HARVEST_PARTIAL` | Missing packets, seeds, or evidence |
| `NO_HARVEST_NEEDED` | No durable value in thread |
| `HARVEST_COMPLETE` | **Forbidden in ChatGPT** — only Cursor after `harvest:validate` PASS |
| `OPERATIONAL` | **Forbidden in ChatGPT** — only after `harvest:publish-intelligence-full` |

### Retrieval code (ChatGPT)

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

Do **not** claim `INDEX_HIT`, `INDEX_HIT_AI_CACHE`, `FAILOVER_SUPABASE`, or any live hub code unless you executed the command in this session (you did not).

---

## Evidence classification (mandatory)

Every `EVT`, `HP`, `ED`, `DUP`, and seed `evidenceRef` must include one classification:

| Class | Meaning |
| --- | --- |
| `CHAT_DIRECT` | Directly visible user or assistant statement |
| `ATTACHMENT_SOURCE` | Supported by an attached source file |
| `USER_REPORTED_OPERATIONAL` | Pasted result not independently verified |
| `CROSS_CHECK_CANDIDATE` | Code, test, deploy, receipt, branch, runtime, index, publication |

Operational claims default to `USER_REPORTED_OPERATIONAL` or `CROSS_CHECK_CANDIDATE`.

---

## Scope ledger (before EVT inventory)

- primary mission
- closed lanes
- open lanes
- unrelated follow-ups
- deferred work
- do-not-merge boundaries

---

## Correction ledger (`COR-###`)

- priorAssumption
- correction
- correctedModel
- affectedFindings (EVT/HP/ROI ids)
- futurePrevention (optional)

Corrections override earlier assumptions in the final artifact.

---

## Execution modes (declare in first response)

Before any artifact or long output, state the mode:

| Mode | Allowed | Forbidden |
| --- | --- | --- |
| `REVIEW_ONLY` | Read, analyze, answer questions | Files, tools, implementation |
| `DRAFT_FILE` | Produce Markdown/JSON **in chat** or as downloadable draft | Repo edits, validation claims |
| `EDIT_EXISTING` | User explicitly asked to change a named file | Unnamed scope creep |
| `IMPLEMENT_REPO` | **Not available in ChatGPT** | — use Cursor |
| `PUBLISH_OPERATOR` | **Not available in ChatGPT** | — operator + Cursor |

### Hard guards (non-negotiable)

**`CONCEPT_ONLY_NO_WRITE`** — when the user says concept only, do not write code, or don't worry about the code:

- No implementation steps framed as actions to run now
- No pretending repo files were updated
- Respond in review/planning language only

**`STOP_NOW`** — when the user says stop, just stop, or halt:

- Do not continue the prior plan
- Do not open new subtasks
- Resume only after explicit new instruction

**`SOURCE_AUTHORITY`** — when the user attaches a protocol and says it is source of truth:

- Follow the **attached file**, not earlier drafts or memory
- Cite which sections you used

---

## What ChatGPT can and cannot do

| Action | ChatGPT | Cursor |
| --- | --- | --- |
| Thread event inventory | Yes (from visible chat) | Yes + repo evidence |
| Harvest packets (8 kinds) | Yes (draft) | Yes (canonical JSON) |
| `thread-autopsy-bundle.json` | Draft equivalent in Markdown | Canonical file |
| `seed-packets/*.json` | Draft JSON blocks in findings file | Canonical + schema validate |
| `harvest:duplication-preflight` | No | Yes |
| `harvest:validate` | No | Yes |
| `harvest:publish-intelligence-full` | No | Operator |
| Claim `FULLY_SEEDED` | **Never** | Only with receipts |
| Claim `INDEX_HIT` | **Never** | After scout preflight |

---

## Required output structure

Produce **one Markdown findings file** with these sections (minimum):

1. Final summary (verdict template)
2. Harvest verdict + tier rationale
3. Retrieval preflight (`INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT`)
4. Scope ledger
5. Correction ledger (`COR-###`)
6. Thread event inventory (`EVT-###`) — each with evidence classification
7. Harvest packets (`HP-###`, all 8 kinds as applicable)
6. Execution deltas (`ED-###`, actual vs optimal)
7. Waste ledger (`TW-###` or `NONE_FOUND` with proof)
8. Duplication detector (`DUP-###` from visible context / pasted reports)
9. Operator friction (`OF-###`)
10. ROI backlog (ranked)
11. Do-not-advance guards
12. Seed packet candidates (≥1 per ROI top-3; JSON blocks)
13. Future-agent instructions
14. Publication truth table (all layers `not-run`)
15. Acceptance checklist
16. Next operator action (hand off to Cursor)
17. Git push instructions (branch `chat-gpt-harvest` — see end of protocol)

**Template reference:** `chat-thread-autopsy-findings-from-current-chat-v1.md` (example harvest from a real ChatGPT thread).

---

## Seed packet rules (ChatGPT draft)

Each seed in the findings file must include:

- `seedId` — unique, prefix `IH-THREAD-` recommended
- `kind` — `failure-pattern` | `protocol-upgrade` | `lesson` | etc.
- ≥2 `retrievalQuestions`
- ≥1 `evidenceRefs` with classification (chat turns, attachments, pasted reports)
- `futureAgentInstructions` — whenThisAppears, startAt, runPreflight, doNot, proveBeforeClaiming
- `status: "CANDIDATE"` only — never `APPROVED`

---

## Git branch (ChatGPT findings placement)

ChatGPT must commit and **push** findings to the dedicated harvest branch on the authority repo.

| Field | Value |
| --- | --- |
| GitHub repo | `Capglass5708/CapitalGlass-Cross-Agent` |
| Branch | `chat-gpt-harvest` (created from `main`; hyphenated — Git branch names cannot use spaces) |
| Draft-only | Yes — do **not** merge to `main`; Cursor validates before publication |

**Recommended file path** (matches Cursor ingest):

```text
artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/chatgpt-findings-source.md
```

Replace `<slug>` with a short thread identifier (e.g. `cursor-session`, `po-debug-thread`).

If the ChatGPT host cannot push to GitHub, produce the findings file in chat and tell the operator to place it on `chat-gpt-harvest` manually before Cursor ingest.

---

## Handoff to Cursor

When findings are ready, give Cursor:

1. The findings Markdown file on branch `chat-gpt-harvest` (repo path above, or paste)
2. Instruction:

```text
Ingest ChatGPT thread autopsy findings per chat-thread-closeout-autopsy-harvest-chatgpt-v1.

npm run harvest:ingest-chatgpt-findings -- --input=<findings.md> --harvest-id=harvest-YYYY-MM-DD-<slug>-v1

Then run duplication-preflight, validate, and (operator) publish-intelligence-full.
```

Cursor command chain after ingest:

```bash
npm run harvest:duplication-preflight -- --harvest-id=<id>
npm run harvest:sync-derived -- <id>
npm run harvest:validate -- <id>
npm run harvest:validate-autopsy -- --harvest-id=<id>
npm run test:harvest
# operator:
npm run harvest:publish-intelligence-full -- --harvest-id=<id>
```

---

## Duplication prevention (ChatGPT lane)

ChatGPT cannot run automated preflight. Instead:

1. **Consult pasted reports** — if the user pasted harvest/index status, treat as stale until Cursor verifies
2. **Record `duplicateWork[]` / `DUP-###`** when the thread re-debated the same milestone
3. **Do not invent new seed IDs** that duplicate themes already in pasted `thread-autopsy-index` excerpts
4. **Label** `NEEDS_REGISTRY_LOOKUP_FIRST` on repeated_work packets

Per `DUP-###`, classify duplication as one of:

`REPEATED_DISCUSSION` | `POSSIBLE_EXISTING_IMPLEMENTATION` | `POSSIBLE_EXISTING_HARVEST` | `INTENTIONALLY_DEFERRED` | `FALSE_DUPLICATE_DIFFERENT_HOST_OR_CONTEXT`

Cursor ingest + `harvest:duplication-preflight` enforces hard blocks before publish.

---

## Pre-push self-check (autopsy)

Before commit to `chat-gpt-harvest`:

- No live retrieval claim (`INDEX_HIT*`, etc.)
- No `HARVEST_COMPLETE` / `OPERATIONAL` / `FULLY_SEEDED`
- ROI top-3 each has seed candidate with ≥2 `retrievalQuestions`
- Every operational claim labeled `USER_REPORTED_OPERATIONAL` or `CROSS_CHECK_CANDIDATE`
- Closed and open lanes not conflated
- Corrections override earlier assumptions
- Publication table entirely `not-run`

---

## Publication truth (mandatory footer)

Every ChatGPT findings file must end with:

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

---

## ChatGPT opener prompt (copy/paste)

```text
Run chat-thread-closeout-autopsy-harvest-chatgpt-v1.

Lane: CHAT_CONTEXT_ONLY. Treat visible conversation and attachments as the only available evidence.

Declare mode in your first sentence: REVIEW_ONLY or DRAFT_FILE.

Start with retrieval block (INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT).

Do NOT claim INDEX_HIT, INDEX_HIT_AI_CACHE, HARVEST_COMPLETE, OPERATIONAL, or FULLY_SEEDED.

Classify all evidence: CHAT_DIRECT | ATTACHMENT_SOURCE | USER_REPORTED_OPERATIONAL | CROSS_CHECK_CANDIDATE.

Before EVT inventory: Scope ledger + Correction ledger (COR-###).

Produce one Markdown findings file with:
- thread event inventory (EVT-###) with evidence classes
- harvest packets (HP-###, 8 kinds as applicable)
- execution deltas, waste ledger, duplication detector (five-class DUP-###), operator friction
- ROI top-3+, do-not-advance guards
- seed packet JSON blocks (≥2 retrievalQuestions each, classified evidenceRefs)
- publication truth table (all not-run)

Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION.

If I said concept-only or stop earlier in the thread, honor CONCEPT_ONLY_NO_WRITE / STOP_NOW.

Run pre-push self-check. Push per "ChatGPT push instructions" below.

End with: hand off command for Cursor ingest (harvest:ingest-chatgpt-findings).
```

---

## ChatGPT push instructions (mandatory closeout)

When the findings Markdown file is complete, **end every harvest session** by telling the operator (or executing, if GitHub is connected) these steps:

```text
Repo: Capglass5708/CapitalGlass-Cross-Agent
Branch: chat-gpt-harvest
File: artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/chatgpt-findings-source.md
```

### Steps

1. **Checkout** branch `chat-gpt-harvest` (base: `main`).
2. **Create** the harvest run directory if needed:
   `artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/`
3. **Write** the complete findings Markdown to:
   `chatgpt-findings-source.md` in that directory.
4. **Commit** with a message such as:
   `harvest(chatgpt): draft findings harvest-YYYY-MM-DD-<slug>-v1`
5. **Push** to `origin chat-gpt-harvest` — do **not** push to `main`.
6. **Report** the commit SHA and file path in chat.
7. **Hand off to Cursor** with:

```text
Pull branch chat-gpt-harvest on CapitalGlass-Cross-Agent.

npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-YYYY-MM-DD-<slug>-v1

Then run duplication-preflight, validate, and (operator) publish-intelligence-full.
```

### What ChatGPT must not claim after push

| Claim | Allowed after push? |
| --- | --- |
| Findings committed to `chat-gpt-harvest` | Yes |
| `DRAFT_READY_FOR_CURSOR_VALIDATION` | Yes |
| `harvest:validate` PASS | **No** — Cursor only |
| `HARVEST_COMPLETE` / `OPERATIONAL` | **No** |
| Merge to `main` | **No** — operator/Cursor only |

Publication truth table in the findings file remains `not-run` until Cursor completes validation and (operator) publish.

---

## Related files

| File | Role |
| --- | --- |
| [chat-thread-closeout-autopsy-harvest-chatgpt-v1.md](./chat-thread-closeout-autopsy-harvest-chatgpt-v1.md) | ChatGPT OBSERVED autopsy lane |
| [chat-thread-system-advancement-harvest-chatgpt-v1.md](./chat-thread-system-advancement-harvest-chatgpt-v1.md) | ChatGPT ADVANCEMENT synthesis lane |
| [gated-wave-lifecycle-v1.md](./gated-wave-lifecycle-v1.md) | Concept-to-completion waves 0–13 |
| [system-advancement-quality-gate.md](./system-advancement-quality-gate.md) | Novelty gate (advancement) |
| [thread-autopsy-hub-accommodation-v1.md](./thread-autopsy-hub-accommodation-v1.md) | L: hub paths |
| `scripts/harvest/ingest-chatgpt-findings.mjs` | Convert findings MD → Cross-Agent harvest artifacts |
| `artifacts/agent-runs/harvest-2026-08-04-chatgpt-autopsy-findings-v1/` | Example ingested harvest from pilot findings |

---

## Design principle

ChatGPT **remembers the conversation once** in structured draft form. Cursor **makes it operational** so the estate never has to re-live the thread.
