# Chat Thread Autopsy Findings — Railway MCP Reconnect v1

**Mission:** `chat-thread-closeout-autopsy-harvest-chatgpt-v1`  
**Lane:** `CHAT_CONTEXT_ONLY`  
**Mode:** `DRAFT_FILE`  
**Start verdict:** `UNHARVESTED_THREAD`  
**Target tier:** `T2`  
**Output verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

---

## 1. Final summary

This thread closed a Railway authentication and MCP reconnect incident on `CG-RYZEN9DESK-01`.

The thread began with repeated Railway authentication failures across three stored 36-character token candidates:

- `cg-shared`
- `cg-mcp`
- `cg-documents`

Observed failures included:

- `valid_test=FAIL`
- `graphql:FAIL`
- `Not Authorized`
- `Invalid RAILWAY_API_TOKEN`

The initial diagnosis focused on distinguishing `RAILWAY_API_TOKEN` from `RAILWAY_TOKEN` and identifying that the restart alone had not changed the credential state.

The final operator-provided verification established:

- Railway authentication fixed
- `whoami` returned `wesley@capitalglasstx.com`
- Railway listed six accessible projects
- Doppler authentication succeeded for the Capital Glass Suite workplace
- all `26/26` MCPs were live and working
- canonical MCP secrets were located at `E:\Admin Keys\MCP\integrations.env`
- the bootstrap refresh command was:
  `cd ~/repos/CG-AppBuilder-MCP && npm run wsl:admin-keys-mcp:bootstrap`
- MCP reconnect was complete on `CG-RYZEN9DESK-01`
- retrieval reported `INDEX_MISS` for the verification session

No repo, deployment, publication, index, or harvest validation command was executed by ChatGPT.

**Final harvest verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`

---

## 2. Harvest verdict + tier rationale

### Verdict

`DRAFT_READY_FOR_CURSOR_VALIDATION`

### Tier

`T2`

### Rationale

This thread qualifies for T2 because it contains:

- a live authentication failure
- repeated restart/retest cycles
- a correction from an initial credential diagnosis to a verified working state
- a durable secret-store location
- a reusable bootstrap command
- a complete multi-MCP verification result
- a retrieval-status caveat that must not be confused with MCP connectivity

The thread has durable operational value, but ChatGPT cannot verify the code, secret-store implementation, Doppler synchronization, MCP process state, or final index state.

---

## 3. Retrieval preflight

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

The operator later reported `Retrieval: INDEX_MISS (MCP verification session)`. That is thread evidence only and must be treated as unverified until Cursor checks the relevant retrieval/index receipts.

---

## 4. Thread event inventory

### EVT-001 — Restart followed by Railway auth failure

The operator restarted the stack and reported the Railway environment variables were present, but all three candidate secrets failed validation.

Evidence:

```text
cg-shared len=36 valid_test=FAIL
cg-mcp len=36 valid_test=FAIL
cg-documents len=36 valid_test=FAIL
graphql:FAIL
Not Authorized
```

### EVT-002 — Token-variable mismatch identified

The thread identified a distinction between account-level authentication and project-scoped authentication:

- account/workspace auth expected `RAILWAY_API_TOKEN`
- project-scoped auth used `RAILWAY_TOKEN`

The launcher was described as having mapped account tokens to the wrong variable.

This was a diagnosis from the visible thread, not code-verified evidence.

### EVT-003 — Restart did not resolve stale credential state

A second restart produced the same visible failure pattern. The thread concluded that restart alone could not repair invalid or stale secrets.

### EVT-004 — New credential verification succeeded

The operator later reported:

```text
whoami
wesley@capitalglasstx.com
```

and:

```text
list_projects
6 projects
```

This marked Railway authentication as fixed.

### EVT-005 — Doppler verification succeeded

The operator reported Doppler authentication as healthy for the Capital Glass Suite workplace.

### EVT-006 — Full MCP stack verification passed

The operator reported `26/26 MCPs are live and working`.

The verified categories reported in-chat were:

- suite core
- seven app spokes
- integrations
- data/platform services
- plugins

### EVT-007 — Canonical credential-store location identified

The thread recorded:

```text
E:\Admin Keys\MCP\integrations.env
```

as the canonical MCP secrets store, synced from Doppler and Windows.

### EVT-008 — Refresh command established

The thread recorded the reusable command:

```bash
cd ~/repos/CG-AppBuilder-MCP
npm run wsl:admin-keys-mcp:bootstrap
```

### EVT-009 — Reconnect closed

The operator stated:

```text
MCP reconnect is complete on CG-RYZEN9DESK-01.
```

### EVT-010 — Retrieval caveat remained

The operator reported:

```text
Retrieval: INDEX_MISS (MCP verification session)
```

This did not invalidate MCP authentication or connectivity, but it remains a distinct retrieval-layer condition.

---

## 5. Harvest packets

## HP-001 — Failure pattern

**Kind:** `failure-pattern`  
**Title:** Restart cannot repair invalid Railway credential material

### Pattern

A restart may successfully reload the launcher and environment but still reproduce identical authorization failures when the underlying token is invalid, stale, incorrectly scoped, or loaded from the wrong secret source.

### Evidence

- three token candidates had identical lengths
- all three failed the same validation
- GraphQL returned `Not Authorized`
- a second restart did not change the result

### Durable lesson

Separate process reload success from credential validity. Authentication must be proven with an authoritative identity or project-list call.

---

## HP-002 — Protocol upgrade

**Kind:** `protocol-upgrade`  
**Title:** Railway auth verification must include identity and resource access

### Proposed verification sequence

1. Confirm exactly one intended Railway token mode is active.
2. Run an identity check.
3. Run a resource listing check.
4. Verify the target project or service is visible.
5. Only then restart or reconnect the dependent MCP.
6. Record the credential source without printing the credential.

### Minimum proof

- successful `whoami`
- successful project listing
- successful MCP reconnect
- no secret value exposed

---

## HP-003 — Architecture decision candidate

**Kind:** `architecture-decision-candidate`  
**Title:** Canonical MCP secret source on CG-RYZEN9DESK-01

### Candidate decision

Use:

```text
E:\Admin Keys\MCP\integrations.env
```

as the canonical local MCP integration secret file, synchronized from Doppler and Windows, and refreshed into WSL through the AppBuilder bootstrap command.

### Validation needed

Cursor must verify:

- source-generation script
- direction of synchronization
- overwrite behavior
- secret precedence
- handling of stale entries
- whether this path is authoritative or only a local generated projection

---

## HP-004 — Reusable operator command

**Kind:** `operator-runbook`  
**Title:** WSL MCP credential bootstrap

```bash
cd ~/repos/CG-AppBuilder-MCP
npm run wsl:admin-keys-mcp:bootstrap
```

### Intended result

Refresh the WSL-visible MCP credential environment from the canonical administrative key store.

### Guard

Do not claim the command succeeded without fresh output and downstream auth verification.

---

## HP-005 — Verification milestone

**Kind:** `milestone`  
**Title:** 26/26 MCP reconnect verification

### Reported pass set

#### Suite core

- `cg-app-mcp`
- `cg-diagnostic`
- `cg-suite-wiring`
- `office-admin-mcp`
- `failure-intelligence-mcp`
- `agent-loop`

#### App spokes

- contacts
- hub
- PO
- calendar
- email
- document-center
- proposal-generator

#### Integrations

- GitHub
- Railway
- Doppler
- Azure
- SharePoint
- Cloudflare via stdio and HTTP

#### Data/platform

- Supabase ×2
- Cloudflare HTTP ×5

#### Plugins

- Resend
- Vercel
- Supabase

### Validation needed

Cursor should locate the verification receipt or rerun the canonical health command before publishing this milestone.

---

## HP-006 — Retrieval-layer distinction

**Kind:** `lesson`  
**Title:** MCP connectivity and retrieval indexing are separate health dimensions

### Observation

The thread ended with all MCPs live while retrieval still reported `INDEX_MISS`.

### Lesson

Do not downgrade an otherwise valid MCP reconnect because an independent retrieval session lacks an index hit. Record both states separately.

### Guard

Do not convert `INDEX_MISS` into:

- MCP failure
- credential failure
- deployment failure
- stale launcher failure

without additional evidence.

---

## HP-007 — Security lesson

**Kind:** `security-lesson`  
**Title:** Validate secrets without exposing secret values

### Safe evidence

- token length
- variable presence
- identity call result
- accessible project count
- secret-source path
- auth-mode selection

### Unsafe evidence

- raw token values
- copied environment dumps containing credentials
- shell history containing embedded secrets
- screenshots that expose secret material

---

## HP-008 — Repeated-work detector

**Kind:** `repeated_work`  
**Title:** Repeated restart before authoritative token proof

**Status:** `NEEDS_REGISTRY_LOOKUP_FIRST`

### Repeated behavior

The stack was restarted more than once while the same rejected credential candidates remained in use.

### Improvement

Move token proof before restart in the incident flow:

```text
secret source → token-mode check → authoritative auth test → MCP restart → full-stack verification
```

---

## 6. Execution deltas

## ED-001 — Actual vs optimal diagnosis order

### Actual

1. Restart
2. inspect failures
3. adjust token-variable mapping
4. restart/retest
5. determine stored tokens still invalid
6. replace/fix credential
7. verify full stack

### Optimal

1. identify canonical secret source
2. identify intended Railway auth mode
3. validate token directly with authoritative identity/resource calls
4. repair secret source
5. bootstrap WSL environment
6. restart MCPs
7. verify all 26 MCPs
8. record retrieval state separately

### Delta

The thread spent an extra restart cycle before authoritative token verification was completed.

---

## ED-002 — Credential-source ambiguity

### Actual

Multiple named secret candidates were tested:

- `cg-shared`
- `cg-mcp`
- `cg-documents`

### Optimal

The canonical file and precedence chain should be identified first, then only the active Railway credential should be validated.

### Delta

The early troubleshooting path focused on candidate values rather than proving which source the launcher actually consumed.

---

## ED-003 — Verification completeness improved at closeout

### Actual early proof

- environment variables shown
- token length shown
- GraphQL failure shown

### Actual final proof

- Railway identity
- project listing
- Doppler auth
- full MCP count
- named MCP categories
- canonical secret path
- refresh command
- reconnect completion

### Assessment

The final verification was substantially stronger than the initial evidence.

---

## 7. Waste ledger

## TW-001 — Duplicate restart with unchanged rejected credentials

### Waste

A second restart was performed before proving that a new valid credential had replaced the rejected credential material.

### Cost

- repeated failure output
- extra operator attention
- risk of misclassifying launcher health as credential health
- unnecessary restart cycle

### Prevention

Require `whoami` and resource-list proof before dependent MCP restart.

---

## TW-002 — Repeated explanation after unchanged output

### Waste

The same failure state was explained twice with only minor wording differences.

### Prevention

On identical repeated output, switch from diagnosis prose to a compact state-transition checklist:

```text
UNCHANGED:
- launcher restarted
- token rejected
NEXT REQUIRED PROOF:
- new token identity passes
```

---

## TW-003 — Potential token-type overfocus

### Waste risk

The thread focused heavily on token variable naming. Although relevant, identical `Not Authorized` responses across all candidate secrets also indicated the underlying secret values or secret source could be stale or invalid.

### Prevention

Treat token type, token validity, and secret-source precedence as three separate checks.

---

## 8. Duplication detector

## DUP-001 — Repeated Railway auth diagnosis

The same auth failure evidence appeared twice in the visible thread.

**Classification:** repeated troubleshooting within the same incident  
**Action:** consolidate into one failure-pattern seed  
**Status:** `NEEDS_REGISTRY_LOOKUP_FIRST`

## DUP-002 — Existing MCP reconnect or admin-key bootstrap documentation may already exist

The command:

```bash
npm run wsl:admin-keys-mcp:bootstrap
```

appears designed as an established runbook command rather than a new discovery.

**Action:** Cursor must search existing:

- application Bible
- runbooks
- failure intelligence
- MCP setup docs
- cross-agent harvest registry

before creating a new seed.

## DUP-003 — Canonical secret-store policy may already be documented

The reported path:

```text
E:\Admin Keys\MCP\integrations.env
```

may already exist in infrastructure or credential-governance documentation.

**Action:** do not publish a new architecture decision until registry lookup confirms no existing canonical rule.

---

## 9. Operator friction

## OF-001 — Restart produced no state change

The operator had to restart and re-report the same failure output before the credential issue was fully isolated.

## OF-002 — Ambiguous token variable semantics

The presence of both `RAILWAY_TOKEN` and `RAILWAY_API_TOKEN` semantics created avoidable uncertainty.

## OF-003 — Multiple candidate secret names

The names `cg-shared`, `cg-mcp`, and `cg-documents` did not make the active Railway credential source obvious.

## OF-004 — Retrieval status could be misread

`INDEX_MISS` appeared after the stack was declared healthy and could be mistaken for a failed reconnect unless explicitly separated.

## OF-005 — No visible canonical receipt path in the final report

The final operator report was strong but did not include a file path to a machine-readable verification receipt.

---

## 10. ROI backlog

### ROI-1 — Add a pre-restart Railway auth gate

Create or strengthen a command that:

- detects active auth mode
- confirms only the intended token variable is present
- runs identity validation
- runs project visibility validation
- fails before MCP restart when auth is invalid

**Expected value:** eliminates restart loops and shortens incident diagnosis.

### ROI-2 — Add canonical secret-source and precedence reporting

The bootstrap should report, without exposing secrets:

- source file
- selected secret key
- destination environment
- auth mode
- token fingerprint or hash prefix
- last sync timestamp
- whether a stale value was replaced

**Expected value:** removes ambiguity about what value the launcher actually consumed.

### ROI-3 — Emit a machine-readable full-stack receipt

The 26/26 verification should write a JSON receipt containing:

- host
- timestamp
- Railway identity
- accessible project count
- Doppler auth state
- each MCP name and transport
- pass/fail state
- retrieval state
- secret-source path
- zero secret values

**Expected value:** supports future closeout, drift detection, and harvest validation.

### ROI-4 — Split stack health from retrieval health

Provide separate top-level verdicts:

```json
{
  "mcpConnectivity": "PASS",
  "credentialHealth": "PASS",
  "retrievalIndex": "INDEX_MISS"
}
```

**Expected value:** prevents healthy MCP status from being conflated with retrieval misses.

### ROI-5 — Add stale-credential detection

Compare a non-secret token fingerprint between:

- Doppler source
- Windows canonical file
- WSL environment
- running MCP process

**Expected value:** identifies stale sync or launcher inheritance immediately.

### ROI-6 — Improve operator output

Replace repeated raw failures with a compact decision table:

| Layer | Result | Next action |
| --- | --- | --- |
| Secret source | unknown/stale | verify canonical source |
| Railway identity | fail | rotate or resync token |
| Project access | not-run | run after identity |
| MCP restart | premature | defer |
| Retrieval | independent | evaluate separately |

---

## 11. Do-not-advance guards

1. Do not claim `HARVEST_COMPLETE`.
2. Do not claim `OPERATIONAL` from ChatGPT.
3. Do not claim `FULLY_SEEDED`.
4. Do not claim `INDEX_HIT`.
5. Do not publish a new secret-authority decision before registry lookup.
6. Do not expose raw credential values in receipts or logs.
7. Do not treat token length as proof of token validity.
8. Do not restart MCPs as the first response to an authorization failure.
9. Do not interpret `INDEX_MISS` as MCP failure without retrieval-layer evidence.
10. Do not claim the `26/26` state is current beyond the operator-reported verification session without a fresh run.

---

## 12. Seed packet candidates

### Seed candidate 1

```json
{
  "seedId": "IH-THREAD-RAILWAY-AUTH-PRE-RESTART-GATE-V1",
  "kind": "protocol-upgrade",
  "title": "Prove Railway authentication before restarting MCP services",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Why does restarting the Railway MCP not fix Not Authorized errors?",
    "What checks must pass before reconnecting Railway-dependent MCP services?",
    "How should RAILWAY_API_TOKEN and RAILWAY_TOKEN modes be validated?"
  ],
  "evidenceRefs": [
    "EVT-001",
    "EVT-002",
    "EVT-003",
    "EVT-004",
    "TW-001"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "Railway returns Not Authorized, Invalid RAILWAY_API_TOKEN, or graphql auth failure",
    "startAt": "Identify canonical secret source and intended auth mode",
    "runPreflight": [
      "verify active token variable",
      "run Railway identity check",
      "run project visibility check"
    ],
    "doNot": [
      "restart MCPs before direct auth proof",
      "print raw token values",
      "treat token length as validity proof"
    ],
    "proveBeforeClaiming": [
      "Railway identity succeeds",
      "expected projects are visible",
      "dependent MCP health check passes"
    ]
  }
}
```

### Seed candidate 2

```json
{
  "seedId": "IH-THREAD-MCP-CREDENTIAL-SOURCE-PRECEDENCE-V1",
  "kind": "failure-pattern",
  "title": "MCP launcher may reload stale credentials from an unexpected source",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Which file is the canonical MCP credential source on CG-RYZEN9DESK-01?",
    "How can an agent prove which Railway token the MCP launcher consumed?",
    "How are Doppler, Windows, the admin-key file, and WSL synchronized?"
  ],
  "evidenceRefs": [
    "EVT-001",
    "EVT-007",
    "EVT-008",
    "ED-002"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A restart reproduces the same authentication failure after a secret change",
    "startAt": "Trace secret precedence from source to running process",
    "runPreflight": [
      "report canonical source path",
      "compare non-secret fingerprints",
      "report last sync time",
      "confirm process environment refresh"
    ],
    "doNot": [
      "assume the edited secret is the consumed secret",
      "copy tokens into chat or logs",
      "rotate unrelated credentials"
    ],
    "proveBeforeClaiming": [
      "source and destination fingerprints match",
      "running process inherited refreshed environment",
      "authoritative API call succeeds"
    ]
  }
}
```

### Seed candidate 3

```json
{
  "seedId": "IH-THREAD-MCP-VS-RETRIEVAL-HEALTH-SEPARATION-V1",
  "kind": "lesson",
  "title": "Separate MCP connectivity from retrieval index state",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "Can all MCPs be healthy while retrieval reports INDEX_MISS?",
    "How should MCP health and retrieval health be represented in closeout receipts?",
    "What does INDEX_MISS prove and not prove?"
  ],
  "evidenceRefs": [
    "EVT-006",
    "EVT-009",
    "EVT-010",
    "HP-006"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "A stack verification passes but retrieval returns INDEX_MISS",
    "startAt": "Record connectivity and retrieval as separate verdicts",
    "runPreflight": [
      "verify MCP transport health",
      "verify credential health",
      "inspect retrieval/index receipt independently"
    ],
    "doNot": [
      "downgrade MCP connectivity solely because of INDEX_MISS",
      "claim INDEX_HIT without executing the index command",
      "merge retrieval and launcher failures into one diagnosis"
    ],
    "proveBeforeClaiming": [
      "all named MCPs respond",
      "retrieval command output is captured separately",
      "closeout receipt contains independent fields"
    ]
  }
}
```

### Seed candidate 4

```json
{
  "seedId": "IH-THREAD-MCP-FULL-STACK-RECEIPT-V1",
  "kind": "operator-runbook",
  "title": "Generate a machine-readable 26-MCP verification receipt",
  "status": "CANDIDATE",
  "retrievalQuestions": [
    "How was the 26/26 MCP verification performed on CG-RYZEN9DESK-01?",
    "Where is the latest MCP reconnect receipt?",
    "Which MCPs and transports were included in the full-stack check?"
  ],
  "evidenceRefs": [
    "EVT-006",
    "EVT-007",
    "EVT-008",
    "ROI-3"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "An operator reports all MCPs are live after reconnect or credential repair",
    "startAt": "Run the canonical full-stack health command and capture machine-readable output",
    "runPreflight": [
      "record host and timestamp",
      "record each MCP and transport",
      "record auth dependencies",
      "record retrieval state separately"
    ],
    "doNot": [
      "publish only prose without a receipt",
      "include secret values",
      "claim current health from an old session"
    ],
    "proveBeforeClaiming": [
      "receipt exists",
      "all expected MCPs are enumerated",
      "pass count matches expected count",
      "receipt is fresh"
    ]
  }
}
```

---

## 13. Future-agent instructions

When Railway authentication fails:

1. Stop treating restart as the primary repair.
2. Identify the exact canonical secret source.
3. Determine whether the operation requires account/workspace auth or project-scoped auth.
4. Confirm the intended token variable.
5. Verify the credential directly using identity and resource-access calls.
6. Bootstrap the WSL environment.
7. Restart only after direct authentication succeeds.
8. Verify the complete MCP stack.
9. Record retrieval/index state separately.
10. Produce a machine-readable receipt.
11. Search the harvest registry before creating new failure-pattern or runbook seeds.
12. Never expose credential values.

When this specific host is involved:

```text
Host: CG-RYZEN9DESK-01
Reported canonical secret path: E:\Admin Keys\MCP\integrations.env
Reported refresh command:
cd ~/repos/CG-AppBuilder-MCP
npm run wsl:admin-keys-mcp:bootstrap
```

Treat both path and command as thread-derived evidence pending Cursor verification.

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

- [x] Mode declared
- [x] Mission and lane declared
- [x] Start verdict declared
- [x] Output verdict is allowed for ChatGPT
- [x] Retrieval preflight uses `INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT`
- [x] Thread event inventory included
- [x] Eight harvest packet kinds represented as applicable
- [x] Execution deltas included
- [x] Waste ledger included
- [x] Duplication detector included
- [x] Operator friction included
- [x] ROI backlog ranked
- [x] Do-not-advance guards included
- [x] At least one seed per ROI top-three
- [x] Each seed has at least two retrieval questions
- [x] Each seed has evidence references
- [x] Each seed status is `CANDIDATE`
- [x] Future-agent instructions included
- [x] Publication truth table set to all `not-run`
- [x] No claim of `HARVEST_COMPLETE`
- [x] No claim of `OPERATIONAL`
- [x] No claim of `FULLY_SEEDED`
- [x] No claim of `INDEX_HIT`
- [ ] Cursor duplication preflight
- [ ] Cursor derived sync
- [ ] Cursor validation
- [ ] Cursor autopsy validation
- [ ] Harvest tests
- [ ] Operator publication

---

## 16. Next operator action

Hand this file to Cursor and run:

```text
Ingest ChatGPT thread autopsy findings per chat-thread-closeout-autopsy-harvest-chatgpt-v1.

npm run harvest:ingest-chatgpt-findings -- --input=<findings.md> --harvest-id=harvest-2026-08-05-railway-mcp-reconnect-v1

Then run duplication-preflight, validate, and (operator) publish-intelligence-full.
```

Cursor command chain:

```bash
npm run harvest:duplication-preflight -- --harvest-id=harvest-2026-08-05-railway-mcp-reconnect-v1
npm run harvest:sync-derived -- harvest-2026-08-05-railway-mcp-reconnect-v1
npm run harvest:validate -- harvest-2026-08-05-railway-mcp-reconnect-v1
npm run harvest:validate-autopsy -- --harvest-id=harvest-2026-08-05-railway-mcp-reconnect-v1
npm run test:harvest
# operator:
npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-05-railway-mcp-reconnect-v1
```

---

**Output verdict:** `DRAFT_READY_FOR_CURSOR_VALIDATION`
