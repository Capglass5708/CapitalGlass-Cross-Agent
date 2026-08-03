# Work package: project-folder-synology-primary-v1-dev-hosted-environment

**Verdict:** `HOLD` — infrastructure blockers; partial Doppler dev config only  
**Parent:** [`project-folder-synology-primary-v1-dev-environment.md`](./project-folder-synology-primary-v1-dev-environment.md)  
**Contract:** `CapitalGlass-Documents/docs/PROJECT_FOLDER_SYNOLOGY_PRIMARY_DEV_ENVIRONMENT_CONTRACT.md` @ `d8826e8`  
**Last updated:** 2026-08-03

---

## Current verdict

| Dimension | Status |
|-----------|--------|
| Contract committed | **PASS** (`d8826e8`) |
| Dev hosted environment | **HOLD** |
| Production activation | **HALTED** |
| Production touched | **NO** |

---

## Pinned commit

| Field | Value |
|-------|--------|
| Repo | CapitalGlass-Documents |
| SHA | `d8826e84d9409739baee413aa937849bb57469d9` |
| Short | `d8826e8` |
| Message | `docs(project-folders): add Synology-primary dev environment contract` |

---

## Progress (step #3)

### Completed (dev-only)

| Item | Evidence |
|------|----------|
| Contract on `main` | `d8826e8` pushed |
| Vercel domain `documents-dev.capitalglasstxapps.com` | Registered on project `capitalglass-documents` (`verified: true`) |
| Doppler `cg-documents/dev` partial config | `PROJECT_FOLDER_PROVISION_WORKER_TOKEN` (unique dev), `SYNOLOGY_PROJECTS_ROOT`, `SYNOLOGY_PROJECTS_WSL_ROOT`, `PROJECT_FOLDER_CLAIMED_BY=CG-WESLEYDESK-01-dev`, `DOCUMENT_CENTER_DEV_URL`, `PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=false` |

### Blocked

| Blocker | Detail | Operator action |
|---------|--------|-----------------|
| **B1 — Vercel deploy BLOCKED** | CLI deploy `dpl_8MVyD1p1tPTBRkarx3gJtt7f7jVB` → `readyState: BLOCKED`, `buildSkipped: true`, [collaboration doc](https://vercel.com/docs/deployments/troubleshoot-project-collaboration#account-configuration) | Fix Vercel team/account collaboration config; redeploy pinned SHA to preview; `vercel alias` → `documents-dev.capitalglasstxapps.com` |
| **B2 — I2 Supabase isolation** | `cg-documents/dev` and `cg-documents/prd` share same `SUPABASE_URL` host (`wvidyxufvcrtezzkwwse`) | Provision **separate Supabase dev project**; update `SUPABASE_URL` + service role keys in `cg-documents/dev` only |
| **B3 — Dev alias wrong build** | `documents-dev` returns **200** but `gitSha` **f16b4ff** (not pinned `d8826e8`); `claim`/`complete` **405**; `DOCUMENT_ENGINE_URL` in dev still production | After B1: deploy `d8826e8` with `cg-documents/dev`; alias domain; wire dev URL secrets |
| **B4 — Dev worker not installed** | `office-project-folder-provision-dev` not running on WESLEYDESK | After B1+B3: install worker with `doppler run -p cg-documents -c dev` |
| **B5 — Dev flag off** | `PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=false` until hosted dev proves routes | Set `true` in `cg-documents/dev` only after B1+B3 deploy live |

---

## Acceptance gates G1–G10

**Not claimed.** Hosted dev URL not serving Document Center; gates cannot run.

| Gate | Status |
|------|--------|
| G1–G10 | **HOLD** — pending B1–B5 |

---

## Sanitized deployment evidence

```text
Vercel deployment id: dpl_8MVyD1p1tPTBRkarx3gJtt7f7jVB
Preview URL (assigned, not live): capitalglass-documents-e3n3688ky-capital-glass.vercel.app
Target stable alias: https://documents-dev.capitalglasstxapps.com (domain registered; serves stale f16b4ff, not d8826e8)
Production /api/version: unchanged (f16b4ff) — production not touched
Dev /api/version gitSha: f16b4ff (WRONG — expected d8826e8)
Dev claim route unauthenticated: 405
Production claim route: 405 — production not touched
Doppler dev DOCUMENT_ENGINE_URL: production origin (mispoint)
Doppler dev SUPABASE_URL: same project ref as prd (I2 violation)
Doppler prd PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED: false
```

---

## Worker identity (dev)

| Field | Value |
|-------|--------|
| Worker package | `office-project-folder-provision-dev` |
| `PROJECT_FOLDER_CLAIMED_BY` | `CG-WESLEYDESK-01-dev` |
| Synology root | `L:\Capital-Glass-Projects-Dev` |

---

## Next operator sequence

1. Resolve Vercel **BLOCKED** deploy (B1).
2. Create/configure **separate Supabase dev project** (B2).
3. Deploy `d8826e8` with `doppler run -p cg-documents -c dev -- vercel deploy`; alias to `documents-dev.capitalglasstxapps.com`.
4. Wire dev URL secrets in Doppler dev (B3); set `PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=true` (B5).
5. Install dev worker on WESLEYDESK (B4).
6. Run gates G1–G10; file `dev-acceptance-receipt.json`.

---

## Artifacts

- [`receipt.json`](../artifacts/agent-runs/project-folder-synology-primary-v1-dev-hosted-environment/receipt.json)
- [`gate-results.json`](../artifacts/agent-runs/project-folder-synology-primary-v1-dev-hosted-environment/gate-results.json)
