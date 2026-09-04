# CapitalGlass-Cross-Agent — Deep AI Index

**Index:** `cross-agent-deep-ai-index-v1@1.0.0`  
**Source snapshot:** `main` @ `b95828a632b954de5045d1fb691b70f43056d77e` (2026-09-04)  
**Companion:** `repo-index.v1.json`  
**Indexing mode:** deep semantic source reconciliation  
**Verification:** source-verified; runtime gates were not executed by this indexing pass

> This file is a navigation and authority map. It does not replace contracts, manifests, closeouts, registries, receipts, or owner-repo evidence. A newer explicit architecture lock outranks this index and requires the index to be refreshed.

---

## 1. Repository identity

`CapitalGlass-Cross-Agent` began as the shared human/agent coordination repository, but current `main` has evolved beyond the older “meeting repo only” description.

At this snapshot it has five material roles:

1. **Human coordination authority** — active work, durable decisions, handoffs, project records, verification pointers.
2. **Harvest authority tooling** — deterministic harvest manifests, derived packet views, retention/freshness/quality gates, ChatGPT harvest, protocol self-learning, Gold Mine support.
3. **Operational intelligence owner** — post-closeout handoff validation, mission-ledger projection, derived intelligence objects, relationship graph, Hub compact compilation/publication semantics, provenance reconstruction.
4. **Estate retrieval / routing registry owner** — query routing, dataset registry, authority/command/workflow/closeout/mission-intelligence registry surfaces.
5. **Cross-system publication coordinator** — pinned-SHA publication to Intelligence Hub / AI-cache planes and orchestration of CG Master Graph publication.

It is **not** the universal implementation owner. Product implementation remains in product repos; governance and progression authority remain external where explicitly assigned.

---

## 2. Authority hierarchy

### 2.1 Controlling authority by concern

| Concern | Controlling authority | Cross-Agent role |
| --- | --- | --- |
| Constitutional protocol / capture / closeout validation | `CG-Platform-Governance-MCP` + applicable Governance contracts | coordination and evidence pointers; do not redefine constitutional rules here |
| Execution / ordinary mission closeout | `CG-AppBuilder-MCP` and governed execution surfaces | evidence consumer and worker orchestrator |
| Progression / what happens next | WaveRunner / Git / governing gates | **never** derived-intelligence progression authority |
| Human active-work state | `work-progress/ACTIVE_WORK.md` | editable human ledger authority |
| Durable Cross-Agent decisions | `decisions/DECISION_LOG.md`, unless explicitly superseded | durable decision record |
| Per-harvest machine truth | `artifacts/agent-runs/<harvestId>/harvest-manifest-v1.json` | canonical harvest-run authority |
| Operational intelligence semantics | `work-progress/projects/operational-intelligence-envelope-v1.md` + `contracts/intelligence/OWNERSHIP.md` | **INTELLIGENCE_OWNER** |
| Operational evidence truth | producer closeout referenced by `intelligence-handoff-v1` | verify/project/derive; do not replace source evidence |
| Query routing | `registry/query-routing/query-routing-manifest.v1.json` | owner/maintainer |
| Hot-cache dataset contract | `registry/datasets/hot-cache-dataset-registry.v1.json` | owner |
| Retrieval storage | Intelligence Hub / L: / Supabase / Z: under their own contracts | retrieval/publication plane, not progression authority |
| CG Master Graph truth | `CG-MASTER-GRAPH` | Cross-Agent coordinates validate/publish only |

### 2.2 Supersession: stale “meeting repo only” guidance

Older files still describe Cross-Agent as a meeting/coordination repo and may say not to add `scripts/` or implementation-like code:

- `README.md`
- `AGENT_START_HERE.md`
- `work-progress/WORKSPACE_CONTEXT.md`
- `repo-map/REPOSITORY_ROLES.md`
- early rows in `decisions/DECISION_LOG.md`

Those rules remain useful for **product implementation placement** and the Governance/AppBuilder split, but they are **partially superseded for the intelligence subsystem** by later locked authority:

- `contracts/intelligence/OWNERSHIP.md` — `ARCHITECTURE_LOCKED`
- `work-progress/projects/operational-intelligence-envelope-v1.md` — `ARCHITECTURE_LOCKED`

The controlling intelligence boundary is:

```text
APPBUILDER       = DO THE WORK
CROSS-AGENT      = LEARN FROM THE WORK
INTELLIGENCE HUB = MAKE WHAT WAS LEARNED AVAILABLE
WAVERUNNER       = CONTROL WHAT HAPPENS NEXT
```

Do not “repair” this distinction by moving derived-intelligence semantics into AppBuilder or by turning Cross-Agent intelligence into progression authority.

---

## 3. Agent read order

Use this order, with freshness awareness:

1. `AI_INDEX.md`
2. `work-progress/ACTIVE_WORK.md`
3. `registry/query-routing/query-routing-manifest.v1.json`
4. `registry/datasets/hot-cache-dataset-registry.v1.json`
5. Task-specific authority:
   - Harvest → `scripts/harvest/` + relevant harvest schema/project contract
   - Intelligence → `contracts/intelligence/OWNERSHIP.md`, `work-progress/projects/operational-intelligence-envelope-v1.md`, `scripts/intelligence/`
   - Index publication → `scripts/index/`, `.github/workflows/index-publication.yml`
   - Experience semantics → `contracts/experience/`
   - Estimating contracts → `contracts/estimating/`
6. `decisions/DECISION_LOG.md`
7. `handoffs/CURRENT_HANDOFF.md` — verify date/commit anchor first
8. `work-progress/projects/INDEX.md` and the specific project file
9. Older onboarding docs for historical placement intent only

### Freshness rule

A filename containing `CURRENT` is not sufficient proof of freshness. Compare declared date / commit anchor against Git `HEAD`, `ACTIVE_WORK.md`, and newer explicit architecture plans.

---

## 4. Subsystem map

### 4.1 Coordination / human ledger

**Purpose:** durable cross-agent context: current work, project IDs, status, blockers, owner repos, evidence, commits, verification, and next actions.

Primary surfaces:

- `work-progress/ACTIVE_WORK.md`
- `work-progress/projects/INDEX.md`
- `work-progress/projects/*.md`
- `decisions/DECISION_LOG.md`
- `handoffs/CURRENT_HANDOFF.md`
- `verification/CURRENT_GATES.md`
- `repo-map/REPOSITORY_ROLES.md`

**Invariant:** coordination records may point at owner-repo implementation but do not make Cross-Agent the implementation owner.

**Freshness caveat:** `ACTIVE_WORK.md` is current through 2026-09-04; several `CURRENT_*` / onboarding files are older. Resolve conflicts using explicit dates and newer subsystem authority.

---

### 4.2 Harvest subsystem

**Canonical per-run authority:**

```text
artifacts/agent-runs/<harvestId>/harvest-manifest-v1.json
```

Generated summaries, packet indexes, receipts, coverage reports, compact records, and rendered indexes are projections from the manifest.

**Main entry point:**

```bash
npm run harvest:record -- --harvest-id=<id>
```

Implementation: `scripts/harvest/record-harvest.mjs`.

**Execution chain:**

```text
harvest-manifest-v1.json
  -> sync-derived
     -> compact packet records
     -> packet-index.json
     -> receipt.json
     -> HARVEST_SUMMARY.md
     -> coverage.json
     -> prompt-harvest review
     -> graph extraction build/validate
     -> packet-registry refresh
     -> optional Z: mirror
  -> reconcile registry boundary
  -> optional expand-intelligence
  -> merge intelligence index
  -> generate retrieval artifacts
  -> render harvest index
  -> validate harvest
```

Important harvest libraries under `scripts/harvest/lib/` cover:

- canonical JSON / hashing
- publication identity
- publication locks / transaction / hardening
- git retention
- content freshness
- layered operational verdict / required-layer policy
- knowledge quality
- duplication preflight
- prompt extraction / candidate triage
- graph extraction / repo resolution
- L-durable bundle publication
- Z mirror and Z authority guard
- optional Supabase projection
- ChatGPT draft collection / staging / publication
- Gold Mine / protocol self-learning / WaveRunner self-improvement exports

Important schemas under `scripts/harvest/schema/` include:

- `harvest-manifest-v1.schema.json`
- `harvest-intelligence-index-v1.schema.json`
- `harvest-durable-payload-inventory-v1.schema.json`
- `harvest-publication-identity-v1.schema.json`
- `harvest-publication-lock-v1.schema.json`
- `harvest-layered-operational-receipt-v1.schema.json`
- harvest knowledge-quality evidence / receipt schemas
- `harvest-seed-packet-v1.schema.json`
- `thread-autopsy-bundle-v1.schema.json`
- Gold Mine evidence projection schemas
- `prompt-candidate-v1.schema.json`

**Do not confuse:**

- generated harvest views with the canonical manifest;
- `HARVEST_AUTHORITY` with `DERIVED_INTELLIGENCE`;
- harvest evidence collection with the operational-intelligence semantic engine.

---

### 4.3 Operational intelligence subsystem

**Ownership contract:** `contracts/intelligence/OWNERSHIP.md`.

- Cross-Agent → `INTELLIGENCE_OWNER`
- CG-AppBuilder-MCP → `EVIDENCE_PRODUCER`
- Intelligence Hub → retrieval plane only
- WaveRunner / Git → progression authority

**Architecture authority:** `work-progress/projects/operational-intelligence-envelope-v1.md`.

**Producer handoff:** `contracts/intelligence/intelligence-handoff-v1.schema.json`.

Expected concept:

```text
producer closeout
  + closeoutRef
  + closeoutHash
  + workPackageId
  + authorityFingerprint
  + producer identity
  -> Cross-Agent ingest
```

Producer must **not** send pre-derived ledger rows, derived objects, or Hub payloads.

**Main entry points:**

```bash
npm run intelligence:ingest -- --handoff=<path> --dry-run --json
npm run intelligence:ingest -- --handoff=<path> --shared-dev-hub --json
```

CLI: `scripts/intelligence/ingest.mjs`  
Pipeline: `scripts/intelligence/lib/ingest-pipeline-v1.mjs`

**Ingest chain:**

```text
intelligence-handoff-v1
  -> validate handoff schema
  -> reject producer-derived payloads
  -> resolve producer closeout
  -> independently verify closeout hash
  -> validate correlation markers for material missions
  -> verify authority fingerprint
  -> classify evidence reality
  -> infer measurement quality
  -> project mission ledger
  -> build deterministic derived objects
  -> validate envelope authority invariants
  -> build + validate relationship edges
  -> enforce graph dividend when required
  -> compile Hub compact payload
  -> prove raw closeout body was not copied
  -> reconstruct provenance
  -> optional shared-dev Hub publication/readback
  -> write ingest receipt/proof artifacts
```

**Derived-intelligence invariants:**

- `authorityClass = DERIVED_INTELLIGENCE`
- `progressionAuthority = false`
- `rawTelemetryDuplicated = false`
- reconstructable provenance
- deterministic identity/content hash
- lifecycle / evidence / confidence / derivation fields preserved
- high-resolution `measurementQuality`
- orthogonal `evidenceReality = REAL | FIXTURE | SYNTHETIC`

Raw closeouts remain evidence authority. Mission ledger is a projection, not a second closeout.

**Dry-run persistence:**

```text
artifacts/agent-runs/operational-intelligence-envelope-v1/intelligence-dry-run/by-ledger/<ledgerId>/
```

Typical outputs:

- `mission-ledger.json`
- `derived-objects/*.json`
- `relationships.json`
- `hub-compact.json`
- `provenance.json`
- `ingest-receipt-v1.json`

Shared-dev mode can publish to `intelligence_hub.knowledge_objects` and `intelligence_hub.relationships` with body-hash readback. Production Hub publication was outside the original first-real-mission scope.

Related contracts:

- `operational-intelligence-envelope-v1.schema.json`
- `unified-mission-receipt-v1.schema.json`
- `correlation-markers-v1.schema.json`
- `waverunner-preflight-consumption-contract-v1.md`
- intelligence registries / fixtures

---

### 4.4 Query routing and registry authority

**Query-routing authority:**

```text
registry/query-routing/query-routing-manifest.v1.json
```

Validator:

```bash
npm run validate:query-routing
```

The manifest routes query classes including:

- repository health
- authority placement / ownership conflict
- closeout / deploy gates
- MCP preflight
- harvest state
- suite status
- closeout history
- machine capability
- workflow estate
- safe commands
- application identity
- project document location
- database/table ownership
- contract identity
- overall preflight
- publication
- mission intelligence

Fallback routes to `intelligence-hub-index` with `active-ledger` support.

**Dataset registry authority:**

```text
registry/datasets/hot-cache-dataset-registry.v1.json
```

This owns dataset IDs, freshness classes, TTL defaults, dependencies, miss policy, and manifest paths. Important datasets include:

- `active-ledger`
- `all-systems-go`
- `application-estate`
- `authority-estate`
- `closeout-index`
- `command-estate`
- `database-estate`
- `deployment-estate`
- `document-estate`
- `failure-intelligence`
- `git-estate`
- `infrastructure-estate`
- `intelligence-hub-index`
- `project-estate`
- `schema-contract-estate`
- `storage-estate`
- `workflow-estate`
- `receipt-registry`
- `intelligence-hub-domains`
- `execution-packets`
- `prompt-catalog`
- `mission-intelligence`

`authority-estate` and `git-estate` are explicitly `missOk: false`; most other datasets can miss safely and fall through according to routing/preflight behavior.

Registry families under `registry/` include active-ledger, architecture, authority-estate, closeout-index, command-estate, datasets, execution-packets, git-estate, identity, intelligence-hub-domains, mission-intelligence, prompt-catalog, query-routing, receipt-registry, and workflow-estate.

---

### 4.5 Index publication subsystem

**Purpose:** publish Cross-Agent state into Intelligence Hub / cache planes with source-SHA binding, no-op identity checks, and fail-closed publication behavior.

**Main entry point:**

```bash
npm run index:publish
```

Implementation: `scripts/index/run-index-publisher.mjs`.

**Publication chain:**

```text
pin Cross-Agent Git SHA
  -> compute publication content identity
  -> exact prior publication current? NOOP_CURRENT
  -> prove L: master-index mount
  -> AppBuilder cross-agent-ledger ingest
  -> Data-Extraction active-work-ledger publication
  -> AppBuilder-backed Z: AI-cache publication
  -> Cross-Agent freshness gate
  -> emit PUBLISH_PASS receipt
  -> verify L: sourceCommitSha alignment
```

Missing L: or downstream gate failure produces `PUBLICATION_HOLD`.

**GitHub Actions:** `.github/workflows/index-publication.yml` runs on `main` changes under `work-progress/**`, `handoffs/**`, or `registry/**`, plus manual dispatch. It runs on self-hosted RYZEN9DESK WSL2, pins the checkout SHA, probes L:, runs the publisher, verifies SHA alignment, and uploads the publication receipt.

**Boundary:** Cross-Agent owns publication coordination/source state. It deliberately calls AppBuilder and Data-Extraction as workers for capabilities those repos own. Do not duplicate those implementations into Cross-Agent merely to remove the dependency.

---

### 4.6 Experience contracts

`contracts/experience/` defines durable machine semantics for experience/business-observation intelligence, including:

- business outcome vocabulary
- business workflow observation
- commercial glazing scope vocabulary
- economic impact
- experience episode
- experience observation
- experience pattern
- experience relationship
- harvest adapter

Treat this directory as **contract/semantic authority within its declared scope**, not proof that Cross-Agent executes every producer or consumer workflow.

---

### 4.7 Estimating contracts

`contracts/estimating/` currently includes:

- `enriched-glazing-scope-object-v1.json`
- `human-review-packet-v1.json`

These are cross-repo estimating evidence/review contracts. Estimating product implementation remains in its owner repos.

---

### 4.8 Master Graph coordination

Entry point:

```bash
npm run master-graph:publish-hub
```

Implementation: `scripts/master-graph/run-hub-publication.mjs`.

Cross-Agent resolves `CG-MASTER-GRAPH` and runs in that repo:

```text
npm run validate
npm run graph:publish
npm run graph:publish:suite
```

Cross-Agent is therefore an orchestration front door here; **CG-MASTER-GRAPH remains the graph implementation/validation owner**.

---

### 4.9 Runner / host support

`scripts/runner/` contains WESLEYDESK WSL runner/bootstrap/network/autostart/preflight support. This is a host-support surface, not the estate-wide machine-execution authority model.

Representative files:

- `configure-wesleydesk-wsl-network.sh`
- `ensure-wesleydesk-runner-wsl.sh`
- `install-wesleydesk-github-runner-wsl-service.sh`
- `install-wesleydesk-runner-autostart.ps1`
- `wesleydesk-index-publication-preflight.mjs`
- `wesleydesk.machine.json`

Before extending these, check the current machine registry and managed-executor authority in owner control-plane repos.

---

## 5. Cross-repository dependency map

| Dependency | Direction | Why Cross-Agent needs it | Boundary |
| --- | --- | --- | --- |
| `CG-Platform-Governance-MCP` | external authority | constitutional protocol/capture/closeout rules | Governance outranks Cross-Agent coordination prose |
| `CG-AppBuilder-MCP` | producer + worker | closeout evidence, intelligence handoff, ledger ingest, cache/publication primitives | AppBuilder does work; does not own Cross-Agent derived-intelligence semantics |
| `Data-Extraction` | worker / publisher | active-work ledger / research-library publication | processing/publication implementation stays there |
| `Scraper` | upstream capture | raw source/research capture | raw capture owner; Cross-Agent stores context/pointers |
| Intelligence Hub (L:/Supabase) | retrieval/storage | master index, BY-KIND, derived-intelligence readback | retrieval plane; never progression authority |
| Z: AI Cache Authority | cache plane | fast agent cache publication/retrieval | cache cannot override fresher Git authority |
| WaveRunner / Git | progression | controls execution progression | derived intelligence cannot advance work by itself |
| `CG-MASTER-GRAPH` | graph owner | validates/publishes suite graph | Cross-Agent coordinates only |
| Computer Estimator / Bid Composer / other producers | evidence producers | may emit Cross-Agent-owned intelligence handoff | producers do not become intelligence-model owners |

---

## 6. Persistence and authority matrix

| Surface | Contents | Authoritative for | Not authoritative for |
| --- | --- | --- | --- |
| `work-progress/ACTIVE_WORK.md` | human active-work ledger | editable coordination state | product implementation truth by itself |
| `decisions/` | durable decisions | Cross-Agent decisions until superseded | newer explicit subsystem architecture when older |
| `artifacts/agent-runs/<harvestId>/harvest-manifest-v1.json` | harvest run authority | per-harvest machine facts | operational-intelligence semantics |
| harvest generated JSON/MD | projections/receipts/coverage | proof bound to manifest | independent authority over manifest |
| `contracts/intelligence/` | intelligence schemas/ownership | derived-intelligence semantics | progression control |
| intelligence dry-run artifacts | deterministic projection evidence | ingest-output proof | source closeout truth |
| Supabase `intelligence_hub` | derived-intelligence store/readback | stored projection | mission progression authority |
| L: Intelligence Hub | master-index/BY-KIND retrieval | published retrieval snapshot when fresh | override of newer Git state |
| Z: AI Cache Authority | hot cache | canonical cache release under cache contract | code/protocol authority |
| `registry/**` | routing/dataset/estate manifests | declared registry domain | owner-repo implementation beyond registry claims |

---

## 7. Tests, provers, and CI

### Full architecture matrix

Preferred deep reconciliation suite:

```bash
npm run test:cross-agent-architecture
```

`scripts/tests/run-cross-agent-architecture-matrix.test.mjs` aggregates 16 suites:

1. HARVEST_CORE
2. GIT_RETENTION
3. RISK_REMEDIATION
4. PUBLICATION_HARDENING
5. LAYERED_VERDICT
6. CONTENT_FRESHNESS
7. IDENTITY
8. HOT_CACHE
9. QUERY_ROUTING
10. PROTOCOL_SELF_LEARNING
11. EXPERIENCE_GRAPH
12. INTELLIGENCE_CONTRACTS
13. INTELLIGENCE_INGEST
14. INTELLIGENCE_FIRST_REAL_MISSION
15. INTELLIGENCE_VERIFICATION
16. PHASE_B

### GitHub CI enforcement is narrower

Current workflows include:

- `.github/workflows/harvest-risk-gates.yml`
- `.github/workflows/index-publication.yml`
- `.github/workflows/chatgpt-harvest-move-to-l.yml`
- `.github/workflows/runner-smoke.yml`

`harvest-risk-gates.yml` runs harvest risk-remediation and git-retention suites for matching paths. It does **not** invoke the full 16-suite architecture matrix.

`index-publication.yml` is an operational publication workflow, not a general code-test workflow.

### Hardening caveat

`docs/HARDENING.md` explicitly says `NOT_YET_VERIFIED` and is bound to an older commit. Its zeros mean unmeasured, not clean. Never cite it as proof of current health without a fresh hardening run.

---

## 8. Architecture disposition / historical drift

`registry/architecture/cross-agent-architecture-pr-disposition-registry.v1.json` is the machine-readable reconciliation record for older architecture PRs. It marks prior harvest-risk work as migrated, present-stronger, equivalent, obsolete, or evidence-only rather than blindly merging old branches.

Important consequences:

- Current `main` is the operating architecture, not old conflicting PR branches.
- Old publication/graph models may be explicitly obsolete.
- A historical design may still be useful evidence without being current authority.
- New work should implement required invariants on current architecture, not resurrect superseded seams.

---

## 9. Critical invariants for agents

1. **Do not collapse authority layers.** Coordination, evidence authority, derived intelligence, retrieval storage, and progression control are different.
2. **Do not move derived-intelligence semantics into AppBuilder.** AppBuilder emits evidence handoffs; Cross-Agent derives intelligence.
3. **Do not let derived intelligence claim progression authority.** `progressionAuthority` remains false.
4. **Do not duplicate raw closeouts into derived ledger/Hub compact objects.** Preserve provenance instead.
5. **Do not hand-edit generated harvest projections as canonical.** Change the manifest/source and regenerate.
6. **Do not treat stale cache/L: snapshots as newer than Git.** Source SHA and freshness matter.
7. **Do not infer current authority from filenames alone.** `CURRENT_*` can be stale.
8. **Do not extend an old conflicting PR branch as architecture.** Check the architecture disposition registry and current `main`.
9. **Do not make Cross-Agent a product repo.** Product UI/domain implementation stays with the product owner.
10. **Do not publish operational derived intelligence through the harvest `HARVEST_AUTHORITY` semantic path.** Harvest and intelligence are sibling systems with different meaning.
11. **Do not let Intelligence Hub or cache become execution/progression authority.** They are retrieval/storage planes.
12. **Do not copy worker implementations from AppBuilder/Data-Extraction/Master Graph merely because Cross-Agent orchestrates them.** Preserve single-owner boundaries.

---

## 10. Known drift / debt found by this indexing pass

### A. Onboarding charter drift — material

`README.md`, `AGENT_START_HERE.md`, `WORKSPACE_CONTEXT.md`, and `REPOSITORY_ROLES.md` still describe Cross-Agent as essentially coordination-only / no scripts. Current `main` contains substantial, explicitly locked intelligence ownership and executable harvest/index tooling.

**Classification:** documentation drift, not evidence that the newer subsystem is unauthorized.

**Recommended fix:** a separate governance/documentation reconciliation mission should update the onboarding charter without weakening the product-implementation placement rule.

### B. “Current” documents have mixed freshness

`ACTIVE_WORK.md` is current through 2026-09-04; `handoffs/CURRENT_HANDOFF.md` was last reconciled 2026-08-25; `verification/CURRENT_GATES.md` contains an older 2026-08-02 known issue.

**Risk:** agents can privilege a stale `CURRENT_*` file over newer ledger truth.

**Recommended fix:** add explicit `sourceCommitSha` / `freshThrough` metadata and a deterministic stale-current-doc check.

### C. Full architecture matrix is not fully enforced in CI

A 16-suite architecture matrix exists, but GitHub CI currently runs narrower path-specific gates.

**Risk:** some architecture regressions can remain locally detectable but not mandatory on every relevant PR.

**Recommended fix:** decide whether the matrix (or a dependency-aware subset) should become a required CI gate; do not assume this index grants that policy change.

### D. Hardening baseline is explicitly unverified

`docs/HARDENING.md` is not current measured proof.

**Recommended fix:** run a fresh hardening mission and bind evidence to current SHA before making health claims.

### E. Host scripts can outlive machine-control architecture

`scripts/runner/` contains concrete WESLEYDESK bootstrap/network scripts while machine authority has evolved elsewhere.

**Risk:** agents may treat local host scripts as machine-registry authority.

**Recommended fix:** index them as support adapters and require current machine-registry resolution before mutation.

---

## 11. High-value navigation targets

| Question | Read first |
| --- | --- |
| What is active right now? | `work-progress/ACTIVE_WORK.md` |
| Who owns execution vs governance? | `work-progress/WORKSPACE_CONTEXT.md`, then current owner-repo contracts |
| Who owns operational intelligence? | `contracts/intelligence/OWNERSHIP.md` |
| What is the locked intelligence flow? | `work-progress/projects/operational-intelligence-envelope-v1.md` |
| How is a harvest recorded? | `scripts/harvest/record-harvest.mjs` |
| What is canonical in a harvest? | `harvest-manifest-v1.json` for that run |
| How is intelligence ingested? | `scripts/intelligence/lib/ingest-pipeline-v1.mjs` |
| How are queries routed? | `registry/query-routing/query-routing-manifest.v1.json` |
| What datasets exist / how fresh? | `registry/datasets/hot-cache-dataset-registry.v1.json` |
| How is the index published? | `scripts/index/run-index-publisher.mjs` |
| What proves publication automation? | `.github/workflows/index-publication.yml` |
| What historical architecture was superseded? | `registry/architecture/cross-agent-architecture-pr-disposition-registry.v1.json` |
| What durable decisions exist? | `decisions/DECISION_LOG.md` |
| What is the latest continuation handoff? | `handoffs/CURRENT_HANDOFF.md` after checking freshness |
| What are the available test surfaces? | `package.json`, `scripts/tests/run-cross-agent-architecture-matrix.test.mjs` |

---

## 12. Search vocabulary

Useful search terms for this repo:

```text
ACTIVE_WORK
harvest-manifest-v1
harvest:record
HARVEST_AUTHORITY
DERIVED_INTELLIGENCE
INTELLIGENCE_OWNER
EVIDENCE_PRODUCER
intelligence-handoff-v1
operational-intelligence-envelope-v1
mission ledger
relationship graph
graph dividend
provenance
query-routing-manifest
hot-cache-dataset-registry
mission-intelligence
index publication
PUBLICATION_HOLD
PUBLISH_PASS
sourceCommitSha
body_hash
Gold Mine
protocol self-learning
Experience Graph
architecture disposition
```

---

## 13. Modification routing

Before changing this repo, classify the intended change:

```text
human coordination / project record
  -> work-progress / decisions / handoffs

harvest evidence collection or harvest publication
  -> scripts/harvest + harvest contracts/tests

post-closeout derived intelligence semantics
  -> contracts/intelligence + scripts/intelligence

query/dataset routing
  -> registry/query-routing or registry/datasets + validators

Cross-Agent index publication orchestration
  -> scripts/index + publication workflow

product implementation
  -> STOP: route to product owner repo

governance / progression semantics
  -> STOP: route to Governance / WaveRunner owner

CG Master Graph implementation
  -> STOP: route to CG-MASTER-GRAPH
```

---

## 14. Index acceptance status

This deep index is **source-complete enough to guide agent investigation and modification routing**, but it does **not** claim runtime PASS because this indexing session did not execute the repository’s test/prover commands on a checked-out host.

Current index verdict:

```text
CROSS_AGENT_DEEP_INDEX_SOURCE_RECONCILIATION_PASS
RUNTIME_PROVER_STATUS = NOT_RUN_BY_THIS_INDEXING_PASS
DOCUMENTATION_DRIFT_FOUND = YES
AUTHORITY_CONTRADICTION_RESOLVED = YES
```

A future runtime closeout should run the appropriate architecture matrix, verify the index against the then-current Git SHA, and refresh `repo-index.v1.json` / this file if source has moved materially.
