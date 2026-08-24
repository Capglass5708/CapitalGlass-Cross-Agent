# Plan: compounding-intelligence-v2-proposal

**Status:** PROPOSAL — not architecture-locked, no operator sign-off yet.
**Targets:** a future explicit superseding plan for `work-progress/projects/operational-intelligence-envelope-v1.md` (`ARCHITECTURE_LOCKED`; change policy requires an explicit superseding plan — this document is a candidate, not the supersession itself).
**Owning repo for implementation:** CapitalGlass-Cross-Agent (per `contracts/intelligence/OWNERSHIP.md`, Cross-Agent is `INTELLIGENCE_OWNER`); items 1 and 9 also touch this repo's own charter docs and, for `/goldmine`, whichever per-host command surface each agent uses.
**Origin:** Wesley reviewed the published Artifact (`work-progress/projects/2026-08-24_intelligence-hub-compounding-intelligence-investigation-v1.md`'s companion) and requested an expansion toward a harder, more useful architecture. Nine proposals below, verified against the actual code where a claim was checkable, clearly separated from what's operator-reported and not independently verified from this session.

Wesley's stated priority order — resolve first: **#1 (charter), #2 (retrieval), #4 (proof)**.

---

## 1. Resolve the Cross-Agent charter contradiction

**Verified today:** `README.md` and `AGENT_START_HERE.md` both list `scripts/`, `src/`, `apps/`, `database/` as things this repo must not contain. `contracts/intelligence/OWNERSHIP.md` simultaneously names `CapitalGlass-Cross-Agent` as `INTELLIGENCE_OWNER` and the sole legal owner of `COMPOUNDING_INTELLIGENCE_PIPELINE` — implemented entirely under `scripts/intelligence/`. This is the single most-committed-to part of the repo (4 of the most recent 5 commits on `main` are `feat(intelligence...)` work).

**Proposed resolution:** amend the charter deliberately rather than leave it an "observation." Split the prohibition:
- **Allowed:** cross-agent intelligence derivation/orchestration code — schemas, ingest pipelines, retrieval/preflight logic, contracts.
- **Still forbidden:** application or business functionality — UI, customer-facing features, anything a named sibling repo already owns.

**Where it lands:** `README.md`'s "Do not add" table and `AGENT_START_HERE.md`'s "What this repo is not" list both need an explicit carve-out row, not a blanket removal. Needs Wesley's exact wording — this plan doesn't presume it.

---

## 2. One retrieval mechanism, agent-independent

**Verified today:** the only mechanical enforcement of Hub-first retrieval is `.cursor/rules/intelligence-hub-first-read.mdc` — `alwaysApply: true`, but a **prompt convention**, IDE-scoped to Cursor. Nothing stops a Claude or WaveRunner session from skipping straight to a repo grep, and nothing outside the agent's own natural-language response records that a retrieval check happened.

**Precedent found in this codebase** (grep for "preflight" across `scripts/`, 46 matches): `scripts/index/preflight.mjs`, `scripts/harvest/lib/duplication-preflight-lib.mjs`, `scripts/harvest/lib/publication-capability-preflight.mjs`, `scripts/runner/wesleydesk-index-publication-preflight.mjs`, among others. "Preflight" is already established house vocabulary — every existing one is a narrow gate-check, none is a general context-retrieval call.

**Proposed:** one shared capability, `intelligence.preflight({ mission, repos, concepts })`, callable identically by Claude, Cursor, and WaveRunner. `.cursor/rules/intelligence-hub-first-read.mdc` and any future Claude/WaveRunner hook become thin callers of this one function rather than each re-implementing retrieval logic in prose. Recommended home: `scripts/intelligence/` (CLI + importable function), consistent with `OWNERSHIP.md`.

### 2a. The retrieval ladder must be a physical test, not an assumption

Wesley's sharpening: there are three real retrieval planes — `/mnt/l/Capital-Glass-Intelligence-Hub/00-master-index` (primary, WSL path for `L:\Capital-Glass-Intelligence-Hub\00-master-index`), the Supabase `intelligence_hub` projection (fallback), and the Git-based ledger/local mirror (last fallback) — and `.cursor/rules/intelligence-hub-first-read.mdc` already documents this exact failover order plus outcome codes (`INDEX_HIT`, `INDEX_MISS`, `L_DRIVE_NOT_MOUNTED_IN_WSL`, `FAILOVER_SUPABASE`, `FAILOVER_GIT_LEDGER`, `CACHE_HIT`, `CACHE_MISS`). The gap isn't that the design is wrong — it's that today the "test" is an agent following prose instructions and self-reporting an outcome code in its own response text, with nothing durable to verify it actually happened.

**Verified live, this session:** `test -d /mnt/l/Capital-Glass-Intelligence-Hub/00-master-index` returns false in this container — `/mnt/` here only contains `attach/`, `skills/`, `user-data/`. This is a concrete, reproducible instance of exactly the failure mode the fix needs to handle, not a hypothetical.

**Proposed concrete spec** for `intelligence.preflight()`'s first step:
1. Physically test `/mnt/l/Capital-Glass-Intelligence-Hub/00-master-index` (fs existence + read, not just a path string check).
2. On success: record the outcome as `L_HUB_READ_OK` **and** which index version/SHA was actually consumed.
3. On failure: fall back to testing the Supabase `intelligence_hub` projection → `L_HUB_UNAVAILABLE_USING_SUPABASE` on success.
4. On failure: fall back to the Git ledger (`work-progress/ACTIVE_WORK.md` + `work-progress/intelligence-hub-slices/`) → `L_HUB_UNAVAILABLE_USING_GIT_LEDGER` on success.
5. If none succeed: `ALL_HUB_PLANES_UNAVAILABLE` — for Revu/estimating/MCP-deep topics this stays fail-closed per the existing rule; for suite-status/blockers topics the existing rule's layered-failover behavior is preserved.

Every outcome should be a **real return value plus a written receipt**, matching this repo's existing pattern (ingest receipts, publication receipts, freshness-gate receipts all already work this way) — not just text in an agent's reply that no one can audit later.

---

## 3. Close the freshness contract

**Verified today, against `contracts/intelligence/operational-intelligence-envelope-v1.schema.json`:** the envelope's `temporal` block has `observedAt`, `validFrom`, `validThrough`, `measurementWindowStart/End`, `lastRevalidatedAt` — real temporal tracking. `lifecycle.supersededBy` exists — but that's *graph-internal* supersession (this object was replaced by that object), a different axis from *source-repo drift* (is the Git commit this was derived from still what's on `main`).

**Verified today, against `contracts/intelligence/intelligence-handoff-v1.schema.json`:** the handoff's `source` block already requires `repo`, `closeoutPath`, `closeoutHash`, `authorityFingerprint`, and `commitSha` (`^[0-9a-f]{40}$`). So `sourceRepo` and `sourceSha` already exist **at ingest time** — the gap is narrower than "invent new fields": tracing `ingest-pipeline-v1.mjs`, the handoff's `source.repo`/`source.commitSha` are read (for `authorityFingerprint` verification) but not visibly threaded into the published envelope's closed core, so they don't survive to retrieval time in a form an agent can compare against live Git.

**Operator-reported, 2026-08-24 (Wesley's live check; not independently verified by this session — the Platform Intelligence system and the L: Hub are both unreachable from this container):**
- 25 repositories tracked, 11 in sync, 11 stale/behind remote, at least one authority problem.
- PromptOps index: absent. PromptOps indexed apps: 0.
- Repos reported behind include `CapitalGlass-Cross-Agent`, `CG-AppBuilder-MCP`, `CapitalGlassRevu`, `Computer Estimator`, `CapitalGlass-Office-Admin`, `Data-Extraction`, `Visual-Asset-Engine`, `CG-Failure-Intelligence-MCP`.
- Cross-Agent specifically: cached/indexed at `5f3de962…`, GitHub `main` already at `0261f45c…`, **with `currentPublication: true` still reported.**
- Several repos report `autoPublishEnabled: false` / `mode: DETECT_ONLY`.

**Independently confirmed by this session:** both cited SHAs are real commits in this exact repo's history. `git log --oneline -5` (run earlier this session) shows `0261f45` as the top of `main`; the same log shows `5f3de96 feat(harvest): OCC SDLC harvest bundle + Hub publication authority (#39)` three commits behind it. PR #43's `base.sha` (from the GitHub API, this session) independently confirms `0261f45cf7f5daa96b6c92d12784f4e26809f042` is current `main` HEAD. So the staleness example is real, not illustrative — this session just can't independently see the Platform Intelligence cache's current state or the 25-repo dashboard.

**The core finding, restated precisely:** a flag named `currentPublication: true` is evidently answering *"is this the current publication of the last indexed generation?"* — not *"does this publication match current source authority?"* Those are different claims. Nothing today closes that gap.

**Proposed:**
- A closed chain: `Git main changes → incremental re-index → publication regenerated → Hub compact slices regenerated → L-drive cache manifest updated → Supabase mirror updated → agent preflight verifies SHA/freshness`.
- Every retrieved object carries: `sourceSha`, `indexedSha`, `publishedAt`, `authorityCheckedAt`, `freshness`, `supersededBy`.
- Retrieval-time UX becomes legible, e.g.:
  ```
  INDEX_HIT — FRESH
  Source: CG-AppBuilder-MCP@286ae86e

  INDEX_HIT — STALE
  Cached: 1b0bb469
  Git authority: 286ae86e
  Refresh required before relying on code-level conclusions.
  ```
- Default shifts from `detect → report stale` to `detect → incremental refresh → publish → verify → serve`, with the North Star/Compounding Qualification gate (item 7) still allowed to block an unsafe or unreviewed write — this doesn't remove governance, it removes the silent gap between "detected" and "fixed."
- **Sequencing recommendation (Wesley's):** close this before investing further effort in adding intelligence to the Hub. Pouring more content into a retrieval layer agents can't deterministically trust to be current makes the eventual fix more expensive, not less.

**Implementation note:** start `sourceSha`/`indexedSha`/etc. inside the OP-00A envelope's already-open `extensions` bag (non-breaking, no superseding plan needed) rather than the closed core. Promoting to closed core is a schema change against an `ARCHITECTURE_LOCKED` file and needs the full process.

---

## 4. Make the real-mission proof harder: a two-agent test

**Verified today:** `FIRST_REAL_MISSION_HUB_PROOF_PASS` (defined in `operational-intelligence-envelope-v1.md`) requires `realEvidence`/`evidenceReality=REAL`, hash verification, ledger projection, envelope validation, deterministic object hash, a shared-dev knowledge-object write, a relationship write, a body-hash readback match, retrieval success, and provenance reconstruction. That's a thorough storage/integrity proof. It does not require that any *other* agent or mission ever used what was stored.

**Proposed:** define a new, harder milestone, `COMPOUNDING_INTELLIGENCE_V1_PROVEN`, sitting above `FIRST_REAL_MISSION_HUB_PROOF_PASS` (doesn't replace it):

> Mission A (any real material mission) produces ≥1 derived object → a **separately started** Agent B session, with no memory of Mission A, is given a related task → Agent B's normal preflight (item 2) retrieves Mission A's object as part of its mission-context bundle (item 8) → Agent B's plan or output demonstrably changes because of it, captured in a receipt that names the retrieved `objectId` and states what changed.

That last clause — retrieval measurably changing what Agent B does — is the actual, falsifiable definition of "compounding" the whole architecture is built to deliver. Demonstrated once is a proof-of-concept; demonstrated repeatedly is the milestone.

---

## 5. The relationship graph isn't a record of compounding — it's the mechanism

Wesley's elevation of this item: the graph shouldn't be treated as bookkeeping for compounding that happens elsewhere. It's what turns "the Hub has 500 pieces of knowledge" into "the Hub knows how 500 things relate" — an agent that walks `WSL /mnt/l mount → ENABLES → Intelligence Hub retrieval → REQUIRED_BY → Agent preflight` understands *why* something matters, not just that it exists. Two sub-proposals: redefine what counts as dividend, and give the relationship vocabulary itself real governance.

### 5a. What already exists — verified

`scripts/intelligence/lib/relationship-edge-builder-v1.mjs`: `PROJECTED_FROM`, `DERIVED_FROM`, `EVIDENCED_BY`.
`scripts/intelligence/lib/semantic-relationship-builder-v1.mjs`: `OBSERVED_IN`, `PROVEN_BY`, `ABOUT`, `FAILED_BECAUSE_OF`, `CORRECTED_BY`, `REINFORCES`, `ENABLES`, `ENABLED_BY`.
`scripts/intelligence/lib/identity-reconciliation-v1.mjs`: `SAME_AS`, `PROJECTS_TO`.

13 relationship types total, all real, all in production code today. Mapped against Wesley's example vocabulary: "strengthen" = `REINFORCES` (exists), "correct" = `CORRECTED_BY` (exists), "enable" = `ENABLES`/`ENABLED_BY` (exists), "support with evidence" = `PROVEN_BY`/`EVIDENCED_BY` (exists). Net-new for the predictive examples below: `PREDICTS`, `STRONGLY_PREDICTS`, `REQUIRES_EVIDENCE`, `SUPPORTED_BY`, `SIMILAR_TO`, `PREVENTS`.

**The gap:** none of the 13 existing types are governed by a registry or enum — they're string literals scattered across three files with no `additionalProperties: false`-style closed-set check. This repo already has the *pattern* for exactly this kind of governance, just applied to a different, narrower vocabulary: `contracts/intelligence/registries/correlation-relationship-types-v1.json` is a closed 7-type registry (`USED_CAPABILITY`, `TOUCHED_REPO`, `ABOUT_SUBJECT`, `USED_MECHANISM`, `ADDRESSED_PROBLEM`, `PRODUCED_EFFECT`, `CHAINED_BY`) for harvest-side correlation tagging — a different purpose from the knowledge graph's own edges, and not currently reused for them. Without an equivalent registry for the graph's own relationship types, every new builder can invent ad hoc strings with no consistency check, which quietly undermines the "walk the graph and understand why it matters" goal.

### 5b. Redefine graph dividend

Not node count increased by 1. Proposed definition: **an evidence-backed increase in the graph's useful information, connectivity, confidence, correction, or explanatory power.** Concretely, any of the following should count: a new fact, a new relationship, a strengthened existing relationship, a weakened previously-believed relationship, a contradiction, a supersession, a connection between two previously disconnected areas, added evidence supporting an existing conclusion, a newly identified reusable pattern, or a newly identified exception to a pattern.

This also resolves the mechanical question from the original framing: verified against `graph-dividend-gate-v1.mjs` and the call order in `ingest-pipeline-v1.mjs`, the gate's current `pass` condition (`semanticObjects.length > 0 && orphans === 0`) reads *pre-reconciliation* classified objects — `identity-reconciliation-v1.mjs` runs first and only adds `SAME_AS` alias edges, it never shrinks the array the gate reads — so a pure-reinforcement mission likely already passes today; the literal "growth gate blocks reinforcement" conflict doesn't appear to be live. The real, narrower gap is in `buildGraphDeltaReceipt()`:

```js
nodesCreated: semanticObjects.length,
nodesReinforced: reconciliation?.duplicateNodesPrevented ?? 0,
nodesCorrected: 0,        // hardcoded
nodesSuperseded: 0,       // hardcoded
```

The receipt shape already anticipated "dividend = mutation type" — the field names exist — but `nodesCorrected`/`nodesSuperseded` are literal zeros, never computed, and `nodesReinforced` doesn't feed the gate's pass/fail boolean at all. Proposed fix: compute `nodesCorrected`/`nodesSuperseded` for real (from the lifecycle transitions in item 6), and make the gate's pass condition legible about *why* it passed: `(nodesCreated > 0 || nodesReinforced > 0 || nodesCorrected > 0 || nodesSuperseded > 0) && orphans === 0`. Add a fixture for "100% reinforcement, zero new nodes" — none of the existing fixtures (expired / superseded / contradictory / reconstructable / unknown-kind) cover it.

### 5c. Govern the relationship vocabulary

Add `contracts/intelligence/registries/knowledge-relationship-types-v1.json`, mirroring the existing correlation-marker registry's schema/shape. Seed it with the 13 types already in code (5a); extend it with `PREDICTS`, `STRONGLY_PREDICTS`, `REQUIRES_EVIDENCE`, `SUPPORTED_BY`, `SIMILAR_TO`, `PREVENTS` for the predictive-pattern use case below. New, low-risk contract file — still worth explicit sign-off (see decisions list).

### 5d. Worked example (illustrative, not from live data)

Early graph (a handful of missions): `STOREFRONT → FOUND_ON → architectural plans`. One node pair, one edge.

Later graph (~30 missions of real Revu/CE/plan-sheet/glazing evidence): `STOREFRONT → SUPPORTED_BY → elevations`, `STOREFRONT → SUPPORTED_BY → floor plans`, `STOREFRONT → REQUIRES_EVIDENCE → glass makeup`, and separately, a learned pattern: `WINDOW SCHEDULE HIT → STRONGLY_PREDICTS → high-value glazing sheet`. Not just a bigger graph — a graph that now contains a relationship *type* (`STRONGLY_PREDICTS`) the earlier one had no reason to need. That predictive edge is what could eventually feed Computer Estimator, Bid Composer, Revu search intent, and future agents' search priorities directly.

### 5e. Why this is the highest-value piece

The loop is recursive: previous missions grow the graph → the richer graph improves the next investigation's starting point → the better-informed investigation produces better evidence → that evidence grows the graph again. That feedback loop — not storage volume — is what "compounding" is supposed to mean. It's also why item 9's `/goldmine` receipt (below) needs to report graph effect explicitly, not just item counts.

---

## 6. Lifecycle status: mostly already specified, needs runtime teeth

**Verified against the schema:**

```json
"lifecycleStage": { "enum": ["ACTIVE", "EXPIRED", "SUPERSEDED", "INVALIDATED", "ARCHIVED"] }
```

This is close to a 1:1 match for Wesley's proposed `ACTIVE, SUPERSEDED, RETRACTED, STALE, CONFLICTED` (`INVALIDATED` ≈ `RETRACTED`, `EXPIRED` ≈ `STALE`). Only `CONFLICTED` has no equivalent — the closest existing mechanism is `evidenceState.contradictingEvidenceRefs[]`, which is about evidence contradicting a claim, not the object's own lifecycle status reflecting an unresolved conflict with another active object.

**Gap:** since zero real missions have ingested yet, nothing in the pipeline has ever set a lifecycle stage other than the default `ACTIVE`. More importantly, nothing at retrieval time filters or ranks by `lifecycleStage` — the Gold Mine's "never shrink" append-only rule is correct for storage, but retrieval currently has no mechanism to prefer `ACTIVE` over `EXPIRED`/`SUPERSEDED` history.

**Proposed:**
- Add `CONFLICTED` to the enum — small, additive, non-breaking to add but the schema is `ARCHITECTURE_LOCKED`, so it still needs the superseding-plan process.
- The real work is at the retrieval layer (item 2/8): default to serving `ACTIVE` and surfaced `CONFLICTED` objects; return `EXPIRED`/`SUPERSEDED`/`INVALIDATED`/`ARCHIVED` only when history is explicitly requested. Storage stays append-only; "not everything accumulated is equally retrievable" becomes a retrieval-time rule.

---

## 7. Rename the three implementations; keep the umbrella term

No code citation needed — this is a documentation/naming decision, already partially true in-repo.

- **Compounding Intelligence** — umbrella architecture term only. Never an implementation name.
- **Operational Intelligence Pipeline** — the current OP-00A code (`COMPOUNDING_INTELLIGENCE_PIPELINE` capability ID can stay internally; `operational-intelligence-envelope-v1.md` already uses this name in prose, so this is closer to "stop drifting from the existing name" than a real rename).
- **Gold Mine** — keep as-is; already a distinct, well-established nickname across dozens of files (`generate-gold-mine-compounding-reference-harvest.mjs`, the harvest protocol's "Compounding downstream loop" section, etc.).
- **Compounding Qualification Gate** — new doc-facing label for the North Star governance gate. The underlying work-package ID (`north-star-compounding-proof-v1`) stays untouched: it's referenced 20+ times across `INDEX.md`, `DECISION_LOG.md`, and project files — renaming the ID isn't worth the churn for a label-only change.

**Mechanism:** a short naming callout at the top of `operational-intelligence-envelope-v1.md` and the register Artifact. Cost: near zero. Benefit: stops a future agent from deciding three similarly-named systems are duplicate scaffolding worth "cleaning up" — a real risk given how this repo's own charter already invites aggressive tidying (see item 1).

---

## 8. The Hub should return a mission-context bundle, not search hits

**Verified today:** the compact `BY-KIND/*.json` slices (`active-work-blockers.json`, `mcp-servers.json`, `host-authority.json`, and the local mirror at `work-progress/intelligence-hub-slices/`) are already genuinely compact and categorized — this part of the design is sound and close to what's proposed.

**Gap:** nothing assembles a *mission-shaped* bundle. Today an agent (or the Cursor rule, manually) reads 3-4 separate `BY-KIND` files and synthesizes by hand.

**Proposed:** not a new system — this is the return value of `intelligence.preflight()` (item 2) once the retrieval ladder succeeds: relevant decisions, active blockers, known failures, applicable success patterns, repo ownership, related missions, and unresolved contradictions, assembled in one deterministic call and stamped with the freshness fields from item 3.

---

## 9. `/goldmine` as a first-class, agent-neutral command

**Verified today:** the Gold Mine protocol is real and documented — `harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md`, "Compounding downstream loop" section: harvest → publish to Hub → mine candidates (Data-Extraction) → operator-approved implementation → remeasure. A concrete generator already exists: `scripts/harvest/generate-gold-mine-compounding-reference-harvest.mjs`. Today, using it requires knowing it exists and re-explaining intent each time.

**Proposed:** make `/goldmine` (equally: "send to gold mine," "gold mine this," "harvest this to gold mine") a standing trigger meaning *execute the governed Gold Mine protocol against the current conversation/mission evidence* — explicitly never "summarize this chat." Four steps every invocation:
1. Capture current evidence — conversation, mission closeout, findings, failures, decisions, patterns, artifacts.
2. Run the Gold Mine protocol — classify, deduplicate, attach provenance, produce the harvest package.
3. Publish/index through the governed path — never a stray markdown note.
4. Return a receipt.

Output shape matches this repo's existing receipt convention (ingest receipts, publication receipts, freshness-gate receipts all follow this pattern already), and per item 5's elevation, reports graph effect explicitly rather than just item counts:

```
GOLD_MINE_COMPLETE
Evidence harvested: 12
New knowledge nodes: 2
Existing nodes reinforced: 4
New relationships: 7
Relationships reinforced: 3
Supersessions: 1
Contradictions requiring review: 0
Graph dividend: PASS
Hub publication: PASS
Index refresh: PASS
Provenance receipt: <id>
```

or, when blocked (e.g. by item 3's freshness gate):

```
GOLD_MINE_PARTIAL
Evidence harvested successfully
Hub publication blocked — current index is stale
No intelligence was silently published
```

**Agent-neutral:** one canonical implementation (recommended home: `scripts/harvest/`, consistent with existing Gold Mine code and `OWNERSHIP.md`) that Claude, Cursor, and WaveRunner all route to — never a per-host reinterpretation. `/goldmine preview` (dry-run — a pattern already pervasive in this codebase via `--dry-run` flags) and `/goldmine status` (read the last receipt — also an existing pattern, e.g. `runtime/index-publication/latest.json`) are natural, low-cost follow-ons once the base command exists.

---

## Resulting flow

None of the four systems merge — the Hub, the Operational Intelligence Pipeline, the Gold Mine loop, and the Compounding Qualification Gate stay separately owned, exactly as the verified investigation describes. The opportunity is making the *interfaces* between them deterministic:

```
Agent
  → Intelligence preflight (2)
  → Mission-context bundle (8) + freshness (3)
  → Authoritative work (unchanged, in the owning repo)
  → Closeout evidence (unchanged)
  → Intelligence compiler (existing ingest pipeline)
  → Qualification gate (Compounding Qualification Gate, unchanged)
  → Graph mutation — new / reinforced / corrected (5) + lifecycle (6)
  → Hub publication
  → Index/freshness refresh
  → Mission-specific graph traversal
  → Next agent
```

The last two steps make this recursive rather than linear: a richer graph improves the next investigation's starting point, the better-informed investigation produces better evidence, and that evidence grows the graph again (item 5e).

## Target milestone

**`COMPOUNDING_INTELLIGENCE_V1_PROVEN`** — a new Claude or Cursor session automatically knows something useful that it could only know because a previous mission completed, demonstrated repeatedly. Below that bar, this is careful infrastructure. Above it, it's an engineering system that gets smarter every time the company uses it.

## Needs an operator decision before any of this is built

1. Exact charter wording for item 1 — a change to a foundational doc, not a code change.
2. Where the freshness/provenance fields (item 3) land first — `extensions` bag (non-breaking) vs. closed core (needs a superseding plan). This plan recommends starting in `extensions`.
3. Adding `CONFLICTED` to `lifecycleStage` (item 6) — small, but the schema is locked, so the same superseding-plan process applies.
4. Where `intelligence.preflight()` (item 2) physically lives — this plan recommends `scripts/intelligence/` in this repo, exposed as both a CLI and an importable function.
5. Creating `contracts/intelligence/registries/knowledge-relationship-types-v1.json` (item 5c) — additive and low-risk, mirrors the existing correlation-marker registry pattern, but is still a new contract file worth explicit sign-off before agents write against it.

## Explicitly not addressed / out of scope

Same non-goals as the locked plan this would eventually supersede: no Foundry/synthesis layer, no production Hub publication claim, no manufactured mission. This proposal changes *interfaces* between the four systems; it does not add a fifth.
