# QUANTITATIVE_PROSE_EMITTER_BINDING_V1 — remediation spec

**Status:** DESIGN ONLY. No file in `work/estate-text-capture-v1` is modified; that
lane's authority has not been granted.

**Defect class:** `QUANTITATIVE_PROSE_EMITTER` — **CONFIRMED**

---

## Why field-level validation is insufficient

The measurement-binding contract validates fields named `measuredFacts`. The
fabricated `~4.7 MB/s` never entered such a field. It reached an evidence receipt
through **generated prose**, emitted by code.

The sharpest form of the defect, at `estate-capture-v1.mjs:414`:

```js
`REPLICATION PATH PROVEN BY CANARY ONLY: ${fullyProtectedCount} of ${archivedCount}
 archived objects reached FULLY_PROTECTED ... drvfs measures ~4.7 MB/s ...`
```

**One sentence, two kinds of number.** `${fullyProtectedCount}` and
`${archivedCount}` are computed from live state and are legitimately bound.
`~4.7 MB/s` is a hard-coded literal that was never measured.

A reader — human or agent — cannot tell them apart. Both arrive with identical
authority inside the same generated assertion. That is the whole defect: not that
a wrong number existed, but that **the emitter erased the distinction between a
derived quantity and a typed one.**

## Confirmed sites

| # | File | Line | Form |
| --- | --- | --- | --- |
| 1 | `lib/mount-transport.mjs` | 28 | module doc comment: *"measures around 4.7 MB/s and, worst case, one file per ~180 seconds"* |
| 2 | `context-ledger-v1.mjs` | 221 | `measured: 'approximately 4.7 MB/s; worst case one small file per ~180 s'` — a field literally named `measured` |
| 3 | `estate-capture-v1.mjs` | 414 | template literal mixing bound counts with an unbound rate |

Scanned for further quantitative prose emitters: the remaining `reason`/`note`
interpolations in `estate-api.mjs`, `capture.mjs` and `discovery.mjs` carry env
var names, error codes and paths — **non-empirical**, and out of scope.

## Required architecture

```
BOUND MEASUREMENT  (command, exitStatus, rawOutputSha256, host, timestamp)
        ↓
typed measurement reference
        ↓
emitter formatter
        ↓
generated prose
```

Never:

```
free-form number  →  reason string
```

## Enforcement rules

1. **An emitter may not accept a bare number or unit-bearing string as an
   interpolation input for an empirical claim.** It accepts only a
   `MeasurementRef` resolving to a bound measurement object.
2. **The formatter renders the value**, and renders `UNMEASURED` when
   `measurementStatus !== MEASURED`. A missing measurement produces the word
   UNMEASURED in the prose — it cannot silently omit or substitute.
3. **A literal containing a unit token inside an emitted string is a build
   failure.** Lint pattern: `MB/s`, `KB/s`, `GB/s`, `ms`, ` s`, `%`, `bytes`,
   `objects`, `files`, `per second` appearing as a literal in any string that
   reaches a receipt.
4. **Derived counts stay legal** — `${fullyProtectedCount}` is computed from
   state under test. The rule targets values that were *typed*, not values that
   were *computed*.
5. **Mixed-provenance sentences are prohibited.** If a sentence contains any
   empirical quantity, every quantity in it must be bound. This is what site 3
   violated.

## Per-file remediation

**`lib/mount-transport.mjs:28`** — remove the throughput sentence from the doc
comment. A comment is not evidence, but it seeded the other two. Replace with a
reference to the measurement id, or state that the route is unsuitable for bulk
replication without a rate.

**`context-ledger-v1.mjs:221`** — `measured:` must hold a `MeasurementRef`, not a
prose string. Until a bound measurement exists, the correct value is
`measurementStatus: UNMEASURED`.

**`estate-capture-v1.mjs:414`** — split the sentence. Keep the bound
`${fullyProtectedCount} of ${archivedCount}` clause. Remove the drvfs rate clause
entirely; it is not required for the conclusion and never was.

## The general lesson

The retracted figures were **decorative**. Excluding drvfs was justified by the
metadata-scan timeout and by `chmod` being unsupported. The throughput numbers
added nothing to the argument — they only made it *look* more measured.

> A number that is not load-bearing for a conclusion, but is stated as observed,
> is pure risk: it can only ever be wrong.
