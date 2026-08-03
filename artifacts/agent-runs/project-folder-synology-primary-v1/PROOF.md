# Proof receipt: project-folder-synology-primary-v1 (Slice 0–3)

**Verdict:** `PASS` (integration proof — handler + worker + Supabase)  
**Finished:** 2026-08-03T07:21Z (approx)  
**Machine:** WSL2 (WESLEY_WORK) with `/mnt/l` Synology mount

## What was proven

| Check | Result |
|-------|--------|
| Migration applied | PASS — `project_folder_storage_locations`, `project_folder_provision_jobs`, `projects.folder_segment` |
| `PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=true` | PASS (proof env) |
| `PROJECT_FOLDER_PROVISION_WORKER_TOKEN` | PASS (ephemeral proof token) |
| `ensure-folder-workspace` → HTTP 202 `synology_primary_pending` | PASS |
| No `local_path_hint` in public API response | PASS |
| Worker claim + complete | PASS |
| `synology` / `primary` / `active` in Supabase | PASS |
| `synology_primary_create` job `succeeded` | PASS |
| `L:\` equivalent folder + taxonomy on `/mnt/l/Capital-Glass-Projects/` | PASS |

## Test project (shared dev DB — `is_sample=true`, `is_internal_project=true`)

| Field | Value |
|-------|--------|
| `projectId` | `e15f1184-72db-47fc-9ba1-f7e9c2f8b02c` |
| `folder_segment` | `CG-PROOF-mscwggig - Synology Proof mscwggig` |
| `jobId` | See `proof-receipt.json` |
| WSL path | `/mnt/l/Capital-Glass-Projects/CG-PROOF-mscwggig - Synology Proof mscwggig/` |

## Not yet proven (operator follow-up)

| Item | Status | Action |
|------|--------|--------|
| Doppler `prd` flags persisted | **PENDING** | Add `PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=true` and `PROJECT_FOLDER_PROVISION_WORKER_TOKEN` to `cg-documents` / `prd` (and Dashboard if needed) |
| CapitalGlass-Documents **production deploy** | **PENDING** | Deploy uncommitted Slice 0–3 code; prod claim/complete routes currently HTTP **405** |
| WESLEYDESK Windows worker service | **PENDING** | Install `workers/office-project-folder-provision` on `CG-WESLEYDESK-01` with `SYNOLOGY_PROJECTS_ROOT=L:\Capital-Glass-Projects` |
| `/capital-pipeline` UI create (no rollback) | **PENDING** | After deploy + flags: create one real test project via Dashboard |
| Slice 4 SharePoint mirror | **NOT STARTED** | Deferred per plan |

## Artifacts

- Machine receipt: [`proof-receipt.json`](./proof-receipt.json)
- Proof runner: `CapitalGlass-Documents/scripts/proof/project-folder-synology-primary-proof.ts`
- Migration: `CapitalGlass-Documents/supabase/migrations/20260803120000_project_folder_synology_primary.sql` (applied via Supabase MCP)

## Re-run proof

```bash
cd CapitalGlass-Documents
mkdir -p /mnt/l/Capital-Glass-Projects   # WSL; on WESLEYDESK use L:\Capital-Glass-Projects
PROOF_TOKEN=$(openssl rand -hex 24)
doppler run --project cg-documents --config prd -- \
  env PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=true \
  PROJECT_FOLDER_PROVISION_WORKER_TOKEN="$PROOF_TOKEN" \
  DOCUMENT_ENGINE_TOKEN="$PROOF_TOKEN" \
  SYNOLOGY_PROJECTS_WSL_ROOT=/mnt/l/Capital-Glass-Projects \
  npx tsx scripts/proof/project-folder-synology-primary-proof.ts
```

## Next decision

**Slice 4 (SharePoint mirror)** is unblocked only after:

1. Code merged/deployed to production Document Center
2. Doppler flags set on `prd`
3. WESLEYDESK worker running against production `DOCUMENT_LAYER_URL`
4. One real `/capital-pipeline` project create verified on Windows `L:\` (not proof script only)
