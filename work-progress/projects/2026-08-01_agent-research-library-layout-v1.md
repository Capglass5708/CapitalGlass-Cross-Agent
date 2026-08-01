# Project: agent-research-library-layout-v1

## Summary

Scaffold the Z:/L:/Intelligence Hub folder layout for the Scraper → Data-Extraction → agent research library pipeline so captured GitHub, website, vendor-docs, and extracted knowledge can be stored, verified, and consumed by agents under Northstar-style storage discipline.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | agent-research-library-layout-v1 |
| Work package | `scraper-data-extraction-agent-research-library-layout`; pilot registry `proposal-stack-top10-v1` |
| Date opened | 2026-08-01 |
| Source | Wesley / Cursor / ChatGPT |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | Data-Extraction / Northstar storage policy |
| Execution repo | Data-Extraction / Scraper |
| Status | Pilot 9/10 operational |

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
- Scraper proposal-stack pilot: GitHub batch capture, article build, manifest-only Z: publish, bounded n8n config (deferred).
- Data-Extraction proposal-stack pilot: source registry publish, handoff package, ingest/ack, nine `knowledge:build` runs.
- Registry `proposal-stack-top10-v1` published to Z: `00-source-registry` and L: `08-app-opportunity-map` / `01-source-catalog`.
- Handoff `PKG-PROPOSAL-STACK-PILOT-V1` accepted (9 sources; ranks 1–7, 8 Unstructured, 9 AgencyOS).
- Nothing promoted to `10-approved-for-use/` yet — STUDY/WATCH verdicts only.

## Evidence / artifact paths

| Artifact | Path / link | Status |
| --- | --- | --- |
| Layout manifest | `Z:\Capital-Glass-Research\Scraper-Corpus\00-control\AGENT-RESEARCH-LIBRARY-LAYOUT.json` | Written |
| Z: Scraper-Corpus source registry | `Z:\Capital-Glass-Research\Scraper-Corpus\00-source-registry` | Created |
| Z: Scraper-Corpus evidence hashes | `Z:\Capital-Glass-Research\Scraper-Corpus\09-evidence-hashes` | Created |
| L: app opportunity map | `L:\Capital-Glass-Intelligence-Hub\08-app-opportunity-map` | Created with gate docs |
| L: approved-for-use gate | `L:\Capital-Glass-Intelligence-Hub\10-approved-for-use` | Created with gate docs |
| Z: proposal-stack registry | `Z:\Capital-Glass-Research\Scraper-Corpus\00-source-registry\proposal-stack-top10-v1.json` | Published |
| Z: proposal-stack crawl queue | `Z:\Capital-Glass-Research\Scraper-Corpus\01-crawl-queue\proposal-stack-top10-v1-queue.json` | Published |
| Z: github-research manifests | `Z:\Capital-Glass-Research\Scraper-Corpus\github-research\repos\{slug}\02-manifests\` | Nine slugs published (manifest-only) |
| L: opportunity map index | `L:\Capital-Glass-Intelligence-Hub\08-app-opportunity-map\proposal-stack-top10-index.json` | Published |
| DE handoff package | `PKG-PROPOSAL-STACK-PILOT-V1` | ACK_ACCEPTED |
| DE knowledge builds | `Data-Extraction/artifacts/data-extraction-2/proposal-stack-pilot/KB-*` | Nine builds (repo-local, not in meeting repo) |

## Verification

| Command / check | Result | Notes |
| --- | --- | --- |
| `npm run agent-research-library:scaffold-layout` | Complete | Creates missing folders idempotently |
| `npm run agent-research-library:verify-layout -- --strict` | `ALL_A_PLUS` | 58 folders verified across Z:, L:, and Intelligence Hub |
| `npm run agent-research-library:register-source-registry` | Complete | Registry + L: opportunity map seeded |
| `npm run proposal-stack:build:articles-batch` | Complete | Eight new captures + Unstructured reused |
| `npm run proposal-stack:publish:github-corpus` | Complete | Manifest-only publish to Z: `github-research/repos/` |
| `npm run agent-research-library:publish-proposal-stack-pilot` | `PROPOSAL_STACK_HANDOFF_COMPLETE` | Validate, ingest, ack, nine knowledge builds |
| Proposal-stack GitHub batch (ranks 1–7, 9) | `BATCH_COMPLETE` | Zero capture failures |
| Data-Extraction push | Pushed | `b1d2e42` (layout), `2190944` (ingestion pipeline) on `origin/main` |
| Scraper push | Pushed | `3e09e4c` (pageflows), `0111837` (proposal-stack pilot) on `feat/vendor-docs-markdown-capture-v1` |

## Commits / PRs

| Repo | Commit / PR | Status |
| --- | --- | --- |
| Data-Extraction | `b1d2e42` — layout scaffold | Pushed to `origin/main` |
| Data-Extraction | `2190944` — registry, handoff publisher, proposal-stack pilot pipeline | Pushed to `origin/main` |
| Scraper | `3e09e4c` — Pageflows path alignment | Pushed to `feat/vendor-docs-markdown-capture-v1` |
| Scraper | `0111837` — proposal-stack batch capture/publish scripts + configs | Pushed to `feat/vendor-docs-markdown-capture-v1` |
| CapitalGlass-Cross-Agent | This update | Pending push |

## Data-Extraction commit scope

`b1d2e42` — layout scaffold:

- `scripts/lib/agent-research-library/*`
- `scripts/agent-research-library/scaffold-layout.mjs`, `verify-layout.mjs`
- `package.json` scaffold/verify scripts
- `scripts/lib/paths.mjs` L: extraction directories
- `scripts/synology/scaffold-nas-layout.mjs`

`2190944` — proposal-stack pilot pipeline:

- `config/agent-research-library/proposal-stack-top10-v1.json`
- `scripts/agent-research-library/register-source-registry.mjs`
- `scripts/agent-research-library/publish-proposal-stack-pilot.mjs`
- `package.json` register + publish pilot scripts

## Scraper commit scope

`3e09e4c` — Pageflows path:

- `ui-capture/scripts/lib/pageflows-env.mjs`
- `ui-capture/README.md`

`0111837` — proposal-stack pilot:

- `config/agent-research-library/proposal-stack-github-captures-v1.json`
- `config/agent-research-library/proposal-stack-n8n-bounded-v1.json`
- `ui-capture/scripts/scrape-github-repo.mjs` (include-prefix / max-files)
- `ui-capture/scripts/build-github-markdown-articles.mjs`
- `ui-capture/scripts/run-proposal-stack-github-batch.mjs`
- `ui-capture/scripts/run-proposal-stack-articles-batch.mjs`
- `ui-capture/scripts/publish-proposal-stack-github-corpus.mjs`
- `ui-capture/package.json` proposal-stack npm scripts
- `.gitignore` — `artifacts/captures/` excluded from git

Still unstaged on Scraper branch (separate from pilot commit):

- Unstructured/Docling vendor-docs lane scripts and artifacts

## Blockers / warnings

| Blocker | Owner repo | Required action |
| --- | --- | --- |
| n8n (#10) not captured yet | Scraper | Run bounded WATCH capture via `proposal-stack-n8n-bounded-v1.json`; non-blocking for pilot |
| Documenso AGPL / n8n fair-code | Data-Extraction / agents | WATCH verdicts — no promotion to `10-approved-for-use/` without license review |
| Remaining Scraper Unstructured/Docling vendor-docs work unstaged | Scraper | Separate commit when ready |
| Raw captures must stay out of git | Scraper | Use `artifacts/captures/` locally and Z: corpus lanes only |

## Next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | Run bounded n8n capture (`npm run proposal-stack:scrape:n8n-bounded`) when workflow automation research is needed | Scraper | Optional / non-blocking |
| 2 | Agent review of nine pilot sources; write adoption notes to `08-app-opportunity-map/` | Agents / Wesley | Pending |
| 3 | Promote only reviewed items to `10-approved-for-use/` after license, evidence, security, Northstar gates | Data-Extraction / agents | Not started |
| 4 | Merge Scraper `feat/vendor-docs-markdown-capture-v1` when vendor-docs lane review is complete | Scraper | Pending |
| 5 | Decide on separate commits for remaining Unstructured/Docling vendor-docs work | Scraper | Pending Wesley decision |

## Reusable lessons

- Separate scaffold/layout commits from vendor-specific capture or Bible changes; it keeps review scope clean.
- Retired storage roots should be fixed in both code defaults and docs so future captures do not drift back to `TEMP L DRIVE`.
- Keep unstaged vendor-docs work as a separate commit line from core folder-layout infrastructure.

- Manifest-only Z: publish is required for large GitHub captures; full page mirror to Z: over SMB is too slow for pilot batches.
- Handoff CLI `--package` flag parsing in existing scripts is unreliable; pilot publisher uses direct library calls.
- n8n is peripheral workflow automation (WATCH), not a core proposal-generator dependency.

## Update log

### 2026-08-01 17:34 CT — proposal-stack pilot 9/10 operational

- Registry `proposal-stack-top10-v1` published (proposal-generator GitHub stack research).
- Nine sources captured, article-built, manifest-published, handoff-accepted, and knowledge-built (ranks 1–7, 8 Unstructured existing, 9 AgencyOS).
- Handoff package `PKG-PROPOSAL-STACK-PILOT-V1` — `ACK_ACCEPTED`, nine corpus pointers.
- Data-Extraction `2190944` pushed: registry + `publish-proposal-stack-pilot.mjs`.
- Scraper `0111837` pushed: batch configs, scrape path limits, article/corpus publish scripts; `artifacts/captures/` gitignored.
- Z: manifests at `github-research/repos/{slug}/02-manifests/` (manifest-only; no bulk page copy).
- L: opportunity map entries at `08-app-opportunity-map/` with STUDY/WATCH verdicts; nothing in `10-approved-for-use/`.
- n8n (#10) deferred; bounded config `proposal-stack-n8n-bounded-v1.json` ready for separate WATCH capture.

### 2026-08-01 CT — Cursor / Wesley / ChatGPT

- Recorded pushed Data-Extraction commit `b1d2e42` for the agent research library folder layout.
- Recorded pushed Scraper commit `3e09e4c` for Pageflows path alignment.
- Captured remaining unstaged work and next decision point for second commits.
