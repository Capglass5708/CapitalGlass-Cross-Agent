# Work package: project-folder-synology-primary-v1-production-promotion

**Verdict:** `PRODUCTION_PROMOTION_PASS`  
**Operational:** `PRODUCTION_SYNOLOGY_PRIMARY_OPERATIONAL=true`  
**Parent:** [`project-folder-synology-primary-v1.md`](./project-folder-synology-primary-v1.md)  
**Contract:** `CapitalGlass-Documents/docs/PROJECT_FOLDER_SYNOLOGY_PRIMARY_PRODUCTION_PROMOTION_CONTRACT.md`  
**Last updated:** 2026-08-03

---

## Status

| Dimension | State |
|-----------|--------|
| Operator approval | **Wesley** — 2026-08-03 |
| Promotion candidate | `e3fe6ec` (app); merged/deployed `5a436d1` (docs-only delta) |
| Production deploy | **READY** `dpl_EMR4stZe35zmdLpj7L6f9AUAp9sW` @ `5a436d1` |
| Production flag | `PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=true` (`cg-documents/prd`) |
| Production worker | `CapitalGlass-Office-ProjectFolder-Provision` **RUNNING** on CG-WESLEYDESK-01 |
| Canary | `PROD-SYNOLOGY-CANARY-20260803` — **PASS** |
| Gates P1–P10 | **ALL PASS** |
| Dev witness | `documents-dev` operational; dev worker **RUNNING** |

---

## Deploy lineage

| Role | SHA / deployment |
|------|------------------|
| Baseline production | `f16b4ff` / `dpl_7kNxyreo9KSd5vE7dzXw1eB1hVEz` |
| Candidate (app) | `e3fe6ec` |
| Docs commit | `e0d9d8c` |
| Merge / deploy | `5a436d1` / `dpl_EMR4stZe35zmdLpj7L6f9AUAp9sW` |
| PR | [#91](https://github.com/Capglass5708/CapitalGlass-Documents/pull/91) merged to `main` |

---

## Canary

| Field | Value |
|-------|--------|
| Project ID | `e0c74c03-9bbc-41c1-9d4d-b93e8a825332` |
| Project number | `PROD-SYNOLOGY-CANARY-20260803` |
| Primary job | `89fcc82e-71ba-43f6-93e6-912bbba3b1ae` |
| Folder root | `L:\Capital-Glass-Projects\` only |
| Storage | `synology` / `primary` / `active` |

---

## Rollback (ready — not executed)

1. `doppler secrets set PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=false --project cg-documents --config prd`
2. Sync Vercel production from Doppler; redeploy
3. `Stop-Service CapitalGlass-Office-ProjectFolder-Provision` on WESLEYDESK
4. Promote prior deployment `dpl_7kNxyreo9KSd5vE7dzXw1eB1hVEz` if application rollback required

---

## Artifacts

- [`receipt.json`](../artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json)
- [`gate-results.json`](../artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/gate-results.json)
- [`canary-receipt.json`](../artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/canary-receipt.json)
- [`rollback-receipt.json`](../artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/rollback-receipt.json)

---

## Monitoring

- Watch `project_folder_provision_jobs` queue depth on `wvidyxufvcrtezzkwwse`
- Watch production worker service health on WESLEYDESK
- **Out of scope:** historical project/document migration; SharePoint mirror (Slice 4)
