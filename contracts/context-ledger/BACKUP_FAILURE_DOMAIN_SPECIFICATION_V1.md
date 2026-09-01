# BACKUP FAILURE DOMAIN SPECIFICATION V1

**Status:** specification for an infrastructure decision. No software change closes this.

`BACKUP_STORAGE_AUTHORITY = ABSENT` is not a bug. It is a missing physical
failure boundary, and the estate cannot reach durability PASS without one.

## The invariant

Evidence survives only if losing one thing cannot lose all copies. Today every
copy of the protected set is reachable from a single chassis. A second copy on
`cg-server` — another share, another volume, another directory — does not
change that, so no amount of engineering on `cg-server` can satisfy this.

## What must be true

| Discriminator | Primary | Backup | Requirement |
|---|---|---|---|
| host machine-id | cg-server | Synology B | **DIFFERENT** |
| chassis | DS1525+ | separate unit | **DIFFERENT** |
| filesystem UUID | volume_1 btrfs | separate | **DIFFERENT** |
| block device | 5-disk RAID | separate | **DIFFERENT** |
| physical site | primary site | ideally elsewhere | different is best case |

Acceptable classification:

```text
INDEPENDENT_HOST                 minimum acceptable
INDEPENDENT_HOST + INDEPENDENT_SITE   target
INDEPENDENT_DEVICE_SAME_HOST     valid second copy, shared-host limitation must be explicit
SAME_DEVICE_DIFFERENT_PATH       NOT A BACKUP — blocks durability PASS
```

There is no "to the extent infrastructure permits" clause. If the infrastructure
cannot produce independence, that is recorded as a limitation and durability
stays unproven — it is not absorbed by a permissive phrase.

## Capacity — measured, not estimated

Measured on 2026-08-31 from the live protected set:

```text
ciphertext objects (14,005)      244,232,376 bytes
ledger entries (17,793)           68,789,587 bytes
recovery associations (7)             20,500 bytes
historical git bundle              3,037,383 bytes
                                 ---------------
PROTECTED SET TOTAL              316,079,846 bytes   (~316 MB)

average object size                   17,438 bytes
```

The protected set is **small**. Capacity is not the constraint — independence is.
A modest 2-bay unit exceeds the requirement by orders of magnitude.

Sizing guidance (a recommendation, not a measurement): provision for growth well
beyond the current 316 MB, since capture is ongoing and the ledger grows faster
than the objects it describes — 17,793 entries already consume 68.8 MB against
244 MB of evidence. Base the multiplier on observed growth once a second capture
window exists; do not extrapolate from a single snapshot.

## The backup must also be immutable

A mutable backup fails the invariant asymmetrically: the primary refuses
deletion while the backup accepts it, so a single mistaken delete still destroys
one of the two copies. The backup requires its own enterprise-WORM share and its
own behavioural refusal proof — the same overwrite/delete test the primary must
pass, run against a separate control object in its own `control/worm-proof/`
namespace.

## Independence of the replication path

The backup is a **sibling**, never a derivative. It is handed the spool object
directly and never reads the primary. Deletes and modifications never propagate
between destinations. That property already exists in the transport layer and
must be preserved: a backup populated *from* the primary inherits the primary's
corruption.

The backup transport must also not share the primary's failure mode. If the
primary path is FileStation HTTPS to Synology A, the backup path should be an
independently authenticated route to Synology B — not the same session, not the
same credential, not the same API surface where avoidable.

## Acceptance

The backup target is accepted only when all of these hold:

```text
BACKUP_FAILURE_DOMAIN_CLASS        INDEPENDENT_HOST (or better)
host machine-id / chassis / fs UUID / block device   ALL DIFFERENT, each observed
BACKUP_WORM_ENFORCEMENT            PROVEN by refusal, not by configuration
BACKUP_DESTINATION_HASH_EXECUTION  AVAILABLE, independent of the replication transport
BACKUP_CAPACITY_PRECHECK           PASS
BACKUP_SERVICE_ACCOUNT             non-admin, least privilege, sole writable principal
```

Each discriminator must be **observed**, not asserted from a product datasheet or
a mount name. Two shares that differ only in name may sit on the same device.

## What does not qualify

- A second share on `cg-server`
- A second volume on `cg-server`
- A USB disk attached to `cg-server`
- The `Z:` publication route
- The nested `/mnt/z/Capital-Glass-AI-Evidence-Vault` legacy control path
- Any cloud target that would place evidence outside the private architecture,
  unless that becomes an explicit architectural decision in its own right

## Until then

```text
BACKUP_STORAGE_AUTHORITY                     ABSENT
FULL_REPLICATION                             BLOCKED
ESTATE_WIDE_CAPTURE_COMPLETENESS_V1          BLOCKED
CG_IMMUTABLE_CONTEXT_STORAGE_AUTHORITY_V1    BLOCKED
```

Primary authority proof does not lift these. Proving the primary establishes one
good copy; the estate needs two that cannot fail together.

---

## FROZEN MINIMUM PURCHASE GATE

Operator-frozen. A candidate that cannot meet every REQUIRED line is rejected,
regardless of capacity or price.

```text
INDEPENDENT_HOST                     REQUIRED
INDEPENDENT_CHASSIS                  REQUIRED
INDEPENDENT_STORAGE_DEVICE           REQUIRED
DIFFERENT_FILESYSTEM_IDENTITY        REQUIRED

WORM / IMMUTABLE STORAGE             REQUIRED
DELETE REFUSAL PROOF                 REQUIRED
OVERWRITE REFUSAL PROOF              REQUIRED

INDEPENDENT AUTHENTICATION ROUTE     REQUIRED
DESTINATION-SIDE HASHING             REQUIRED

REMOTE / OFFSITE PLACEMENT           STRONGLY PREFERRED
```

**A high-capacity unit that cannot behaviourally prove immutable retention is
rejected.** Capacity is not a substitute for the property being bought: the
measured protected set is ~316 MB, so any modern unit clears the storage
requirement, and the entire decision rests on failure-domain independence and
provable immutability.

The two refusal proofs are behavioural, not configuration checks — the same
standard applied to the primary. A datasheet claim of WORM support is not the
proof; an observed refusal of overwrite and delete is.
