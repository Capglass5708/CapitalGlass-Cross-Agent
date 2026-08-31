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

## Step 2 — Enable SSH and install the key

Enable **Control Panel → Terminal & SNMP → Enable SSH service** (if not already on).

Install this public key for `cg-context-ledger` in `~/.ssh/authorized_keys` on the NAS:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIB/ihipX6Clkyoj0ux8/ETqIWgPbzr6+PuawVINl1j66 cg-context-ledger@CG-NIMO-01 (context-ledger replication worker)
```

Fingerprint: `SHA256:Cf2lFNe83DVh7izV8yljX3Z8nwxbKL1WCgEZjByy50o`

The private key lives at `~/.ssh/cg-context-ledger_ed25519` on `CG-NIMO-01`, mode `600`.
It is **passphrase-less** because replication is an unattended worker — so compensate at
the NAS end:

- Prefix the `authorized_keys` entry with a forced command restricted to rsync, e.g.
  `command="rrsync -wo /volume1/Capital Glass/Capital-Glass-AI-Evidence-Vault",no-agent-forwarding,no-port-forwarding,no-pty,no-X11-forwarding ssh-ed25519 AAAA...`
- Restrict source to the Tailscale network (`cg-server` is reachable at `100.112.81.50`
  on `tail49f063.ts.net`).

Synology note: DSM often requires the user's home directory to exist and
`~/.ssh` to be `700` with `authorized_keys` `600`, and `PubkeyAuthentication yes` in
`/etc/ssh/sshd_config`. Home-directory service must be enabled.

Verify from `CG-NIMO-01`:

```bash
ssh cg-vault "echo VAULT_SSH_OK"     # host alias already configured in ~/.ssh/config
```

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

1. Native NAS transport proven with a real non-trivial batch — preferably SSH/rsync.
2. DSM governance recorded and accepted (`NAS_GOVERNANCE_ACCEPTED`).
3. `claude-code-transcripts` registered through a **legitimate** AppBuilder checkout —
   the lease is not to be bypassed.
4. One synthetic, non-sensitive Evidence Envelope completes
   `CAPTURED_LOCAL → HASHED → REPLICATING → DURABLE → VERIFIED` with independent
   local/remote hash equality.

Then issue `CG_CONTEXT_LEDGER_PHASE_0_AUTHORITY_V1_PASS` and move directly to Phase 2.
