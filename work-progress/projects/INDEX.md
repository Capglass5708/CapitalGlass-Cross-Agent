# Project Index

Master index of all project files in `work-progress/projects/`.

**Last updated:** 2026-08-04 (blocker gate sweep `active-ledger-blocker-gate-sweep-v1`)

Read `AGENT_START_HERE.md` and `work-progress/ACTIVE_WORK.md` before working on any project listed here.

---

## How to use this index

| Column | Meaning |
| --- | --- |
| Project ID | Canonical work-package or Cursor project identifier |
| File | Durable project file in this folder |
| Status | Current state from ledger and project file |
| Owner repo | Primary repo where implementation happens |
| Last commit | Most recent known commit (if any) |
| Next action | Highest-priority next step |

When you create or materially update a project file:

1. Update the project file.
2. Update this index row.
3. Add a timestamped entry to `work-progress/ACTIVE_WORK.md`.

Filename pattern: `YYYY-MM-DD_<project-id>.md` — see `work-progress/projects/README.md`.

---


## Harvest packet index (manifest-derived)

<!-- HARVEST-PACKET-INDEX:START -->

_Generated from `harvest-manifest-v1.json`. Do not edit manually — run `npm run harvest:render-index`._

| Packet ID | State | Verdict | Owner repo | Project file | Next action |
| --- | --- | --- | --- | --- | --- |
| `ryzen9desk-managed-executor-v1` | RUNNER_BOOTSTRAP_CHECKPOINT_STARTED | CODE_READY_FOR_RUNNER_BOOTSTRAP | CG-AppBuilder-MCP | [2026-08-03_ryzen9desk-managed-executor-v1.md](./2026-08-03_ryzen9desk-managed-executor-v1.md) | CG-AppBuilder-MCP mission: RYZEN9DESK WSL install from main + dispatch executor-smoke receipt |
| `active-ledger-ci-path-and-hash-stability-v1` | COMPLETE | PASS | CG-AppBuilder-MCP | [2026-08-03_active-ledger-ci-path-and-hash-stability-v1.md](./2026-08-03_active-ledger-ci-path-and-hash-stability-v1.md) | None unless test:active-ledger-sync regresses on main |
| `project-folder-synology-primary-v1-dev-environment` | HOLD | CONTRACT_PASS_HOSTED_DEV_HOLD | CapitalGlass-Documents | [project-folder-synology-primary-v1-dev-hosted-environment.md](./project-folder-synology-primary-v1-dev-hosted-environment.md) | Resolve Vercel BLOCKED deploy and Supabase dev isolation (owner: CapitalGlass-Documents) |
| `cross-agent-retrieval-failover-v1.1` | ADOPTED | PASS | CapitalGlass-Cross-Agent | handoffs/CURRENT_HANDOFF.md | Recurring: use layered failover for suite status when L: unavailable |
| `wsl2-native-repo-library-migration-v1` | PARTIAL | FILESYSTEM_PASS_OPERATIONAL_CLEANUP_RECORDED | CG-AppBuilder-MCP | [2026-08-03_wsl2-native-repo-library-migration-v1.md](./2026-08-03_wsl2-native-repo-library-migration-v1.md) | Per-repo ext4 verification; RYZEN9DESK alignment via separate executor mission |
| `office-admin-ryzen9desk-managed-executor-bootstrap-v1` | INDEXED | CODE_READY_FOR_RUNNER_BOOTSTRAP | CapitalGlass-Office-Admin | [2026-08-03_office-admin-ryzen9desk-managed-executor-bootstrap-v1.md](./2026-08-03_office-admin-ryzen9desk-managed-executor-bootstrap-v1.md) | Runner bootstrap remains CG-AppBuilder-MCP mission; do not claim MANAGED_EXECUTOR_ONLINE |
| `ai-cached-sdlc-cursor-integration-go-v1` | WARN | PASS | CG-AppBuilder-MCP | [ai-cached-sdlc-cursor-integration-go-v1.md](./ai-cached-sdlc-cursor-integration-go-v1.md) | Merge feature branches; WaveRunner L catalog published — Governance review |

<!-- HARVEST-PACKET-INDEX:END -->

## Active projects

| Project ID | File | Status | Owner repo(s) | Last commit | Next action |
| --- | --- | --- | --- | --- | --- |
| `harvest-2026-08-03-cross-thread-platform-state-v1` | [2026-08-03_harvest-2026-08-03-cross-thread-platform-state-v1.md](./2026-08-03_harvest-2026-08-03-cross-thread-platform-state-v1.md) | **COMPLETE** — `HARVEST_COMPLETE` | CapitalGlass-Cross-Agent | Harvest commit pending | Recurring ingest + L: publish when operator approves |
| `ryzen9desk-managed-executor-v1` | [2026-08-03_ryzen9desk-managed-executor-v1.md](./2026-08-03_ryzen9desk-managed-executor-v1.md) | **RUNNER_BOOTSTRAP_CHECKPOINT_STARTED** — PR #268 merged | `CG-AppBuilder-MCP` | `8fe7cf05` on AppBuilder `main` | CG-AppBuilder-MCP mission: RYZEN9DESK install + `executor-smoke` → `MANAGED_EXECUTOR_ONLINE` |
| `active-ledger-ci-path-and-hash-stability-v1` | [2026-08-03_active-ledger-ci-path-and-hash-stability-v1.md](./2026-08-03_active-ledger-ci-path-and-hash-stability-v1.md) | **PASS** | `CG-AppBuilder-MCP` | `2cd8eba9`, `3fb8c9bb` | None — close unless CI regresses |
| `office-admin-ryzen9desk-managed-executor-bootstrap-v1` | [2026-08-03_office-admin-ryzen9desk-managed-executor-bootstrap-v1.md](./2026-08-03_office-admin-ryzen9desk-managed-executor-bootstrap-v1.md) | **NEEDS_OFFICE_ADMIN_INDEXING** | CapitalGlass-Office-Admin | — | Index runbook in Office Admin when ready |
| `wsl2-native-repo-library-migration-v1` | [2026-08-03_wsl2-native-repo-library-migration-v1.md](./2026-08-03_wsl2-native-repo-library-migration-v1.md) | **PARTIAL** — filesystem PASS | `CG-AppBuilder-MCP` | — | Per-repo ext4 verification; RYZEN9DESK alignment separate |
| `ryzen9desk-wsl2-canonical-workspace-v1` | [2026-08-03_ryzen9desk-wsl2-canonical-workspace-v1.md](./2026-08-03_ryzen9desk-wsl2-canonical-workspace-v1.md) | **BLOCKED — use managed executor** | `CG-AppBuilder-MCP`, RYZEN9DESK operator | Tooling prepared on WESLEY_WORK | Dispatch via `ryzen9desk-managed-executor-v1` (`job_profile: wsl2-canonical-setup`) |
| `wesleywork-drive-mount-task-dedupe-v1` | [2026-08-03_wesleywork-drive-mount-task-dedupe-v1.md](./2026-08-03_wesleywork-drive-mount-task-dedupe-v1.md) | **IMPLEMENTED — ready for live deploy** | CapitalGlass-Office-Admin | Code in owner repo | Elevated deploy on WESLEY_WORK: `Install-CgWesleyWorkDriveMountPersistence.ps1` + verifier; live probe pending |
| `project-folder-synology-primary-v1-dev-hosted-environment` | [project-folder-synology-primary-v1-dev-hosted-environment.md](./project-folder-synology-primary-v1-dev-hosted-environment.md) | **HOLD** — step #3 hosted dev | CapitalGlass-Documents, WESLEYDESK | Contract `d8826e8`; partial Doppler dev | Fix Vercel BLOCKED deploy; separate Supabase dev; alias `documents-dev`; gates G1–G10 |
| `project-folder-synology-primary-v1-dev-environment` | [project-folder-synology-primary-v1-dev-environment.md](./project-folder-synology-primary-v1-dev-environment.md) | **ACTIVE** — dev lane before production | CapitalGlass-Documents, Dashboard, Office Admin | Slice 0–3 on `main`; prod flag **off** | Child WP step #3; then Dashboard dev + worker |
| `project-folder-synology-primary-v1` | [project-folder-synology-primary-v1.md](./project-folder-synology-primary-v1.md) | **HALTED** — integration PASS; productionization halted | CapitalGlass-Documents | `440ce33` | No production work until dev-environment gates pass |
| `suite-ci-healing-v1` | [2026-08-03_suite-ci-healing-v1.md](./2026-08-03_suite-ci-healing-v1.md) | **PASS pending smoke rerun** — Doppler SHA aligned `f16b4ff` | Product Catalog, Proposal Generator, Office Admin, Document Center | Office Admin PR #51 merged; Doppler `cg-documents/prd` updated 2026-08-04 | Rerun Document Center production smokes; sync GitHub secret if apply script not run |
| `cross-agent-registry-onboard-v1` | [2026-08-02_cross-agent-registry-onboard-v1.md](./2026-08-02_cross-agent-registry-onboard-v1.md) | Complete — closeout PASS | `CG-AppBuilder-MCP` | `38a162da` / `48a1bff1` | Recurring registry maintenance only |
| `cross-agent-structured-ledger-projection-v1` | [2026-08-02_cross-agent-structured-ledger-projection-v1.md](./2026-08-02_cross-agent-structured-ledger-projection-v1.md) | **MILESTONE PASS** — Phases 0–3 operational | `CG-Platform-Governance-MCP`, `CG-AppBuilder-MCP` | AppBuilder `63dbeb8c`; Governance `a5ce4c3` | Recurring ingest + drift probe after ledger updates |
| `wsl-mcp-cursor-doppler-promptops-hardening-v1` | [2026-08-02_wsl-mcp-cursor-doppler-promptops-hardening-v1.md](./2026-08-02_wsl-mcp-cursor-doppler-promptops-hardening-v1.md) | **PASS — Cursor WSL default active; `mcp:repair:cursor` PASS** | `CG-AppBuilder-MCP`, `Cursor-MCP-Kit`, Cursor MCP, Doppler | WSL default verify PASS; `mcp:repair:cursor` PASS | Use WSL Suite shortcut; optionally commit/push ext4 changes; handle Vercel / Cloudflare / `mcp:attest` separately |
| `z-ai-cache-single-canonical-authority-v1` | [2026-08-02_z-ai-cache-single-canonical-authority-v1.md](./2026-08-02_z-ai-cache-single-canonical-authority-v1.md) | **Complete — three-host aligned** | `CG-AppBuilder-MCP` | `b3ae65d2` | Recurring `ai-cache-z-master:three-host-status` probe only |
| `z-drive-disconnect-recurrence-v1` | [2026-08-02_z-drive-disconnect-recurrence-v1.md](./2026-08-02_z-drive-disconnect-recurrence-v1.md) | **Active — pre-session gate** | CapitalGlass-Office-Admin | FI + Office Admin script | ForceRemap Z: before material sessions on WESLEY_WORK |
| `active-ledger-drain-and-intelligence-hub-sync-v1` | [2026-08-02_active-ledger-drain-and-intelligence-hub-sync-v1.md](./2026-08-02_active-ledger-drain-and-intelligence-hub-sync-v1.md) | **Complete — closeout PASS** | Multi-repo | AppBuilder `cd4a9005` | Recurring L: publish only |
| `north-star-compounding-proof-v1` | [2026-08-01_north-star-compounding-proof-v1.md](./2026-08-01_north-star-compounding-proof-v1.md) | Pushed — evidence receipts on `origin/main` | `CG-Platform-Governance-MCP` (authority), `CG-AppBuilder-MCP` (execution) | Governance `8ebcdf4`; AppBuilder `3772d491` | Restart MCP; clear Auto v3.2 env vars and rerun `closeout:gate`; begin `north-star-compounding-vertical-pilot-v1` |
| `agent-research-library-layout-v1` | [2026-08-01_agent-research-library-layout-v1.md](./2026-08-01_agent-research-library-layout-v1.md) | Pilot 9/10 operational | `Data-Extraction`, `Scraper` | `Data-Extraction 2190944`; `Scraper 0111837`; layout `b1d2e42`, `3e09e4c` | Optional bounded n8n capture; agent review before any `10-approved-for-use/` promotion |
| `docling-github-ingest-v1` | [2026-08-01_docling-github-ingest-v1.md](./2026-08-01_docling-github-ingest-v1.md) | Publish optimized — `manifest-only-fast` default | `Scraper`, `Data-Extraction` | Cross-Agent `2ecb2f5` | Use L: compact / manifest entry points; full publish only when all 1,076 pages must be mirrored |
| `ephemeral-unstructured-github-scrape-v1` | [2026-08-01_ephemeral-unstructured-github-scrape-v1.md](./2026-08-01_ephemeral-unstructured-github-scrape-v1.md) | Scrape complete — corpus publish pending | `Scraper` (capture), `Data-Extraction` (publish) | Cross-Agent `1ff3908`, `5abae0f`, `78bbdde` | Implement shared `build-github-markdown-articles.mjs`; publish Unstructured corpus; run `knowledge:build` |
| `bid-composer-upgrade-roadmap-v1` | [2026-08-01_bid-composer-upgrade-roadmap-v1.md](./2026-08-01_bid-composer-upgrade-roadmap-v1.md) | Phase 1 implemented; shared-dev migration pending | `CapitalGlass-BidComposer` | Cross-Agent `ed1fbea`; migration `20260801120000_bid_revision_control_and_pipeline.sql` | Apply shared DB migration or start `bid-composer-phase2-document-authority-v1` |
| `revu-opening-detection-top10-v1` | [2026-08-01_revu-opening-detection-top10-v1.md](./2026-08-01_revu-opening-detection-top10-v1.md) | Pilot 8/10 operational; Rosewood lane status corrected | `Computer Estimator` (detection), `CapitalGlassRevu` (markup), `Data-Extraction`, `Scraper`, `Bid Composer` | `Data-Extraction 38e5c58`; `Scraper 36cd354`; Cross-Agent `ad12b11`, `531fd9b` | Do not treat Rosewood as proposal-ready; Revu markup controlled, CE parse stalled, real BC bid not started |

---

## Status legend

| Status | Meaning |
| --- | --- |
| Planned | Scoped but not started |
| Active | In progress |
| Blocked | Waiting on dependency or operator action |
| Complete | Delivered locally; may still need commit/push |
| Pushed | Committed and pushed to remote |
| Pilot operational | Partial rollout verified; optional follow-ups remain |

---

## Projects by owner repo

Use this when you need to find all work touching a specific repo.

### CG-Platform-Governance-MCP

| Project ID | Status | Next action |
| --- | --- | --- |
| `north-star-compounding-proof-v1` | Pushed | Begin `north-star-compounding-vertical-pilot-v1` |
| `active-ledger-drain-and-intelligence-hub-sync-v1` | Complete — closeout PASS | Recurring L: publish after ledger edits |

Recommended follow-on work packages (not yet project files):

- `north-star-compounding-vertical-pilot-v1` — harvest → Z: → next-mission retrieval
- `platform-governance-phase4-registries-v1` — program/mission/exception registries

### CapitalGlass-Office-Admin

| Project ID | Status | Next action |
| --- | --- | --- |
| `wesleywork-drive-mount-task-dedupe-v1` | IMPLEMENTED — live deploy pending | Elevated deploy + verifier on WESLEY_WORK |
| `z-drive-disconnect-recurrence-v1` | Active — pre-session gate | ForceRemap Z: before material sessions |

### CG-AppBuilder-MCP

| Project ID | Status | Next action |
| --- | --- | --- |
| `suite-ci-healing-v1` | Partial PASS | After Document Center SHA alignment, inspect stale AppBuilder PRs #254, #252, #228, #227, #216 |
| `north-star-compounding-proof-v1` | Pushed | Restart MCP; clear Auto v3.2 env vars; rerun `closeout:gate` |
| `cross-agent-registry-onboard-v1` | Complete — pushed | Recurring maintenance |
| `cross-agent-structured-ledger-projection-v1` | **MILESTONE PASS** | Recurring ingest + drift probe |
| `wsl-mcp-cursor-doppler-promptops-hardening-v1` | PASS — Cursor WSL default active; `mcp:repair:cursor` PASS | Use WSL Suite shortcut; optionally commit/push ext4 changes; investigate Vercel auth / Cloudflare / `mcp:attest` separately |
| `z-ai-cache-single-canonical-authority-v1` | Complete — three-host aligned | Recurring `ai-cache-z-master:three-host-status` probe only |
| `active-ledger-drain-and-intelligence-hub-sync-v1` | Complete — closeout PASS | Recurring L: publish after ledger edits |

### Data-Extraction

| Project ID | Status | Next action |
| --- | --- | --- |
| `active-ledger-drain-and-intelligence-hub-sync-v1` | Phases 0–3 complete | Recurring `publish-active-work-ledger` after ledger updates |
| `agent-research-library-layout-v1` | Pilot 9/10 operational | Agent review before `10-approved-for-use/` promotion |
| `docling-github-ingest-v1` | Publish optimized | Add Docling vendor interpreter; warm retrieval ladder |
| `ephemeral-unstructured-github-scrape-v1` | Scrape complete | Corpus publish after shared articles builder exists |

### Scraper

| Project ID | Status | Next action |
| --- | --- | --- |
| `agent-research-library-layout-v1` | Pilot 9/10 operational | Optional bounded n8n capture |
| `docling-github-ingest-v1` | Publish optimized | GitHub bulk capture + articles builder if not done |
| `ephemeral-unstructured-github-scrape-v1` | Scrape complete | Shared `build-github-markdown-articles.mjs` |
| `revu-opening-detection-top10-v1` | Pilot 8/10 operational | Deepen vendor KB for pymkup, PyMuPDF, PaddleDetection; keep proposal-stack out of CE parser scope |

### Bid Composer

| Project ID | Status | Next action |
| --- | --- | --- |
| `bid-composer-upgrade-roadmap-v1` | Phase 1 implemented | Apply shared DB migration; choose Phase 2 document authority or Phase 3 parser normalization |

### Computer Estimator / CapitalGlassRevu

| Project ID | Status | Next action |
| --- | --- | --- |
| `revu-opening-detection-top10-v1` | Rosewood lane status corrected | Build `cg-opening-locator-v1`; if marking Rosewood in Revu, start with controlled sheet choice and do not assume CE parse or BC bid exists |

---

## Cross-cutting blockers

Indexed for agent preflight (`active-work-blockers.json`). Domain blockers are gated under owner work packages; operator items are not indexed here.

| Blocker | Affects | Owner | Required action |
| --- | --- | --- | --- |
| Missing shared GitHub → articles builder | `docling-github-ingest-v1`, `ephemeral-unstructured-github-scrape-v1` | `Scraper` | Implement `build-github-markdown-articles.mjs` — gated under owner WPs |
| Rank-9 Arch FP YOLO benchmark repo URL unknown | `revu-opening-detection-top10-v1` | Research | Pin URL before capture — gated under `revu-opening-detection-top10-v1` |
| DE opening-detection KB is shallow | `revu-opening-detection-top10-v1`, `cg-opening-locator-v1` | `Data-Extraction` | Finish vendor interpretation; fix `unsupported_vendor` — gated under opening-detection WPs |
| Bid Composer weak on `window_schedule_row` | CE parser ROI / Bid Composer review lane | `Bid Composer` | Add window schedule import and review lane — gated under Bid Composer roadmap |
| Revu MCP production workflow locked | `revu-production-takeoff-pilot-v1` | `CapitalGlassRevu`, `Bid Composer` | Policy lock until plan → approval → export → BC review pilot passes |

---

## Cleared blockers (2026-08-04 — `active-ledger-blocker-gate-sweep-v1`)

| Blocker | Gate / evidence | Status |
| --- | --- | --- |
| Auto v3.2 env var contamination | `npm run check:auto-v32-session-env-policy` PASS; shell + Doppler clean | **CLEARED** |
| Document Center deployed SHA secret mismatch | Doppler `cg-documents/prd` `EXPECTED_DOCUMENT_CENTER_GIT_SHA` → `f16b4ff…` | **CLEARED** — rerun production smokes |
| Cursor opened from `/mnt/c` instead of ext4 WSL root | `npm run cursor:wsl-default:verify` PASS; operating rule only | **CLEARED** (regression watch) |

Receipt: `artifacts/agent-runs/active-ledger-blocker-gate-sweep-v1/blocker-gate-receipt.json`

---

## Operator checklist (not indexed as blockers)

| Item | When | Owner |
| --- | --- | --- |
| Restart MCP after Governance tool updates | Before `north-star-compounding-proof-v1` compounding tools | Cursor / operator |
| Vercel MCP auth | Only when Vercel connector needed | Cursor / Vercel — `mcp_auth` |
| Cloudflare stdio OAuth loopback | Only when Cloudflare MCP needed | Keep stdio disabled or clear `127.0.0.1:15170` |

---

## Open next actions (workspace-wide)

Priority order from `work-progress/ACTIVE_WORK.md`:

| Priority | Action | Owner repo |
| --- | --- | --- |
| 1 | Rerun Document Center production smokes after SHA pin | `CapitalGlass-Documents` |
| 2 | Restart MCP so Governance compounding tools load (operator checklist) | Cursor / local MCP |
| 3 | Run `north-star-compounding-vertical-pilot-v1` | Governance + AppBuilder |
| 4 | Run `platform-governance-phase4-registries-v1` | `CG-Platform-Governance-MCP` |
| 5 | Scope `cg-opening-locator-v1` parser package from Revu/Docling evidence | `Computer Estimator`, `Data-Extraction` |
| 6 | Scope `revu-production-takeoff-pilot-v1` after fixture gates | `CapitalGlassRevu`, `Bid Composer` |
| 7 | Keep ledger updated as work proceeds | `CapitalGlass-Cross-Agent` |

---

## Index maintenance rule

When adding a project:

```text
1. Create  work-progress/projects/YYYY-MM-DD_<project-id>.md
2. Add row to this INDEX.md (Active projects + By owner repo)
3. Add entry to work-progress/ACTIVE_WORK.md
4. Commit with: docs: add <project-id> project file
```

When closing a project:

1. Set status to Complete or Pushed in project file and this index.
2. Move detailed history to project file update log; keep ledger entry in `ACTIVE_WORK.md`.
3. Optionally archive superseded notes to `archive/YYYY-MM/` when that folder is in use.
