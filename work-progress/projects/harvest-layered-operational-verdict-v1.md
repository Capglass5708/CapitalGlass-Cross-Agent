# harvest-layered-operational-verdict-v1

**Status:** Wave 7 — truthful layered operational verdict  
**Branch:** `feat/harvest-publication-authority-v1`  
**Start commit:** `d40cc5b951133bc1b73dcb9e600cc04432da99ef`

## Objective

Compute a read-only, evidence-linked operational verdict across harvest publication layers without hardcoded OPERATIONAL claims or Git-HEAD-based freshness.

## Layer model

Each layer exposes: `required`, `status`, `verificationMode`, `sourcePayloadHash`, `evidenceRef`, `verifiedAt`, `failureReason`.

Layers: `knowledgeQuality`, `lDurable`, `zCache`, `supabaseProjection`, `gitPointer`, `contentFreshness`, `retrievalVerification`, `hotRouting`, `coordinationIndex`.

## Verdict precedence

1. `HARVEST_KNOWLEDGE_HOLD` — quality gate failure
2. `HARVEST_PUBLICATION_FAILED` — L: missing/incomplete
3. `HARVEST_AUTHORITY_CONFLICT` — pointer/lineage conflict
4. `HARVEST_POINTER_PENDING` — Phase B complete, pointer absent
5. `HARVEST_DURABLE_DERIVED_DEGRADED` — Z/Supabase misalignment
6. `HARVEST_PUBLICATION_AUTHORITY_OPERATIONAL` — all required layers verified
7. `NOOP_CURRENT` — verified unchanged rerun

Coordination-index staleness and hot-routing unavailability degrade discovery/routing only — not L: durability.

## Commands

```bash
npm run test:harvest:layered-verdict
npm run harvest:check-operational-verdict -- --harvest-id=<id> --hub-root=<L:> --repo-root=<git> --json
```

## Target verdict

`HARVEST_LAYERED_OPERATIONAL_VERDICT_PASS`
