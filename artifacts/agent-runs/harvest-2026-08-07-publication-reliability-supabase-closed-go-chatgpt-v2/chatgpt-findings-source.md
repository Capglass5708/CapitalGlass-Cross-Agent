# ChatGPT Thread Closeout Autopsy Findings — Publication Reliability + Supabase CLOSED_GO

## 1. Final summary + verdict

```text
Mission: chat-thread-closeout-autopsy-harvest-chatgpt-v1
Lane: CHAT_CONTEXT_ONLY
Protocol: v2
Mode: DRAFT_FILE
Harvest ID: harvest-2026-08-07-publication-reliability-supabase-closed-go-chatgpt-v2
Start verdict: UNHARVESTED_THREAD
Target tier: T2
Artifact verdict at creation: DRAFT_READY
Closeout target: CHATGPT_SOURCE_PUBLISHED
```

This thread documents the completion and hardening of the Capital Glass harvest-publication system from Lane C verification through transactional publication, Z-mirror authority repair, Git durability, optional Supabase projection through Doppler, and a final reported `CLOSED_GO`.

The thread also contains a prior ChatGPT-harvest evaluation that exposed durable protocol-quality lessons: evidence references must be exact when visible, candidate novelty must be checked before re-proposing shipped behavior, and ChatGPT draft structures must stay aligned with canonical ingest schemas.

This artifact is OBSERVED-thread intelligence only. Repository, test, merge, publication, index, and runtime facts below are reported from the visible conversation and remain Cursor-verification candidates until canonical ingest.

---

## 2. Harvest tier rationale

**Tier:** `T2`

Why T2:

- multiple connected milestones and formal closeouts;
- multiple repositories and authority surfaces;
- production publication and Git delivery evidence;
- operator corrections about closure state;
- one formal ChatGPT harvest-quality evaluation;
- a real authority-integrity defect involving stale Z/runbook overwrite;
- an optional Supabase projection warning later eliminated;
- several durable improvements suitable for future-agent retrieval.

---

## 3. Retrieval preflight

Before Git publication:

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

ChatGPT has not run the Intelligence Hub scout, canonical harvest validators, Lane C exporter, Data-Extraction publication, index publication, freshness gate, Z synchronization, or Supabase projection in this session.

---

## 4. Thread event inventory

### EVT-001 — Lane C protocol-self-learning became operationally complete

Reported milestone:

```text
harvest-protocol-self-learning-all-spokes-verification-v1
Status: GO_WITH_WARN
```

Reported outcome:

- Cross-Agent canonical export path covered;
- Data-Extraction protocol-only lane covered;
- L retrieval catalog covered;
- PromptOps approval boundary preserved;
- Supabase not required for that Lane C closeout;
- application repositories not owners of Lane C;
- only remaining warning was the pre-existing Z-mirror source/test issue.

### EVT-002 — First ChatGPT harvest source created

Reported source:

```text
Repository: Capglass5708/CapitalGlass-Cross-Agent
Branch: chat-gpt-harvest
Commit: eba039d2f18e494d5564e0e2903295de1b8370c2
Path:
artifacts/agent-runs/
harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1/
chatgpt-findings-source.md
```

This source was intentionally draft-only and required Cursor validation.

### EVT-003 — First ChatGPT harvest formally evaluated

Reported formal verdict:

```text
DRAFT_ACCEPTED_WITH_REPAIRS
Overall score: 6.5 / 10
Source integrity: SOURCE_VALID_WITH_REPAIRS
```

Reported quality dimensions:

| Dimension | Score |
| --- | ---: |
| Thread coverage | 8 |
| Protocol-only scope | 9 |
| Evidence quality | 4 |
| Structural compliance | 7 |
| Duplication awareness | 5 |
| Candidate usefulness | 6 |
| Authority safety | 9 |
| Token efficiency | 7 |
| Ingest readiness | 5 |
| Overall | 6.5 |

Reported defects:

- descriptive `evidenceRefs` instead of exact paths, SHAs, receipts, hashes, or commands;
- invalid seed-kind / enum usage;
- `seedAs` enum violations;
- strict classifier and publication-truth behavior re-proposed although already shipped;
- duplication left as `NEEDS_REGISTRY_LOOKUP_FIRST`.

### EVT-004 — Canonical evaluation correctly filtered candidate novelty

Reported candidate disposition:

```text
HPC-002
→ ALREADY_IMPLEMENTED

HPC-003
→ ALREADY_IMPLEMENTED / documentation-only

HPC-Z-MIRROR-RUNBOOK-SYNC-001
→ ELIGIBLE_NEW
```

Durable lesson:

```text
ChatGPT proposes
→ Cursor verifies
→ duplication and implementation-state checks
→ genuinely new candidate advances
```

### EVT-005 — Lane C canonical harvest and L publication passed

Reported canonical harvest:

```text
Harvest ID:
harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1

Packets: 10
Seeds: 3
harvest:validate: PASS
harvest:validate-autopsy: PASS
duplication-preflight: PASS
```

Reported L package:

```text
L:\02-catalog\Harvest\Harvest Protocol Self Learning\
harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1\
50025ab649ed40dda0cd9086dfe6aaba3ac313dae453d409226e0f3d50d7bf0e

contentHash:
sha256:50025ab649ed40dda0cd9086dfe6aaba3ac313dae453d409226e0f3d50d7bf0e

retrieval:
RETRIEVAL_PASS

rawScanRequired:
false

authority:
PROPOSAL / RETRIEVAL_ONLY
```

### EVT-006 — Production harvest exposed Z/runbook authority regression

Reported evidence:

- Git canonical harvest protocol contained 17 Lane C references.
- stale docs/runbook source contained zero Lane C references;
- synchronization could overwrite `harvest/protocol/*` with stale content;
- Cursor had to restore protocol content from Git;
- `test:protocol-self-learning-export` failed due to the stale mirror source;
- missing source: `Data-Extraction/docs/platform/CURSOR_HARVEST_INGEST_CLOSEOUT_WAVE_SDLC_V1.md`.

This converted the Z-mirror issue from theoretical warning into verified authority-integrity risk.

### EVT-007 — Publication reliability Top-10 wave implemented

Reported milestone:

```text
harvest-publication-reliability-and-roi-hardening-v1
wave:
harvest-publication-top10-roi-hardening-wave-v1
```

Reported improvements:

1. Z-mirror authority guard
2. transactional publication
3. Git durability
4. pre-publication dry run
5. required-vs-optional gate separation
6. capability preflight
7. prompt triage
8. multi-index duplication
9. post-publication integrity
10. consolidated closeout receipt

Reported local implementation SHAs before delivery:

```text
CapitalGlass-Cross-Agent: 4b0f16c
Data-Extraction: 097708a
```

### EVT-008 — Z-mirror source gap repaired and full harvest tests turned green

Reported proof:

```text
npm run test:harvest:publication-hardening
→ PASS 6/6

npm run test:harvest
→ PASS

harvest:sync-z-mirror
→ Z_HARVEST_REPO_MIRROR_PASS

Lane C count before/after sync
→ 17 / 17
```

Data-Extraction restored:

```text
docs/platform/CURSOR_HARVEST_INGEST_CLOSEOUT_WAVE_SDLC_V1.md
```

### EVT-009 — Publication reliability delivery merged

Reported delivery:

```text
Data-Extraction PR #32
→ main@84c9b20

CapitalGlass-Cross-Agent PR #21
→ main@f06be7c
```

Reported formal state:

```text
Implementation: COMPLETE
Repository delivery: COMPLETE
Git durability: COMPLETE
Core publication: PASS
Optional Supabase: WARN_OPTIONAL_UNAVAILABLE
Formal milestone: GO_WITH_WARN — CLOSED
```

Reported post-merge state:

```text
origin parity: 0 / 0
tracked tree: clean
```

### EVT-010 — Office Admin GitHub-health intelligence published independently of source milestone closure

Reported publication:

```text
harvest:publish-hub-seed
→ PUBLISH_PASS

index:publish
→ PUBLISH_PASS

index:freshness-gate
→ PASS

post-publish retrieval
→ INDEX_HIT
```

Reported seed IDs:

- `IH-OFFICE-ADMIN-GITHUB-WORKFLOW-OAUTH-SCOPE-001`
- `IH-OFFICE-ADMIN-PR-MERGE-WITHOUT-WORKFLOW-SCOPE-001`
- `IH-OFFICE-ADMIN-WINDOWS-LATEST-RUNNER-QUEUE-001`

Reported source-milestone status remained:

```text
BLOCKED until CI passes on 62e5f28
```

Durable lesson: intelligence publication does not imply underlying implementation milestone closure.

### EVT-011 — Supabase optional projection was wired through Doppler

Reported local branch:

```text
feat/harvest-supabase-projection-improvements-v1
@ d407de5
```

Reported capability resolution order:

1. `SUPABASE_ACCESS_TOKEN` in environment
2. active Supabase CLI session
3. Doppler `cg-mcp/dev`

Reported live proof:

```text
harvest:project-supabase-optional
→ SUPABASE_PROJECTION_COMPLETE

threadAutopsy
→ THREAD_AUTOPSY_SUPABASE_PROJECTION_APPLIED
→ 1 harvest
→ 2 seeds
→ 1 publication

harvestPrompts
→ SUPABASE_PROMPT_SEED_PASS

authMethod
→ doppler
```

### EVT-012 — Supabase improvement delivered and merged

Reported PR:

```text
CapitalGlass-Cross-Agent PR #22
```

Reported implementation commits:

```text
d407de5
db9ed67
```

Reported squash merge:

```text
09caedb
```

Reported closure commit:

```text
d498d8a
```

Reported merged-main tests:

```text
npm run test:harvest:supabase-capability
→ PASS 4/4

npm run test:harvest:publication-hardening
→ PASS 7/7

npm run test:harvest
→ PASS 3/3
```

Reported parity:

```text
main...origin/main = 0 / 0
tracked tree = clean
```

### EVT-013 — Prior GO_WITH_WARN superseded by CLOSED_GO

Reported supersession:

```text
Previous verdict:
GO_WITH_WARN

Resolved warning:
WARN_OPTIONAL_SUPABASE_UNAVAILABLE

Superseding verdict:
CLOSED_GO
```

Reported receipt:

```text
artifacts/agent-runs/
harvest-supabase-projection-delivery-and-closed-go-v1/
milestone-supersession.json
```

Reported remaining work:

```text
none
```

### EVT-014 — ChatGPT harvest protocol v2 restored mandatory Git staging

The attached protocol states that v2 supersedes draft-only v1 on `main` and requires:

```text
ChatGPT thread
→ designated chatgpt-findings-source.md
→ mandatory Git staging
→ branch chat-gpt-harvest
→ commit SHA + remote verification
→ Cursor ingest / validation
```

This is already implemented protocol behavior in the attached authority and is not a new Lane C candidate.

---

## 5. Harvest packets

### HP-001 — decision: distinguish publication states

```json
{
  "packetId": "HP-001",
  "kind": "decision",
  "title": "Keep operational publication, Git durability, optional projections, and formal milestone closure distinct",
  "decision": "A harvest can be operational and Git-durable while an optional projection remains WARN; CLOSED_GO requires the chosen formal acceptance criteria, not ambiguous 'done' language.",
  "evidenceRefs": [
    "reported-milestone:harvest-publication-reliability-delivery-and-formal-closeout-v1",
    "reported-merge:Data-Extraction#32@84c9b20",
    "reported-merge:CapitalGlass-Cross-Agent#21@f06be7c",
    "reported-supersession:GO_WITH_WARN->CLOSED_GO"
  ]
}
```

### HP-002 — decision: Supabase is derived and may use Doppler runtime authority

```json
{
  "packetId": "HP-002",
  "kind": "decision",
  "title": "Use Doppler cg-mcp/dev for optional Supabase projection without changing authority",
  "decision": "Supabase projection may execute through existing Doppler credentials when available; Supabase remains a derived projection and host-level supabase login is not required.",
  "evidenceRefs": [
    "reported-branch:feat/harvest-supabase-projection-improvements-v1@d407de5",
    "reported-merge:CapitalGlass-Cross-Agent#22@09caedb",
    "reported-closure-main:d498d8a",
    "reported-receipt:artifacts/agent-runs/harvest-supabase-projection-delivery-and-closed-go-v1/projection-receipt.json"
  ]
}
```

### HP-003 — protocol-upgrade candidate: exact evidence references

```json
{
  "packetId": "HP-003",
  "kind": "protocol-upgrade",
  "title": "Require exact visible evidence references in ChatGPT harvest drafts",
  "status": "CANDIDATE",
  "noveltyStatus": "NEEDS_REGISTRY_LOOKUP_FIRST",
  "summary": "The earlier ChatGPT harvest scored 4/10 for evidence quality because descriptive labels were used where exact SHAs, PRs, paths, receipts, hashes, and commands were visible.",
  "evidenceRefs": [
    "reported-evaluation:harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1-evaluation",
    "reported-source:chat-gpt-harvest@eba039d2f18e494d5564e0e2903295de1b8370c2",
    "reported-score:evidence-quality=4/10"
  ]
}
```

### HP-004 — protocol-upgrade candidate: schema/example alignment

```json
{
  "packetId": "HP-004",
  "kind": "protocol-upgrade",
  "title": "Keep ChatGPT harvest examples aligned with canonical ingest enums",
  "status": "CANDIDATE",
  "noveltyStatus": "NEEDS_REGISTRY_LOOKUP_FIRST",
  "summary": "The earlier formal evaluation reported invalid seed kind and seedAs values. Cursor should cross-check the current v2 protocol examples against the canonical schema and repair documentation/tests if drift remains.",
  "evidenceRefs": [
    "reported-evaluation-defect:invalid seed kind / enum",
    "reported-evaluation-defect:seedAs enum violations",
    "attached-protocol-v2:seed packet rules"
  ]
}
```

### HP-005 — protocol-upgrade candidate: candidate novelty guard

```json
{
  "packetId": "HP-005",
  "kind": "protocol-upgrade",
  "title": "Prevent re-export of visibly shipped protocol behavior",
  "status": "CANDIDATE",
  "noveltyStatus": "NEEDS_REGISTRY_LOOKUP_FIRST",
  "summary": "When visible thread evidence says a behavior is merged, tested, documented, or operational, ChatGPT should flag it as possibly already implemented rather than confidently proposing it as new.",
  "evidenceRefs": [
    "reported-evaluation:HPC-002=ALREADY_IMPLEMENTED",
    "reported-evaluation:HPC-003=ALREADY_IMPLEMENTED",
    "reported-score:duplication-awareness=5/10"
  ]
}
```

### HP-006 — repeated_work: closure-state re-evaluation

```json
{
  "packetId": "HP-006",
  "kind": "repeated_work",
  "duplicateId": "DUP-CLOSURE-STATE-001",
  "firstKnownInstance": "Lane C closeout discussion",
  "priorIndexSlice": "NEEDS_REGISTRY_LOOKUP_FIRST",
  "whyMissed": "The conversation repeatedly revisited whether operational, delivered, Git-durable, optional-projection-complete, and CLOSED_GO meant the same thing.",
  "evidenceRefs": [
    "reported-closeout:harvest-protocol-self-learning-all-spokes-verification-v1",
    "reported-closeout:harvest-publication-reliability-delivery-and-formal-closeout-v1",
    "reported-closeout:harvest-supabase-projection-delivery-and-closed-go-v1"
  ]
}
```

### HP-007 — faster_path: optional projection closure

```json
{
  "packetId": "HP-007",
  "kind": "faster_path",
  "situation": "All core publication gates pass and only one optional projection warning remains",
  "whatHappened": "The system closed GO_WITH_WARN, then added a standalone Doppler-backed projection and a superseding receipt to reach CLOSED_GO.",
  "rightFirstMove": "Resolve capability through existing runtime authority, execute the derived layer independently, prove idempotency, and supersede the warning without unnecessary full republication.",
  "requiredGuard": "Do not reopen core architecture or promote the derived projection into authority.",
  "evidenceRefs": [
    "reported-command:harvest:project-supabase-optional",
    "reported-result:SUPABASE_PROJECTION_COMPLETE",
    "reported-receipt:milestone-supersession.json"
  ]
}
```

### HP-008 — blocker: Office Admin CI remains separate

```json
{
  "packetId": "HP-008",
  "kind": "blocker",
  "blockerId": "BLOCK-OFFICE-ADMIN-CI-62E5F28",
  "status": "REPORTED_OPEN",
  "proofCommandId": "Office Admin CI verification for 62e5f28",
  "evidenceRefs": [
    "reported-thread-state:Office Admin GitHub health milestone remains BLOCKED until CI passes on 62e5f28"
  ]
}
```

### HP-009 — command: standalone Supabase projection

```json
{
  "packetId": "HP-009",
  "kind": "command",
  "command": "npm run harvest:project-supabase-optional -- --harvest-id=<id> --json",
  "host": "CapitalGlass-Cross-Agent operator environment",
  "provesGate": "Optional Supabase projection can run without full republication",
  "expectedPassSignal": "SUPABASE_PROJECTION_COMPLETE with authMethod=doppler when Doppler is available"
}
```

### HP-010 — command: hardened publication

```json
{
  "packetId": "HP-010",
  "kind": "command",
  "command": "npm run harvest:publish-intelligence-full -- --harvest-id=<id> --transactional [--dry-run-only] [--allow-republish] [--skip-tests]",
  "host": "CapitalGlass-Cross-Agent operator environment",
  "provesGate": "Transactional publication, dry run, and required-vs-optional gate behavior",
  "expectedPassSignal": "DRY_RUN_PASS or final deterministic publication verdict"
}
```

### HP-011 — evidence: reported canonical Supabase closeout

```json
{
  "packetId": "HP-011",
  "kind": "evidence",
  "type": "reported-merged-closeout",
  "pathOrSha": "CapitalGlass-Cross-Agent main@d498d8a",
  "provesWhat": "Reported merged authority for Doppler-backed optional Supabase projection and superseding CLOSED_GO receipts.",
  "evidenceRefs": [
    "reported-implementation-merge:09caedb",
    "reported-closure-commit:d498d8a",
    "reported-artifact:artifacts/agent-runs/harvest-supabase-projection-delivery-and-closed-go-v1/milestone-supersession.json"
  ]
}
```

### HP-012 — lesson: intelligence publication is not source milestone closure

```json
{
  "packetId": "HP-012",
  "kind": "lesson",
  "title": "Published intelligence must preserve the source milestone's unresolved blockers",
  "summary": "The Office Admin thread intelligence was published and indexed while the underlying GitHub-health milestone remained blocked on CI. Future agents must not collapse these states.",
  "evidenceRefs": [
    "reported-publish:harvest:publish-hub-seed=PUBLISH_PASS",
    "reported-index:index:freshness-gate=PASS",
    "reported-source-status:BLOCKED until CI passes on 62e5f28"
  ]
}
```

### HP-013 — lesson: Git staging is part of ChatGPT v2 closeout

```json
{
  "packetId": "HP-013",
  "kind": "lesson",
  "title": "A ChatGPT DRAFT_FILE closeout is not published evidence until Git staging is verified",
  "summary": "Protocol v2 makes chat-gpt-harvest publication a mandatory gate and separates DRAFT_READY from CHATGPT_SOURCE_PUBLISHED.",
  "evidenceRefs": [
    "attached-protocol-v2:CHATGPT_HARVEST_GIT_GATE",
    "attached-protocol-v2:verdict truth",
    "attached-protocol-v2:mandatory Git publication"
  ]
}
```

---

## 6. Execution deltas

### ED-001 — prior ChatGPT evidence precision

**Actual:** The previous ChatGPT harvest used descriptive evidence labels and Cursor repaired them.

**Optimal:** Use exact visible PRs, SHAs, artifact paths, hashes, receipt paths, and command results wherever the thread provides them; retain `reported-` semantics until Cursor verifies.

**Expected impact:** Higher ingest readiness and lower operator verification time.

### ED-002 — prior candidate novelty

**Actual:** Already-shipped strict classifier and publication truth were proposed as new.

**Optimal:** Use `NEEDS_REGISTRY_LOOKUP_FIRST` or an equivalent draft uncertainty state whenever visible thread evidence suggests prior implementation.

**Expected impact:** Fewer duplicate Lane C candidates.

### ED-003 — prior schema normalization

**Actual:** The formal evaluation reported invalid seed kind / `seedAs` values.

**Optimal:** Documentation examples and canary fixtures should be checked against current canonical schemas.

**Expected impact:** Less repair work during ingest.

### ED-004 — Z mirror integrity

**Actual:** A stale runbook source could overwrite Git canonical protocol content.

**Optimal:** Git-owned protocol content is protected; mirror synchronization fails closed on stale/incomplete sources and tests cannot mutate canonical tracked files as an incidental side effect.

**Reported result:** Implemented and full `test:harvest` later passed.

### ED-005 — optional Supabase projection

**Actual:** Initial closeout carried `WARN_OPTIONAL_SUPABASE_UNAVAILABLE`.

**Optimal:** Resolve capability via env, CLI session, or Doppler; project independently; prove idempotency; supersede warning.

**Reported result:** Implemented, merged, and used to reach `CLOSED_GO`.

---

## 7. Waste ledger

### TW-001 — evidence repair

- **Type:** verification
- **Description:** Cursor had to repair vague ChatGPT evidence references.
- **Evidence:** reported evidence-quality score `4/10`.
- **Estimated impact:** high
- **Saved by:** exact-evidence draft rules.
- **ROI rank:** 1

### TW-002 — duplicate candidate review

- **Type:** context
- **Description:** Already-implemented protocol behavior was proposed again.
- **Evidence:** reported `HPC-002` and `HPC-003` dispositions.
- **Estimated impact:** medium
- **Saved by:** candidate novelty + registry lookup.
- **ROI rank:** 2

### TW-003 — schema repair

- **Type:** verification
- **Description:** Draft enum mismatch required normalization.
- **Evidence:** formal evaluation defects.
- **Estimated impact:** medium
- **Saved by:** schema-aligned protocol examples and canaries.
- **ROI rank:** 3

### TW-004 — closure-state ambiguity

- **Type:** operator_attention
- **Description:** Multiple turns distinguished implementation complete, delivery complete, GO_WITH_WARN, and CLOSED_GO.
- **Evidence:** three successive formal closeouts.
- **Estimated impact:** medium
- **Saved by:** consolidated receipt and supersession model.
- **ROI rank:** 4

### TW-005 — host-auth assumption

- **Type:** environment
- **Description:** Supabase was initially treated as unavailable because host login/token was absent, despite estate credentials being available through Doppler.
- **Evidence:** later Doppler capability implementation and live proof.
- **Estimated impact:** medium
- **Saved by:** capability resolver with multiple auth methods.
- **ROI rank:** 5

---

## 8. Duplication detector

### DUP-001 — strict classifier

Visible-thread disposition:

```text
ALREADY_IMPLEMENTED
```

Do not export as a new Lane C proposal without contradictory current repository evidence.

### DUP-002 — Lane C publication truth

Visible-thread disposition:

```text
ALREADY_IMPLEMENTED / DOCUMENTATION_ONLY
```

Cursor must verify registry state before any new seed.

### DUP-003 — top-10 publication reliability hardening

Visible thread reports all ten items implemented and merged via Cross-Agent PR #21.

```text
NEEDS_REGISTRY_LOOKUP_FIRST
```

A future candidate should be a superseding improvement, not a duplicate statement of the implemented Top-10.

### DUP-004 — Doppler-backed Supabase projection

Visible thread reports implementation merge `09caedb` and closure commit `d498d8a`.

```text
NEEDS_REGISTRY_LOOKUP_FIRST
```

Do not create a new capability seed unless the canonical registry lacks the implementation evidence.

### DUP-005 — prior ChatGPT autopsy artifact

A previous local ChatGPT artifact was created for substantially the same conversation under the earlier draft-only protocol:

```text
harvest-2026-08-07-publication-reliability-supabase-closed-go-chatgpt-v1
```

This v2 artifact should be treated as a **superseding Git-staged source candidate**, not blindly published alongside the earlier draft. Cursor must resolve whether the earlier artifact exists in the canonical registry.

---

## 9. Operator friction

### OF-001 — closure terminology

**Observed:** Repeated questions and corrections around whether the milestone was truly closed.

**Reported system improvement:** deterministic required/optional gates, Git durability, consolidated receipts, and supersession receipts.

### OF-002 — Git staging expectation for ChatGPT

**Observed:** Earlier ChatGPT protocol behavior could stop at a local/downloadable draft.

**Current v2 protocol:** `DRAFT_FILE` requires designated artifact publication to `chat-gpt-harvest` and remote verification before `CHATGPT_SOURCE_PUBLISHED`.

### OF-003 — Supabase host authentication

**Observed:** Host-level Supabase login was treated as the missing condition.

**Reported system improvement:** use Doppler `cg-mcp/dev` when available, without exposing secret values.

### OF-004 — source milestone vs harvested intelligence

**Observed:** Office Admin intelligence was published while source CI remained blocked.

**Required agent behavior:** always preserve source milestone state in harvested intelligence.

---

## 10. ROI backlog

1. **P0 — Verify whether exact-evidence rules from the prior ChatGPT evaluation are already implemented in current canonical protocol/schema.**
2. **P0 — Verify current ChatGPT protocol seed/packet examples against canonical ingest enums; repair only if drift remains.**
3. **P1 — Verify a candidate-novelty guard exists so visibly shipped behavior is not re-exported as new.**
4. **P1 — Add/verify an ingest canary proving a v2 ChatGPT artifact reaches canonical ingest without avoidable enum repair.**
5. **P1 — Ensure implementation evidence is indexed so duplicate/already-implemented classification is cheap.**
6. **P2 — Standardize retrieval of supersession receipts (`GO_WITH_WARN → CLOSED_GO`).**
7. **P2 — Reuse the standalone derived-projection pattern for other optional projections only where authority policy permits.**
8. **P2 — Ensure source milestone blockers remain linked when thread intelligence is published independently.**

---

## 11. Do-not-advance guards

- Do not treat this ChatGPT artifact as canonical harvest truth.
- Do not claim `HARVEST_COMPLETE`, `OPERATIONAL`, `FULLY_SEEDED`, or `INDEX_HIT`.
- Do not merge this artifact directly to `main`.
- Do not edit canonical protocol, schema, scripts, manifests, indexes, or application code from ChatGPT.
- Do not publish to L Hub, Z, Supabase canonical state, or Lane C from ChatGPT.
- Do not auto-approve PromptOps candidates.
- Do not auto-merge protocol changes.
- Do not auto-promote to Z.
- Do not re-propose strict classifier or publication truth as new without registry evidence.
- Do not treat Supabase as authoritative.
- Do not require host-level Supabase login when current authority provides Doppler credentials.
- Do not log secrets.
- Do not treat Office Admin intelligence publication as proof its CI blocker is closed.
- Do not publish this v2 artifact as a duplicate if the earlier v1 artifact has already been canonically ingested; resolve duplication first.

---

## 12. Seed packet candidates

### Seed candidate 1 — exact evidence references

```json
{
  "seedId": "IH-THREAD-CHATGPT-EXACT-EVIDENCE-REFS-002",
  "kind": "protocol-upgrade",
  "title": "Require exact visible evidence references in ChatGPT harvest drafts",
  "retrievalQuestions": [
    "Why did the earlier ChatGPT harvest score poorly on evidence quality?",
    "What evidence should ChatGPT include before Cursor validation?"
  ],
  "evidenceRefs": [
    "reported-evaluation:harvest-2026-08-06-harvest-protocol-self-learning-lane-c-v1-evaluation",
    "reported-source:chat-gpt-harvest@eba039d2f18e494d5564e0e2903295de1b8370c2",
    "reported-score:evidence-quality=4/10"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A ChatGPT harvest asserts implementation, publication, test, merge, or authority state",
    "startAt": [
      "visible PR/merge SHA",
      "artifact/receipt path",
      "content hash",
      "command/result",
      "explicit thread event"
    ],
    "runPreflight": [
      "harvest:duplication-preflight",
      "harvest:validate"
    ],
    "doNot": [
      "Invent evidence",
      "Use a descriptive label as the only reference when exact evidence is visible"
    ],
    "proveBeforeClaiming": [
      "exact reference resolves or remains explicitly unverified"
    ]
  },
  "status": "CANDIDATE"
}
```

### Seed candidate 2 — protocol/schema example alignment

```json
{
  "seedId": "IH-THREAD-CHATGPT-SCHEMA-ALIGNMENT-002",
  "kind": "protocol-upgrade",
  "title": "Cross-check ChatGPT harvest protocol examples against canonical schema",
  "retrievalQuestions": [
    "Why did an earlier ChatGPT harvest require enum repair?",
    "How should ChatGPT protocol examples stay synchronized with canonical ingest schemas?"
  ],
  "evidenceRefs": [
    "reported-evaluation-defect:invalid seed kind / enum",
    "reported-evaluation-defect:seedAs enum violations",
    "attached-protocol-v2:seed packet rules"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "ChatGPT harvest documentation names seed, packet, or promotion enums",
    "startAt": [
      "canonical harvest schemas",
      "current ChatGPT protocol examples",
      "current ingest tests"
    ],
    "runPreflight": [
      "schema validation",
      "protocol documentation tests"
    ],
    "doNot": [
      "Change canonical schema merely to fit stale documentation",
      "Silently coerce unsupported values"
    ],
    "proveBeforeClaiming": [
      "protocol canary validates against current canonical schema"
    ]
  },
  "status": "CANDIDATE"
}
```

### Seed candidate 3 — candidate novelty guard

```json
{
  "seedId": "IH-THREAD-CHATGPT-CANDIDATE-NOVELTY-002",
  "kind": "protocol-upgrade",
  "title": "Prevent ChatGPT from re-proposing visibly shipped protocol behavior",
  "retrievalQuestions": [
    "Why were already-implemented protocol behaviors previously proposed as new?",
    "How should ChatGPT label a candidate when the visible thread reports it already shipped?"
  ],
  "evidenceRefs": [
    "reported-evaluation:HPC-002=ALREADY_IMPLEMENTED",
    "reported-evaluation:HPC-003=ALREADY_IMPLEMENTED",
    "reported-score:duplication-awareness=5/10"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A proposed improvement has visible merge, test, documentation, or operational evidence",
    "startAt": [
      "visible implementation evidence",
      "candidate registry",
      "prior harvest indexes"
    ],
    "runPreflight": [
      "harvest:duplication-preflight",
      "implementation-state verification"
    ],
    "doNot": [
      "Call visibly shipped behavior new",
      "Create duplicate candidate IDs before registry lookup"
    ],
    "proveBeforeClaiming": [
      "final novelty classification from Cursor"
    ]
  },
  "status": "CANDIDATE"
}
```

---

## 13. Future-agent instructions

1. Pull this source from `chat-gpt-harvest` only after verifying its commit SHA.
2. Treat all repository/runtime claims as reported until cross-checked.
3. Start verification from the reported merged closeout artifacts, not broad raw scanning.
4. Verify `d498d8a`, `09caedb`, `f06be7c`, and `84c9b20` before treating them as current historical evidence.
5. Run duplication preflight before accepting the three protocol-upgrade candidates.
6. Check whether the v2 ChatGPT protocol already implements exact-evidence and novelty safeguards before proposing patches.
7. Preserve the publication reliability pattern: capability preflight; dry run; transactional publication; required-vs-optional gates; post-publication integrity; Git durability; superseding receipts.
8. Preserve Supabase as a derived projection.
9. Keep Office Admin CI status separate from the successfully published intelligence.
10. Resolve `DUP-005` before deciding whether this v2 artifact supersedes, duplicates, or supplements the earlier v1 local artifact.

---

## 14. Publication truth table

| Layer | State (at artifact creation) |
| --- | --- |
| Git draft (`chat-gpt-harvest`) | `pending CHATGPT_HARVEST_GIT_GATE` |
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

---

## 15. Git publication receipt

The authoritative `gitPublicationReceipt` is emitted by ChatGPT in the chat response **after** the remote Git gate passes. This artifact is intentionally created before its own commit SHA exists.

Expected gate:

```text
Repo: Capglass5708/CapitalGlass-Cross-Agent
Branch: chat-gpt-harvest
Artifact:
artifacts/agent-runs/
harvest-2026-08-07-publication-reliability-supabase-closed-go-chatgpt-v2/
chatgpt-findings-source.md
```

---

## 16. Cursor handoff command

After ChatGPT reports `CHATGPT_SOURCE_PUBLISHED` and provides the verified SHA:

```bash
git fetch origin chat-gpt-harvest
git checkout chat-gpt-harvest
git pull --ff-only origin chat-gpt-harvest

npm run harvest:ingest-chatgpt-findings -- \
  --input=artifacts/agent-runs/harvest-2026-08-07-publication-reliability-supabase-closed-go-chatgpt-v2/chatgpt-findings-source.md \
  --harvest-id=harvest-2026-08-07-publication-reliability-supabase-closed-go-chatgpt-v2

npm run harvest:duplication-preflight -- \
  --harvest-id=harvest-2026-08-07-publication-reliability-supabase-closed-go-chatgpt-v2

npm run harvest:sync-derived -- \
  harvest-2026-08-07-publication-reliability-supabase-closed-go-chatgpt-v2

npm run harvest:validate -- \
  harvest-2026-08-07-publication-reliability-supabase-closed-go-chatgpt-v2

npm run harvest:validate-autopsy -- \
  --harvest-id=harvest-2026-08-07-publication-reliability-supabase-closed-go-chatgpt-v2

npm run test:harvest

# operator, only after validation:
npm run harvest:publish-intelligence-full -- \
  --harvest-id=harvest-2026-08-07-publication-reliability-supabase-closed-go-chatgpt-v2
```

Cursor must classify the three draft protocol candidates as one of:

```text
NEW
ALREADY_IMPLEMENTED
DUPLICATE
SUPERSEDED
DOCUMENTATION_ONLY
BLOCKED_UNVERIFIED
```

before any Lane C export.
