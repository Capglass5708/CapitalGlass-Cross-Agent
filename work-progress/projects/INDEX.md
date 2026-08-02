# Project Index

Master index of all project files in `work-progress/projects/`.

**Last updated:** 2026-08-02

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
| `cross-agent-registry-onboard-v1` | [2026-08-02_cross-agent-registry-onboard-v1.md](./2026-08-02_cross-agent-registry-onboard-v1.md) | Complete — pushed | `CG-AppBuilder-MCP` | AppBuilder `38a162da` | Begin `cross-agent-structured-ledger-projection-v1` (Governance schema first) |
| `active-ledger-drain-and-intelligence-hub-sync-v1` | [2026-08-02_active-ledger-drain-and-intelligence-hub-sync-v1.md](./2026-08-02_active-ledger-drain-and-intelligence-hub-sync-v1.md) | Phase 0 PASS — Governance approval pending | `CapitalGlass-Cross-Agent`, `CG-Platform-Governance-MCP`, `CG-AppBuilder-MCP`, `Data-Extraction` | Pending | Approve Governance contract; Phase 1 export after approval |
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
| `active-ledger-drain-and-intelligence-hub-sync-v1` | Phase 0 PASS | Approve Governance contract; Phase 2 capture after Phase 1 |

Recommended follow-on work packages (not yet project files):

- `north-star-compounding-vertical-pilot-v1` — harvest → Z: → next-mission retrieval
- `platform-governance-phase4-registries-v1` — program/mission/exception registries

### CG-AppBuilder-MCP

| Project ID | Status | Next action |
| --- | --- | --- |
| `north-star-compounding-proof-v1` | Pushed | Restart MCP; clear Auto v3.2 env vars; rerun `closeout:gate` |
| `cross-agent-registry-onboard-v1` | Complete — pushed | Begin `cross-agent-structured-ledger-projection-v1` |
| `active-ledger-drain-and-intelligence-hub-sync-v1` | Phase 0 PASS | Approve Governance contract; Phase 1 export in worktree |

### Data-Extraction

| Project ID | Status | Next action |
| --- | --- | --- |
| `active-ledger-drain-and-intelligence-hub-sync-v1` | Phase 0 PASS | Approve Governance contract; extend sync after Phase 1 |
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
