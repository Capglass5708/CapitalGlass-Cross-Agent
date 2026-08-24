# Project: intelligence-hub-compounding-intelligence-investigation-v1

## Summary

Investigated and documented how the **Intelligence Hub** (external retrieval plane) and **Compounding Intelligence** (the pipeline/loops that turn closed-out work into durable, reusable knowledge) fit together across this repo and the estate. Produced a durable reference doc (this file) plus a published Artifact summary, so future agent sessions can read a compact answer here instead of re-running a multi-agent codebase exploration. Investigation only — no implementation code touched, no architecture changed.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | `intelligence-hub-compounding-intelligence-investigation-v1` |
| Work package | _(none — investigation/documentation only, not a build work package)_ |
| Date opened | 2026-08-24 |
| Source | Claude (agent), at Wesley's request |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | N/A — no architecture or ownership changes made |
| Execution repo | N/A — no implementation performed |
| Status | Complete |

## Repositories involved

| Repo | Role |
| --- | --- |
| CapitalGlass-Cross-Agent | Sole repo read and written; holds all Compounding Intelligence pipeline code, contracts, and Hub-retrieval rules referenced below |
| CG-AppBuilder-MCP | Referenced only — evidence producer for the OP-00A pipeline; not modified |
| CG-Platform-Governance-MCP | Referenced only — owns the "North Star Compounding Proof" gate; not modified |

## Authority / ownership rule

This file is descriptive only. It does not supersede or modify the `ARCHITECTURE_LOCKED` ownership defined in `contracts/intelligence/OWNERSHIP.md` and `work-progress/projects/operational-intelligence-envelope-v1.md`:

- **CapitalGlass-Cross-Agent** remains sole owner of `COMPOUNDING_INTELLIGENCE_PIPELINE`.
- **CG-AppBuilder-MCP** remains evidence producer only (`intelligence-handoff-v1` emit).
- **Intelligence Hub** remains a retrieval plane only — never progression authority.
- **CG-Platform-Governance-MCP** remains the authority on whether completed work counts as "compounding."

## What was found (reference summary)

**Repo charter:** CapitalGlass-Cross-Agent is a coordination/"meeting" repo, not an app — "This repo may describe work. This repo must not become the work" (`AGENT_START_HERE.md`). Real implementation lives in named sibling repos.

**Intelligence Hub:** an external, retrieval-only knowledge plane for AI agents across the estate — a mapped-drive front door (`L:\Capital-Glass-Intelligence-Hub\00-master-index`, compact `BY-KIND/*.json` slices) plus a live Supabase projection (schema `intelligence_hub`, tables `knowledge_objects` / `relationships`). This repo publishes into it and mirrors a compact local copy at `work-progress/intelligence-hub-slices/`. `.cursor/rules/intelligence-hub-first-read.mdc` is a mechanical, `alwaysApply: true` gate forcing agents to read the Hub's compact index before any repo-wide grep for Revu/estimating/MCP/suite-status topics (fail-closed 3-tier failover: L: → Supabase → Git ledger).

**Compounding Intelligence — three distinct systems sharing the name:**

1. **`COMPOUNDING_INTELLIGENCE_PIPELINE`** (primary, `ARCHITECTURE_LOCKED` in `work-progress/projects/operational-intelligence-envelope-v1.md`, work package `capital-glass-compounding-operational-measurement-v1`). Doctrine: AppBuilder does the work → Cross-Agent learns from it (hash-verify closeout → mission ledger → OP-00A derived-intelligence envelope with `derivedFrom[]` → relationship graph with identity reconciliation and a graph-dividend gate) → Hub makes it available → WaveRunner controls what happens next. Code: `scripts/intelligence/ingest.mjs` + `scripts/intelligence/lib/*.mjs`. Contracts: `contracts/intelligence/operational-intelligence-envelope-v1.schema.json`, `intelligence-handoff-v1.schema.json`.
2. **The "Gold Mine" loop** (older, `scripts/harvest/`, protocol doc `harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-V1.md`): harvest → Hub → Data-Extraction discovery → operator-approved implementation → remeasure. `scripts/harvest/lib/intelligence-index-lib.mjs` blocks ungoverned deletions — the index only grows.
3. **"North Star Compounding Proof"** — governance gate deciding whether finished work counts as compounding at all; canonically implemented in `CG-Platform-Governance-MCP`, only referenced here (`work-progress/projects/2026-08-01_north-star-compounding-proof-v1.md`).

**Status as of this branch's base commits (`4ae8fed`/`0261f45`, matching the 2026-08-17 project-file date):** all engineering milestones for the OP-00A pipeline (contracts, dry-run ingest, shared-dev Hub seam, AppBuilder emit hook, verification checklist) are **COMPLETE**. The **first-real-mission gate is still `WAITING_FOR_REAL_MISSION`** — built and tested end-to-end, deliberately fail-closed until a genuine non-fixture mission flows through it. Production Hub publication is `NOT_IN_SCOPE`. A future "Foundry" synthesis layer is an explicit non-goal for now.

## Delivered / reported complete

- Full architecture map of the Intelligence Hub and the three Compounding Intelligence systems, verified directly against source docs (not just agent summaries).
- Published Artifact with the same summary, shareable without repo access.
- This project file, indexed in `work-progress/projects/INDEX.md`, as the durable reference for future sessions.
- **2026-08-24, same day, expanded at Wesley's request:** a §10 "Proposed evolution" added to the Artifact — 9 concrete proposals (charter fix, agent-independent retrieval preflight, closed freshness contract, a harder two-agent compounding proof, graph-dividend-as-mutation, lifecycle status, naming, mission-context bundle, `/goldmine` command), each checked against the actual pipeline code where checkable. Full detail with line-level code citations in the companion plan `plans/2026-08-24_compounding-intelligence-v2-proposal.md`.

## Evidence / artifact paths

| Artifact | Path / link | Status |
| --- | --- | --- |
| Published summary + §10 proposed evolution | https://claude.ai/code/artifact/598390de-2537-492d-b3ba-34c665704fe1 | Published (private — share from the artifact page when ready) |
| This project file | `work-progress/projects/2026-08-24_intelligence-hub-compounding-intelligence-investigation-v1.md` | Committed |
| Companion proposal (full detail behind §10) | `plans/2026-08-24_compounding-intelligence-v2-proposal.md` | Committed |

## Verification

| Command / check | Result | Notes |
| --- | --- | --- |
| Read `work-progress/projects/operational-intelligence-envelope-v1.md` directly | Confirms architecture, ownership, pipeline stages, current status | Primary source of truth |
| Read `contracts/intelligence/OWNERSHIP.md` directly | Confirms role split (Cross-Agent / AppBuilder / Hub / WaveRunner) | Primary source of truth |
| Read `.cursor/rules/intelligence-hub-first-read.mdc` directly | Confirms mandatory Hub-first retrieval gate and failover order | Primary source of truth |
| `npm run test:intelligence-contracts` / `test:intelligence-ingest` / `test:intelligence-verification` | Not re-run in this session (investigation only) | Reader can run these to reverify pipeline health |
| Live Hub contents (L: drive, Supabase `intelligence_hub`) | Not inspected — external to this repo/container | Only this repo's publishing code and local mirrors were directly verifiable |

## Blockers / warnings

| Blocker | Owner repo | Required action |
| --- | --- | --- |
| Charter vs. reality gap — repo rules forbid `scripts/`/`src/`, but `scripts/` is the largest, most actively developed part of the repo (the actual Compounding Intelligence pipeline lives there) | CapitalGlass-Cross-Agent | Operator decision: accept as a scoped exception (orchestration code against other repos' data, not "an app") or relocate — not resolved by this investigation |
| `work-progress/intelligence-hub-slices/domains/revu.json` is an empty scaffold (`packets: []`) | CapitalGlass-Cross-Agent | Informational only — noted for whoever next touches domain slice publication |

## Commits / PRs

| Repo | Commit / PR | Status |
| --- | --- | --- |
| CapitalGlass-Cross-Agent | _(this commit, branch `claude/intelligence-hub-compounding-4f208p`)_ | Pushed |

## Next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | Operator decision: charter wording for the `scripts/` carve-out (proposal 1 in the companion plan) | CapitalGlass-Cross-Agent | Open |
| 2 | Operator decision: build `intelligence.preflight()` (proposal 2) — the highest-leverage single change per Wesley | CapitalGlass-Cross-Agent | Open |
| 3 | Operator decision: adopt the two-agent `COMPOUNDING_INTELLIGENCE_V1_PROVEN` bar (proposal 4) as the real milestone | CapitalGlass-Cross-Agent | Open |
| 4 | Remaining proposals (3, 5–9 in the companion plan) — sequence after 1–3 | CapitalGlass-Cross-Agent | Open |

## Reusable lessons

- "Intelligence Hub" and "Compounding Intelligence" are not the same thing: the Hub is a passive retrieval/storage plane; Compounding Intelligence is the active pipeline(s) that produce what the Hub stores.
- Three separate systems answer to "compounding": the OP-00A `COMPOUNDING_INTELLIGENCE_PIPELINE` (current, architecture-locked), the older harvest-based "Gold Mine" loop, and the externally-owned "North Star Compounding Proof" governance gate. Don't conflate them — the architecture doc explicitly forbids reusing harvest primitives as intelligence-product logic.
- For Revu/estimating/MCP/suite-status questions, agents must read the Hub's compact `BY-KIND` slices first (`.cursor/rules/intelligence-hub-first-read.mdc`) before any repo-wide grep — this is a mechanical, fail-closed gate, not a style preference.
- As of this investigation, the OP-00A pipeline is fully built/tested but has not yet ingested a genuine real mission (`WAITING_FOR_REAL_MISSION`) — "compounding" is proven in dry-run form only so far.

## Update log

### 2026-08-24 CT — Claude

- Investigated Intelligence Hub and Compounding Intelligence via parallel codebase exploration plus direct verification of the primary source docs (README, AGENT_START_HERE, operational-intelligence-envelope-v1.md, OWNERSHIP.md, intelligence-hub-first-read.mdc).
- Published findings as an Artifact and created this project file for durable reference.

### 2026-08-24 CT (later same day) — Claude, at Wesley's request

- Expanded the Artifact with a §10 "Proposed evolution": 9 concrete proposals to make the intelligence more useful to agents and harden what "compounding" means, each checked against the actual pipeline code (schema, `graph-dividend-gate-v1.mjs`, `identity-reconciliation-v1.mjs`, `ingest-pipeline-v1.mjs` call order) rather than taken at face value.
- Key verified findings that sharpened the proposals beyond what was asked: the graph-dividend gate likely already tolerates pure-reinforcement missions (it reads pre-reconciliation object counts), but the delta receipt's `nodesCorrected`/`nodesSuperseded` fields are hardcoded to `0` — the mutation-tracking shape already exists, it's just not wired up. The handoff schema already carries `source.repo`/`source.commitSha` at ingest time, but nothing threads it into the published envelope for retrieval-time freshness comparison. `lifecycleStage` already has 4 of the 5 proposed statuses.
- Independently confirmed (not just took on report) the specific staleness example Wesley cited: `0261f45` is genuinely this repo's current `main` HEAD (verified via `git log` and this session's own PR #43 base SHA) and `5f3de96` is a real commit 3 commits behind it — corroborates the freshness-contract gap is real, not illustrative. The broader 25-repo Platform Intelligence dashboard numbers are Wesley's reported findings, not independently checked from this container (same reachability limits as the L: Hub).
- Wrote the full detailed version, with line-level code citations, to `plans/2026-08-24_compounding-intelligence-v2-proposal.md`.
