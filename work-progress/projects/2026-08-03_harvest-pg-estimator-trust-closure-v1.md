# Project: harvest-2026-08-03-pg-estimator-trust-closure-v1

## Summary

Cross-Agent **T2 thread harvest** for Cursor Proposal Generator estimator-trust closure session. Records business-gate FAIL, e2e automation learnings, and seed packets for future agents.

## Authority

| Artifact | Path |
| --- | --- |
| Manifest | `artifacts/agent-runs/harvest-2026-08-03-pg-estimator-trust-closure-v1/harvest-manifest-v1.json` |
| Autopsy bundle | `thread-autopsy-bundle.json` |
| Seed packets | `seed-packets/IH-THREAD-PG-*.json` |

## Verdict

`HARVEST_COMPLETE` (Phase A) — **not** `OPERATIONAL` until operator runs publish.

## Operator publish (Phase B)

```bash
cd CapitalGlass-Cross-Agent
npm run harvest:publish-intelligence-full -- --harvest-id=harvest-2026-08-03-pg-estimator-trust-closure-v1
```

## Retrieval

- `INDEX_HIT_AI_CACHE` at harvest time
- Tier T2: waste ledger, execution deltas, 3 seed packets, ROI backlog ranked
