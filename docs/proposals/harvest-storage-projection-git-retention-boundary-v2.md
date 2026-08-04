# Harvest Storage, Projection, and Git Retention Boundary

**Status:** Proposal — Discussion Draft v2  
**Branch:** `growth-branch-1`  
**Prior discussion:** [v1 @ `d0bc3c7`](./harvest-storage-projection-git-retention-boundary-v1.md)  
**Protocol impact:** High  
**Decision required:** Yes  
**Canonical status:** Not canonical; do not enforce until approved

## Summary

One harvest was producing too many representations, artifacts, receipts, and commits. This proposal defines **where each representation lives** and caps Cross-Agent Git to **minimal lineage pointers**. It does not implement validators or redefine harvest tiers — those remain in canonical runbooks.

### Five decisions

1. Complete harvest payload belongs on **L:** (Intelligence Hub).
2. AI-ready derived products belong on **Z:** (regenerable from L: + lineage).
3. Supabase stores **compact searchable projections only**.
4. Cross-Agent Git retains **minimal lineage and coordination proof** (normal: **2–3 files** per harvest).
5. Unchanged republishing must produce **`NOOP_CURRENT`** and **no commit**.

### Controlling rule

| Plane | Role |
| --- | --- |
| L: | Complete durable intelligence |
| Z: | Regenerable AI-ready representation |
| Supabase | Compact searchable projection and routing |
| Git | Minimal lineage and coordination proof |
| Temporary | Disposable execution output |

**Core rule:**

> Harvest once, publish each representation to its designated authority plane, and retain only compact coordination proof in Cross-Agent Git.

**Agent rule:**

> **Git commit and push are designed pointers, not the harvest warehouse.** All durable harvest intelligence goes to **Intelligence Hub (L:)** via operational publish (`harvest:publish-intelligence-full`). A Git push does not make a harvest operational.

---

## 1. Purpose and scope

**In scope:** storage-plane roles; Git file budget; publication sequence; idempotency; commit-loop prohibition; proposed tier storage overlay; proposed enforcement ownership.

**Out of scope (future Growth Branch proposals):** full governance constitution, agent ACLs, automated boundary repair, retention schema implementation.

---

## 2. Five storage-plane responsibilities

| Plane | Role | Full harvest payload? |
| --- | --- | ---: |
| L: Intelligence Hub | Durable intelligence | Yes |
| Z: AI-Cache-Authority | AI-ready / compiled cache | Derived only |
| Supabase | Projection and routing | No |
| Cross-Agent Git | Compact coordination proof | No |
| Temporary local / workflow | Execution intermediates | Ephemeral only |

### Human vs machine coordination

| Surface | Role |
| --- | --- |
| Compact manifest + `harvest-publication-pointer-v1.json` | Machine coordination authority |
| `ACTIVE_WORK.md`, project files | Human narrative only |

Human narrative may explain machine state but **must not promote, downgrade, or contradict** a machine-verifiable publication verdict.

### Authority conflict (block, do not guess)

Compare: declared authority source commit, canonical manifest hash, L: published content hash, publication receipt.

- Lineage resolves → regenerate **Z: and Supabase** from the identified source.
- Lineage does **not** resolve → **`BLOCKED_AUTHORITY_CONFLICT`**.

L: is complete durable **content** authority. Manifest + lineage prove **which version** should be on L:. Z: and Supabase are always regenerable. Git proves coordination; it does **not** carry the payload. Timestamp alone never promotes authority.

---

## 3. Cross-Agent Git artifact budget

**Closeout evidence is required.** A separate `receipt.json` is **not** automatically required — only when evidence cannot fit completely in manifest + publication pointer.

### Normal Git state (2–3 files)

```text
harvest-manifest-v1.json              # required
harvest-publication-pointer-v1.json   # required after publish intent
HARVEST_SUMMARY.md                    # optional human narrative
receipt.json                          # exception only
```

| Git artifact | Max per harvest | Default |
| --- | ---: | --- |
| `harvest-manifest-v1.json` | 1 | **Required** |
| `harvest-publication-pointer-v1.json` | 1 | **Required** after publish |
| `HARVEST_SUMMARY.md` | 1 | Optional |
| `receipt.json` | 1 | **Exception only** |
| `compact-records/<packetId>.json` | **0** | **Forbidden by default** |

Packets are **packet ID + hash in the manifest**; full packet content publishes to **L:**.

**Packet-file exceptions in Git** (rare): durable decision, owner-boundary declaration, unresolved blocker, governance exception — each declared in manifest with `retentionClass` and `coordinationReason`.

**Forbidden in Git after L: publish:** `thread-autopsy-bundle.json`, `seed-packets/`, `qa-index.json`, blind-retrieval dumps, regenerable derived artifacts, per-packet file sprawl.

**`runtime/index-publication/latest.json`:** prefer not in Git; if kept repo-wide → replace only, never accumulate.

Higher harvest tiers do **not** expand the Git budget.

---

## 4. Publication sequence, idempotency, and commit-loop prohibition

### Sequence

```text
Validate → manifest/hash → L: (complete durable intelligence)
    → Z: (if eligibility flags) → Supabase upsert → verify → Git pointer (last)
```

### Minimal pointer fields

`harvestId`, `manifestHash`, `authoritySourceCommit`, `receiptCommit` (distinct from authority source), `lPublication`, `zCache`, `supabaseProjection`, `verdict`, `retrievalEligible`, `aiCacheEligible`.

### Idempotency

Unchanged harvest → **`NOOP_CURRENT`**: no new Git commit, no duplicate Supabase row, no new Z: release, no timestamp-only hash churn.

### Commit-loop prohibition

A receipt commit must not require regeneration of L:/Z:/Supabase solely because HEAD moved. Receipt-only repin of derived `latest.json` timestamps → **`BLOCKED_PUBLICATION_COMMIT_LOOP`**.

### Degraded states

`OPERATIONAL`, `OPERATIONAL_DEGRADED`, `OUT_OF_SYNC`, `BLOCKED` — unqualified `OPERATIONAL` forbidden when a required layer failed.

---

## 5. Tier mapping and degraded states

> **Proposed storage obligations by existing harvest tier — subject to canonical runbook validation.**  
> Canonical tier definitions: [`docs/runbooks/chat-thread-closeout-autopsy-harvest-v1.md`](../runbooks/chat-thread-closeout-autopsy-harvest-v1.md) (repo) and L:/Z: operator copy.

| Tier | L: payload | Z: | Supabase | Git budget | Notes |
| --- | --- | --- | --- | --- | --- |
| T0 | No | No | No | Optional blocker pointer | `NO_HARVEST_NEEDED` |
| T1 | Yes | If `aiCacheEligible=true` | Yes (compact) | 2–3 files | Default closeout |
| T2 | Yes | If `retrievalEligible=true` or `aiCacheEligible=true` | Yes | 2–3 files | Seeds on L: after publish |
| T3 | Yes | If flags true | Yes | 2–3 files | `NOOP_CURRENT` on republish |

**Z: rule:** required when `retrievalEligible=true` **or** `aiCacheEligible=true` — machine-verifiable, not narrative "cache was used."

Every actual T1/T2/T3 harvest publishes **completely to L:**. Git stays within the same 2–3-file budget regardless of tier.

---

## 6. Proposed enforcement ownership

All gates are **proposed** — not assumed to exist today.

| Gate / code | Proposed owner | Status |
| --- | --- | --- |
| `BLOCKED_HARVEST_GIT_DUPLICATION` | Cross-Agent `harvest:validate` | NEW_PROPOSED |
| `BLOCKED_RETENTION_CLASS_MISSING` | Cross-Agent manifest validation | EXTEND_EXISTING |
| `BLOCKED_SUPABASE_PAYLOAD_DUPLICATION` | AppBuilder `cross-agent-ledger:ingest` | EXTEND_EXISTING |
| `BLOCKED_PUBLICATION_COMMIT_LOOP` | Cross-Agent publisher / freshness gate | EXTEND_EXISTING |
| `BLOCKED_NON_IDEMPOTENT_PUBLICATION` | Publisher + index pipeline | EXTEND_EXISTING |
| `BLOCKED_AUTHORITY_CONFLICT` | Cross-Agent closeout validate | NEW_PROPOSED |

Implementation is **out of scope** for this discussion draft.

---

## Appendix A — Relationship to existing runbooks

| Doc | v2 role |
| --- | --- |
| [`runbooks/CHAT_THREAD_HARVEST_PROTOCOL.md`](../../runbooks/CHAT_THREAD_HARVEST_PROTOCOL.md) | Storage layer under "Publish separately" |
| [`docs/runbooks/chat-thread-closeout-autopsy-harvest-v1.md`](../runbooks/chat-thread-closeout-autopsy-harvest-v1.md) | Canonical tier authority |
| L:/Z: `chat-thread-closeout-autopsy-harvest-v1.md` | Operator protocol; **Git commit/push = pointers; all data → L:** |
| [`docs/runbooks/harvest-record-validate-sync.md`](../runbooks/harvest-record-validate-sync.md) | Steps 7–9 = publication planes |
| [v1 @ `d0bc3c7`](./harvest-storage-projection-git-retention-boundary-v1.md) | Prior discussion; historical snapshot |

---

## Appendix B — Worked example (ILLUSTRATIVE)

**Source:** `ILLUSTRATIVE — path-accurate; not from a committed harvest run on this branch.**  
Aligns with registry packet `harvest-storage-pointer-authority-v1` (harvest id `harvest-2026-08-04-harvest-storage-chatgpt-lane-v1`).

### Before (anti-pattern — too many Git files)

```text
artifacts/agent-runs/harvest-2026-08-04-harvest-storage-chatgpt-lane-v1/
  harvest-manifest-v1.json
  thread-autopsy-bundle.json          # should be L_DURABLE after publish
  seed-packets/*.json                 # should be L_DURABLE after publish
  compact-records/*.json              # should be manifest packet IDs only
  qa-index.json                       # regenerable / L_DURABLE
  duplication-preflight-receipt.json  # EPHEMERAL or folded into pointer
  receipt.json                        # only if not in pointer
```

### After v2 budget (Git — 2 files + optional summary)

```text
artifacts/agent-runs/harvest-2026-08-04-harvest-storage-chatgpt-lane-v1/
  harvest-manifest-v1.json
  harvest-publication-pointer-v1.json
  HARVEST_SUMMARY.md                  # optional
```

### Intelligence Hub (L: — complete durable intelligence)

```text
L:/Capital-Glass-Intelligence-Hub/02-catalog/knowledge-objects/cross-agent-harvest/<SEED-ID>.json
L:/Capital-Glass-Intelligence-Hub/00-master-index/BY-KIND/thread-autopsy-index.json
```

### Example pointer (machine authority)

```json
{
  "schemaVersion": "harvest-publication-pointer-v1",
  "harvestId": "harvest-2026-08-04-harvest-storage-chatgpt-lane-v1",
  "manifestHash": "sha256:…",
  "authoritySourceCommit": "abc1234",
  "receiptCommit": null,
  "verdict": "HARVEST_COMPLETE",
  "retrievalEligible": false,
  "aiCacheEligible": true,
  "lPublication": {
    "status": "published",
    "pointer": "02-catalog/knowledge-objects/cross-agent-harvest/…",
    "contentHash": "sha256:…"
  },
  "zCache": { "status": "current", "releaseId": "AI-CACHE-RELEASE-…" },
  "supabaseProjection": { "status": "in_sync", "projectionVersion": 1 }
}
```

### Agent workflow

```text
Phase A: validate → commit 2 pointer files → push (lineage proof only)
Phase B: harvest:publish-intelligence-full → ALL durable data → L:
```

---

## Governing principle

> **L: remembers the durable intelligence.**  
> **Z: serves the regenerable AI-ready representation.**  
> **Supabase answers where it is, what state it is in, and how to route to it.**  
> **Git records what was decided, who owns the work, and where to find the complete record on L:.**

**Final rule:** Harvest once. Publish complete durable intelligence to L:. Publish AI-ready products to Z: when eligibility flags require it. Project compact searchable pointers into Supabase. Commit only minimal coordination and lineage proof to Cross-Agent. Unchanged republish → `NOOP_CURRENT`.
