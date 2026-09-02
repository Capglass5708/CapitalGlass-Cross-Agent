# DSM SHARE BEHAVIOR V1

Observed behaviour of Synology DSM that the storage authority contract depends
on. Recorded because two of these facts are counter-intuitive and, taken the
wrong way, each would have caused a damaging mutation.

## Rule 1 — `Share.get` establishes existence; `Share.list` does not refute it

`SYNO.Core.Share get` is **authoritative for existence**. It is safe to rely on
because it is negatively controllable: a fabricated share name returns error
**402**, so a success is a real record rather than an echo of the requested name.
Never trust `get` without that control in the same session.

`SYNO.Core.Share list` is **not an authoritative census**. It omits
enterprise-WORM shares. A share missing from `list` has not been shown to be
absent, incomplete, or unhealthy.

```text
get succeeds + list omits   ->  says nothing about health. Investigate further.
get fails with 402          ->  the share does not exist.
list omits                  ->  on its own, no conclusion at all.
```

Authority binds to the **share identity/UUID**, never to an enumeration call.

## Rule 2 — an ADMIN access result is not probative on a least-privilege share

On the evidence vault both admin identities are deliberately `is_writable=false`
and `cg-context-ledger` is the sole writable principal. FileStation therefore
returns **407** to ADMIN for the vault *and* for the healthy `-meta` share.

An ADMIN reachability failure says nothing about whether the service account can
reach the share. Reachability must be measured **as the identity that is meant to
have access**.

## Why these are recorded rather than remembered

Each rule, misread, produces the same class of damage: mutating infrastructure to
repair a defect that does not exist.

- Reading `list` omission as absence would have justified "completing" — or worse,
  recreating — a correctly-provisioned WORM share, discarding its UUID.
- Reading ADMIN 407 as unreachability would have justified an ACL change to fix
  an ACL that was already correct.

## Control fixture

`scripts/tests/fixtures/dsm-share-enumeration-control-v1.json` records the
controlled comparison that established Rule 1. Its control is the phase0
disposable share **`CG-WORM-ENT-PROOF1`**, which is known-WORM by creation proof.

That share is what makes the rule falsifiable: it is the only known-WORM share
whose WORM status does not depend on the claim under test. **Leave it in place**
until its retention state permits deliberate cleanup — deleting it would remove
the control.

If a DSM upgrade ever makes `list` enumerate WORM shares, the fixture is how that
change is detected rather than silently assumed.

## Still not established

`WORM_STATE_CONFIGURATION` remains **NOT_OBSERVED**. No API available to this
credential returns WORM fields — `SYNO.Core.Share` is v1 and carries none even
when `additional=["worm"]` is requested, and no `SYNO.FileStation.Worm` read
method returned data.

Behavioural similarity to a known-WORM share is circumstantial. Only an observed
**refusal** of overwrite and delete proves enforcement. Configuration
observability and enforcement proof are separate properties, and enforcement is
the one that matters.
