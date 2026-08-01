# Project: agent-research-library-layout-v1

## Summary

Scaffold the Z:/L:/Intelligence Hub folder layout for the Scraper → Data-Extraction → agent research library pipeline so captured GitHub, website, vendor-docs, and extracted knowledge can be stored, verified, and consumed by agents under Northstar-style storage discipline.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | agent-research-library-layout-v1 |
| Work package | scraper-data-extraction-agent-research-library-layout |
| Date opened | 2026-08-01 |
| Source | Wesley / Cursor / ChatGPT |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | Data-Extraction / Northstar storage policy |
| Execution repo | Data-Extraction / Scraper |
| Status | Pushed |

## Repositories involved

| Repo | Role |
| --- | --- |
| Data-Extraction | Scaffolds and verifies Z:/L:/Hub ingestion folder layout; extends NAS scaffold and L: extraction directories |
| Scraper | Aligns Pageflows capture root away from retired `Z:\TEMP L DRIVE` path |
| CapitalGlass-Cross-Agent | Meeting repo: durable notes, commits, blockers, next actions |

## Authority / ownership rule

Data-Extraction owns the scaffold/verify contract for the research-library layout. Scraper owns raw capture path defaults and must write into canonical Scraper-Corpus lanes. CapitalGlass-Cross-Agent only records project state and does not store implementation code or corpus contents.

## Valuable decisions

| Date/time | Decision | Reason |
| --- | --- | --- |
| 2026-08-01 CT | Keep new numbered lanes alongside legacy paths | Avoid risky migration while allowing writers to move incrementally via aliases documented in the manifest |
| 2026-08-01 CT | Preserve existing `packages/`, `vendor-docs/`, and Intelligence Hub operations lanes | Existing handoff/vendor paths remain active and should not be moved blindly |
| 2026-08-01 CT | Retire `Z:\TEMP L DRIVE` as Pageflows default | Canonical capture root is now `Z:\Capital-Glass-Research\Scraper-Corpus\websites\pageflows` |

## Delivered / reported complete

- 58 new folders created across Z:, L:, and Intelligence Hub.
- Verification reported `ALL_A_PLUS`.
- Z: Scraper-Corpus lanes created: `00-source-registry` through `09-evidence-hashes`, plus `github-research/` and `web-research/`.
- L: Research extraction lanes created, including `raw-imports`, `normalized-text`, `extracted-json`, and `agent-review-queue`.
- Existing `scraper-handoff-intake` and `exports` were preserved.
- L: Intelligence Hub lanes created: `00-master-index` through `12-watchlist`, including `08-app-opportunity-map` and `10-approved-for-use`.
- README + INDEX files added on the two gate folders: `08-app-opportunity-map` and `10-approved-for-use`.
- Data-Extraction scaffold/verify commands added.
- Layout wired into `synology:scaffold-nas-layout`.
- Scraper Pageflows retired default path fixed.

## Evidence / artifact paths

| Artifact | Path / link | Status |
| --- | --- | --- |
| Layout manifest | `Z:\Capital-Glass-Research\Scraper-Corpus\00-control\AGENT-RESEARCH-LIBRARY-LAYOUT.json` | Written |
| Z: Scraper-Corpus source registry | `Z:\Capital-Glass-Research\Scraper-Corpus\00-source-registry` | Created |
| Z: Scraper-Corpus evidence hashes | `Z:\Capital-Glass-Research\Scraper-Corpus\09-evidence-hashes` | Created |
| L: app opportunity map | `L:\Capital-Glass-Intelligence-Hub\08-app-opportunity-map` | Created with gate docs |
| L: approved-for-use gate | `L:\Capital-Glass-Intelligence-Hub\10-approved-for-use` | Created with gate docs |

## Verification

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm run agent-research-library:scaffold-layout` | Complete | Creates missing folders idempotently |
| `npm run agent-research-library:verify-layout -- --strict` | `ALL_A_PLUS` | 58 folders verified across Z:, L:, and Intelligence Hub |
| Data-Extraction push | Pushed | Commit `b1d2e42` to `origin/main` |
| Scraper push | Pushed | Commit `3e09e4c` to `origin/feat/vendor-docs-markdown-capture-v1` |

## Commits / PRs

| Repo | Commit / PR | Status |
| --- | --- | --- |
| Data-Extraction | `b1d2e42` — `feat(agent-research-library): scaffold Z/L/Hub ingestion folder layout` | Pushed to `origin/main` |
| Scraper | `3e09e4c` — `fix(pageflows): retire TEMP L DRIVE default capture root` | Pushed to `origin/feat/vendor-docs-markdown-capture-v1` |
| CapitalGlass-Cross-Agent | Pending | Project file and ledger update |

## Data-Extraction commit scope

Included in `b1d2e42`:

- `scripts/lib/agent-research-library/*`
- `scripts/agent-research-library/*`
- `package.json` new npm scripts
- `scripts/lib/paths.mjs` L: extraction directories
- `scripts/synology/scaffold-nas-layout.mjs`

Still unstaged / not in `b1d2e42` per reported closeout:

- application-bible edits
- docling scripts
- railway run artifacts
- `constants.mjs`
- other unstaged work not listed in the closeout

## Scraper commit scope

Included in `3e09e4c`:

- `ui-capture/scripts/lib/pageflows-env.mjs`
- `ui-capture/README.md`

Still unstaged / not in `3e09e4c` per reported closeout:

- Unstructured capture lane work
- Docling capture lane work
- related `package.json`, scripts, configs, and artifacts

## Blockers / warnings

| Blocker | Owner repo | Required action |
| --- | --- | --- |
| Remaining Scraper vendor-docs work is unstaged | Scraper | Decide whether to create a second commit for Unstructured/Docling capture lane |
| Remaining Data-Extraction Bible/Docling changes are unstaged | Data-Extraction | Decide whether to commit separately after review |
| Capture artifacts may be large | Scraper / Data-Extraction | Keep heavy corpus artifacts out of coordination repo and use corpus/storage lanes |

## Next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | Decide whether to make second Scraper commit for remaining Unstructured/Docling vendor-docs work | Scraper | Pending Wesley decision |
| 2 | Decide whether to make Data-Extraction commit for Bible/Docling changes | Data-Extraction | Pending Wesley decision |
| 3 | Register 10 pilot URLs/sources in `00-source-registry` | Scraper / Data-Extraction | Pending |
| 4 | Run capture → handoff → `knowledge:build` → `08-app-opportunity-map` pilot | Scraper / Data-Extraction | Pending |

## Reusable lessons

- Separate scaffold/layout commits from vendor-specific capture or Bible changes; it keeps review scope clean.
- Retired storage roots should be fixed in both code defaults and docs so future captures do not drift back to `TEMP L DRIVE`.
- Keep unstaged vendor-docs work as a separate commit line from core folder-layout infrastructure.

## Update log

### 2026-08-01 CT — Cursor / Wesley / ChatGPT

- Recorded pushed Data-Extraction commit `b1d2e42` for the agent research library folder layout.
- Recorded pushed Scraper commit `3e09e4c` for Pageflows path alignment.
- Captured remaining unstaged work and next decision point for second commits.
