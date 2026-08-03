# Work package: project-folder-synology-primary-v1

**Status:** PRODUCTIONIZING (Slice 0–3) — deploy in flight; WESLEYDESK worker install pending

## Productionization (2026-08-03)

| Step | Status |
|------|--------|
| Git push (Documents `c1eee88`→`440ce33`, Dashboard `8125afd`, Cross-Agent `cc52e71`) | Done |
| Doppler `cg-documents/prd`: `PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED`, `PROJECT_FOLDER_PROVISION_WORKER_TOKEN` | Done |
| Vercel production env sync (`sync-hybrid-worker-vercel.mjs`) | Done |
| Document Center production deploy ([Actions run 30793778182](https://github.com/Capglass5708/CapitalGlass-Documents/actions/runs/30793778182)) | In progress (~30m+ on Vercel step) |
| Production `claim` route (currently HTTP 405 until deploy lands) | Pending deploy |
| WESLEYDESK `office-project-folder-provision` service | Pending — SSH to `wesleydesk` unavailable from WESLEY_WORK |
| Real `/capital-pipeline` project create | Pending deploy + worker |

**Operator follow-up after deploy completes:**

1. Redeploy Document Center once more (env vars synced after deploy started) or confirm Vercel picked up new production env.
2. On **WESLEYDESK**: `git pull` in `CapitalGlass-Documents`, `cd workers/office-project-folder-provision && npm install`, run as service with `SYNOLOGY_PROJECTS_ROOT=L:\Capital-Glass-Projects` and Doppler `cg-documents/prd`.
3. Create one project via Dashboard `/capital-pipeline`; verify `L:\Capital-Glass-Projects\{folder_segment}\`.

## Proof (2026-08-03)

- **Verdict:** `PASS` — see [`artifacts/agent-runs/project-folder-synology-primary-v1/proof-receipt.json`](../artifacts/agent-runs/project-folder-synology-primary-v1/proof-receipt.json) and [`PROOF.md`](../artifacts/agent-runs/project-folder-synology-primary-v1/PROOF.md)
- Migration applied to shared Supabase
- Test project: `e15f1184-72db-47fc-9ba1-f7e9c2f8b02c` (`is_sample=true`)
- Folder: `/mnt/l/Capital-Glass-Projects/CG-PROOF-mscwggig - Synology Proof mscwggig/` (48 taxonomy paths)
- **Not done:** WESLEYDESK service, real `/capital-pipeline` create (production deploy in flight)
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
