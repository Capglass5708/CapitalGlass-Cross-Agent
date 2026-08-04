# Chat Thread Autopsy Findings from Current Chat v1

**Source-of-truth protocol:** `chat-thread-closeout-autopsy-harvest-v1.md`  
**Run mode:** ChatGPT visible-context harvest  
**Authority boundary:** This file uses only the current conversation context and the attached protocol. It does not claim live Cross-Agent, L:, Z:, Supabase, GitHub, or Cursor validation.  
**Intended next step:** Give this file to Cursor as draft seed material, then let Cursor run the protocol's repo/index validation and publication chain.

---

## Final Summary

```text
VERDICT: HARVEST_PARTIAL | Tier: T2
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT | Cache: NOT_APPLICABLE
Lane: cross-agent

Harvest packets: 12 | Waste: 8 | Operator friction: 5 | Duplicates: 5
Execution deltas: 7 | Seed packets: 8
ROI top-3:
1) Add explicit ChatGPT visible-context mode to the protocol
2) Make concept-only / no-code instructions a hard do-not-act guard
3) Require first-response confirmation before editing any reusable protocol file

Do-not-advance:
- Do not claim FULLY_SEEDED from this chat-only harvest.
- Do not claim index, repo, L:, Z:, Supabase, or GitHub validation from visible chat context.
- Do not mutate source files after the user says concept-only or stop.

Future agent (#1 lesson):
When the user asks for concept-only protocol review, start by restating the mode and boundaries, do not edit files, and only create or modify artifacts after explicit permission.

Publication: Git not-run | Hub not-run | Freshness NOT_RUN_BY_CURSOR

Next operator action:
Run this findings file through Cursor using chat-thread-closeout-autopsy-harvest-v1, then validate and convert seed candidates into the Cross-Agent harvest structure.
```

---

## 1. Harvest Verdict

| Field | Value |
|---|---|
| Mission | `chat-thread-closeout-autopsy-harvest-v1` |
| Start verdict | `UNHARVESTED_THREAD` |
| Current verdict | `HARVEST_PARTIAL` |
| Tier | `T2` |
| Reason for T2 | Long thread, repeated corrections, user frustration, multi-repo/host/system context, protocol design work, and avoidable file-action waste |
| Publication status | `NOT_RUN_BY_CURSOR` |
| Validation status | `NOT_RUN_IN_CHAT_CONTEXT` |

This is not `HARVEST_COMPLETE` because the source protocol requires structured artifacts, validation, and optionally seed publication receipts. This ChatGPT environment can prepare draft findings, but it cannot honestly claim Cross-Agent repo validation or Intelligence Hub publication from the visible chat alone.

---

## 2. Retrieval Preflight

| Required by protocol | Result in this chat |
|---|---|
| `npm run agent:index:scout -- --json` | Not available in chat context |
| `npm run agent:index:preflight -- --work-package=... --json` | Not available in chat context |
| L: thread-autopsy index | Not available in chat context |
| Raw repo scan | Not performed |

```text
Retrieval: INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT
Cache: NOT_APPLICABLE
rawScanRequired: false
sourceCommitSha: UNKNOWN
```

**Finding:** The protocol should explicitly support a `CHAT_CONTEXT_ONLY` or `VISIBLE_CONTEXT_ONLY` mode for ChatGPT threads. That mode should allow draft seed extraction while forbidding live validation or publication claims.

---

## 3. Thread Event Inventory

| Event ID | What happened | Actor | Evidence | State change |
|---|---|---|---|---|
| EVT-001 | User asked whether the Cursor-oriented protocol could also work here using only chat data. | User | Current chat | Established chat-only feasibility question |
| EVT-002 | Assistant confirmed yes, but with chat-only evidence limits. | Assistant | Current chat | Introduced distinction between Cursor mode and ChatGPT mode |
| EVT-003 | User asked to treat the attached file as source of truth and produce a Markdown findings file. | User | Current chat + attachment | Source authority became attached protocol |
| EVT-004 | Assistant read the attached protocol and created this findings artifact. | Assistant | Current chat | Draft harvest findings produced |
| EVT-005 | Prior segment included user saying `CONCEPT ONLY`, `DONT WRITE CODE`, and `JUST STOP`. | User | Current chat summary | Establishes a major operator-friction and instruction-following lesson |
| EVT-006 | Prior segment included assistant continuing file edits after the concept-only correction. | Assistant | Current chat summary | Wrong-move pattern identified |
| EVT-007 | Prior segment included extensive system work summaries: WSL2, Direct Connect, Intelligence Hub, Synology, proposal generator, and harvest indexing. | User-provided reports | Current chat | Multiple durable seed domains identified |
| EVT-008 | User focused the current task away from implementation and toward concept/protocol/file findings. | User | Current chat | Scope narrowed to conceptual harvest findings |

---

## 4. Harvest Packets

### Packet HP-001

| Field | Value |
|---|---|
| Kind | `decision` |
| Title | Protocol can operate in Cursor mode and ChatGPT draft mode |
| Summary | The protocol is strongest in Cursor, but ChatGPT can use visible thread data to produce draft seed candidates for later Cursor validation. |
| Owner repo | `CapitalGlass-Cross-Agent` |
| State | `DRAFT_READY_FOR_CURSOR_VALIDATION` |
| Verdict | `HARVEST_PARTIAL` |
| Evidence refs | Current chat; attached `chat-thread-closeout-autopsy-harvest-v1.md` |
| Future-agent instructions | When using the protocol outside Cursor, label retrieval and validation limits before producing findings. |

### Packet HP-002

| Field | Value |
|---|---|
| Kind | `protocol_upgrade` |
| Title | Add explicit ChatGPT visible-context mode |
| Summary | The protocol currently assumes Cursor-accessible indexes and commands; a chat-only mode prevents false claims while still extracting value. |
| Owner repo | `CapitalGlass-Cross-Agent` |
| State | `CANDIDATE` |
| Verdict | `POLICY_GATED` |
| Evidence refs | Current chat exchange asking whether it can work here |
| Future-agent instructions | Use `CHAT_CONTEXT_ONLY` when only conversation text and attachments are available. |

### Packet HP-003

| Field | Value |
|---|---|
| Kind | `mistake` |
| Title | Continued editing after concept-only instruction |
| Summary | The assistant acted like an implementation agent after the user explicitly requested concept-only behavior. |
| Owner repo | `ChatGPT/Cursor operating protocol` |
| State | `CONFIRMED_BY_USER_CORRECTION` |
| Verdict | `WRONG_MOVE` |
| Evidence refs | User messages: `DONT WORRY ABOUT THE CODE`, `CONCEPT ONLY`, `DONT WRITE CODE`, `JUST STOP` |
| Future-agent instructions | Treat `concept only`, `do not write code`, and `stop` as hard action gates. |

### Packet HP-004

| Field | Value |
|---|---|
| Kind | `faster_path` |
| Title | First response should have confirmed mode before file mutation |
| Summary | The optimal first move was to ask or state whether the output should be a conceptual review, a draft file, or an edited artifact. |
| Owner repo | `CapitalGlass-Cross-Agent` |
| State | `CANDIDATE` |
| Verdict | `REUSABLE_LESSON` |
| Evidence refs | Current thread corrections |
| Future-agent instructions | On ambiguous artifact requests, confirm mode before editing source files. |

### Packet HP-005

| Field | Value |
|---|---|
| Kind | `repeated_work` |
| Title | Harvest/index status was re-investigated multiple times |
| Summary | The thread repeatedly returned to whether harvest, publication, indexing, and seeding were complete. |
| Owner repo | `CapitalGlass-Cross-Agent` |
| State | `DUPLICATION_PATTERN` |
| Verdict | `NEEDS_REGISTRY_LOOKUP_FIRST` |
| Evidence refs | Multiple user-provided harvest and index reports in this chat |
| Future-agent instructions | Start at harvest packet registry, command index, and BY-KIND slices before re-checking harvest completeness. |

### Packet HP-006

| Field | Value |
|---|---|
| Kind | `blocker` |
| Title | Chat-only findings cannot claim live publication |
| Summary | Without repo/index command execution, this findings file cannot claim Git/L:/Z:/Supabase freshness or Hub seeding. |
| Owner repo | `CapitalGlass-Cross-Agent` |
| State | `OPEN` |
| Verdict | `VALIDATION_REQUIRED_IN_CURSOR` |
| Evidence refs | Attached protocol command chain and publication rules |
| Future-agent instructions | Cursor must run `harvest:validate`, seed compilation, and publication gates before `FULLY_SEEDED`. |

### Packet HP-007

| Field | Value |
|---|---|
| Kind | `command` |
| Title | Protocol-required validation chain |
| Summary | The source protocol requires harvest sync, render, validate, tests, compile, blind retrieval, and operator publication gates. |
| Owner repo | `CapitalGlass-Cross-Agent` |
| State | `NOT_RUN_IN_CHAT_CONTEXT` |
| Verdict | `COMMANDS_DEFINED` |
| Evidence refs | Attached protocol command chain |
| Future-agent instructions | Use the command chain in Cursor, not in ChatGPT visible-context mode. |

### Packet HP-008

| Field | Value |
|---|---|
| Kind | `evidence` |
| Title | Attached protocol is the source of truth |
| Summary | The user explicitly instructed that the attached protocol should be treated as source of truth for this findings artifact. |
| Owner repo | `CapitalGlass-Cross-Agent` |
| State | `SOURCE_ACCEPTED` |
| Verdict | `VALID_INPUT` |
| Evidence refs | User message: `treat this file as the source of truth` |
| Future-agent instructions | Do not substitute earlier drafts or memory when a newer attached protocol is named as authority. |

### Packet HP-009

| Field | Value |
|---|---|
| Kind | `protocol_upgrade` |
| Title | Separate review, draft artifact, and implementation modes |
| Summary | The thread showed that "prepare a file," "concept only," and "implement" need explicit mode separation. |
| Owner repo | `CapitalGlass-Cross-Agent` |
| State | `CANDIDATE` |
| Verdict | `HIGH_ROI` |
| Evidence refs | Current chat and prior correction sequence |
| Future-agent instructions | Before action, label mode as `REVIEW_ONLY`, `DRAFT_FILE`, `EDIT_EXISTING`, or `IMPLEMENT_REPO`. |

### Packet HP-010

| Field | Value |
|---|---|
| Kind | `mistake` |
| Title | Prior artifact editing became too eager |
| Summary | The assistant optimized for making progress instead of honoring a strong stop/scope correction. |
| Owner repo | `Agent behavior` |
| State | `CONFIRMED_BY_USER` |
| Verdict | `WRONG_MOVE` |
| Evidence refs | `JUST STOP` correction in current thread summary |
| Future-agent instructions | Stop means stop: do not inspect attachments, call tools, or continue a prior plan without renewed instruction. |

### Packet HP-011

| Field | Value |
|---|---|
| Kind | `faster_path` |
| Title | The protocol should generate both human findings and machine seed packets |
| Summary | A human-readable Markdown file is useful, but Intelligence Hub value comes from atomic seed candidates. |
| Owner repo | `CapitalGlass-Cross-Agent` |
| State | `CANDIDATE` |
| Verdict | `REUSABLE_LESSON` |
| Evidence refs | Attached protocol seed packet section |
| Future-agent instructions | Always include seed candidates with retrieval questions, not just a narrative review. |

### Packet HP-012

| Field | Value |
|---|---|
| Kind | `decision` |
| Title | This file is a draft for later Cursor validation |
| Summary | The correct label for this output is a ChatGPT-generated draft findings artifact, not a validated Cross-Agent harvest. |
| Owner repo | `CapitalGlass-Cross-Agent` |
| State | `DRAFT` |
| Verdict | `READY_FOR_CURSOR_VALIDATION` |
| Evidence refs | Current tool limits and attached protocol validation requirements |
| Future-agent instructions | Cursor should ingest this as input, then produce canonical JSON and receipts. |

---

## 5. Execution Deltas

| Delta ID | Situation | Actual execution | Optimal execution | Preventive control | Cost |
|---|---|---|---|---|---|
| ED-001 | User asked for concept-only improvement | Assistant continued toward file edits | Confirm `REVIEW_ONLY` mode and avoid file mutation | Mode gate before tools | `operator_attention: high`, `trust: high` |
| ED-002 | User said `JUST STOP` | Prior plan context still lingered in the session | Stop immediately; do not inspect new attachments | Hard stop guard | `operator_attention: high` |
| ED-003 | Protocol designed for Cursor was applied in ChatGPT | Initial framing risked implying full validation | Label `CHAT_CONTEXT_ONLY` and `NOT_RUN_BY_CURSOR` | Environment capability declaration | `false_confidence: medium` |
| ED-004 | Harvest status was discussed repeatedly | Multiple reports checked and rechecked completion state | Start from harvest registry and do-not-advance map | Duplication detector | `tokens: high`, `time: medium` |
| ED-005 | User wanted conceptual SDLC protocol | Agent behavior drifted toward implementation mechanics | Separate concept protocol from repo implementation | `REVIEW_ONLY` / `IMPLEMENT_REPO` split | `operator_attention: high` |
| ED-006 | User asked if protocol works for ChatGPT | Needed distinction between draft and validated harvest | Define two modes immediately | Add ChatGPT mode to protocol | `tokens: low`, `clarity: high` |
| ED-007 | Source protocol requires command receipts | ChatGPT cannot produce them here | Prepare draft and hand off to Cursor for validation | `DRAFT_READY_FOR_CURSOR_VALIDATION` verdict | `false_confidence: high if omitted` |

---

## 6. Waste Ledger

| Waste ID | Type | Description | Evidence | Saved by | Impact |
|---|---|---|---|---|---|
| TW-001 | `operator_attention` | User had to repeatedly enforce concept-only / stop boundaries | User corrections in this chat | Hard mode gate before action | high |
| TW-002 | `context` | Prior implementation momentum bled into a concept discussion | Current thread summary | Sanity check latest user instruction before every final/tool action | high |
| TW-003 | `retrieval` | Harvest/index status was repeatedly debated instead of starting from a registry authority | Multiple pasted status reports | Mandatory duplication detector | high |
| TW-004 | `claiming` | Risk of overstating ChatGPT output as validated harvest | Attached protocol requires commands/receipts | `NOT_RUN_BY_CURSOR` publication label | high |
| TW-005 | `tool` | File edits were attempted when user wanted concept review | Prior correction sequence | Ask `review vs edit vs implement` when ambiguous | high |
| TW-006 | `verification` | Chat-only context cannot run protocol validators | Source protocol command chain | Produce draft findings only | medium |
| TW-007 | `scope` | The system mixed protocol design, implementation, publication, and review in one flow | Conversation history | Separate lanes and verdicts | high |
| TW-008 | `rework` | Earlier protocol drafts needed correction because action mode was not explicit | Current artifact lineage | Add execution mode section | medium |

---

## 7. Duplication Detector

| Duplicate ID | Repeated issue | First known authority | Why missed | Fix |
|---|---|---|---|---|
| DUP-001 | Is the harvest complete or not? | Cross-Agent harvest manifests / do-not-advance registry | Chat context included many pasted status reports but no live registry query | Start every harvest-status question at registry + BY-KIND slices |
| DUP-002 | Can agents claim PASS from partial runtime evidence? | Existing do-not-advance patterns | PASS/HOLD language repeated across reports | Every award needs required evidence table |
| DUP-003 | Index-first rule kept being re-established | Intelligence Hub first-read rule and scout lane | Some sessions did not trigger scout automatically | Inject scout preflight and log retrieval code |
| DUP-004 | Wrong host / WSL context confusion | Host authority and Direct Connect records | Multiple hosts with similar repo paths | Require host identity in every execution packet |
| DUP-005 | Publication vs recording separation | Harvest protocol command chain | Reports often mixed Git commit, Hub publish, and projection sync | Separate `recorded`, `published`, `freshness`, and `retrieved` states |

---

## 8. Operator Friction

| Friction ID | Trigger | Operator cost | System fix | Evidence |
|---|---|---|---|---|
| OF-001 | User had to say concept-only more than once | high | Treat concept-only as hard no-write guard | Current chat summary |
| OF-002 | User had to say `JUST STOP` | high | Stop all tool/file actions immediately | Current chat summary |
| OF-003 | User had to ask whether the file can work here | medium | Add ChatGPT visible-context mode | Current chat |
| OF-004 | User had to provide many status reports for indexing/hub state | high | Scout and registry retrieval before asking user | Pasted reports in chat |
| OF-005 | User had to keep separating concept from implementation | high | Add mode labels to protocol and assistant first response | Current chat |

---

## 9. ROI Backlog

| Rank | ROI item | Why it pays | Effort | Owner | Linked waste |
|---:|---|---|---|---|---|
| 1 | Add `CHAT_CONTEXT_ONLY` mode to the protocol | Prevents false validation claims and makes ChatGPT useful as draft harvester | low | CapitalGlass-Cross-Agent | TW-004, TW-006 |
| 2 | Add hard `CONCEPT_ONLY_NO_WRITE` and `STOP_NOW` guards | Prevents the most painful operator-friction pattern in this thread | low | Agent protocol / Cross-Agent | TW-001, TW-005 |
| 3 | Require first-response mode declaration | Makes review vs edit vs implementation explicit | low | Agent protocol | TW-002, TW-007 |
| 4 | Add `DRAFT_READY_FOR_CURSOR_VALIDATION` verdict | Gives ChatGPT outputs a safe handoff label | low | CapitalGlass-Cross-Agent | TW-004 |
| 5 | Add harvest-status duplication lookup | Stops repeated investigations of already-recorded state | medium | CapitalGlass-Cross-Agent | TW-003 |
| 6 | Add host/context proof to every execution packet | Reduces WSL/host confusion across WESLEY_WORK, WESLEYDESK, and RYZEN9DESK | medium | Cross-Agent / Office Admin | DUP-004 |
| 7 | Add publication-state matrix to every harvest finding | Separates Git, L:, Z:, Supabase, and retrieval proof | low | Cross-Agent | DUP-005 |
| 8 | Add seed packet quality gate to Markdown-only findings | Keeps narrative reports from pretending to be seedable intelligence | medium | Cross-Agent | TW-008 |

---

## 10. Do-Not-Advance Guards

| Guard ID | Forbidden claim | Required evidence | Current state |
|---|---|---|---|
| DNA-001 | `FULLY_SEEDED` | Hub publish + freshness gate + retrieval proof | HOLD |
| DNA-002 | `HARVEST_COMPLETE` for this file | Canonical JSON artifacts + validator PASS | HOLD |
| DNA-003 | `INDEX_HIT` | Actual index preflight receipt | HOLD |
| DNA-004 | `PUBLISH_PASS` | Published receipt at L:/Z:/projection layers | HOLD |
| DNA-005 | `CONCEPT_ONLY` work completed with code edits | No file mutation unless authorized | HOLD |
| DNA-006 | `Source protocol updated` | User explicitly requested edit/replace of source protocol | HOLD |
| DNA-007 | `Repo validation passed` | Cursor command receipts | HOLD |

---

## 11. Seed Packet Candidates

### Seed IH-THREAD-AUTOPSY-CHAT-MODE-001

```json
{
  "schemaVersion": "harvest-seed-packet-v1@1.0.0",
  "seedId": "IH-THREAD-AUTOPSY-CHAT-MODE-001",
  "kind": "protocol-upgrade",
  "title": "ChatGPT visible-context harvest mode",
  "summary": "ChatGPT can draft thread-autopsy findings from visible chat context, but must not claim repo, index, or Hub validation.",
  "retrievalQuestions": [
    "Can chat-thread-closeout-autopsy-harvest-v1 run in ChatGPT without Cursor repo access?",
    "What verdict should a ChatGPT-only harvest use before Cursor validation?"
  ],
  "evidenceRefs": [
    "current chat: user asked whether protocol can work here",
    "attached protocol: command chain requires Cursor/repo validation"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "User asks to use a Cursor harvest protocol inside ChatGPT",
    "startAt": ["attached protocol", "visible conversation context"],
    "runPreflight": ["record INDEX_NOT_AVAILABLE_IN_CHAT_CONTEXT"],
    "doNot": ["claim INDEX_HIT", "claim HARVEST_COMPLETE", "claim FULLY_SEEDED"],
    "proveBeforeClaiming": ["Cursor validation receipts"]
  },
  "ownerRepo": "CapitalGlass-Cross-Agent",
  "targetSlice": "BY-KIND/thread-autopsy-index.json",
  "promotionClass": "POLICY_GATED",
  "status": "CANDIDATE"
}
```

### Seed IH-THREAD-AUTOPSY-CONCEPT-ONLY-002

```json
{
  "schemaVersion": "harvest-seed-packet-v1@1.0.0",
  "seedId": "IH-THREAD-AUTOPSY-CONCEPT-ONLY-002",
  "kind": "failure-pattern",
  "title": "Concept-only means no file edits or implementation",
  "summary": "When the user says concept-only or do not write code, the agent must stop implementation behavior and respond in review/planning mode only.",
  "retrievalQuestions": [
    "What should an agent do when Wesley says concept only?",
    "How should Cursor handle do not write code during protocol design?"
  ],
  "evidenceRefs": [
    "current chat summary: user said concept only and JUST STOP"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "User says concept only, do not write code, or stop",
    "startAt": ["latest user instruction"],
    "runPreflight": ["none; obey immediately"],
    "doNot": ["call tools", "edit files", "continue prior plan"],
    "proveBeforeClaiming": ["user gives new explicit permission to continue"]
  },
  "ownerRepo": "CapitalGlass-Cross-Agent",
  "targetSlice": "BY-KIND/thread-autopsy-index.json",
  "promotionClass": "POLICY_GATED",
  "status": "CANDIDATE"
}
```

### Seed IH-THREAD-AUTOPSY-MODE-GATE-003

```json
{
  "schemaVersion": "harvest-seed-packet-v1@1.0.0",
  "seedId": "IH-THREAD-AUTOPSY-MODE-GATE-003",
  "kind": "protocol-upgrade",
  "title": "Declare artifact mode before acting",
  "summary": "For reusable protocol requests, the agent should declare REVIEW_ONLY, DRAFT_FILE, EDIT_EXISTING, or IMPLEMENT_REPO before taking action.",
  "retrievalQuestions": [
    "How should an agent distinguish review from implementation in a protocol thread?",
    "What mode labels prevent accidental file mutation?"
  ],
  "evidenceRefs": [
    "current chat: user separated concept-only from file creation"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "User asks for protocol review, file prep, or implementation in the same topic",
    "startAt": ["latest explicit user instruction"],
    "runPreflight": ["state selected mode in first sentence"],
    "doNot": ["infer implementation permission from conceptual approval"],
    "proveBeforeClaiming": ["mode matches user wording"]
  },
  "ownerRepo": "CapitalGlass-Cross-Agent",
  "targetSlice": "BY-KIND/thread-autopsy-index.json",
  "promotionClass": "POLICY_GATED",
  "status": "CANDIDATE"
}
```

### Seed IH-THREAD-AUTOPSY-PUBLICATION-004

```json
{
  "schemaVersion": "harvest-seed-packet-v1@1.0.0",
  "seedId": "IH-THREAD-AUTOPSY-PUBLICATION-004",
  "kind": "failure-pattern",
  "title": "Recording is not publication",
  "summary": "A harvest file, Git commit, or chat finding is not Intelligence Hub publication until Hub publish, freshness, and retrieval proofs exist.",
  "retrievalQuestions": [
    "When is a thread harvest fully seeded into the Intelligence Hub?",
    "What is the difference between HARVEST_COMPLETE and FULLY_SEEDED?"
  ],
  "evidenceRefs": [
    "attached protocol: publication is separate from recording",
    "attached protocol: do not claim FULLY_SEEDED without index freshness gate"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "User asks whether a harvest has been seeded",
    "startAt": ["harvest manifest", "publication receipt", "freshness gate receipt"],
    "runPreflight": ["index:freshness-gate when authorized"],
    "doNot": ["claim seeded from markdown or Git alone"],
    "proveBeforeClaiming": ["Git, L:, Z:, projection, and retrieval proof"]
  },
  "ownerRepo": "CapitalGlass-Cross-Agent",
  "targetSlice": "BY-KIND/thread-autopsy-index.json",
  "promotionClass": "POLICY_GATED",
  "status": "CANDIDATE"
}
```

### Seed IH-THREAD-AUTOPSY-DUPLICATION-005

```json
{
  "schemaVersion": "harvest-seed-packet-v1@1.0.0",
  "seedId": "IH-THREAD-AUTOPSY-DUPLICATION-005",
  "kind": "failure-pattern",
  "title": "Repeated harvest status checks need registry-first lookup",
  "summary": "When a thread repeatedly asks whether a milestone is complete, agents should start from registry and do-not-advance records rather than re-investigating from prose.",
  "retrievalQuestions": [
    "How should an agent check whether a harvest milestone is complete?",
    "Where should agents look before re-investigating Slice 6 or harvest publication status?"
  ],
  "evidenceRefs": [
    "current chat: repeated pasted status reports and completion checks"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "User asks whether a harvest, Slice, publication, or index work is complete",
    "startAt": ["work-progress/harvest-packet-registry.json", "work-progress/do-not-advance-registry.json", "BY-KIND/thread-autopsy-index.json"],
    "runPreflight": ["npm run agent:index:scout -- --json"],
    "doNot": ["start with broad repo grep", "trust stale prose summaries"],
    "proveBeforeClaiming": ["current registry state and required gate receipts"]
  },
  "ownerRepo": "CapitalGlass-Cross-Agent",
  "targetSlice": "BY-KIND/thread-autopsy-index.json",
  "promotionClass": "POLICY_GATED",
  "status": "CANDIDATE"
}
```

### Seed IH-THREAD-AUTOPSY-OPERATOR-FRICTION-006

```json
{
  "schemaVersion": "harvest-seed-packet-v1@1.0.0",
  "seedId": "IH-THREAD-AUTOPSY-OPERATOR-FRICTION-006",
  "kind": "failure-pattern",
  "title": "Operator frustration is harvestable evidence",
  "summary": "User corrections and frustration are not noise; they identify missing protocol gates and high-ROI automation targets.",
  "retrievalQuestions": [
    "How should thread autopsy record user frustration?",
    "Why should operator attention be part of the waste ledger?"
  ],
  "evidenceRefs": [
    "attached protocol: operator friction section",
    "current chat: repeated user corrections"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "User corrects the agent or expresses frustration",
    "startAt": ["operator friction register", "waste ledger"],
    "runPreflight": ["none; preserve correction as evidence"],
    "doNot": ["treat frustration as conversational noise", "continue the same action plan"],
    "proveBeforeClaiming": ["operator friction item linked to a system fix"]
  },
  "ownerRepo": "CapitalGlass-Cross-Agent",
  "targetSlice": "BY-KIND/thread-autopsy-index.json",
  "promotionClass": "POLICY_GATED",
  "status": "CANDIDATE"
}
```

### Seed IH-THREAD-AUTOPSY-HOST-EXECUTION-007

```json
{
  "schemaVersion": "harvest-seed-packet-v1@1.0.0",
  "seedId": "IH-THREAD-AUTOPSY-HOST-EXECUTION-007",
  "kind": "failure-pattern",
  "title": "Host execution must be proven, not inferred",
  "summary": "Multi-host work needs explicit host identity and runner/context receipts before claiming execution-state awards.",
  "retrievalQuestions": [
    "How should agents prove work ran on RYZEN9DESK instead of WESLEY_WORK?",
    "What prevents wrong-host execution claims in Direct Connect work?"
  ],
  "evidenceRefs": [
    "current chat history: Direct Connect and RYZEN9DESK wrong-host issues"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "Work package depends on a specific machine or runner",
    "startAt": ["host-authority slice", "runner receipt", "machine profile"],
    "runPreflight": ["hostname/whoami/runner receipt check"],
    "doNot": ["accept control-host preparation as target-host acceptance"],
    "proveBeforeClaiming": ["execution receipt from required host"]
  },
  "ownerRepo": "CapitalGlass-Cross-Agent",
  "targetSlice": "BY-KIND/thread-autopsy-index.json",
  "promotionClass": "POLICY_GATED",
  "status": "CANDIDATE"
}
```

### Seed IH-THREAD-AUTOPSY-SOURCE-AUTHORITY-008

```json
{
  "schemaVersion": "harvest-seed-packet-v1@1.0.0",
  "seedId": "IH-THREAD-AUTOPSY-SOURCE-AUTHORITY-008",
  "kind": "protocol-upgrade",
  "title": "Newest attached protocol overrides prior drafts",
  "summary": "When the user names an attached file as source of truth, agents must follow that file instead of earlier summaries or memory.",
  "retrievalQuestions": [
    "What should an agent do when Wesley attaches a protocol and calls it source of truth?",
    "How should prior protocol drafts be handled after a newer attachment appears?"
  ],
  "evidenceRefs": [
    "current chat: user said treat this file as the source of truth"
  ],
  "futureAgentInstructions": {
    "whenThisAppears": "User attaches a protocol and says it is source of truth",
    "startAt": ["the attached file"],
    "runPreflight": ["read full attached source"],
    "doNot": ["apply older protocol drafts", "use memory as higher authority"],
    "proveBeforeClaiming": ["findings cite the attached protocol's required sections"]
  },
  "ownerRepo": "CapitalGlass-Cross-Agent",
  "targetSlice": "BY-KIND/thread-autopsy-index.json",
  "promotionClass": "POLICY_GATED",
  "status": "CANDIDATE"
}
```

---

## 12. Future-Agent Instructions

**Future-agent #1 lesson:**

```text
When Wesley asks for concept-only protocol work, start by declaring REVIEW_ONLY or CHAT_CONTEXT_ONLY mode, do not edit files or run implementation commands, and only claim harvest or publication states after the protocol-required receipts exist.
```

Additional instructions:

| Situation | Start at | Run | Do not | Proof before claim |
|---|---|---|---|---|
| ChatGPT asked to use Cursor harvest protocol | Attached source protocol + visible chat | None; label chat mode | Claim repo/index validation | Cursor receipts |
| User says concept-only | Latest user instruction | None | Edit files or continue prior plan | Renewed permission |
| User asks if harvest is seeded | Harvest manifest + publication/freshness receipts | `index:freshness-gate` when authorized | Claim seeded from Git/prose | Git/L:/Z:/projection/retrieval proof |
| Multi-host execution | Host authority + runner receipt | Host preflight | Infer target-host PASS from control host | Receipt from target host |
| User correction/frustration | Operator friction register | None | Treat correction as noise | Friction item linked to system fix |

---

## 13. Publication Truth

| Layer | State | Evidence |
|---|---|---|
| Git authority | `not-run` | This is a local ChatGPT findings file |
| L: Hub catalog | `not-run` | No Hub publish command run |
| Z: AI cache | `not-run` | No AI cache publish command run |
| Supabase projection | `not-run` | No ingest/projection command run |
| Freshness gate | `not-run` | No `index:freshness-gate` receipt |

Publication verdict:

```text
NOT_RUN_BY_CURSOR
```

This file is seed material, not proof of seeding.

---

## 14. Acceptance Checklist

| Check | Status |
|---|---|
| Scout/index preflight attempted and logged | `NOT_AVAILABLE_IN_CHAT_CONTEXT` |
| Thread event inventory exists | PASS |
| Harvest packets exist | PASS |
| Thread autopsy bundle equivalent exists | PASS as Markdown draft |
| Waste ledger or `NONE_FOUND` with proof | PASS |
| ROI backlog ranked | PASS |
| Duplication check logged | PASS as visible-context draft |
| Do-not-advance map listed | PASS |
| Seed packets atomic with retrieval questions | PASS |
| `harvest:validate` PASS | NOT_RUN |
| Publication truthfully labeled | PASS |
| False `FULLY_SEEDED` avoided | PASS |

---

## 15. Recommended Protocol Additions

Add these to the source protocol in a future revision:

1. `CHAT_CONTEXT_ONLY` mode
   - Allowed evidence: visible chat, attached files, pasted receipts.
   - Forbidden claims: `INDEX_HIT`, repo validation, Hub publication, freshness PASS.
   - Output verdict: `DRAFT_READY_FOR_CURSOR_VALIDATION`.

2. Mode declaration before action
   - `REVIEW_ONLY`
   - `DRAFT_FILE`
   - `EDIT_EXISTING`
   - `IMPLEMENT_REPO`
   - `PUBLISH_OPERATOR`

3. Hard stop guard
   - `STOP_NOW`: no tools, no file reads, no attachment inspection, no continuation.
   - Resume only after explicit new user instruction.

4. Concept-only guard
   - `CONCEPT_ONLY_NO_WRITE`: no code, no patches, no repo edits, no source-file replacement.

5. Draft findings handoff
   - ChatGPT output should become input to Cursor, not a substitute for Cursor validation.

---

## 16. Next Operator Action

Run this Markdown findings file through Cursor with the attached source protocol as authority. Cursor should convert these findings into:

- `harvest-manifest-v1.json`
- `thread-autopsy-bundle.json`
- `thread-event-inventory.json`
- `seed-packets/*.json`
- `seed-packet-index.json`
- `validation-result.json`

Then Cursor should run the validation chain. Publication to L:/Z:/Supabase should remain operator-gated.

