# CAPTURE_FIRST_INVARIANT — foundational architecture gate

| Field | Value |
| --- | --- |
| Status | **LOCKED** — foundational; supersedes any conflicting sequencing |
| Recorded | 2026-08-31 |
| Parent | `immutable-context-ledger-v1` |

---

## The invariant

1. Full context is captured before interpretation.
2. Raw context is immutable.
3. Extraction is downstream and repeatable.
4. Extraction may improve without rewriting raw evidence.
5. Current intelligence may be regenerated at any time.
6. **No extractor decides what raw evidence survives.**
7. The original record always remains available for re-interpretation.

> We do not design extraction around what we think is worth saving. We save the
> full context first, then extraction can evolve forever without risking loss of
> the original evidence.

---

## Phase gate

```
PHASE A   FULL IMMUTABLE CONTEXT CAPTURE
PHASE B   PROVE NOTHING IS BEING LOST
PHASE C   LOCK STORAGE AUTHORITY
   ONLY THEN
PHASE D   EXTRACTION / INTERPRETATION
PHASE E   LINKING / GRAPH / HUB / BIBLE / CACHE
```

### Correction applied to the original sequencing

The original draft placed *"lock the raw record format"* in Phase C, after capture.
That ordering cannot execute: Phase A must capture **into** some format, so a
format locked afterwards would invalidate everything A produced.

Separate the two concerns:

| Concern | When |
| --- | --- |
| **Record format** (how evidence is encoded) | **Before A.** Already locked: `context-ledger-crypto-v2`, `evidence-ledger-entry-v1`, `capture-completeness-v1` |
| **Capture scope** (what is preserved) | Settled in A, maximal by default |
| **Storage authority** (where it durably lives) | Phase C, still `NOT_PASS` |

Phase C is therefore storage authority only. The format half is already done, which
is why Phase A can begin the moment storage is trustworthy.

---

## Acceptance target: `IMMUTABLE_CONTEXT_CAPTURE_V1_PASS`

### Scope rule — an enumerated list is itself a filter

The required-capture list below is a **minimum verified-class list, not a
whitelist**. Capturing only enumerated classes would let the enumeration act as
an extractor deciding what survives, which violates invariant 6.

> **Capture everything the source emits. Enumerated classes are the minimum that
> must be independently *verified*, not the maximum that may be *kept*.**

Unrecognised record types are preserved raw, classified `UNKNOWN_SOURCE_RECORD`,
and **fail the completeness proof until accounted for** — already enforced by
`capture-completeness-v1`. This is load-bearing: the live corpus contains 13
distinct record types including `atis-latch`, `queue-operation`, `ai-title` and
`file-history-snapshot`, none of which would appear on a list written from
intuition.

### Minimum verified classes

conversations · prompts · responses · tool calls · tool results · plans · agent
decisions · mission metadata · commit and code-change references · Critic
findings · Verifier findings · receipts · runtime observations · source identity
· timestamps · machine/session/mission identity · content hashes · parent/thread
relationships · raw payload

Plus classes this estate's live corpus proved are easy to lose:

**subagent transcripts** (154 of 188 files in the preserved corpus), token and
usage accounting, model and effort identity, permission mode, `file-history`
records, and cross-host duplicates (the WSL store and the Windows SSH mirror
overlap and must dedup to one canonical object, not two).

### Required properties

deterministic read-back · duplicate/idempotent ingestion · tamper evidence ·
storage authority proven · **no dependency on extraction for preservation**

### `"admitted"` must be defined, or it becomes the filter

The original phrasing was *"every admitted AI conversation captured."*
**Admitted must mean source-class admission only** — every session from a
registered source class, with no content-based selection. If "admitted" can turn
on what a conversation contains, it becomes precisely the extractor-driven
filtering invariant 6 forbids.

### `EXTRACTION_STATUS: NOT_REQUIRED_FOR_CONTEXT_CAPTURE_PASS`

Extraction quality, coverage and design are explicitly **not** inputs to this
pass. The two problems must not be mixed.

### But capture pass DOES require storage pass

`storage authority proven` is in the required list, so:

```
IMMUTABLE_CONTEXT_CAPTURE_V1_PASS  ⊇  PHASE_0_PASS
```

Capture cannot pass while `PHASE_0 = NOT_PASS`. Preservation without durable,
verified storage is not preservation. Stated explicitly so nobody reads
"extraction not required" as "storage not required."

---

## Two gaps in the invariant as originally written

### Regeneration must be *proven*, not assumed

Invariant 5 says intelligence may be regenerated at any time. Nothing makes that
testable. Add: **destroy-and-rebuild must be exercised, not asserted.** An
untested regeneration path is a belief. Already a Phase 2 criterion; it belongs
in the invariant so it survives independently.

### The one legitimate exception to immutability

Invariants 2 and 6 admit no removal. Real systems eventually must remove
something — a leaked credential, a legal demand. Without a defined mechanism
someone will eventually do it ad hoc and destroy the chain.

The mechanism already exists and should be named here: `redactionState` with a
**tombstone that retains hash, provenance and reason**. Removal is therefore
recorded, never silent, and the chain stays verifiable. The distinction that
matters:

> **No extractor decides what survives. A human, under recorded authority, may
> redact — and the redaction is itself evidence.**

---

## Extraction families (Phase D, recorded not designed)

IDENTITY · DECISIONS · STATE · WORK · ENGINEERING · RELATIONSHIPS · KNOWLEDGE ·
TEMPORAL

Recorded so the eventual design has a starting vocabulary. **None of it may delay
or redefine raw capture.** Extractor V1 and Extractor V5 read the same immutable
corpus; the question *"did we save enough for the new extractor?"* must already be
answered yes by Phase A.
