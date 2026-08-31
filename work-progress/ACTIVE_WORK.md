# Active Work Progress

This is the shared editable valuable-work ledger for Wesley, ChatGPT, Cursor, and other agents.

Purpose: keep current work, project IDs, status, blockers, evidence, commits, verification, and next actions in one durable place.

**Operating rules:** `runbooks/AGENT_LEDGER_UPDATE_RUNBOOK.md`  
**Entry format:** `work-progress/projects/README.md`  
**Canonical knowledge map:** `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md`

## Current active status

| Field | Value |
| --- | --- |
| Last updated | 2026-08-30
| Current focus | `context-ledger-phase-0-authority-resolution-v1` — NAS Evidence Vault decided and `context_evidence` authority registered as **verified**; blocked only on `cg-server` transport credentials. Claude corpus preserved (`PRESERVATION_CHECKPOINT_PASS`, 502 files)
| Primary authority repo | CG-Platform-Governance-MCP |
| Execution repo | CG-AppBuilder-MCP |
| Coordination repo | CapitalGlass-Cross-Agent |
| Project index | `work-progress/projects/INDEX.md` |

## Current saved work

### 2026-08-30 CT — shared-checkout-git-state-unprotected-v1 (governance defect)

| Field | Value |
| --- | --- |
| Work package | `shared-checkout-git-state-unprotected-v1` |
| Status | **OPEN — recorded, not remediated. Severity BLOCKING for concurrent-agent mutation.** Classified as a governance defect, not operator error. |
| Repos involved | CG-AppBuilder-MCP (lease implementation, incident site); CapitalGlass-Cross-Agent (finding) |
| Notes | A shared checkout has three mutable resources — working tree, Git index, and `HEAD`/refs — and the checkout mutation lease arbitrates only the first, and only via `Edit`/`Write`/`NotebookEdit` tool calls. `git checkout`, `git add` and `git commit` run through Bash ungated. Incident: five live Claude processes shared `/home/wesle/repos/CG-AppBuilder-MCP`; this agent ran `git checkout -b` at 20:12; three unrelated Proposal Generator commits (`7ff5ecfe`, `b6c3022f`, `cc6b267f`, one file, fully disjoint) then landed on the Context Ledger branch. No source corruption; the violation was branch ownership. Note the lease was `ABSENT` at the time, so even perfect lease enforcement would not have prevented it — arbitration alone is not the fix. A Bash command allowlist is rejected as the remedy: it must parse arbitrary shell forever and fails open on every unrecognised form. Recommended fix is isolation — canonical checkout becomes read-mostly, every mutating mission gets a dedicated worktree. **This is not new machinery:** `/home/wesle/worktrees/CG-AppBuilder-MCP/<mission-id>/` already holds three per-mission worktrees; the convention exists but is unenforced. |
| Evidence | `work-progress/projects/2026-08-30_shared-checkout-git-state-unprotected-v1.md` |
| Next | Adversarial acceptance, not a filter: agent B DENIED branch switch and `git add`/`commit` in agent A's checkout; ALLOWED its own worktree; both commit concurrently without touching each other's `HEAD`, index or working tree; crash/stale recovery still works. Containment meanwhile: shared checkout frozen, contaminated branch preserved, recovery deferred to a fresh worktree once sessions are quiescent. |

### 2026-08-30 CT — context-ledger-phase-0-authority-resolution-v1

| Field | Value |
| --- | --- |
| Work package | `context-ledger-phase-0-authority-resolution-v1` |
| Status | **STORAGE DECIDED + AUTHORITY REGISTERED; one blocker left (NAS transport credentials).** Operator decision executed: NAS-backed Evidence Vault at `Z:\Capital-Glass-AI-Evidence-Vault` (= `\\cg-server\Capital Glass`, the Synology — 5.3 TB, 4.0 TB free, Btrfs `#snapshot` active). Root provisioned. **`registry.domains.context_evidence` and `registry.migration_authority.context_evidence` are now `authority_status = verified` — the first verified migration authority in the estate.** Closing that required first registering `CapitalGlass-Cross-Agent` in `registry.repositories`, which was entirely absent despite `OWNERSHIP.md` naming it `INTELLIGENCE_OWNER`. **Correction surfaced: `L:` is `\\wesleydesk\CapitalGlass-L`, a share on a desktop, not a NAS** — which independently reinforces not siting durable evidence there. Original verdict `CG_CONTEXT_LEDGER_PHASE_0_AUTHORITY_V1_BLOCKED` stands but the blocker is narrowed to transport credentials. 5 of 7 items resolved. Emergency preservation completed first and independently: `PRESERVATION_CHECKPOINT_PASS`, 502 files / 183,402,493 bytes, 0 sources changed, 0 copy failures. |
| Repos involved | CapitalGlass-Cross-Agent (this work); CG-AppBuilder-MCP (read-only — ingestion source registry, lease held by another session); Intelligence Hub L:/Z: (read-only inspection) |
| Notes | **Schema authority resolved.** Live `registry.migration_authority` holds 8 domains, none covering intelligence/evidence/context, and **not one row is `verified`** — every `verification_status` is `discovered`. That, not an AppBuilder defect, is why its registered `schemaAuthority` reads `null`. Cross-Agent verified to perform **zero DDL** (pure `.schema().from().select/upsert`), so the split is: schema *contract* → Cross-Agent (per `OWNERSHIP.md`), migration *execution* → AppBuilder (possesses `supabase/` + linked ref), evidence DML → Cross-Agent. **`authority_commit` resolved by design** — not weakened; conversations get their own identity `(sourceSystem, sourceNativeId, contentHash)` and derived Hub objects point back via the already-`ACTIVE` `DERIVED_FROM` edge. **Shared hash-chained append-ledger primitive assigned to Cross-Agent** and must exist before adapters proliferate, so a 499 MB Cursor SQLite/WAL acquisition stays at the edge. **BLOCKER:** no approved storage location is simultaneously durable/replicated, authorized to hold raw conversational payloads that may contain secrets, and governed by explicit storage/retention policy. L: `00-hub-control/` holds only 2 of its 10 required control files (no `storage-policy.json`, no `retention-policy.json`) and its live README restricts accepted artifacts to manifests/indexes/receipts; Z: is AI-Cache authority under `CAD-20260802` single-writer; WSL ext4 is host-local single-copy. |
| Evidence | `work-progress/projects/2026-08-30_context-ledger-phase-0-authority-resolution-v1.md`; preservation receipt `artifacts/agent-runs/immutable-context-ledger-v1/preservation-checkpoint-v1.json`; producer `scripts/context-ledger/preserve-claude-transcripts-v1.mjs` |
| Criteria | 1 native NAS transport **BLOCKED** (credentials) · 2 DSM governance **BLOCKED** (operator) · 3 Claude source registration **PASS** (`32a3459c`) · 4 synthetic envelope blocked only by 1 |
| Next | **Provide NAS credentials** — either an SSH key authorized on `cg-server` (for rsync) or CIFS credentials for a direct WSL mount of `//cg-server/Capital Glass`. `cg-server` is reachable over Tailscale (`100.112.81.50`) with SMB 445 and SSH 22 open and `cifs-utils`/`rsync`/`ssh` installed, but no credentials exist and none were guessed. This matters because the Windows drvfs/9p path measured **4.7 MB/s sequential and 1 small file per 180 s**, and `chmod` fails there so write-once cannot be enforced by file mode. Then provision Synology-side governance (ACL, encryption status, retention, replication, WORM, DR). Then register `claude-code-transcripts` in AppBuilder's `ingestion-source-registry.json` (needs that repo's lease), then `context-ledger-phase-2-claude-capture-proof-v1`. |

### 2026-08-30 CT — immutable-context-ledger-v1 (planning)

| Field | Value |
| --- | --- |
| Work package | `immutable-context-ledger-v1` |
| Status | **PLANNING COMPLETE — architecture defined, authority resolved, zero implementation.** Establishes the Evidence plane (immutable raw context capture) as a new authority class alongside the existing, already-live Derived plane. Two governing findings drove the design. First, `contracts/intelligence/OWNERSHIP.md` is `ARCHITECTURE_LOCKED` and **already** names Cross-Agent `INTELLIGENCE_OWNER` for derived objects, the relationship graph, and provenance reconstruction, while explicitly forbidding AppBuilder from owning `DERIVED_INTELLIGENCE` semantics — so siting this here is compliance with an existing lock, not a new decision. Second, `intelligence_hub.knowledge_objects.authority_commit` is `NOT NULL CHECK (~ '^[a-f0-9]{7,40}$')` with `authority_system` defaulting to `github`, meaning the existing envelope **structurally cannot hold a conversation** — hence a separate Evidence plane keyed on `(sourceSystem, sourceNativeId, contentHash)` rather than a git SHA. The repo doctrine was changed accordingly: Cross-Agent may host the software, never the captured data. |
| Repos involved | CapitalGlass-Cross-Agent (software home, this plan); CG-AppBuilder-MCP (evidence producer, migration-execution surface, existing hashing/CAS/transcript-reader libs); Intelligence Hub (durable data plane) |
| Notes | Investigation found the entire derived-intelligence plane already exists and is proven live here — 282 script files, 30 modules under `scripts/intelligence/lib/` including `ingest-pipeline-v1.mjs`, `relationship-edge-builder-v1.mjs`, `provenance-reconstruct-v1.mjs`, `supabase-intelligence-store-v1.mjs` — plus a live L: object store (626 blobs, 691 catalog entries) and `FIRST_REAL_MISSION_HUB_PROOF_PASS`. What does **not** exist anywhere: raw conversation persistence. Zero of 82 AppBuilder migrations reference `transcript`, `conversation`, `raw_message`, or `message_text`; `agentops.ai_cache_session_summaries` keeps a summary per closeout and discards the original. Also absent: any Cursor `state.vscdb` reader, automatic ChatGPT capture, a git-commit event stream, and hash-chaining (no `prevHash` in ~20 append-only writers). **Urgency:** `~/.claude/projects/` holds 188 JSONL files / 42,370 records but the mtime range is only 2026-08-29 → 2026-08-30, and a `.last-cleanup` marker exists — retention is destroying the record now. Honest capture feasibility: Claude Code and Git are natively deterministic; Cursor is filesystem/SQLite only (WAL-aware, 499 MB store); **ChatGPT has no automatic path at all** and is export/import fallback only. |
| Evidence | Project file `work-progress/projects/2026-08-30_immutable-context-ledger-v1.md`; doctrine change in `AGENT_START_HERE.md`, `repo-map/REPOSITORY_ROLES.md`, `decisions/DECISION_LOG.md` (`CAD-20260830-cross-agent-software-home-not-datastore`) |
| Next | `context-ledger-phase-0-authority-resolution-v1` — resolve Evidence-plane schema authority before any migration is written (AppBuilder holds 82 migrations and the live project ref but its registered `schemaAuthority` is `null`); choose and prove reachability of the external object-store target; register a named `claude-code-transcripts` ingestion source class, since `ingestion-source-registry.json` prohibits `uncontrolled-filesystem-crawl`. **No capture code until Phase 0 closes.** Then `context-ledger-phase-2-claude-capture-proof-v1` — Claude Code only, one source end to end, no graph/dashboard/ROI. |

### 2026-08-25 CT — compounding-intelligence-v2-live-integration-proof (planning)

| Field | Value |
| --- | --- |
| Work package | `compounding-intelligence-v2-live-integration-proof` |
| Status | **PHASE 0 PROVEN + PHASE 2 PROVEN LIVE** (host CG-RYZEN9DESK-01). Phase 0: PR #48 (`ea9111d`) — automatic propagation chain (Git main → runner → publisher → L: → Supabase → Z: hot cache) registered, converged, dispatch-tested, and confirmed by a real unassisted push (`1bde43b`, PR #49) with all four layers landing on the same SHA and zero manual freshness commands. Phase 2: PR #50 (`c97e209`) — the shared-dev Hub ingest pipeline's step 5 (`first-real-mission harness`, previously stuck at `WAITING_FOR_REAL_MISSION` since inception) proven live for the first time, using real evidence from the completed `mcp-estate-remediation-v1` mission: `FIRST_REAL_MISSION_HUB_PROOF_PASS`, all 10 harness checks true, independently re-verified via a direct SQL query against `intelligence_hub.knowledge_objects`/`.relationships` (11 real objects + relationships, correct `authority_commit` provenance). Getting there required two real infra/code fixes, both landed: the `intelligence_hub` Postgres schema wasn't in the project's PostgREST-exposed schema list (operator-approved live config change), and `createSupabaseClient()` in CG-AppBuilder-MCP was silently discarding a caller's project choice and reconnecting to a different, explicitly-forbidden Supabase project (CG-AppBuilder-MCP PR #497). Phase 1 (real hot-AI-cache proof on WESLEY_WORK + WESLEYDESK) and Phase 3 (WaveRunner integration) were not attempted this session — both explicitly require access this session doesn't have (physical access to the other two hosts; WaveRunner's repo added to scope) and were deliberately not worked around. Phase 4 depends on 1-3. |
| Repos involved | CapitalGlass-Cross-Agent (this plan); execution will touch WaveRunner, CG-AppBuilder-MCP, and the real WESLEY_WORK/WESLEYDESK/RYZEN9DESK hosts, none in this session's scope |
| Notes | Next mission after PR #45 merged, per Wesley's explicit direction to freeze the intelligence-layer local plumbing and move to a real cross-system proof. Five ordered phases: (0) close automatic intelligence freshness — Git main changes → freshness gate detects SHA mismatch → correct repo incrementally re-indexed → new publication becomes authoritative-current → L-drive cache refresh → hot-cache invalidation → Supabase confirmation → preflight reads the new generation and reports the source SHA it actually consumed, with no operator manually kicking it, plus a status-vocabulary fix (`publicationPosition`/`authorityFreshness` replacing the ambiguous `currentPublication` reported alongside `INDEX_BEHIND`); (1) real hot-AI-cache proof on all 3 hosts; (2) Supabase publication + readback through the *existing* governed OP-00A projection path — no second implementation; (3) WaveRunner integration consuming the shared preflight contract; (4) true end-to-end compounding proof (real mission → Gold Mine/graph mutation → Supabase + cache refresh → fresh agent session → proven retrieval). Governed by one uncompromising success condition: after a commit lands on `main`, a fresh agent must automatically receive intelligence derived from it without Wesley manually refreshing anything. Also governed by an explicit architectural rule across all five phases: no component reimplements another's responsibility (Cross-Agent ≠ Platform Intelligence, WaveRunner doesn't build a second preflight, hot cache/Supabase/L: don't become authority, Gold Mine doesn't bypass the graph, preflight doesn't tolerate stale provenance silently). Also recorded a deferred design item: scope-aware cache keys/filtered derived bundles, so a scoped query can eventually get a legitimate cache hit instead of always falling through to live retrieval (today's safe-but-inefficient behavior). |
| Evidence | Plan `plans/2026-08-25_compounding-intelligence-v2-live-integration-proof.md`; **execution handoff `plans/2026-08-25_compounding-intelligence-v2-phase0-execution-handoff.md` — read the handoff first, it's the host session's actual starting point** |
| Next | Not another Cross-Agent research session — Wesley's instruction is that the next agent session should be an execution session on the host (WSL host → real `L:` mount → real hot cache → live Supabase credentials → WaveRunner runtime). That session should open the execution handoff above before anything else. Phase 0 needs a real `main` push observed end-to-end with nothing manually re-run; phase 1 needs physical access to the three named hosts; phase 3 needs WaveRunner's repo added to a session's scope; phase 2 needs live Supabase credentials. This plan is ready the moment host access exists. |

### 2026-08-25 CT — compounding-intelligence-unified-loop-v1

| Field | Value |
| --- | --- |
| Work package | `compounding-intelligence-unified-loop-v1` |
| Status | **COMPLETE — PR #45 MERGED** (`e5f2fea`) — mission-intelligence registered in the real cross-repo-consumed routing/dataset registries, hot-ai-cache ladder rung with SHA-based freshness, graph-aware mission context, unified end-to-end receipt contract, WaveRunner-preflight consumption contract documented |
| Repos involved | CapitalGlass-Cross-Agent only (WaveRunner, CG-AppBuilder-MCP referenced, not in scope) |
| Notes | Follow-on to `compounding-intelligence-v2-implementation-v1` at Wesley's request — a full unified-loop architecture (hot-ai-cache → L: → Supabase → Git → mission context → WaveRunner → closeout → Gold Mine → publish → refresh cache/index), with an explicit instruction not to build the Supabase piece in isolation. Closed the concrete gap Wesley identified (preflight wasn't registered in the MCP/query-routing layer) plus everything else this repo's own boundary allows: real SHA-verified cache freshness (not TTL), real relationship-graph traversal answering "what failed/enables/governs/relates/is unresolved/was superseded," and a unified receipt that never fakes the WaveRunner/cache-refresh fields this repo doesn't own. Bugbot's review converged 3 → 1 → 0 findings across three rounds, each with a dedicated regression test; the most consequential fix was `NOT_CHECKED` vs. `UNAVAILABLE` on the receipt, making it truthful about what was actually probed. 37 new tests; 74 total checks across affected suites, all passing. |
| Evidence | Project file `work-progress/projects/2026-08-25_compounding-intelligence-unified-loop-v1.md`, plan `plans/2026-08-25_compounding-intelligence-unified-loop-v1.md`, PR #45 (merged) |
| Next | Superseded by `compounding-intelligence-v2-live-integration-proof` above |

### 2026-08-25 CT — compounding-intelligence-v2-implementation-v1

| Field | Value |
| --- | --- |
| Work package | `compounding-intelligence-v2-implementation-v1` |
| Status | **COMPLETE (in-scope pieces) — PR #43 MERGED** — registry+enforcement, freshness provenance, `intelligence.preflight()`, `/goldmine`, all implemented and tested |
| Repos involved | CapitalGlass-Cross-Agent only |
| Notes | Implemented the 4 Cross-Agent-scoped pieces of the V2 proposal: governed relationship-type registry with real ingest-time enforcement, freshness/provenance fields in the envelope's open `extensions` bag, the physical L:→Supabase→Git preflight ladder + mission-context bundle, and the canonical `/goldmine` protocol. Found and fixed 2 adjacent pre-existing bugs (a mis-pathed field in the Hub-compact compiler, an unguarded dynamic import that crashed outside a full estate checkout). **Follow-on same day:** found `/goldmine` and `intelligence.preflight()` weren't actually wired together — a goldmine run never regenerated the compact slice preflight reads, so nothing a mission harvested was ever retrievable. Closed the loop (wired the already-existing `writeHarvestIntelligenceRetrievalArtifacts()` compiler into the goldmine protocol) and proved it with a real in-repo two-agent test. Also applied the previously-only-proposed `harvest-risk-gates` CI fix (`npm ci` was missing; confirmed the only one of 4 workflows on an ephemeral runner). 38 tests passing total. |
| Evidence | Project file `work-progress/projects/2026-08-25_compounding-intelligence-v2-implementation-v1.md` |
| Next | Re-run `npm run test:intelligence` on a host with the full estate checked out (6 pre-existing tests need the sibling AppBuilder repo, unaffected by this work but unverifiable from this container); operator decision on charter wording + `CONFLICTED` lifecycle state; cross-repo adoption (Cursor, AppBuilder, WaveRunner) needs those repos in scope |

### 2026-08-24 CT — intelligence-hub-compounding-intelligence-investigation-v1

| Field | Value |
| --- | --- |
| Work package | `intelligence-hub-compounding-intelligence-investigation-v1` |
| Status | **INVESTIGATION COMPLETE; V2 PROPOSAL HARDENED, PR #43 READY FOR REVIEW** — no code changes; implementation is the next, separate phase |
| Repos involved | CapitalGlass-Cross-Agent only |
| Notes | Full map of the Intelligence Hub (retrieval plane) + the 3 Compounding Intelligence systems (OP-00A pipeline, Gold Mine loop, North Star Compounding Proof), verified directly against source docs. Expanded same day at Wesley's request into a 9-part proposal (charter fix, agent-independent retrieval preflight, closed freshness contract, harder two-agent compounding proof, graph-dividend-as-mutation, lifecycle status, naming, mission-context bundle, `/goldmine` command), each checked against the actual pipeline code. |
| Evidence | Project file `work-progress/projects/2026-08-24_intelligence-hub-compounding-intelligence-investigation-v1.md` + plan `plans/2026-08-24_compounding-intelligence-v2-proposal.md` + published Artifact: https://claude.ai/code/artifact/598390de-2537-492d-b3ba-34c665704fe1 (private) |
| Next | PR #43 is ready for review — review and decide the "needs an operator decision" list in the plan doc, then start implementation (`intelligence.preflight()`, relationship-type registry + enforcement, `/goldmine`, freshness repair) as a separate follow-on. |

### 2026-08-13 CT — wesleywork-storage-protocol-contradiction-remediation-v1

| Field | Value |
| --- | --- |
| Work package | `wesleywork-storage-protocol-contradiction-remediation-v1` |
| Host | WESLEY_WORK (`CG-WESLEYWORK-01`) |
| Owner | `CapitalGlass-Office-Admin` + Cross-Agent INDEX |
| Status | **LIVE_MACHINE_PROOF_PASS** — ProgramData tombstone verified; retired scripts cannot remap |
| Front door | `%LOCALAPPDATA%\CapitalGlass\Storage\Invoke-CgStorageKeeper.ps1 -Mode Health` |
| Forbidden | ForceRemap; re-enable PreCursor; implement offlan cmdkey WP; Cursor Hub write |
| Windows Z | `\\cg-server\Capital Glass` |
| Windows L | `\\wesleydesk\CapitalGlass-L` |
| WSL | Independent CIFS `/mnt/z` → `//cg-server/Capital Glass`; `/mnt/l` → `//wesleydesk/CapitalGlass-L` |
| Next | WESLEYDESK GHA Hub republish after both remotes land. Do not write L: from Cursor. |

### 2026-08-11 CT — active-ledger-saved-work-exporter-fix + unauthorized-merge-353-ratify-cleanup-v1

| Field | Value |
| --- | --- |
| Work package | `unauthorized-merge-353-ratify-cleanup-v1` (covers `active-ledger-saved-work-exporter-fix-v1`) |
| Verdict | **COMPLETE** — exporter `###` Field/Value parser fixed; Option C ratified; main clean |
| Exporter fix | AppBuilder PR #353 merge `251e96fb` (do not revert) |
| Ratification | PR #357 `docs(incident): ratify unauthorized ChatGPT merge` @ `11bce54c` |
| Investigation | Read-only / `NO_MUTATIONS` then operator Option C |
| AppBuilder tip | `9385539c` (synced to origin/main) |
| L: publish | BY-KIND from Cross-Agent `b320a157` — `two-desk-operating` confirmed |
| Incident memory | AppBuilder `docs/incident-memory` + artifacts under `unauthorized-merge-353-ratify-cleanup-v1/` |
| Closeout receipt | `CG-AppBuilder-MCP/artifacts/agent-runs/unauthorized-merge-353-ratify-cleanup-v1/session-closeout-v3.2.json` |
| Next | Optional ChatGPT read-only / write-guard enforcement; hop packet refresh on AppBuilder tip |

### 2026-08-12 CT — cg-federated-repo-index-v1 / luna-estate-retrieval-index-v1

| Field | Value |
| --- | --- |
| Work package | `cg-federated-repo-index-v1` (umbrella `luna-estate-retrieval-index-v1`) |
| Program state | **CG_FEDERATED_REPO_INDEX_WAVE_A_CLOSED** |
| Acceptance | **LIVE_RYZEN9_PROOF_PASS** |
| Wave A close | **true** — GHA `31669015141` on CG-RYZEN9DESK-01 |
| Blocker | `null` (prior `BLOCKED_GHA_WP_NOT_ALLOWLISTED` cleared by allowlist + live proof) |
| Failover | `DIRECT_CONNECT_HIT` |
| Compiler host | RYZEN9DESK ext4 `$HOME/repos` (not `/mnt/c`) |
| AppBuilder SHA | **`c87ee2420`** (`c87ee2420243bb0f5da7c869ea52f0d3cab6b0b0`) on **`main`** — PR #372 merged; post-merge Luna acceptance PASS |
| CE SHA | `acc4e2b6` on `work/cg-federated-repo-index-v1` |
| Project file | `work-progress/projects/2026-08-12_cg-federated-repo-index-v1.md` |
| Next | Hub L: replica publish only after operator authorization (replicas last). Do not expand indexing scope. |
| Recorded failure | `AGENT_RETRIEVAL_FRONT_DOOR_SKIPPED` — addressed by Luna director mandatory entry |
| Deferred | Hub replica publish to L:; `ryzen9desk-executor-transport-repair-v1` hardening |

### 2026-08-11 CT — two-desk-operating-v1

| Field | Value |
| --- | --- |
| Work package | `two-desk-operating-v1` |
| Verdict | **TWO_DESK_OPERATING_BOTH_READY** |
| AppBuilder tip | `2c36e40e` (PR #350 merged); later tip includes exporter+ratify (`9385539c`) |
| Proof | `Z:\Office\Wes\Direct Connect\handoffs\HANDOFF 8-11-26\TWO_DESK_OPERATING-PROOF-BOTH-READY.json` |
| RYZEN | cheap hop READY ~3s |
| WESLEYWORK | cheap hop READY / PASS_READY ~3s; L: hub mounted; soft-block closeout true |
| Ops STATUS | Direct Connect `STATUS-UPDATE.json` + Network-Admin `status/dual-desk/two-desk-operating.latest.json` |
| L: BY-KIND | Published with `two-desk-operating` match from Cross-Agent `b320a157` (index:publish done for this slice) |
| Project file | `work-progress/projects/2026-08-11_two-desk-operating-v1.md` |
| Next | Optional OA MCP reconnect; optional ChatGPT read-only/write-guard follow-up (see ratify cleanup entry) |


### 2026-08-10 CT — active-ledger-currentness-ingestion-and-harvest-v1

| Field | Value |
| --- | --- |
| Work package | `active-ledger-currentness-ingestion-and-harvest-v1` |
| Verdict | **LEDGER_CURRENT_AND_HARVEST_DURABLE** (pending hub/index publish receipt) |
| Root cause | Harvest/INDEX updates without mandatory `ACTIVE_WORK.md` projection — index-only ingestion path |
| Repair | Catch-up entries 2026-08-04→08-10; `active-ledger:reconstruct-catchup` + `active-ledger:staleness-gate` (AppBuilder) |
| Harvest | `harvest-2026-08-10-active-ledger-catchup-and-hub-drift-v1` (T2) — references upstream harvests, no product re-harvest |
| Hub drift | Repaired via `active-ledger:sync --publish` after canonical ledger commit |
| Projection | Supabase ingest — verify with `cross-agent-ledger:drift-probe` (degraded if 401 persists) |
| Receipt | `artifacts/agent-runs/active-ledger-currentness-ingestion-and-harvest-v1/admission-receipt.json` |
| Next | Operator: `harvest:publish-hub-seed` + `index:publish` + `index:freshness-gate` for catch-up harvest |

### 2026-08-10 CT — Experience Graph foundation + Rosewood closeout (reference harvests)

| Field | Value |
| --- | --- |
| Work packages | `experience-graph-foundation-and-economic-value-v1` (EG-01), `experience-estimator-bid-composer-loop-v1` (Rosewood) |
| Verdict | **EG-01 merged** (`eac6f16`); **Rosewood DURABLE_COMPLETE** — see upstream harvests |
| Upstream harvests | `harvest-2026-08-10-experience-rosewood-bid-composer-closeout-v1`; Wave 4 `a1b38e5`; Beacon Hill launch `afb8066` |
| Evidence | `contracts/experience/`; `Data-Extraction/artifacts/agent-runs/experience-estimator-bid-composer-loop-v1/terminal-milestone-receipt-v1.json` |
| Next | EG-06 report-parsing pilot after B1–B4 foundation acceptance; Beacon Hill proposal-generator loop |

### 2026-08-07 CT — Universal harvest + intelligence index foundation (reference)

| Field | Value |
| --- | --- |
| Work packages | `universal-harvest-aperture-durable-closeout-v1`, intelligence-index foundation |
| Verdict | **HARVEST_COMPLETE** — see `harvest-2026-08-07-universal-harvest-aperture-durable-closeout-v1` |
| Commits | Cross-Agent harvest chain through `18208e2` intelligence-index foundation |
| Next | Use `harvest:record` + staleness gate — do not skip ACTIVE_WORK on future harvest closeouts |

### 2026-08-04 CT — active-ledger-blocker-gate-sweep-v1

| Field | Value |
| --- | --- |
| Work package | `active-ledger-blocker-gate-sweep-v1` |
| Verdict | **BLOCKER_GATE_SWEEP_PASS** — 3 cleared, 5 domain-gated, 3 operator checklist |
| Cleared | Auto v3.2 env contamination; Document Center SHA (`f16b4ff` in Doppler + GitHub); `/mnt/c` regression (WSL default PASS) |
| Indexed blockers | 5 domain WPs remain in `INDEX.md` § Cross-cutting blockers |
| Gates | `check:auto-v32-session-env-policy` PASS; `active-ledger:sync` + L: publish; `cross-agent-ledger:ingest` |
| Receipt | `artifacts/agent-runs/active-ledger-blocker-gate-sweep-v1/blocker-gate-receipt.json` |
| Next | Rerun DC production smokes; operator MCP restart before compounding pilot |

### 2026-08-03 CT — Chat-thread harvest protocol hot-cache + ROI additions

| Field | Value |
| --- | --- |
| Work package | `chat-thread-harvest-protocol-hot-cache-roi-v1` |
| Verdict | **DOCS_ADDED** — protocol additions recorded in Cross-Agent |
| Runbook | `runbooks/CHAT_THREAD_HARVEST_PROTOCOL.md` |
| Artifacts | `artifacts/agent-runs/chat-thread-harvest-protocol-hot-cache-roi-v1/` |
| Added fields | `scoutHotCacheProof`, `recommendedRoi`, `commands`, `authorityLineage`, `staleAuthorityComparison` |
| Owner boundary | Cross-Agent records; AppBuilder implements tooling; Governance owns required protocol authority |
| Next | Implement schema/generator validation in AppBuilder if these become enforced fields |

### 2026-08-04 CT — harvest-2026-08-03-wesleydesk-runner-slice6-closeout-v1 (T2 autopsy)

| Field | Value |
| --- | --- |
| Work package | `harvest-2026-08-03-wesleydesk-runner-slice6-closeout-v1` |
| Verdict | **HARVEST_COMPLETE** — 3 packets, 4 seed candidates, 6 waste items |
| Artifacts | `artifacts/agent-runs/harvest-2026-08-03-wesleydesk-runner-slice6-closeout-v1/` |
| Thread | WESLEYDESK runner bootstrap, Slice 6 closeout, reboot persistence fix |
| Publication | Git only — hub `not-run` (operator: `harvest:publish-hub-seed` + `index:publish` on WESLEYDESK) |
| Next | Cold-reboot runner persistence proof; auto-publisher v1.1 activation |

### 2026-08-04 CT — intelligence-hub-capability-expansion-v1 wave 1

| Field | Value |
| --- | --- |
| Work package | `intelligence-hub-capability-expansion-v1` |
| Verdict | **WAVE1_SHIPPED** — `PUBLISH_PASS` @ `164bda7` |
| Artifacts | `artifacts/agent-runs/intelligence-hub-capability-expansion-v1/` (`milestone-receipt-v1.json`) |
| Publication | Git/Supabase/L: aligned; control slices on L: BY-KIND |
| Tests | `test:index-control-slices` 7/7 PASS; idempotency `NOOP_CURRENT` |
| Next | Wave 2 auto-publisher activation on WESLEYDESK |

### 2026-08-03 CT — harvest-current-cross-thread-state-v2 HARVEST_COMPLETE

| Field | Value |
| --- | --- |
| Work package | `harvest-current-cross-thread-state-v2` |
| Verdict | **HARVEST_COMPLETE** — 9/9 packets; `harvest:validate` PASS |
| Artifacts | `artifacts/agent-runs/harvest-current-cross-thread-state-v2/` |
| Preserved | `THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL` not claimed; hub published @ `164bda7` |
| Next | Post-publication blind retrieval for Slice 6 |

### 2026-08-03 CT — Cross-Agent index current + AI Cache Layer 0

| Field | Value |
| --- | --- |
| Work package | `cross-agent-index-current-ai-cache-v1` |
| Verdict | **CROSS_AGENT_INDEX_CURRENT_PASS**; **CROSS_AGENT_INDEX_AI_CACHE_LAYER0_PASS**; **FRESH_CURSOR_INDEX_DOGFOOD_PASS** |
| Publication | Git/Supabase/L: aligned @ `56e9a32` via `index:sync-publication` |
| AI Cache | Layer 0 mirror; operator `npm run agent:index:ai-cache:refresh` |
| Dogfood | `INDEX_HIT_AI_CACHE`, `freshnessVerdict=CURRENT`, `rawScanRequired=false` |
| Artifacts | CG-AppBuilder-MCP `artifacts/agent-runs/cross-agent-index-current-ai-cache-v1/` + `fresh-cursor-index-dogfood-v1/session-receipt.json` |

### 2026-08-03 CT — Cross-Agent index preflight estate-wide (rule propagation complete)

| Field | Value |
| --- | --- |
| Work package | `cross-agent-index-preflight-estate-wide-v1` |
| Verdict | **CROSS_AGENT_INDEX_PREFLIGHT_ESTATE_WIDE_PASS** — 26 SYNCED, 6 EXCLUDED |
| Artifacts | CG-AppBuilder-MCP `artifacts/agent-runs/cross-agent-index-preflight-estate-wide-v1/` (`coverage-table.json`, `operational-verdict.json`, `closeout-manifest.json`) |
| Preserved | `PREFLIGHT_INDEX_UTILIZATION_V1_PASS`; `PREFLIGHT_INDEX_3WAY_INTEGRATION_PASS`; `AUTO_PUBLISHER_V1_1_STAGED_NOT_ACTIVE` |
| Ledger note — Office Admin | Functionally covered; **not owner-branch absorbed**. Side branch `chore/cross-agent-index-preflight-estate-wide-v1` @ `17ab7ae` needs normal merge/rebase before absorption. |
| Next promotion | **`FRESH_CURSOR_INDEX_DOGFOOD_PASS`** — not more rule copying. Requires `sessionReceiptPath`, first-action evidence, `rawScanRequired=false` honored in a **fresh** Cursor session (build chats do not count). |

### 2026-08-03 CT — Cross-thread platform state harvest

| Field | Value |
| --- | --- |
| Work package | `harvest-2026-08-03-cross-thread-platform-state-v1` |
| Verdict | **HARVEST_COMPLETE** — 6/6 packets recorded |
| Artifacts | `artifacts/agent-runs/harvest-2026-08-03-cross-thread-platform-state-v1/` (`receipt.json`, `HARVEST_SUMMARY.md`, `packet-index.json`) |
| Project file | `work-progress/projects/2026-08-03_harvest-2026-08-03-cross-thread-platform-state-v1.md` |
| Constraints | No SSH, no runner install, no AppBuilder edits, no L: publish in harvest commit |
| Remaining | RYZEN9DESK bootstrap (AppBuilder mission); Office Admin indexing; Synology dev blockers; recurring ingest |

### 2026-08-03 CT — Cross-Agent repo hygiene and agent investigation playbook

| Field | Value |
| --- | --- |
| Work package | `cross-agent-repo-hygiene-and-agent-investigation-v1` |
| Verdict | **Docs PASS** — handoff reconciled; index/decision log expanded; investigation plan added |
| Files | `handoffs/CURRENT_HANDOFF.md`, `plans/2026-08-03_cross-agent-repo-hygiene-and-agent-investigation-v1.md`, `decisions/DECISION_LOG.md`, `projects/INDEX.md`, `AGENT_START_HERE.md` |
| Cleared blockers | Removed stale ingest HOLD and `/mnt/c` contradiction from handoff; unified retrieval failover contract |
| Remaining | Owner-qualify all 404 evidence paths; sync canonical `intelligence-hub-first-read` in AppBuilder; operator public-visibility review |
| Next | Commit/push Cross-Agent; republish L: + Supabase if ledger hash changes |

### 2026-08-03 CT — RYZEN9DESK managed executor (Phase 0 on `main`; bootstrap checkpoint)

| Field | Value |
| --- | --- |
| Work package | `ryzen9desk-managed-executor-v1` |
| Verdict | **RUNNER_BOOTSTRAP_CHECKPOINT_STARTED** — PR #268 merged `8fe7cf05`; bootstrap is CG-AppBuilder-MCP mission |
| Tooling | `.github/workflows/ryzen9desk-executor-dispatch.yml`, `scripts/executor/*`, `npm run ryzen9desk:executor:*` |
| Prior WP | `ryzen9desk-wsl2-canonical-workspace-v1` becomes first dispatched job (`wsl2-canonical-setup`) |
| Next | RYZEN9DESK install + `executor-smoke` — **do not claim** `MANAGED_EXECUTOR_ONLINE` until receipt |

### 2026-08-03 CT — RYZEN9DESK WSL2 canonical workspace (BLOCKED — superseded by executor dispatch)

| Field | Value |
| --- | --- |
| Work package | `ryzen9desk-wsl2-canonical-workspace-v1` |
| Verdict | `BLOCKED` — prepared on WESLEY_WORK; execute via managed executor on RYZEN9DESK |
| Tooling | `npm run ryzen9desk:wsl2-canonical`, machine profile `ryzen9desk.machine.json` |
| Receipts | `CG-AppBuilder-MCP/artifacts/agent-runs/ryzen9desk-wsl2-canonical-workspace-v1/` |
| Next | Dispatch `wsl2-canonical-setup` after runner online (see `ryzen9desk-managed-executor-v1`) |

| Repo | Commit | Status | Notes |
| --- | --- | --- | --- |
| CG-AppBuilder-MCP | PR #267 | Merged | PromptOps suite index refresh + ext4 repos-root fixes |
| CapitalGlassRevu | PR #5 | Merged | WSL root-fs preflight, application-bible/foundation CI fixes |
| CapitalGlass-Cross-Agent | `15f0e5e` | Pushed | Added WSL MCP hardening project file from pasted Cursor results |
| CG-AppBuilder-MCP | `63dbeb8c` | Pushed | Structured ledger Phase 1–3 milestone — ingest, drift probe, preflight wiring |
| CG-AppBuilder-MCP | PR #265 | Merged | ledgerOnly compact v2 + active-ledger spine (`c32c331f`; supersedes #264) |
| CG-Platform-Governance-MCP | `a5ce4c3` | Pushed | Structured ledger schema Phase 0 **CURRENT** |
| CapitalGlass-Cross-Agent | `7f1448f` | Pushed | Structured ledger milestone closeout in active ledger |
| Data-Extraction | `e6311b5` | Pushed | L: active-work publisher (Phase 1B) |

Full pre-drain commit table: `archive/2026-08/ledger-snapshots/phase-0-pre-drain/ACTIVE_WORK-2026-08-02-pre-drain.md`

## Operating rules (pointers)

| Rule | Authority |
| --- | --- |
| Governance decides what counts; AppBuilder executes | `CG-Platform-Governance-MCP/docs/platform/ACTIVE_LEDGER_RELEASE_AUTHORITY_CONTRACT.md` |
| Drained authority rules | `CG-Platform-Governance-MCP/docs/platform/ACTIVE_LEDGER_AUTHORITY_RULES.md` |
| Structured ledger schema | `CG-Platform-Governance-MCP/docs/platform/CROSS_AGENT_STRUCTURED_LEDGER_CONTRACT.md` | **CURRENT** |
| Bible-dependent work | `npm run bible:authority:gate` from CG-AppBuilder-MCP |
| GPU host authority | `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md` § GPU Host Authority |

## Open next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | **Synology-primary dev lane** — child WP `project-folder-synology-primary-v1-dev-hosted-environment` (**HOLD**: Vercel BLOCKED + Supabase I2) | CapitalGlass-Documents / WESLEYDESK | **HOLD** — contract `d8826e8` PASS; hosted dev blocked |
| 2 | Do **not** deploy `Install-CgWesleyWorkDriveMountPersistence.ps1`. Keep Storage Keeper. Hub republish after INDEX (`wesleywork-storage-protocol-contradiction-remediation-v1`) | CapitalGlass-Office-Admin | SUPERSEDED installer — live ProgramData tombstone 2026-08-13 |
| 3 | Rerun Document Center production smokes after SHA pin (`suite-ci-healing-v1`) | CapitalGlass-Documents | **Ready** — Doppler + GitHub `EXPECTED_DOCUMENT_CENTER_GIT_SHA` synced 2026-08-04 |
| 2 | Use Windows Desktop `Capital Glass Cursor (WSL Suite).lnk`; close any Cursor windows opened from `/mnt/c` / `C:\Developer\repos` | Cursor / operator | Ongoing operating rule — WSL default verify PASS |
| 2 | L: hub readable at `/mnt/l/Capital-Glass-Intelligence-Hub/00-master-index` | WESLEYDESK / WSL | Complete for seed report |
| 3 | WSL seed structured-ledger ingest and drift probe | CG-AppBuilder-MCP | Complete — `IN_SYNC` via Doppler-backed Supabase token |
| 3 | Reload Cursor MCP after WSL repair Waves 1-3 | Cursor / operator | Pending |
| 3 | Complete Vercel MCP auth only when Vercel connector is needed | Cursor / Vercel | Pending |
| 4 | Keep Cloudflare stdio disabled or fix `127.0.0.1:15170` OAuth loopback conflict | Cursor / Cloudflare | Pending |
| 5 | Commit and push Wave 4 `mcp:repair:cursor` changes from ext4 worktrees if remote promotion is desired | CG-AppBuilder-MCP / Cursor-MCP-Kit | Pending operator decision |
| 6 | Run Cursor seeding handoff `cross-agent-seed-wsl-mcp-backfill-v1` from `~/repos/CG-AppBuilder-MCP` | CG-AppBuilder-MCP | Pending |
| 7 | Re-run gated ingest after ledger updates (`cross-agent-ledger:ingest --apply`) | CG-AppBuilder-MCP | Recurring |
| 8 | Run drift probe when hub/projection may be stale | CG-AppBuilder-MCP | Recurring |
| 9 | Publish L: hub slices after ledger edits | Data-Extraction | Recurring |
| 10 | Restart MCP for Governance compounding tools | Cursor / local MCP | Pending |

**Default agent preflight (machine-readable):** `openActions` + `blockers` only — L: hub slices when available, else Supabase derived projection (`compact-slices-only`). Not full ledger. `currentFocus` human-only (`whats-active-now --include-current-focus`).

## Progress log (latest entries)

### 2026-08-03 CT — harvest-2026-08-03-cross-thread-platform-state-v1 HARVEST_COMPLETE

| Field | Value |
| --- | --- |
| Work package | `harvest-2026-08-03-cross-thread-platform-state-v1` |
| Verdict | **HARVEST_COMPLETE** — 6 packets: executor checkpoint, active-ledger CI PASS, Synology dev HOLD, retrieval failover PASS, WSL migration PARTIAL, Office Admin pointer |
| Receipt | `artifacts/agent-runs/harvest-2026-08-03-cross-thread-platform-state-v1/receipt.json` |
| Retrieval | `INDEX_HIT` (L: mounted) |
| Forbidden honored | No SSH, runner install, AppBuilder changes, or L: publish |

### 2026-08-03 CT — Synology-primary step #3: hosted dev HOLD

| Field | Value |
| --- | --- |
| Work package | `project-folder-synology-primary-v1-dev-hosted-environment` |
| Contract | **PASS** — `d8826e8` on CapitalGlass-Documents `main` |
| Hosted dev | **HOLD** — Vercel deploy `BLOCKED`; Supabase dev project not isolated (I2) |
| Doppler dev | Partial — roots, unique worker token, `CLAIMED_BY`, flag **off** |
| Stable alias | `documents-dev.capitalglasstxapps.com` registered; serves **stale f16b4ff** (not `d8826e8`); claim **405** |
| Production | **HALTED** / **NOT touched** |

### 2026-08-03 CT — Synology-primary: halt production, open dev-environment WP

| Field | Value |
| --- | --- |
| Work package | `project-folder-synology-primary-v1-dev-environment` (successor) |
| Parent | `project-folder-synology-primary-v1` → **PRODUCTIONIZATION_HALTED** |
| Root cause | Skipped hosted dev lane: local proof → production Vercel |
| Ops | `PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=false` in Doppler `cg-documents/prd` + Vercel production |
| Dev roots | `L:\Capital-Glass-Projects-Dev` / Doppler `cg-documents/dev` |
| Production | Frozen until dev gates pass; promotion of proven commit only |

### 2026-08-03 CT — WESLEY_WORK drive-mount task dedupe IMPLEMENTED

| Field | Value |
| --- | --- |
| Work package | `wesleywork-drive-mount-task-dedupe-v1` |
| Verdict | **SUPERSEDED** 2026-08-13 — do not deploy; Storage Keeper is the front door |
| Protocol | Office Admin Protocol v1.5 |
| Owner repo | CapitalGlass-Office-Admin |
| Root cause | Three 15m Health tasks without `IgnoreNew`/`Hidden` — duplicate flashing PowerShell windows |
| Fix | Keep `DriveMount-Health` only; remove `LanRecheck` + `User-Health`; hidden XML tasks + `-Quiet` |
| Unit tests | 7/7 PASS |
| Receipt | `artifacts/agent-runs/wesleywork-drive-mount-task-dedupe-v1/receipt.json` |
| Deploy | **DO NOT RUN** retired installer. Use Storage Keeper Health. |
| Live probe | **SUPERSEDED** — Storage Keeper + ProgramData tombstone 2026-08-13 |

### 2026-08-03 CT — WESLEY_WORK WSL default layout PASS

| Field | Value |
| --- | --- |
| Work package | `capital-glass-cursor-wsl-default-v1` / `wsl-mcp-cursor-doppler-promptops-hardening-v1` follow-on |
| Status | **PASS** — Cursor WSL default active |
| Default workspace | `/home/wesle/Capital-Glass-Suite.WSL.code-workspace` |
| Full workspace | `/home/wesle/Capital-Glass-Full-Library.WSL.code-workspace` |
| Active repo root | `/home/wesle/repos` |
| Inventory | 39 active repos plus `_archive/` |
| Archived | 24 stale clones moved to `_archive/worktree-clones/` |
| Operator docs | `~/.config/capital-glass/README.md` |
| Env authority | `~/.config/capital-glass/cursor-wsl.env` |
| Layout manifest | `~/.config/capital-glass/wsl-layout.v1.json` |
| Windows launcher | `Capital Glass Cursor (WSL Suite).lnk` |
| Verify | `PASS: Cursor WSL default is active` |
| Repair sequence | `npm run cursor:wsl-organize`; `npm run cursor:wsl-default`; `npm run cursor:wsl-default:verify` |

### 2026-08-03 CT — suite CI healing partial PASS

| Field | Value |
| --- | --- |
| Work package | `suite-ci-healing-v1` |
| Status | **PARTIAL PASS** — three surfaces green; Document Center blocked on deployed-SHA secret mismatch |
| Green | `capital-glass-product-catalog` Validate; `Cursor-ProposalGenerator` drift canary; `CapitalGlass-Office-Admin` validate-code after PR #51 merge |
| Document Center | Workflow now uses `EXPECTED_DOCUMENT_CENTER_GIT_SHA`; production `/api/version` reports `f16b4ff` from `feat/storage-orchestrator-persistence-v1` |
| Required next | Update Doppler/GitHub secret to `f16b4ff334affe8c900cded6a6feac6480c0d848`, or redeploy from main and set expected SHA to that deploy |
| Backlog | Stale AppBuilder PRs #254, #252, #228, #227, #216; self-hosted nightly full closeout gate; Cross-Agent ext4 clone + ledger publish |
| Project file | `work-progress/projects/2026-08-03_suite-ci-healing-v1.md` |

### 2026-08-03 CT — Wave 4 `mcp:repair:cursor` PASS

| Field | Value |
| --- | --- |
| Work package | `wsl-mcp-cursor-doppler-promptops-hardening-v1` follow-on |
| Status | **Implemented and verified locally** |
| Command | `npm run mcp:repair:cursor` |
| Machine output | `npm run mcp:repair:cursor:json` |
| Receipt | `~/.cursor/backups/mcp-repair-cursor-*.json` |
| Verification | PASS — 26 servers, 8 app spokes, ext4 paths, Doppler node-only wiring OK |
| Changed repos | `~/repos/CG-AppBuilder-MCP`, `~/repos/Cursor-MCP-Kit` |
| Operator next | Cursor -> Settings -> MCP -> Restart, then optional `npm run mcp:ack-cursor-restart` |
| Remote promotion | Pending if Wesley wants changes committed and pushed |

### 2026-08-03 CT — Wave 4 drift-proof MCP repair scoped

| Field | Value |
| --- | --- |
| Work package | `wsl-mcp-cursor-doppler-promptops-hardening-v1` follow-on |
| Status | **Implemented and verified locally** |
| Root cause class | Drift across Doppler truth, `integrations.env`, `mcp.json`, and WSL/Windows path semantics |
| Delivered slice | `npm run mcp:repair:cursor`: repair + app spokes + normalization + Doppler token sync + WSL path overrides + hard verify + receipt |
| Verification | `mcp:repair:cursor` PASS; `wsl:mcp:verify` PASS with 26 servers, 8 spokes, ext4 paths, Doppler wiring OK |
| Separate operator item | Add `RAILWAY_API_TOKEN` to Doppler for headless Railway fallback |

### 2026-08-03 UTC — WSL seed structured-ledger projection IN_SYNC

| Field | Value |
| --- | --- |
| Work package | `wsl-mcp-cursor-doppler-promptops-hardening-v1` / `cross-agent-seed-wsl-mcp-backfill-v1` |
| Status | **Ledger slice PASS** — compact PASS, L: mirror PASS, Supabase projection `IN_SYNC` |
| Supabase projection | `capital-glass-cross-agent/current` in project `xjivcwcyyimjujbchwdf` |
| Source commit | `5ddd274` |
| Content hash | `9eb1c56202067a7139aa264e6a13b6465525e3e6243a678491421a2c49c0e300` |
| Counts | 12 open actions / 10 blockers |
| Event | `5b090a49-acf4-43a3-8ffe-6705e65d7634` |
| Receipt | `~/repos/CG-AppBuilder-MCP/artifacts/agent-runs/cross-agent-structured-ledger-projection-v1/ingest-apply-receipt.json` |
| Note | Bare Supabase CLI returned 401; use `doppler run` from `cg-mcp/dev` so `SUPABASE_ACCESS_TOKEN` is injected |

### 2026-08-02 CT — WSL MCP / Cursor / Doppler / PromptOps hardening backfilled

| Field | Value |
| --- | --- |
| Work package | `wsl-mcp-cursor-doppler-promptops-hardening-v1` |
| Status | **Ledger seed slice PASS** — compact promoted to L: and verified; Supabase projection updated to `5ddd274` / `9eb1c562...`; drift `IN_SYNC`; host mode still `/mnt/c` remains separate |
| Project file | `work-progress/projects/2026-08-02_wsl-mcp-cursor-doppler-promptops-hardening-v1.md` |
| Verification | `wsl:mcp:smoke` 31/31 PASS; durable bootstrap 20/20 PASS; Doppler probe OK; path-coherence fallback `wsl:mcp:verify` PASS / `wsl:mcp:repair` NO_CHANGE |
| Next action | Reopen Cursor from `/home/wesle/repos/CG-AppBuilder-MCP`; keep Vercel MCP auth, Cloudflare loopback, and `mcp:attest` as separate follow-ups |

### 2026-08-02 CT — structured ledger projection Phases 1–3 milestone PASS

| Field | Value |
| --- | --- |
| Work package | `cross-agent-structured-ledger-projection-v1` |
| Status | **MILESTONE PASS** — ingest applied, drift `IN_SYNC`, derived-only verified |
| Evidence | `CG-AppBuilder-MCP/artifacts/agent-runs/cross-agent-structured-ledger-projection-v1/milestone-closeout-v1.json` |
| Commits | AppBuilder `63dbeb8c`; Governance `a5ce4c3` |
| Operating model | Git canonical; Supabase derived index; agents get blockers/actions only by default |

### 2026-08-02 CT — cross-agent registry + active-ledger drain closeout

| Field | Value |
| --- | --- |
| Work packages | `cross-agent-registry-onboard-v1`, `active-ledger-drain-and-intelligence-hub-sync-v1` |
| Status | **Closeout PASS** — governance authorized, corpus synced, lifecycle `CLOSEOUT_AUTHORIZED` |
| Evidence | `CG-AppBuilder-MCP/artifacts/agent-runs/active-ledger-drain-and-intelligence-hub-sync-v1/session-closeout-v3.2.json` |
| Next WP | `cross-agent-structured-ledger-projection-v1` Phases 1–3 **COMPLETE**; Phase 4 optional |

Registry onboard: AppBuilder `38a162da` / `48a1bff1`. Structured projection schema opened at Governance `dc49d9c`.

### 2026-08-02 CT — active ledger drain activated (trimmed live ledger)

| Field | Value |
| --- | --- |
| Work package | `active-ledger-drain-and-intelligence-hub-sync-v1` |
| Status | Phases 0–3 complete; Phase 5 closeout recorded |
| Repos | Cross-Agent `d25b79b`, AppBuilder `348b2133`/`cd4a9005`, Data-Extraction `e6311b5`, Governance `c40eb48` |

Project file: `work-progress/projects/2026-08-02_active-ledger-drain-and-intelligence-hub-sync-v1.md`

### 2026-08-02 21:02 CT — north-star-compounding-proof-v1 pushed with evidence

| Field | Value |
| --- | --- |
| Work package | `north-star-compounding-proof-v1` |
| Status | Pushed |
| Next action | Restart MCP; begin `north-star-compounding-vertical-pilot-v1` |

Older entries: `archive/2026-08/ledger-snapshots/phase-0-pre-drain/ACTIVE_WORK-2026-08-02-pre-drain.md`
