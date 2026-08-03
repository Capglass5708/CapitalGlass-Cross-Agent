# Work package: project-folder-synology-primary-v1

**Status:** PROOF_PASS (Slice 0–3 integration) — production deploy + WESLEYDESK operator steps pending

## Proof (2026-08-03)

- **Verdict:** `PASS` — see [`artifacts/agent-runs/project-folder-synology-primary-v1/proof-receipt.json`](../artifacts/agent-runs/project-folder-synology-primary-v1/proof-receipt.json) and [`PROOF.md`](../artifacts/agent-runs/project-folder-synology-primary-v1/PROOF.md)
- Migration applied to shared Supabase
- Test project: `e15f1184-72db-47fc-9ba1-f7e9c2f8b02c` (`is_sample=true`)
- Folder: `/mnt/l/Capital-Glass-Projects/CG-PROOF-mscwggig - Synology Proof mscwggig/` (48 taxonomy paths)
- **Not done:** Doppler `prd` flags persisted, production deploy, WESLEYDESK service, real `/capital-pipeline` create  
**Mission:** Make Synology/L: the primary project folder for new projects only.

## Scope (this phase)

- Contract + `PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED` flag
- Schema: `project_folder_storage_locations`, `project_folder_provision_jobs`, `projects.folder_segment`
- Async `ensure-folder-workspace` (flag on)
- WESLEYDESK `office-project-folder-provision` worker

## Out of scope

- SharePoint mirror worker (Slice 4)
- Old project migration
- Revu, Bid Composer, Computer Estimator
- Dashboard UI polish / public status API

## Locked decision

| Field | Role |
|-------|------|
| `project_label` | Legacy `{Name}-{Number}` |
| `folder_segment` | Canonical `{Number} - {Name}` for L: and future SharePoint |

## First milestone

1. Create one test project (flag on)
2. DC queues `synology_primary_create`
3. WESLEYDESK creates `L:\Capital-Glass-Projects\{folder_segment}\` + taxonomy
4. Supabase: synology / primary / active
5. No rollback while pending

## Contract

`CapitalGlass-Documents/docs/PROJECT_FOLDER_SYNOLOGY_PRIMARY_CONTRACT.md`
