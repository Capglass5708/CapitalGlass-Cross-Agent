# context-ledger-phase-0-authority-resolution-v1 — Phase 0 Findings

| Field | Value |
| --- | --- |
| Work package | `context-ledger-phase-0-authority-resolution-v1` |
| Parent | `immutable-context-ledger-v1` |
| Status | **STORAGE DECIDED + AUTHORITY REGISTERED — 1 blocker remains: NAS transport credentials** |
| Verdict | `CG_CONTEXT_LEDGER_PHASE_0_AUTHORITY_V1_BLOCKED` (blocker narrowed — see Addendum) |
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


---

# ADDENDUM — 2026-08-30, operator decision executed

**DECISION: NAS-backed Evidence Vault.** Recorded and acted on.

## Storage topology resolved from Windows, not assumed

| Drive | Actual UNC | What it really is |
| --- | --- | --- |
| `Z:` | `\\cg-server\Capital Glass` | **The Synology.** 5.3 TB, 1.3 TB used, 4.0 TB free (24%). `#snapshot` and `#recycle` present — Btrfs snapshot protection is active. |
| `L:` | `\\wesleydesk\CapitalGlass-L` | **A share on the `wesleydesk` desktop — not a NAS at all.** |

**This corrects an assumption that has been carried through the estate's docs.** The
"canonical intelligence store" on `L:` lives on a desktop workstation, not on protected
storage. That independently reinforces the decision not to place durable raw evidence there.

## Canonical path — resolved against the live registry

`Z:\INDEX.json` (`schemaVersion: capital-glass-z-drive-index-v1`) declares `canonicalRoots[]`
with hyphenated `Capital-Glass-*` naming and a `protectedPathsDoNotMove` list. Following that
convention, the Evidence Vault is a **new top-level root**, not nested inside
`Capital-Glass-Agent-Operations` or any cache directory:

```
Z:\Capital-Glass-AI-Evidence-Vault\      (= \\cg-server\Capital Glass\Capital-Glass-AI-Evidence-Vault)
```

Root created and marked with a `README.md` declaring it provisioned-but-not-in-production.
It does not touch `AI-Cache-Authority`, so `CAD-20260802`'s single-writer rule is unaffected.

## Measured transport characteristics — the 9p path is not viable

| Test | Result |
| --- | --- |
| Sequential write, 32 MB | **4.7 MB/s** |
| Many small files, 200 x 4 KB | **timed out at 180 s having written 1 file** |
| `du` of L: object store (28 MB, 626 blobs) | **exceeded 120 s** |
| Atomic `rename()` + hash round-trip | **PASS** |
| `chmod 0400` | **FAILS — "Operation not permitted"; 0400 does not block append** |

Two hard consequences:

1. **Per-file writes over Windows drvfs/9p are unusable.** Replication to the vault must be
   batched/packed, and should bypass drvfs entirely.
2. **Write-once cannot be enforced by POSIX file mode on this mount.** Immutability must come
   from Synology-side controls (WORM/immutable shares, snapshot retention) plus mandatory
   hash verification — never from `chmod`.

## A direct, fast path exists — blocked only on credentials

`cg-server` resolves to **`100.112.81.50` / `cg-server.tail49f063.ts.net` — Tailscale.**
From WSL: **SMB port 445 OPEN, SSH port 22 OPEN.** `cifs-utils`, `rsync` and `ssh` are all
installed.

A non-interactive SSH probe returned `Permission denied (publickey,password)`. There is no
`~/.ssh` key for this host, no `~/.smbcredentials`, and no NAS entry in
`~/.config/capital-glass/`. **No credentials were guessed, extracted, or created.**

> **BLOCKER:** provide either an SSH key authorized on `cg-server` (for `rsync`) or CIFS
> credentials (for a direct WSL mount of `//cg-server/Capital Glass`). Either removes the 9p
> bottleneck entirely.

## Schema authority — REGISTERED AND VERIFIED

A gap was found first: **`CapitalGlass-Cross-Agent` did not exist in `registry.repositories`**,
despite `OWNERSHIP.md` naming it `INTELLIGENCE_OWNER`. Registering the domain was impossible
until that was closed.

Three rows now written to `xjivcwcyyimjujbchwdf`:

| Table | Key | Result |
| --- | --- | --- |
| `registry.repositories` | `CapitalGlass-Cross-Agent` | `verification_status = verified`, `classification = control_plane` |
| `registry.domains` | `context_evidence` | `authority_status = verified`, `verification_status = verified` |
| `registry.migration_authority` | `context_evidence` | `authority_status = verified` -> `canonical_repo_key = CG-AppBuilder-MCP` |

Ownership split, as decided:

| Concern | Owner |
| --- | --- |
| Contract / domain owner | CapitalGlass-Cross-Agent |
| Migration executor | CG-AppBuilder-MCP |
| Runtime / DML owner | CapitalGlass-Cross-Agent |

`context_evidence` is the **first and only `authority_status = verified` row in
`registry.migration_authority`** — every pre-existing domain is `inferred`, `transitional`,
`unverified`, or `drift_detected`. The estate-wide `schemaAuthority = null` condition is
closed for this domain and the mechanism to close it for others is now demonstrated.

## Evidence / ledger separation — contract written

`contracts/context-ledger/evidence-ledger-entry-v1.schema.json` implements the separation:
the blob is addressed purely by `contentHash`, while the ledger entry records one
**observation** (`sourceSystem`, `sourceNativeId`, `contentHash`, timestamps, machine,
session, repo binding, `prevHash`/`entryHash`, `storageLocator`, `durabilityState`).

Deduplication therefore falls out naturally: the overlapping WSL and Windows Claude corpora
yield **two observations pointing at one canonical blob**, never two blobs.

`durabilityState` enforces the state machine `CAPTURED_LOCAL -> HASHED -> REPLICATING ->
DURABLE -> VERIFIED`, and nothing may claim `DURABLE` on local-only evidence. If the NAS is
offline, capture continues into the spool and simply cannot advance past `HASHED`.

## Remaining before production

Governance still to be provisioned and proven — most require Synology DSM operator action and
cannot be done from WSL: ACL/access policy, encryption-at-rest status, retention policy,
replication/backup policy, immutable/WORM semantics, deletion/redaction process,
secret-bearing classification, integrity-verification policy, storage-health monitoring,
capacity thresholds, disaster-recovery procedure.

`claude-code-transcripts` registration in AppBuilder remains outstanding; that repo's lease is
still held by session `c94f6280` and **was not bypassed**.


---

# ADDENDUM 2 — Topology locked, transport chosen, exit criteria narrowed

## Locked ingestion topology

```
source → Cross-Agent capture adapter → WSL ext4 spool → hash + canonical envelope
       → batch replication over NATIVE network path → Synology Evidence Vault
       → independent REMOTE hash verification → DURABLE / VERIFIED
       → ledger metadata → Intelligence Hub derived intelligence
```

**The Context Ledger must never write through `/mnt/z`.** The Windows `Z:` mapping remains
useful to humans but is excluded from the machine ingestion path. `replication-batch-v1`
enforces this in contract: `remoteRoot` is a registered storage-root id, explicitly *"NEVER a
/mnt/z drvfs path."*

## Transport decision: SSH + rsync (primary), CIFS (fallback)

Chosen because the architecture wants a **batch replication worker**, not a permanently
mounted filesystem: no long-lived mount, no reusable SMB password in user config, clean
staging and verification, straightforward retry/resume, a tightly restricted NAS service
account, and local capture that stays fully independent of NAS availability.

Prepared on `CG-NIMO-01`:

| Item | Value |
| --- | --- |
| Service identity | `cg-context-ledger` (**not** Wesley's general NAS identity) |
| Key | `~/.ssh/cg-context-ledger_ed25519`, ed25519, mode `600` |
| Fingerprint | `SHA256:Cf2lFNe83DVh7izV8yljX3Z8nwxbKL1WCgEZjByy50o` |
| SSH alias | `cg-vault` → `cg-server`, `IdentitiesOnly yes`, `BatchMode yes` |
| Current state | `Permission denied (publickey,password)` — account/key not yet installed on the NAS |

The key is passphrase-less because replication is unattended; that is compensated at the NAS
end by a forced rsync command in `authorized_keys` plus Tailscale-only reachability. Steps in
`runbooks/CONTEXT_LEDGER_NAS_PROVISIONING_RUNBOOK.md`.

## Immutability is not a file mode

`0400 == immutable` is **false** on this transport and must never be claimed. Immutability is
the combination of content addressing, **collision refusal**, the hash-chained ledger,
independent remote re-hash before `VERIFIED`, and NAS-side snapshot/WORM/retention controls.

After `VERIFIED`, a periodic sample-and-re-hash job is an independent integrity monitor.
`replication-batch-v1.integrityEvent` carries `severity: CRITICAL` — **a mutated blob is a
major integrity event, never a silent new truth.**

## New contracts

| Contract | Purpose |
| --- | --- |
| `contracts/context-ledger/replication-batch-v1.schema.json` | Makes a transfer auditable evidence rather than an invisible filesystem side effect. Carries `batchId`, `manifestHash`, counts, transport, timings, per-failure detail, `batchState`, `integrityEvent`, and spool age-out gating. `PARTIAL` is explicitly not success. |
| `contracts/context-ledger/nas-governance-receipt-v1.schema.json` | Tri-state operator attestation of 10 DSM controls. `NOT_AVAILABLE` **requires** a `compensatingControl`; any `UNKNOWN` forces `NAS_GOVERNANCE_INSUFFICIENT`. An agent may not self-attest DSM state it cannot observe. |

The batch object matters most when the NAS is offline overnight and a few hundred sessions
accumulate in the spool — the queue stays explainable and resumable instead of becoming an
opaque backlog.

## AppBuilder registration — deliberately deferred

`claude-code-transcripts` registration is now an execution dependency, not an architectural
question. Session `c94f6280` legitimately holds that checkout lease; it is left alone. The
endangered data is already preserved, so there is no justification for bypassing isolation.

## Phase 0 exit criteria — all four required

1. Native NAS transport proven with a real non-trivial batch (SSH/rsync preferred).
2. DSM governance recorded and accepted → `NAS_GOVERNANCE_ACCEPTED`.
3. `claude-code-transcripts` registered through a legitimate AppBuilder checkout.
4. One synthetic, non-sensitive Evidence Envelope completes
   `CAPTURED_LOCAL → HASHED → REPLICATING → DURABLE → VERIFIED` with independent
   local/remote hash equality.

Then `CG_CONTEXT_LEDGER_PHASE_0_AUTHORITY_V1_PASS`, and directly into Phase 2: one genuine
Claude Code session captured automatically from source through verified NAS preservation and
ledger reconstruction. **No graph expansion, no executive UI, no ROI engine.**
