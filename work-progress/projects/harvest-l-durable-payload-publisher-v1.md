# Work package: harvest-l-durable-payload-publisher-v1 (Wave 2)

**Branch:** `feat/harvest-publication-authority-v1`  
**Depends on:** Wave 1 `publication-identity-lib.mjs`, `L_HARVEST_WRITE_AUTHORITY_PASS`  
**Verdict:** `L_DURABLE_BUNDLE_PUBLISHER_PASS`

## Commands

```bash
npm run harvest:stage-l-durable -- --harvest-id=<id> --json
npm run harvest:publish-l-durable -- --harvest-id=<id> --payload-hash=<sha256:...> --json
npm run test:harvest:l-durable
```

Live L: smoke:

```bash
RUN_L_MOUNT_SMOKE=1 npm run test:harvest:l-durable
```

Synthetic smoke harvest ID on L: (cleaned up by test): `harvest-wave2-l-durable-smoke-v1`

## Scope

Complete content-addressed L: bundle staging and publication only. No Z:, Supabase, ledger, index, or Git pointer.

## Acceptance gates

| Gate | Proof |
|------|-------|
| L_STAGING_WRITE_PASS | Staged bundle under `_staging/harvests/<id>/<payloadHash>/` |
| L_STAGING_HASH_PASS | Inventory hash verification in `stageLDurableBundle` |
| L_ATOMIC_PROMOTION_PASS | `DIRECTORY_RENAME` on `/mnt/l` (smoke test); fallback `COPY_THEN_COMPLETE_MARKER` |
| L_DURABLE_COMPLETE_PASS | Full bundle under `02-catalog/harvests` + `PUBLICATION_COMPLETE.json` |
| L_RECONSTRUCTION_PASS | Reconstruct payload from catalog-only copy |
| L_IDEMPOTENCY_PASS | Second run → `NOOP_CURRENT` |
| L_CONFLICT_GUARD_PASS | `BLOCKED_AUTHORITY_CONFLICT` without supersession |
| L_SUPERSESSION_PASS | Historical bundle preserved; pointer advances |
| PHASE_B_GIT_UNCHANGED | Git porcelain unchanged after publish |
| NO_DOWNSTREAM_PROJECTION_ATTEMPTED | No Z:/Supabase/ledger/index writes |

## drvfs note

WSL `/mnt/l` rejects Node `fs.copyFileSync` (EPERM) but accepts `readFileSync` + `writeFileSync` and shell `cp -f`. Staging/copy paths use read/write. Do not use `rsync` overwrite on this mount.

## Verification

```bash
npm run test:harvest:identity
npm run test:harvest:l-durable
RUN_L_MOUNT_SMOKE=1 npm run test:harvest:l-durable
```

## Do not advance (Wave 2)

- Do not modify `harvest:publish-intelligence-full`
- Do not publish Slice 6 or republish historical harvests until Wave 10 dogfood
- Do not create Git publication pointer, ledger ingest, index publish, or Z: cache products
