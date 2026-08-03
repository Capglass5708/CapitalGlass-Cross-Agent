# Work package: project-folder-synology-primary-v1-production-promotion

**Verdict:** `PRODUCTION_PROMOTION_HOLD` — scaffolded; awaiting operator approval  
**Parent:** [`project-folder-synology-primary-v1.md`](./project-folder-synology-primary-v1.md)  
**Contract:** `CapitalGlass-Documents/docs/PROJECT_FOLDER_SYNOLOGY_PRIMARY_PRODUCTION_PROMOTION_CONTRACT.md`  
**Promotion candidate SHA:** `e3fe6ec`  
**Last updated:** 2026-08-03

---

## Status

| Dimension | State |
|-----------|--------|
| Dev reproducibility | **PASS** — `PROMOTION_CANDIDATE_READY` (`4f22aca`) |
| Production promotion | **HOLD** — not started |
| Production activation | **HALTED** |
| Production touched | **NO** (`f16b4ff` baseline) |

---

## Operator checklist (before Phase 1)

- [ ] **R3** — Record named approver + date in [`receipt.json`](../artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json)
- [ ] Confirm promotion SHA is **`e3fe6ec`** only (not `7c0b76f` alone)
- [ ] Confirm `PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=false` on `cg-documents/prd`
- [ ] Confirm unique **production** `PROJECT_FOLDER_PROVISION_WORKER_TOKEN` (not dev token)
- [ ] Confirm Vercel collaboration policy remains `manual-approval`
- [ ] Confirm dev lane witness: `documents-dev` @ `e3fe6ec`, dev worker RUNNING

---

## Phase summary

| Phase | Action | Flag on prd? |
|-------|--------|--------------|
| 0 | Preflight + local gates from `e3fe6ec` checkout | No |
| 1 | Production deploy `documents.capitalglasstxapps.com` | No |
| 2 | Apply migrations to `wvidyxufvcrtezzkwwse` | No |
| 3 | Install `CapitalGlass-Office-ProjectFolder-Provision` (prd) | No |
| 4 | Enable `PROJECT_FOLDER_SYNOLOGY_PRIMARY_ENABLED=true` on prd | **Yes** |
| 5 | One controlled production new-project E2E | Yes |
| 6 | P1–P10 gates | Yes |
| 7 | Rollback proof | Toggle for test |
| 8 | Evidence closeout | Per operator |

Full sequence: production promotion contract §5.

---

## Production gates (P1–P10)

| Gate | Status |
|------|--------|
| P1–P10 | **HOLD** — see [`gate-results.json`](../artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/gate-results.json) |

---

## Key commands (names only; run from `CapitalGlass-Documents` @ `e3fe6ec`)

```bash
# Preflight (local)
npm run typecheck
npm run test:project-folder-synology
npm run test:project-folder-worker-config
npm run build

# After prd env wired — schema drift
doppler run -p cg-documents -c prd -- npm run check:project-folder-synology-migration
```

WESLEYDESK production worker (Administrator PowerShell):

```powershell
cd C:\Developer\repos\CapitalGlass-Documents
powershell -ExecutionPolicy Bypass -File scripts\deploy-wesleydesk-project-folder-provision-worker.ps1 `
  -DopplerConfig prd `
  -ServiceName CapitalGlass-Office-ProjectFolder-Provision `
  -SkipGitPull
```

**Do not** stop or reconfigure `CapitalGlass-Office-ProjectFolder-Provision-Dev` during promotion.

---

## Lineage

| Role | SHA / ref |
|------|-----------|
| Contract authority | `d8826e8` |
| Promotion candidate | **`e3fe6ec`** |
| Dev reproducibility evidence | `4f22aca` |
| Dev accepted (historical) | `7c0b76f` / `8ecf43e` |
| Production baseline | `f16b4ff` |
| Dev Supabase | `mazvavlshjshwklcvxaw` |
| Production Supabase | `wvidyxufvcrtezzkwwse` |

---

## Artifacts

- [`receipt.json`](../artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/receipt.json)
- [`gate-results.json`](../artifacts/agent-runs/project-folder-synology-primary-v1-production-promotion/gate-results.json)

---

## Final verdicts (when executed)

| Verdict | When |
|---------|------|
| `PRODUCTION_PROMOTION_ACCEPTED` | P1–P10 PASS + controlled project proved |
| `PRODUCTION_PROMOTION_HOLD` | External blocker |
| `PRODUCTION_PROMOTION_FAILED` | Unresolved implementation failure |

---

## Related

- [`project-folder-synology-primary-v1-dev-reproducibility-hardening.md`](./project-folder-synology-primary-v1-dev-reproducibility-hardening.md)
- [`project-folder-synology-primary-v1-dev-hosted-environment.md`](./project-folder-synology-primary-v1-dev-hosted-environment.md)
