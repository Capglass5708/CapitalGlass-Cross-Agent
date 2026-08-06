# ChatGPT Findings Source — RYZEN9DESK Deterministic Connectivity and Persistence

## 1. Final summary

```text
Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Intelligence kind: OBSERVED
Start verdict: UNHARVESTED_THREAD
Target tier: T2
Output verdict: DRAFT_READY_FOR_CURSOR_VALIDATION
Harvest ID: harvest-2026-08-06-ryzen9desk-deterministic-connectivity-v1
```

This thread established and proved a deterministic RYZEN9DESK ↔ WESLEYWORK operating path built around GitHub Actions, Direct Connect, one shared handoff folder, live readiness evidence, an independent WESLEYWORK persistence gate, and profile-aware receipt verification. The thread also exposed major operator friction from path ambiguity, duplicated handoff folder assumptions, overengineered retry/ledger discussion before the basic path was stable, and repeated restatement of authority boundaries.

## 2. Harvest verdict and tier rationale

**Verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

**Tier:** T2 because the thread contained multiple corrections, architecture decisions, operational proof, a verifier defect, an implemented fix, a successful persistence award, and a durable future-agent pattern.

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

Pasted `INDEX_HIT_AI_CACHE` and publication claims are treated as user-provided reports only. They were not independently executed by ChatGPT in this thread.

## 4. Thread event inventory

- **EVT-001:** User supplied two-layer Intelligence Hub context and clarified ChatGPT draft staging versus Cursor-published harvest authority.
- **EVT-002:** RYZEN9DESK runner was offline because WSL was stopped; SSH from WESLEYWORK worked only as break-glass.
- **EVT-003:** Persistence authority was split: Ryzen owns local recovery/readiness; WESLEYWORK owns independent observation and final bundled gate.
- **EVT-004:** A Ryzen → WESLEYWORK readiness handoff design was created with JSON receipts, freshness, replay protection, and ledger states.
- **EVT-005:** User rejected needless complexity; the flow was simplified to one shared handoff folder and a minimal publish → accept → gate sequence.
- **EVT-006:** User explicitly corrected the shared path to exactly `Z:\Office\Wes\Direct Connect\handoffs`, with no required nested Ryzen folder.
- **EVT-007:** First full gate failed despite successful Ryzen execution because the verifier globally required an RTX 5080 GPU step for a storage profile.
- **EVT-008:** A repair brief was written for Cursor/Ryzen to make verification profile-aware and read `masterIndex.ok` from the storage receipt.
- **EVT-009:** Verifier fix completed, a fresh handoff was published, and the full gate later passed end-to-end.
- **EVT-010:** Successful cycle recorded publish run `31066856832`, dispatch run `31067137390`, handoff `f2848669-febf-4477-8140-be2bb83393dd`, and `PERSISTENT_AVAILABILITY_PASS`.
- **EVT-011:** Closeout evidence was archived, canonical Git evidence committed as `2ccce7c4`, and the standing operator sequence documented.
- **EVT-012:** User clarified the real goal: agents should cache the connection profile and operating rules so routine RYZEN9DESK work is deterministic, while always live-probing current state.
- **EVT-013:** M1 suite advancement was reported complete; M2 was drafted, but this thread did not implement M2.

## 5. Harvest packets

### HP-001 — Failure pattern: cached state mistaken for live truth

**Kind:** failure-pattern

Agents benefit from cached host identity, paths, runner names, approved control planes, and recovery rules, but must not cache `online`, `connected`, or `WSL running` as current truth. The deterministic pattern is: load profile → live probe → choose path → execute → verify receipt.

### HP-002 — Protocol upgrade: one canonical shared handoff root

**Kind:** protocol-upgrade

Both machines must use exactly `Z:\Office\Wes\Direct Connect\handoffs`. Nested or duplicated inbox assumptions caused confusion and unnecessary failure modes. Direction and source host belong in receipt metadata and filenames, not in competing path conventions.

### HP-003 — Architecture: authority-separated persistence proof

**Kind:** lesson

RYZEN9DESK owns local persistent-controller recovery and readiness publication. WESLEYWORK owns independent observation, dispatch, receipt verification, and the final persistence verdict. Remote repair during the proof invalidates the result.

### HP-004 — Failure pattern: verifier requirements not scoped to profile

**Kind:** failure-pattern

The first persistence attempt executed successfully on Ryzen but failed because `06-verify-receipt.sh` required `nvidia-smi` and `RTX 5080` for `storage-verify`. Receipt verification must be profile-aware and read profile-specific evidence from the correct artifact.

### HP-005 — Operating lesson: prove the minimal path before hardening

**Kind:** lesson

The conversation spent significant time on GUIDs, replay ledgers, retry states, archives, and authority wording before the basic publish → accept → observe → dispatch path was proven. The optimal order is minimal path first, then replay protection and archival.

### HP-006 — Deterministic host connectivity profile

**Kind:** protocol-upgrade

A compact host profile should contain canonical host identity, runner identity, WSL distro, systemd unit, shared handoff path, primary control plane, SSH status, receipt locations, approved recovery path, and known failure signatures. Live state remains probe-only.

### HP-007 — Evidence pattern: successful proof must be immutable and replayable

**Kind:** lesson

The final pass preserved handoff ID, publish/dispatch run IDs, latest result receipt, archive manifest, canonical Git receipt, ledger history, and the verifier fix commit. Failed ledger entries remained unchanged.

### HP-008 — Operator experience: correction intensity signals protocol ambiguity

**Kind:** operator-friction

Repeated emphatic corrections about which machine should fix itself, whether WESLEYWORK could proceed, and the exact handoff folder indicate that future runbooks need a one-screen ownership/path diagram and a single canonical command sequence.

## 6. Execution deltas

- **ED-001 actual:** Early responses repeatedly expanded the architecture and retry model. **Optimal:** state the two-host ownership split and minimal happy path first.
- **ED-002 actual:** A nested `handoffs\ryzen9desk` assumption was introduced. **Optimal:** reuse the user-declared exact shared root and never append unconfirmed subfolders.
- **ED-003 actual:** The first gate treated GPU evidence as universal. **Optimal:** derive required evidence from the selected profile schema.
- **ED-004 actual:** Several turns restated the same commands and authority rules. **Optimal:** maintain one compact state ledger and only report deltas.
- **ED-005 actual:** ChatGPT initially said it could not push protocol findings under an earlier protocol version. **Optimal:** re-read the attached authoritative protocol version; the updated version explicitly permits draft push to `chat-gpt-harvest`.

## 7. Waste ledger

- **TW-001:** Repeated re-explanation of Ryzen versus WESLEYWORK ownership after it had already been established.
- **TW-002:** Overdesign of replay and ledger transitions before the first basic successful handoff cycle.
- **TW-003:** Path churn caused by adding a `ryzen9desk` subfolder after the operator specified a shared root.
- **TW-004:** Multiple stale handoff republishes and retries caused by ten-minute freshness windows while verifier defects remained unresolved.
- **TW-005:** Repeated status-only handoffs from Ryzen before code repair completion.

## 8. Duplication detector

- **DUP-001:** The thread revisited “Ryzen fixes Ryzen; WESLEYWORK validates” multiple times. `NEEDS_REGISTRY_LOOKUP_FIRST` for any existing host-ownership or Direct Connect authority seed.
- **DUP-002:** The compact host connectivity profile resembles the previously mentioned HP-006 proposal. `NEEDS_REGISTRY_LOOKUP_FIRST` before creating a new canonical seed.
- **DUP-003:** Persistence-gate evidence may overlap with `harvest-2026-08-05-wesleydesk-connectivity-repair-v1` and prompt-cache connectivity harvests cited by the user. Cursor must run duplication preflight.

## 9. Operator friction

- **OF-001:** The operator had to repeatedly correct abstractions that were technically safe but operationally excessive.
- **OF-002:** “Can we do it from WESLEYWORK?” was answered with conditions rather than a direct yes/no ownership map.
- **OF-003:** Shared-folder ambiguity created avoidable distrust.
- **OF-004:** The system allowed a profile mismatch to survive until the final verifier stage despite successful execution evidence.
- **OF-005:** Frequent stale-handoff windows increased pressure and made interruption costly.

## 10. ROI backlog

1. **Canonical deterministic connectivity profile for RYZEN9DESK and WESLEYWORK** — highest ROI; eliminates rediscovery and path/identity mistakes.
2. **Single command/status surface for publish → accept → observe → dispatch** — reduces operator steps and freshness-window failures.
3. **Profile-declared receipt requirements** — prevents verifier logic from hardcoding unrelated checks.
4. **One-screen Direct Connect authority map** — machine ownership, normal path, break-glass path, verdict authority.
5. **Live-state cache discipline** — cached configuration plus mandatory live probes.
6. **Automatic stale-handoff republish or longer bounded freshness with nonce binding** — reduce repeated manual cycles without weakening evidence.

## 11. Do-not-advance guards

- Do not treat cached `online` or `connected` state as current truth.
- Do not use WESLEYWORK SSH repair during a Ryzen persistence proof.
- Do not let Ryzen award its own persistence verdict.
- Do not append unapproved subfolders to the shared handoff root.
- Do not require GPU evidence for storage-only profiles.
- Do not rewrite prior failed ledger entries into passes.
- Do not claim Hub publication, validation, or operational authority from this ChatGPT draft.

## 12. Seed packet candidates

```json
{
  "seedId": "IH-THREAD-DETERMINISTIC-RYZEN-CONNECTION-PROFILE-001",
  "kind": "protocol-upgrade",
  "status": "CANDIDATE",
  "title": "Deterministic RYZEN9DESK connection profile for agents",
  "retrievalQuestions": [
    "How should an agent connect to and work with RYZEN9DESK without rediscovering paths and identities?",
    "Which RYZEN9DESK connection facts may be cached and which must be live-probed?"
  ],
  "evidenceRefs": ["EVT-012", "HP-001", "HP-006"],
  "futureAgentInstructions": {
    "whenThisAppears": "Any routine agent task targeting RYZEN9DESK",
    "startAt": "Load the canonical host profile and exact shared handoff path",
    "runPreflight": "Probe runner, WSL, mount, and controller state live",
    "doNot": "Assume cached connectivity is current or silently fall back to SSH",
    "proveBeforeClaiming": "Current runner status and receipt-confirmed execution host"
  }
}
```

```json
{
  "seedId": "IH-THREAD-DIRECT-CONNECT-SINGLE-HANDOFF-ROOT-001",
  "kind": "lesson",
  "status": "CANDIDATE",
  "title": "Use one canonical Direct Connect handoff root",
  "retrievalQuestions": [
    "What is the canonical handoff folder between RYZEN9DESK and WESLEYWORK?",
    "How should directional handoff metadata be represented without nested path ambiguity?"
  ],
  "evidenceRefs": ["EVT-006", "HP-002", "OF-003"],
  "futureAgentInstructions": {
    "whenThisAppears": "A cross-host handoff path is needed",
    "startAt": "Z:\\Office\\Wes\\Direct Connect\\handoffs",
    "runPreflight": "Verify both hosts resolve the same root",
    "doNot": "Append a host subfolder unless a current authoritative runbook explicitly requires it",
    "proveBeforeClaiming": "Show the exact file path read and written"
  }
}
```

```json
{
  "seedId": "IH-THREAD-PROFILE-AWARE-RECEIPT-VERIFICATION-001",
  "kind": "failure-pattern",
  "status": "CANDIDATE",
  "title": "Receipt verifiers must enforce profile-specific evidence",
  "retrievalQuestions": [
    "Why did the Ryzen persistence gate fail even though execution succeeded?",
    "How should storage-verify and GPU profile receipt requirements differ?"
  ],
  "evidenceRefs": ["EVT-007", "EVT-008", "HP-004"],
  "futureAgentInstructions": {
    "whenThisAppears": "A bundled gate fails after the target workflow succeeded",
    "startAt": "Compare selected profile with verifier-required command keys and receipt artifact paths",
    "runPreflight": "Validate profile schema, executor receipt, and profile-specific receipt independently",
    "doNot": "Fabricate missing steps or weaken verification globally",
    "proveBeforeClaiming": "Correct executionHost and profile-specific required fields"
  }
}
```

## 13. Future-agent instructions

1. Load a compact canonical profile before any Ryzen task.
2. Treat GitHub Actions + Direct Connect as the normal control plane and SSH as break-glass only.
3. Probe runner, WSL, controller, and mounts live.
4. Use exactly `Z:\Office\Wes\Direct Connect\handoffs` unless current authority says otherwise.
5. For persistence: Ryzen publishes readiness; WESLEYWORK independently observes and awards.
6. Select receipt requirements from the dispatched profile.
7. Report only state changes; do not restate the whole protocol each turn.
8. Preserve successful and failed receipts immutably.

## 14. Publication truth table

| Layer | State |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | pending commit response at file creation time |
| L: draft staging (GitHub Action) | `not-run` |
| Cursor ingest | `not-run` |
| L: Hub catalog | `not-run` |
| Z: AI cache | `not-run` |
| Supabase projection | `not-run` |
| Freshness gate | `not-run` |

```text
Publication: NOT_RUN_BY_CURSOR
projection.hubPublishStatus: not-run
```

## 15. Acceptance checklist

- [x] OBSERVED lane, not advancement synthesis
- [x] One Markdown findings file
- [x] Event inventory
- [x] Eight packet kinds represented as applicable
- [x] Execution deltas
- [x] Waste ledger
- [x] Duplication detector
- [x] Operator friction
- [x] Ranked ROI backlog
- [x] Do-not-advance guards
- [x] Three seed candidates with retrieval questions and future-agent instructions
- [x] Publication truth footer
- [x] No secrets or credentials
- [ ] Cursor duplication preflight
- [ ] Cursor validation
- [ ] Hub publication

## 16. Next operator action

Cursor should pull `chat-gpt-harvest`, ingest this findings file, run duplication preflight, sync derived artifacts, validate the harvest and autopsy, and run harvest tests. Hub publication remains an operator action.

```bash
git checkout chat-gpt-harvest
git pull origin chat-gpt-harvest
npm run harvest:ingest-chatgpt-findings -- --input=artifacts/agent-runs/harvest-2026-08-06-ryzen9desk-deterministic-connectivity-v1/chatgpt-findings-source.md --harvest-id=harvest-2026-08-06-ryzen9desk-deterministic-connectivity-v1
npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-06-ryzen9desk-deterministic-connectivity-v1
npm run harvest:sync-derived -- harvest-2026-08-06-ryzen9desk-deterministic-connectivity-v1
npm run harvest:validate -- harvest-2026-08-06-ryzen9desk-deterministic-connectivity-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-06-ryzen9desk-deterministic-connectivity-v1
npm run test:harvest
```
