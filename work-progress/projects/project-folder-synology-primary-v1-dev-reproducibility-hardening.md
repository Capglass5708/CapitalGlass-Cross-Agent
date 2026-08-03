# Work package: project-folder-synology-primary-v1-dev-reproducibility-hardening

**Verdict:** `PROMOTION_CANDIDATE_READY`  
**Parent:** [`project-folder-synology-primary-v1-dev-hosted-environment.md`](./project-folder-synology-primary-v1-dev-hosted-environment.md)  
**Last updated:** 2026-08-03

---

## Lineage

| Role | SHA |
|------|-----|
| Contract authority | `d8826e8` |
| Accepted dev (prior) | `7c0b76f` |
| **Reproducible candidate** | **`e3fe6ec`** |
| Cross-Agent accepted evidence | `8ecf43e` |
| Production (unchanged) | `f16b4ff` |

`PRODUCTION_ACTIVATION=HALTED` · `PRODUCTION_TOUCHED=NO`

---

## Phase 1 — Canonical worker

| Item | Value |
|------|--------|
| Entry | `workers/office-project-folder-provision/scripts/run-service.mjs` |
| Env parsing | `src/loadDotEnv.ts` (Node; no PowerShell interpolation) |
| Startup validation | `src/validateConfig.ts` (dev root/host isolation, traversal reject) |
| NSSM | `node.exe` → `run-service.mjs --env-file .env` |
| Dev service | `CapitalGlass-Office-ProjectFolder-Provision-Dev` |

Local-only `run-worker-loop.mjs` removed from WESLEYDESK.

---

## Phase 2 — Database authority

| Item | Value |
|------|--------|
| Migration | `20260803140000_project_folder_synology_primary_support_tables.sql` |
| Drift check | `npm run check:project-folder-synology-migration` |
| Staging ref | `mazvavlshjshwklcvxaw` (applied + verified) |
| Production | **Not applied** |

Manual `scripts/dev-bootstrap/staging-synology-project-folder-prereq.sql` superseded (pointer only).

---

## Phase 3 — Deterministic tests

| Command | Exit |
|---------|------|
| `npm run typecheck` | 0 |
| `npm run test:project-folder-worker-config` | 0 (4 tests) |
| `npm run test:project-folder-synology` | 0 (2 tests) |
| `doppler run -p cg-documents -c dev -- npm run check:project-folder-synology-migration` | 0 |
| `npm run build` | 0 |

**Do not use:** `node --test tests/project-folder-synology-primary.test.ts` (exit 1 — missing tsx/CSS stub path).

**Background suite ambiguity:** `npm test -- … | tail -15` reported exit 0 because `tail` succeeded while a nested unit test failed; CI uses `npm run test:unit` → `run-all-unit-tests.mjs` with `tsx`.

---

## Phase 4–5 — Deploy + E2E

| Item | Value |
|------|--------|
| Deployment | `dpl_GEBGFvHU4vpZhqy1tkzF3rfdXBSV` READY |
| Alias | `https://documents-dev.capitalglasstxapps.com` → `e3fe6ec` |
| Fresh E2E project | `a877adf9-6669-411a-8757-aa7ae9b29d17` |
| Job | `d10f536e-3a66-4aeb-a647-ef61f876d634` succeeded |
| Folder | `L:\Capital-Glass-Projects-Dev\REPRO-20260803 - Repro Proof` |

G1–G10: **ALL PASS** — see [`gate-results.json`](../artifacts/agent-runs/project-folder-synology-primary-v1-dev-reproducibility-hardening/gate-results.json).

---

## Artifacts

- [`receipt.json`](../artifacts/agent-runs/project-folder-synology-primary-v1-dev-reproducibility-hardening/receipt.json)
- [`gate-results.json`](../artifacts/agent-runs/project-folder-synology-primary-v1-dev-reproducibility-hardening/gate-results.json)

---

## Next step

Open **production promotion** work package: [`project-folder-synology-primary-v1-production-promotion.md`](./project-folder-synology-primary-v1-production-promotion.md) (SHA `e3fe6ec`). Contract: `CapitalGlass-Documents/docs/PROJECT_FOLDER_SYNOLOGY_PRIMARY_PRODUCTION_PROMOTION_CONTRACT.md`.
