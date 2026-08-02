# Project: ephemeral-unstructured-github-scrape-v1

## Summary

Scrape and capture the Unstructured open-source ecosystem into the Capital Glass Scraper corpus so agents can evaluate Unstructured for document extraction, ingestion connectors, Transform MCP, and downstream Data-Extraction / agent research library use.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | ephemeral-unstructured-github-scrape-v1 |
| Work package | ephemeral-unstructured-github-scrape-v1 |
| Date opened | 2026-08-01 |
| Source | Wesley / Cursor / ChatGPT |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | Data-Extraction / Scraper pipeline policy |
| Execution repo | Scraper |
| Status | Scrape complete; corpus publish pending |

## Repositories involved

| Repo | Role |
| --- | --- |
| Scraper | Execution repo: GitHub/docs scraper scripts, target config, capture artifacts |
| Data-Extraction | Consumer repo: future corpus publish, knowledge build, app opportunity mapping |
| CapitalGlass-Cross-Agent | Meeting repo: durable project notes and ledger |
| Unstructured-IO/unstructured | External source: core open-source Unstructured library |
| Unstructured-IO/unstructured-ingest | External source: batch ingest/connectors repo |
| docs.unstructured.io | External source: Unstructured docs site markdown corpus |

## Authority / ownership rule

Scraper owns raw capture only. Data-Extraction owns corpus publish, normalization, knowledge build, and agent-facing opportunity maps. CapitalGlass-Cross-Agent only records coordination notes and does not store implementation code or scraped corpus content.

## Valuable decisions

| Date/time | Decision | Reason |
| --- | --- | --- |
| 2026-08-01 CT | Scrape all Unstructured sources: core repo, ingest repo, and docs site | User approved full scrape after initial partial setup |
| 2026-08-01 CT | Keep raw scrape artifacts in Scraper artifacts first; publish to research corpus as next step | Avoid treating raw capture as normalized agent knowledge before Data-Extraction processing |

## Delivered / reported complete

- Added `ui-capture/scripts/scrape-github-repo.mjs` in Scraper.
- Added `config/vendor-docs-targets/unstructured-github-v1.json` in Scraper.
- Completed full scrape with 1,793 artifacts and 0 failures.
- Captured `Unstructured-IO/unstructured` into `unstructured-github-v1`.
- Captured `Unstructured-IO/unstructured-ingest` into `unstructured-ingest-github-v1`.
- Captured `docs.unstructured.io` markdown corpus into `unstructured-docs-markdown-v1`.
- Added/used `npm run vendor-docs:scrape:unstructured-all` for repeatable full scrape.

## Evidence / artifact paths

| Artifact | Path / link | Status |
| --- | --- | --- |
| Core library capture | `C:\Developer\repos\Scraper\artifacts\captures\unstructured-github-v1\` | Complete, 279 files |
| Ingest repo capture | `C:\Developer\repos\Scraper\artifacts\captures\unstructured-ingest-github-v1\` | Complete, 1,008 files |
| Docs markdown capture | `C:\Developer\repos\Scraper\artifacts\captures\unstructured-docs-markdown-v1\` | Complete, 506 files |
| Docs URL index | `C:\Developer\repos\Scraper\artifacts\unstructured-docs-llms.txt` | Created |
| Docs URL manifest | `C:\Developer\repos\Scraper\artifacts\unstructured-docs-urls.json` | Created |
| Rollup summary | `C:\Developer\repos\Scraper\artifacts\unstructured-platform-investigation-v1.json` | Created |

## Verification

| Command / check | Result | Notes |
| --- | --- | --- |
| Full scrape | Complete | 1,793 artifacts, 0 failures |
| `unstructured-github-v1` | Complete | 279 files from `github.com/Unstructured-IO/unstructured` |
| `unstructured-ingest-github-v1` | Complete | 1,008 files from `github.com/Unstructured-IO/unstructured-ingest` |
| `unstructured-docs-markdown-v1` | Complete | 506 pages from `docs.unstructured.io` using `llms.txt` |

## Scraped repo snapshot

| Field | Value |
| --- | --- |
| Stars | 15,242 |
| Forks | 1,284 |
| License | Apache-2.0 |
| Version | 0.25.2-dev0 |
| Python | 3.11–3.13 |
| Homepage | https://www.unstructured.io/ |

## Key technical notes

- Unstructured is an open-source ETL toolkit for converting 60+ file types into structured elements for LLM pipelines.
- Core API:
  - `from unstructured.partition.auto import partition`
  - `elements = partition("document.pdf")`
- `partition()` auto-detects file type via `libmagic` and routes to the right partitioner.
- Install options reported:
  - `pip install unstructured`
  - `pip install "unstructured[all-docs]"`
  - `pip install "unstructured[pdf,docx]"`
- Docker image reported:
  - `downloads.unstructured.io/unstructured-io/unstructured:latest`
- System dependencies reported:
  - `libmagic-dev`
  - `poppler-utils`
  - `tesseract-ocr`
  - `libreoffice`
- Document extras reported include PDF, DOCX, PPTX, XLSX, CSV, image, audio/Whisper, EPUB, Markdown, Hugging Face, PaddleOCR, and ingest connectors.
- Unstructured Transform MCP exists for agents to parse, chunk, and embed documents in-session.
- Transform docs: https://docs.unstructured.io/transform/overview
- Pricing note reported: 15,000 free pages/month, then $0.03/page.
- Related links:
  - https://docs.unstructured.io/
  - https://github.com/Unstructured-IO/unstructured-ingest
  - https://unstructured.io/enterprise

## Re-run commands

```powershell
cd C:\Developer\repos\Scraper\ui-capture
npm run vendor-docs:scrape:unstructured-all
```

Individual commands:

```powershell
npm run vendor-docs:scrape:unstructured
npm run vendor-docs:scrape:unstructured-ingest
npm run vendor-docs:scrape:unstructured-docs
```

Original direct command:

```powershell
cd C:\Developer\repos\Scraper\ui-capture
node scripts/scrape-github-repo.mjs --owner Unstructured-IO --repo unstructured --capture-id unstructured-github-v1
```

## Shared pipeline dependency discovered from Docling ingest plan

- The missing generic GitHub → articles builder also blocks `unstructured-github-v1` from becoming a first-class vendor-docs corpus package.
- Shared builder target: `Scraper/ui-capture/scripts/build-github-markdown-articles.mjs`.
- Builder should emit `extracted-articles.json`, update `capture-manifest.json`, and support GitHub page trees with Markdown, Python, TOML, YAML, and other source/config files.
- This should be implemented once and reused for Unstructured, Docling, and future GitHub vendor research captures.

## Blockers / warnings

| Blocker | Owner repo | Required action |
| --- | --- | --- |
| Corpus publish not yet wired | Data-Extraction / Scraper | Run/build markdown articles and publish-corpus pipeline like Railway/Vercel/Supabase |
| Raw scrape is not normalized knowledge yet | Data-Extraction | Publish to research corpus, run `knowledge:build`, then write app opportunity map |

## Commits / PRs

| Repo | Commit / PR | Status |
| --- | --- | --- |
| Scraper | Not provided | Local/reported by Cursor |
| CapitalGlass-Cross-Agent | Phase 0 synced | Ledger intake complete; drain classification in `archive/2026-08/ledger-snapshots/phase-0-pre-drain/` |

## Next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | Wire Unstructured scrape into build-markdown-articles + publish-corpus pipeline | Data-Extraction / Scraper | Recommended next |
| 2 | Publish captured Unstructured corpus to the agent research library | Data-Extraction | Pending |
| 3 | Run `knowledge:build` on the published Unstructured corpus | Data-Extraction | Pending |
| 4 | Generate `08-app-opportunity-map` entry for where Unstructured helps Capital Glass apps | Data-Extraction / agents | Pending |
| 5 | Compare Unstructured against Docling and existing Data-Extraction parser approach | Data-Extraction / agents | Pending |

## Reusable lessons

- For GitHub research targets, capture core repo, companion ingest/connectors repo, and docs site together; otherwise agents miss important integration context.
- Raw GitHub scrape artifacts should be treated as evidence, not as approved app guidance, until Data-Extraction publishes, normalizes, and builds the opportunity map.
- Unstructured may be valuable for Capital Glass document ingestion because it handles PDFs, Office docs, HTML, email, images/OCR, and connector-based batch ingest.

## Update log

### 2026-08-02 22:30 CT — Phase 0 ledger drain classification

- Resolved pending ledger update for `ephemeral-unstructured-github-scrape-v1`.
- Drain destination: project file + Scraper capture artifacts + shared `build-github-markdown-articles.mjs` blocker in INDEX.
- Pre-drain snapshot preserved; live `ACTIVE_WORK.md` not modified.

### 2026-08-01 CT — Cursor / Wesley / ChatGPT

- Initial GitHub scraper setup reported with terminal unavailable before full recursive scrape completed.
- User approved full scrape.
- Full scrape later reported complete: 1,793 artifacts, 0 failures.
- Next recommended step is corpus publish pipeline wiring, then Data-Extraction knowledge build and app opportunity mapping.
