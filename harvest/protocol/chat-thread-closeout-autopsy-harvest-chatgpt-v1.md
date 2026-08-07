# Chat Thread Closeout Autopsy — ChatGPT Protocol v2.1

**Work package pattern:** `chat-thread-closeout-autopsy-harvest-chatgpt-v1`  
**Parent protocol (Cursor / operator):** [chat-thread-closeout-autopsy-harvest-v1.md](./chat-thread-closeout-autopsy-harvest-v1.md)  
**Preferred input (Cursor → ChatGPT):** [chat-improvement-extract-chatgpt-v1.md](./chat-improvement-extract-chatgpt-v1.md) — improvements + cross-check only  
**Authority repo:** `CapitalGlass-Cross-Agent`  
**Lane:** `CHAT_CONTEXT_ONLY` — visible conversation + attachments only  
**Restoration:** v2 promotes the proven `chat-gpt-harvest` Git lane to `main` with deterministic gates (supersedes draft-only v1 on `main`).  
**v2.1 upgrade:** Gold Mine compounding — harvest generates classified evidence, not chat narrative alone.

**Shared Git contract:** [CHATGPT-HARVEST-GIT-PUBLICATION-CONTRACT-V1.md](./CHATGPT-HARVEST-GIT-PUBLICATION-CONTRACT-V1.md) — `CHATGPT_HARVEST_GIT_GATE`, verdict stages, `chat-gpt-harvest` branch rules.

**Governing compounding context (read-only):** `L:\02-catalog\Harvest\GOLD-MINE-NORTH-STAR-CHARTER.md`  
Harvest is **one evidence source** into Gold Mine compounding. Gold Mine does **not** own harvest authority; Data-Extraction owns discovery and candidate lifecycle.

---

## Operational authority invariant

**No protocol is operational because it exists on `chat-gpt-harvest`.**

Only these surfaces define ChatGPT harvest behavior for operators and agents:

| Surface | Role |
| --- | --- |
| `CapitalGlass-Cross-Agent` **`main`** → `harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md` | Git authority |
| `Z:\Capital-Glass-Dev\Harvest\protocol\` (via `npm run harvest:sync-z-mirror`) | Z canonical publication |
| `L:\02-catalog\Harvest\protocol\` | L retrieval mirror (must match Z after sync) |

Branch-only protocol text, chat transcripts, and unmerged commits are **non-authoritative** for closeout behavior.

---

## Purpose

Use **ChatGPT** to compress a completed conversation into a **designated harvest evidence artifact** when Cursor, L:, and index commands are not in scope.

**Default use:** feed [chat-improvement-extract-chatgpt-v1.md](./chat-improvement-extract-chatgpt-v1.md) with a Cursor chat — improvements + cross-check only.

**Full autopsy lane (this file):** structured OBSERVED intelligence — events, packets, waste, ROI, seeds when the thread contains durable lessons.

ChatGPT produces **draft source material** and **publishes it to Git staging** (`chat-gpt-harvest`). Cursor **ingests, validates, canonicalizes, and publishes** to `main`, Z, L, index, and cache.

**v2.1 compounding rule:** A harvest must not merely describe what happened. Each durable finding should be expressible as evidence Gold Mine can later classify (`PROBLEM_SIGNAL`, `RESOLUTION_SIGNAL`, adoption proof, operational performance, operator friction, or product/functionality opportunity).

**ChatGPT is never source of truth** for code, deploy status, index state, or `HARVEST_COMPLETE`.

For **ADVANCEMENT synthesis** (not observed replay), use [chat-thread-system-advancement-harvest-chatgpt-v1.md](./chat-thread-system-advancement-harvest-chatgpt-v1.md) — same Git staging branch and gate rules apply.

---

## End-to-end pipeline

```text
Chat thread
  → ChatGPT harvest / autopsy (this protocol)
  → DRAFT_FILE (designated artifact only)
  → local artifact:
      artifacts/agent-runs/<harvest-id>/chatgpt-findings-source.md
  → MANDATORY Git publication (CHATGPT_HARVEST_GIT_GATE)
  → CapitalGlass-Cross-Agent
      branch: chat-gpt-harvest
      commit SHA + remote verification
  → (estate automation, when workflow on main) L: draft staging move
  → Cursor ingest / validation
  → canonical harvest records
  → Git main
  → Z canonical publication (harvest:sync-z-mirror)
  → L retrieval mirror
  → index + AI cache
```

---

## Authority boundary

| Owner | Responsibility |
| --- | --- |
| **ChatGPT** | Thread → compression → `chatgpt-findings-source.md` → Git staging on `chat-gpt-harvest` |
| **Cursor** | Ingest → validation → classification → canonical JSON → `main` promotion |
| **Operator + estate automation** | `harvest:publish-intelligence-full`, Z/L publication, index, cache, freshness gate |

ChatGPT does **not** merge to `main`, run validators, publish to the Intelligence Hub, or claim harvest completion.

---

## Verdict truth (three stages — do not mix)

| Stage | ChatGPT may claim | Meaning |
| --- | --- | --- |
| Draft created only | `DRAFT_READY` | Findings Markdown complete in chat or local file; Git gate **not** passed |
| Draft committed + remote push verified | `CHATGPT_SOURCE_PUBLISHED` | `CHATGPT_HARVEST_GIT_GATE` PASS; SHA receipt recorded |
| Cursor validation / index / publication complete | `HARVEST_COMPLETE` | **Forbidden in ChatGPT** — Cursor after `harvest:validate` PASS |

| Other verdicts | Meaning |
| --- | --- |
| `DRAFT_IMPROVEMENTS_FOR_CURSOR_VALIDATION` | Improvement-extract lane ([chat-improvement-extract-chatgpt-v1.md](./chat-improvement-extract-chatgpt-v1.md)) |
| `HARVEST_PARTIAL` | Missing packets, seeds, evidence, or failed Git gate |
| `BLOCKED_GIT_PUBLICATION` | Git gate FAIL — do not hand off as published evidence |
| `NO_HARVEST_NEEDED` | No durable value in thread |
| `OPERATIONAL` | **Forbidden in ChatGPT** — only after `harvest:publish-intelligence-full` |

Legacy alias: `DRAFT_READY_FOR_CURSOR_VALIDATION` = `DRAFT_READY` (pre-v2 name; do not use after Git gate PASS).

Start every session:

```text
Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Protocol: v2
Start verdict: UNHARVESTED_THREAD
Target tier: T2 (default)
Closeout target: CHATGPT_SOURCE_PUBLISHED (not HARVEST_COMPLETE)
```

### Retrieval code (ChatGPT)

Before Git gate:

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

After Git gate PASS:

```text
sourceCommitSha: <40-char commit on chat-gpt-harvest>
sourceBranch: chat-gpt-harvest
sourceRepo: Capglass5708/CapitalGlass-Cross-Agent
```

Do **not** claim `INDEX_HIT`, `INDEX_HIT_AI_CACHE`, `FAILOVER_SUPABASE`, or hub publication unless you executed the command in this session (you did not).

---

## CHATGPT_HARVEST_GIT_GATE (hard closeout gate)

Git publication is **mandatory** for `DRAFT_FILE` closeout unless `REVIEW_ONLY`, `CONCEPT_ONLY_NO_WRITE`, `STOP_NOW`, or GitHub is unavailable (operator manual push before Cursor ingest).

### Required (all must pass)

| Check | Requirement |
| --- | --- |
| Artifact exists | `chatgpt-findings-source.md` present |
| Path matches harvest-id | `artifacts/agent-runs/<harvest-id>/chatgpt-findings-source.md` |
| Repo | `Capglass5708/CapitalGlass-Cross-Agent` |
| Branch | `chat-gpt-harvest` (never `main`) |
| Commit created | Local commit contains the artifact |
| Push succeeded | `git push origin chat-gpt-harvest` exit 0 |
| Remote verification | Remote branch HEAD SHA == local commit SHA |

### Failure

```text
verdict: BLOCKED_GIT_PUBLICATION
```

- Do **not** claim `CHATGPT_SOURCE_PUBLISHED`
- Do **not** claim `HARVEST_COMPLETE`
- Do **not** hand off to Cursor as published evidence
- Report gate failure reason and exact repo / branch / path for operator recovery

### SHA receipt (mandatory in chat after PASS)

```json
{
  "gitPublicationReceipt": {
    "gate": "CHATGPT_HARVEST_GIT_GATE",
    "verdict": "PASS",
    "repo": "Capglass5708/CapitalGlass-Cross-Agent",
    "branch": "chat-gpt-harvest",
    "harvestId": "harvest-YYYY-MM-DD-<slug>-v1",
    "artifactPath": "artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/chatgpt-findings-source.md",
    "localCommitSha": "<40-char>",
    "remoteCommitSha": "<40-char>",
    "remoteVerified": true
  }
}
```

---

## Execution modes (declare in first response)

| Mode | Allowed | Forbidden |
| --- | --- | --- |
| `REVIEW_ONLY` | Read, analyze, answer questions | Artifacts, Git push, validation claims |
| `DRAFT_FILE` | Write **only** `chatgpt-findings-source.md` on `chat-gpt-harvest`; commit + push that artifact | Edits to canonical implementation, schemas, validators, `main`, merge, validation claims |
| `EDIT_EXISTING` | User explicitly named a file outside harvest artifact path | Unnamed scope creep |
| `IMPLEMENT_REPO` | **Not available in ChatGPT** | — use Cursor |
| `PUBLISH_OPERATOR` | **Not available in ChatGPT** | — operator + Cursor |

### DRAFT_FILE write boundary (v2)

`DRAFT_FILE` **does not** mean “repo writes forbidden.”

It means:

- **Authorized:** one designated evidence file per harvest id on branch `chat-gpt-harvest`
- **Forbidden:** changing canonical source material (`main`, protocol schemas, scripts, manifests, hub indexes)

---

## Hard guards (non-negotiable)

**`CONCEPT_ONLY_NO_WRITE`** — no artifact, no Git push, review/planning only.

**`STOP_NOW`** — halt; resume only on explicit new instruction.

**`SOURCE_AUTHORITY`** — follow the attached protocol file, not memory or earlier drafts.

---

## What ChatGPT can and cannot do

| Action | ChatGPT | Cursor |
| --- | --- | --- |
| Thread event inventory | Yes (visible chat) | Yes + repo evidence |
| Harvest packets (draft) | Yes | Canonical JSON |
| `chatgpt-findings-source.md` | Yes — **mandatory** | Ingest via `harvest:ingest-chatgpt-findings` |
| Commit + push to `chat-gpt-harvest` | **Yes — mandatory closeout** | Pull + ingest |
| `CHATGPT_HARVEST_GIT_GATE` | Yes (report receipt) | May verify SHA |
| L: draft staging (GitHub Action) | **No** — estate automation on push | Monitor / `workflow_dispatch` |
| `harvest:ingest-chatgpt-findings` | No | Yes |
| `harvest:duplication-preflight` | No | Yes |
| `harvest:validate` | No | Yes |
| `harvest:publish-intelligence-full` | No | Operator |
| Claim `CHATGPT_SOURCE_PUBLISHED` | After Git gate PASS | May verify |
| Claim `HARVEST_COMPLETE` | **Never** | After `harvest:validate` PASS |
| Claim `FULLY_SEEDED` / `INDEX_HIT` | **Never** | After scout preflight |
| Lane C protocol-upgrade candidates (draft) | Yes — label `protocol-upgrade` | Yes (canonical) |
| Run `harvest:export:protocol-self-learning` | **No** | Yes (after validate PASS) |
| Publish to `L:\02-catalog\Harvest\Harvest Protocol Self Learning` | **Never** | Data-Extraction only |

---

## Mandatory Git publication

| Field | Value |
| --- | --- |
| **GitHub repo** | `Capglass5708/CapitalGlass-Cross-Agent` |
| **Branch** | `chat-gpt-harvest` (hyphenated — not `main`, not spaces) |
| **Findings file** | `artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/chatgpt-findings-source.md` |
| **Commit message** | `harvest(chatgpt): draft findings harvest-YYYY-MM-DD-<slug>-v1` |
| **Push target** | `git push origin chat-gpt-harvest` |

**Closeout order (mandatory)**

1. Produce complete findings Markdown.
2. Commit and push to `chat-gpt-harvest` (steps below).
3. Run `CHATGPT_HARVEST_GIT_GATE`; report SHA receipt.
4. Claim `CHATGPT_SOURCE_PUBLISHED` only if gate PASS.
5. Hand off Cursor ingest command (validation is Cursor-owned).

If GitHub is **not** connected: produce the file, print exact repo, branch, path, and commit message; operator must push manually **before** Cursor ingest. Verdict stays `DRAFT_READY` until push verified.

---

## ChatGPT push instructions

```text
Repo: Capglass5708/CapitalGlass-Cross-Agent
Branch: chat-gpt-harvest
File: artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/chatgpt-findings-source.md
```

1. Checkout `chat-gpt-harvest` (base: `main`).
2. Create `artifacts/agent-runs/harvest-YYYY-MM-DD-<slug>-v1/` if needed.
3. Write `chatgpt-findings-source.md`.
4. Commit: `harvest(chatgpt): draft findings harvest-YYYY-MM-DD-<slug>-v1`
5. Push: `git push origin chat-gpt-harvest` — **not** `main`.
6. Verify remote SHA matches local (`git ls-remote` or host UI).
7. Emit `gitPublicationReceipt` JSON and gate verdict.

Paste-only handoff without push is **fallback** when GitHub is unavailable — not the default `DRAFT_FILE` path.

---

## Estate automation after push (Cursor-owned verification)

ChatGPT **only** pushes to `chat-gpt-harvest`. ChatGPT must **not** claim these steps ran.

```text
push chat-gpt-harvest
  → (when on main) GitHub Actions: chatgpt-harvest-move-to-l.yml
  → L:\02-catalog\chatgpt-draft-staging\chat-gpt-harvest\<harvest-id>\
  → Cursor pull + harvest:ingest-chatgpt-findings + validate + publish
```

| Stage | Actor | Notes |
| --- | --- | --- |
| Git draft | ChatGPT | Artifact + SHA receipt |
| L: move | GitHub Action on `main` | Move-only staging; not Hub publication |
| Cursor ingest | WSL / Cursor | Canonical harvest JSON |
| `main` + Z + L | Cursor / operator | After validation |

If the Action is not on `main` or the runner is offline, findings remain valid on `chat-gpt-harvest`; operator reruns via `workflow_dispatch` after recovery.

---

## Gold Mine compounding fields (v2.1 — apply to findings)

### A. `goldMineSignalClass` (recommended on every HP/ROI/friction/delta/seed)

```yaml
goldMineSignalClass:
  PROBLEM_SIGNAL | RESOLUTION_SIGNAL | ADOPTION_SIGNAL | PERFORMANCE_SIGNAL
  | OPERATOR_FRICTION_SIGNAL | AGENT_FRICTION_SIGNAL | OBSERVABILITY_GAP
  | BUSINESS_WORKFLOW_SIGNAL | SUCCESS_PATTERN
```

Distinguish **problem** from **resolution/adoption** at the source. Do not let Data-Extraction infer this from prose alone.

### B. `implementationState` + `resolutionTarget` (when thread addressed work)

```yaml
implementationState:
  OBSERVED_OPEN | IMPLEMENTED_IN_THREAD | VERIFIED_FIXED | ADOPTED
  | PARTIAL | BLOCKED | UNKNOWN
resolvesCandidateDigest: <digest when known>
resolvesRootCauseId: <stable id when known>
```

### C. Stable identity (hard rule)

**Ordinals are labels only.** Never treat `GOLD-0007`, `HP-003`, etc. as durable identity. When referencing Gold Mine intelligence, preserve `candidateDigest`, digest-derived `candidateId`, `workPackageId`, or content hashes. Display ordinals are presentation only.

### D. `novelty` discriminator (per improvement finding)

```yaml
novelty: NEW | KNOWN_EXISTING | RECURRENCE | REGRESSION | RESOLUTION_EVIDENCE | UNKNOWN_PENDING_DEDUP
```

### E. Observed improvement outcomes (required section when work completed)

For completed work, record **before / after / proof / residual / proven vs implemented**:

```yaml
outcomeId: OUT-###
beforeState:
afterState:
measurableChange:
proof:
remainingResidual:
improvementProven: true|false  # implemented ≠ proven
```

### F. Expanded ROI item fields (beyond rank)

Each ROI item should capture where evidence exists (no invented estimates):

`operatorValue`, `businessValue`, `platformValue`, `agentValue`, `reliabilityValue`, `automationLeverage`, `estimatedComplexity`, `blastRadius`, `confidence`, `evidenceDiversity`, `rootCauseLeverage`, `goldMineSignalClass`, `novelty`, `businessImpact` (see parent protocol enum).

### G. Product-workflow signal capture (required coverage block)

State whether the thread touched (OBSERVED / NOT_OBSERVED / UNKNOWN):

Computer Estimator, Human Estimator, Document Center, plan-set processing, OCR/parser, Revu/Bluebeam, Bid Composer, proposals, VAE, Scraper, cross-app handoffs, operator re-entry, manual intervention — including non-bug friction.

### H. Observability gaps (`OG-###`)

```yaml
observabilityGapId: OG-###
whatWeNeededToKnow:
whyItWasNotObservable:
workflow:
missingMetricOrReceipt:
recommendedInstrumentation:
goldMineSignalClass: OBSERVABILITY_GAP
```

### I. Success patterns (`SUCCESS_PATTERN`)

Record evidence-backed wins: fast retrieval, authority routing worked, cache eliminated work, automated handoff succeeded, contract prevented a mistake. Gold Mine needs positive patterns, not only failure avoidance.

### J. Corpus bias note (mandatory one-liner)

```text
corpusBiasNote: <e.g. "Thread evidence is SDLC/governance-heavy; product workflows under-observed">
underObservedDomains: [Computer Estimator, Revu, ...]
```

If zero open Gold Mine candidates but product surfaces were NOT_OBSERVED, state that explicitly — **do not imply estate-wide optimization**.

---

## Required output structure

Produce **one** `chatgpt-findings-source.md` with:

1. Final summary + verdict (`DRAFT_READY` → `CHATGPT_SOURCE_PUBLISHED` after gate)
2. Harvest tier rationale
3. Retrieval preflight
4. Thread event inventory (`EVT-###`)
5. Harvest packets (`HP-###`, kinds as applicable) — include `goldMineSignalClass`, `implementationState`, `novelty` when applicable
6. Execution deltas (`ED-###`)
7. **Observed improvement outcomes (`OUT-###`)** when work completed
8. Waste ledger (`TW-###` or `NONE_FOUND`)
9. Duplication detector (`DUP-###`) — digest-aware, not ordinal-only
10. Operator friction (`OF-###`)
11. Observability gaps (`OG-###`) or `NONE_FOUND`
12. Success patterns (`SUCCESS_PATTERN` entries) or `NONE_FOUND`
13. ROI backlog (ranked, expanded fields per §F)
14. **Product-workflow coverage** (OBSERVED / NOT_OBSERVED matrix)
15. **Corpus bias note** + `underObservedDomains[]`
16. Do-not-advance guards
17. Seed packet candidates (JSON blocks)
18. Future-agent instructions
19. Publication truth table
20. `gitPublicationReceipt` (after push)
21. Cursor handoff command

**Template reference:** `artifacts/agent-runs/harvest-2026-08-04-chatgpt-autopsy-findings-v1/`

---

## Seed packet rules (ChatGPT draft)

Each seed must include:

- `seedId` — prefix `IH-THREAD-` recommended
- `kind` — `failure-pattern` | `protocol-upgrade` | `lesson` | etc.
- ≥2 `retrievalQuestions`
- ≥1 `evidenceRefs`
- `futureAgentInstructions`
- `status: "CANDIDATE"` only

### Lane C — harvest protocol self-learning (draft only)

Label `kind: protocol-upgrade` for harvest-protocol weaknesses. ChatGPT does **not** run export or Data-Extraction Lane C publish. Cursor verifies and runs export after validate PASS.

---

## Handoff to Cursor (after `CHATGPT_SOURCE_PUBLISHED`)

```text
Ingest ChatGPT thread autopsy findings per chat-thread-closeout-autopsy-harvest-chatgpt-v1 v2.

git fetch origin chat-gpt-harvest && git checkout chat-gpt-harvest && git pull --ff-only origin chat-gpt-harvest

npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/<harvest-id>/chatgpt-findings-source.md \
  --harvest-id=<harvest-id>

Then: duplication-preflight, sync-derived, validate, validate-autopsy, test:harvest.
Operator: harvest:publish-intelligence-full.
```

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

1. Treat pasted harvest/index reports as stale until Cursor verifies
2. Record `DUP-###` when the thread re-debated the same milestone — use **digest/hash identity**, not ordinal labels
3. Do not invent seed IDs duplicating pasted registry excerpts
4. Label `NEEDS_REGISTRY_LOOKUP_FIRST` on repeated_work packets
5. **No suppression:** low-value or deferred observations remain valid Gold Mine evidence; deduplicate true duplicates only — do not discard distinct improvement signals because they seem unimportant

---

## Publication truth (mandatory footer)

| Layer | State (ChatGPT closeout) |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | `not-run` or commit SHA after gate PASS |
| `CHATGPT_HARVEST_GIT_GATE` | `PASS` / `FAIL` / `not-run` |
| L: draft staging (Action move) | `not-run` |
| Cursor ingest | `not-run` |
| `harvest:validate` | `not-run` |
| L: Hub catalog (operator publish) | `not-run` |
| Z: AI cache | `not-run` |
| Supabase projection | `not-run` |
| Lane C export / Data-Extraction | `not-run` |
| Freshness gate | `not-run` |
| Automatic protocol mutation | `false` |

```text
Publication: NOT_RUN_BY_CURSOR
projection.hubPublishStatus: not-run
```

---

## ChatGPT opener prompt (copy/paste)

```text
Run chat-thread-closeout-autopsy-harvest-chatgpt-v1 v2.1.

Lane: CHAT_CONTEXT_ONLY. Protocol v2.1 — Gold Mine compounding evidence + mandatory chat-gpt-harvest Git publication.

Declare mode in your first sentence: REVIEW_ONLY or DRAFT_FILE.

DRAFT_FILE authorizes only:
artifacts/agent-runs/<harvest-id>/chatgpt-findings-source.md on branch chat-gpt-harvest.

Closeout requires CHATGPT_HARVEST_GIT_GATE PASS before CHATGPT_SOURCE_PUBLISHED.

Do NOT claim INDEX_HIT, HARVEST_COMPLETE, OPERATIONAL, or FULLY_SEEDED.

Produce chatgpt-findings-source.md with EVT/HP/OUT/OG sections, goldMineSignalClass, implementationState, novelty, product-workflow coverage, corpus bias note, expanded ROI, SUCCESS_PATTERN, seeds, publication truth table.

After push: emit gitPublicationReceipt; verdict CHATGPT_SOURCE_PUBLISHED.

Hand off Cursor: harvest:ingest-chatgpt-findings (after pull chat-gpt-harvest).

Honor CONCEPT_ONLY_NO_WRITE / STOP_NOW if applicable earlier in thread.
```

---

## Related files

| File | Role |
| --- | --- |
| [chat-improvement-extract-chatgpt-v1.md](./chat-improvement-extract-chatgpt-v1.md) | Default improvement-extract lane |
| [chat-thread-closeout-autopsy-harvest-v1.md](./chat-thread-closeout-autopsy-harvest-v1.md) | Cursor + operator canonical protocol |
| [chat-thread-system-advancement-harvest-chatgpt-v1.md](./chat-thread-system-advancement-harvest-chatgpt-v1.md) | ADVANCEMENT synthesis (same Git gate) |
| [thread-autopsy-hub-accommodation-v1.md](./thread-autopsy-hub-accommodation-v1.md) | L: hub paths |
| `scripts/harvest/ingest-chatgpt-findings.mjs` | Copy findings MD into harvest run dir |
| `.github/workflows/chatgpt-harvest-move-to-l.yml` | Push → L staging (must be on `main` to run) |
| `artifacts/agent-runs/harvest-2026-08-04-chatgpt-autopsy-findings-v1/` | Example ingested harvest |

---

## Design principle

ChatGPT **compresses the conversation once** into a traceable Git-staged artifact. Cursor **makes it operational** on `main`, Z, and L so the estate never re-lives the thread.
