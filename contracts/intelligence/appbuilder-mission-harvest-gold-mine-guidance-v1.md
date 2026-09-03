# AppBuilder-mission harvest → Gold Mine — reference guidance

**Status:** Reference guidance for an agent performing a harvest closeout, referenced by `chat-thread-closeout-autopsy-harvest-v1.3`'s AppBuilder-mission harvest rule. Not a schema, not a code contract, not `ARCHITECTURE_LOCKED` — a judgment aid for the human/agent step the protocol already requires.

## This corrects an earlier version of this document

An earlier version of this file proposed building a new code-level bridge between AppBuilder's mission closeout and Data-Extraction's Gold Mine discovery, on the premise that the two pipelines had never been connected. That premise was wrong. While this was being written, a real AppBuilder mission (`mcp-estate-remediation-v1`) was closed out on a live host by simply running the **existing** `chat-thread-closeout-autopsy-harvest` protocol against its evidence — see `harvest-2026-08-25-mcp-estate-remediation-v1/full-closeout-waverunner-receipt.json`: `FULL_CLOSEOUT_WAVERUNNER = OPERATIONALLY_PROVEN`, L: durable publication, Z: cache, and a real Supabase snapshot in `coordination.cross_agent_harvest_snapshots`, independently verified by direct SQL readback. No new bridge was needed. The protocol already works on AppBuilder-mission evidence exactly as it works on a chat thread — an agent reads the real evidence and classifies it by judgment; that's the mechanism, not a schema translation.

What that same receipt also showed: none of the 19 packets in that harvest carried a `goldMineSignalClass`. Not because the mechanism failed — because nothing in that mission's evidence was framed as a Data-Extraction opportunity candidate, and `goldMineSignalClass` is optional on every packet kind by design. That's the one real, narrow gap this document now addresses: not "how do the two pipelines connect" (they already do, via the harvest protocol), but "what should an agent harvesting an AppBuilder mission specifically check for, so a real Gold Mine signal doesn't go untagged just because nobody thought to look."

## A naming hazard, still real

This repo has a command called `/goldmine` (`scripts/harvest/lib/goldmine-protocol-v1.mjs`). It ingests harvest evidence into Cross-Agent's *own* intelligence index/graph — a retrieval concept. It is not, and must not be confused with, Data-Extraction's Gold Mine discovery (`gold-mine-evidence-projections-v1.json` → candidate digests → operator-approved implementation waves). Two systems, one word. Keep them separate in code, docs, and in whatever an agent's head does with this guidance.

## What OP-00A ingest does and does not give you

`intelligence:ingest` (OP-00A, per `contracts/intelligence/OWNERSHIP.md`) is a separate, parallel closeout action from harvest, not a precursor to it. It proves a mission's evidence is durable and agent-retrievable via `intelligence.preflight()`. Its semantic classifier (`scripts/intelligence/lib/semantic-classifier-v1.mjs`, `SEMANTIC_KINDS`) is a genuinely useful lens on the same underlying mission evidence, even though it feeds a different pipeline — reading a mission's OP-00A envelope objects (if they exist) is a reasonable *input* to the harvest judgment call below, but running `intelligence:ingest` is never a substitute for the harvest protocol's own Gold Mine check, and its output never sets `goldMineSignalClass` on anything.

## Reference mapping (a judgment aid, not a lookup table to automate)

When harvesting an AppBuilder mission, use this as a starting prompt for the same judgment the protocol already asks of any harvest — not a mechanical substitute for reading the actual evidence:

**Usually a real Gold Mine signal:**

| If the mission evidence shows... | Consider `signalClass` |
| --- | --- |
| A failure the mission hit | `PROBLEM_SIGNAL` |
| Something that blocked progress | `PROBLEM_SIGNAL`, or `OPERATOR_FRICTION_SIGNAL`/`AGENT_FRICTION_SIGNAL` if it's clear who was blocked |
| A pattern that worked well and should be reused | `SUCCESS_PATTERN` |
| A measurably faster way to do something | `PERFORMANCE_SIGNAL` |

**Needs an actual read of the evidence, don't default it:**

- Work repeated because prior work wasn't found or reused — `OPERATOR_FRICTION_SIGNAL` vs. `AGENT_FRICTION_SIGNAL` depends on who repeated it
- A new capability becoming available — sometimes `ADOPTION_SIGNAL`, sometimes not Gold Mine material at all
- A named risk — only `OBSERVABILITY_GAP` if the risk is specifically about missing visibility, not every risk qualifies
- A noted future opportunity — only `BUSINESS_WORKFLOW_SIGNAL` when it's explicitly business-facing

**Not Gold Mine material, regardless of source:**

- Protocol-improvement findings (harvest's own Lane C territory — "do not merge outputs" with Gold Mine, per this protocol's own rule)
- Pure provenance/audit-trail facts (what was decided, what was verified true, what the root cause was) — real and worth harvesting into the Hub, just not an opportunity signal Data-Extraction mines on

**Evidence strength**, if scoring one: an OP-00A envelope's `confidence.score` (0–1) roughly bands to Gold Mine's `evidenceStrength` (`low`/`medium`/`high`) at `< 0.4` / `0.4–0.75` / `> 0.75` — a starting point, not a calibrated rule, and only relevant when an OP-00A envelope actually exists for the evidence in question.

## What this document is not

Not a thing to build. Not a schema. Not something that needs sign-off from Data-Extraction's owner before it's "binding," because it binds nothing — it's a reading aid for whoever does the harvest judgment call the protocol already requires, same as the protocol's own Gold Mine evidence contract section already is.
