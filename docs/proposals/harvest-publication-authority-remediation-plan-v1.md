# Harvest Publication Authority Remediation Plan v1

**Status:** Implementation plan — Wave 0 baseline recorded  
**Policy baseline:** [harvest-storage-projection-git-retention-boundary-v2.md](./harvest-storage-projection-git-retention-boundary-v2.md) @ `3f7cd6b` on `growth-branch-1`  
**Governance decision:** `CAD-20260804-HARVEST-L-DURABLE-POINTER-PLANES`  
**Start verdict:** `POLICY_DEFINED_IMPLEMENTATION_UNVERIFIED`  
**Target verdict:** `HARVEST_PUBLICATION_AUTHORITY_OPERATIONAL`

## Mission

Correct implementation defects exposed by three-agent investigation while enforcing the storage boundary:

> **L:** contains the complete durable harvest. **Z:, Supabase, Git,** and local runtime are derived representations, pointers, or temporary execution surfaces.

**Do-not-advance until dogfood gate (Wave 10):** No existing harvest should be republished using the current full pipeline.

---

## Corrected lifecycle (Phase A / B / C)

Resolves the prior contradiction: publication pointer is written **last**, not in Phase A.

### Phase A — Record and freeze identity

1. Validate harvest locally.
2. Calculate `manifestHash` and `payloadHash` (canonical; timestamps excluded).
3. Stage **complete payload** on L: (not Git):

   `L:/Capital-Glass-Intelligence-Hub/_staging/harvests/<harvestId>/<payloadHash>/`

4. Commit **manifest** + optional **HARVEST_SUMMARY.md** to Cross-Agent Git.
5. Push lineage commit.

**Before Phase B:** Git may describe publication **intent** but must **not** claim `published`, `OPERATIONAL`, or `FULLY_SEEDED`. No `harvest-publication-pointer-v1.json` with operational verdicts yet.

### Phase B — Publish (no Git worktree mutations)

1. Load immutable publication snapshot from L: staging.
2. Verify identity and payload inventory.
3. Promote complete payload to L: durable catalog (atomic).
4. Generate Z: products from L: (when eligible).
5. Project Supabase from L: (compact only).
6. Verify required layers.
7. Generate `harvest-publication-pointer-v1.json` → **L:** `_operations/` (not Git).

**Invariant:** `git status --porcelain` identical before and after Phase B.

### Phase C — Pointer commit (minimal Git)

1. Operator commits **only** `harvest-publication-pointer-v1.json` if content changed.
2. Unchanged identity → `NOOP_CURRENT` — **no commit**.

---

## Defects being fixed

| Defect | Current behavior | Required behavior |
| --- | --- | --- |
| Git mutation during publication | Publisher writes derived files into Cross-Agent during publish | Phase B performs **no** writes inside Git worktree |
| SHA freshness treadmill | Freshness compares L:/Supabase to current HEAD | Compare `manifestHash`, `payloadHash`, `authoritySourceCommit` |
| Projection gates authority | Supabase ingest before L: | L: first; projections downstream |
| Republish not idempotent | Override flags for existing seeds | Same identity + hash → `NOOP_CURRENT` |
| False operational verdicts | `OPERATIONAL` when layers failed/skipped | Layered verdict from explicit required/optional states |
| Partial L: publication | Seeds/index only, not complete bundle | Every durable artifact on L:, hash-verified |
| Timestamp churn | Timestamps in canonical hashes | Timestamps excluded from content hashes |
| Mixed index/harvest status | Index freshness = harvest operational | Separate durability, distribution, index, cache states |
| Concurrent publisher interference | Multiple writers | Single-flight lock per `harvestId + payloadHash` |
| Git artifact accumulation | Many files under `artifacts/agent-runs/` | Published harvests: manifest + pointer + optional summary |

---

## Waves

| Wave | Work package | Owner | Scope |
| ---: | --- | --- | --- |
| 0 | `harvest-publication-authority-baseline-v1` | Cross-Agent + AppBuilder | Docs, L: mirror, read-only baseline — **no publication** |
| 1 | `harvest-publication-identity-v1` | Cross-Agent | `harvest-publication-identity-v1` schema, canonical hashing |
| 2 | `harvest-l-durable-payload-publisher-v1` | Cross-Agent | Complete L: bundle publisher |
| 3 | `harvest-publication-pipeline-decoupling-v1` | Cross-Agent | Refactor `publish-intelligence-full`; L:→Z:→Supabase→pointer |
| 4 | `cross-agent-ledger-snapshot-ingest-v1` | CG-AppBuilder-MCP | Snapshot/detached-source ingest; no Git mutation |
| 5 | `harvest-idempotency-supersession-v1` | Cross-Agent | NOOP_CURRENT, supersession metadata |
| 6 | `harvest-content-freshness-v1` | Cross-Agent + AppBuilder | Content-based freshness gates |
| 7 | `harvest-layer-verdict-v1` | Cross-Agent | Layered verdict model |
| 8 | `harvest-publication-single-flight-v1` | Cross-Agent | Publication locks |
| 9 | `harvest-git-retention-enforcement-v1` | Cross-Agent | Warn → enforce retention boundary |
| 10 | `harvest-publication-three-incident-dogfood-v1` | Cross-Agent + AppBuilder | Three-incident regression |

### Implementation branches (not `growth-branch-1`)

- Cross-Agent: `feat/harvest-publication-authority-v1`
- AppBuilder: `feat/cross-agent-snapshot-projection-v1`
- Data-Extraction (if needed): `feat/pinned-active-work-ledger-publish-v1`

---

## Completion gates

| Gate | Proof |
| --- | --- |
| G1 — Identity stable | Pointer-only commit does not alter harvest identity |
| G2 — L complete | Entire harvest reconstructable from L: |
| G3 — Git clean | Phase B leaves Cross-Agent porcelain unchanged |
| G4 — Projection downstream | Supabase reads L:/snapshot authority |
| G5 — Idempotent | Second run → `NOOP_CURRENT`, zero durable writes |
| G6 — No treadmill | Pointer commit does not invalidate freshness |
| G7 — Truthful verdict | Required-layer failure cannot produce `OPERATIONAL` |
| G8 — Git budget | New harvest retains only 2–3 Git files |
| G9 — Three-agent regression | Scenarios A/B/C pass |
| G10 — Protocol parity | Z:, L:, promoted runbook agree |

---

## Do-not-advance (until dogfood)

- Do not rerun current full publication pipeline in a loop.
- Do not treat current Git HEAD as harvest publication identity.
- Do not make Supabase ingest prerequisite for L: durable write.
- Do not call seed-only L: publication a complete durable harvest.
- Do not use `--allow-republish` as normal idempotency.
- Do not block publication on semantic similarity alone.
- Do not commit `latest.json` or timestamp-only receipts repeatedly.
- Do not claim `OPERATIONAL` from hardcoded receipt fields.
- Do not retro-clean Slice 6 or historical `artifacts/agent-runs/` yet.
- Do not run background and manual publishers concurrently.
- Do not update Git publication pointer before L: publication succeeds.

---

## Wave 0 evidence

Baseline artifact: `artifacts/agent-runs/harvest-publication-authority-baseline-v1/wave0-layer-baseline.json`

Protocol parity hashes: `artifacts/agent-runs/harvest-publication-authority-baseline-v1/protocol-parity-hashes.json`
