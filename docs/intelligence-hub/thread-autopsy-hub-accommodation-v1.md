# Intelligence Hub accommodation — thread autopsy harvest v1

**Protocol:** [chat-thread-closeout-autopsy-harvest-v1.md](../runbooks/chat-thread-closeout-autopsy-harvest-v1.md)  
**Hub root:** `L:/Capital-Glass-Intelligence-Hub` (WSL: `/mnt/l/Capital-Glass-Intelligence-Hub`)  
**Git authority:** CapitalGlass-Cross-Agent

This document defines what the Intelligence Hub must contain to serve thread autopsy harvests. Cross-Agent owns Git schemas and compilers; the hub owns published catalog objects and compact BY-KIND slices.

---

## Architecture

```text
Git (Cross-Agent)
  artifacts/agent-runs/<harvest-id>/
    thread-autopsy-bundle.json
    seed-packets/*.json
        ↓ harvest:compile-seed-packets
    qa-index.json (derived)
        ↓ harvest:publish-hub-seed (operator, L: mounted)
L: Intelligence Hub
  02-catalog/knowledge-objects/cross-agent-harvest/<SEED-ID>.json
  00-master-index/BY-KIND/thread-autopsy-index.json
  00-master-index/BY-KIND/do-not-advance.json  (from Git registry on publish)
  00-master-index/_operations/cross-agent-harvest-publication/LATEST-harvest-publication.json
        ↓ scout on-demand / AI cache pointer
C: hot-routing-index (critical seed IDs only)
```

**Design rule:** Full waste ledgers and wrong-move registers stay in Git harvest artifacts. The hub gets **atomic seed packets** plus a **thin index slice** for retrieval.

---

## Hub paths (required)

| Path | Role | Schema |
| --- | --- | --- |
| `02-catalog/knowledge-objects/cross-agent-harvest/<SEED-ID>.json` | Atomic retrievable seed | [intelligence-hub-harvest-thread-autopsy-seed-v1.schema.json](../../scripts/harvest/schema/intelligence-hub-harvest-thread-autopsy-seed-v1.schema.json) |
| `00-master-index/BY-KIND/thread-autopsy-index.json` | Compact pointer index | [intelligence-hub-thread-autopsy-index-slice-v1.schema.json](../../scripts/harvest/schema/intelligence-hub-thread-autopsy-index-slice-v1.schema.json) |
| `00-master-index/BY-KIND/do-not-advance.json` | Estate do-not-advance guards | `intelligence-hub-do-not-advance-slice-v1@1.0.0` (existing) |
| `00-master-index/BY-KIND/commands.json` | Proof commands | `intelligence-hub-commands-slice-v1@1.0.0` (existing) |
| `00-master-index/_operations/cross-agent-harvest-publication/LATEST-harvest-publication.json` | Publish receipt | `cross-agent-harvest-hub-publication-receipt-v1@1.0.0` |

### Per-harvest pointer (optional, proven pattern)

`00-master-index/BY-KIND/cross-agent-harvest-<slug>.json` — e.g. existing `cross-agent-harvest-project-folder-synology.json`.

---

## BY-KIND: thread-autopsy-index.json

**Retrieval policy:** Explicit retrieval only — **not** in default scout preflight (open-actions + blockers). Load when:

- Mission is `chat-thread-closeout-autopsy-harvest-v1`
- Query matches autopsy keywords (wrong move, duplicate work, thread harvest, waste ledger)
- `indexNeed=REQUIRED` for closeout missions

**Example slice** (compiled on publish):

```json
{
  "schemaVersion": "intelligence-hub-thread-autopsy-index-slice-v1@1.0.0",
  "sourceCommitSha": "<git-head-40>",
  "updatedAt": "2026-08-03T00:00:00.000Z",
  "harvestCount": 1,
  "harvests": [
    {
      "harvestId": "harvest-2026-08-03-example-v1",
      "subject": "Short thread subject",
      "tier": "T2",
      "seedIds": ["IH-THREAD-EXAMPLE-001"],
      "roiTop3": [
        { "rank": 1, "title": "Scout before grep", "seedId": "IH-THREAD-EXAMPLE-001" }
      ],
      "doNotAdvanceRefs": ["STAGING_ALIAS_SERVES_CORRECT_BUILD"],
      "catalogRoot": "02-catalog/knowledge-objects/cross-agent-harvest",
      "gitAuthorityPath": "artifacts/agent-runs/harvest-2026-08-03-example-v1/harvest-manifest-v1.json"
    }
  ],
  "criticalSeedIds": ["IH-THREAD-EXAMPLE-001"],
  "retrievalHint": "Load individual seeds from 02-catalog/knowledge-objects/cross-agent-harvest/<seedId>.json"
}
```

### INDEX.json registration (operator / Data-Extraction)

Add to `00-master-index/INDEX.json` → `activeWorkLedger.slices`:

```json
"thread-autopsy-index": {
  "path": "00-master-index/BY-KIND/thread-autopsy-index.json",
  "sourcePath": "CapitalGlass-Cross-Agent/work-progress/harvest-packet-registry.json",
  "explicitRetrievalOnly": true
}
```

### AGENT_START_HERE.md lane row

| Kind | Slice file | Use when |
| --- | --- | --- |
| Thread autopsy harvest | `BY-KIND/thread-autopsy-index.json` | Closeout autopsy, wrong-move patterns, duplicate-work prevention — **explicit retrieval only** |

---

## Knowledge object: harvest-thread-autopsy-seed

Extends proven `harvest-qa-record` pattern with autopsy fields.

**Envelope:**

```json
{
  "knowledgeDomain": "cross-agent-harvest",
  "knowledgeObjectType": "harvest-thread-autopsy-seed",
  "knowledgeObjectId": "ih-thread-example-001",
  "schemaVersion": "1.0.0",
  "provenanceClass": "HARVEST_AUTHORITY",
  "cacheEligibility": "retrieval_eligible",
  "retrievalTier": "standard"
}
```

**Body additions** (beyond Q&A):

| Field | Purpose |
| --- | --- |
| `kind` | failure-pattern, runbook, command, blocker, lesson, roi |
| `promotionClass` | AUTOMATIC, POLICY_GATED, HUMAN_REVIEW |
| `futureAgentInstructions` | when/startAt/runPreflight/doNot/proveBeforeClaiming |
| `executionDeltaRefs` | Links to Git `executionDeltas[]` |
| `wasteIds` | Links to waste ledger |
| `operatorFrictionIds` | Links to operator friction |
| `roiRank` | ROI backlog rank if promoted |

---

## Git authority files (Cross-Agent)

| File | Syncs to hub |
| --- | --- |
| `work-progress/do-not-advance-registry.json` | `BY-KIND/do-not-advance.json` on `index:publish` |
| `work-progress/command-index.json` | `BY-KIND/commands.json` on publish |
| `work-progress/harvest-packet-registry.json` | Referenced by `thread-autopsy-index.json` compiler |

---

## Scout and AI cache (CG-AppBuilder-MCP — follow-on)

| Component | Change |
| --- | --- |
| `agent:index:scout` | On-demand load `thread-autopsy-index.json` for closeout missions |
| Hot routing index | After publish, include `threadAutopsyIndexPath` + `criticalSeedIds[]` |
| Default preflight | **Do not** add autopsy slice to 2-slice default |

---

## Publication commands

```bash
# Cross-Agent (operator, L: mounted)
npm run harvest:compile-seed-packets -- --harvest-id=<id>
npm run harvest:blind-retrieval -- --harvest-id=<id>
npm run harvest:publish-hub-seed -- --harvest-id=<id>

# Estate sync (operator)
npm run cross-agent-ledger:ingest -- --apply          # CG-AppBuilder-MCP
npm run agent-research-library:publish-active-work-ledger  # Data-Extraction
npm run index:freshness-gate                          # Cross-Agent
```

Cursor agents: **forbidden** from steps above.

---

## What exists today vs must build

| Asset | Status | Action |
| --- | --- | --- |
| `harvest-qa-record` catalog objects | Exists (Synology pilot) | Generalized in `publish-hub-seed-lib.mjs` |
| `cross-agent-harvest-*.json` BY-KIND pointer | Exists | Per-harvest upsert in publisher |
| `do-not-advance.json` on L: | **Synced** | `syncDoNotAdvanceToHub()` on `index:publish` |
| `commands.json` on L: | Exists | Auto-sync from command-index on publish |
| `thread-autopsy-index.json` | **Built** | Created/upserted by `harvest:publish-hub-seed` + `registerThreadAutopsyHubIndex` |
| `harvest-thread-autopsy-seed` object type | **Built** | Schema + `compile-seed-packets` catalog stubs |
| `harvest:compile-seed-packets` | **Built** | `scripts/harvest/compile-seed-packets.mjs` |
| Blind retrieval from seed questions | **Built** | `harvest:blind-retrieval` driven by seed `retrievalQuestions` |
| Scout autopsy slice load | **Built** | `thread-autopsy-index.mjs` + explicit retrieval in `scout-brief.mjs` |
| Supabase harvest projection | **Deferred v2** | Not required for v1 |

---

## Freshness

v1: `index:freshness-gate` checks git ↔ Supabase ↔ active-work ledger.

v1.1 (target): Also verify `thread-autopsy-index.json` `sourceCommitSha` matches git HEAD after hub seed publish.

Receipt: `artifacts/agent-runs/cross-agent-index-freshness-gate-v1/latest.json`

---

## Deferred BY-KIND slices (do not create as separate preflight files)

Store inside catalog seed bodies; aggregate pointers in `thread-autopsy-index.json` only:

- `agent-wrong-move-patterns.json`
- `duplicate-work-patterns.json`
- `token-waste-patterns.json`
- `right-first-move-patterns.json`

Rationale: scout default load stays at 2 slices; atomic catalog objects scale better.
