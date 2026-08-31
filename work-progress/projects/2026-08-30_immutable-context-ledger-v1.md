# IMMUTABLE_CONTEXT_LEDGER_V1 — Authority, Architecture, and Execution Plan

| Field | Value |
| --- | --- |
| Work package | `immutable-context-ledger-v1` |
| Status | **PLANNING — architecture defined, authority resolved, no implementation** |
| Owner repo (software) | `CapitalGlass-Cross-Agent` |
| Owner (durable data) | Intelligence Hub data plane — **never Git** |
| Date | 2026-08-30 |
| Mission class | Coordination / architecture only |
| Related decision | `CAD-20260830-cross-agent-software-home-not-datastore` |

---

## 1. Objective

Change the Compounding Intelligence architecture from extract-first to:

```
CAPTURE FIRST → PRESERVE IMMUTABLY → EXTRACT CONTINUOUSLY
              → GRAPH DERIVED INTELLIGENCE → EXECUTIVE REASONING
```

The system must automatically preserve complete AI/work context so future intelligence can
always be **re-derived from original evidence** rather than permanently depending on today's
extraction quality.

**Top-level invariant:**

> **Raw evidence is permanent authority. Derived intelligence is replaceable interpretation.**

This is the decision that makes the system compound rather than merely accumulate. Its
operational corollary:

> Nothing derived may become more authoritative than the immutable evidence it came from.

---

## 2. Authority investigation — what was actually found

### 2.1 The estate has already decided this

`contracts/intelligence/OWNERSHIP.md` is **`ARCHITECTURE_LOCKED`** and already assigns:

| System | Role | Owns |
| --- | --- | --- |
| **CapitalGlass-Cross-Agent** | `INTELLIGENCE_OWNER` | envelope schema, mission ledger projection, **derived objects**, **relationship graph**, Hub compact compilation, shared-dev Hub publication semantics, **provenance reconstruction** |
| **CG-AppBuilder-MCP** | `EVIDENCE_PRODUCER` | ordinary closeout, `intelligence-handoff-v1` emit **only** |
| **Intelligence Hub** | retrieval plane | store/index `DERIVED_INTELLIGENCE` — never progression authority |

It **explicitly forbids** "AppBuilder growing envelope builders, ledger projectors, Hub compact
compilers, or `DERIVED_INTELLIGENCE` semantics" and forbids registering
`COMPOUNDING_INTELLIGENCE_PIPELINE` as an AppBuilder capability — "downstream owner is
Cross-Agent only."

**Conclusion:** siting this initiative in Cross-Agent is not a new decision. It is compliance
with a lock that already exists.

### 2.2 The doctrine contradicts the locked architecture

`AGENT_START_HERE.md` states: *"This repo may describe work. This repo must not become the
work"* and bans `scripts/`, `src/`, `supabase/`, migrations.

Reality in this repo today:

- **282 files under `scripts/`**
- a `package.json` with a full harvest/index/intelligence toolchain and dozens of test suites
- `scripts/intelligence/lib/` — 30 modules including `ingest-pipeline-v1.mjs`,
  `derived-object-builder-v1.mjs`, `relationship-edge-builder-v1.mjs`,
  `provenance-reconstruct-v1.mjs`, `supabase-intelligence-store-v1.mjs`

This is an **authority conflict, resolved in favour of the locked contract.** The doctrine is
stale and is superseded by `CAD-20260830-cross-agent-software-home-not-datastore`.

### 2.3 Schema authority is genuinely unresolved

- Cross-Agent has **no** `supabase/`, `migrations/`, or `database/` directory and no
  Postgres/Supabase client dependency. It reaches the DB only through
  `scripts/intelligence/lib/supabase-intelligence-store-v1.mjs` and
  `hub-supabase-projection-map-v1.mjs`.
- CG-AppBuilder-MCP holds **82 migrations**, `supabase/config.toml`, and the linked project ref
  `xjivcwcyyimjujbchwdf`.
- AppBuilder's registered `schemaAuthority` is **null** (platform registry).

**Therefore:** AppBuilder is the *migration execution surface* by possession, not the schema
*authority* by declaration. This gap must be closed explicitly in Phase 0 rather than assumed
in either direction. See §6.

### 2.4 The blocking schema constraint

`intelligence_hub.knowledge_objects` requires:

```sql
authority_commit text NOT NULL CHECK (authority_commit ~ '^[a-f0-9]{7,40}$')
authority_system text NOT NULL DEFAULT 'github'
```

**A conversation has no commit SHA.** The existing knowledge-object envelope structurally
cannot hold raw conversational evidence. This is the single most important technical finding
and it is why an Evidence plane must be defined separately (§4) rather than reusing
`knowledge_objects` for raw capture.

### 2.5 What already exists and must be reused

| Capability | Location | State |
| --- | --- | --- |
| Ingest pipeline | `scripts/intelligence/lib/ingest-pipeline-v1.mjs` | live |
| Derived object builder | `derived-object-builder-v1.mjs` | live |
| Envelope build + validate | `envelope-builder-v1.mjs`, `envelope-validator-v1.mjs` | live |
| **Relationship graph builder** | `relationship-edge-builder-v1.mjs`, `semantic-relationship-builder-v1.mjs` | live |
| **Provenance reconstruction** | `provenance-reconstruct-v1.mjs` | live |
| Identity reconciliation / IDs | `identity-reconciliation-v1.mjs`, `ids.mjs` | live |
| Graph queries | `mission-graph-queries-v1.mjs` | live |
| Supabase store + projection map | `supabase-intelligence-store-v1.mjs`, `hub-supabase-projection-map-v1.mjs` | live |
| Hot AI cache plane | `hot-ai-cache-plane-v1.mjs` | live |
| **Relationship-type registry** | `contracts/intelligence/registries/knowledge-relationship-types-v1.json` | append-only; redefinition and removal **forbidden** |
| Canonical JSON + body hash | `CG-AppBuilder-MCP/scripts/intelligence-hub/lib/{canonical-json,body-hash}.mjs` | live |
| Write-once object store | `CG-AppBuilder-MCP/scripts/intelligence-hub/lib/publish-object.mjs` | throws on idempotency violation; write is **not** atomic |
| **Claude transcript reader** | `CG-AppBuilder-MCP/scripts/telemetry/lib/transcript-ledger-v1.mjs` | reads `~/.claude/projects/**.jsonl` read-only — **token counting only, discards content** |
| L: object store | `/mnt/l/Capital-Glass-Intelligence-Hub/01-object-store/` | **live: 626 blobs, 691 catalog entries** |
| OP-00A live proof | `FIRST_REAL_MISSION_HUB_PROOF_PASS` | 11 real objects + relationships in Supabase |

**The entire derived-intelligence plane already exists and is proven live.**

### 2.6 What does not exist

1. **Any raw conversation persistence anywhere.** Zero of 82 migrations reference
   `transcript`, `conversation`, `raw_message`, or `message_text`.
2. `agentops.ai_cache_session_summaries` is the anti-pattern: one summary row per closeout,
   `closeout_hash` + token counts + verdicts, **no preserved original**.
3. No Cursor conversation reader (`state.vscdb` unread by anything).
4. No automatic ChatGPT capture — today's "thread autopsies" are hand-authored.
5. No git-commit **event** stream (`git-estate` is a state snapshot).
6. No hash-chaining / Merkle linkage anywhere — no `prevHash` in ~20 append-only writers.
7. No shared append-ledger primitive.

### 2.7 Urgency

`~/.claude/projects/` holds 188 JSONL files / 123 MB / 42,370 records — but the **mtime range
is only 2026-08-29 → 2026-08-30**. A `~/.claude/.last-cleanup` marker exists. **Retention is
destroying the record now.** Every day without capture is permanently lost context.

---

## 3. The Immutable Context Ledger — conceptual model

### 3.1 Evidence classes to capture

**Conversation:** conversation/session · message · user input · assistant output · system/context
input where obtainable · Claude Code session · Cursor session · ChatGPT conversation

**Execution:** agent mission · WaveRunner mission · agent/subagent · tool invocation · tool
result · command/execution event · terminal evidence where material

**Repository:** repository · worktree · branch · commit · PR · merge

**Content:** file/artifact · generated document · attachment · external research/source

**Supplied context:** Application Bible context supplied to an agent · Hub/cache knowledge
supplied to an agent *(critical — records not only what an agent concluded but what it saw)*

**Human:** note · idea · decision · objective · North Star · dependency · blocker ·
unresolved question

### 3.2 Required fields on every evidence object

| Field | Purpose |
| --- | --- |
| `evidenceId` | Deterministic, derived from `(sourceSystem, sourceNativeId, contentHash)` |
| `sourceSystem` | `claude-code` \| `cursor` \| `chatgpt` \| `git` \| `waverunner` \| `filesystem` \| `human` |
| `sourceNativeId` | Source's own id (sessionId, uuid, composerId, SHA) — never invented |
| `contentHash` | `sha256:<64hex>` over canonical body |
| `capturedAt` / `sourceTimestamp` | Ingestion time vs. original event time, kept distinct |
| `machineId` | e.g. `CG-NIMO-01` |
| `agentIdentity` / `modelIdentity` | Where the source exposes it |
| `repoBinding` | repo · worktree · branch · headSha where derivable |
| `provenanceClass` | `DISCOVERED` on capture; never higher |
| `schemaVersion` | Evidence schema id + version |
| `captureCompleteness` | `COMPLETE` \| `PARTIAL` \| `LOWER_BOUND` — absent data is **missing, never zero** |
| `continuationOf` | Session stitching across restarts/hosts |
| `attachmentOf` | Attachment → parent message |
| `supersededBy` | Never a deletion; supersession is an edge |
| `redactionState` | `NONE` \| `QUARANTINED_SECRET` \| `REDACTED_LEGAL` |

### 3.3 Immutability rules

- Append-only. **An extractor must never overwrite original evidence.**
- Content-addressed: identical content → identical hash → single stored blob.
- Deduplication is by `contentHash`; identity dedup additionally by
  `(sourceSystem, sourceNativeId)` — the WSL and Windows Claude corpora overlap and would
  otherwise double-count sessions.
- Deletion policy: **no hard delete.** Redaction replaces payload with a tombstone that
  retains hash, provenance and reason. Secret-bearing evidence is quarantined, still hashed,
  still preserved, never auto-promoted, never printed.
- Hash-chained ledger: each capture event carries `prevHash` + `entryHash`. This does not
  exist anywhere in the estate today and is a genuine addition.

---

## 4. Two authority classes

### Evidence plane — immutable source material

- Raw, append-only, content-addressed.
- Authority key is `(sourceSystem, sourceNativeId, contentHash)` — **not** a git SHA.
- **Cannot** use `intelligence_hub.knowledge_objects` (see §2.4).
- Requires a new `conversation-capture` / `raw-evidence` domain registered in
  `registry/intelligence-hub-domains/`.

### Derived intelligence plane — replaceable interpretations

Concepts · decisions · projects · engines/components · dependencies · blockers · objectives ·
North Stars · tasks · ideas · opportunities · duplicate efforts · contradictions · convergence
candidates · project momentum · project state · ROI hypotheses.

Every derived object must carry:

| Field | Purpose |
| --- | --- |
| `derivedFrom[]` | evidence hashes that caused it to exist |
| `extractorId` / `extractorVersion` | which extractor produced it |
| `extractorModel` / `promptHash` / `algorithmVersion` | reproducibility of the interpretation |
| `extractedAt` | when |

**Derived intelligence is disposable by design.** Dropping and rebuilding the entire derived
plane must be a supported, tested operation — that is the property that makes future
extractors retroactively increase the value of old context.

---

## 5. Graph

**Do not adopt a new graph database.** Cross-Agent already owns a working relationship graph
(`relationship-edge-builder-v1.mjs`, `mission-graph-queries-v1.mjs`) projected into
`intelligence_hub.relationships`, and `knowledge.knowledge_relationships` already carries a
27-value type enum with traversal-aware fields.

**Nodes:** `PROJECT` `ENGINE` `COMPONENT` `CONCEPT` `DECISION` `DEPENDENCY` `MISSION`
`SESSION` `REPOSITORY` `COMMIT` `ARTIFACT` `AGENT` `NORTH_STAR` `IDEA` — plus `EVIDENCE` as
the terminal provenance node.

**Edges:** `DEPENDS_ON` `BLOCKS` `IMPLEMENTS` `SUPERSEDES` `DERIVED_FROM` `DISCUSSED_IN`
`CREATED_BY` `USED_BY` `DUPLICATES` `CONTRADICTS` `SHOULD_MERGE_WITH` `ADVANCES_NORTH_STAR`
`WAITING_ON` `PRODUCED` `MODIFIED`

New types must be added to `contracts/intelligence/registries/knowledge-relationship-types-v1.json`
under its existing rules: **additive only** (minor version bump), redefinition forbidden in
place, removal forbidden (use `status: DEPRECATED`). `DERIVED_FROM` already exists there.

---

## 6. Automatic capture — honest feasibility

Wesley must never have to manually export transcripts daily. What is actually achievable:

| Source | Mechanism | Class | Reality |
| --- | --- | --- | --- |
| **Claude Code** | `~/.claude/projects/**/*.jsonl` + `<sessionId>/subagents/` | **native deterministic (filesystem)** | Best source. Full DAG (`uuid`/`parentUuid`), `cwd`, `gitBranch`, per-message `message.usage`, tool results. **~2-day retention — capture is urgent.** |
| **Git / GitHub** | `git log`, hooks, `gh` API | **native deterministic** | `scripts/hooks/post-commit.mjs` exists in AppBuilder but `.git/hooks/` is empty — written, never installed. |
| **WaveRunner / agent runtime** | `artifacts/agent-runs/**` receipts | **native deterministic** | 430 mission dirs; `mission.json` carries `{repository, branch, baselineCommit}`; `session-closeout-v3.2.json` carries `intelligenceReused` provenance edges. |
| **Documents / artifacts** | filesystem + existing harvest | **native deterministic** | Existing harvest pipeline covers much of this. |
| **Cursor** | Windows `state.vscdb` (499 MB, 16,804 `bubbleId:` rows, 64 `composerHeaders`, 13 MB uncommitted WAL) + thin WSL CLI JSONL | **filesystem/session-log** | No API. Must be read **WAL-aware** and strictly read-only. WSL transcripts lack timestamps/token usage. |
| **ChatGPT** | — | **export/import fallback ONLY** | **No automatic capture exists.** Nothing on this machine; no desktop app; no local store. Requires manual export from chatgpt.com. Claiming automation here would be false. |
| System prompts / provider-side context | — | **technically unavailable** | Not exposed by any of these sources. |

---

## 7. Implementation ownership matrix

| Component | Authority repo | Implementation repo | Persistence authority | Runtime | Producer | Consumer |
| --- | --- | --- | --- | --- | --- | --- |
| Context Ledger domain model + contracts | Cross-Agent | Cross-Agent | n/a (Git) | n/a | Cross-Agent | all |
| Evidence schema definition | Cross-Agent | Cross-Agent | **Phase 0 gate** (§2.3) | n/a | Cross-Agent | Hub |
| Capture service / sweep | Cross-Agent | Cross-Agent | Hub data plane | WSL host | Cross-Agent | Cross-Agent |
| Claude Code adapter | Cross-Agent | Cross-Agent | Hub data plane | WSL host | Cross-Agent | Cross-Agent |
| Cursor adapter | Cross-Agent | Cross-Agent | Hub data plane | WSL host | Cross-Agent | Cross-Agent |
| ChatGPT import adapter | Cross-Agent | Cross-Agent | Hub data plane | manual trigger | Wesley → Cross-Agent | Cross-Agent |
| Deterministic ID / hash / provenance | Cross-Agent | Cross-Agent | n/a | n/a | Cross-Agent | all |
| Session reconstruction | Cross-Agent | Cross-Agent | Hub data plane | WSL host | Cross-Agent | Cross-Agent |
| Extraction pipeline (versioned) | Cross-Agent | Cross-Agent | Hub data plane | WSL host | Cross-Agent | graph |
| Graph build + projection | Cross-Agent | Cross-Agent | `intelligence_hub.relationships` | WSL host | Cross-Agent | executive layer |
| Migration execution | **unresolved — Phase 0** | AppBuilder (by possession) | Supabase `xjivcwcyyimjujbchwdf` | — | — | — |
| Object store blobs | Intelligence Hub | — | **L: / external object store** | Hub | Cross-Agent | Cross-Agent |
| Hub ingestion route | AppBuilder | AppBuilder | Hub | Hub | Cross-Agent | Hub |
| Mission/session evidence production | AppBuilder | AppBuilder | `artifacts/agent-runs/` | AppBuilder | AppBuilder | Cross-Agent |
| Governance / protocol authority | CG-Platform-Governance-MCP | Governance | — | — | — | — |
| Idea consumption | capital-glass-idea-vault | Idea Vault | Idea Vault | — | Cross-Agent | Idea Vault |
| Executive UI | **deferred** | cg-apps-hub or new app | reads Hub | — | — | Wesley |

**The repository must never hold captured data.** Code, contracts, schemas, adapters, graph
logic and tests belong in Cross-Agent. Transcripts, raw payloads, tool results, attachments,
embeddings, accumulated graph data and historical session records belong in the Hub data
plane.

---

## 8. Executive intelligence layer — future acceptance requirements

Not built in this initiative. Preserved as acceptance criteria for Phase 8. The system must
eventually answer:

What am I actively building? · What changed today? · What is stalled? · What is waiting on
something else? · What should merge? · Where am I duplicating effort? · What previous work
relates to this? · What are my active North Stars? · Which work has the most momentum? ·
What are the highest-leverage next moves? · Which projects have been forgotten? · Why does
this component exist? · What conversation caused this architectural decision? · What
downstream systems depend on this?

---

## 9. Phased execution plan

| Phase | Goal | Acceptance criteria | Evidence |
| --- | --- | --- | --- |
| **0** | Authority + current-state discovery | Schema authority for the Evidence plane **explicitly resolved and recorded** (Cross-Agent contract vs AppBuilder migration execution); `schemaAuthority: null` closed; external object-store target chosen and reachable | Decision log entry + authority-estate record |
| **1** | Immutable Context Ledger contract | Evidence schema, deterministic IDs, hash contract, provenance, dedup, completeness states, redaction policy — all versioned and validated by fixtures | Contracts under `contracts/context-ledger/` + passing schema tests |
| **2** | One-source end-to-end capture proof | **Claude Code only.** Zero-loss, byte-exact replay, idempotent re-sweep, write-once enforced, cross-host dedup, secret quarantine | Capture receipts + integrity report |
| **3** | Source adapters | Cursor (WAL-aware) and ChatGPT (import) added without changing the Evidence contract | Per-adapter proofs |
| **4** | Git / mission / artifact correlation | Sessions bound to real repos, worktrees, branches, commits, PRs, artifacts | Correlation report against `git log` + `artifacts/agent-runs/` |
| **5** | Repeatable extraction | Derived plane **dropped and rebuilt** from evidence with identical results; extractor version recorded | Rebuild diff report |
| **6** | Graph projection | Derived objects + edges projected via existing OP-00A path; every edge traceable to evidence | Graph integrity + lineage proof |
| **7** | Cross-project reasoning | Convergence, duplication, blocking, momentum answered across repos | Reasoning evaluation set |
| **8** | Executive UI | §8 questions answered from real data | Acceptance walkthrough |
| **9** | Historical backfill / reprocessing | Old evidence reprocessed by a newer extractor; **original evidence provably unchanged** | Before/after hashes identical |

---

## 10. Primary acceptance proof

> Take one genuine AI work session from beginning to end; capture every obtainable
> message/event immutably; bind it to its actual repo/worktree/commits/artifacts; derive
> intelligence from it; **discard and rebuild** the derived intelligence; and prove the
> original context remained byte-for-byte untouched and can reconstruct **why** the resulting
> work exists.

That is the foundational PASS.

---

## 11. Architectural conflicts and authority gaps

| # | Conflict / gap | Resolution |
| --- | --- | --- |
| 1 | `AGENT_START_HERE.md` "must not become the work" vs `OWNERSHIP.md` `ARCHITECTURE_LOCKED` naming Cross-Agent `INTELLIGENCE_OWNER`, and vs 282 existing script files | **Resolved** — doctrine superseded by `CAD-20260830-cross-agent-software-home-not-datastore` |
| 2 | `knowledge_objects.authority_commit` is a NOT NULL git SHA; conversations have none | **Resolved by design** — separate Evidence plane with its own authority key |
| 3 | AppBuilder holds 82 migrations but registered `schemaAuthority` is `null` | **OPEN — Phase 0 gate.** Do not add Evidence-plane migrations to AppBuilder until resolved |
| 4 | `ingestion-source-registry.json` prohibits `uncontrolled-filesystem-crawl` | Register a named `claude-code-transcripts` source class **before** any sweep |
| 5 | Hub apply-ingest gated shut (`materialIngestApplyAuthorized: false`, `defaultMode: dry-run`) and CLAUDE.md forbids direct `L:` writes | Phase 2 lands WSL-first on ext4; Hub promotion deferred until the gate opens |
| 6 | `publish-object.mjs` write is not atomic and blobs are not read-only | Harden in place (benefits the live 626-blob store), not in a private fork |
| 7 | Claude transcript retention ~2 days | **Highest-urgency risk.** Phase 2 should be scheduled immediately on pass |

---

## 12. Next execution mission

**`context-ledger-phase-0-authority-resolution-v1`**

Resolve Evidence-plane schema authority (gap #3), choose and prove reachability of the
external object-store target, register the `claude-code-transcripts` ingestion source class
(gap #4), and record both in the authority estate. **No capture code until Phase 0 closes.**

Then: `context-ledger-phase-2-claude-capture-proof-v1` — first vertical slice, Claude Code
only, one source → capture service → immutable external storage → hash/provenance → session
record → retrieval → integrity verification. No graph, no dashboard, no ROI scoring.


---

# LOCKED — Context Ledger storage architecture (2026-08-31)

Supersedes all earlier storage topology in this document.

```
                   AI WORK
                     |
                     v
            WSL WRITE-AHEAD SPOOL          capture immediately / fast
                     |
        hash + ENCRYPT + manifest          encryption happens HERE, before
                     |                     either drive receives anything
             +-------+-------+
             v               v
    SYNOLOGY / cg-server    L: / wesleydesk
    PRIMARY VAULT           BACKUP VAULT
    canonical authority     independent recovery copy
             |               |
      independent hash  independent hash
             +-------+-------+
                     v
              FULLY_PROTECTED
                     |
                     v
             INTELLIGENCE HUB
     indexes / graph / concepts / decisions /
       relationships / provenance / ROI
```

## The load-bearing decision: independent fan-out

**Both copies are written from the WSL spool, independently. The backup is NEVER derived
from the primary.** If the Synology is failing, the backup path must not be a dependent of
the thing that is failing. `storageLocator` splits `primary` and `backup` as sibling objects
precisely so no implementation can quietly make one a function of the other.

Both targets have native transports, verified 2026-08-31:

| Target | Tailscale | SSH 22 | SMB 445 | Role |
| --- | --- | --- | --- | --- |
| `cg-server` (Synology) | `100.112.81.50` | OPEN | OPEN | primary / canonical authority |
| `wesleydesk` | `100.93.199.27` | OPEN | OPEN | backup / independent recovery copy |

Neither leg goes through `/mnt/z` or `/mnt/l`. The 9p/drvfs path measured 4.7 MB/s and
~1 small file per 180 s and is excluded from both.

## Encrypt before storage

Captured context contains credentials, internal code, tool results and filesystem paths.
**Cross-Agent encrypts the evidence object in WSL before either drive sees it.** Neither
drive is trusted to provide confidentiality — and DSM share encryption is currently
`DISABLED` on this NAS anyway, so relying on it would have been relying on nothing.

Keys live in the approved secret system (Doppler), referenced by NAME only. Never on either
drive, never in Git, never in a receipt. Authenticated encryption (AES-256-GCM) is required:
a plain stream cipher would give confidentiality without tamper detection.

Two hashes, deliberately distinct:

- `plaintextHash` — identity and dedup. Two observations of identical plaintext converge on
  one canonical object.
- `ciphertextHash` — what the remote re-hash compares against, since the bytes at rest are
  ciphertext.

## The backup is a backup, not a mirror

`propagationPolicy.deletesPropagate` and `modificationsPropagate` are both `const: false` in
the contract — not defaults, constants. **A delete or corruption on the Synology must never be
obediently reproduced on the backup.** Evidence objects are content-addressed and append-only.
The backup keeps its own manifests and its own verification history rather than trusting the
primary's.

## Spool retention

```
CAPTURED_LOCAL -> HASHED_ENCRYPTED -> PRIMARY_VERIFIED -> BACKUP_VERIFIED -> FULLY_PROTECTED
```

`PRIMARY_VERIFIED` **never** authorises spool cleanup. Only `FULLY_PROTECTED` does, and it
requires `plaintextHash == primary verified hash == backup verified hash`, each re-hashed at
its own end rather than predicted locally. `INTEGRITY_INCIDENT` is terminal until a human
resolves it.

## Storage roles stay distinct

| Plane | Role |
| --- | --- |
| Synology `cg-server` | canonical raw-evidence authority; Btrfs, snapshots, WORM as strongly as DSM allows |
| `wesleydesk` L: | independent recovery copy. **Not** an authority. Does not run the Intelligence Hub |
| Intelligence Hub | intelligence plane — concepts, decisions, dependencies, graph edges, project state, provenance pointers. **References** immutable evidence; never becomes the raw archive |
| CapitalGlass-Cross-Agent | the software: capture, hashing, encryption, session reconstruction, replication, provenance, extraction, graph construction |

## Built in from day one, not bolted on later

**Integrity scrub.** Periodically sample and eventually traverse evidence objects verifying
`ledger hash <-> primary hash <-> backup hash`. Any divergence raises an integrity incident
immediately — a mutated blob is never silently accepted as the new truth.

**Restore proof.** Periodically perform a real restore from the backup. `lastRestoreProofAt`
exists because *a backup is not proven by files existing there; it is proven when evidence can
be reconstructed from it.*

## Known residual weakness — accepted, not hidden

`cg-server` and `wesleydesk` appear to be in the same physical environment. This architecture
protects strongly against drive failure, NAS failure, machine failure, corruption, ransomware
and accidental deletion. **It does not protect against a building-level event** — fire, flood,
theft.

An encrypted off-site third copy is the eventual answer. It is deliberately **not** a blocker
for what is being built now, but it is recorded here so it is a decision rather than an
oversight.


---

# CORRECTION — immutable proof, not just immutable blobs (2026-08-31)

An earlier draft concluded that manifests and the hash-chained ledger should live on a normal
share, because a monolithic append-to-one-file ledger conflicts with WORM auto-lock. That was
the wrong trade: it solved a **persistence-shape** problem by weakening a **storage
guarantee**, leaving every historical proof mutable.

The corrected invariant:

> **Historical evidence and historical proof are immutable. Only operational state is
> mutable.**

Strictly stronger than "blobs immutable, everything describing them mutable."

## Persistence shape

| Was | Is |
| --- | --- |
| `ledger.jsonl` appended forever | `ledger-entries/entry-000001.json`, one immutable file per event |
| `manifest.json` reopened and extended | `manifests/{batchId}.json`, one immutable manifest per batch |

Each entry still carries `prevHash` + `entryHash`, so the chain is unchanged — only the
container changes. No file is ever reopened.

The **mutable head pointer** lives on the normal metadata share and is an optimisation, not an
authority: if it is lost, the head is rebuilt by scanning `ledger-entries/` and following the
chain. A lost pointer costs time, never integrity.

## Vault lifecycle

The first Enterprise vault is explicitly a **PROVING / PRE-PRODUCTION VAULT**. Enterprise must
not quietly become permanent production merely because it works. The Compliance-mode
production vault is created fresh, later, and promoted into deliberately once the contract is
stable.

Retention on the proving vault is deliberately **bounded** — long enough to exercise locking,
short enough that a mistake is not painful. Multi-year production retention is not hard-coded
until the lifecycle is proven.

## Byte-identical copies

The encrypted object bytes must be identical at both destinations:

```
ciphertextHash(Synology) == ciphertextHash(L:)
```

while `plaintextHash` remains the canonical content identity and dedup key. Both destinations
are written independently from the WSL spool; neither is derived from the other.

## Required before creating the irreversible Compliance vault

Eleven behaviours must be deliberately exercised on the proving vault first. We do not lock
anything permanently until we know how it fails.

| # | Test |
| --- | --- |
| 1 | duplicate object ingestion |
| 2 | interrupted transfer |
| 3 | corrupted remote object |
| 4 | loss of Synology during replication |
| 5 | loss of WESLEYDESK during replication |
| 6 | ledger head recovery (pointer lost, chain rebuilt by scan) |
| 7 | restoration **exclusively** from L: |
| 8 | encryption/decryption recovery using the real key-management procedure |
| 9 | retention expiry behaviour |
| 10 | attempted deletion of a locked object |
| 11 | attempted mutation of an existing object |

Tests 7 and 8 are the ones most often skipped and most consequential: a backup is proven by
reconstruction, and a key procedure is proven by recovering data with it — not by the
existence of files or of a key.


## Concurrency: the head transition is compare-and-swap

Locked before a second adapter exists, because a forked chain is only discoverable after the
evidence needed to diagnose it is already wrong.

**`seq` is ordering assistance. It is never identity and never authority.** The identity of an
entry is `entryHash`; the truth of history is the `prevHash`/`entryHash` chain. Never resolve
an entry by `seq`, never assume it is gap-free, never treat a `seq` collision as meaningful.

The append primitive MUST advance the head by **compare-and-swap**: the write succeeds only if
the current head still equals `expectedPrevHash`. A losing writer re-reads the head and
retries against the new predecessor. `seq` is allocated by the winner *inside* the CAS, which
keeps numbering unique without making it authoritative.

Appending without CAS is a contract violation even where it appears to work under a single
worker — that is exactly the condition under which the bug hides.

**Two entries claiming the same `prevHash` is a fork.** It raises `INTEGRITY_INCIDENT`. It is
never auto-merged, and never resolved by preferring a lower `seq` or an earlier timestamp:
both branches are preserved for a human. Silently choosing a winner would destroy the evidence
that the fork happened.

One implementation consequence: prefer deriving the entry filename from `entryHash` rather
than `seq`. A content-derived name cannot collide. Two writers independently computing `seq+1`
*would* collide, and would then be relying on the WORM layer refusing the overwrite — an
accident of storage rather than a designed guarantee.

---

# ARCHITECTURE LOCKED

No further architectural changes pending. The remaining work is implementation, gated on three
DSM operations.
