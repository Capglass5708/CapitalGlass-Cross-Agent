# context-ledger-phase-0-authority-resolution-v1 — Phase 0 Findings

| Field | Value |
| --- | --- |
| Work package | `context-ledger-phase-0-authority-resolution-v1` |
| Parent | `immutable-context-ledger-v1` |
| Status | **Criterion 3 PASS. Criteria 1, 2 blocked on operator; criterion 4 blocked only by criterion 1.** |
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


---

# ADDENDUM 3 — Criterion 3 PASS, and a hook defect closed on the way

## Phase 0 criteria

| # | Criterion | State |
| --- | --- | --- |
| 1 | Native NAS transport proven with a real batch | **BLOCKED** — `cg-server` service credentials/key not installed |
| 2 | DSM governance recorded and accepted | **BLOCKED** — operator attestation/configuration |
| 3 | `claude-code-transcripts` registered | **PASS** |
| 4 | Synthetic envelope `CAPTURED_LOCAL → VERIFIED` | Blocked only by criterion 1 |

## Evidence — CG-AppBuilder-MCP, branch `work/context-ledger-phase-0-appbuilder-v1`

Implementation lives in AppBuilder. Recorded here by reference, not duplicated.

| SHA | Commit |
| --- | --- |
| `a3cb67b1` | `fix: make checkout lease stop hook imports safe` |
| `32a3459c` | `feat: register Claude Code transcript ingestion source` |

### `32a3459c` — criterion 3

Source class `claude-code-transcripts` added to
`intelligence-hub/buildout/ingestion-source-registry.json`. Narrow by construction:
`accessMode: READ_ONLY`, `acquisition: DETERMINISTIC_SOURCE_NATIVE`,
`initialProvenanceClass: DISCOVERED`, `secretScanRequired: true`,
`cacheEligibility: ineligible`, `fastPathAllowed: false`, bounded to two enumerated
`sourceRoots` and to session `*.jsonl` plus sibling `subagents/` and `tool-results/`.
The description states outright that it is not a general filesystem crawler.

This was required because `ingestion-policy.json` prohibits
`uncontrolled-filesystem-crawl` — without a named authorized class, a sweep of
`~/.claude/projects` is indistinguishable from the prohibited thing.

Verified: `npm run hub:ingest:dry-run -- --source claude-code-transcripts` resolves the
class and completes all ten policy steps with zero warnings and zero errors.
`npm run intelligence:validate-registries` → `REGISTRY_VALIDATION_PASS` (6 registries).

### `a3cb67b1` — the lease-release defect

Not originally in scope; it surfaced because the broken hook fired on every turn of this
mission. It mattered because it defeated the exact release path that prevents stranded
leases — the condition that blocked this work earlier in the day.

The Stop hook resolved the checkout root by `await import(session-admission-gate-v1.mjs)`.
That gate ends in a bare top-level `main().catch(...)`, so importing it **ran** it: it read
an already-consumed stdin, failed to parse, and called `process.exit(2)` — killing the Stop
hook at the import, before `releaseCheckoutLease()`. The surrounding `try/catch` could not
help, because `process.exit()` is not an exception.

Fixed by moving `findOptedInRepoRoot` into a passive shared module both hooks import,
rather than guarding the gate's entry point — this removes the bug class instead of the
instance. Invariant recorded:

> Anything imported by a hook must be import-safe and must never execute CLI behavior
> merely because it was imported.

A dependency worth noting: the Stop hook dereferences `lease.LEASE_STATE.WAITING`, which
does not exist in `HEAD`. Shipping the hook without the lease-library challenge protocol
would have thrown, been swallowed by the catch, exited 0, and **silently never released the
lease** — reinstating the defect while appearing fixed. The two therefore ship together.

New suite `scripts/tests/run-claude-40-hook-import-safety.test.mjs`
(`npm run test:claude-40-hook-import-safety`) proves the shared resolver imports with zero
output and exit 0; the Stop hook never triggers the gate and exits 0 on empty, malformed and
valid payloads; a wrong-session Stop leaves another holder untouched; the correct holder
releases; a Stop from a subdirectory still resolves the same lease key; and the gate still
silently allows outside an opted-in repo, still fails closed with exit 2 on a Write with no
receipt, and still invokes `main()`.

Verification, all green: hook import safety 9/9, lease adversarial 21/21, lease lifecycle v2
27/27, hot-cache lease CAS 10/10, claude-40 invariants 34/34 — **101 tests, 0 failures**.

## Not started

Phase 2 capture has not begun and must not begin until criteria 1, 2 and 4 close.


---

# ADDENDUM 4 — Draft governance receipt and SSH verification correction

## Draft governance receipt written (criterion 2 prepared, not closed)

`artifacts/agent-runs/immutable-context-ledger-v1/nas-governance-receipt-v1.json`

`attestationState: DRAFT_UNATTESTED` · `attestedBy: null` · `verdict: NAS_GOVERNANCE_INSUFFICIENT` ·
**all ten controls `UNKNOWN`**.

Pre-filled with directly measured facts only — topology, capacity, filesystem evidence,
transport performance, vault path, and the local half of the service identity. **No control
was pre-filled `NOT_AVAILABLE`**, including `encryptionAtRest` and `wormImmutability`:
`NOT_AVAILABLE` must mean a control was actually checked and found unavailable, never that
it was expected to be. `UNKNOWN` is a failing state meaning *not yet checked*.

`accessBoundary` is deliberately **omitted** rather than partly filled, because the boundary
is not deployed — the NAS account does not exist yet.

The schema was extended to model this honestly rather than let a draft masquerade as partial
progress. `attestationState` is now required; `attestedBy` must be `null` while
`DRAFT_UNATTESTED` and a real name when `ATTESTED`; and a draft is forced to
`NAS_GOVERNANCE_INSUFFICIENT`. New `measuredFacts` keeps agent-observed measurements separate
from operator-attested controls — measuring capacity is not the same act as attesting a
control. Verified against ajv: the draft validates, and all three abuse cases are refused —
a draft naming an attester, a draft claiming `ACCEPTED`, and an `ATTESTED` receipt with no
attester.

## SSH verification was wrong and is corrected

The earlier runbook told you to install an `authorized_keys` forced rsync command *and*
verify with `ssh cg-vault "echo VAULT_SSH_OK"`. Those are mutually exclusive — a forced
command **replaces** the requested command, so the `echo` would never run, and removing the
forced command to make it work would hand an unrestricted shell to a passphrase-less key.

Corrected to a small allowlist wrapper as the forced command, permitting exactly two things:
the server-side rsync confined to the vault root, and one literal `VAULT_SSH_PROBE`.
Everything else returns non-zero. Key restrictions
`no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty` plus a `from=` source
restriction on the Tailscale path.

Verification becomes deterministic and actually proves the restriction:

```bash
ssh cg-vault VAULT_SSH_PROBE   # -> VAULT_SSH_OK
ssh cg-vault "id"              # -> REFUSED: command not in allowlist, exit 1
```

A passing probe **plus a refused arbitrary command** is the evidence criterion 1 needs.

## Incident during commit — tracked separately, not part of Phase 0

Three unrelated Proposal Generator commits landed on
`work/context-ledger-phase-0-appbuilder-v1` when this agent ran `git checkout -b` in a
checkout shared by five live sessions. Files are fully disjoint from this mission and nothing
was lost.

**This is deliberately NOT analysed here.** It is a control-plane governance defect with its
own work package and its own remediation path:

> `SHARED_CHECKOUT_GIT_STATE_UNPROTECTED` —
> `work-progress/projects/2026-08-30_shared-checkout-git-state-unprotected-v1.md`

It does not gate, alter, or appear in any Phase 0 criterion. Phase 0's remaining path is
unchanged: NAS access, DSM attestation, then the synthetic envelope.

Containment relevant to this mission only: the shared checkout is frozen, the contaminated
branch is preserved with both sets of commits reachable, and the Context Ledger commits
(`a3cb67b1`, `32a3459c`, `d88c4b95`) will be cherry-picked into a fresh worktree from the
pre-incident base once the checkout is quiescent. No history is rewritten.


---

# ADDENDUM 5 — Storage durability architecture corrected before any evidence lands

Live DSM inspection changed the plan. Recorded before production capture, which is the
cheapest moment to change it.

## The vault share currently has NO active protection of any class

| Protection | State | Evidence |
| --- | --- | --- |
| Encryption at rest | **DISABLED** | share `Capital Glass` reports `encryption=0` |
| WORM / WriteOnce | **DISABLED** | capability exists (`SYNO.FileStation.Worm`, `.Worm.Lock`) but not enabled |
| Snapshot schedule | **NOT_CONFIGURED** | 4 snapshots, all 2025-12-02, **~9 months stale** |
| Off-box second copy | **NOT_AVAILABLE** | Hyper Backup not installed; no replication task |

### The snapshot finding is the one that mattered

`#snapshot` exists at the share root, which made a filesystem glance look reassuring. The API
tells the truth: `SYNO.Core.Share.Snapshot` v2 returns **exactly 4 snapshots, newest
2025-12-02 16:00**. Nothing since. There is no schedule and no retention.

This removes the compensating control previously leaned on for encryption and WORM. Directory
presence is not evidence of policy — which is exactly the distinction the operator insisted on.

## Two corrections to earlier claims in this document

1. **`encryptionAtRest` and `wormImmutability` are `DISABLED`, not `NOT_AVAILABLE`.** The
   platform supports both; they are switched off. Calling an available-but-off capability
   "unavailable" would tell a later reader the platform cannot do it. The receipt schema now
   distinguishes `DISABLED` / `NOT_CONFIGURED` / `NOT_AVAILABLE` so this cannot recur.
2. **`ReplicationService` IS installed.** The earlier claim that no replication package was
   present was inferred from API-surface absence and was wrong. 25 packages enumerated;
   `ReplicationService`, `CloudSync` and `HybridShare` are present, `HyperBackup` is not.
   ReplicationService still requires a second Synology as a target, so the conclusion —
   no off-box copy today — stands, but the reasoning is now correct.

## Topology decision: a dedicated production share

`Z:\Capital-Glass-AI-Evidence-Vault` (a folder *inside* the `Capital Glass` share) is
**demoted to provisioning/staging evidence only**. It must not become canonical production
authority.

Production becomes a **dedicated DSM shared folder** `Capital-Glass-AI-Evidence-Vault`,
created with the share-level controls we actually want. The forcing reason: **DSM WriteOnce is
set at share creation and cannot be applied to an existing share.** We are still early enough
to choose correctly, and this is the last cheap moment to do so.

```
Primary copy    dedicated Synology shared folder -> Btrfs -> WriteOnce/WORM
                -> restricted cg-context-ledger identity -> scheduled snapshots
Second copy     independent failure domain, off-box
```

**Btrfs snapshots on the same NAS do not count as the second copy.** They address accidental
deletion, ransomware and version recovery, but the NAS and volume remain one failure domain.
Hashing and hash-chain verification remain mandatory and also do not count as replication:
they detect corruption, they do not reproduce lost bytes.

Second-copy preference order: another physically separate Synology/NAS; encrypted off-site
object storage; dedicated removable/backup storage under Hyper Backup as an interim.

## Phase 0 gates — replaced

The original four are superseded by eight. Backup/replication is now a **blocking PASS
requirement**, not something a compensating control can excuse.

| # | Gate | State |
| --- | --- | --- |
| 1 | Dedicated production Evidence Vault share created | BLOCKED (tooling) |
| 2 | WORM/WriteOnce explicitly configured or proven unavailable | DISABLED — must be set at creation of gate 1 |
| 3 | `cg-context-ledger` restricted identity created | BLOCKED — classifier refused `SYNO.Core.User` create |
| 4 | Native SSH/rsync transport proven | blocked by gate 3 |
| 5 | Snapshot schedule + retention actually known | NOT_CONFIGURED — must be configured, not merely read |
| 6 | Off-box backup destination configured + one restore/verification path proven | **NOT_AVAILABLE — hard blocker** |
| 7 | DSM governance receipt attested | pending gates 1–6 |
| 8 | Synthetic worker reaches VERIFIED | pending |

**`CG_CONTEXT_LEDGER_PHASE_0_AUTHORITY_V1_PASS` must not be issued while canonical evidence
has only one physical copy.** Criterion 3 (Claude source registration, `32a3459c`) remains
PASS and is not reopened.

## On the classifier block

The refusal of `SYNO.Core.User` create is a Claude Code tooling boundary, not a DSM defect.
It must not be worked around by weakening general permissions. If it cannot be authorized, the
human action reduces to two DSM operations: create the dedicated WriteOnce share, and create
the `cg-context-ledger` user. Everything else remains automatable.

## Why this is a good outcome

The original shape was `WSL → Synology → permanent`. Live evidence shows that would have
placed the permanent record on a single unprotected share. The corrected shape is:

```
WSL spool -> primary Synology immutable vault -> independently verified second copy
Cross-Agent -> ledger / index / provenance / intelligence
```

Learned before storing years of evidence rather than after.
