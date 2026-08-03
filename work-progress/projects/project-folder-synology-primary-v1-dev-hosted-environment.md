# Work package: project-folder-synology-primary-v1-dev-hosted-environment

**Verdict:** `DEV_ENVIRONMENT_ACCEPTED`  
**Parent:** [`project-folder-synology-primary-v1-dev-environment.md`](./project-folder-synology-primary-v1-dev-environment.md)  
**Contract:** `CapitalGlass-Documents/docs/PROJECT_FOLDER_SYNOLOGY_PRIMARY_DEV_ENVIRONMENT_CONTRACT.md` @ `d8826e8`  
**Deploy candidate:** `7c0b76f` (`fix/project-folder-provision-dev-deploy`)  
**Last updated:** 2026-08-03

---

## Final verdict

| Dimension | Status |
|-----------|--------|
| Contract authority | `d8826e8` |
| Hosted dev deploy | **READY** `7c0b76f` @ `documents-dev.capitalglasstxapps.com` |
| Dev acceptance gates G1–G10 | **ALL PASS** |
| Production activation | **HALTED** |
| Production touched | **NO** (`f16b4ff` unchanged) |

---

## Deployment

| Field | Value |
|-------|--------|
| READY deployment | `dpl_8cve5SbrQowbVfT81Azh5LhEVzeR` |
| `buildSkipped` | `false` |
| Alias | `https://documents-dev.capitalglasstxapps.com` |
| `/api/version` | `gitShortSha=7c0b76f`, `environment=preview` |
| Doppler | `cg-documents/dev` |
| Dev Supabase ref | `mazvavlshjshwklcvxaw` |
| Feature flag (runtime) | `PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=true` — proved by `ensure-folder-workspace` → `provisionState=synology_primary_pending` (HTTP 202) |

---

## WESLEYDESK bootstrap

| Field | Value |
|-------|--------|
| Method | Git bundle from WESLEY_WORK → SCP → `git clone` on WESLEYDESK |
| Path | `C:\Developer\repos\CapitalGlass-Documents` |
| HEAD | `7c0b76ffba8d085ecdf6786d93892545fe99ce53` |
| Dev worker service | `CapitalGlass-Office-ProjectFolder-Provision-Dev` (RUNNING) |
| Worker identity | `CG-WESLEYDESK-01-dev` |
| Dev Synology root | `L:\Capital-Glass-Projects-Dev` |
| Env bootstrap | Doppler `cg-documents/dev` → `.env` on worker host (values not recorded) |

**Note:** NSSM runs `run-worker-loop.mjs` (Node env loader) because PowerShell `.env` import corrupts bearer tokens for the stock `tsx` worker entry on WESLEYDESK SSH sessions.

---

## E2E disposable proof

| Field | Value |
|-------|--------|
| Dev project ID | `4450d73b-5ec5-47ff-9611-994aa52ff080` |
| Project code | `DEV-SYNOLOGY-PROOF-20260803` |
| Jobs succeeded | `f32de321`, `fa9506a7`, `d54135d1` |
| Folder paths | 48 under dev root only |
| Production root | No matching folder under `L:\Capital-Glass-Projects\` |

---

## Acceptance gates (contract G1–G10)

See [`gate-results.json`](../artifacts/agent-runs/project-folder-synology-primary-v1-dev-hosted-environment/gate-results.json) — all **PASS**.

---

## Staging prerequisite (operator)

Staging Supabase lacked `project_folders` and `security_audit_log`. Applied **staging-only** DDL via management API during this run (`scripts/dev-bootstrap/staging-synology-project-folder-prereq.sql`). Production schema untouched.

---

## Rollback (dev lane — verified commands, no production impact)

```text
doppler secrets set PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=false --project cg-documents --config dev
# sync Vercel Preview env from Doppler dev
C:\Tools\nssm\nssm.exe stop CapitalGlass-Office-ProjectFolder-Provision-Dev
```

Dev worker stop/start verified during G7. Flag left **enabled** so accepted dev lane remains operational.

---

## Artifacts

- [`receipt.json`](../artifacts/agent-runs/project-folder-synology-primary-v1-dev-hosted-environment/receipt.json)
- [`gate-results.json`](../artifacts/agent-runs/project-folder-synology-primary-v1-dev-hosted-environment/gate-results.json)

---

## Next progression

Separate approved work package for **production promotion** of SHA `7c0b76f` with `PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=false` on `prd` until operator promotion step.
