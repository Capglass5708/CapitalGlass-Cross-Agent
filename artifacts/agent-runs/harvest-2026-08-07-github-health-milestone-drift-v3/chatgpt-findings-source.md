# ChatGPT Thread Autopsy Findings — harvest-2026-08-07-github-health-milestone-drift-v3

## 1. Final Summary + Verdict

Mission: `chat-thread-closeout-autopsy-harvest-chatgpt-v1`  
Lane: `CHAT_CONTEXT_ONLY`  
Protocol: `v2`  
Start verdict: `UNHARVESTED_THREAD`  
Target tier: `T2`  
Closeout target: `CHATGPT_SOURCE_PUBLISHED`

This thread contains durable lessons about milestone continuity, pasted-closeout classification, GitHub health, interactive operator gates, and harvest publication truth.

The active implementation milestone became `capitalglass-office-admin-fully-healthy-github-v1`. During that work, unrelated Rosewood/Revu/Data-Extraction closeouts were temporarily interpreted as continuation work. The user explicitly corrected the drift. The GitHub milestone later advanced to a clean, mergeable PR with local gates passing while GitHub Actions control-plane health remained blocked by missing automatic events, hosted Windows runner acquisition failure, missing `workflow` OAuth scope, and incomplete branch-protection/ruleset visibility.

The thread also exposed a harvest-protocol regression. An earlier v1 protocol made ChatGPT draft-only. The user expected ChatGPT to push harvest evidence to Git, asked why that no longer happened, and then supplied protocol v2 restoring the mandatory `chat-gpt-harvest` staging lane.

Pre-Git verdict: `DRAFT_READY`

## 2. Harvest Tier Rationale

Tier: `T2`

Reasons:
- multiple user corrections;
- multiple milestones/repositories in one thread;
- milestone-routing drift occurred;
- repository, CI, and PromptOps lessons coexist;
- a protocol-authority regression was discovered;
- durable future-agent guidance can prevent repeated operator friction.

## 3. Retrieval Preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

No live Hub/index/cache claim is made.

## 4. Thread Event Inventory

### EVT-001 — Office Admin Git repair
Work began with `CapitalGlass-Office-Admin` failures involving a UTF-8 BOM, knowledge-index drift, and CI workflow repair.

### EVT-002 — Repair commit and workflow-scope blocker
The user reported repair commit `8354e93...`; normal workflow-file push was blocked because GitHub auth lacked `workflow` scope.

### EVT-003 — Workflow repair via GitHub API/MCP
The workflow file was published through GitHub API/MCP, but automatic CI still did not appear.

### EVT-004 — Formal GitHub-health milestone
Active milestone established: `capitalglass-office-admin-fully-healthy-github-v1`.

### EVT-005 — GitHub-health closeout
Remaining blockers included PR/main reconciliation, automatic CI triggering, latest-HEAD validation, Windows runner acquisition, and protection visibility.

### EVT-006 — Correct continuation wave
A coherent GitHub-health continuation wave was generated.

### EVT-007 — Unrelated Rosewood closeout entered thread
A different milestone and repository set was pasted into the conversation.

### EVT-008 — Milestone drift
The assistant incorrectly generated Rosewood/Data-Extraction continuation work.

### EVT-009 — User scope correction
The user asked how that work related to cleaning GitHub. The assistant acknowledged the mismatch and restored the GitHub milestone.

### EVT-010 — Second unrelated Rosewood closeout classified correctly
A later Rosewood estimator-workspace closeout was correctly separated from GitHub health.

### EVT-011 — GitHub milestone advanced
The user reported PR #29 clean and mergeable, branch parity restored, and local gates passing. Actions control-plane health remained blocked.

### EVT-012 — Actions control-plane continuation
Remaining work narrowed to OAuth scope, automatic events, hosted Windows runner acquisition, required checks, and protection/ruleset proof.

### EVT-013 — Harvest v1 executed
ChatGPT created a local autopsy draft under the attached draft-only protocol.

### EVT-014 — User expected Git publication
The user asked whether the harvest was pushed to Git and why ChatGPT was not pushing.

### EVT-015 — Protocol regression identified
Inspection of v1 confirmed `Git authority | not-run`, no push instruction, and Cursor/operator-only publication.

### EVT-016 — Protocol v2 supplied
The user supplied v2 restoring mandatory Git staging publication to `CapitalGlass-Cross-Agent/chat-gpt-harvest`.

## 5. Harvest Packets

### HP-001 — Milestone continuity failure
**Kind:** `failure-pattern`

An unrelated Rosewood closeout was treated as continuation evidence for the active Office Admin GitHub-health milestone.

### HP-002 — Milestone continuity guard
**Kind:** `protocol-upgrade`

Before generating a continuation prompt, classify incoming closeouts against milestone ID, repo set, lane, desired end state, baseline SHA, and current wave.

Allowed classifications: `CONTINUATION_MATCH`, `SEPARATE_MILESTONE`, `STALE_CLOSEOUT`, `AMBIGUOUS`, `SUPERSESSION_REQUIRES_OPERATOR`.

### HP-003 — Pasted report is evidence, not authorization
**Kind:** `protocol-upgrade`

Questions and recommendations embedded in pasted agent output must not be treated as current operator authorization.

### HP-004 — Explicit user correction is a hard scope reset
**Kind:** `lesson`

A relevance correction should invalidate the prior wrong-lane assumption and restore the last verified active milestone.

### HP-005 — Repository/PR health vs GitHub control-plane health
**Kind:** `architecture-decision`

A clean mergeable PR and local PASS do not prove GitHub is fully healthy. Automatic events, hosted runner assignment, required checks, OAuth workflow publication, and protection/ruleset state are separate control-plane requirements.

### HP-006 — Interactive authentication boundary
**Kind:** `protocol-upgrade`

Browser/device authentication should produce a formal `OPERATOR_ACTION_REQUIRED` state with exact completion proof before dependent work continues.

### HP-007 — Windows hosted runner acquisition failure
**Kind:** `failure-pattern`

Manual dispatch may create a run while `windows-latest` never acquires a runner. Local WSL validation is not equivalent evidence.

### HP-008 — Harvest protocol authority drift
**Kind:** `protocol-upgrade`

The v1 catalog copy removed the mandatory ChatGPT Git staging lane. Protocol authority must be bound to `CapitalGlass-Cross-Agent/main` and deterministic mirror sync so branch-only or stale catalog copies cannot silently downgrade ChatGPT from Git-staging publisher to draft-only.

### HP-009 — Publication truth must be explicit
**Kind:** `lesson`

ChatGPT must distinguish `DRAFT_READY`, `CHATGPT_SOURCE_PUBLISHED`, and `HARVEST_COMPLETE`.

## 6. Execution Deltas

- `ED-001` Actual: unrelated closeout triggered continuation. Optimal: classify `SEPARATE_MILESTONE`.
- `ED-002` Actual: embedded recommendations influenced execution. Optimal: separate pasted report content from live operator intent.
- `ED-003` Actual: large wrong-lane prompts were generated. Optimal: no execution prompt until continuity check passes.
- `ED-004` Actual: interactive GitHub auth was embedded in broader work. Optimal: explicit operator boundary until proof.
- `ED-005` Actual: v1 harvest stopped at local draft. Optimal under v2: commit/push designated artifact to `chat-gpt-harvest` and verify remote SHA.

## 7. Waste Ledger

- `TW-001` Wrong-lane Data-Extraction/Revu publication prompt.
- `TW-002` Wrong-lane selective extraction/OCR continuation.
- `TW-003` Repeated Rosewood state inside a GitHub-health thread.
- `TW-004` User had to correct scope manually.
- `TW-005` Repeated GitHub blocker restatement.
- `TW-006` User had to ask whether harvest was actually pushed.
- `TW-007` Protocol drift caused the ChatGPT Git-staging workflow to disappear from the active copy.

## 8. Duplication Detector

- `DUP-001` GitHub Actions blocker repetition — `NEEDS_REGISTRY_LOOKUP_FIRST`.
- `DUP-002` Rosewood operator-gate repetition — keep separate from GitHub-health records.
- `DUP-003` Milestone continuity may overlap existing SDLC Prompt-Orchestration rules — registry lookup first.
- `DUP-004` Harvest protocol authority drift may overlap prior self-learning work — registry lookup first.

## 9. Operator Friction

- `OF-001` User had to ask how Rosewood related to GitHub cleanup.
- `OF-002` Pasted agent text blurred with live user intent.
- `OF-003` Long prompts obscured the active milestone.
- `OF-004` Device-auth boundary was unclear.
- `OF-005` User had to ask whether the harvest was pushed.
- `OF-006` User had to locate/provide the restored protocol version.

## 10. ROI Backlog

1. Milestone Continuity Preflight — very high ROI.
2. Pasted Report Intent Classifier — very high ROI.
3. Harvest Protocol Authority/Drift Gate — very high ROI.
4. Interactive Operator Boundary State — high ROI.
5. Publication Truth Banner + Git receipt — high ROI.
6. GitHub Actions Control-Plane Diagnostic Packet — high ROI.
7. Continuation Receipt Compression — medium-high ROI.

## 11. Do-Not-Advance Guards

1. Do not continue when incoming milestone identity conflicts with active milestone.
2. Do not act on recommendations embedded inside pasted reports.
3. Do not claim GitHub health from local gates alone.
4. Do not claim automatic CI health from manual dispatch.
5. Do not claim Windows validation without hosted Windows runner assignment.
6. Do not merge PR #29 without explicit authorization.
7. Do not treat branch-only protocol text as operational authority.
8. Do not claim `CHATGPT_SOURCE_PUBLISHED` until remote SHA verification passes.
9. Do not claim `HARVEST_COMPLETE`, `OPERATIONAL`, `FULLY_SEEDED`, or `INDEX_HIT`.
10. Do not publish canonical harvest records or protocol changes from ChatGPT.

## 12. Seed Packet Candidates

```json
{
  "seedId": "IH-THREAD-MILESTONE-CONTINUITY-GUARD-V3",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How should ChatGPT verify that an incoming closeout belongs to the active milestone?",
    "What should happen when incoming repo and milestone IDs differ from the active anchor?"
  ],
  "evidenceRefs": ["EVT-004", "EVT-007", "EVT-008", "EVT-009"],
  "futureAgentInstructions": {
    "whenThisAppears": "A closeout is pasted into a thread with an active milestone.",
    "startAt": "Compare milestone ID, repo set, lane, desired end state, and baseline.",
    "runPreflight": "MILESTONE_CONTINUITY_CHECK",
    "doNot": ["Generate continuation before classification"],
    "proveBeforeClaiming": ["Milestone and repository set match"]
  }
}
```

```json
{
  "seedId": "IH-THREAD-HARVEST-PROTOCOL-AUTHORITY-DRIFT-V1",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why did ChatGPT stop pushing harvest drafts to Git?",
    "How should the harvest protocol prevent a stale catalog copy from replacing main authority?"
  ],
  "evidenceRefs": ["EVT-013", "EVT-014", "EVT-015", "EVT-016", "HP-008"],
  "futureAgentInstructions": {
    "whenThisAppears": "ChatGPT harvest behavior differs from expected Git-staging behavior.",
    "startAt": "Verify CapitalGlass-Cross-Agent main protocol and mirror parity.",
    "runPreflight": "HARVEST_PROTOCOL_AUTHORITY_DRIFT_CHECK",
    "doNot": ["Treat branch-only protocol text as authoritative"],
    "proveBeforeClaiming": ["Protocol exists on main", "Z/L mirrors match canonical protocol"]
  }
}
```

```json
{
  "seedId": "IH-THREAD-INTERACTIVE-AUTH-BOUNDARY-V3",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How should an agent handle gh auth refresh device login?",
    "When must an execution wave stop for operator-only authentication?"
  ],
  "evidenceRefs": ["EVT-002", "EVT-011"],
  "futureAgentInstructions": {
    "whenThisAppears": "A command requires browser, MFA, device, or billing interaction.",
    "startAt": "Emit OPERATOR_ACTION_REQUIRED with exact success proof.",
    "runPreflight": "INTERACTIVE_OPERATOR_BOUNDARY_CHECK",
    "doNot": ["Pretend operator auth completed", "Continue dependent writes"],
    "proveBeforeClaiming": ["Expected permission/state is visible"]
  }
}
```

## 13. Future-Agent Instructions

Closeout classification must return one of: `CONTINUATION_MATCH | SEPARATE_MILESTONE | STALE_CLOSEOUT | AMBIGUOUS | SUPERSESSION_REQUIRES_OPERATOR`.

Interactive auth should use:

```text
OPERATOR_ACTION_REQUIRED
Action: <exact operator action>
Proof: <machine-verifiable result>
Resume baseline: <receipt/SHA>
```

For protocol v2 `DRAFT_FILE`, only the designated evidence artifact is writable on `chat-gpt-harvest`. Never write canonical implementation, schemas, validators, manifests, or `main`.

## 14. Publication Truth Table

| Layer | State before Git gate |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | `not-run` |
| `CHATGPT_HARVEST_GIT_GATE` | `not-run` |
| L: draft staging | `not-run` |
| Cursor ingest | `not-run` |
| `harvest:validate` | `not-run` |
| L: Hub catalog | `not-run` |
| Z: AI cache | `not-run` |
| Supabase projection | `not-run` |
| Lane C export / Data-Extraction | `not-run` |
| Freshness gate | `not-run` |
| Automatic protocol mutation | `false` |

## 15. gitPublicationReceipt

The authoritative Git publication receipt is emitted in the ChatGPT closeout only after remote verification of the commit produced from this source artifact.

## 16. Cursor Handoff Command

After `CHATGPT_HARVEST_GIT_GATE` PASS:

```bash
git fetch origin chat-gpt-harvest
git checkout chat-gpt-harvest
git pull --ff-only origin chat-gpt-harvest

npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-07-github-health-milestone-drift-v3/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-07-github-health-milestone-drift-v3

npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-07-github-health-milestone-drift-v3
npm run harvest:sync-derived -- harvest-2026-08-07-github-health-milestone-drift-v3
npm run harvest:validate -- harvest-2026-08-07-github-health-milestone-drift-v3
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-07-github-health-milestone-drift-v3
npm run test:harvest
# operator:
npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-07-github-health-milestone-drift-v3
```

ChatGPT does not claim those Cursor/operator steps ran.
