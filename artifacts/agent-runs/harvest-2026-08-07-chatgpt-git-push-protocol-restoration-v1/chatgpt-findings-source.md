# ChatGPT Thread Autopsy Findings

## 1. Final summary + verdict

**Harvest ID:** `harvest-2026-08-07-chatgpt-git-push-protocol-restoration-v1`  
**Mission:** `chat-thread-closeout-autopsy-harvest-chatgpt-v1`  
**Protocol:** v2  
**Lane:** `CHAT_CONTEXT_ONLY`  
**Mode:** `DRAFT_FILE`  
**Closeout target:** `CHATGPT_SOURCE_PUBLISHED`  
**Artifact:** `artifacts/agent-runs/harvest-2026-08-07-chatgpt-git-push-protocol-restoration-v1/chatgpt-findings-source.md`

This thread diagnosed why ChatGPT autopsy harvests stopped pushing to Git, established that the prior push-heavy protocol lived only on unmerged side-branch history, and confirmed the restoration design: the canonical v2 autopsy protocol must authorize one designated harvest artifact on `chat-gpt-harvest`, require Git publication and remote verification, and reserve canonical ingest/validation/publication for Cursor/operator lanes.

**Draft verdict at file creation:** `DRAFT_READY`  
**Final ChatGPT verdict is emitted in chat only after the remote Git gate is independently verified.**

## 2. Harvest tier rationale

**Target tier:** T2

Rationale: this thread contains durable cross-session operational learning about authority drift, branch promotion, ChatGPT Git-write boundaries, and closeout gating. It is more than a one-off fix but does not itself prove canonical main/Z/L/index publication.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN_AT_ARTIFACT_CREATION
sourceBranch: chat-gpt-harvest
sourceRepo: Capglass5708/CapitalGlass-Cross-Agent
```

No `INDEX_HIT`, AI-cache hit, hub publication, validation, or freshness claim is made in this ChatGPT lane.

## 4. Thread event inventory

### EVT-001 — Canonical autopsy protocol had regressed to draft-only
The operator supplied a diagnosis that the L: copy of `CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md` no longer instructed ChatGPT to push. The identified reason was that mandatory `chat-gpt-harvest` publication work was developed on side branches and never merged to `main`, while Z/L mirrors synced from the simpler `main` protocol.

### EVT-002 — Split estate identified
The thread identified inconsistent surfaces: the autopsy protocol lacked Git push authority while the advancement protocol and older assessment material still referenced `chat-gpt-harvest`. The branch itself remained active. This created behavior that depended on which protocol copy was supplied.

### EVT-003 — Restoration architecture accepted
The restoration design established this boundary:

```text
ChatGPT:
thread -> compression -> designated findings artifact -> chat-gpt-harvest -> SHA proof

Cursor/operator:
ingest -> validate -> canonicalize -> main -> Z/L -> index/cache
```

### EVT-004 — Three-stage truth model established
The thread separated:
- `DRAFT_READY`
- `CHATGPT_SOURCE_PUBLISHED`
- `HARVEST_COMPLETE`

ChatGPT may claim the second only after Git publication verification and may never claim the third.

### EVT-005 — User explicitly requested execution
After asking whether the repaired protocol would cause ChatGPT to push correctly again, the operator instructed: `run file` and attached the restored v2 protocol.

### EVT-006 — Git capability proven in-session
The connected GitHub repository reported push/admin permission for `Capglass5708/CapitalGlass-Cross-Agent`, and branch lookup confirmed `chat-gpt-harvest` exists. This makes Git publication executable in this ChatGPT session rather than a paste-only fallback.

## 5. Harvest packets

### HP-001 — failure-pattern: branch-only protocol closure is not operational promotion
**Observation:** A protocol lane can be developed, piloted, and marked closed on a side branch while remaining non-operational if the authoritative `main` copy and published mirrors never receive it.

**Durable rule:** Operational protocol closure requires authority promotion, not merely branch-local completion.

**Future agent instruction:** Before treating protocol work as active, prove the relevant commit is on the canonical authority branch and that the published mirror derives from that authority.

### HP-002 — authority-decision: ChatGPT Git writes are narrow evidence publication
`DRAFT_FILE` should not mean all repository writes are forbidden. It authorizes exactly one designated harvest evidence artifact on `chat-gpt-harvest` while still forbidding canonical implementation, schema, validator, `main`, merge, index, and publish mutations.

### HP-003 — protocol-upgrade: hard Git publication gate
A correct ChatGPT harvest closeout needs all of:
- artifact exists at the harvest-id path;
- repo is `Capglass5708/CapitalGlass-Cross-Agent`;
- branch is `chat-gpt-harvest`;
- commit is created;
- remote write succeeds;
- remote branch state is verified against the resulting commit SHA.

Failure must result in `BLOCKED_GIT_PUBLICATION`, not silent fallback to a success-like handoff.

### HP-004 — lesson: publication claims must be stage-specific
Git staging success is not harvest completion. Cursor validation and operator publication are separate authority stages.

### HP-005 — protocol-upgrade: eliminate split-estate instruction drift
Autopsy, advancement, assessment, opener prompts, branch maps, workflow documentation, and mirror copies should share one machine-checkable Git-publication contract so one file cannot silently regress to draft-only behavior.

### HP-006 — protocol-upgrade: self-referential receipt defect
The v2 protocol requires the findings artifact to include `gitPublicationReceipt` after push while that receipt includes the commit SHA of the commit containing the artifact. A file cannot contain the SHA of the commit that contains that exact file content without changing the commit and therefore changing the SHA again.

**Recommended deterministic resolution:** define the SHA receipt as a chat/connector closeout receipt outside the committed artifact, or split it into a second immutable receipt artifact explicitly authorized by the protocol. Do not require a commit to contain its own final SHA.

## 6. Execution deltas

### ED-001
**Before:** ChatGPT autopsy path could terminate with Markdown in chat and Cursor paste ingest.

**After target:** ChatGPT autopsy path requires designated Git staging publication when GitHub is available.

### ED-002
**Before:** `DRAFT_FILE` was interpreted as repo-write prohibition.

**After target:** `DRAFT_FILE` permits exactly one harvest evidence artifact on `chat-gpt-harvest`.

### ED-003
**Before:** `HARVEST_COMPLETE` semantics could be blurred with draft production.

**After target:** Git staging, canonical validation, and operational publication have separate verdicts.

## 7. Waste ledger

### TW-001 — repeated diagnosis caused by protocol drift
The same operational question — whether ChatGPT should push — had to be re-litigated because branch-local protocol changes and canonical mirror behavior diverged.

### TW-002 — ambiguous success language
Earlier workflows could appear successful after producing a draft even though no Git authority existed. This creates operator uncertainty and extra verification work.

## 8. Duplication detector

### DUP-001
The thread revisited previously discussed `chat-gpt-harvest` behavior because canonical authority did not preserve the earlier experimental lane. Treat this as a protocol-authority recurrence, not new architecture.

**Guard:** `NEEDS_REGISTRY_LOOKUP_FIRST` before creating another push-lane variant.

## 9. Operator friction

### OF-001
The operator expects `run file` to execute the attached protocol, not merely summarize it.

### OF-002
The operator should not have to remember which of multiple L: protocol files still contains Git push instructions.

### OF-003
A harvest that cannot prove remote publication should visibly block rather than require the operator to infer whether a push occurred.

## 10. ROI backlog

1. **P0 — Canonical protocol consistency gate:** fail CI if autopsy/advancement/supporting protocol surfaces disagree on Git publication authority.
2. **P0 — Main ancestry/promotion gate:** branch-lane closeout cannot be marked operational until required protocol commits are ancestors of `main` or explicitly recorded as non-operational experiments.
3. **P0 — Fix self-referential SHA receipt contract:** move final receipt outside the content whose commit SHA it reports, or authorize a second receipt artifact.
4. **P1 — Remote publication verifier:** machine-check branch HEAD/commit identity after ChatGPT connector write.
5. **P1 — Mirror parity proof:** after `harvest:sync-z-mirror`, compare Git-main protocol hash against Z and L copies.
6. **P1 — Workflow-presence gate:** if documentation promises GitHub -> L staging, require the workflow and move script on `main`.
7. **P2 — One-command Cursor ingest:** accept harvest id, fetch branch, verify SHA, ingest, duplicate-check, validate, then stop before operator publication.

## 11. Do-not-advance guards

- Do not claim `HARVEST_COMPLETE` in ChatGPT.
- Do not claim `OPERATIONAL` in ChatGPT.
- Do not claim `INDEX_HIT`, `INDEX_HIT_AI_CACHE`, hub publication, freshness, or cache authority.
- Do not merge this artifact to `main` from ChatGPT.
- Do not edit canonical protocol/schema/script files in this `DRAFT_FILE` lane.
- Do not treat branch-only protocol changes as operational authority.
- Do not hand off as published evidence unless the Git publication gate passes.

## 12. Seed packet candidates

```json
{
  "seedId": "IH-THREAD-BRANCH-ONLY-PROTOCOL-NOT-OPERATIONAL-V1",
  "kind": "failure-pattern",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why can a closed protocol lane still be non-operational?",
    "What proves a ChatGPT harvest protocol is authoritative?"
  ],
  "evidenceRefs": [
    "EVT-001",
    "EVT-002",
    "HP-001"
  ],
  "futureAgentInstructions": "Require canonical main ancestry plus mirror publication proof before declaring branch-developed protocol behavior operational."
}
```

```json
{
  "seedId": "IH-THREAD-CHATGPT-HARVEST-GIT-GATE-V1",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "What must ChatGPT prove before claiming CHATGPT_SOURCE_PUBLISHED?",
    "What happens if Git publication fails during DRAFT_FILE closeout?"
  ],
  "evidenceRefs": [
    "EVT-003",
    "EVT-004",
    "HP-003"
  ],
  "futureAgentInstructions": "Require designated artifact, chat-gpt-harvest branch, commit receipt, and independent remote verification; otherwise block publication."
}
```

```json
{
  "seedId": "IH-THREAD-GIT-RECEIPT-SELF-REFERENCE-V1",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why can a committed artifact not contain its own final commit SHA deterministically?",
    "Where should a ChatGPT Git publication receipt live?"
  ],
  "evidenceRefs": [
    "HP-006"
  ],
  "futureAgentInstructions": "Do not design a single committed file that must embed the SHA of the commit containing itself; externalize or separate the receipt."
}
```

## 13. Future-agent instructions

1. Read the canonical protocol from `main` or a verified Z/L mirror before execution.
2. If mode is `DRAFT_FILE` and GitHub is available, do not stop at in-chat Markdown.
3. Write only the designated harvest artifact path on `chat-gpt-harvest`.
4. Verify the resulting remote commit/branch state before claiming `CHATGPT_SOURCE_PUBLISHED`.
5. Keep Cursor/operator validation and publication claims separate.
6. If a branch-only protocol improvement is valuable, promote it through canonical authority before closing it as operational.
7. Treat the receipt-self-reference issue as a protocol defect to be fixed canonically, not worked around by inventing a false embedded SHA.

## 14. Publication truth table

| Layer | State at artifact creation |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | `in-progress` |
| `CHATGPT_HARVEST_GIT_GATE` | `not-run` |
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

## 15. gitPublicationReceipt

The final SHA receipt is intentionally **not embedded as a fabricated self-reference** in this commit. The v2 protocol simultaneously requires this committed file to contain the receipt and requires that receipt to contain the SHA of the commit containing this file; satisfying both literally would mutate the file and produce a new SHA indefinitely.

The authoritative `gitPublicationReceipt` for this run must therefore be emitted in the ChatGPT closeout after the remote commit is created and independently verified. This is recorded as `HP-006` for canonical protocol repair.

## 16. Cursor handoff command

Run only after ChatGPT reports `CHATGPT_HARVEST_GIT_GATE: PASS` and provides the verified SHA receipt.

```bash
git fetch origin chat-gpt-harvest && git checkout chat-gpt-harvest && git pull --ff-only origin chat-gpt-harvest

npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-07-chatgpt-git-push-protocol-restoration-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-07-chatgpt-git-push-protocol-restoration-v1

npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-07-chatgpt-git-push-protocol-restoration-v1
npm run harvest:sync-derived -- harvest-2026-08-07-chatgpt-git-push-protocol-restoration-v1
npm run harvest:validate -- harvest-2026-08-07-chatgpt-git-push-protocol-restoration-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-07-chatgpt-git-push-protocol-restoration-v1
npm run test:harvest
# operator only after validation:
# npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-07-chatgpt-git-push-protocol-restoration-v1
```
