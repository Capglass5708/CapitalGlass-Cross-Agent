# Chat Thread Autopsy Findings — WESLEYDESK Connectivity, Direct Connect, and Prompt-Catalog Trim

**Mission:** `chat-thread-closeout-autopsy-harvest-chatgpt-v1`  
**Lane:** `CHAT_CONTEXT_ONLY`  
**Mode:** `DRAFT_FILE`  
**Start verdict:** `UNHARVESTED_THREAD`  
**Target tier:** `T2`  
**Output verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`  
**Harvest ID:** `harvest-2026-08-04-wesleydesk-connectivity-session-boundary-v1`

---

## 1. Final summary

This thread converged on a precise correction to the WESLEYDESK connectivity diagnosis: the dominant unresolved problem was not general network failure, Tailscale failure, SMB reachability failure, GitHub outage, L: hub loss, or runner failure. The durable blocker was a Windows session and identity boundary around the Z: mapped drive.

Repair 1 restored the Synology credential source, cleared a phantom Z: device, and proved that the official ForceRemap script could map Z: and L: successfully inside the `cgremoteadmin` SSH repair session. That result was technically valid but operationally incomplete because the active console user was Fred, Wesley was not logged in, and WSL was owned by the intended Wesley workflow context. A Z: mapping established in the SSH repair session did not become visible to Fred's desktop or Wesley's future interactive WSL session.

The thread also correctly separated two unrelated follow-up lanes:

1. RYZEN9DESK prompt-harvest hot-cache distribution proof, which must execute on RYZEN9DESK or through its self-hosted runner via the Direct Connect coordination hub.
2. Prompt-catalog scout compact trimming, which was reported as complete and should remain distinct from the WESLEYDESK repair mission.

The most durable lesson is that Windows mapped drives must be evaluated by identity, token, and logon session. Administrator membership does not make a mapped drive globally visible. Future diagnostics should prove the intended operator context before classifying a drive repair as complete.

**Draft verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

---

## 2. Harvest verdict and tier rationale

**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

**Tier:** `T2`

**Rationale:**

- The thread contained several corrections to the operational model.
- Multiple infrastructure topics appeared and had to be separated to prevent false closure or scope mixing.
- The user explicitly corrected the account model: Wesley is an administrator and Fred is a standard user.
- The thread produced durable procedural rules for mapped drives, WSL mount validation, scheduled-task identity, remote repair limits, and reboot acceptance.
- The findings can improve future agents, but all code, artifact, branch, receipt, and publication claims require Cursor verification.

---

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

The conversation includes pasted reports that claimed `INDEX_HIT_AI_CACHE`, `PUBLICATION_PASS`, cache alignment, and specific SHAs. Those claims are retained only as user-provided evidence candidates. They are not independently verified by this ChatGPT harvest.

---

## 4. Thread event inventory

### EVT-001 — Full WESLEYDESK diagnostic reported

The user supplied an evidence-backed diagnosis with multiple root causes. The primary chain was:

```text
Z: mapping persistence or credentials
  -> phantom or unavailable Z:
    -> PowerShell default-drive initialization failures
      -> WSL /mnt/z absence
```

Secondary findings included a retired Wi-Fi address and metric issue, a default SSH-key mismatch from WESLEY_WORK, and latent startup-order risk.

### EVT-002 — Smallest reversible repair approved

The assistant recommended ForceRemap first and explicitly held back broader actions such as credential deletion, WSL reinstall, runner re-registration, firewall resets, and global network changes.

### EVT-003 — Desk closeout and RYZEN9DESK cache work separated

The user stated that desk publication was closed and RYZEN9DESK hot-cache fanout was a separate target-host task. The Direct Connect coordination hub on Z: was identified as the canonical cross-host coordination path.

### EVT-004 — Repair 1 remotely executed through IT Vault

From WESLEY_WORK, the repair process used the Capital Glass IT Vault to restore the expected SMB environment file on WESLEYDESK. A phantom Z: was cleared using `DefineDosDevice`, after `net use Z: /delete` alone failed to clear the ghost mapping.

### EVT-005 — Official ForceRemap passed in repair identity

The official drive-mount script returned exit 0 with Z:, L:, and Office operational checks green in the `cgremoteadmin` SSH session. L: and the GitHub Actions runner remained healthy.

### EVT-006 — Session-boundary defect identified

The user reported that Z: was visible in the remap SSH session but `/mnt/z` failed in WSL. Fred owned the active console, Wesley was not logged in, and the scheduled logon task was interactive-only for Wesley.

### EVT-007 — Repair 1 classified as PARTIAL_PASS

The state model was frozen as:

```text
REPAIR_1: PARTIAL_PASS
SMB_CREDENTIALS: RESTORED
Z_MAPPING_SCRIPT: PASS
PHANTOM_DRIVE: CLEARED
L_DRIVE: PASS
RUNNER: PASS
ACTIVE_USER_Z_MAPPING: NOT_PROVEN
WSL_MNT_Z: FAIL
DURABLE_PERSISTENCE: OPEN
```

### EVT-008 — Interactive gate scripts staged

The user reported that three gate scripts were staged on WESLEYDESK for Wesley's elevated PowerShell session: an interactive Repair 1 gate, a Repair 2 task inspection gate, and a post-reboot gate.

### EVT-009 — Administrator-versus-session confusion surfaced

The user clarified that Wesley is an administrator and Fred is a user, and asked why execution was blocked. The durable explanation is that administrative privilege and mapped-drive session ownership are separate dimensions.

### EVT-010 — Prompt-catalog compact trim completed

The user reported a separate slice in which over-budget scout injection now trims the prompt catalog deterministically rather than dropping it. This included rank ordering, record and byte caps, selection metadata, a deterministic selection hash, and CI coverage.

---

## 5. Harvest packets

### HP-001 — Failure pattern

**Kind:** `failure-pattern`

**Title:** Mapped drive repaired in the wrong Windows logon session

**Finding:** A network drive can be successfully mapped in an SSH or administrative session while remaining absent from the active desktop and WSL workflow. A script exit code of zero is not sufficient proof when the consuming workflow runs under another Windows identity or token.

**Evidence candidates:** EVT-004, EVT-005, EVT-006, EVT-007.

**Durable rule:** Validate mapped drives in the same Windows user, token, and interactive session that launches the dependent WSL workload.

### HP-002 — Protocol upgrade

**Kind:** `protocol-upgrade`

**Title:** Add identity and session matrix to mapped-drive repair gates

**Finding:** Connectivity runbooks should record at least the console user, SSH user, scheduled-task user, WSL-launching user, runner user, elevation state, and visibility of each mapped drive under each context.

**Evidence candidates:** EVT-006, EVT-009.

**Recommended protocol change:** No drive repair may be declared operationally complete until the intended consumer context passes Windows-path and WSL-path validation.

### HP-003 — Lesson

**Kind:** `lesson`

**Title:** Administrator rights do not globalize network-drive mappings

**Finding:** The thread initially risked conflating account privilege with session visibility. Wesley being an administrator does not make Z: mapped under `cgremoteadmin` available to Wesley, Fred, an elevated token, the runner, or WSL automatically.

**Evidence candidates:** EVT-006, EVT-009.

### HP-004 — Repair pattern

**Kind:** `repair-pattern`

**Title:** Clear phantom DOS device before ForceRemap

**Finding:** `net use Z: /delete` can leave a ghost drive letter. The repair required clearing the phantom DOS device before the official ForceRemap script could establish a clean mapping.

**Evidence candidates:** EVT-004.

**Boundary:** Cursor must verify the exact implementation and whether this behavior is already encoded in Office Admin scripts before promoting it as canonical.

### HP-005 — Security pattern

**Kind:** `security-pattern`

**Title:** Hydrate canonical SMB environment without logging secrets

**Finding:** The repair used the IT Vault to restore the expected `smb-z-cg-server.env`, removed temporary staging material, and avoided exposing passwords in chat or receipts.

**Evidence candidates:** EVT-004.

**Durable rule:** Credential reconciliation should preserve canonical secret-management policy, avoid blind deletion, and produce only names or redacted evidence.

### HP-006 — Architecture boundary

**Kind:** `architecture-boundary`

**Title:** Direct Connect is coordination, not universal remote execution

**Finding:** WESLEY_WORK could coordinate RYZEN9DESK through the Direct Connect hub and GitHub Actions runner, but could not substitute for execution on the RYZEN9DESK host when host-local cache roots and attestations were required.

**Evidence candidates:** EVT-003.

### HP-007 — Resilience improvement

**Kind:** `resilience-improvement`

**Title:** Trim compact datasets rather than drop the entire slice

**Finding:** The prompt-catalog router was changed to retain the highest-priority eligible records under a combined record and byte budget, expose omission metadata, and emit a deterministic selection hash.

**Evidence candidates:** EVT-010.

**Boundary:** Reported implementation and test claims require repository validation.

### HP-008 — Repeated-work prevention

**Kind:** `repeated-work`

**Title:** Freeze closed lanes and isolate remaining target-host work

**Finding:** The thread repeatedly risked reopening desk publication, RYZEN9DESK fanout, and WESLEYDESK drive repair as one combined mission. Explicit lane separation prevented false dependencies and redundant reruns.

**Evidence candidates:** EVT-003, EVT-007, EVT-010.

**Registry guard:** `NEEDS_REGISTRY_LOOKUP_FIRST`

---

## 6. Execution deltas

### ED-001 — Initial model versus optimal model

**Actual:** The early repair framing focused on running ForceRemap and checking Z: and `/mnt/z`, but did not initially emphasize strongly enough that the gate had to execute in the intended interactive Windows account.

**Optimal:** Declare the consumer identity matrix before any repair command. Identify console user, SSH user, WSL owner, scheduled-task user, and runner user. Then execute and validate in the intended context.

### ED-002 — Remote repair proof versus operational proof

**Actual:** Repair 1 successfully restored credentials and mapped the drives in the SSH repair context. This was correctly downgraded later to `PARTIAL_PASS`.

**Optimal:** Split the receipt from the beginning into:

```text
REPAIR_MECHANISM_PASS
CONSUMER_SESSION_PASS
REBOOT_PERSISTENCE_PASS
```

This avoids a single ambiguous Repair 1 status.

### ED-003 — Fred versus Wesley assumption

**Actual:** Some responses implied that Fred might be the operational user or that making Fred an administrator could be relevant.

**Optimal:** Ask or verify account roles once, then record them explicitly. In this thread, Wesley is the administrator and intended workflow identity; Fred is a standard user whose active console session prevented the Wesley interactive gate.

### ED-004 — WSL mount expectation

**Actual:** `/mnt/z` was treated as a downstream validation of Windows Z: mapping, which is correct, but the session ownership of the Windows mapping was not always foregrounded.

**Optimal:** Treat `/mnt/z` as a consumer-context assertion, not merely a machine-level assertion. Prove the Windows drive exists for the user launching the target WSL instance.

### ED-005 — Multi-lane scope control

**Actual:** The thread included WESLEYDESK repair, RYZEN9DESK cache distribution, Direct Connect persistence, and prompt-catalog router work.

**Optimal:** Maintain a lane ledger with independent verdicts and prevent one lane's success from closing another.

---

## 7. Waste ledger

### TW-001 — Repeated restatement of the same operator sequence

The sequence “log in as Wesley, run ForceRemap, restart WSL, validate `/mnt/z`” was repeated several times. Repetition was understandable because the execution context remained wrong, but a single identity matrix and one staged operator script would have reduced discussion.

**Preventive action:** Once the interactive gate script exists, future responses should point to the script, expected verdict, and stop condition rather than rewriting the commands.

### TW-002 — Premature expansion into Repair 2 details

Repair 2 task requirements and reboot validation were described before Repair 1 had passed in the Wesley session.

**Preventive action:** Keep Repair 2 blocked and minimize its detail until the Repair 1 consumer-session gate passes.

### TW-003 — Account-role ambiguity

The conversation spent effort explaining why the active Fred session mattered before the explicit role correction that Wesley is admin and Fred is a user.

**Preventive action:** Include account role and active-session identity as mandatory fields in the initial diagnostic baseline.

---

## 8. Duplication detector

### DUP-001 — Drive persistence work may overlap existing Office Admin kits

The thread references existing scripts, deployment kits, scheduled tasks, and Direct Connect runbooks. Before creating any new persistence logic, Cursor must inspect Office Admin and existing artifacts to avoid duplicating an established deployment mechanism.

**Classification:** `NEEDS_REGISTRY_LOOKUP_FIRST`

### DUP-002 — RYZEN9DESK fanout proof may already exist as an open work package

The one-shot cache sync proof and persistence gate were already described as ready. Do not create a new fanout implementation before locating the current receipt, workflow, and runbook.

**Classification:** `NEEDS_REGISTRY_LOOKUP_FIRST`

### DUP-003 — Prompt-catalog resolver remains intentionally deferred

Do not create `prompt-catalog-resolve.mjs` merely because the compact trim exists. The thread states it is deferred until a concrete lookup path appears.

**Classification:** `DO_NOT_DUPLICATE_DEFERRED_WORK`

---

## 9. Operator friction

### OF-001 — Interactive-session requirement blocks remote closure

The agent could repair via SSH but could not validly prove the intended Wesley desktop and WSL context. This requires a physical or interactive operator step.

### OF-002 — Active Fred session obscures intended administrative workflow

The machine was active under Fred while the intended repair task and WSL workflow were tied to Wesley. The UI did not make that distinction obvious to the operator.

### OF-003 — Multiple credential and identity stores

The repair touched IT Vault material, a machine-lock registry, a canonical environment file, Windows user credentials, scheduled-task identity, and SSH identity. The number of contexts increases the chance of repairing the wrong layer.

### OF-004 — Drive-letter visibility differs across shells

Normal PowerShell, elevated PowerShell, SSH PowerShell, scheduled tasks, services, and WSL can see different drive mappings. This creates misleading “works here, fails there” evidence.

### OF-005 — Closeout depends on reboot without manual intervention

A repair can look green immediately but fail after reboot because task trigger, network readiness, credential availability, or user logon differs.

---

## 10. ROI backlog

### ROI-001 — Identity-aware drive diagnostic and receipt schema

**Priority:** 1  
**Impact:** High  
**Effort:** Medium

Add a standard identity/session matrix to every drive-mount diagnostic and receipt:

- active console user
- intended operator user
- SSH user
- elevation state
- scheduled-task user and logon type
- runner user
- WSL Windows owner and Linux user
- Z:/L: visibility per context

### ROI-002 — Separate mechanism, consumer, and persistence verdicts

**Priority:** 2  
**Impact:** High  
**Effort:** Low

Replace ambiguous single repair verdicts with three explicit gates:

```text
MAPPING_MECHANISM_PASS
INTENDED_CONSUMER_CONTEXT_PASS
COLD_REBOOT_PERSISTENCE_PASS
```

### ROI-003 — One-click Wesley interactive gate with durable receipt

**Priority:** 3  
**Impact:** High  
**Effort:** Low to medium

Keep the staged gate script as the sole operator entrypoint. It should capture redacted outputs and update a receipt without requiring copied command sequences.

### ROI-004 — Scheduled-task network-readiness and retry hardening

**Priority:** 4  
**Impact:** High  
**Effort:** Medium

Verify that the drive-mount task runs under the intended account, waits for required services or usable network, retries boundedly, and records meaningful last-result data.

### ROI-005 — Session-bound drive documentation in Office Admin

**Priority:** 5  
**Impact:** Medium  
**Effort:** Low

Document that network-drive mappings are not machine-global and that administrator membership does not bypass session scoping.

### ROI-006 — Preserve prompt-catalog trim as an independent resilience pattern

**Priority:** 6  
**Impact:** Medium  
**Effort:** Low

Validate and register the deterministic compact-trim pattern so other scout datasets can degrade gracefully rather than disappear under combined-budget pressure.

---

## 11. Do-not-advance guards

1. Do not mark Repair 1 `PASS` solely from `cgremoteadmin` SSH evidence.
2. Do not treat administrator membership as proof of drive visibility across users or sessions.
3. Do not start or close Repair 2 until the Wesley interactive gate passes.
4. Do not mark reboot persistence green if ForceRemap was run manually after reboot.
5. Do not delete Windows credentials blindly; prove collision or invalidity first.
6. Do not re-register the GitHub Actions runner when it is already active.
7. Do not merge RYZEN9DESK cache fanout into the WESLEYDESK repair mission.
8. Do not build the deferred prompt-catalog resolver without a concrete consumer path.
9. Do not claim code, tests, receipts, publication, cache freshness, or index state from this ChatGPT draft.
10. Run duplication preflight before promoting any seed.

---

## 12. Seed packet candidates

### Seed candidate 1

```json
{
  "seedId": "IH-THREAD-WESLEYDESK-SESSION-BOUND-MAPPED-DRIVE-001",
  "kind": "failure-pattern",
  "title": "Mapped drive passes in repair session but fails in intended desktop and WSL context",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why does Z drive work over cgremoteadmin SSH but remain missing in Wesley WSL?",
    "How should a mapped-drive repair be validated across Windows users, elevation tokens, scheduled tasks, and WSL?",
    "Why does administrator membership not make a network-drive mapping visible to another session?"
  ],
  "evidenceRefs": [
    "EVT-004",
    "EVT-005",
    "EVT-006",
    "EVT-009"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A mapped drive succeeds in one shell or remote session but is absent from the active desktop, WSL, or runner.",
    "startAt": "Inventory console user, SSH user, intended workflow user, elevation state, scheduled-task identity, runner identity, and WSL owner.",
    "runPreflight": "Check mapping visibility separately in each identity and session before changing credentials or networking.",
    "doNot": [
      "Do not declare machine-level success from one user session.",
      "Do not delete credentials blindly.",
      "Do not re-register unrelated services."
    ],
    "proveBeforeClaiming": [
      "Windows path readable in intended user session",
      "WSL drvfs path readable from intended workflow",
      "cold reboot persistence without manual remap"
    ]
  }
}
```

### Seed candidate 2

```json
{
  "seedId": "IH-THREAD-WESLEYDESK-REPAIR-VERDICT-SPLIT-001",
  "kind": "protocol-upgrade",
  "title": "Split drive repair verdict into mechanism, consumer context, and persistence gates",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "What verdicts prevent a successful remap script from being mistaken for operational closeout?",
    "How should drive persistence receipts distinguish immediate repair from reboot durability?"
  ],
  "evidenceRefs": [
    "EVT-005",
    "EVT-006",
    "EVT-007",
    "ED-002"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A repair command exits successfully but the target application, user, WSL instance, or post-reboot state is not yet proven.",
    "startAt": "Create separate verdict fields for repair mechanism, intended consumer session, and cold reboot persistence.",
    "runPreflight": "Confirm the intended consumer and the no-manual-intervention reboot test are defined before execution.",
    "doNot": [
      "Do not collapse all gates into one PASS field.",
      "Do not let a remote repair receipt close an interactive-user gate."
    ],
    "proveBeforeClaiming": [
      "MAPPING_MECHANISM_PASS",
      "INTENDED_CONSUMER_CONTEXT_PASS",
      "COLD_REBOOT_PERSISTENCE_PASS"
    ]
  }
}
```

### Seed candidate 3

```json
{
  "seedId": "IH-THREAD-SCOUT-COMPACT-TRIM-001",
  "kind": "resilience-improvement",
  "title": "Trim deterministic compact datasets under scout budget instead of dropping the full slice",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How should scout routing behave when a compact dataset exceeds combined record or byte budgets?",
    "How can omitted compact records remain auditable and deterministic?",
    "What metadata should a trimmed scout slice expose?"
  ],
  "evidenceRefs": [
    "EVT-010",
    "HP-007"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A compact scout dataset is skipped entirely because the combined injection budget is exceeded.",
    "startAt": "Filter only ineligible lifecycle states, sort deterministically by priority, take remaining record capacity, then shrink from the bottom for byte capacity.",
    "runPreflight": "Inspect existing dataset-router and compact-slice conventions before implementing another trim policy.",
    "doNot": [
      "Do not drop the entire dataset if a deterministic subset can fit.",
      "Do not add a resolver until a concrete lookup consumer exists."
    ],
    "proveBeforeClaiming": [
      "combined budget respected",
      "important approved record retained",
      "selection hash deterministic",
      "omission counts exposed"
    ]
  }
}
```

### Seed candidate 4

```json
{
  "seedId": "IH-THREAD-DIRECT-CONNECT-TARGET-HOST-BOUNDARY-001",
  "kind": "architecture-boundary",
  "title": "Direct Connect coordinates target-host work but does not replace host-local proof",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "When must RYZEN9DESK cache validation run on RYZEN9DESK rather than WESLEY_WORK?",
    "What is the role of the Z Direct Connect hub in cross-host execution?"
  ],
  "evidenceRefs": [
    "EVT-003",
    "HP-006"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A control host can dispatch or coordinate work but lacks the target host's cache root, runner context, device, or local attestation.",
    "startAt": "Determine whether the acceptance proof is host-local or can be delegated through the approved runner.",
    "runPreflight": "Check Direct Connect runbook, runner state, and existing one-shot proof before creating another path.",
    "doNot": [
      "Do not treat control-host BLOCKED_WRONG_HOST as a defect.",
      "Do not invent an unauthorized fallback cache root."
    ],
    "proveBeforeClaiming": [
      "execution occurred on target host or approved target runner",
      "target cache attestation current",
      "target scout validation passed"
    ]
  }
}
```

---

## 13. Future-agent instructions

When a future agent encounters “connectivity is broken” on WESLEYDESK:

1. Separate physical/network reachability from drive mapping, credentials, user session, WSL drvfs, and service persistence.
2. Record the active console user before running repairs.
3. Record the exact user and token running PowerShell, SSH, scheduled tasks, runner services, and WSL.
4. Treat drive letters as session-scoped until proven otherwise.
5. Prove UNC reachability and credentials independently from drive-letter visibility.
6. If a mapping succeeds remotely, label it `REPAIR_MECHANISM_PASS`, not full operational closure.
7. Require the intended Wesley interactive session to prove Z: and `/mnt/z`.
8. Require one cold reboot with no manual ForceRemap for durable closeout.
9. Preserve L: hub and runner state; do not modify healthy layers.
10. Keep RYZEN9DESK fanout, Direct Connect persistence, and prompt-catalog router work in separate work packages.

---

## 14. Publication truth table

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

## 15. Acceptance checklist

- [x] Final summary included.
- [x] Harvest verdict and T2 rationale included.
- [x] Retrieval preflight uses `INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT`.
- [x] Thread event inventory included.
- [x] Eight harvest packet kinds included.
- [x] Execution deltas included.
- [x] Waste ledger included.
- [x] Duplication detector included.
- [x] Operator friction included.
- [x] ROI backlog ranked.
- [x] Do-not-advance guards included.
- [x] Seed candidates included for ROI top themes.
- [x] Each seed contains at least two retrieval questions.
- [x] Future-agent instructions included.
- [x] Publication truth table remains all `not-run`.
- [x] No `HARVEST_COMPLETE`, `OPERATIONAL`, or live index claim made.
- [ ] Cursor duplication preflight not run.
- [ ] Cursor validation not run.
- [ ] Operator publication not run.

---

## 16. Next operator action

Hand this findings file to Cursor for ingestion into the authority repository work package. Cursor must inspect existing Office Admin, Direct Connect, WESLEYDESK diagnostic, RYZEN9DESK cache-proof, and prompt-catalog artifacts before accepting seeds or creating work.

```bash
npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-04-wesleydesk-connectivity-session-boundary-v1/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-04-wesleydesk-connectivity-session-boundary-v1

npm run harvest:duplication-preflight -- \
  --harvest-id=harvest-2026-08-04-wesleydesk-connectivity-session-boundary-v1

npm run harvest:sync-derived -- \
  harvest-2026-08-04-wesleydesk-connectivity-session-boundary-v1

npm run harvest:validate -- \
  harvest-2026-08-04-wesleydesk-connectivity-session-boundary-v1

npm run harvest:validate-autopsy -- \
  --harvest-id=harvest-2026-08-04-wesleydesk-connectivity-session-boundary-v1

npm run test:harvest
```

Operator publication, only after validation:

```bash
npm run harvest:publish-intelligence-full -- \
  --harvest-id=harvest-2026-08-04-wesleydesk-connectivity-session-boundary-v1
```

---

## 17. Git push instructions

```text
Repo: Capglass5708/CapitalGlass-Cross-Agent
Branch: chat-gpt-harvest
File: artifacts/agent-runs/harvest-2026-08-04-wesleydesk-connectivity-session-boundary-v1/chatgpt-findings-source.md
Commit: harvest(chatgpt): draft findings harvest-2026-08-04-wesleydesk-connectivity-session-boundary-v1
```

Do not merge this draft directly to `main`. Cursor must ingest, deduplicate, validate, and prepare any operator publication.

---

## Final draft verdict

```text
DRAFT_READY_FOR_CURSOR_VALIDATION
```
