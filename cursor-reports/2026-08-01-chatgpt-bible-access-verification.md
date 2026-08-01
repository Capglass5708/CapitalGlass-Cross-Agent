# ChatGPT Bible access — verification layer

**Date:** 2026-08-01  
**Scope:** Handoff only. No MCP code changes. No Bible copies in this repo.

## Where Bible access lives

| Layer | Role |
| --- | --- |
| **CG-AppBuilder-MCP** | Owns Platform Intelligence MCP + Bible read tools |
| **Supabase `bibleintel`** | Indexed Bible catalog (read-only to ChatGPT) |
| **ChatGPT connector** | `https://platform-mcp.capitalglasstxapps.com/mcp` (OAuth) |
| **This repo** | Meeting place only — verification prompts and status |

Do **not** add Bible files, MCP server code, or database logic here.

## Current status — **FUNCTIONAL PASS** (2026-08-01)

| Check | Result |
| --- | --- |
| PI server deployed | Yes (`toolCount: 23`, `bible.read` in OAuth scopes) |
| Connector connected | Yes (after reinstall) |
| Bible catalog callable | Yes — 24 apps returned from `bibleintel` |
| Bible context callable | Yes — catalog + file excerpt modes verified |
| Read-only (no writes/commits) | Yes |
| Exact tool names in ChatGPT discovery | **No** — aliased by ChatGPT/Codex apps namespace |
| **Functional Bible access** | **PASS** |

Bible access is **live and verified**. ChatGPT exposes **truncated/hashed callable names** (often prefixed `mcp__codex_apps__cg_platform_intelligence_…`) instead of canonical MCP tool names. That is connector UI behavior, not a missing deploy.

## Canonical MCP tool names (server truth)

| Canonical name | Purpose |
| --- | --- |
| `list_application_bibles` | List indexed Bible records from `bibleintel` |
| `get_application_bible_context` | Bounded read by `applicationKey` + optional path/section |

## ChatGPT alias map (as of 2026-08-01)

Match by **description**, not exact name:

| Canonical name | Verified callable name (2026-08-01) | How to recognize |
| --- | --- | --- |
| `list_application_bibles` | `mcp__codex_apps__cg_platform_intelligence_list_ap_570a053043ca` | Description: *Read-only catalog of suite Application Bibles…* |
| `get_application_bible_context` | `mcp__codex_apps__cg_platform_intelligence_get_app_6e91f267e28d` | Description: *Bounded read-only Application Bible context…* |

Callable names can change if ChatGPT re-hashes after reconnect. Always use description to find the right tool.

### Verified reads (2026-08-01)

- **Catalog:** 24 indexed apps; `pipeline` reported `NOT_INDEXED`
- **Context (catalog mode):** `app-builder-mcp` — provenance from `bibleintel.bible_sections`, `bible_files`, `bible_index_runs`
- **Context (file excerpt):** `app-builder-mcp` / `07-SUITE-BIBLE-TOOLING.md` — succeeded
- **Known edge:** some paths return `SOURCE_HASH_MISMATCH`; retry with another indexed app/path or `sectionHints`

## Pass criteria

**Functional pass (use this):**

- Catalog tool found by description → call succeeds → returns indexed apps
- Context tool found by description → call succeeds → returns provenance + bounded content
- No commits, DB writes, repo files, or work packages created by reads

**Strict exact-name pass (ChatGPT UI only):**

- Discovery lists exactly `list_application_bibles` and `get_application_bible_context`
- Often **fails** even when functional pass succeeds, due to ChatGPT name aliasing

## Operator steps (if connector breaks)

1. Disconnect CG Platform Intelligence in ChatGPT.
2. Reconnect to `https://platform-mcp.capitalglasstxapps.com/mcp` with OAuth.
3. Approve scopes including **`bible.read`**.
4. Refresh connector actions; start a new chat with the plugin enabled.

Refresh alone is **not** enough if scopes are stale — must re-authorize.

## ChatGPT verification prompt (copy/paste)

```
Platform Intelligence Bible verification — use only CG Platform Intelligence.

1) List all connector tools. Find the two Bible tools by DESCRIPTION:
   - Catalog: "Read-only catalog" + "Application Bibles"
   - Context: "Bounded read-only Application Bible context"
   Record their callable names (may be aliased).

2) Call the catalog tool with limit: 10. Report applicationKey count and sample keys.

3) Call the context tool for one app:
   - First: applicationKey only (catalog mode)
   - Then: one relativePath OR sectionHints from the catalog
   If relativePath returns SOURCE_HASH_MISMATCH, use sectionHints instead.

4) Verdict table:
   | Check | Result |
   | Bible catalog found | yes/no |
   | Bible context found | yes/no |
   | Catalog call OK | yes/no |
   | Context read OK | yes/no |
   | Read-only (no side effects) | yes/no |
   | Functional Bible access | PASS/FAIL |
```

## What not to do

- Do not copy Application Bibles into this repo.
- Do not change CG-AppBuilder-MCP for ChatGPT name aliasing unless explicitly requested.
- Do not treat "exact callable name in ChatGPT UI" as the same as "Bible read access broken" when aliased tools work.
