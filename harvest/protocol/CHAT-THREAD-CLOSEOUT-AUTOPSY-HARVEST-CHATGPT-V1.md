# Chat Thread Closeout Autopsy — ChatGPT Protocol v1

**Work package pattern:** `chat-thread-closeout-autopsy-harvest-chatgpt-v1`  
**Parent protocol (Cursor / operator):** [chat-thread-closeout-autopsy-harvest-v1.md](./chat-thread-closeout-autopsy-harvest-v1.md)  
**Preferred input (Cursor → ChatGPT):** [chat-improvement-extract-chatgpt-v1.md](./chat-improvement-extract-chatgpt-v1.md) — improvements + cross-check only  
**Authority repo:** CapitalGlass-Cross-Agent  
**Lane:** `CHAT_CONTEXT_ONLY` — visible conversation + attachments only

---

## Purpose

Use **ChatGPT** to draft findings from a completed conversation when Cursor, L:, Git, and index commands are **not available**.

**Default use:** feed [chat-improvement-extract-chatgpt-v1.md](./chat-improvement-extract-chatgpt-v1.md) with a Cursor chat — extract token/architecture/speed/intelligence improvements; treat code claims as **cross-check candidates only** (not source of truth).

**Full autopsy lane:** this file — eight packet kinds, waste ledger, full thread autopsy when you need maximum structure.

ChatGPT produces **draft seed material**. Cursor **verifies** code cross-checks and validates before Intelligence Hub publication.

**ChatGPT is never source of truth** for code, deploy status, or index state.

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
| Identify Lane C protocol-improvement candidates (draft) | Yes — label `protocol-upgrade` or equivalent | Yes (canonical) |
| Run `harvest:export:protocol-self-learning` | **No** | Yes (after validate PASS) |
| Run Data-Extraction Lane C ingest/publish | **No** | Yes (Data-Extraction repo) |
| Publish to `L:\02-catalog\Harvest\Harvest Protocol Self Learning` | **Never** | Data-Extraction only; L is retrieval-only |

---

## Required output structure

Produce **one Markdown findings file** with these sections (minimum):

1. Final summary (verdict template)
2. Harvest verdict + tier rationale
3. Retrieval preflight (`INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT`)
4. Thread event inventory (`EVT-###`)
5. Harvest packets (`HP-###`, all 8 kinds as applicable)
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

**Template reference:** `chat-thread-autopsy-findings-from-current-chat-v1.md` (example harvest from a real ChatGPT thread).

---

## Seed packet rules (ChatGPT draft)

Each seed in the findings file must include:

- `seedId` — unique, prefix `IH-THREAD-` recommended
- `kind` — `failure-pattern` | `protocol-upgrade` | `lesson` | etc.
- ≥2 `retrievalQuestions`
- ≥1 `evidenceRefs` (chat turns, attachments, pasted reports)
- `futureAgentInstructions` — whenThisAppears, startAt, runPreflight, doNot, proveBeforeClaiming
- `status: "CANDIDATE"` only — never `APPROVED`

### Lane C — harvest protocol self-learning (draft only)

ChatGPT may **identify and label** harvest-protocol improvement candidates when the thread exposes protocol weaknesses (validators, publication truth, routing, PromptOps boundaries, etc.).

- Use `kind: protocol-upgrade` (or label packets as protocol-improvement candidates) when the finding targets harvest protocol files, schemas, validators, commands, or authority rules.
- **Separate** protocol improvements from general build findings, application bugs, and product ideas — those stay in normal packet kinds, not Lane C.
- ChatGPT **does not** run `harvest:export:protocol-self-learning`.
- ChatGPT **does not** run Data-Extraction `harvest-protocol:self-learning:*` commands.
- ChatGPT **does not** publish to `L:\02-catalog\Harvest\Harvest Protocol Self Learning`.
- Report all Lane C publication fields as `not-run` in the publication truth table (`exportStatus`, `dataExtractionStatus`, `catalogPublishStatus`, `retrievalStatus`).
- Cursor verifies candidates, ingests into Cross-Agent manifest, and runs validation; Cross-Agent export + Data-Extraction make the lane operational.

Lane C remains **separate** from WaveRunner self-improvement (`L:\02-catalog\SDLC Gated Wave Protocols\WaveRunner Self Improvements Harvesting`).

---

## Handoff to Cursor

When findings are ready, give Cursor:

1. The findings Markdown file (path or paste)
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

Cursor ingest + `harvest:duplication-preflight` enforces hard blocks before publish.

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
| Lane C export (`harvest:export:protocol-self-learning`) | `not-run` |
| Lane C Data-Extraction ingest/publish | `not-run` |
| Lane C catalog (`Harvest Protocol Self Learning`) | `not-run` |
| Lane C retrieval | `not-run` |
| Lane C authority | `PROPOSAL` / `RETRIEVAL_ONLY` (not approved) |
| Automatic protocol mutation | `false` |

```text
Publication: NOT_RUN_BY_CURSOR
projection.hubPublishStatus: not-run
protocolSelfLearning.exportStatus: not-run
protocolSelfLearning.catalogPublishStatus: not-run
```

---

## ChatGPT opener prompt (copy/paste)

```text
Run chat-thread-closeout-autopsy-harvest-chatgpt-v1.

Lane: CHAT_CONTEXT_ONLY. Treat this entire conversation as source truth.

Declare mode in your first sentence: REVIEW_ONLY or DRAFT_FILE.

Do NOT claim INDEX_HIT, HARVEST_COMPLETE, OPERATIONAL, or FULLY_SEEDED.

Produce one Markdown findings file with:
- thread event inventory (EVT-###)
- harvest packets (HP-###, 8 kinds as applicable)
- execution deltas, waste ledger, duplication detector, operator friction
- ROI top-3+, do-not-advance guards
- seed packet JSON blocks (≥2 retrievalQuestions each)
- publication truth table (all not-run)

Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION.

If I said concept-only or stop earlier in the thread, honor CONCEPT_ONLY_NO_WRITE / STOP_NOW.

End with: hand off command for Cursor ingest (harvest:ingest-chatgpt-findings).
```

---

## Related files

| File | Role |
| --- | --- |
| [chat-improvement-extract-chatgpt-v1.md](./chat-improvement-extract-chatgpt-v1.md) | **Default** — feed ChatGPT with Cursor chats; improvements + cross-check only |
| [chat-thread-closeout-autopsy-harvest-v1.md](./chat-thread-closeout-autopsy-harvest-v1.md) | Cursor + operator canonical protocol (L:) |
| [thread-autopsy-hub-accommodation-v1.md](./thread-autopsy-hub-accommodation-v1.md) | L: hub paths |
| `scripts/harvest/ingest-chatgpt-findings.mjs` | Convert findings MD → Cross-Agent harvest artifacts |
| `artifacts/agent-runs/harvest-2026-08-04-chatgpt-autopsy-findings-v1/` | Example ingested harvest from pilot findings |

---

## Design principle

ChatGPT **remembers the conversation once** in structured draft form. Cursor **makes it operational** so the estate never has to re-live the thread.
