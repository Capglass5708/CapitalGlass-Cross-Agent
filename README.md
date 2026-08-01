# CapitalGlass-Cross-Agent

Meeting repository for **ChatGPT ↔ Cursor** collaboration: plans, reviews, decisions, and cursor reports.

This repo does **not** host Application Bibles, work packages, or agent-loop runtime.

## Commit-free Bible access (ChatGPT)

ChatGPT reads suite Application Bibles through **Capital Glass Platform Intelligence** — not through this repository.

| Tool | Purpose |
| --- | --- |
| `list_application_bibles` | Lists indexed Bibles and freshness |
| `get_application_bible_context` | Returns a bounded Bible section with provenance |

**Flow:** owning app repo (edit authority) → `bibleintel` index (Supabase) → Platform Intelligence (read-only) → ChatGPT

**What does not happen on Bible read:**

- No Bible files copied into this meeting repo
- No `/bibles` folder here
- No Git commits in this repo
- No database writes by ChatGPT
- No Z: or L: direct file serving

Implementation lives in **CG-AppBuilder-MCP** (`services/cursor-platform-intelligence-mcp`). Connector manifest: `docs/platform-registry/chatgpt-platform-intelligence-connector-v1.json`.

## Folders (when used)

- `plans/` — ChatGPT plans
- `chatgpt-reviews/` — ChatGPT review output
- `decisions/` — agreed decisions
- `cursor-reports/` — Cursor execution reports
