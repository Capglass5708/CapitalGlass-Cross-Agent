# Context Ledger — NAS Evidence Vault provisioning runbook

**Audience:** Wesley (Synology DSM operator)
**Blocks:** `context-ledger-phase-0-authority-resolution-v1` → `PASS`
**Target:** `cg-server` (Synology) · share `Capital Glass` · `Capital-Glass-AI-Evidence-Vault`

Everything below requires DSM access an agent does not have. Nothing here may be
self-attested by an agent — the governance receipt requires a human attester.

---

## Locked topology (do not deviate)

```
source → Cross-Agent capture adapter → WSL ext4 spool → hash + canonical envelope
       → batch replication over NATIVE network path → Synology Evidence Vault
       → independent REMOTE hash verification → DURABLE / VERIFIED
       → ledger metadata → Intelligence Hub derived intelligence
```

**The machine ingestion path must never traverse `/mnt/z` (Windows drvfs/9p).** Measured
there: UNMEASURED (retracted - never measured) sequential, UNMEASURED (retracted), and `chmod` unsupported. The `Z:`
mapping stays useful to humans only.

---

## Step 0 — Create the dedicated WriteOnce share (DO THIS FIRST, decisions are irreversible)

**DSM WriteOnce is set at share creation and cannot be added to an existing share.** Three
choices are made here that cannot be changed afterwards. Read all three before clicking.

Control Panel → Shared Folder → Create → name it exactly:

```
Capital-Glass-AI-Evidence-Vault
```

on `volume_1` (Btrfs — required for WriteOnce; confirmed present).

### Decision 1 — Compliance vs Enterprise mode

| Mode | Who can delete locked files | Reversible |
| --- | --- | --- |
| **Enterprise** | admin can still delete files and the share | share can be removed |
| **Compliance** | **nobody, including admin**, until retention expires | **share cannot be deleted, mode cannot be downgraded** |

**Recommendation: Enterprise for this first vault.** Compliance is the stronger guarantee and
is where an evidence vault eventually wants to be, but it is genuinely irreversible: a
misconfigured retention in Compliance mode leaves data that literally cannot be removed for
the full period, and the share itself cannot be deleted. We have not yet run a single object
end to end. Prove the pipeline in Enterprise, then create the Compliance vault once retention
is known to be right.

### Decision 2 — Retention period

Pick deliberately. In Compliance mode this is unrecoverable; in Enterprise it still governs
when objects become mutable again. Evidence is meant to be permanent, so retention should be
long — but do not set a decade on the first attempt before the pipeline is proven.

### Decision 3 — What goes on the WriteOnce share

**Corrected from an earlier draft.** That draft said manifests and the ledger belong on a
normal share because a monolithic append-to-one-file ledger conflicts with auto-lock. That
solved a persistence-shape problem by weakening a storage guarantee — it would have left all
historical proof mutable.

The right fix is to change the shape, not the storage class:

> **Historical evidence and historical proof are immutable. Only operational state is mutable.**

Instead of one ledger file appended forever, write **one immutable file per entry**, each
carrying `prevHash` and `entryHash`. The chain is preserved; no file is ever reopened.

```
Capital-Glass-AI-Evidence-Vault/            [WriteOnce - Enterprise]
├── objects/sha256/{aa}/{hash}              encrypted immutable blobs
└── immutable-metadata/
    ├── manifests/{batchId}.json            one immutable manifest per batch
    ├── ledger-entries/entry-000001.json    one immutable file per event
    └── receipts/{id}.json                  immutable proof receipts

Capital-Glass-AI-Evidence-Vault-meta/       [normal Btrfs share]
├── current-head/                           mutable ledger head pointer
├── replication-state/
├── queues/
├── retry-state/
├── indexes/
└── checkpoints/
```

Two properties this buys:

- **Head recovery is possible without the pointer.** If `current-head/` is lost or corrupted,
  the head is rebuilt by scanning `ledger-entries/` and following `prevHash`/`entryHash`. The
  mutable pointer is an optimisation, never the authority.
- **Sequential numbering stays safe.** Entry numbers come from the head pointer in normal
  operation and from a chain scan after loss, so a lost pointer degrades performance rather
  than integrity.

Note this produces many small files on the vault. That is fine over native SSH/rsync — it was
only catastrophic over the 9p/drvfs path, which both legs now avoid.

### Designate this vault explicitly as pre-production

This first Enterprise vault is a **PROVING / PRE-PRODUCTION VAULT**, not production. Record
that designation in the share description so it cannot quietly become permanent production
just because it works. The Compliance-mode production vault is created later, deliberately,
and promoted into.

### Verify from here afterwards

Once created, the share and its WORM state are readable over the API, so no further clicks are
needed to confirm it.

---

## Step 1 — Create the dedicated service account

Create a DSM user **`cg-context-ledger`** — non-admin service user, NOT in the administrators group.

- **Not** Wesley's general NAS identity.
- Permitted **only** on `Capital Glass / Capital-Glass-AI-Evidence-Vault` (read/write).
- Deny all other shares explicitly — especially `Capital-Glass-Agent-Operations`,
  `Capital-Glass-Dev`, `Document Intake`, `SharePoint Mirror`, `Capital-Glass-Network-Admin`.
- Disable DSM web UI login for this account if DSM allows it.

## Step 2 — Enable SSH and install the key behind a forced-command wrapper

Enable **Control Panel → Terminal & SNMP → Enable SSH service** (if not already on).

### The forced command and the health probe must not conflict

An earlier draft of this runbook was wrong. It told you to verify with
`ssh cg-vault "echo VAULT_SSH_OK"` *and* to install a forced rsync command. Those are
mutually exclusive: a forced command **replaces** whatever the client asks for, so the
`echo` would never run. Worse, if you removed the forced command to make the probe work,
you would hand an unrestricted shell to a passphrase-less key.

Resolve it with a tiny allowlist wrapper as the forced command. It permits exactly two
things and returns non-zero for everything else.

`/volume1/scripts/cg-context-ledger-wrapper.sh` (adjust the vault path to your volume):

```sh
#!/bin/sh
# Forced command for the cg-context-ledger key. Allowlist only.
VAULT="/volume1/Capital-Glass-AI-Evidence-Vault"

case "$SSH_ORIGINAL_COMMAND" in
  "VAULT_SSH_PROBE")
    echo "VAULT_SSH_OK"
    exit 0
    ;;
  "rsync --server "*)
    # Confine rsync to the vault root. rrsync is preferred where available.
    exec rrsync -wo "$VAULT"
    ;;
  *)
    echo "REFUSED: command not in allowlist" >&2
    exit 1
    ;;
esac
```

`chmod 700` it and make it owned by root.

### authorized_keys entry

One line, in `cg-context-ledger`'s `~/.ssh/authorized_keys`:

```
command="/volume1/scripts/cg-context-ledger-wrapper.sh",no-port-forwarding,no-agent-forwarding,no-X11-forwarding,no-pty ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIB/ihipX6Clkyoj0ux8/ETqIWgPbzr6+PuawVINl1j66 cg-context-ledger@CG-NIMO-01 (context-ledger replication worker)
```

Fingerprint: `SHA256:Cf2lFNe83DVh7izV8yljX3Z8nwxbKL1WCgEZjByy50o`

Where practical also add a source restriction, so the key only works from the expected
Tailscale path — `from="100.112.81.50"` or the WSL host's Tailscale address, prepended to
the same line.

The private key stays at `~/.ssh/cg-context-ledger_ed25519` on `CG-NIMO-01`, mode `600`.
**Never in Git, never in a Hub payload.** It is passphrase-less because replication is an
unattended worker — the wrapper, the four `no-*` restrictions and the source restriction are
what compensate for that.

### Synology specifics that usually break key auth

- The user's home directory must exist (Control Panel → User → Advanced → enable user home service).
- `~/.ssh` must be `700`; `authorized_keys` must be `600`; both owned by the user.
- `/etc/ssh/sshd_config` needs `PubkeyAuthentication yes`.

### Verification — deterministic, and proves the restriction

```bash
ssh cg-vault VAULT_SSH_PROBE     # -> VAULT_SSH_OK
```

That proves this specific restricted identity works end to end, not merely that SSH is
reachable. Confirm the allowlist actually denies:

```bash
ssh cg-vault "id"                # -> REFUSED: command not in allowlist, exit 1
```

A passing probe plus a refused arbitrary command is the evidence criterion 1 needs.

## Step 3 — Record governance facts

Fill `artifacts/agent-runs/immutable-context-ledger-v1/nas-governance-receipt-v1.json`
against `contracts/context-ledger/nas-governance-receipt-v1.schema.json`.

Every control is tri-state. **A protection that does not exist is `NOT_AVAILABLE` with a
`compensatingControl` — never a fabricated `CONFIRMED`. Any `UNKNOWN` fails the receipt.**

| Control | What to record |
| --- | --- |
| `serviceAccount` | `cg-context-ledger` exists, scoped, non-shared |
| `acl` | Exact share permissions granted and denied |
| `encryptionAtRest` | Is the volume/shared folder encrypted? Many Synology volumes are not — `NOT_AVAILABLE` is an acceptable honest answer |
| `snapshotPolicy` | Btrfs `#snapshot` is present on this share; record schedule and retention |
| `backupReplication` | Hyper Backup / Snapshot Replication destination, or `NOT_AVAILABLE` |
| `retentionPolicy` | How long raw evidence is kept; deletion/redaction process |
| `wormImmutability` | Does this DSM version offer immutable/WORM shares? If yes, apply to the vault. If no, `NOT_AVAILABLE` + compensate with snapshots + hash-chain + periodic re-verification |
| `recoveryProcedure` | How the vault is restored |
| `capacityAlerts` | Threshold + notification (currently 4.0 TB free of 5.3 TB) |
| `integrityAuditSchedule` | Cadence for sampling and re-hashing vault objects |

## Step 4 — Immutability is NOT a file mode

Do not claim `0400 == immutable`. It is provably false on this transport. Immutability is
the combination of:

1. content addressing,
2. **collision refusal** — a differing body at an existing content path is a hard error,
3. the hash-chained ledger,
4. independent **remote** re-hash before `VERIFIED`,
5. NAS-side snapshots / WORM / retention.

After `VERIFIED`, a periodic sample-and-re-hash job acts as an independent integrity
monitor. **A mutated blob raises a CRITICAL integrity event — it never silently becomes the
new truth.**

---

## Phase 0 exit criteria (all four required)

1. Native NAS transport proven — `ssh cg-vault VAULT_SSH_PROBE` returns `VAULT_SSH_OK`,
   an arbitrary command is REFUSED, and a real non-trivial rsync batch lands. **BLOCKED**
   on Steps 1–2 of this runbook.
2. DSM governance recorded and accepted (`NAS_GOVERNANCE_ACCEPTED`). **BLOCKED** on Step 3.
   A draft receipt already exists at
   `artifacts/agent-runs/immutable-context-ledger-v1/nas-governance-receipt-v1.json`
   with `attestationState: DRAFT_UNATTESTED` — machine-measured facts only, every DSM
   control `UNKNOWN`. Complete it, do not replace it.
3. `claude-code-transcripts` registered through a **legitimate** AppBuilder checkout —
   the lease is not to be bypassed. **PASS** — CG-AppBuilder-MCP `32a3459c`.
4. One synthetic, non-sensitive Evidence Envelope completes
   `CAPTURED_LOCAL → HASHED → REPLICATING → DURABLE → VERIFIED` with independent
   local/remote hash equality. Blocked only by criterion 1.

Then issue `CG_CONTEXT_LEDGER_PHASE_0_AUTHORITY_V1_PASS` and move directly to Phase 2.
