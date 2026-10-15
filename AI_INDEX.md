# CapitalGlass-Cross-Agent — Deep AI Index

**Index:** `cross-agent-deep-ai-index-v1@1.1.0`  
**Source snapshot:** `main` @ `b95828a632b954de5045d1fb691b70f43056d77e` (2026-09-04)  
**Companion:** `repo-index.v1.json`  
**Indexing mode:** deep semantic source reconciliation + mechanical verification  
**Verification:** source-verified and mechanically verified; runtime gates were not executed by this indexing pass

> This file is a navigation and authority map. It does not replace contracts, manifests, closeouts, registries, receipts, or owner-repo evidence. A newer explicit architecture lock outranks this index and requires the index to be refreshed.

**v1.1.0 adds:** repository scale metrics, a deeply expanded operational-intelligence section (§5), the federated repo index subsystem (§9), entry-command runtime prerequisites (§11), a known-dead-ends register (§13), seven additional drift findings from a mechanical pass (§15), and a reusable mechanical-verification recipe (§16).

---

## 1. Repository identity

`CapitalGlass-Cross-Agent` began as the shared human/agent coordination repository, but current `main` has evolved beyond the older "meeting repo only" description.

At this snapshot it has five material roles:

1. **Human coordination authority** — active work, durable decisions, handoffs, project records, verification pointers.
2. **Harvest authority tooling** — deterministic harvest manifests, derived packet views, retention/freshness/quality gates, ChatGPT harvest, protocol self-learning, Gold Mine support.
3. **Operational intelligence owner** — post-closeout handoff validation, mission-ledger projection, derived intelligence objects, relationship graph, Hub compact compilation/publication semantics, provenance reconstruction.
4. **Estate retrieval / routing registry owner** — query routing, dataset registry, authority/command/workflow/closeout/mission-intelligence registry surfaces.
5. **Cross-system publication coordinator** — pinned-SHA publication to Intelligence Hub / AI-cache planes, federated repo-index publication, and orchestration of CG Master Graph publication.

It is **not** the universal implementation owner. Product implementation remains in product repos; governance and progression authority remain external where explicitly assigned.

---

## 2. Repository scale and shape

Orient with these numbers before scanning. **Do not `ls -R`, `grep -r`, or fan out explore agents across this repo** — `artifacts/` alone is two-thirds of it and is machine-generated.

| Surface | Tracked files | Character |
| --- | --- | --- |
| `artifacts/` | 1258 | **68% of the repo.** Machine-generated harvest/intelligence output. Read one run dir, never the tree. |
| `scripts/` | 282 | Executable subsystem. 104 npm scripts, 41 of them `test:*`. |
| `work-progress/` | 168 | Human ledger + compiled JSON indices + Hub slices. |
| `contracts/` | 37 | Schemas, registries, fixtures. Small and load-bearing — read fully. |
| `registry/` | 22 | Routing/dataset/estate manifests. Small and load-bearing — read fully. |
| `harvest/` | 17 | Protocol documents mirrored to `Z:`. |
| `docs/` | 13 | Protocols, runbooks, master-graph plans. |
| `plans/` | 13 | Pre-implementation plans. |
| `archive/`, `agent-notes-seeding/` | 7 each | Historical snapshots; note-seed promotion pipeline. |
| `verification/`, `handoffs/`, `runbooks/`, `index/` | 2–4 each | Small pointer surfaces. |
| `decisions/`, `repo-map/` | 2 each | Durable, rarely changed, high authority per byte. |
| `inbox/`, `chatgpt-reviews/`, `cursor-reports/` | 1 each | **README stub only — dead surfaces.** See §13. |
| **Total tracked** | **1861** | |

`.gitignore` is minimal (`.DS_Store`, `Thumbs.db`, `*.env`, `node_modules/`). Everything above — including generated JSON — is fully git-tracked. The generated targets that live *outside* git are the external mounts (`Z:`, `L:`) and Supabase.

**Node/tooling:** `"type": "module"`, no `engines` field (CI pins Node 22 via `actions/setup-node`). `devDependencies` are only `ajv` + `ajv-formats`. There is **no test framework** — every test is a self-contained `.mjs` run directly by `node`, exiting non-zero on failure.

---

## 3. Authority hierarchy

### 3.1 Controlling authority by concern

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
| Federated repo-index estate routing | `CG-AppBuilder-MCP/registry/federated-repo-index/` | publication authority only; AppBuilder is compiler authority |
| Retrieval storage | Intelligence Hub / L: / Supabase / Z: under their own contracts | retrieval/publication plane, not progression authority |
| CG Master Graph truth | `CG-MASTER-GRAPH` | Cross-Agent coordinates validate/publish only |

### 3.2 Supersession: stale "meeting repo only" guidance

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

Do not "repair" this distinction by moving derived-intelligence semantics into AppBuilder or by turning Cross-Agent intelligence into progression authority.

---

## 4. Agent read order

Use this order, with freshness awareness:

1. `AI_INDEX.md` (this file) and `repo-index.v1.json`
2. `work-progress/ACTIVE_WORK.md`
3. `registry/query-routing/query-routing-manifest.v1.json`
4. `registry/datasets/hot-cache-dataset-registry.v1.json`
5. Task-specific authority:
   - Harvest → `scripts/harvest/` + relevant harvest schema/project contract
   - Intelligence → `contracts/intelligence/OWNERSHIP.md`, `work-progress/projects/operational-intelligence-envelope-v1.md`, `scripts/intelligence/` (**see §5 — the largest subsystem by semantic density**)
   - Index publication → `scripts/index/`, `.github/workflows/index-publication.yml`
   - Federated repo index → `index/`, `work-progress/projects/2026-08-12_cg-federated-repo-index-v1.md`
   - Experience semantics → `contracts/experience/`
   - Estimating contracts → `contracts/estimating/`
6. `decisions/DECISION_LOG.md`
7. `handoffs/CURRENT_HANDOFF.md` — verify date/commit anchor first
8. `work-progress/projects/INDEX.md` and the specific project file
9. Older onboarding docs for historical placement intent only

### Freshness rule

A filename containing `CURRENT` is not sufficient proof of freshness. Compare declared date / commit anchor against Git `HEAD`, `ACTIVE_WORK.md`, and newer explicit architecture plans. See §15-B and §15-J for the two live instances of this hazard.

---

## 5. Operational intelligence subsystem (deep)

This is the semantically densest subsystem in the repo: **36 files** (6 entry scripts + 29 libs under `scripts/intelligence/`, 4,243 lines) plus **24 contract files** under `contracts/intelligence/`. It is what makes Cross-Agent the `INTELLIGENCE_OWNER` rather than a coordination repo.

### 5.1 Ownership and the locked boundary

`contracts/intelligence/OWNERSHIP.md` — status `ARCHITECTURE_LOCKED`:

| System | Role | May own |
| --- | --- | --- |
| **CapitalGlass-Cross-Agent** | `INTELLIGENCE_OWNER` | Handoff consumer contract, envelope schema, mission-ledger projection, derived objects, relationship graph, Hub compact compilation, shared-dev Hub publication semantics, provenance reconstruction |
| **CG-AppBuilder-MCP** | `EVIDENCE_PRODUCER` | Ordinary closeout, `intelligence-handoff-v1` emit **only** |
| **Intelligence Hub** | retrieval plane | Store/index `DERIVED_INTELLIGENCE` — never progression authority |
| **WaveRunner / Git** | progression authority | Execution control only |

Explicitly **forbidden** by the ownership contract:

- AppBuilder growing envelope builders, ledger projectors, Hub compact compilers, or `DERIVED_INTELLIGENCE` semantics
- Producer handoffs that include derived objects, ledger rows, or Hub payloads
- Registering `COMPOUNDING_INTELLIGENCE_PIPELINE` as an AppBuilder-implemented capability
- Collapsing `measurement.measurementQuality` into coarse observed/inferred buckets
- Using the `HARVEST_AUTHORITY` publication path for derived operational intelligence

Downstream capability metadata: AppBuilder capability `INTELLIGENCE_HANDOFF` → downstream pipeline owner CapitalGlass-Cross-Agent → downstream capability `COMPOUNDING_INTELLIGENCE_PIPELINE`. Edits to these contracts require an explicit **superseding plan**.

### 5.2 Schema constants (single source: `scripts/intelligence/lib/constants.mjs`)

```text
DERIVATION_VERSION            = operational-intelligence-v1@1.0.0
MISSION_LEDGER_SCHEMA         = operational-mission-ledger-v1@1.0.0
ENVELOPE_SCHEMA               = operational-intelligence-envelope-v1@1.0.0
HANDOFF_SCHEMA                = intelligence-handoff-v1@1.0.0
HUB_COMPACT_SCHEMA            = operational-intelligence-hub-compact-v1@1.0.0
INGEST_RECEIPT_SCHEMA         = operational-intelligence-ingest-receipt-v1@1.0.0
AUTHORITY_FINGERPRINT_VERSION = intelligence-authority-fingerprint-v1@1.0.0
```

`DERIVATION_VERSION` participates in **every** id hash. Changing it changes every `ledgerId`, `objectId`, and `relationshipId` in the graph — treat it as a graph-wide migration, not a version bump.

### 5.3 The ingest pipeline — exact stages

Implementation: `scripts/intelligence/lib/ingest-pipeline-v1.mjs` → `runIntelligenceIngest()` (349 lines). CLI: `scripts/intelligence/ingest.mjs`.

Every stage pushes a named step onto the receipt's `steps[]`. Stage names are stable identifiers — quote them exactly when reporting a failure:

| # | Step name | Fails with (stage → code) |
| --- | --- | --- |
| 1 | `validate_handoff_schema` | `HANDOFF_VALIDATION` → `HANDOFF_SCHEMA_INVALID` |
| 2 | `reject_producer_derived_objects` | `HANDOFF_VALIDATION` → `PRODUCER_DERIVED_OBJECTS_FORBIDDEN` |
| 3 | `resolve_closeout` | `CLOSEOUT_RESOLVE` → `CLOSEOUT_NOT_FOUND` |
| 4 | `verify_closeout_hash` | `CLOSEOUT_HASH_VERIFICATION` → `CLOSEOUT_HASH_MISMATCH` |
| 5 | `validate_correlation_markers` *(conditional)* | `CORRELATION_VALIDATION` → `CORRELATION_MARKERS_INVALID` |
| 6 | `verify_authority_fingerprint` | `AUTHORITY_FINGERPRINT` → `AUTHORITY_FINGERPRINT_MISMATCH` |
| 7 | `classify_evidence_reality` | *(never fails; classifies)* |
| 8 | `project_mission_ledger` | *(throws `LEDGER_PROJECTION` → `RAW_CLOSEOUT_COPIED` at the later guard)* |
| 9 | `build_derived_objects` | `DERIVED_OBJECT_BUILD` → `ENVELOPE_SCHEMA_INVALID` \| `PROGRESSION_AUTHORITY_FORBIDDEN` \| `SOURCE_AUTHORITY_INVALID` \| `RAW_TELEMETRY_DUPLICATED` |
| 10 | `validate_relationship_types` | `RELATIONSHIP_VALIDATION` → `RELATIONSHIP_TYPE_NOT_REGISTERED` |
| 11 | `build_relationship_edges` | `GRAPH_DIVIDEND` → `GRAPH_DIVIDEND_GATE_FAILED` |
| 12 | `compile_hub_compact` | `HUB_COMPACT_COMPILE` → `RAW_CLOSEOUT_COPIED` |
| 13 | `reconstruct_provenance` | `PROVENANCE_RECONSTRUCTION` → `PROVENANCE_BROKEN` |
| 14 | *(shared-dev-hub mode only)* Hub publish + body-hash readback | verdict from `hubPublication` |

Step 5 runs **only** when `handoff.mission.material === true` **and** `closeout.correlation` is present. A material mission with no correlation block silently skips correlation validation — absence is not a failure, so do not read a passing receipt as proof correlation was checked.

Between steps 12 and 13, `assertNoRawCloseoutCopy()` string-searches the serialized ledger and Hub compact for the **entire** closeout body. This is a containment check, not a similarity check: paraphrased or partially-copied closeout content passes.

### 5.4 Evidence reality and measurement quality

`scripts/intelligence/lib/evidence-classifier.mjs` — orthogonal axes, both carried on every derived object.

`evidenceReality` ∈ `REAL | FIXTURE | SYNTHETIC`, decided by:

- `SYNTHETIC` — `closeout.synthetic === true` or `closeout.evidenceClass === 'SYNTHETIC'`
- `FIXTURE` — any of: `mission.material !== true`; `workPackageId` matching `/(fixture|fixtures|smoke|proof-wave|ephemeral|contract-fixture)/`; a `proof-wave` marker in `workPackageId` or `cheapestRedo`; a closeout `task` containing "proof wave"
- `REAL` — none of the above

`firstRealMissionEligible = (evidenceReality === 'REAL' && mission.material === true)`.

**Trap:** a work-package id containing the substring `smoke` or `ephemeral` is classified `FIXTURE` regardless of how real the mission was. Name real work packages accordingly.

`measurementQuality` (only meaningful when `REAL`; otherwise `INFERRED`), in precedence order:

```text
CACHE_VERIFIED     <- closeout.aiCacheHit === true
PROVIDER_VERIFIED  <- closeout.providerTokenPairing.receiptSha256 present
ESTIMATED          <- closeout.quality === 'ESTIMATE_ONLY'
DIRECT_MEASURED    <- default for REAL evidence
```

The ownership contract explicitly forbids collapsing these into coarse observed/inferred buckets.

### 5.5 Derived object kinds

Two families, 17 kinds total. `scripts/intelligence/lib/derived-object-builder-v1.mjs`.

**Operational (2)** — always built: `MISSION_MEASUREMENT`, `RECEIPT_LEVERAGE_SIGNAL`.

**Semantic (15)** — `SEMANTIC_KINDS` in `scripts/intelligence/lib/semantic-classifier-v1.mjs`, built only from classified closeout candidates:

```text
VERIFIED_TRUTH   DECISION       RESULT           FAILURE        ROOT_CAUSE
REMEDIATION      CORRECTION     SUCCESS_PATTERN  FASTER_PATH    REPEATED_WORK
BLOCKER          RISK           PROTOCOL_IMPROVEMENT
CAPABILITY_SIGNAL               FUTURE_OPPORTUNITY
```

Every derived object is schema-validated against `operational-intelligence-envelope-v1.schema.json` and then re-checked imperatively for three invariants the schema also pins as `const`: `authorityClass === 'DERIVED_INTELLIGENCE'`, `progressionAuthority === false`, `rawTelemetryDuplicated === false`. Belt-and-braces by design — do not remove either layer.

### 5.6 Deterministic identity

`scripts/intelligence/lib/ids.mjs`. All ids are content-addressed via `hashCanonicalJson` (shared with harvest: `scripts/harvest/lib/hash.mjs`).

```text
ledgerId       = oi:ledger:<24 hex>       <- hash(closeoutHash : DERIVATION_VERSION)
objectId       = oi:<kind>:<16 hex>       <- hash(ledgerId : kind : closeoutHash : DERIVATION_VERSION)
semantic objId = oi:<kind>:<16 hex>       <- adds conceptKey to the hash input
workpackage    = oi:workpackage:<16 hex>  <- hash(workpackage : id : DERIVATION_VERSION)
relationshipId = oi:rel:<16 hex>          <- hash(from : to : relationship : DERIVATION_VERSION)
contentHash    = sha256:<hash of envelope with identity.contentHash set to 'sha256:pending'>
```

Re-ingesting the same closeout yields byte-identical ids — that is the intended idempotency mechanism. Note the receipt reports `IDEMPOTENT_REINGEST_PASS: null` (see §5.11).

### 5.7 The relationship graph

Edge vocabulary is a closed, enforced registry: `contracts/intelligence/registries/knowledge-relationship-types-v1.json` — **18 ACTIVE types**. Enforced by `schema-validate.mjs#validateRelationshipEdges`, called immediately after `buildRelationshipEdges()`; an unregistered or non-ACTIVE type hard-fails ingest with `RELATIONSHIP_TYPE_NOT_REGISTERED`.

Registry policy is append-only: new types are additive and bump the minor version; **redefinition in place is forbidden** (changed meaning gets a new id, old id marked `DEPRECATED`); **removal is forbidden**.

| Emitter | Edges produced |
| --- | --- |
| `relationship-edge-builder-v1.mjs` | `PROJECTED_FROM`, `DERIVED_FROM`, `EVIDENCED_BY` |
| `semantic-relationship-builder-v1.mjs` | `OBSERVED_IN`, `PROVEN_BY`, `ABOUT`, `FAILED_BECAUSE_OF`, `CORRECTED_BY`, `REINFORCES`, `ENABLES`, `ENABLED_BY` |
| `identity-reconciliation-v1.mjs` | `SAME_AS`, `PROJECTS_TO` |
| *(registered, no emitter yet)* | `SUPPORTED_BY`, `REQUIRES_EVIDENCE`, `PREDICTS`, `SIMILAR_TO`, `PREVENTS` |

Three distinctions the registry itself calls out, worth repeating because they are easy to get wrong:

- `EVIDENCED_BY` (evidence that exists) vs `REQUIRES_EVIDENCE` (a gap). Never conflate a requirement with a satisfied requirement.
- `PREDICTS` carries an **edge-level confidence 0–1**. There is no `STRONGLY_PREDICTS` type and none should be added — encode strength as confidence, not as a second type name.
- `REINFORCES` (a pattern strengthening a capability) is **not** the receipt's `nodesReinforced` metric, which measures identity-reconciliation dedup (`reconciliation.duplicateNodesPrevented`).

`SUPPORTS` and `PREVENTED_BY` are declared as inverses but are explicitly **reserved and not yet emitted**.

**Identity reconciliation (W2):** `identity-reconciliation-v1.mjs` prevents duplicate concept nodes by emitting `SAME_AS` aliases and `PROJECTS_TO` edges onto a canonical `kce:unit:<conceptKey>` — deliberately **without ID migration**. Old ids stay valid and alias forward.

### 5.8 The graph dividend gate (W4)

`scripts/intelligence/lib/graph-dividend-gate-v1.mjs`. A **material** mission must produce graph value or ingest fails.

```text
required = handoff.mission.material === true
pass     = semanticObjects.length > 0
           AND attachment.orphans === 0
           AND attachment.attached === attachment.total
```

Milestones: `MATERIAL_WORK_INTELLIGENCE_DIVIDEND_ENFORCED_V1_PASS` / `..._V1_HOLD`, or `GRAPH_DIVIDEND_NOT_REQUIRED` for non-material missions. Blocker codes: `SEMANTIC_OBJECTS_MISSING`, `GRAPH_ATTACHMENT_INCOMPLETE`.

**Read `graph-delta-receipt-v1` with care.** `buildGraphDeltaReceipt()` computes some fields and hardcodes others. Currently **hardcoded, not measured**: `nodesCorrected: 0`, `nodesSuperseded: 0`, `utilizationEdgesCreated: 0`, `conflictsDetected: 0`, and the defaults `baselineNodes = 184`, `baselineEdges = 302`, `semanticPreservationRatio = 1`. A zero in those fields means *not computed*, not *none occurred*. Genuinely computed fields: `nodesCreated`, `semanticNodesCreated`, `edgesCreated`, `evidenceEdgesCreated` (`PROVEN_BY`/`EVIDENCED_BY`), `missionEdgesCreated` (`OBSERVED_IN`), `structuralEdgesCreated` (`PROJECTED_FROM`), `orphanNodesCreated`, `inferredRelationships`/`verifiedRelationships`, `duplicateNodesPrevented`.

### 5.9 Correlation markers

Contract `contracts/intelligence/correlation-markers-v1.schema.json`; implementation `scripts/intelligence/lib/correlation-markers-v1.mjs` (332 lines). Correlation ids are `corr:<32 hex>`; mission ids `mission:<workPackageId>`.

Closed vocabularies live in `contracts/intelligence/registries/`:

| Registry | Entries |
| --- | --- |
| `correlation-marker-types-v1.json` | 12 |
| `correlation-mechanisms-v1.json` | 10 |
| `correlation-subjects-v1.json` | 9 |
| `correlation-relationship-types-v1.json` | 7 |
| `correlation-systems-v1.json` | 4 |
| `correlation-effects-v1.json` | 3 |
| `correlation-problems-v1.json` | 3 |
| `correlation-capabilities-pointer-v1.json` | pointer only — resolves to `CG-AppBuilder-MCP/scripts/sdlc-protocol-cursor/waverunner-capability-registry-v1.json` rather than duplicating it |

**Known contract-vs-code trap (see §15-I):** the schema permits `markerBudget.max` anywhere in `1..64`, but `validateCorrelationBlock()` hard-fails unless it is **exactly 48** (`MARKER_BUDGET_MAX = 48`). A schema-valid handoff with `max: 64` is rejected at runtime. Producers must emit exactly 48.

Because the capabilities registry is a pointer into AppBuilder, `loadCorrelationRegistries()` calls `resolveAppBuilderRoot()` — correlation validation therefore has a **cross-repo filesystem dependency** on `CG-AppBuilder-MCP` being resolvable. See §11.

### 5.10 Hub compact, provenance, and the Hub write path

**Hub compact** (`hub-compact-compiler-v1.mjs`) is a deliberately lossy projection: per object it carries only `objectId`, `kind`, `contentHash`, `evidenceReality`, `measurementQuality`, `correlation`, and provenance triplet (`sourceRepo`, `sourceSha`, `indexedSha`) plus `publishedAt`; per edge only `relationshipId`, `from`, `to`, `relationship`. It pins `progressionAuthority: false` and `writes: { lDrive: false, zDrive: false, supabase: 'SHARED_DEV_HUB_TARGET' | false }`.

**Provenance** (`provenance-reconstruct-v1.mjs`) rebuilds a 4-step chain per object and requires all of it to line up:

```text
DERIVED_OBJECT   (objectId, contentHash)
  -> MISSION_LEDGER    (ledgerId, closeoutHash)
    -> CLOSEOUT_EVIDENCE (closeoutRef, closeoutHash, closeoutPath)
      -> SOURCE_COMMIT     (repo, commitSha)
```

`ok` requires the object's `CLOSEOUT` evidence hash to equal **both** `handoff.closeoutHash` and `ledger.closeoutHash`, the ledger edge to be `PROJECTED_FROM`, and the authority invariants to hold. Any mismatch → `PROVENANCE_BROKEN`.

**Supabase write path** (`supabase-intelligence-store-v1.mjs`, 251 lines): writes go to schema `intelligence_hub`, tables `knowledge_objects` and `relationships`, on the **MCP control-plane project**. Gated by `resolveSharedDevHubWriteEligibility()`. A memory store (`createMemoryIntelligenceHubStore()`) exists so the pipeline is unit-testable without credentials. Publication asserts a **body-hash readback match** rather than trusting the write.

### 5.11 The ingest receipt

Schema `operational-intelligence-ingest-receipt-v1@1.0.0`. Verdicts: `INGEST_DRY_RUN_PASS` (dry-run) or `INGEST_SHARED_DEV_STRUCTURAL_PASS` / the hub publication's own verdict (shared-dev-hub).

Read the `acceptance` block literally — three states, not two:

| Value | Meaning |
| --- | --- |
| `true` / `false` | Actually evaluated this run |
| `null` | **Not proven by this pipeline at all** |
| string (e.g. `WAITING_FOR_SHARED_DEV_HUB_READBACK`) | Deferred pending an external plane |

Currently **always `null`**: `IDEMPOTENT_REINGEST_PASS`, `LOCAL_RUNTIME_VALIDATED`. Currently `null` unless run in `shared-dev-hub` mode: `SHARED_DEV_KNOWLEDGE_OBJECT_WRITTEN`, `RELATIONSHIP_WRITTEN`, `HUB_BODY_HASH_READBACK_MATCH`, `RETRIEVAL_SUCCESSFUL`. `FIRST_REAL_MISSION_HUB_PROOF` reads `WAITING_FOR_REAL_MISSION` when evidence is not `REAL`.

**Do not cite a `INGEST_DRY_RUN_PASS` receipt as proof of idempotency or Hub durability.** It explicitly does not claim either.

### 5.12 Write scope

Both `dry-run` and `shared-dev-hub` modes write local artifacts (the code sets `dryRun = mode === 'dry-run' || mode === 'shared-dev-hub'`). Output root:

```text
artifacts/agent-runs/operational-intelligence-envelope-v1/intelligence-dry-run/by-ledger/<ledgerId>/
  mission-ledger.json
  derived-objects/<objectId>.json
  relationships.json
  hub-compact.json
  provenance.json
  ingest-receipt-v1.json
```

`writeScope` is reported as `LOCAL_ARTIFACTS_ONLY`. `receipt.writes` pins `lDrive: false`, `zDrive: false` in every mode — this pipeline **never** writes L: or Z:.

### 5.13 Retrieval preflight and the plane ladder

`scripts/intelligence/preflight.mjs` → `lib/preflight-v1.mjs` (277 lines). Its stated purpose: produce a receipt proving retrieval planes were probed, "instead of an agent self-reporting that it *checked the index*."

Ladder outcomes (`OUTCOME`):

```text
CACHE_HIT_FRESH
L_HUB_READ_OK
L_HUB_UNAVAILABLE_USING_SUPABASE
L_HUB_UNAVAILABLE_USING_GIT_LEDGER
ALL_HUB_PLANES_UNAVAILABLE
```

Planes probed in order: **hot AI cache** → **L: hub** (`/mnt/l/Capital-Glass-Intelligence-Hub/00-master-index`) → **Supabase** → **Git ledger mirror** (`work-progress/intelligence-hub-slices/`, "the only plane guaranteed reachable from any checkout"). Receipts land in `artifacts/agent-runs/intelligence-preflight-v1/`.

Hot cache (`hot-ai-cache-plane-v1.mjs`): bundle `00-master-index/BY-KIND/mission-intelligence.json`; statuses `CACHE_HIT_FRESH | CACHE_HIT_STALE | CACHE_MISS | CACHE_ROOT_UNAVAILABLE`; known hosts `WESLEY_WORK`, `WESLEYDESK`, `RYZEN9DESK`. **Z: is the sole-writer canonical authority; host roots are read-through replicas.**

`unified-mission-receipt-v1.mjs` composes one end-to-end receipt and is scrupulous about honesty: `waverunner` and `cacheRefresh` are owned outside this repo and read `NOT_YET_INTEGRATED` unless a caller supplies real evidence — "never inferred or defaulted to a success value." A short-circuited (never-probed) lane reads `NOT_CHECKED`, never `UNAVAILABLE`. Preserve that distinction in any extension.

### 5.14 Other intelligence entry points

| Command | Script | Purpose |
| --- | --- | --- |
| `npm run intelligence:ingest` | `ingest.mjs` | The pipeline above |
| `npm run intelligence:preflight` | `preflight.mjs` | Plane-ladder retrieval proof |
| `npm run intelligence:correlate` | `correlate.mjs` | Correlation block build/validate |
| `npm run intelligence:bible-hub-publish` | `publish-bible-to-hub.mjs` | Application Bible → Hub projection (`BIBLE_KNOWLEDGE_DOMAIN = APPLICATION_BIBLE`), with a `MISSING` verdict when a domain is no longer extractable from the live Bible |
| `npm run intelligence:run-w1-corpus-replay` | `run-w1-corpus-replay-v1.mjs` | W1 semantic-expansion corpus replay |
| *(no npm script)* | `prove-first-real-mission-v1.mjs` | **Orphan** — see §13 |

`mission-graph-queries-v1.mjs` provides the read-side query surface over the compiled index: `queryRecentlyCorrectedOrSuperseded`, `queryRelationshipGraph`, `queryUnmodeledEvidence`, `queryGoverningDecisions` (which parses `decisions/DECISION_LOG.md` directly).

---

## 6. Harvest subsystem

**Canonical per-run authority:**

```text
artifacts/agent-runs/<harvestId>/harvest-manifest-v1.json
```

Generated summaries, packet indexes, receipts, coverage reports, compact records, and rendered indexes are projections from the manifest.

**Main entry point:**

```bash
npm run harvest:record -- --harvest-id=<id>
```

Implementation: `scripts/harvest/record-harvest.mjs`. `scripts/harvest/` is the largest script tree: 63 entry scripts, 64 `lib/` modules, 13 JSON schemas.

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

Harvest libraries cover canonical JSON/hashing, publication identity, publication locks/transaction/hardening, git retention, content freshness, layered operational verdict, knowledge quality, duplication preflight, prompt extraction/triage, graph extraction, L-durable bundle publication, Z mirror and Z authority guard, optional Supabase projection, ChatGPT draft collection/staging/publication, and Gold Mine / protocol self-learning / WaveRunner self-improvement exports.

Schemas under `scripts/harvest/schema/` include `harvest-manifest-v1`, `harvest-intelligence-index-v1`, `harvest-durable-payload-inventory-v1`, `harvest-publication-identity-v1`, `harvest-publication-lock-v1`, `harvest-layered-operational-receipt-v1`, knowledge-quality evidence/receipt schemas, `harvest-seed-packet-v1`, `thread-autopsy-bundle-v1`, Gold Mine evidence projection schemas, and `prompt-candidate-v1`.

`validate-harvest.mjs` scans harvest payloads for forbidden keys (`token|secret|password|authorization|bearer|apiKey|privateKey`) before publication.

**Do not confuse:**

- generated harvest views with the canonical manifest;
- `HARVEST_AUTHORITY` with `DERIVED_INTELLIGENCE` (see §5.1 — using the harvest publication path for derived operational intelligence is explicitly forbidden);
- harvest evidence collection with the operational-intelligence semantic engine.

**Protocol documents are versioned in two places and they disagree — see §15-F before following either.**

---

## 7. Query routing and registry authority

**Query-routing authority:** `registry/query-routing/query-routing-manifest.v1.json`, validated by `npm run validate:query-routing` against `registry/query-routing/schemas/`.

Routed query classes include: repository health, authority placement / ownership conflict, closeout / deploy gates, MCP preflight, harvest state, suite status, closeout history, machine capability, workflow estate, safe commands, application identity, project document location, database/table ownership, contract identity, overall preflight, publication, mission intelligence. Fallback routes to `intelligence-hub-index` with `active-ledger` support.

**Dataset registry authority:** `registry/datasets/hot-cache-dataset-registry.v1.json` — owns dataset ids, freshness classes, TTL defaults, dependencies, miss policy, and manifest paths:

```text
active-ledger          all-systems-go        application-estate     authority-estate
closeout-index         command-estate        database-estate        deployment-estate
document-estate        failure-intelligence  git-estate             infrastructure-estate
intelligence-hub-index project-estate        schema-contract-estate storage-estate
workflow-estate        receipt-registry      intelligence-hub-domains
execution-packets      prompt-catalog        mission-intelligence
```

`authority-estate` and `git-estate` are `missOk: false`; most others can miss safely. Several ids (`all-systems-go`, `database-estate`, `deployment-estate`, …) are declared with `missOk: true` and **no `manifestPath`** — they are placeholders owned elsewhere, not local datasets.

Registry families under `registry/` (22 files): active-ledger, architecture, authority-estate, closeout-index, command-estate, datasets, execution-packets, git-estate, identity, intelligence-hub-domains, mission-intelligence, prompt-catalog, query-routing, receipt-registry, workflow-estate.

Consumers are largely **external** — `CG-AppBuilder-MCP/scripts/hot-cache-platform/lib/query-router.mjs` per `registry/query-routing/README.md`.

---

## 8. Index publication subsystem

**Purpose:** publish Cross-Agent state into Intelligence Hub / cache planes with source-SHA binding, no-op identity checks, and fail-closed publication behavior.

**Main entry point:** `npm run index:publish` → `scripts/index/run-index-publisher.mjs`.

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

Missing L: or downstream gate failure produces `PUBLICATION_HOLD`. Runtime receipt: `runtime/index-publication/latest.json`, read back to short-circuit to `NOOP_CURRENT` when SHA + contentHash match.

**GitHub Actions:** `.github/workflows/index-publication.yml` runs on `main` changes under `work-progress/**`, `handoffs/**`, or `registry/**`, plus manual dispatch. It runs on **self-hosted `[self-hosted, ryzen9desk, wsl2]`** (45-minute timeout), pins the checkout SHA, probes L:, runs the publisher, verifies SHA alignment, and uploads the publication receipt.

**Boundary:** Cross-Agent owns publication coordination/source state. It deliberately calls AppBuilder and Data-Extraction as workers for capabilities those repos own. Do not duplicate those implementations into Cross-Agent merely to remove the dependency.

Other index scripts: `preflight.mjs` (`index:preflight` — a thin wrapper that `execSync`s into `CG-AppBuilder-MCP/scripts/cross-agent-index/run-index-preflight.mjs`), `freshness-gate.mjs` (fail-closed git/Supabase/L: SHA comparison), `verify-publication-sha-alignment.mjs`, `sync-publication.mjs`, `refresh-continuity-anchors.mjs`, `compile-control-slices.mjs`.

---

## 9. Federated repo index subsystem

**This is the estate-wide index program, and it is distinct from this file.** Anyone extending the deep-index pattern to other repos must reconcile with it first.

| Artifact | Role |
| --- | --- |
| `index/cg-federated-repo-index.v1.json` | This repo's owner-local federated index entry |
| `index/repo-index.seed.v1.json` | Hand-authored seed the generated index is compiled from |
| `index/compounding-aliases.v1.json` | Alias list (currently empty) |
| `work-progress/projects/2026-08-12_cg-federated-repo-index-v1.md` | Program record |
| `work-progress/intelligence-hub-slices/federated-estate-routing.json` | Published estate routing slice |
| `work-progress/intelligence-hub-slices/federated-capabilities.v1.json` | Published capability slice |
| `work-progress/publications/cg-federated-repo-index-estate-100-v1/cross-agent-publication-receipt.json` | Estate-100 publication receipt |

**Authority split** (from the program record): AppBuilder owns estate routing, schemas, and the generate CLI. Each repo owns its local index. Intelligence Hub may receive replicas **last**, after Wave A close — never as owner. Luna is a read-only retriever and **must not write indexes**.

**Program state:** `CG_FEDERATED_REPO_INDEX_WAVE_A_CLOSED` / acceptance `LIVE_RYZEN9_PROOF_PASS`, `waveACloseEligible: false`. The record carries an explicit standing instruction: *do not* close Wave A, enter Wave B, publish Hub replicas to L:, or widen the work package to repair GitHub Actions / SSH.

The estate-100 receipt (published `2026-09-03`) names a **governed repo target set of 32** and compiles from `CG-AppBuilder-MCP/registry/federated-repo-index/{estate-routing,capabilities}.v1.json`.

**This repo's local federated index is a near-empty stub with a corrupt timestamp — see §15-G and §15-H.**

---

## 10. Experience, estimating, and Master Graph

**`contracts/experience/`** — durable machine semantics for experience/business-observation intelligence: business outcome vocabulary, business workflow observation, commercial glazing scope vocabulary, economic impact, experience episode/observation/pattern/relationship, and `experience-harvest-adapter-v1.md` (namespace boundaries `obs:` / `xobs:` / `episode:` / `pattern:`, plus the `EXPERIENCE_SOURCE_ROUNDTRIP_PASS` and `EXPERIENCE_NO_SUPPRESSION_PASS` invariants). Contract authority within its declared scope — not proof that Cross-Agent executes every producer or consumer workflow.

**`contracts/estimating/`** — `enriched-glazing-scope-object-v1.json`, `human-review-packet-v1.json`. Cross-repo estimating evidence/review contracts (decision enum `APPROVE|REJECT|CORRECT|DEFER`). Estimating product implementation remains in its owner repos.

**Master Graph:** `npm run master-graph:publish-hub` → `scripts/master-graph/run-hub-publication.mjs`. Cross-Agent resolves `CG-MASTER-GRAPH` and runs `npm run validate`, `npm run graph:publish`, `npm run graph:publish:suite` **in that repo**. Cross-Agent is an orchestration front door; `CG-MASTER-GRAPH` remains the graph implementation/validation owner. Planning docs live in `docs/master-graph/`, with a document-classification scheme (`MOVE_CANONICAL` / `COPY_PINNED` / `REMAIN_CROSS_AGENT` / `SPLIT`) governing what stays here.

**Runner / host support:** `scripts/runner/` holds WESLEYDESK WSL runner bootstrap/network/autostart/preflight adapters (`configure-wesleydesk-wsl-network.sh`, `ensure-wesleydesk-runner-wsl.sh`, `install-wesleydesk-github-runner-wsl-service.sh`, `install-wesleydesk-runner-autostart.ps1`, `wesleydesk-index-publication-preflight.mjs`, `wesleydesk.machine.json`). This is a host-support surface, **not** the estate-wide machine-execution authority model — and note the CI runner label on `main` is `ryzen9desk`, not `wesleydesk` (§15-E). Resolve current machine-registry/managed-executor authority before mutating any of it.

---

## 11. Entry commands and their runtime prerequisites

Several "simple" npm scripts shell out to **other repos** or **external mounts**. A command that fails for you may be missing a prerequisite, not broken.

| Command | Mutates | Hard prerequisites |
| --- | --- | --- |
| `npm run index:preflight -- --query="<task>" --json` | no | `CG_APPBUILDER_MCP_ROOT` or sibling `CG-AppBuilder-MCP` checkout (it `execSync`s into that repo) |
| `npm run intelligence:preflight` | local receipt only | none required; degrades down the plane ladder to the Git mirror |
| `npm run intelligence:ingest -- --handoff=<path> --dry-run --json` | local artifacts only | resolvable producer closeout; **`CG-AppBuilder-MCP` resolvable** if the closeout carries a correlation block (capabilities registry is a pointer into that repo) |
| `npm run intelligence:ingest -- --handoff=<path> --shared-dev-hub --json` | **Supabase `intelligence_hub`** | above, plus shared-dev write eligibility/credentials |
| `npm run harvest:record -- --harvest-id=<id>` | local artifacts | a valid `harvest-manifest-v1.json` for that id |
| `npm run harvest:sync-z-mirror` | **writes `Z:`** | `/mnt/z` mounted; else `Z_HARVEST_MIRROR_SYNC_BLOCKED` (exit 1) |
| `npm run harvest:move-chatgpt-harvest-to-l`, `harvest:stage-chatgpt-drafts-on-l` | **writes `L:`** | `/mnt/l` mounted |
| `npm run harvest:closeout-git -- --apply` | **local git branch/commit** | default is dry-run; see §15-C |
| `npm run harvest:chatgpt-publish-draft -- --apply` | **`git push origin chat-gpt-harvest`** | must be on that branch; default is dry-run; see §15-C |
| `npm run index:freshness-gate` | local receipt | **Doppler CLI auth** + `CG-AppBuilder-MCP` (runs `doppler run --project cg-mcp --config dev -- npm run cross-agent-ledger:drift-probe`) |
| `npm run index:publish` | **L:, plus `--apply` mutations in two other repos** | Doppler auth, `CG-AppBuilder-MCP`, `Data-Extraction`, `/mnt/l` mounted. Intended to run only on the self-hosted runner. |
| `npm run master-graph:publish-hub` | **runs publish in `CG-MASTER-GRAPH`** | `CG_MASTER_GRAPH_ROOT` or sibling checkout |
| `npm run test:cross-agent-architecture` | no | some child suites need mounts/siblings; expect partial failures on a bare checkout |

**Environment variable names referenced across the repo** (names only — never print values):

```text
CAPITALGLASS_CROSS_AGENT_ROOT   CG_APPBUILDER_MCP_ROOT   CG_ENVIRONMENT
CG_HARVEST_PUBLICATION_HARDENED CG_INTELLIGENCE_HUB_ROOT CG_MACHINE_ID
CG_MASTER_GRAPH_ROOT            CG_REPOS_ROOT            CG_WINDOWS_COMPUTER_NAME
CG_WSL_MACHINE_ROLE             CROSS_AGENT_HARVEST_PROJECTION_APPROVED
CROSS_AGENT_LEDGER_INGEST_APPROVED   DATA_EXTRACTION_ROOT
INTELLIGENCE_HUB_ROOT           RUN_L_MOUNT_SMOKE        HARVEST_ID
RUN_SHARED_DEV_HARVEST_PROJECTION    SUPABASE_ACCESS_TOKEN
```

Doppler project/config referenced: `cg-mcp` / `dev`. Secret *names* live in that Doppler project, not in this repo.

---

## 12. Cross-repository dependency map

| Dependency | Direction | Why Cross-Agent needs it | Boundary |
| --- | --- | --- | --- |
| `CG-Platform-Governance-MCP` | external authority | constitutional protocol/capture/closeout rules | Governance outranks Cross-Agent coordination prose |
| `CG-AppBuilder-MCP` | producer + worker + compiler | closeout evidence, intelligence handoff, ledger ingest, cache/publication primitives, index preflight, correlation capability registry, federated estate routing | AppBuilder does work; does not own Cross-Agent derived-intelligence semantics |
| `Data-Extraction` | worker / publisher | active-work ledger / research-library publication | processing/publication implementation stays there |
| `Scraper` | upstream capture | raw source/research capture | raw capture owner; Cross-Agent stores context/pointers |
| Intelligence Hub (L:/Supabase) | retrieval/storage | master index, BY-KIND, derived-intelligence readback | retrieval plane; never progression authority |
| Z: AI Cache Authority | cache plane | fast agent cache publication/retrieval; **sole-writer canonical** for the hot cache | cache cannot override fresher Git authority |
| WaveRunner / Git | progression | controls execution progression | derived intelligence cannot advance work by itself |
| `CG-MASTER-GRAPH` | graph owner | validates/publishes suite graph | Cross-Agent coordinates only |
| Computer Estimator / Bid Composer / other producers | evidence producers | may emit Cross-Agent-owned intelligence handoff | producers do not become intelligence-model owners |

---

## 13. Known dead ends

Surfaces that look live but are not. Verified on `main` at this snapshot.

**Abandoned message-passing directories** — documented in `README.md` / `AGENT_START_HERE.md` as the ChatGPT/Cursor protocol, but each contains **only a README stub** and has never held real content:

- `inbox/` — "temporary raw notes before they are classified"
- `chatgpt-reviews/` — "ChatGPT review notes when Wesley explicitly asks"
- `cursor-reports/` — "Cursor implementation reports and closeouts"

Real traffic moved into `work-progress/ACTIVE_WORK.md` + `work-progress/projects/*.md` (which carry per-entry `Source:` attribution). **Do not write here expecting to be read.**

**Orphaned scripts** — present in `scripts/`, referenced by no npm script, no workflow, and no importer:

```text
scripts/harvest/export-advancement-lineage-refs.mjs
scripts/harvest/generate-experience-bid-composer-loop-harvest.mjs
scripts/harvest/generate-experience-wave4-closeout-harvest.mjs
scripts/harvest/generate-gold-mine-compounding-reference-harvest.mjs
scripts/harvest/generate-harvest-protocol-self-learning-lane-closeout-harvest.mjs
scripts/harvest/generate-occ-sdlc-harvest-bridge.mjs
scripts/harvest/generate-project-folder-synology-harvest.mjs
scripts/harvest/generate-slice6-thread-harvest.mjs
scripts/harvest/generate-wesleywork-l-research-bootstrap-closeout-harvest.mjs
scripts/harvest/generate-wesleywork-l-windows-closeout-harvest.mjs
scripts/harvest/generate-z-l-drive-offlan-harvest.mjs
scripts/harvest/run-occ-hub-reuse-proof.mjs
scripts/harvest/run-slice6-post-publication-blind-retrieval.mjs
scripts/harvest/write-publication-hardening-baseline.mjs
scripts/intelligence/prove-first-real-mission-v1.mjs
scripts/tests/test-wesleydesk-runner.mjs
```

These are one-shot, dated closeout generators from historical missions. They are **not** current tooling; do not extend them or treat their hardcoded paths as configuration.

**Not orphans despite absence from `package.json`** (invoked outside `npm run`):

- `scripts/runner/wesleydesk-index-publication-preflight.mjs` — called directly by `.github/workflows/runner-smoke.yml`
- `scripts/harvest/lock-worker.mjs` — imported as a library by two publication tests

**Reserved-but-unemitted relationship types:** `SUPPORTS`, `PREVENTED_BY` (§5.7). Registered and valid, but nothing produces them yet.

---

## 14. Tests, provers, and CI

### Architecture matrix

```bash
npm run test:cross-agent-architecture
```

`scripts/tests/run-cross-agent-architecture-matrix.test.mjs` aggregates **16** suites: `HARVEST_CORE`, `GIT_RETENTION`, `RISK_REMEDIATION`, `PUBLICATION_HARDENING`, `LAYERED_VERDICT`, `CONTENT_FRESHNESS`, `IDENTITY`, `HOT_CACHE`, `QUERY_ROUTING`, `PROTOCOL_SELF_LEARNING`, `EXPERIENCE_GRAPH`, `INTELLIGENCE_CONTRACTS`, `INTELLIGENCE_INGEST`, `INTELLIGENCE_FIRST_REAL_MISSION`, `INTELLIGENCE_VERIFICATION`, `PHASE_B`.

### Three layers of coverage, each narrower than the last

| Layer | Count | Contents |
| --- | --- | --- |
| All `test:*` npm scripts | **41** | Every suite that exists |
| Architecture matrix | **16** | The curated reconciliation set |
| GitHub CI (`harvest-risk-gates.yml`) | **2** | `test:harvest:risk-remediation`, `test:harvest:git-retention` |

The gap is real and asymmetric for intelligence: `npm run test:intelligence` chains **13** intelligence suites, but the architecture matrix includes only **4** of them. Not in the matrix: `test:intelligence-correlation-markers`, `-correlate`, `-semantic-w1`, `-relationship-registry`, `-preflight`, `-hot-ai-cache`, `-mission-graph`, `-goldmine`, `-unified-receipt`. See §15-D.

### Workflows

| Workflow | Runner | Role |
| --- | --- | --- |
| `harvest-risk-gates.yml` | `ubuntu-latest` | **The only genuine hosted PR gate.** Path-filtered. |
| `index-publication.yml` | `[self-hosted, ryzen9desk, wsl2]` | Operational publication, not a code test |
| `chatgpt-harvest-move-to-l.yml` | `[self-hosted, ryzen9desk, wsl2]` | Moves ChatGPT drafts to L: |
| `runner-smoke.yml` | `[self-hosted, ryzen9desk, wsl2]` | Manual read-only runner probe |

Three of four require the self-hosted WSL2 runner with L: mounted, Doppler, and sibling repos — **not reproducible in standard CI or by a remote agent**.

### Hardening caveat

`docs/HARDENING.md` explicitly says `NOT_YET_VERIFIED` and is bound to an older commit. Its zeros mean **unmeasured**, not clean. Never cite it as proof of current health without a fresh hardening run.

---

## 15. Known drift / debt

Findings A–E and M are architectural (carried from v1.0.0). Findings F–L are new in v1.1.0 from the mechanical pass.

### A. Onboarding charter drift — material

`README.md`, `AGENT_START_HERE.md`, `WORKSPACE_CONTEXT.md`, and `REPOSITORY_ROLES.md` still describe Cross-Agent as coordination-only / no-scripts. Current `main` contains 282 script files, 104 npm scripts, and explicitly locked intelligence ownership.

**Classification:** documentation drift, not evidence that the newer subsystem is unauthorized.  
**Fix:** a separate governance/documentation reconciliation mission should update the onboarding charter without weakening the product-implementation placement rule.

### B. "Current" documents have mixed freshness

`ACTIVE_WORK.md` is current through 2026-09-04; `handoffs/CURRENT_HANDOFF.md` was last reconciled 2026-08-25; `verification/CURRENT_GATES.md` carries an unresolved 2026-08-02 known issue (Platform Intelligence Bible connector `UNAUTHORIZED` / `oauth_refresh_token_missing`).

**Risk:** agents privilege a stale `CURRENT_*` file over newer ledger truth.  
**Fix:** add explicit `sourceCommitSha` / `freshThrough` metadata and a deterministic stale-current-doc check.

### C. Governance rule contradicted by live code — material

`.cursor/rules/m8-github-plane-mandatory.mdc` forbids ad-hoc `git add`/`commit`/`push` and `gh pr create`/`merge` outside a compiled M8 `planHash` (G0–G8). Two shipped scripts do exactly that:

- `scripts/harvest/harvest-closeout-git.mjs` — `git checkout -b`, `git add`, `git commit` via `execSync`
- `scripts/harvest/chatgpt-publish-draft.mjs` — `git add`, `git commit`, `git push origin chat-gpt-harvest`

Both default to dry-run and mutate only with `--apply`. The rule itself concedes it is unenforced (`HARD_ENFORCEMENT: NOT_STARTED`, direct write paths `STILL_TECHNICALLY_AVAILABLE`).

**Risk:** an agent reading only the rule may believe a mechanism blocks these paths; an agent reading only the scripts may normalize a pattern the frozen invariant forbids.  
**Fix:** an explicit disposition — either exempt these two scripts in the rule, or route them through the M8 plane. Do not leave the contradiction undocumented.

### D. Architecture matrix under-covers intelligence, and CI under-covers the matrix

41 test scripts exist; the matrix runs 16; hosted CI enforces 2. Nine of the thirteen intelligence suites are outside the matrix entirely (§14).

**Fix:** decide whether the matrix (or a dependency-aware subset) should become a required CI gate, and whether the nine intelligence suites belong in the matrix. This index does not grant that policy change.

### E. Host scripts can outlive machine-control architecture

`scripts/runner/` contains concrete WESLEYDESK bootstrap/network scripts, while the CI runner label on `main` is `ryzen9desk` and machine authority has evolved elsewhere.

**Risk:** agents treat local host scripts — or the `wesleydesk` name — as machine-registry authority.  
**Fix:** index them as support adapters; require current machine-registry resolution before mutation.

### F. Generated protocol mirror is 432 lines ahead of its declared source — material

`harvest/README.md` states: *"Do not hand-edit mirrored protocol files — edit git sources under `docs/runbooks/`, `docs/harvest-z-mirror/`, or `Data-Extraction/docs/platform/`, then re-sync."* The actual state inverts that:

| File | Declared role | Version | Lines |
| --- | --- | --- | --- |
| `docs/runbooks/chat-thread-closeout-autopsy-harvest-v1.md` | **source** | v1 | 599 |
| `harvest/protocol/chat-thread-closeout-autopsy-harvest-v1.md` | **generated mirror** | **v1.3** | **1031** |
| `docs/protocols/chat-thread-closeout-autopsy-harvest-chatgpt-v1.md` | **source** | v2 | 441 |
| `harvest/protocol/CHAT-THREAD-CLOSEOUT-AUTOPSY-HARVEST-CHATGPT-V1.md` | **generated mirror** | v2.1 | — |

The mirror carries rules absent from the source, including the `HARVEST_GIT_DURABILITY_RULE` (mandatory commit-and-push before claiming `HARVEST_COMPLETE`, with the `HARVEST_VALIDATED` → `HARVEST_GIT_DURABLE` → `HARVEST_COMPLETE` lifecycle). Five files in `harvest/protocol/` have **no `docs/` counterpart at all** (`CHATGPT-HARVEST-GIT-PUBLICATION-CONTRACT-V1.md`, `CHAT-THREAD-SYSTEM-ADVANCEMENT-HARVEST-CHATGPT-V1.md`, `CHATGPT-DRAFT-BATCH-ASSESSMENT-T2-V1.md`, `CURSOR_HARVEST_INGEST_CLOSEOUT_WAVE_SDLC_V1.md`, `system-advancement-quality-gate.md`).

**Risk:** an agent following the documented read order reaches the `docs/` copy and follows a protocol missing a mandatory gate.  
**Interim rule:** **treat `harvest/protocol/` as authoritative and `docs/` as stale** until the sync direction is repaired. Also note `harvest/protocol/` contains both upper- and lower-cased filename variants of the same protocols.

### G. Local federated repo index is a near-empty stub

`index/cg-federated-repo-index.v1.json` declares `capabilities`, `protocols`, `surfaces`, `dependencies`, `PROGRAMS`, `WORK_PACKAGES`, `SYMBOL_POINTERS`, `LATEST_RECEIPTS`, `DECISIONS`, `BLOCKERS`, and `SUPERSEDED_ITEMS` as **empty arrays**, with a single `CODE_POINTERS` entry (`work-progress/ACTIVE_WORK.md`) and two `CAPABILITIES` strings. Its own `NEXT_ACTIONS` reads `cg-federated-repo-index-estate-100-v1 baseline seed`.

It also carries an internal version inconsistency: `"schema": "cg-federated-repo-index-v1@1.0.0"` alongside `"schemaVersion": "cg-federated-repo-index-v2"`.

**Risk:** a router consulting the federated index for this repo learns almost nothing, while this file (`AI_INDEX.md`) holds the real map — two indexes, one populated, one authoritative to the router.  
**Fix:** decide the relationship explicitly (populate the federated index from this one, or declare this one the human-facing companion). **This decision must be made before the deep-index pattern is rolled out to further repos**, or the estate forks into two incompatible index formats.

### H. Corrupt timestamp in a live estate artifact

`index/cg-federated-repo-index.v1.json` has `"INDEX_GENERATED_AT": "2000-02-08T16:42:02.562Z"` — the year **2000**. The companion estate-100 receipt records `"publishedAt": "2026-09-03T23:42:02.956Z"`. The sub-second components are near-identical, indicating a clock/serialization defect at generation rather than a placeholder.

Its `LAST_INDEXED_SHA` (`69582666…`) is real and recent (commit "Application Bible Hub projection estate rollout receipt — 20/21 repos, 408 objects", PR #56).

**Risk:** any freshness comparison against `INDEX_GENERATED_AT` computes a ~26-year-old index and will either always-refresh or always-fail a staleness gate.  
**Fix:** repair in the generator (owned by AppBuilder), not by hand-editing the generated file.

### I. Correlation marker budget: schema and validator disagree

`contracts/intelligence/correlation-markers-v1.schema.json` permits `markerBudget.max` in `1..64`. `scripts/intelligence/lib/correlation-markers-v1.mjs` sets `MARKER_BUDGET_MAX = 48` and `validateCorrelationBlock()` **hard-fails** unless `block.markerBudget.max === 48` exactly.

**Risk:** a producer writing to the published schema can emit a schema-valid handoff that ingest rejects with `CORRELATION_MARKERS_INVALID`.  
**Fix:** tighten the schema to `const: 48`, or relax the validator to accept the schema's range. Until then, producers must emit exactly 48.

### J. Path typo `/home/wesle/repos` — 277 occurrences across 75 files

The correct WSL root is `/home/wesley/repos`. The typo (missing `y`) appears **277 times in 75 files**, including:

- **Live code:** `scripts/runner/lib/wesleydesk-host.mjs:61` (in a candidate host-path list)
- **Test defaults:** `scripts/tests/run-hot-cache-dataset-registry-authority.test.mjs:82` (`CG_REPOS_ROOT` fallback)
- **Test fixtures:** `scripts/tests/run-harvest-publication-identity.test.mjs:121`
- **Orphaned generators:** `scripts/harvest/generate-occ-sdlc-harvest-bridge.mjs:23`, `generate-wesleywork-l-windows-closeout-harvest.mjs`
- **A live estate publication receipt:** `work-progress/publications/cg-federated-repo-index-estate-100-v1/cross-agent-publication-receipt.json` (both `sourceArtifacts` paths and both `publishedFiles` paths)
- **Foundational docs:** `AGENT_START_HERE.md`, `decisions/DECISION_LOG.md` (`CAD-20260802-wsl-ext4-default-repos`), `handoffs/CURRENT_HANDOFF.md`
- The remainder in `artifacts/**` historical receipts

The repo already knows this is a hazard: `run-hot-cache-dataset-registry-authority.test.mjs:60` asserts `text.includes("/home/wesle/repos") === false` — a guard scoped to **one** dataset file while 75 files still carry it.

**Risk:** any path resolved from these strings misses. Historical `artifacts/**` occurrences are immutable evidence and should be left alone; the **live code, test defaults, receipts, and foundational docs should be corrected**.  
**Fix:** targeted correction plus generalization of the existing assertion into a repo-wide check (§16).

### K. Estate-100 receipt carries a null content hash

`work-progress/publications/cg-federated-repo-index-estate-100-v1/cross-agent-publication-receipt.json` records `sourceShas.estateContentSha256: null` while `capabilityContentSha256` is populated. A publication receipt with a null source hash cannot support the SHA-alignment verification the rest of the publication chain depends on.

### L. Ingest receipt has permanently-unproven acceptance keys

`IDEMPOTENT_REINGEST_PASS` and `LOCAL_RUNTIME_VALIDATED` are hardcoded `null` in every receipt (§5.11). The id scheme (§5.6) makes idempotency structurally likely, but it is asserted nowhere.

**Fix:** either implement the re-ingest comparison and set the key, or document it as permanently caller-supplied. Do not let `null` be read as `true`.

### M. Hardening baseline is explicitly unverified

`docs/HARDENING.md` records `NOT_YET_VERIFIED` and is bound to an older commit; `docs/hardening-status.json` accompanies it. Its zeros mean **unmeasured**, not clean.

**Fix:** run a fresh hardening mission and bind evidence to the current SHA before making any health claim.

---

## 16. Mechanical verification recipe

Run these before the narrative pass when indexing any repo in this estate. They are cheap, deterministic, and catch the class of defect that source-reading alone misses (findings F, G, H, I, J, K above all came from this pass).

```bash
# 1. Scale — decide what NOT to scan
git ls-files | wc -l
for d in */; do printf "%-28s %s\n" "$d" "$(git ls-files "$d" | wc -l)"; done | sort -k2 -rn

# 2. Path typos / wrong-host roots
git grep -o "/home/wesle/repos" -- . | wc -l          # missing-y variant
git grep -ln "C:\\\\Developer\\\\repos\|/mnt/c/Developer" -- .   # forbidden host paths

# 3. Orphaned scripts: present, but referenced by nothing
for f in $(git ls-files 'scripts/**/*.mjs' | grep -v '/lib/\|/schema/\|/fixtures/'); do
  b=$(basename "$f")
  grep -q "$b" package.json || grep -rq "$b" .github/workflows/ \
    || { [ "$(grep -rl "$b" scripts/ --include=*.mjs | grep -vc "^$f$")" -gt 0 ] \
         || echo "ORPHAN $f"; }
done

# 4. Generated mirrors that drifted ahead of their declared source
#    (compare version line + line count for every doc pair)
for p in $(ls harvest/protocol/); do
  [ -f "docs/runbooks/$p" ] && { head -1 "docs/runbooks/$p"; head -1 "harvest/protocol/$p"; }
done

# 5. Contract vs implementation constants
grep -rn "maximum\|minimum\|const\":" contracts/**/*.schema.json
grep -rn "_MAX = \|_MIN = " scripts/**/*.mjs

# 6. Corrupt or impossible timestamps in generated artifacts
git grep -hoE '"[A-Za-z_]*[Aa]t": "(19|20)[0-9]{2}-' -- '*.json' | sort -u

# 7. Null hashes in receipts that gate SHA alignment
git grep -n '"[a-zA-Z]*[Ss]ha256": null' -- '*.json'

# 8. Dead directories: tracked, but README-only
for d in */; do
  n=$(git ls-files "$d" | wc -l)
  [ "$n" -le 1 ] && echo "STUB $d ($n file)"
done
```

Run this **first**. Then read for authority and architecture. The narrative pass resolves what the repo *means*; the mechanical pass finds what it *gets wrong*.

---

## 17. Persistence and authority matrix

| Surface | Contents | Authoritative for | Not authoritative for |
| --- | --- | --- | --- |
| `work-progress/ACTIVE_WORK.md` | human active-work ledger | editable coordination state | product implementation truth by itself |
| `decisions/` | durable decisions | Cross-Agent decisions until superseded | newer explicit subsystem architecture when older |
| `artifacts/agent-runs/<harvestId>/harvest-manifest-v1.json` | harvest run authority | per-harvest machine facts | operational-intelligence semantics |
| harvest generated JSON/MD | projections/receipts/coverage | proof bound to manifest | independent authority over manifest |
| `contracts/intelligence/` | intelligence schemas/ownership | derived-intelligence semantics | progression control |
| intelligence dry-run artifacts | deterministic projection evidence | ingest-output proof | source closeout truth; idempotency; Hub durability |
| Supabase `intelligence_hub` | derived-intelligence store/readback | stored projection | mission progression authority |
| L: Intelligence Hub | master-index/BY-KIND retrieval | published retrieval snapshot when fresh | override of newer Git state |
| Z: AI Cache Authority | hot cache | canonical cache release (sole writer) | code/protocol authority |
| `registry/**` | routing/dataset/estate manifests | declared registry domain | owner-repo implementation beyond registry claims |
| `index/` | federated repo-index entry | routing identity for this repo | this repo's real structure (currently a stub — §15-G) |
| `harvest/protocol/` | protocol mirror | **currently ahead of `docs/` — treat as authoritative** (§15-F) | its own declared status as generated-only |

---

## 18. Architecture disposition / historical drift

`registry/architecture/cross-agent-architecture-pr-disposition-registry.v1.json` is the machine-readable reconciliation record for older architecture PRs. It marks prior harvest-risk work as migrated, present-stronger, equivalent, obsolete, or evidence-only rather than blindly merging old branches, and carries a `pr6CapabilityMap[]` tracing which PR#6 capabilities were migrated onto main.

Consequences:

- Current `main` is the operating architecture, not old conflicting PR branches.
- Old publication/graph models may be explicitly obsolete.
- A historical design may still be useful evidence without being current authority.
- New work should implement required invariants on current architecture, not resurrect superseded seams.

---

## 19. Critical invariants for agents

1. **Do not collapse authority layers.** Coordination, evidence authority, derived intelligence, retrieval storage, and progression control are different.
2. **Do not move derived-intelligence semantics into AppBuilder.** AppBuilder emits evidence handoffs; Cross-Agent derives intelligence.
3. **Do not let derived intelligence claim progression authority.** `progressionAuthority` remains false — pinned as `const` in the schema *and* re-checked imperatively.
4. **Do not duplicate raw closeouts into derived ledger/Hub compact objects.** Preserve provenance instead.
5. **Do not hand-edit generated harvest projections as canonical.** Change the manifest/source and regenerate.
6. **Do not treat stale cache/L: snapshots as newer than Git.** Source SHA and freshness matter; Z: is the sole writer of the hot cache.
7. **Do not infer current authority from filenames alone.** `CURRENT_*` can be stale; a "generated mirror" can be ahead of its source (§15-F).
8. **Do not extend an old conflicting PR branch as architecture.** Check the disposition registry and current `main`.
9. **Do not make Cross-Agent a product repo.** Product UI/domain implementation stays with the product owner.
10. **Do not publish operational derived intelligence through the harvest `HARVEST_AUTHORITY` path.** Harvest and intelligence are sibling systems with different meaning — the ownership contract forbids it explicitly.
11. **Do not let Intelligence Hub or cache become execution/progression authority.** They are retrieval/storage planes.
12. **Do not copy worker implementations from AppBuilder/Data-Extraction/Master Graph merely because Cross-Agent orchestrates them.** Preserve single-owner boundaries.
13. **Do not read `null` as `false` or `true` in a receipt.** `null` means unproven (§5.11); a hardcoded `0` in a graph-delta receipt means unmeasured (§5.8).
14. **Do not add a relationship type by editing an existing one.** The registry is append-only: new id, old id `DEPRECATED`, never removed (§5.7).
15. **Do not change `DERIVATION_VERSION` casually.** It is an input to every id hash; changing it re-keys the entire graph (§5.2).

---

## 20. High-value navigation targets

| Question | Read first |
| --- | --- |
| What is active right now? | `work-progress/ACTIVE_WORK.md` |
| How big is this repo / what should I not scan? | §2 of this file |
| Who owns execution vs governance? | `work-progress/WORKSPACE_CONTEXT.md`, then current owner-repo contracts |
| Who owns operational intelligence? | `contracts/intelligence/OWNERSHIP.md` |
| What is the locked intelligence flow? | `work-progress/projects/operational-intelligence-envelope-v1.md`, then §5 here |
| What exactly does ingest do, stage by stage? | `scripts/intelligence/lib/ingest-pipeline-v1.mjs`, summarized in §5.3 |
| Why did ingest fail? | Match the stage/code pair in §5.3 |
| What relationship types may I emit? | `contracts/intelligence/registries/knowledge-relationship-types-v1.json` |
| How is a harvest recorded? | `scripts/harvest/record-harvest.mjs` |
| What is canonical in a harvest? | `harvest-manifest-v1.json` for that run |
| Which harvest protocol is current? | `harvest/protocol/` — **not** `docs/` (§15-F) |
| How are queries routed? | `registry/query-routing/query-routing-manifest.v1.json` |
| What datasets exist / how fresh? | `registry/datasets/hot-cache-dataset-registry.v1.json` |
| How is the index published? | `scripts/index/run-index-publisher.mjs` |
| What proves publication automation? | `.github/workflows/index-publication.yml` |
| How does this repo appear to the estate router? | `index/cg-federated-repo-index.v1.json` (stub — §15-G) |
| Will this command work on my machine? | §11 |
| Is this script still used? | §13 |
| What historical architecture was superseded? | `registry/architecture/cross-agent-architecture-pr-disposition-registry.v1.json` |
| What durable decisions exist? | `decisions/DECISION_LOG.md` |
| What are the available test surfaces? | `package.json`, `scripts/tests/run-cross-agent-architecture-matrix.test.mjs`, §14 |

---

## 21. Search vocabulary

```text
ACTIVE_WORK                    harvest-manifest-v1            harvest:record
HARVEST_AUTHORITY              DERIVED_INTELLIGENCE           INTELLIGENCE_OWNER
EVIDENCE_PRODUCER              intelligence-handoff-v1        operational-intelligence-envelope-v1
runIntelligenceIngest          mission ledger                 relationship graph
graph dividend                 provenance                     DERIVATION_VERSION
SEMANTIC_KINDS                 MISSION_MEASUREMENT            RECEIPT_LEVERAGE_SIGNAL
evidenceReality                measurementQuality             firstRealMissionEligible
MARKER_BUDGET_MAX              correlation-markers-v1         corr:                oi:ledger:
knowledge-relationship-types   PROJECTED_FROM                 SAME_AS              REQUIRES_EVIDENCE
CACHE_HIT_FRESH                ALL_HUB_PLANES_UNAVAILABLE     NOT_YET_INTEGRATED
query-routing-manifest         hot-cache-dataset-registry     mission-intelligence
index publication              PUBLICATION_HOLD               PUBLISH_PASS         NOOP_CURRENT
sourceCommitSha                body_hash                      Gold Mine
protocol self-learning         Experience Graph               architecture disposition
cg-federated-repo-index        estate-100                     HARVEST_GIT_DURABILITY_RULE
```

---

## 22. Modification routing

Before changing this repo, classify the intended change:

```text
human coordination / project record
  -> work-progress / decisions / handoffs

harvest evidence collection or harvest publication
  -> scripts/harvest + harvest contracts/tests

post-closeout derived intelligence semantics
  -> contracts/intelligence + scripts/intelligence
     (requires a superseding plan if it touches locked contracts)

query/dataset routing
  -> registry/query-routing or registry/datasets + validators

Cross-Agent index publication orchestration
  -> scripts/index + publication workflow

federated repo index content
  -> index/repo-index.seed.v1.json (seed) -- never the generated file directly;
     generator is owned by CG-AppBuilder-MCP

product implementation
  -> STOP: route to product owner repo

governance / progression semantics
  -> STOP: route to Governance / WaveRunner owner

CG Master Graph implementation
  -> STOP: route to CG-MASTER-GRAPH

machine / runner authority
  -> STOP: resolve current machine registry first (scripts/runner is an adapter)
```

---

## 23. Index acceptance status

This deep index is **source-complete and mechanically verified enough to guide agent investigation and modification routing**. It does **not** claim runtime PASS: this indexing session did not execute the repository's test or prover commands.

Every structural claim (file paths, npm script names, workflow runner labels, schema constants, stage names, failure codes, registry entry counts, file counts, typo counts, orphan list) was verified against `main` @ `b95828a` by direct inspection. Claims about behavior on external planes (L:, Z:, Supabase, sibling repos) are read from source and **not** runtime-confirmed.

```text
CROSS_AGENT_DEEP_INDEX_SOURCE_RECONCILIATION_PASS
MECHANICAL_VERIFICATION_PASS         = YES
RUNTIME_PROVER_STATUS                = NOT_RUN_BY_THIS_INDEXING_PASS
DOCUMENTATION_DRIFT_FOUND            = YES (13 findings, A-M)
AUTHORITY_CONTRADICTION_RESOLVED     = YES (charter drift, section 3.2)
AUTHORITY_CONTRADICTION_OPEN         = YES (M8 rule vs live git-mutating scripts, 15-C)
FEDERATED_INDEX_RECONCILIATION       = REQUIRED_BEFORE_ESTATE_ROLLOUT (15-G)
```

A future runtime closeout should run the architecture matrix, verify this index against the then-current Git SHA, and refresh `repo-index.v1.json` and this file if source has moved materially.
