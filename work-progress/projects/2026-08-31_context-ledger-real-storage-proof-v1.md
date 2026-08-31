# context-ledger-real-storage-proof-v1 — acceptance contract

| Field | Value |
| --- | --- |
| Work package | `context-ledger-real-storage-proof-v1` |
| Status | **NOT STARTED — blocked on DSM shares + forced-command transport** |
| Parent | `immutable-context-ledger-v1` |
| Scope | Real transport + real storage proof. **Nothing else.** |

---

## Truthful ceiling — do not collapse these into one claim

```
WORKER LOGIC              PROVEN        19/19 local behaviours
LOCAL FIXTURE BEHAVIOURS  19/19
REAL SYNOLOGY PRIMARY     UNPROVEN
REAL WESLEYDESK BACKUP    UNPROVEN
REMOTE RESTORE            UNPROVEN
```

Worker logic being proven says nothing about remote durability. Any statement
merging the two is false.

## Restore verification order (fixed)

```
fetch by ciphertextHash
  -> hash stored bytes  == ciphertextHash      "did I retrieve the exact object I stored?"
  -> decrypt / authenticate (GCM)
  -> hash recovered plaintext == plaintextHash "did decryption recover the intended object?"
  -> restore accepted
```

Two different identities, both required. Checking only one makes a corrupt object
and a *wrong* object indistinguishable — and, as the earlier `restoreFrom` bug
proved, can turn the verifier itself into a source of false alarms on good data.

## Acceptance contract — all twelve required

| # | Condition |
| --- | --- |
| 1 | Both Synology shares exist with the intended WriteOnce / meta separation |
| 2 | `cg-context-ledger` can authenticate **only** through the forced-command wrapper |
| 3 | Host identity pinned and verified |
| 4 | Real transport **cannot** execute arbitrary remote commands (`ssh cg-vault uname` refused, non-zero) |
| 5 | Primary and backup writes produce **byte-identical** ciphertext objects, with independently verified metadata |
| 6 | Duplicate write is idempotent |
| 7 | Stale CAS and fork are refused **remotely** too |
| 8 | Deleting the primary object does not delete the backup |
| 9 | Primary-down and backup-down degrade **exactly** as the fixture logic says |
| 10 | Complete restore from backup succeeds after deleting the primary object |
| 11 | Corruption of **either** copy is detected and classified correctly |
| 12 | Every receipt reports `isRealRemote: true` **only** when the real transport actually ran |

## Method: rerun the same behaviours, do not write a weaker smoke test

`SshRsyncTransport` implements the same interface as `LocalFixtureTransport`
(`put` / `verify` / `fetch`). The nineteen existing behaviours are then rerun
**unchanged** against the real endpoints.

A separate "remote smoke test" would exercise a weaker contract than the local
suite and would be the easiest place for a durability claim to quietly become
untrue. Same assertions, real targets.

## Cryptographic hardening applied before real evidence

- **No misuse-resistant AEAD available**: this OpenSSL exposes zero SIV ciphers,
  so AES-GCM-SIV is unavailable rather than declined. AES-256-GCM stands.
- **Key separation**: HKDF-SHA256 derives `encKey` and `nonceKey` from the master
  under distinct info labels. The master key is never used directly, and the
  encryption key never doubles as a MAC key. An earlier revision keyed the nonce
  HMAC with the encryption key itself — keyed and domain-separated, so not the
  classic truncated-public-hash mistake, but still cross-purpose reuse.
- **Nonce collision guard**: `assertNoNonceCollision()` turns the
  impossible-but-catastrophic case (one nonce, two distinct plaintexts, one key)
  into a loud `NONCE_COLLISION` incident instead of silent plaintext disclosure.
  Cheap enough for the periodic integrity scrub.

Changing derivation changes ciphertext for identical plaintext. **Free today,
expensive once the vault holds anything** — which is why it was done now.

## Still blocked on

1. `Capital-Glass-AI-Evidence-Vault` — WriteOnce Enterprise, bounded retention, marked proving/pre-production
2. `Capital-Glass-AI-Evidence-Vault-meta` — normal Btrfs, real snapshot schedule and retention
3. Public key installed for the existing `cg-context-ledger` user behind the forced-command wrapper

No Phase 2. No transcript capture.


---

# PERMANENT RULE — storage proofs must be endpoint-bound (2026-08-31)

Adopted after two lanes produced mutually incompatible evidence about the same
share. A receipt that says "WORM vault verified" is insufficient. It must say,
effectively:

```
NAS identity X / volume1 / share <exact name> / timestamp Y / configuration hash Z
```

Required binding on every storage proof:

| Field | Why |
| --- | --- |
| hostname + Tailscale IP | two lanes must be provably on the same machine |
| DSM version + model | catches a different NAS entirely |
| volume identity | catches a different volume on the same NAS |
| machine/serial identity where available | strongest endpoint binding |
| **exact** share name | catches a disposable proof share mistaken for production |
| read-back timestamp | catches a share that existed and was later removed |
| configuration hash | makes "known-good state" comparable rather than narrative |

Without this, two agents working against different states — or different
machines — can assemble a false unified story that neither of them is lying
about.

## Open reconciliation (other lane; do not mutate storage until resolved)

Incompatible evidence: one lane reports `Capital-Glass-AI-Evidence-Vault`
existed and read back as Enterprise WORM (`worm_subvol_mode=enterprise`,
`worm_def_lock_mode=immutable`, `worm_def_lock_duration=7776000`). A live check
from this lane at 2026-08-31 finds that share **absent** from `cg-server`.

Confirmed present by this lane: `Capital-Glass-AI-Evidence-meta` (`/volume1`,
desc "meta", **0 snapshots observed**) and the non-admin `cg-context-ledger`
user.

Questions to answer before creating or repairing anything:

1. Are both lanes definitely on the same NAS? Compare hostname, Tailscale IP,
   DSM version, model, volume identity, serial.
2. What is the authoritative current share list from that exact NAS? Preserve
   the raw response.
3. Does the WORM proof artifact contain the exact NAS identity and exact share
   name it read back? If not, the proof is insufficiently bound.
4. Was the vault created and later deleted? Several scheduled mutators exist;
   deletion must be ruled out rather than assumed impossible.
5. Could a disposable proof share (e.g. `CG-WORM-ENT-PROOF1`) have been
   mistaken for the production vault?

Note one cheap hypothesis worth eliminating first: a `407` against a share that
does not exist is consistent with **absence**, not with a permissions
regression. The simpler explanation should be excluded before a security-state
bug is hunted.

## Transport contract change

SSH forced-command installation is **no longer a production prerequisite**.
Intended primary transport is FileStation HTTPS over Tailscale; SSH is
diagnostic-only. The adapter to implement is therefore `FileStationTransport`,
not `SshRsyncTransport`, against the same `put`/`verify`/`fetch` interface, with
the same suite rerun unchanged.


---

# Reconciliation classification (storage-forensics lane)

The outcome must land in exactly one bucket, with evidence:

| Bucket | Meaning |
| --- | --- |
| `WRONG_ATTRIBUTION` | the WORM read-back belonged to a disposable/test share (e.g. `CG-WORM-ENT-PROOF1`) |
| `DELETED_PRODUCTION_SHARE` | the real vault existed and was subsequently removed |
| `WRONG_ENDPOINT` | a different DSM endpoint, session or state was being observed |
| `RECEIPT_DEFECT` | the artifact recorded intended/expected values instead of binding a live read-back |

## Return criteria: explain the divergence, not just the current state

**"Vault absent now" is NOT an acceptable reconciliation result.** Current state
was already established by this lane and is not in dispute. What is in dispute is
why earlier artifacts asserted something the current authoritative state
contradicts.

The reconciliation receipt must therefore answer both halves:

| Half | Requirement |
| --- | --- |
| What is true now | Bound endpoint identity, exact share list, raw preserved response |
| **Why the earlier artifacts said otherwise** | For each prior claim of `enterprise` / `immutable` / `7776000`, the exact share name, endpoint, timestamp, volume, machine identity and raw API response it was actually derived from |

A result that reports only the first half classifies nothing: it restates the
observation that opened the investigation. Provenance reconciliation between the
earlier WORM claims and the present NAS state is the deliverable.

If an earlier artifact **cannot** be traced to a bound endpoint and exact share,
that is itself the finding — bucket `RECEIPT_DEFECT` — and it is a more valuable
outcome than a repaired vault, because it identifies the format that permitted
two lanes to hold incompatible beliefs without either stating anything it
believed false.

## If the bucket is DELETED_PRODUCTION_SHARE, it escalates

That outcome is **a Phase 0 governance finding, not a provisioning mistake**, and
must answer:

- who or what deleted it — 22 remediation tasks and several provisioning scripts exist
- whether Enterprise WORM permits deletion of the **share itself** under the
  conditions used (file-level immutability does not imply share-level protection)
- whether a scheduled `CG-CTX-*` task performed it

The third question matters most for the architecture: if a scheduled mutator can
remove a WORM share, then WriteOnce is protecting objects while leaving their
container deletable, and Compliance mode becomes materially more attractive than
the Enterprise-first recommendation currently recorded.

## Creation receipt is now contract-enforced

`contracts/context-ledger/vault-creation-receipt-v1.schema.json` refuses a receipt
that merely asserts "WORM vault verified". It requires `endpointIdentity`
(hostname, tailscaleIp, model, serial, dsmVersion, volumeId), `shareIdentity`
(exactName, internalShareId, creationTimestamp, configurationHash),
`wormReadback` **as read from the device**, `proofBinding` (readbackTimestamp,
rawResponseHash), and a **second independent read-back** that must agree.

Two additions beyond the specified shape, both from this incident:

- `internalShareId` (DSM uuid). A share identity that survives a rename; a name
  alone does not, and rename/aliasing is one of the misattribution hypotheses.
- `secondReadback.agreesWithFirst` must be `true` for a `VERIFIED` verdict. One
  read-back proves what a single call returned; two agreeing read-backs
  distinguish a real configuration from a transient or cached response.

## Endpoint identity observed by this lane

Captured under the new rule, so the forensics lane has a bound baseline to
compare prior artifacts against.

| Field | Value |
| --- | --- |
| hostname | `cg-server` |
| tailscaleIp | `100.112.81.50` (`cg-server.tail49f063.ts.net`) |
| model | `DS1525+` |
| dsmVersion | `DSM 7.3.2-86009 Update 4` |
| serial | `2540YJ***665` (masked) |
| volumeId | `volume_1` (btrfs, 5,729,117,274,112 bytes) |
| observedAt | 2026-08-31, this lane, authenticated DSM API |
| shares observed | `Book Keeping`, `Capital Glass`, `Capital-Glass-AI-Evidence-meta`, `homes`, `surveillance` |

`Capital-Glass-AI-Evidence-Vault` was **not** among them.
