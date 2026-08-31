# context-ledger-phase-0-authority-resolution-v1 — Phase 0 Findings

| Field | Value |
| --- | --- |
| Work package | `context-ledger-phase-0-authority-resolution-v1` |
| Parent | `immutable-context-ledger-v1` |
| Status | **BLOCKED — 5 of 7 items resolved; canonical object-storage target requires an operator authority decision** |
| Verdict | `CG_CONTEXT_LEDGER_PHASE_0_AUTHORITY_V1_BLOCKED` |
| Date | 2026-08-30 |

Emergency preservation completed **before** this phase and is independent of it —
`PRESERVATION_CHECKPOINT_PASS`, 502 files / 183,402,493 bytes. See
`artifacts/agent-runs/immutable-context-ledger-v1/preservation-checkpoint-v1.json`.

---

## Item 1 — Evidence-plane persistence/schema authority — **RESOLVED**

### Live evidence

`registry.migration_authority` on `xjivcwcyyimjujbchwdf` holds 8 domains:
`bid-composer`, `catalog`, `contacts`, `document-center`, `integration`, `pipeline`, `po`,
`proposal`.

Two facts settle this:

1. **No domain covers intelligence, evidence, or context.** The nearest is `integration` →
   `CG-AppBuilder-MCP`, whose `known_gaps` reads *"Control-plane migrations; shared DB
   coordination model."*
2. **Not one row is `verified`.** Every `verification_status` is `discovered`;
   `authority_status` values are `inferred` (4), `transitional` (2), `unverified` (1),
   `drift_detected` (1). The table's own constraint
   `CHECK (authority_status <> 'verified' OR verification_status = 'verified')` means nothing
   in this estate currently claims verified schema authority.

**This is why AppBuilder's registered `schemaAuthority` reads `null` — it is not an AppBuilder
defect. No domain in the registry has verified authority.**

### Cross-Agent performs zero DDL

`scripts/intelligence/lib/supabase-intelligence-store-v1.mjs` contains no `CREATE TABLE`,
`ALTER TABLE`, `CREATE SCHEMA`, or migration reference. It is pure DML —
`.schema('intelligence_hub').from(table).select(...)` / `.upsert(...)`. The established,
evidenced split is therefore:

| Concern | Owner | Basis |
| --- | --- | --- |
| Evidence-plane schema **contract** (meaning, invariants, versioning) | **CapitalGlass-Cross-Agent** | `OWNERSHIP.md` `ARCHITECTURE_LOCKED` — `INTELLIGENCE_OWNER` |
| Migration **execution** (DDL against the DB) | **CG-AppBuilder-MCP** | Possesses `supabase/`, `config.toml`, linked project ref; 82 migrations |
| Evidence **DML** (insert/upsert of evidence index rows) | **CapitalGlass-Cross-Agent** | Existing proven pattern |
| Durable blob payloads | **External object store** | Never Git; see Item 2 |

**Declaration required (not performed — needs operator approval):** insert a `registry.domains`
row plus a `registry.migration_authority` row for a new domain `context-evidence` with
`canonical_repo_key = 'CG-AppBuilder-MCP'`, `authority_status = 'transitional'`, and
`known_gaps` recording that the schema contract is owned by Cross-Agent. This is a live
database write and is deliberately left for explicit authorization.

---

## Item 2 — Canonical immutable object-storage target — **BLOCKED**

This is the blocker. Three candidates, all failing for different reasons.

### L: — `/mnt/l/Capital-Glass-Intelligence-Hub/`

| Property | Finding |
| --- | --- |
| Filesystem | 9p drvfs passthrough (WSL → Windows) |
| Capacity | 20 TB, 103 G used, **1% — ample** |
| Performance | `du` over `01-object-store` **exceeded 120 s** — slow for bulk work |
| Object store | Live: 626 blobs, 691 catalog entries |
| **Control plane** | **`00-hub-control/` contains only `OPERATIONAL-EDGE-POINTER.json` and `README.md`** |

`HUB_LOCAL_LAYOUT.v1.json` requires **10** control files there — `storage-policy.json`,
`retention-policy.json`, `security-policy.json`, `relationship-types.json`,
`invalidation-policy.json`, `domain-registry.json` and others. **Eight are missing. There is no
storage policy and no retention policy governing this store.**

Worse, the live `00-hub-control/README.md` states:

> **Accepted artifact types:** manifests, indexes, receipts
> **Prohibited content:** secrets, full repo clones, SharePoint mirrors

**Raw AI transcripts are none of the three accepted types, and they routinely contain pasted
credentials.** Declaring L: the Evidence blob store would violate the Hub's own stated
boundary. Additionally, direct `L:` writes are forbidden by estate rule and Hub apply-ingest is
gated (`materialIngestApplyAuthorized: false`, `defaultMode: dry-run`).

### Z: — `/mnt/z/`

Also 9p. Governed by `CAD-20260802-z-ai-cache-single-canonical-authority`: Z: is the AI-Cache
authority with a single canonical writer. Evidence storage is the wrong purpose and would
violate that decision. The Hub's own pointer marks the Z: edge `edgeIsAuthoritative: false`.

### WSL ext4 — `~/.capital-glass/` (current preservation location)

Works, fast, 940 G free, and correctly outside Git. **But it is host-local to `CG-NIMO-01`,
single-copy, with no replication or backup story.** Adequate for an emergency checkpoint —
**not** adequate as the canonical durable Evidence store, which must outlive any one machine.

### The decision that is needed

The canonical immutable object store must be a location that is (a) durable and replicated,
(b) authorized to hold raw conversational payloads that may contain secrets, and (c) governed
by an explicit storage and retention policy. **No existing approved location satisfies all
three today.** Options for the operator:

1. **Amend the Hub's `00-hub-control` boundary** to accept a new artifact class (raw evidence
   payload), and provision the 8 missing control files including `storage-policy.json` and
   `retention-policy.json`. Then L: `01-object-store` becomes legitimate.
2. **Designate a Synology/NAS path** as the Evidence store with its own policy files.
3. **Use Supabase Storage** (bucket `mcp-artifacts` exists) — network-durable, but couples
   capture to network availability and cost.
4. **Accept host-local ext4 with a defined replication job** as an explicit interim, with the
   risk recorded.

**Phase 2 must not start until this is decided.** The preservation checkpoint holds the corpus
safely in the meantime.

---

## Item 3 — Register `claude-code-transcripts` ingestion source class — **BLOCKED (access)**

The registry is `CG-AppBuilder-MCP/intelligence-hub/buildout/ingestion-source-registry.json` —
a different repo, whose checkout mutation lease is currently held by session
`c94f6280-1532-470e-ade0-c2ba5b69517d` (mission `wsl-first-control-plane-phase0-v1`). It was
not modified.

The registration is required because that file's `prohibitedSources` list contains
`uncontrolled-filesystem-crawl`; an unregistered sweep of `~/.claude/projects` is
indistinguishable from it. Required entry:

```
sourceClassId:          claude-code-transcripts
authorityClass:         AGENT_SESSION_EVIDENCE
approvedProducers:      [CapitalGlass-Cross-Agent]
initialProvenanceClass: DISCOVERED
accessMode:             READ_ONLY
sourceRoots:            [~/.claude/projects, /mnt/c/Users/<user>/.claude/projects]
```

Note this only affects **Hub ingestion**, not the emergency preservation already completed —
preservation is not ingestion.

---

## Item 4 — `authority_commit` incompatibility — **RESOLVED by design**

**Do not modify `knowledge_objects.authority_commit`.** That constraint is doing its job:
`knowledge_objects` encodes a Git-derived authority model where every object traces to a
commit. Conversations have no commit, so they get their own identity:

```
evidenceId = f(sourceSystem, sourceNativeId, contentHash)
```

Derived Hub objects then point back to evidence with a `DERIVED_FROM` edge — the type already
exists as `ACTIVE` in `contracts/intelligence/registries/knowledge-relationship-types-v1.json`.
Git-derived authority and conversational authority stay clean and separate; neither model is
contaminated to accommodate the other.

---

## Item 5 — Shared append-ledger / hash-chain primitive — **RESOLVED: belongs in Cross-Agent**

It must exist **before** source-specific adapters proliferate. Required shape:

```
Source Adapter → Canonical Evidence Envelope → hash / identity / dedupe
               → immutable blob → ledger record → receipt
```

**The adapter knows how to read its source. It must not know how evidence storage works.**
That separation is what keeps a 499 MB Cursor SQLite store with an active WAL from infecting
the architecture — its acquisition complexity stays at the edge and it terminates into the same
envelope as Claude JSONL.

The estate has **no** hash-chaining anywhere today — roughly 20 hand-rolled `appendFileSync`
writers, no `prevHash`, no shared primitive. Definition:

```
entry = { seq, recordedAt, prevHash, entryHash, sourceRef, evidenceId, objectHash, disposition }
entryHash = sha256(canonicalJson(entry without entryHash) + prevHash)
```

Canonicalization must reuse the existing contract (sorted keys, UTF-8, no insignificant
whitespace) — two canonicalizers that disagree by one byte silently fork the store.

---

## Item 6 — Atomic-write and immutability requirements for the external blob store

Mandatory for any candidate target:

1. **Write-once.** A differing body at an existing content-addressed path is a hard error, never
   an overwrite. `publish-object.mjs` already throws `Object store idempotency violation` —
   reuse those semantics.
2. **Atomic publish.** Write to a temporary name on the *same* filesystem, then `rename()`.
   `publish-object.mjs` today is a plain `writeFileSync` — a crash mid-write leaves a truncated
   blob at a path whose name claims a hash it no longer matches. **Harden in place** so the
   live 626-blob store benefits; do not fork.
3. **Read-only after publish** (`0400`), directories `0700`.
4. **Verify-after-write.** Re-hash the written blob and compare before recording the ledger
   entry.
5. **No deletion.** Redaction replaces payload with a tombstone retaining hash, provenance and
   reason. Supersession is an edge, never a delete.
6. **Fsync + durability** before the ledger entry is considered committed.
7. **9p caveat.** If the target is a 9p mount, `rename()` atomicity and `fsync` semantics must
   be proven by test, not assumed.

---

## Item 7 — Phase 2 implementation contract

Deferred until Item 2 is decided — the contract cannot name a storage target that does not yet
exist. Everything else is specified above and in
`work-progress/projects/2026-08-30_immutable-context-ledger-v1.md` §9.

---

## Verdict

`CG_CONTEXT_LEDGER_PHASE_0_AUTHORITY_V1_BLOCKED`

**Blocker:** no currently-approved storage location is simultaneously durable/replicated,
authorized to hold raw conversational payloads that may contain secrets, and governed by an
explicit storage and retention policy. The Hub's `00-hub-control/` is missing 8 of its 10
required control files, and its live README restricts accepted artifacts to manifests, indexes,
and receipts.

**Secondary blocker:** the ingestion source class must be registered in CG-AppBuilder-MCP,
whose checkout lease is held by another session.

**Not blocked, and already done:** the corpus is preserved and hash-verified.

**Next:** operator decision on Item 2, then `context-ledger-phase-2-claude-capture-proof-v1`.
