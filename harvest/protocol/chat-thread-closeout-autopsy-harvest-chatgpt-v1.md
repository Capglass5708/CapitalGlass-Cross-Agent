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

## Mandatory Git push (DRAFT_FILE closeout — not optional)

`DRAFT_FILE` **includes** committing and pushing findings to GitHub. Chat-only output without a repo push is **incomplete** unless the operator explicitly chose `REVIEW_ONLY` or GitHub access is unavailable.

| Field | Value |
| --- | --- |
| **GitHub repo** | `Capglass5708/CapitalGlass-Cross-Agent` |
| **Branch** | `chat-gpt-harvest` (hyphenated — not `main`, not `chat gpt harvest`) |
| **Local clone path (operator)** | `CapitalGlass-Cross-Agent` on WSL ext4 or Windows dev tree |
| **Findings file** | `artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/chatgpt-findings-source.md` |
| **Commit message** | `harvest(chatgpt): draft findings harvest-YYYY-MM-DD-<slug>-v1` |
| **Push target** | `git push origin chat-gpt-harvest` |

**Closeout order (mandatory)**

1. Produce complete findings Markdown (`chatgpt-findings-source.md` content).
2. **Commit and push** to branch `chat-gpt-harvest` (steps in § ChatGPT push instructions).
3. Report commit SHA + file path in chat.
4. Hand off Cursor: `npm run harvest:ingest-chatgpt-findings` (Cursor runs validation — not ChatGPT).

If GitHub is **not** connected in ChatGPT: produce the file, print the full repo path and branch, and tell the operator to push manually **before** Cursor ingest. Do **not** skip naming the branch and path.

---

## ChatGPT → Git → L: pipeline (automatic after push)

ChatGPT **only** commits and pushes to `chat-gpt-harvest`. Everything after push is **estate automation** — ChatGPT must not claim these steps ran.

```text
ChatGPT DRAFT_FILE
  → commit + push chat-gpt-harvest (CapitalGlass-Cross-Agent)
  → GitHub Actions: chatgpt-harvest-move-to-l.yml (WESLEYDESK self-hosted)
  → L: deterministic catalog move (staging — not Hub publication)
  → (later) Data-Extraction suite advancement ingest — not operational for OBSERVED yet
  → Cursor pull + harvest:ingest-chatgpt-findings + validate + (operator) publish
```

| Stage | Actor | What happens |
| --- | --- | --- |
| **1. Git draft** | ChatGPT | Writes `chatgpt-findings-source.md`; push to `chat-gpt-harvest`; report commit SHA |
| **2. L: move** | GitHub Action | On push to paths `**/chatgpt-findings-source.md` or `**/system-advancement-findings-source.md`, runs `npm run harvest:move-chatgpt-harvest-to-l` |
| **3. L: destination** | Action (move-only) | `L:\02-catalog\chatgpt-draft-staging\chat-gpt-harvest\<harvest-id>\` — deterministic copy from branch; **no** assessment, mutation, or Intelligence Hub publish |
| **4. Cursor ingest** | Operator / Cursor on WSL | Pull branch; `harvest:ingest-chatgpt-findings`; duplication-preflight; validate; optional `publish-intelligence-full` |
| **5. Data-Extraction** | **Deferred** | Future: `advancement:ingest` / scoring / graph envelope from L: staging — see `Data-Extraction/docs/platform/SUITE_ADVANCEMENT_GRAPH_LANE.md` |

**Workflow file:** `.github/workflows/chatgpt-harvest-move-to-l.yml`  
**Move receipt:** `artifacts/agent-runs/chatgpt-harvest-l-move/latest.json` (artifact on Action run)

ChatGPT closeout checklist after push:

1. Report Git commit SHA and findings path.
2. State: `L: move: NOT_RUN_BY_CHATGPT` (GitHub Action runs on WESLEYDESK when runner healthy).
3. State: `Cursor ingest: NOT_RUN` — hand off ingest command only.
4. Do **not** claim `L: Hub catalog`, `PUBLICATION_PASS`, or Data-Extraction ingest.

If the Action fails (L: unmounted, runner offline), findings remain valid on `chat-gpt-harvest`; operator reruns workflow via `workflow_dispatch` after recovery.

---

## Tiered closeout classifier

Choose harvest depth **before** writing. This protocol is the **OBSERVED** lane only.

| Tier | When | Protocol | Output file |
| --- | --- | --- | --- |
| **T0** | Trivial chat; no durable lessons | None | — |
| **T1** | Few compact lessons | [chat-improvement-extract-chatgpt-v1.md](./chat-improvement-extract-chatgpt-v1.md) (optional) | Short improvement extract |
| **T2** | Default — corrections, multi-topic, operational friction | **This file** (OBSERVED) | `chatgpt-findings-source.md` |
| **T3** | High-value thread + new capabilities / architecture / products implied | **T2 +** [CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md](./chat-thread-system-advancement-harvest-chatgpt-v1.md) | Same `harvest-YYYY-MM-DD-<slug>-v1/` dir: `chatgpt-findings-source.md` **and** `system-advancement-findings-source.md` |

**Governing rule:** OBSERVED facts may support an advancement draft, but **never** mix synthesis into `chatgpt-findings-source.md`. T3 runs two protocols; both push to the same harvest id on `chat-gpt-harvest`.

---

## Purpose

Use **ChatGPT** to **compress a completed conversation into reusable intelligence** — draft `chatgpt-findings-source.md` when Cursor, L:, Git, and index commands are **not available**.

**Default use:** feed [chat-improvement-extract-chatgpt-v1.md](./chat-improvement-extract-chatgpt-v1.md) with a Cursor chat — extract token/architecture/speed/intelligence improvements; treat code claims as **cross-check candidates only** (not source of truth).

**Full autopsy lane:** this file — structured sections (scope, events, packets, waste, ROI, seeds) when the thread contains durable, traceable lessons. **Not** a quota to fill every packet type.

ChatGPT produces **draft seed material**. Cursor **verifies** code cross-checks and validates before Intelligence Hub publication.

**ChatGPT is never source of truth** for code, deploy status, or index state.

For **synthesized system improvements** (not observed replay), use sibling protocol [chat-thread-system-advancement-harvest-chatgpt-v1.md](./chat-thread-system-advancement-harvest-chatgpt-v1.md) — **ADVANCEMENT** intelligence lane.

---

## Compression mindset (read before writing any section)

**Mental model:** Compress the thread into reusable intelligence — not “harvest everything that happened.”

| Old impulse | Compression impulse |
| --- | --- |
| Fill every packet type | Keep only what future agents must remember |
| Maximize section count | Minimize rediscovery and repeated work |
| Summarize what happened | Extract what **changes future behavior** |

Before writing sections, answer internally:

1. What should **future agents remember** from this thread?
2. What should **never need to be rediscovered**?
3. What will **measurably reduce future work** (time, tokens, tool calls, rework)?

Use `futureSavings`, `optimalFutureWorkflow`, and seed packets **only when the thread supports them** — not to complete a template.

---

## Operating verdict

Start every ChatGPT compression pass with:

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

Prefer `CHAT_DIRECT` or `ATTACHMENT_SOURCE` for durable ROI and seeds. Do **not** promote `USER_REPORTED_OPERATIONAL` or `CROSS_CHECK_CANDIDATE` claims to durable ROI without labeling uncertainty.

---

## Extraction principles (reasoning constraints — not output quotas)

Apply these while producing every section:

```text
Extract, don't decorate.
Prefer fewer high-confidence findings over many weak findings.
Every finding must be directly traceable to the thread (cite turn, quote, or attachment).
Do not invent durability — if the thread did not establish a lesson, do not create one.
Do not invent ROI — rank only what the thread actually demonstrated or corrected.
Do not inflate importance — reserve ranks 1–3 for genuinely reusable intelligence.
A missing section is better than a fabricated section.
```

---

## Selectivity over coverage

The protocol lists section types as a **menu**, not a quota.

```text
If the thread contains only three durable lessons, produce three.
Do not attempt to fill every category.
Quality beats coverage.
An empty subsection with NONE_FOUND and a one-line proof is valid.
Do not manufacture HP/TW/ROI/seed entries because packet types exist in this protocol.
```

| Signal | Action |
| --- | --- |
| Thread is narrow, one fix | Few EVTs, maybe one ROI, maybe zero seeds |
| Thread is exploratory, no closure | `NO_HARVEST_NEEDED` or thin ROI with honest `futureSavings: none` |
| Thread repeats known work | `DUP-###` and stop — do not re-encode as new ROI |

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

## Future efficiency impact (thread-grounded — not template fill)

When a finding is **durable and reusable**, explain how applying it makes future Cursor work faster, cheaper, and less error-prone. **`futureSavings` must be justified from the observed thread** — cite what in the conversation showed repeat cost, rework, or wasted investigation. Do not produce optimistic estimates unrelated to the thread.

### When `futureSavings` applies

| Finding | Rule |
| --- | --- |
| `EVT-###` with a durable lesson | One-line `futureEfficiencyImpact` in the EVT row when the thread supports it |
| `HP-###` marked durable | Same — thread-grounded only |
| `roiBacklog` item (when ranked) | Full `futureSavings` object **only if** the thread showed repeat work or rework |
| ROI ranks **1–3** | Plus `optimalFutureWorkflow` when ranks exist and thread supports a cheaper path |
| Seed packet candidate | `improvementType`, `futureSavings`, `optimalFutureWorkflow` when a distinct seed is warranted |
| `ED-###` with a reusable lesson | Link to ROI or seed when applicable |

If the thread did **not** show repeat cost or rework, write **`futureSavings: none`** with a one-line reason. **`none` is preferred over fabrication.** Do not skip silently when you claimed a ranked ROI.

### Improvement type taxonomy (ROI + seeds — when present)

Classify each high-value ROI item and seed with exactly one `improvementType`:

| `improvementType` | Future value |
| --- | --- |
| `retrieval_technique` | Finds the correct files and prior intelligence sooner |
| `planning_technique` | Prevents premature coding and wrong architecture |
| `coding_pattern` | Reuses a proven implementation approach |
| `debugging_heuristic` | Reduces random troubleshooting |
| `validation_rule` | Avoids false completion claims |
| `operator_preference` | Prevents repeated clarification and correction |
| `tool_order_optimization` | Uses the cheapest or fastest evidence source first |
| `stop_condition` | Prevents over-investigation after sufficient proof |
| `prompt_compression` | Gives Cursor a smaller, precise instruction packet |
| `automation_concept` | Removes repetitive manual steps entirely |

### `futureSavings` object (ROI + seeds — copy this shape)

```json
{
  "futureSavings": {
    "tokenSavingsEstimate": "low | medium | high",
    "timeSavingsEstimate": "low | medium | high",
    "toolCallsAvoided": 3,
    "repeatedInvestigationAvoided": true,
    "implementationReworkAvoided": false,
    "appliesTo": [
      "cursor_planning",
      "repository_retrieval",
      "coding",
      "testing",
      "debugging",
      "deployment"
    ],
    "futureEfficiencyImpact": "One sentence tied to what this thread showed — what future agents skip or do cheaper."
  }
}
```

### `optimalFutureWorkflow` (ROI ranks 1–3 and seeds — when present)

Numbered steps for the **cheapest path implied by what this thread proved** — not generic best practices unrelated to the conversation. Not a replay of what happened in the thread.

```json
{
  "optimalFutureWorkflow": [
    "1. npm run agent:index:scout -- --json",
    "2. Read BY-KIND/active-work-blockers.json only if scout flags blockers",
    "3. Open owner-repo contract doc before repo-wide grep",
    "4. Prove with named gate command before deploy claim"
  ]
}
```

---

## Execution modes (declare in first response)

Before any artifact or long output, state the mode:

| Mode | Allowed | Forbidden |
| --- | --- | --- |
| `REVIEW_ONLY` | Read, analyze, answer questions | Files, Git push, implementation |
| `DRAFT_FILE` | Produce findings Markdown; **commit + push** to `chat-gpt-harvest` only; downloadable draft if push unavailable | Push to `main`; merge; `harvest:validate` / `HARVEST_COMPLETE` claims; arbitrary repo edits |
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
| **Commit + push findings to `chat-gpt-harvest`** | **Yes — mandatory for `DRAFT_FILE` closeout** | Pull + ingest |
| **Trigger L: move (GitHub Action)** | **No** — automatic on push | Monitor / `workflow_dispatch` rerun |
| `harvest:ingest-chatgpt-findings` | No | Yes |
| `harvest:duplication-preflight` | No | Yes |
| `harvest:validate` | No | Yes |
| `harvest:publish-intelligence-full` | No | Operator |
| Claim `FULLY_SEEDED` | **Never** | Only with receipts |
| Claim `INDEX_HIT` | **Never** | After scout preflight |

---

## Required output structure

Produce **one Markdown findings file**. Section counts **vary by thread** — the list below is a **menu**, not a quota. Use `NONE_FOUND` with one-line proof when a subsection has no durable content.

1. Final summary (verdict template)
2. Harvest verdict + tier rationale (`NO_HARVEST_NEEDED` is valid when appropriate)
3. Retrieval preflight (`INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT`)
4. Scope ledger
5. Correction ledger (`COR-###`) — omit or minimal if no corrections
6. Thread event inventory (`EVT-###`) — each with evidence classification
7. Harvest packets (`HP-###`, 8 kinds **as applicable** — not all required)
8. Execution deltas (`ED-###`, actual vs optimal)
9. Waste ledger (`TW-###` or `NONE_FOUND` with proof)
10. Duplication detector (`DUP-###` from visible context / pasted reports)
11. Operator friction (`OF-###` or `NONE_FOUND`)
12. ROI backlog (rank only what the thread supports; thread-grounded `improvementType`, `futureSavings`; ranks 1–3: `optimalFutureWorkflow` when warranted)
13. Do-not-advance guards
14. Seed packet candidates (only when ROI ranks 1–3 exist **and** the thread supports a distinct seed; JSON with enrichment fields when present)
15. Future-agent instructions
16. Publication truth table (all layers `not-run`)
17. Acceptance checklist
18. Next operator action (hand off to Cursor)
19. Git push instructions (branch `chat-gpt-harvest` — see end of protocol)

**Template reference:** `chat-thread-autopsy-findings-from-current-chat-v1.md` (example harvest from a real ChatGPT thread).

---

## Seed packet rules (ChatGPT draft)

Create a seed only when ROI ranks 1–3 exist **and** the thread supports a **distinct** reusable packet. Zero seeds is valid for thin threads.

Each seed in the findings file must include:

- `seedId` — unique, prefix `IH-THREAD-` recommended
- `kind` — `failure-pattern` | `protocol-upgrade` | `lesson` | etc.
- `improvementType` — one value from § Future efficiency impact taxonomy (when seed is warranted)
- `futureSavings` — full object or `none` with reason, justified from the thread
- `optimalFutureWorkflow` — when the thread supports a cheaper path
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

If the ChatGPT host cannot push to GitHub, produce the findings file in chat and give the operator **exact** repo, branch, path, and commit message so they can push to `chat-gpt-harvest` manually **before** Cursor ingest.

---

## Handoff to Cursor (after Git push)

**Push first.** Cursor ingest assumes findings already exist on branch `chat-gpt-harvest`.

1. **Git push complete** — findings at:
   `artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/chatgpt-findings-source.md`
2. Report commit SHA in chat.
3. Give Cursor:

```text
Pull branch chat-gpt-harvest on Capglass5708/CapitalGlass-Cross-Agent.

Ingest ChatGPT thread autopsy findings per chat-thread-closeout-autopsy-harvest-chatgpt-v1.

npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-YYYY-MM-DD-<slug>-v1

Then run duplication-preflight, validate, and (operator) publish-intelligence-full.
```

Paste-only handoff (no Git push) is a **fallback** when GitHub is unavailable — not the default `DRAFT_FILE` path.

**After Git push (before Cursor):** GitHub Action `chatgpt-harvest-move-to-l` copies the draft to `L:\02-catalog\chatgpt-draft-staging\chat-gpt-harvest\<harvest-id>\`. ChatGPT does not wait for or verify this step.

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

**Compression / extraction**

- Applied compression mindset — not template stuffing
- Every EVT/HP/ROI/seed is traceable to the thread (turn, quote, or attachment)
- Empty sections use `NONE_FOUND` with proof — no fabricated packets
- No invented durability or inflated ROI ranks

**Authority / verdict**

- No live retrieval claim (`INDEX_HIT*`, etc.)
- No `HARVEST_COMPLETE` / `OPERATIONAL` / `FULLY_SEEDED`

**Enrichment (when ROI/seeds exist)**

- ROI items include thread-grounded `futureSavings` (or explicit `none` with reason)
- ROI ranks 1–3 include `improvementType` and `optimalFutureWorkflow` when ranked
- Seeds include enrichment fields when seeds are present
- Seeds have ≥2 `retrievalQuestions` when present

**Structure**

- Every operational claim labeled `USER_REPORTED_OPERATIONAL` or `CROSS_CHECK_CANDIDATE`
- Closed and open lanes not conflated
- Corrections override earlier assumptions
- Publication table entirely `not-run`

---

## Publication truth (mandatory footer)

Every ChatGPT findings file must end with:

| Layer | State |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | `not-run` or commit SHA after ChatGPT push |
| L: draft staging (GitHub Action move) | `not-run` |
| Cursor ingest | `not-run` |
| Duplication preflight | `not-run` |
| `harvest:validate` | `not-run` |
| L: Hub catalog (operator publish) | `not-run` |
| Z: AI cache | `not-run` |
| Supabase projection | `not-run` |
| Data-Extraction advancement ingest | `not-run` (deferred) |
| Freshness gate | `not-run` |

```text
Publication: NOT_RUN_BY_CURSOR
projection.hubPublishStatus: not-run
Implementation: NOT_AUTHORIZED
```

---

## ChatGPT opener prompt (copy/paste)

```text
Run chat-thread-closeout-autopsy-harvest-chatgpt-v1.

Compress this thread into reusable intelligence — not a full replay of everything that happened.

Lane: CHAT_CONTEXT_ONLY. Treat visible conversation and attachments as the only available evidence.

Declare mode in your first sentence: REVIEW_ONLY or DRAFT_FILE.

Extraction principles: extract don't decorate; fewer high-confidence findings; every finding traceable to the thread; do not invent durability or ROI; missing section beats fabricated section.

Selectivity: quality beats coverage — if only three durable lessons exist, produce three. NONE_FOUND is valid. Do not fill every packet type.

Start with retrieval block (INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT).

Do NOT claim INDEX_HIT, INDEX_HIT_AI_CACHE, HARVEST_COMPLETE, OPERATIONAL, or FULLY_SEEDED.

Classify all evidence: CHAT_DIRECT | ATTACHMENT_SOURCE | USER_REPORTED_OPERATIONAL | CROSS_CHECK_CANDIDATE.

Before EVT inventory: Scope ledger + Correction ledger (COR-###) when applicable.

Produce one Markdown findings file (section menu — counts vary):
- thread event inventory (EVT-###) with evidence classes
- harvest packets (HP-###), execution deltas, waste ledger, DUP-###, operator friction — as applicable
- ROI backlog only for thread-supported items; futureSavings must be justified from the observed thread (none preferred over fabrication)
- seeds only when ROI top-3 and thread support a distinct packet
- do-not-advance guards, future-agent instructions, publication truth table (all not-run)

Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION or NO_HARVEST_NEEDED when appropriate.

Mandatory closeout: commit + push findings to branch chat-gpt-harvest on Capglass5708/CapitalGlass-Cross-Agent (see ChatGPT push instructions). Report commit SHA.

After push: L: move runs via GitHub Action (not ChatGPT). Do not claim L: or Cursor ingest complete.

Tier: default T2 OBSERVED. Use T3 only if operator also requests CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md for synthesis.

If I said concept-only or stop earlier in the thread, honor CONCEPT_ONLY_NO_WRITE / STOP_NOW (no Git push in those modes).

Run pre-push self-check (compression + traceability first). Push per "ChatGPT push instructions" below — do not skip push and only paste to Cursor.

End with: Cursor ingest command (harvest:ingest-chatgpt-findings) after push is complete.
```

---

## ChatGPT push instructions (mandatory closeout)

**This section is required for every `DRAFT_FILE` harvest.** Do not end the session with “hand findings to Cursor” without first pushing (or giving operator exact push steps).

When the findings Markdown file is complete, **commit and push** (or instruct the operator with these exact steps if GitHub is not connected in ChatGPT):

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
| `.github/workflows/chatgpt-harvest-move-to-l.yml` | Push → L: `02-catalog/chatgpt-draft-staging` (move only) |
| `scripts/harvest/move-chatgpt-harvest-to-l.mjs` | Deterministic L: move (Action + manual) |
| `Data-Extraction/docs/platform/SUITE_ADVANCEMENT_GRAPH_LANE.md` | Future scoring/graph ingest from L: staging |
| `artifacts/agent-runs/harvest-2026-08-04-chatgpt-autopsy-findings-v1/` | Example ingested harvest from pilot findings |

---

## Design principle

ChatGPT **compresses the conversation once** into traceable, reusable intelligence in `chatgpt-findings-source.md`. Cursor **makes it operational** so the estate never has to re-live the thread. Selectivity and thread-grounded enrichment beat template completeness.

**Canonical Git source:** `docs/protocols/chat-thread-closeout-autopsy-harvest-chatgpt-v1.md` — run `npm run harvest:sync-z-mirror` to refresh `harvest/protocol/` and `Z:\Capital-Glass-Dev\Harvest\protocol\` copies. Do not hand-edit mirrored copies.
