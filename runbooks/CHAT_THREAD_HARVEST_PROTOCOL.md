# Chat Thread Harvest Protocol

Purpose: turn a ChatGPT / Cursor working thread into durable Cross-Agent coordination intelligence without turning Cross-Agent into the implementation repo.

This runbook extends the existing Cross-Agent harvest system. It does not replace the existing authority model.

## Authority model

| Layer | Authority |
| --- | --- |
| Protocol / whether work counts | `CG-Platform-Governance-MCP` |
| Harvest/cache/sync execution | `CG-AppBuilder-MCP` |
| Human ledger and coordination | `CapitalGlass-Cross-Agent` |
| Machine-readable front door | `L:\\Capital-Glass-Intelligence-Hub\\00-master-index` |
| Hot AI cache / scout routing | `Z:\\Capital-Glass-Intelligence-Hub\\AI-Cache-Authority` and host hot cache where configured |
| Owner implementation | Owning app / MCP / infra repo |

Core rule:

> Cross-Agent records what matters and where to find it. It does not become the work.

## Required read order

1. `AGENT_START_HERE.md`
2. `work-progress/WORKSPACE_CONTEXT.md`
3. `work-progress/CANONICAL_KNOWLEDGE_LOCATIONS.md`
4. `work-progress/ACTIVE_WORK.md`
5. `work-progress/projects/INDEX.md`
6. Relevant project file or harvest manifest.

## Harvest phases

### 1. Scout preflight

Every harvest must record scout/index state before summarizing.

Required fields:

| Field | Required value / meaning |
| --- | --- |
| `retrievalCode` | `INDEX_HIT_AI_CACHE`, `INDEX_HIT_L`, `FAILOVER_SUPABASE`, `FAILOVER_GIT_LEDGER`, or `INDEX_MISS` |
| `indexTier` | `hot-ai-cache`, `z-ai-cache`, `l-hub-index`, `supabase`, or `git-ledger` |
| `publicationStatus` | `PUBLICATION_PASS`, `PUBLICATION_HOLD`, or equivalent |
| `freshnessVerdict` | `CURRENT`, `STALE`, or `UNKNOWN` |
| `rawScanRequired` | Boolean |
| `sourceCommitSha` | Source SHA for the index that answered |

If `rawScanRequired=false`, do not begin with broad repo grep or archive archaeology.

### 2. Packetize the thread

Split the thread into work-package packets. Do not write one giant summary.

Minimum packet fields:

```json
{
  "packetId": "",
  "missionClass": "",
  "ownerRepo": "",
  "state": "",
  "packetVerdict": "",
  "evidenceRefs": [],
  "commitRefs": [],
  "commands": [],
  "blockers": [],
  "nextActions": [],
  "doNotAdvance": []
}
```

### 3. Preserve verdict boundaries

A harvest verdict is not a work-package verdict.

| Verdict layer | Meaning |
| --- | --- |
| `harvestVerdict` | Did harvest recording complete? |
| `packetVerdict` | What happened in that work package? |
| `packetState` | Current descriptive state |
| `advancementGate` | What evidence promotes state |
| `doNotAdvance` | Claims that must not be made yet |

### 4. Index commands

Every material command mentioned in a thread must be captured as data.

Required command fields:

| Field | Meaning |
| --- | --- |
| `command` | Exact command |
| `repo` | Repo where it runs |
| `host` | WESLEY_WORK / RYZEN9DESK / WESLEYDESK / hosted CI |
| `purpose` | What it proves |
| `expectedResult` | PASS or useful output |
| `dangerLevel` | read-only, test, write, deploy, destructive |
| `requiresApproval` | Boolean |

### 5. Record authority lineage

Harvests must hash-link the source surfaces when possible:

```json
{
  "gitSha": "",
  "lHubSha": "",
  "zHotCacheSha": "",
  "supabaseProjectionSha": "",
  "manifestHash": ""
}
```

If one layer is stale, record it as stale. Do not silently reconcile by memory.

### 6. Emit recommended ROI

Every harvest should produce `recommended-roi.json`.

Each item:

```json
{
  "rank": 1,
  "item": "",
  "why": "",
  "effort": "low|medium|high",
  "ownerRepo": "",
  "acceptanceGate": "",
  "doNotAdvance": []
}
```

### 7. Respect owner boundaries

Use `work-progress/owner-repo-boundary-index.json` when available. Cross-Agent may point at owner work, but owner repos hold implementation.

### 8. Generate compact records

At minimum, a harvest should create or update:

```text
harvest-manifest-v1.json
packet-index.json
compact-records/*.json
receipt.json
coverage.json
recommended-roi.json
protocol-additions.json
```

### 9. Validate

Run the owner tooling when available. For Cross-Agent, prefer:

```bash
npm run harvest:sync-derived
npm run harvest:render-index
npm run harvest:validate
npm run test:harvest
```

If the repo has no npm tooling in the current checkout, validate JSON and Markdown structure and record that limitation.

### 10. Publish separately

Harvest recording is separate from publication.

Correct chain:

```text
record harvest
validate harvest
commit harvest
then separately: ingest ledger -> publish L: -> refresh hot cache -> freshness gate
```

Do not claim `PUBLICATION_PASS` from a docs-only harvest unless the publication receipt exists.

## Required do-not-advance examples

- Do not claim `MANAGED_EXECUTOR_ONLINE` without runner receipt on the target host.
- Do not claim `PERSISTENT_AVAILABILITY_PASS` without cold reboot / no manual repair proof.
- Do not claim `THREE_WAY_IMPROVEMENT_INTELLIGENCE_OPERATIONAL` before Slice 6 publication, parity, blind retrieval, and idempotency.
- Do not claim full app PASS when only one smoke lane passed.
- Do not claim hot-cache scout health if scout fell back to Git ledger.
