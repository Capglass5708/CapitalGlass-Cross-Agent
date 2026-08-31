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
