# Work package: project-folder-synology-primary-v1-dev-environment

**Verdict:** `ACTIVE` — dev lane required before any production promotion  
**Supersedes production activation for:** `project-folder-synology-primary-v1`  
**Last updated:** 2026-08-03

---

## Current verdict

| Dimension | Status |
|-----------|--------|
| Production safety | **PASS** |
| Production activation | **HALTED** |
| Dev-lane specification | **READY** |
| Dev hosted environment | **HOLD** — see [`project-folder-synology-primary-v1-dev-hosted-environment`](./project-folder-synology-primary-v1-dev-hosted-environment.md) |
| Synology-primary production readiness | **HOLD** |
| SharePoint Slice 4 | **HOLD** |

Production promotion is an **explicit outcome of successful dev evidence**, not part of the experiment.

---

## Decision

Production activation was attempted prematurely:

```text
local integration proof → production Vercel deployment
```

**Without** a hosted dev/staging environment in between. That path is **stopped**.

| Action | Status |
|--------|--------|
| `PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED` in Doppler `cg-documents/prd` | **`false`** (2026-08-03) |
| Production Vercel env sync | Flag set to `false` via `sync-hybrid-worker-vercel.mjs` |
| In-flight production deploys | Cancelled / stale local `vercel deploy` killed |
| Production promotion | **Frozen** until dev lane gates pass |

---

## Locked isolation decisions (before implementation)

These four rules are **non-negotiable** for the dev lane:

| # | Decision | Rule |
|---|----------|------|
| **I1** | **Stable dev hostname** | Use a **stable dev hostname/alias** (e.g. dedicated Vercel staging alias or fixed subdomain). **Do not** use ephemeral per-commit Vercel preview URLs as the dev authority. |
| **I2** | **Supabase isolation** | **Prefer a separate Supabase development project.** If an isolated schema is used temporarily, dev workers must be **structurally incapable** of claiming production jobs (separate DB URL, separate job tables, or claim filter by environment). |
| **I3** | **Unique dev worker token** | Issue a **unique** `PROJECT_FOLDER_PROVISION_WORKER_TOKEN` in `cg-documents/dev`. **Never** reuse the production worker token. |
| **I4** | **Server-enforced dev root** | Enforce `L:\Capital-Glass-Projects-Dev` **server-side** (env + worker config + complete-handler validation). **Do not** allow request payloads to select the storage root. |

---

## Parent work package state

| Package | Verdict |
|---------|---------|
| `project-folder-synology-primary-v1` | Slice 0–3 code **shipped**; integration proof **PASS**; productionization **HALTED** |
| `project-folder-synology-primary-v1-dev-environment` | **Active** — establish and prove hosted dev lane |

Prior proof project `e15f1184-72db-47fc-9ba1-f7e9c2f8b02c` remains sample/local only and must not drive production decisions.

---

## Recommended dev lane

| Component | Development target |
|-----------|-------------------|
| Document Center | Stable **dev alias** (not ephemeral preview URL) |
| Dashboard | Dev deployment pointed at **dev** Document Center only |
| Doppler | `cg-documents` / **`dev`** |
| Supabase | Separate development project (preferred); isolated schema only with I2 guards |
| Synology root | `L:\Capital-Glass-Projects-Dev` (WSL: `/mnt/l/Capital-Glass-Projects-Dev`) — **server-enforced (I4)** |
| Worker | `office-project-folder-provision-dev` — unique token **(I3)** |
| Project records | Clearly marked `sample` / `development` |
| SharePoint | **Disabled** until Synology dev flow passes |

### Worker env (dev)

| Variable | Dev value |
|----------|-----------|
| `DOCUMENT_LAYER_URL` | Stable dev Document Center URL **(I1)** |
| `PROJECT_FOLDER_PROVISION_WORKER_TOKEN` | **Unique** dev token — Doppler `cg-documents/dev` **(I3)** |
| `SYNOLOGY_PROJECTS_ROOT` | `L:\Capital-Glass-Projects-Dev` **(I4)** |
| `SYNOLOGY_PROJECTS_WSL_ROOT` | `/mnt/l/Capital-Glass-Projects-Dev` **(I4)** |
| `PROJECT_FOLDER_CLAIMED_BY` | e.g. `CG-WESLEYDESK-01-dev` |

### Feature flag (dev only)

| Variable | Dev | Production |
|----------|-----|------------|
| `PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED` | `true` | **`false`** until promotion |

---

## Recommended progression

1. **Commit and push** this Cross-Agent seed (active authority). — **DONE**
2. Create the **dev environment contract** in CapitalGlass-Documents; record exact URLs and project references (**no secrets**). — **DONE** (`d8826e8`)
3. Configure **`cg-documents/dev`** (flag, unique worker token, dev roots, dev Supabase). — **PARTIAL / HOLD** ([hosted-environment WP](./project-folder-synology-primary-v1-dev-hosted-environment.md))
4. Deploy **one pinned** Document Center commit to the **stable dev alias**. — **HOLD** (Vercel deploy BLOCKED)
5. Confirm `claim` and `complete` exist and **reject invalid authentication**.
6. Point **only** the dev Dashboard at dev Document Center.
7. Install the **dev worker** on WESLEYDESK.
8. Prove: several project creations, idempotent retries, worker-offline recovery, path redaction.
9. Produce a **complete dev acceptance receipt**.
10. Promote **that exact commit** to production under a **separate approved work package**.

---

## Required gates (before production)

- [x] Dev environment contract published (URLs/refs only; secrets in Doppler) — `d8826e8`
- [ ] Isolation decisions I1–I4 implemented and verified
- [ ] Document Center deployed to **stable dev alias** with Slice 0–3 routes
- [ ] `POST .../claim` and `.../complete` return auth/JSON on **dev**, not 405; invalid auth rejected
- [ ] Dev worker polls dev URL only; folders under `L:\Capital-Glass-Projects-Dev\` only
- [ ] Multiple dev Dashboard project creates succeed
- [ ] Idempotent retries, duplicate protection, worker-offline recovery documented
- [ ] Public APIs verified: no `local_path_hint` / UNC / WSL leaks
- [ ] Rollback: flag off + worker offline behavior tested on dev
- [ ] SharePoint mirror (Slice 4) still deferred
- [ ] **Dev acceptance receipt** complete
- [ ] Production promotion: separate WP, same commit SHA, pin `EXPECTED_DOCUMENT_CENTER_GIT_SHA`, one controlled prod project

---

## Pollution prevention

| Environment | Root |
|-------------|------|
| Production (future) | `L:\Capital-Glass-Projects\` |
| Development | `L:\Capital-Glass-Projects-Dev\` |

Dev folders **must not** land under the production root.

---

## Owner repos

| Repo | Role |
|------|------|
| CapitalGlass-Documents | Dev deploy, env contract, worker package |
| capital-glass-project-dashboard | Dev BFF pointed at dev Document Center |
| CapitalGlass-Office-Admin | WESLEYDESK worker install (dev instance) |
| CapitalGlass-Cross-Agent | Work package + proof receipts |

## Contract

`CapitalGlass-Documents/docs/PROJECT_FOLDER_SYNOLOGY_PRIMARY_DEV_ENVIRONMENT_CONTRACT.md` @ **`d8826e8`** (governing acceptance contract for dev deployment).

## Child work package (step #3)

[`project-folder-synology-primary-v1-dev-hosted-environment.md`](./project-folder-synology-primary-v1-dev-hosted-environment.md) — configure `cg-documents/dev`, deploy pinned SHA, run gates G1–G10.

## Artifacts

- Receipt: [`artifacts/agent-runs/project-folder-synology-primary-v1-dev-environment/receipt.json`](../artifacts/agent-runs/project-folder-synology-primary-v1-dev-environment/receipt.json)
- Parent: [`project-folder-synology-primary-v1.md`](./project-folder-synology-primary-v1.md)
