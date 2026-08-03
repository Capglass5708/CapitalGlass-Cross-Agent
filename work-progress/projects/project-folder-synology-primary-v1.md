# Work package: project-folder-synology-primary-v1

**Verdict:** `PRODUCTIONIZATION_FAILED` — recovery tooling landed (deploy timeout + route probe + WESLEYDESK worker install scripts)  
**Integration proof (Slice 0–3 local):** `PASS`  
**Last updated:** 2026-08-03

**Mission:** Make Synology/L: the primary project folder for new projects only.

---

## Implemented / shipped

| Item | Detail |
|------|--------|
| Slice 0–3 code | Committed and pushed |
| CapitalGlass-Documents | `c1eee88`, `440ce33` |
| capital-glass-project-dashboard | `8125afd` |
| CapitalGlass-Cross-Agent | Proof artifacts committed |
| Supabase migration | Applied to shared DB |
| Local integration proof | **PASS** — async enqueue, worker claim/complete, L: folder tree, DB `synology_primary_active` |
| Doppler `cg-documents/prd` | `PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED`, `PROJECT_FOLDER_PROVISION_WORKER_TOKEN` |
| Vercel production env | Both keys synced via `sync-hybrid-worker-vercel.mjs` |

---

## Failed

| Blocker | Detail |
|---------|--------|
| Document Center production deploy | Did not land. [30793778182](https://github.com/Capglass5708/CapitalGlass-Documents/actions/runs/30793778182) cancelled after hanging on Vercel production deploy. Retry [30826482567](https://github.com/Capglass5708/CapitalGlass-Documents/actions/runs/30826482567) cancelled per STOP. |
| Production routes not live | `POST /api/internal/documents/project-folder-provision/claim` → **405**; `complete` → **405** |
| WESLEYDESK worker | Not installed. SSH from WESLEY_WORK: Host key verification failed. No service/scheduled task. Production worker poll: `claim_failed:405` |
| End-to-end production | No real `/capital-pipeline` project has proven production Synology-primary provisioning |

---

## Safe state

- Flag is `true` in Doppler/Vercel env, but **old production build** — live traffic is **not** using Synology-primary yet.
- Proof project `e15f1184-72db-47fc-9ba1-f7e9c2f8b02c` is sample/local proof only (`is_sample=true`).
- Slice 4 SharePoint mirror was **not** started.

---

## Recovery order

1. ~~Fix Document Center production deploy hang in `deploy-production.yml` / Vercel deploy path.~~ **Done in repo** — push + run workflow.
2. Complete one successful production deploy of CapitalGlass-Documents.
3. Verify `claim`/`complete` routes return auth/JSON behavior, not 405 (`npm run probe:project-folder-provision-routes`).
4. Install `office-project-folder-provision` worker on WESLEYDESK (`scripts/deploy-wesleydesk-project-folder-provision-worker.ps1`).
5. Create one real project via `/capital-pipeline`.
6. Confirm `L:\Capital-Glass-Projects\{folder_segment}\` exists and DB state is `synology_primary_active`.
7. Only after that, consider Slice 4 SharePoint mirror.

**Runbook:** `CapitalGlass-Documents/docs/PROJECT_FOLDER_SYNOLOGY_PRIMARY_PRODUCTION_RECOVERY.md`

---

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

## Contract

`CapitalGlass-Documents/docs/PROJECT_FOLDER_SYNOLOGY_PRIMARY_CONTRACT.md`

## Artifacts

- [`artifacts/agent-runs/project-folder-synology-primary-v1/proof-receipt.json`](../artifacts/agent-runs/project-folder-synology-primary-v1/proof-receipt.json)
- [`artifacts/agent-runs/project-folder-synology-primary-v1/PROOF.md`](../artifacts/agent-runs/project-folder-synology-primary-v1/PROOF.md)
