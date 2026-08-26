# AppBuilder closeout → Gold Mine evidence projection — contract

**Status:** PROPOSED — Cross-Agent owns both schemas this contract bridges, but the mapping table (below) needs confirmation from whoever owns Data-Extraction's Gold Mine discovery logic before it's binding. Not `ARCHITECTURE_LOCKED` like `OWNERSHIP.md`; this document doesn't edit that file or `operational-intelligence-envelope-v1.md`, it adds an optional, additive projection on top of what they already produce.

**Related, unedited authorities:**
- `contracts/intelligence/OWNERSHIP.md` — the OP-00A pipeline's ownership law (unchanged by this document)
- `harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md` — the harvest → Gold Mine pipeline's authority (unchanged by this document)
- `scripts/harvest/schema/gold-mine-evidence-projection-v1.schema.json` — the existing, unmodified target schema

## The gap this closes

Two mature pipelines exist in this repo today and have never been connected:

1. **AppBuilder mission closeout** — `intelligence-handoff-v1.schema.json` → OP-00A ingest (`scripts/intelligence/ingest.mjs`) → derived intelligence objects + relationship graph → Intelligence Hub. Purely a **retrieval** plane: future *agents* can look this up via `intelligence.preflight()`. No human ever sees it as a candidate to act on.
2. **Harvest → Gold Mine** — `chat-thread-closeout-autopsy-harvest-v1` (a Cursor agent autopsying a *conversation*, not a build mission) → `gold-mine-evidence-projections-v1.json` → Data-Extraction's Gold Mine discovery → operator-approved implementation waves. This is the **opportunity-mining** plane: humans decide what to build next from it.

Verified by direct search, not assumption: zero references to `intelligence-handoff`/`emitIntelligenceHandoff` anywhere under `scripts/harvest/`, and zero references to `gold-mine`/`Data-Extraction` anywhere under `scripts/intelligence/`. The Gold Mine schema's own title says exactly what it expects to receive: `"Gold Mine Evidence Projection v1 (harvest → Data-Extraction)"` — harvest, not AppBuilder.

The consequence: every `FAILURE`, `BLOCKER`, `CAPABILITY_SIGNAL`, or `SUCCESS_PATTERN` an AppBuilder mission surfaces is retrievable by a future *agent*, but invisible to the *operator-facing* "what should we build next" loop — unless someone happens to also write it up as a harvested chat thread. Real signal from real missions is going into one pipe and Data-Extraction only ever drinks from the other.

## A naming hazard to not repeat

This repo already has a command called `/goldmine` (`scripts/harvest/lib/goldmine-protocol-v1.mjs`, built this session). It does **not** do what this document is about — it ingests harvest evidence into Cross-Agent's *own* intelligence index/graph (a retrieval concept), not into Data-Extraction's opportunity-mining Gold Mine. Anyone implementing this contract must not wire it through `/goldmine`, and must not let the two "Gold Mine" names blur into one thing in code, docs, or a future agent's head. They are two different systems that happen to share a word.

## Ownership (extends, does not replace, existing tables)

| System | Role here | May own |
| --- | --- | --- |
| **CapitalGlass-Cross-Agent** | Sole owner of the bridge | The projection step itself, since it already owns both schemas involved (`intelligence-handoff-v1` on one side, `gold-mine-evidence-projection-v1` on the other) |
| **CG-AppBuilder-MCP** | Unchanged: `EVIDENCE_PRODUCER` | `intelligence-handoff-v1` emit only — same as `OWNERSHIP.md` today |
| **Data-Extraction** | Unchanged: Gold Mine discovery, candidate digests, §10 remeasurement | Consumes `gold-mine-evidence-projection-v1` documents exactly as it already does from harvest — never needs to know OP-00A's envelope shape exists |

**Forbidden**, mirroring `OWNERSHIP.md`'s existing list:

- AppBuilder growing any Gold-Mine-projection or signal-classification logic itself — it stays evidence-only, same as today
- Data-Extraction needing to understand OP-00A's envelope/graph shape — it only ever sees valid `gold-mine-evidence-projection-v1` documents, identical in shape to what harvest already sends it
- The bridge making discovery, prioritization, or "is this worth building" decisions — that stays 100% Data-Extraction's judgment, same discipline as the "no component reimplements another's responsibility" rule elsewhere in this repo's intelligence work: this bridge translates vocabulary, it does not do Data-Extraction's job for it
- Routing `PROTOCOL_IMPROVEMENT` evidence through this bridge — that's Lane C territory (`chat-thread-closeout-autopsy-harvest-v1`'s own explicit separation: "Lane C is separate from... Gold Mine estate projection... Do not merge outputs"), not Gold Mine, regardless of source

## The mapping (proposed, not yet confirmed by Data-Extraction's owner)

OP-00A's semantic classifier (`scripts/intelligence/lib/semantic-classifier-v1.mjs`, `SEMANTIC_KINDS`) and Gold Mine's `signalClass` enum (`gold-mine-evidence-projection-v1.schema.json`) don't share a vocabulary except by one lucky coincidence. Proposed mapping, split by actual confidence:

**High-confidence (safe to project automatically):**

| OP-00A `kind` | → Gold Mine `signalClass` | Why |
| --- | --- | --- |
| `FAILURE` | `PROBLEM_SIGNAL` | A mission failure is exactly what Gold Mine mines for |
| `BLOCKER` | `PROBLEM_SIGNAL` | Same reasoning; refine to `OPERATOR_FRICTION_SIGNAL`/`AGENT_FRICTION_SIGNAL` only if the envelope's provenance clearly names who was blocked |
| `SUCCESS_PATTERN` | `SUCCESS_PATTERN` | Exact name match in both vocabularies — the one unambiguous case |
| `FASTER_PATH` | `PERFORMANCE_SIGNAL` | A measured faster path is a performance signal by definition |

**Needs a human call, don't force it:**

| OP-00A `kind` | Why it's ambiguous |
| --- | --- |
| `REPEATED_WORK` | Friction, but whether it's `OPERATOR_FRICTION_SIGNAL` or `AGENT_FRICTION_SIGNAL` depends on who repeated the work — not always recoverable from the envelope alone |
| `CAPABILITY_SIGNAL` | Could read as `ADOPTION_SIGNAL` (something is now being used) or as pure metadata not worth mining at all |
| `RISK` | Could be `OBSERVABILITY_GAP` if the risk is "we can't see X," but not every risk is a visibility gap |
| `FUTURE_OPPORTUNITY` | Closest to `BUSINESS_WORKFLOW_SIGNAL` only when the opportunity is explicitly business-facing; otherwise it may not belong in Gold Mine at all |

**Explicitly excluded, not just unmapped:**

| OP-00A `kind` | Why excluded |
| --- | --- |
| `PROTOCOL_IMPROVEMENT` | Lane C material by the harvest protocol's own rule, never Gold Mine |
| `VERIFIED_TRUTH`, `DECISION`, `RESULT`, `ROOT_CAUSE`, `REMEDIATION`, `CORRECTION` | Graph provenance/audit-trail concepts, not opportunity signals — Gold Mine has no matching concept and shouldn't be given one just to force a mapping |

**Evidence strength**, from the envelope's real `confidence.score` (0–1, already required on every OP-00A object) into Gold Mine's `evidenceStrength` enum (`low`/`medium`/`high`): proposed bands are `score < 0.4 → low`, `0.4–0.75 → medium`, `> 0.75 → high`. These thresholds are a starting proposal, not a measured calibration — whoever owns Gold Mine discovery should confirm or adjust them before this is treated as binding.

## Where the bridge lives

An additive step reading already-produced OP-00A derived intelligence objects and writing a `gold-mine-evidence-projection-v1.json` document — it does not touch `operational-intelligence-envelope-v1.schema.json`, `OWNERSHIP.md`, or the ingest pipeline's locked architecture, and it does not touch `/goldmine`. It belongs in `scripts/intelligence/` (reads OP-00A output) or as new `scripts/harvest/` code that knows how to read OP-00A envelopes (writes the existing target schema) — either is defensible; which one is a smaller decision than everything above, left to whoever implements this.

## Open questions this document does not resolve

- **Trigger cadence:** projected per-mission as each AppBuilder closeout lands, or as a periodic batch sweep over recent envelopes? Per-mission is more current; batch is cheaper and easier to review before anything reaches Data-Extraction.
- **Materiality floor:** should every `FAILURE`/`BLOCKER` project regardless of confidence score, or only above some floor? Projecting everything risks flooding Gold Mine discovery with low-value noise; a floor risks silently dropping a real signal — same trade-off the "no distinct-signal suppression" rule in the harvest protocol already warns about.
- **Confirmation loop:** should Data-Extraction have any way to say "this projection was wrong" back to the OP-00A side, or is this strictly one-directional like harvest's projection is today?

These are genuine open questions, not oversights — they need Data-Extraction's actual owner, not a guess from the repo that only owns one side of this bridge.

## Acceptance test

An AppBuilder mission closeout that includes a real `FAILURE` or `BLOCKER` produces a `gold-mine-evidence-projection-v1.json` entry with the correct `signalClass`, `evidenceStrength`, and `evidenceRefs` pointing back to the originating envelope — without anyone hand-writing a harvest packet to make it visible — and Data-Extraction's existing Gold Mine discovery consumes that entry exactly as it consumes one sourced from harvest, with no changes needed on the Data-Extraction side.
