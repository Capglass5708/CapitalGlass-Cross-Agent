# WORM DOUBLE-PROOF AMENDMENT — CG_IMMUTABLE_CONTEXT_STORAGE_AUTHORITY_V1

**Status:** binding amendment to the mission contract. Amends Phase 3C and adds Phase 5H.

## Rule

Immutability enforcement must be proven **twice**, against **two different disposable
control objects**, at two different points in the mission:

| | When | Object | Proves |
|---|---|---|---|
| **Proof 1** | Phase 3C, before any real evidence is entrusted | the Phase 3 disposable canary | the destination refuses mutation *before* we rely on it |
| **Proof 2** | Phase 5H, after the full population is present | a **new** disposable control object | enforcement is *still* live, and covers the root the evidence actually landed in |

## Why twice

Proof 1 alone is a point-in-time claim. Between Phase 3 and the end of Phase 5 the
enforcement state can change without anyone acting maliciously: a retention policy can
lapse, a WORM lock can be scoped to a path the bulk writer did not use, a share can be
remounted with different options, or a provisioning step can create the real object root
with different attributes than the canary path. Proof 1 would still read PASS in the
receipt while the 17,668 production objects sit unprotected.

Proof 2 converts immutability from a precondition into a **verified property of the
delivered state**.

## Never mutate production evidence to prove immutability

Both proofs use a **disposable control object**. Neither proof may target a production
evidence object or the historical bundle.

The reason is not caution, it is arithmetic: the test is only informative when it
*fails*. A delete attempt against production evidence that is refused teaches nothing new,
and a delete attempt that **succeeds** has destroyed permanent authority to produce a
finding. An immutability test whose failure mode is evidence loss is not an acceptable
test.

## Placement requirement for the Phase 5H control

The Phase 5H control object MUST be written inside the **same authoritative object root,
under the same protection scope**, as the production population — not into a canary path,
a sibling directory, or a test namespace.

This is the failure mode the second proof exists to catch. A control object protected
somewhere adjacent proves enforcement *somewhere*, not enforcement *of the evidence*.
Bind and record the control's path relative to `PRIMARY_OBJECT_ROOT` /
`BACKUP_OBJECT_ROOT` so the Verifier can confirm scope identity rather than take it on
assertion.

## Required Phase 5H results

```text
PRIMARY_POST_POPULATION_DELETE_REFUSED    = PASS
PRIMARY_POST_POPULATION_OVERWRITE_REFUSED = PASS
BACKUP_POST_POPULATION_DELETE_REFUSED     = PASS
BACKUP_POST_POPULATION_OVERWRITE_REFUSED  = PASS

POST_POPULATION_CONTROL_IN_AUTHORITATIVE_ROOT = PASS
CONTROL_OBJECT_IS_DISPOSABLE                  = PASS
PRODUCTION_EVIDENCE_MUTATION_ATTEMPTED        = NONE
```

For each of the four attempts record: attempt, actor, destination, object path,
operation, result, refusal code / error string, timestamp, independent observation.

## Refusal-path comparison

Compare the Phase 5H refusal codes against the Phase 3C refusal codes.

A **different** refusal path between the two proofs is a finding, not a pass. It indicates
the two objects are protected by different mechanisms — which usually means the
production root is not covered by the mechanism Phase 3 validated. Record:

```text
REFUSAL_MECHANISM_IDENTICAL_TO_PHASE3 = PASS | DIVERGENT
```

`DIVERGENT` blocks `IMMUTABILITY_ENFORCEMENT = PROVEN` pending explanation.

## Effect on final acceptance

`IMMUTABILITY_ENFORCEMENT = PROVEN` now requires **both** proofs. Phase 3C alone
downgrades to:

```text
IMMUTABILITY_ENFORCEMENT = PROVEN_PRE_POPULATION_ONLY
```

which does not satisfy `CG_IMMUTABLE_CONTEXT_STORAGE_AUTHORITY_V1_PASS`.

Both control objects are recorded in the Phase 6 receipt under
`immutabilityEnforcementProof` as a two-element sequence, never collapsed into one boolean.
