# Application Bible sync runbook

**Repo:** CapitalGlass-Cross-Agent (checklist only — no Bible content here)  
**Orchestration owner:** `CG-AppBuilder-MCP`

## Authority layers

| Layer | Can edit? | Purpose |
| --- | --- | --- |
| App repo `docs/application-bible/` | yes | Source of truth |
| Git commit | yes | Proof / history |
| Z: mirror `Z:\Capital-Glass-Dev\Application Bibles\` | no normal hand-edits | Shared published copy |
| Supabase `bibleintel` | no manual edits | Indexed read model |
| AI cache | no | Disposable speed cache |
| This meeting repo | no Bible content | Handoffs / checklists only |

## Pipeline (correct order)

```
Git repo Bible update → commit + push → sync to Z: → check Z: parity
  → index bibleintel → refresh AI cache → agents read
```

## Before agent work

Run from a machine with **Z:** mapped to `\\192.168.1.208\Capital Glass` (or `\\cg-server\Capital Glass`).

### 1. Confirm Z: mounted

```powershell
Test-Path "Z:\Capital-Glass-Dev\Application Bibles"
```

Must return `True`.

### 2. Run authority gate (preferred)

```powershell
cd C:\Developer\repos\CG-AppBuilder-MCP
doppler run -p cg-mcp -c dev -- npm run bible:authority:gate
```

If the gate fails, **stop**. Do not proceed with Bible-dependent agent work.

`PASS` or `PASS_WITH_WARNINGS` is acceptable. `PASS_WITH_WARNINGS` may include historical cache-link audit noise; the gate blocks only on mirror drift, stale bibleintel index, or unhealthy live AI cache.

### 3. Manual checks (if gate unavailable)

```powershell
cd C:\Developer\repos\CG-AppBuilder-MCP
npm run check:application-bibles-sync
```

If **FAIL** → stop → run:

```powershell
npm run generate:application-bibles
npm run sync:application-bibles -- --all
npm run check:application-bibles-sync
```

Do not continue until all apps report `[OK]`.

If PI / ChatGPT needs current reads:

```powershell
$env:BIBLE_DB_LIVE_WRITES = "true"
doppler run -p cg-mcp -c dev -- npm run bible-db:index-suite -- --live
doppler run -p cg-mcp -c dev -- npm run bible-db:check-freshness -- --strict
```

If AI cache is used:

```powershell
$env:BIBLE_DB_LIVE_WRITES = "true"
doppler run -p cg-mcp -c dev -- npm run bible-db:link-cache -- --scan-agent-runs
```

### 4. Proceed only when

- Z: mirror check: **all OK**
- `bibleintel` index: **current** (gate `bible-db:check-freshness` step PASS; `staleApps: 0`)
- AI cache: **healthy** (gate `ai-cache:probe-health` PASS)
- `npm run bible:authority:gate`: **PASS** or **PASS_WITH_WARNINGS**

## After changing a Bible in an owning app repo

```powershell
# In owning app repo
git add docs/application-bible
git commit -m "docs: update application bible"
git push

# Publish + index (CG-AppBuilder-MCP, Z: mounted)
cd C:\Developer\repos\CG-AppBuilder-MCP
npm run generate:application-bibles
npm run sync:application-bibles -- --all
npm run check:application-bibles-sync

$env:BIBLE_DB_LIVE_WRITES = "true"
doppler run -p cg-mcp -c dev -- npm run bible-db:index-suite -- --live
doppler run -p cg-mcp -c dev -- npm run bible-db:check-freshness -- --strict
doppler run -p cg-mcp -c dev -- npm run bible-db:link-cache -- --scan-agent-runs
doppler run -p cg-mcp -c dev -- npm run bible:authority:gate
```

## Rules

- **Do not** edit Z: Bibles as the primary workflow.
- **Do not** treat AI cache or meeting-repo copies as truth.
- **Do not** copy Application Bibles into this repo.
- Use `--pull` sync only for intentional Z: → repo backport (exception path).
