# ChatGPT Draft Batch Assessment — T2 Protocol v2

**Z operator path:** `Z:\Capital-Glass-Dev\Harvest\protocol\CHATGPT-DRAFT-BATCH-ASSESSMENT-T2-V1.md`  
**Intelligence kind:** **VALIDATED** synthesis from **OBSERVED / ADVANCEMENT drafts** (not raw ChatGPT truth)  
**Authority repo:** CapitalGlass-Cross-Agent (`Capglass5708/CapitalGlass-Cross-Agent`)  
**Branch for drafts:** `chat-gpt-harvest` (never `main`)  
**Shared Git contract:** [CHATGPT-HARVEST-GIT-PUBLICATION-CONTRACT-V1.md](./CHATGPT-HARVEST-GIT-PUBLICATION-CONTRACT-V1.md)

**Parent protocols:**

- ChatGPT intake: [CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md](./CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md) (OBSERVED v2)
- ChatGPT intake: [CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md](./CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md) (ADVANCEMENT v2)
- Publication: [../runbooks/harvest-record-validate-sync.md](../runbooks/harvest-record-validate-sync.md) (via `harvest/protocol/HARVEST-INGESTION-RUNBOOK-v1.md` mirror)

---

## Purpose

ChatGPT harvest sessions produce **draft markdown** (`chatgpt-findings-source.md` or `system-advancement-findings-source.md`) pushed to `chat-gpt-harvest`. Those files are **idea intake**, not Intelligence Hub authority.

**Default operator model:** accumulate drafts on the branch; run a **T2 batch assessor** (Cursor or operator agent) on a schedule or when the queue is large enough — **not** full `harvest:validate` + `harvest:publish-intelligence-full` after every ChatGPT run.

| Role | Source of truth? |
| --- | --- |
| ChatGPT draft markdown | **No** — provenance + structured ideas only |
| Batch assessor cross-check (repos, index, receipts) | **Yes** — for promoted claims |
| `harvest-manifest-v1.json` after batch PASS | **Yes** — machine harvest authority |
| Intelligence Hub after `harvest:publish-intelligence-full` | **Yes** — operational index slices |

---

## Two lanes (do not merge in one batch without tagging)

| Lane | Draft file | ChatGPT protocol |
| --- | --- | --- |
| OBSERVED | `chatgpt-findings-source.md` | Autopsy ChatGPT v2 |
| ADVANCEMENT | `system-advancement-findings-source.md` | System advancement ChatGPT v2 |

See `artifacts/agent-runs/harvest-2026-08-04-chat-gpt-harvest-protocol-v1/BRANCH_LANE_MAP.md` for harvest-id separation on the same branch.

---

## Per ChatGPT run (minimal closeout)

1. ChatGPT: `DRAFT_FILE` → commit + push to `chat-gpt-harvest` only.
2. Pass `CHATGPT_HARVEST_GIT_GATE`; claim `CHATGPT_SOURCE_PUBLISHED` only after remote SHA verification (`BLOCKED_GIT_PUBLICATION` on gate FAIL).
3. Report `harvestId`, file path, commit SHA, and `gitPublicationReceipt`.
4. **Stop.** No requirement to run Cursor validate/publish per draft.

Optional (operator):

```bash
npm run harvest:collect-chatgpt-drafts -- --refresh-index
```

---

## Batch assessor workflow (T2)

**Work package pattern:** `chatgpt-draft-batch-assessment-t2-v1`  
**Output harvest id pattern:** `harvest-YYYY-MM-DD-chatgpt-draft-batch-<theme>-v1`

### Step 0 — Inventory

```bash
git checkout chat-gpt-harvest
git pull --ff-only origin chat-gpt-harvest
npm run harvest:collect-chatgpt-drafts -- --json
```

Read `work-progress/chatgpt-draft-index.json`. Select drafts for this batch (by date, theme, or lane).

### Step 1 — Read drafts only as candidates

Extract: ROI items, waste patterns, correction ledger, seed ideas, do-not-advance maps, `USER_REPORTED_OPERATIONAL` / `CROSS_CHECK_CANDIDATE` claims.

**Forbidden:** treat draft operational claims as true without cross-check.

### Step 2 — Cross-check (mandatory before promotion)

| Check | Command / source |
| --- | --- |
| Duplication | `npm run harvest:duplication-preflight -- --harvest-id=<batch-harvest-id>` |
| Registry / prior harvests | `work-progress/harvest-packet-registry.json` |
| Hub / index | L: `00-master-index/BY-KIND/*.json` or hot-cache routing index |
| Code / receipts | Owner repos per `owner-repo-boundary-index.json` |
| Lane map | `BRANCH_LANE_MAP.md` on `chat-gpt-harvest` |

Downgrade or drop claims that fail cross-check. Record evidence refs on survivors.

### Step 3 — Synthesize one T2 batch harvest

Produce **one** (or few theme-scoped) canonical runs under `artifacts/agent-runs/<batch-harvest-id>/`:

- `harvest-manifest-v1.json` — `intelligenceKind: "validated-batch"`, `overallHarvestVerdict: "HARVEST_COMPLETE"` only after validate PASS
- `thread-autopsy-bundle.json` — tier **T2**, merged waste/ROI/do-not-advance (deduped)
- `seed-packets/` — only seeds that survived cross-check; `status: CANDIDATE` or `APPROVED` per promotion policy
- `batch-assessment-receipt.json` — list of source draft paths + commit SHAs + disposition per draft claim
- `chatgpt-findings-source.md` — **not required** in batch harvest; link provenance in receipt

Draft source files remain in their original `artifacts/agent-runs/<draft-harvest-id>/` directories as read-only provenance.

### Step 4 — Validate once (batch output)

```bash
npm run harvest:duplication-preflight -- --harvest-id=<batch-harvest-id>
node scripts/harvest/sync-derived.mjs <batch-harvest-id>
node scripts/harvest/render-harvest-index.mjs <batch-harvest-id>
node scripts/harvest/sync-derived.mjs <batch-harvest-id>
npm run harvest:validate -- <batch-harvest-id>
npm run harvest:validate-autopsy -- --harvest-id=<batch-harvest-id>
npm run test:harvest
```

### Step 5 — Publish once (operator)

```bash
npm run harvest:publish-intelligence-full -- --harvest-id=<batch-harvest-id>
```

Update `chatgpt-draft-index.json` entries: `batchDisposition: "merged" | "partial" | "deferred" | "rejected"`.

---

## Cursor opener (batch assessor)

```text
Run chatgpt-draft-batch-assessment-t2-v1 per Z:\Capital-Glass-Dev\Harvest\protocol\CHATGPT-DRAFT-BATCH-ASSESSMENT-T2-V1.md

Branch: chat-gpt-harvest
Mission: T2 batch assessor — read draft queue, cross-check, synthesize validated harvest, validate once, do not publish unless operator approves.

Start: npm run harvest:collect-chatgpt-drafts -- --json
Lanes: process OBSERVED and ADVANCEMENT separately unless operator approves combined theme batch.
ChatGPT drafts are never source of truth.
Target batch harvest id: harvest-YYYY-MM-DD-chatgpt-draft-batch-<theme>-v1
```

---

## What per-run Cursor ingest is for (optional)

`npm run harvest:ingest-chatgpt-findings` only copies markdown into the run dir. Use when ChatGPT pushed to a wrong path. **Not** a substitute for batch assessment.

Per-run `generate-*-harvest.mjs` + `harvest:validate` remains valid for urgent single-thread closeout, but **not** the default ChatGPT operator path.

---

## Verdicts

| Verdict | Meaning |
| --- | --- |
| `DRAFT_READY_FOR_CURSOR_VALIDATION` | ChatGPT draft pushed; queued for batch |
| `BATCH_ASSESSMENT_IN_PROGRESS` | Assessor running; drafts locked for this batch id |
| `HARVEST_COMPLETE` | Batch manifest validated; ready for operator publish |
| `OPERATIONAL` | Only after `harvest:publish-intelligence-full` PASS |

---

## Related commands

| Command | Purpose |
| --- | --- |
| `npm run harvest:collect-chatgpt-drafts` | Inventory draft queue + refresh `work-progress/chatgpt-draft-index.json` |
| `npm run harvest:ingest-chatgpt-findings` | Optional copy if draft path wrong |
| `npm run harvest:duplication-preflight` | Required before batch validate |
| `npm run harvest:publish-intelligence-full` | Operator hub publish after batch PASS |
