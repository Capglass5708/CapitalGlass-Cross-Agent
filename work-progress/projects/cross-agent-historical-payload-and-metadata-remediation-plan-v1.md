# Historical payload and metadata remediation plan

**Work package:** `cross-agent-historical-payload-and-metadata-remediation-plan-v1`  
**Status:** `HISTORICAL_REMEDIATION_PLAN_READY` (read-only — do not execute in risk-remediation mission)  
**Owner repo:** CapitalGlass-Cross-Agent

## Purpose

Classify historical Cross-Agent Git harvest trees and metadata pin chains for operator-reviewed migration. This plan does **not** authorize automatic deletion.

## Classification buckets

| Class | Description | Action |
| --- | --- | --- |
| `L_DURABLE_COMPLETE` | Complete bundle exists on L: with matching payload hash | Git tree may shrink to pointer-only after operator review |
| `GIT_ONLY_PAYLOAD` | Full autopsy/seed bodies exist only in Git | High priority migration candidate — reconstruct to L: first |
| `L_PARTIAL` | L: bundle missing seeds or evidence slices | Backfill from Git before Git shrink |
| `GRAPH_PAYLOAD_IN_GIT` | `graph-extraction.json` under `artifacts/agent-runs/` | Stage to L: `_staging/graph-extractions/`; replace with pointer |
| `RUNTIME_RECEIPT_IN_GIT` | `operational-publication-receipt.json`, phase receipts, locks | Externalize to L: `_operations/`; stop tracking new copies |
| `METADATA_PIN_CHAIN` | Repeated manifest/pointer commits updating only timestamps or sourceCommitSha | Archive receipts; freeze pointer at last content hash |
| `POINTER_MISSING` | Manifest without `harvest-publication-pointer-v1.json` | Generate pointer from L: durable identity |
| `QUALITY_UNKNOWN` | Pre–knowledge-quality gate harvests | Run read-only quality audit before migration |
| `CONFLICTED` | Git payload hash ≠ L: bundle hash | Operator conflict resolution required |
| `MIGRATION_CANDIDATE` | Passes retention rules after L: verification | Eligible for Git shrink in dedicated migration mission |
| `DO_NOT_AUTOMATE` | Slice 6, customer-sensitive, or active project harvests | Manual operator gate only |

## Inventory scope

1. `artifacts/agent-runs/harvest-*` — all committed harvest run directories  
2. `operational-publication-receipt.json` files in Git  
3. `graph-extraction.json` files in Git run dirs  
4. Duplicate seed-packet and thread-autopsy bodies  
5. Index publication receipts under `artifacts/index/` if present  

## Estimated Git reduction (order of magnitude)

- Full autopsy trees: ~60–80% of harvest-related Git weight in historical runs  
- Graph extraction bodies: ~10–15%  
- Runtime receipts and metadata pins: ~5–10%  

Exact counts require `harvest:check-git-retention --mode historical` per harvest id after L: mount is available.

## Migration order (when authorized)

1. Verify L: durable bundle for harvest id  
2. Write or confirm compact Git pointer (`harvest-manifest-v1.json`, `harvest-publication-pointer-v1.json`, optional summary)  
3. Stage graph extraction to L: if applicable  
4. Externalize operational receipts to L: `_operations/`  
5. Remove forbidden bodies from Git in a dedicated migration PR (one harvest or batch per PR)  
6. Run `test:harvest:git-retention` and `test:harvest:risk-remediation` on each PR  

## Rollback

- Preserve L: content immutably before any Git shrink  
- Git revert restores historical trees without touching L:  
- Never use legacy publication path as rollback  

## Explicit non-goals

- No automatic deletion in this plan  
- No Slice 6 republish  
- No business harvest selection without operator approval  
- No broad `git filter-repo` without backup and operator sign-off  
