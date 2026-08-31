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
there: 4.7 MB/s sequential, ~1 small file per 180 s, and `chmod` unsupported. The `Z:`
mapping stays useful to humans only.

---

## Step 1 — Create the dedicated service account

Create a DSM user **`cg-context-ledger`**.

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
VAULT="/volume1/Capital Glass/Capital-Glass-AI-Evidence-Vault"

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
