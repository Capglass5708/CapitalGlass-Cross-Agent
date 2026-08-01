# Project: docling-github-ingest-v1

## Summary

Ingest `docling-project/docling` as a first-class vendor-docs estate so agents can retrieve Docling capabilities, APIs, MCP usage, and document-processing patterns from L: drive without bulk-reading GitHub.

## Workspace

| Field | Value |
| --- | --- |
| Project / Cursor ID | docling-github-ingest-v1 |
| Work package | docling-github-ingest-v1 |
| Date opened | 2026-08-01 |
| Source | Wesley / attached markdown / ChatGPT |
| Coordination repo | CapitalGlass-Cross-Agent |
| Authority repo | Data-Extraction / Northstar corpus policy |
| Execution repo | Scraper / Data-Extraction |
| Status | Planned / implementation checklist captured |

## Repositories involved

| Repo | Role |
| --- | --- |
| Scraper | Capture full GitHub repo, build extracted articles, publish Docling vendor corpus to Z:/L: |
| Data-Extraction | Scaffold vendor slot, interpret Docling, build knowledge corpus, bundle producer package, warm retrieval ladder |
| CG-AppBuilder-MCP | MCP ingest target for warm retrieval ladder |
| CapitalGlass-Cross-Agent | Meeting repo: durable project plan and ledger |
| docling-project/docling | External source repo to ingest |

## Authority / ownership rule

Scraper owns raw GitHub capture and vendor-docs publishing. Data-Extraction owns normalized knowledge, producer packages, warm retrieval snapshots, and the agent-facing compact. Z: remains canonical corpus authority for Scraper-Corpus vendor docs; L: is the agent-facing replica and retrieval surface.

## Current state

| Item | Status |
| --- | --- |
| UI-reference single-page capture | Done at `Scraper/artifacts/captures/captures/ui-reference/docling-github-repo/`, but wrong lane and no `extracted-articles.json` |
| GitHub bulk scrape script | Exists: `Scraper/ui-capture/scripts/scrape-github-repo.mjs` |
| GitHub → articles builder | Missing; also blocks `unstructured-github-v1` corpus publish |
| Docling vendor config / publish script | Missing |
| Docling vendor interpreter | Missing in `Data-Extraction/scripts/lib/vendor-interpretation/registry.mjs` |
| DE2 warm-retrieval ladder | Missing; template exists at `Data-Extraction/scripts/supabase/warm-retrieval-ladder.mjs` |

## Target L: drive layout

```text
L:/Capital-Glass-Research/
  Scraper-Corpus/vendor-docs/docling/
  de2-producer-intake/
  estimating-suite-cold-cache/intelligence/vendor-docs/docling/
    PKG-DE2-DOCLING-.../retrieval-snapshot.json

L:/Capital-Glass-Intelligence-Hub/03-domains/vendor-docs/docling/compacts/
  docling-adoption-agent-compact-v1.json
```

Canonical authority remains:

```text
Z:/Capital-Glass-Research/Scraper-Corpus/vendor-docs/docling/
```

## Valuable decisions

| Date/time | Decision | Reason |
| --- | --- | --- |
| 2026-08-01 CT | Supersede prior UI-reference capture with GitHub API/tree scrape | UI-reference capture is wrong lane and lacks `extracted-articles.json` |
| 2026-08-01 CT | Build a generic GitHub markdown/articles builder | Needed for Docling and also blocks Unstructured GitHub corpus publish |
| 2026-08-01 CT | Agents must read compact before full capture tree | Prevents expensive bulk reads and keeps retrieval governed |
| 2026-08-01 17:23 CT | `publish-docling-corpus.mjs` uses `manifest-only-fast` by default | Avoids bulk page copy crash/timeout; publish completed in ~28 seconds vs prior 21+ minute crash |

## Delivered / reported complete

- Docling ingest plan captured.
- Existing GitHub bulk scraper identified.
- Wrong-lane Docling UI-reference capture identified.
- Missing shared GitHub → articles builder identified.
- Target Z:/L:/Intelligence Hub layout specified.
- Scraper and Data-Extraction file changes listed for implementation.
- Verification and closeout chain specified.
- `publish-docling-corpus.mjs` updated so publish uses `manifest-only-fast` by default.
- Manifest-only publish completed in about 28 seconds; prior full copy path crashed after 21+ minutes.
- Publish now writes manifests and pointers to Z:, mirrors only lightweight sections to L:, and leaves full page bytes in local capture plus DE2 cold cache.
- Full L: mirroring of all 1,076 pages is explicitly opt-in via `npm run vendor-docs:publish:docling:full`.

## Evidence / artifact paths

| Artifact | Path / link | Status |
| --- | --- | --- |
| Existing wrong-lane UI capture | `C:\Developer\repos\Scraper\artifacts\captures\captures\ui-reference\docling-github-repo` | Exists; superseded |
| GitHub scrape script | `C:\Developer\repos\Scraper\ui-capture\scripts\scrape-github-repo.mjs` | Exists |
| Corpus root policy | `C:\Developer\repos\Data-Extraction\docs\application-bible\07-CORPUS-ROOT-POLICY.md` | Reference |
| Supabase warm ladder template | `C:\Developer\repos\Data-Extraction\scripts\supabase\warm-retrieval-ladder.mjs` | Template |

## Planned Scraper changes

| File | Purpose |
| --- | --- |
| `config/vendor-docs-targets/docling-github-v1.json` | Vendor target config for `docling-project/docling` |
| `ui-capture/scripts/build-github-markdown-articles.mjs` | Generic GitHub capture → `extracted-articles.json` builder |
| `ui-capture/scripts/publish-docling-corpus.mjs` | Publish Docling corpus to Z: and mirror to L: |
| `ui-capture/package.json` | Add Docling scrape/build/publish npm scripts |

## Planned Data-Extraction changes

| File | Purpose |
| --- | --- |
| `scripts/lib/vendor-interpretation/docling.mjs` | Deterministic Docling knowledge extraction |
| `scripts/lib/vendor-interpretation/registry.mjs` | Register `docling: interpretDocling` |
| `scripts/docling/warm-retrieval-ladder.mjs` | Governed warm retrieval path for agents |
| `scripts/docling/estate-status.mjs` | Docling estate status command |
| `package.json` | Add `docling:warm-retrieval-ladder` and `docling:estate-status` scripts |
| `fixtures/vendor-captures/docling-github-v1/` | Minimal offline CI fixture subset |

## Key Docling knowledge targets

- Multi-format parsing: PDF, DOCX, PPTX, XLSX, HTML, EPUB, audio, video.
- OCR, table structure, chart understanding.
- Local execution.
- MCP server.
- `docling-serve` API.
- LangChain, LlamaIndex, Haystack integrations.
- CLI and Python API patterns.
- High-value docs: README, installation, usage, integrations, MCP, `pyproject.toml`, Dockerfile.
- Retrieval tags: `document-parsing`, `pdf`, `mcp`, `local-execution`.

## Commands / execution order

### Scraper capture

```powershell
cd C:\Developer\repos\Scraper\ui-capture
node scripts/scrape-github-repo.mjs --owner docling-project --repo docling --capture-id docling-github-v1
```

Expected output:

```text
Scraper/artifacts/captures/docling-github-v1/pages/<pageId>/content.*
Scraper/artifacts/captures/docling-github-v1/capture-manifest.json
Scraper/artifacts/captures/docling-github-v1/repo-metadata.json
```

### Data-Extraction vendor slot

```powershell
cd C:\Developer\repos\Data-Extraction
npm run scraper-corpus:scaffold-vendor-docs -- --vendor docling
npm run vendor-docs:pipeline-status -- --vendor docling
```

### Knowledge build and producer package

```powershell
cd C:\Developer\repos\Data-Extraction
$manifest = "C:\Developer\repos\Scraper\artifacts\captures\docling-github-v1\capture-manifest.json"

npm run knowledge:build -- --manifest $manifest --work-package docling-github-ingest-v1
npm run knowledge:bundle-producer-package -- --build-dir "<build-out>" --manifest $manifest --publish-nas --json
npm run knowledge:verify-producer-package -- --package "<package-dir>"
```

### Warm retrieval ladder

```powershell
npm run docling:warm-retrieval-ladder -- --mcp-repo C:\Developer\repos\CG-AppBuilder-MCP --json
```

### Placement verification

```powershell
Test-Path L:\Capital-Glass-Research\Scraper-Corpus\vendor-docs\docling\02-manifests\extracted-articles-docling-github-v1.json
npm run synology:sync-handoff-intake
npm run synology:verify-nas-layout
npm run vendor-docs:pipeline-status -- --vendor docling
npm run de:handoff-health
```

## Verification

| Command / check | Result | Notes |
| --- | --- | --- |
| Existing Docling UI-reference capture | Done | Wrong lane; do not merge into vendor-docs estate |
| `scrape-github-repo.mjs` availability | Exists | Use for authoritative GitHub tree capture |
| GitHub → articles builder | Missing | Must be implemented before corpus publish |
| Docling interpreter | Missing | Required before deterministic DE2 knowledge build |
| Warm retrieval ladder | Missing | Required for governed agent retrieval surface |
| `publish-docling-corpus.mjs` default publish | Complete in ~28 seconds | Uses `manifest-only-fast`; skips bulk page copies |

## Blockers / warnings

| Blocker | Owner repo | Required action |
| --- | --- | --- |
| Generic GitHub articles builder missing | Scraper | Implement `build-github-markdown-articles.mjs` |
| Docling publish script missing | Scraper | Implement `publish-docling-corpus.mjs` |
| Docling interpreter missing | Data-Extraction | Implement `scripts/lib/vendor-interpretation/docling.mjs` and registry entry |
| Warm retrieval ladder missing | Data-Extraction | Implement `scripts/docling/warm-retrieval-ladder.mjs` |
| Z:/L: may be unmounted | Operator / environment | Fail fast with dry-run and document mount prerequisites |
| GitHub API rate limits | Scraper / operator | Run off-peak or set `GITHUB_TOKEN` for higher limits |
| Full page mirror to L: is expensive | Scraper / operator | Use `npm run vendor-docs:publish:docling:full` only when all 1,076 pages are explicitly needed on L: |

## Commits / PRs

| Repo | Commit / PR | Status |
| --- | --- | --- |
| Scraper | None yet | Planned |
| Data-Extraction | None yet | Planned |
| CapitalGlass-Cross-Agent | Pending | Project file + ledger update |

## Next actions

| Priority | Action | Owner repo | Status |
| --- | --- | --- | --- |
| 1 | Mount Z: and L: | Operator | Required before publish/verify |
| 2 | Scraper: scrape Docling GitHub tree | Scraper | Planned |
| 3 | Scraper: build GitHub markdown articles | Scraper | Planned |
| 4 | Scraper: publish Docling corpus to Z: and L: | Scraper | Planned |
| 5 | Data-Extraction: scaffold Docling vendor slot | Data-Extraction | Planned |
| 6 | Data-Extraction: add Docling interpreter and run `knowledge:build` | Data-Extraction | Planned |
| 7 | Data-Extraction: bundle/verify producer package | Data-Extraction | Planned |
| 8 | Data-Extraction: create warm retrieval ladder and agent compact | Data-Extraction | Planned |
| 9 | Run session closeout for `docling-github-ingest-v1` | Data-Extraction | Planned |

## Reusable lessons

- UI-reference captures are not enough for vendor-docs estates because they lack extracted article manifests and governed corpus publishing.
- A generic GitHub articles builder should serve Docling, Unstructured, and future GitHub vendor research captures.
- Agent retrieval should start with `L:/Capital-Glass-Intelligence-Hub/.../compacts/*-agent-compact-v1.json`, then warm retrieval snapshots, then full source only as a last resort.

## Update log

### 2026-08-01 17:23 CT — Cursor / Wesley / ChatGPT

- Publish now uses `manifest-only-fast` by default.
- `publish-docling-corpus.mjs` skips bulk page copies.
- Publish completed in about 28 seconds, compared with the previous 21+ minute crash path.
- It publishes manifests and pointers to Z:, mirrors only lightweight sections `00-control`, `02-manifests`, and `03-provenance` to L:, and leaves full page bytes in the local capture plus DE2 cold cache.
- Agent L: entry points:
  - `L:/Capital-Glass-Intelligence-Hub/03-domains/vendor-docs/docling/compacts/docling-adoption-agent-compact-v1.json`.
  - `L:/Capital-Glass-Research/Scraper-Corpus/vendor-docs/docling/02-manifests/extracted-articles-docling-github-v1.json`.
  - `L:/Capital-Glass-Research/estimating-suite-cold-cache/intelligence/vendor-docs/docling/PKG-DE2-DOCLING-.../retrieval-snapshot.json`.
- Use `npm run vendor-docs:publish:docling:full` only when all 1,076 pages must be mirrored to L:.

### 2026-08-01 CT — attached markdown / ChatGPT

- Captured Docling GitHub → Data-Extraction → L: Drive ingest plan.
- Identified missing shared GitHub articles builder as a blocker for both Docling and Unstructured corpus publish.
- Captured target L: drive layout, planned Scraper/Data-Extraction files, commands, verification chain, risks, and execution order.
