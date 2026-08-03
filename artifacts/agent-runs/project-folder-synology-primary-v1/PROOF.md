# Proof receipt: project-folder-synology-primary-v1 (Slice 0–3)

## Verdicts

| Layer | Verdict | Notes |
|-------|---------|-------|
| Integration proof (local handler + worker + Supabase) | **PASS** | 2026-08-03T07:21Z, WSL2 WESLEY_WORK |
| Productionization | **FAILED** | Deploy never landed; routes 405; worker not installed |

---

## Integration proof — PASS

| Check | Result |
|-------|--------|
| Migration applied | PASS |
| `PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=true` | PASS (proof env) |
| `PROJECT_FOLDER_PROVISION_WORKER_TOKEN` | PASS (proof env) |
| `ensure-folder-workspace` → HTTP 202 `synology_primary_pending` | PASS |
| No `local_path_hint` in public API response | PASS |
| Worker claim + complete | PASS |
| `synology` / `primary` / `active` in Supabase | PASS |
| `synology_primary_create` job `succeeded` | PASS |
| L: folder + taxonomy on `/mnt/l/Capital-Glass-Projects/` | PASS (48 paths) |

### Test project (sample — not production E2E)

| Field | Value |
|-------|--------|
| `projectId` | `e15f1184-72db-47fc-9ba1-f7e9c2f8b02c` |
| `folder_segment` | `CG-PROOF-mscwggig - Synology Proof mscwggig` |
| WSL path | `/mnt/l/Capital-Glass-Projects/CG-PROOF-mscwggig - Synology Proof mscwggig/` |

---

## Productionization — FAILED

### Shipped but not live

- Documents `c1eee88` / `440ce33`; Dashboard `8125afd`
- Doppler `cg-documents/prd` flags set; Vercel production env synced

### Blockers

| Item | Status |
|------|--------|
| Production deploy | FAILED — [30793778182](https://github.com/Capglass5708/CapitalGlass-Documents/actions/runs/30793778182) cancelled (Vercel hang); [30826482567](https://github.com/Capglass5708/CapitalGlass-Documents/actions/runs/30826482567) cancelled (STOP) |
| `claim` / `complete` on production | **405** (routes not deployed) |
| WESLEYDESK worker service | Not installed; SSH `Host key verification failed` from WESLEY_WORK |
| `/capital-pipeline` real create | Not proven in production |

### Safe state

- Flag true in Doppler/Vercel; **old production build** still serves live traffic without Synology-primary path.
- Slice 4 SharePoint mirror not started.

---

## Recovery order

1. Fix Document Center production deploy hang (`deploy-production.yml` / Vercel).
2. One successful production deploy of CapitalGlass-Documents.
3. Verify `claim`/`complete` ≠ 405.
4. Install `workers/office-project-folder-provision` on WESLEYDESK (Doppler `cg-documents/prd`).
5. Create one real project via `/capital-pipeline`.
6. Confirm `L:\Capital-Glass-Projects\{folder_segment}\` + DB `synology_primary_active`.
7. Only then consider Slice 4.

---

## Re-run integration proof

```bash
cd CapitalGlass-Documents
mkdir -p /mnt/l/Capital-Glass-Projects
doppler run --project cg-documents --config prd -- \
  env PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=true \
  PROJECT_FOLDER_PROVISION_WORKER_TOKEN="$TOKEN" \
  DOCUMENT_ENGINE_TOKEN="$TOKEN" \
  SYNOLOGY_PROJECTS_WSL_ROOT=/mnt/l/Capital-Glass-Projects \
  npx tsx scripts/proof/project-folder-synology-primary-proof.ts
```

## Artifacts

- Machine receipt: [`proof-receipt.json`](./proof-receipt.json)
- Proof runner: `CapitalGlass-Documents/scripts/proof/project-folder-synology-primary-proof.ts`
- Migration: `CapitalGlass-Documents/supabase/migrations/20260803120000_project_folder_synology_primary.sql`
