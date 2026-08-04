# Work package: harvest-publication-identity-v1 (Wave 1)

**Branch:** `feat/harvest-publication-authority-v1` (from `origin/main`)  
**Design authorities:** `growth-branch-1` @ `f9e36be`, v2 @ `3f7cd6b`, `CAD-20260804-HARVEST-L-DURABLE-POINTER-PLANES`

## Scope

Schema, canonical hashing, durable payload inventory, legacy manifest adapter, tests only. **No publication commands.**

## Deliverables

| Item | Path |
| --- | --- |
| Identity schema | `scripts/harvest/schema/harvest-publication-identity-v1.schema.json` |
| Inventory schema | `scripts/harvest/schema/harvest-durable-payload-inventory-v1.schema.json` |
| Hash library | `scripts/harvest/lib/publication-identity-lib.mjs` |
| Tests | `scripts/tests/run-harvest-publication-identity.test.mjs` |

## Verification

```bash
npm run test:harvest:identity
```

## Wave 2 gate

Requires `L_HARVEST_WRITE_AUTHORITY_PASS` (see `intelligence-hub-harvest-write-authority-repair-v1` receipt).
