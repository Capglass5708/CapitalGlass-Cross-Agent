# Project Index

Master index of all project files in `work-progress/projects/`.

**Last updated:** 2026-08-03

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

## Active projects

| Project ID | File | Status | Owner repo(s) | Last commit | Next action |
| --- | --- | --- | --- | --- | --- |
| `ryzen9desk-managed-executor-v1` | [2026-08-03_ryzen9desk-managed-executor-v1.md](./2026-08-03_ryzen9desk-managed-executor-v1.md) | **CODE_READY_FOR_RUNNER_BOOTSTRAP** | `CG-AppBuilder-MCP`, RYZEN9DESK operator | Phase 0 hardened on WESLEY_WORK | Create runner group + environment; install runner on RYZEN9DESK; dispatch `executor-smoke` |
| `ryzen9desk-wsl2-canonical-workspace-v1` | [2026-08-03_ryzen9desk-wsl2-canonical-workspace-v1.md](./2026-08-03_ryzen9desk-wsl2-canonical-workspace-v1.md) | **BLOCKED — use managed executor** | `CG-AppBuilder-MCP`, RYZEN9DESK operator | Tooling prepared on WESLEY_WORK | Dispatch via `ryzen9desk-managed-executor-v1` (`job_profile: wsl2-canonical-setup`) |
| `wesleywork-drive-mount-task-dedupe-v1` | [2026-08-03_wesleywork-drive-mount-task-dedupe-v1.md](./2026-08-03_wesleywork-drive-mount-task-dedupe-v1.md) | **IMPLEMENTED — ready for live deploy** | CapitalGlass-Office-Admin | Code in owner repo | Elevated deploy on WESLEY_WORK: `Install-CgWesleyWorkDriveMountPersistence.ps1` + verifier; live probe pending |
| `project-folder-synology-primary-v1-dev-environment` | [project-folder-synology-primary-v1-dev-environment.md](./project-folder-synology-primary-v1-dev-environment.md) | **ACTIVE** — dev lane before production | CapitalGlass-Documents, Dashboard, Office Admin | Slice 0–3 on `main`; prod flag **off** | Deploy DC to dev URL; prove claim/complete + worker on `L:\Capital-Glass-Projects-Dev` |
| `project-folder-synology-primary-v1` | [project-folder-synology-primary-v1.md](./project-folder-synology-primary-v1.md) | **HALTED** — integration PASS; productionization halted | CapitalGlass-Documents | `440ce33` | No production work until dev-environment gates pass |
| `suite-ci-healing-v1` | [2026-08-03_suite-ci-healing-v1.md](./2026-08-03_suite-ci-healing-v1.md) | **PARTIAL PASS — Document Center secret update needed** | Product Catalog, Proposal Generator, Office Admin, Document Center | Office Admin PR #51 merged; Document Center `482561e` | Update `EXPECTED_DOCUMENT_CENTER_GIT_SHA` or redeploy Document Center from main, then rerun production smokes |
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

| Blocker | Affects | Owner | Required action |
| --- | --- | --- | --- |
| MCP restart needed for new Governance tools | `north-star-compounding-proof-v1` | Cursor / operator | Restart MCP in Cursor |
| Auto v3.2 env var contamination | `north-star-compounding-proof-v1`, full `closeout:gate` | `CG-AppBuilder-MCP` / shell | Clear `CG_AUTO_V32_WORK_PACKAGE` and `CG_AUTO_V32_MATERIAL`, rerun gate |
| Missing shared GitHub → articles builder | `docling-github-ingest-v1`, `ephemeral-unstructured-github-scrape-v1` | `Scraper` | Implement `build-github-markdown-articles.mjs` |
| Rank-9 Arch FP YOLO benchmark repo URL unknown | `revu-opening-detection-top10-v1` | Research | Pin URL before capture |
| DE opening-detection KB is shallow | `revu-opening-detection-top10-v1`, `cg-opening-locator-v1` | `Data-Extraction` | Finish vendor interpretation for pymkup, PyMuPDF, PaddleDetection; fix `unsupported_vendor` |
| Bid Composer weak on `window_schedule_row` | CE parser ROI / Bid Composer review lane | `Bid Composer` | Add window schedule import and review lane before production parser ROI is complete |
| Revu MCP production workflow locked | `revu-production-takeoff-pilot-v1` | `CapitalGlassRevu`, `Bid Composer` | Keep Cursor fixture-only use until canonical plan → approval → export → BC review pilot passes |
| Cursor opened from `/mnt/c` instead of ext4 WSL root | `wsl-mcp-cursor-doppler-promptops-hardening-v1` | Cursor / operator | Regression only: WSL default verify now PASS; use `Capital Glass Cursor (WSL Suite).lnk` |
| Vercel MCP needs auth | `wsl-mcp-cursor-doppler-promptops-hardening-v1` | Cursor / Vercel | Run `mcp_auth` when Vercel MCP is needed |
| Cloudflare stdio OAuth loopback conflict | `wsl-mcp-cursor-doppler-promptops-hardening-v1` | Cursor / Cloudflare | Keep stdio Cloudflare disabled or clear `127.0.0.1:15170` conflict |

| Document Center deployed SHA secret mismatch | `suite-ci-healing-v1`, `CapitalGlass-Documents` production smokes | `CapitalGlass-Documents` / Doppler | Update `EXPECTED_DOCUMENT_CENTER_GIT_SHA` to `f16b4ff334affe8c900cded6a6feac6480c0d848`, or redeploy from main and update the secret to that deploy SHA |

---

## Open next actions (workspace-wide)

Priority order from `work-progress/ACTIVE_WORK.md`:

| Priority | Action | Owner repo |
| --- | --- | --- |
| 1 | Restart MCP so `governance_get_compounding_capture_contract` and `governance_validate_compounding_proof` load | Cursor / local MCP |
| 2 | Clear Auto v3.2 env vars and rerun `npm run closeout:gate` | `CG-AppBuilder-MCP` |
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
