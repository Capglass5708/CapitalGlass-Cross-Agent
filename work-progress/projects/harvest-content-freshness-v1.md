# harvest-content-freshness-v1

**Status:** Wave 6 — content-hash harvest freshness  
**Branch:** `feat/harvest-publication-authority-v1`  
**Start commit:** `0d7625082be70d16b00105933421b76edc565715`

## Objective

Replace Git-HEAD-based harvest freshness with content-hash alignment across L:, Z:, Supabase, and the Git coordination pointer. Coordination-index freshness is evaluated separately and must not invalidate a complete L: harvest.

## Harvest publication freshness

Compare:

- L: durable `payloadHash`
- Z: `sourcePayloadHash`
- Supabase `sourcePayloadHash`
- Git pointer `payloadHash`
- manifest identity and supersession lineage

Verdicts:

| Verdict | Meaning |
|---------|---------|
| `HARVEST_CURRENT` | All aligned layers current |
| `HARVEST_POINTER_PENDING` | L + derived layers OK; Git pointer not materialized |
| `HARVEST_DERIVED_LAYER_DEGRADED` | L OK; Z or Supabase misaligned |
| `HARVEST_AUTHORITY_CONFLICT` | Pointer or lineage conflict |
| `HARVEST_DURABILITY_FAILED` | L durable missing, incomplete, or corrupted |

## Coordination-index freshness (separate)

| Verdict | Meaning |
|---------|---------|
| `COORDINATION_INDEX_CURRENT` | `active-work-ledger/LATEST.json` matches Git HEAD |
| `COORDINATION_INDEX_STALE` | Index SHA differs from Git HEAD |
| `COORDINATION_INDEX_UNAVAILABLE` | Index or Git HEAD unreadable |

## Commands

```bash
npm run test:harvest:content-freshness
npm run harvest:check-content-freshness -- --harvest-id=<id> --hub-root=<L:> --repo-root=<git> --json
```

Read-only: no Git writes, no automatic republication.

## Target verdict

`HARVEST_CONTENT_FRESHNESS_PASS`

## Deferred

Adapt `index:freshness-gate` only after this contract passes independently.
