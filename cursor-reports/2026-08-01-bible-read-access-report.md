# Bible read access — Cursor report

**Date:** 2026-08-01  
**Topic:** Commit-free Application Bible access for ChatGPT

## Summary

Added two read-only Platform Intelligence tools in **CG-AppBuilder-MCP** so ChatGPT can read Application Bibles without copying them into this meeting repository and without creating commits on Bible access.

## Tools

| Tool | Purpose |
| --- | --- |
| `list_application_bibles` | Lists indexed Bibles and freshness from `bibleintel` |
| `get_application_bible_context` | Returns file catalog, section catalog, or bounded section content with provenance |

## Flow

Owning app repository (edit authority) → Supabase `bibleintel` index → Platform Intelligence (read-only) → ChatGPT

## What does not happen

- No Bible files in this repository
- No `/bibles` folder
- No database writes by ChatGPT on read
- No Bible publication commits triggered by read

## Implementation

- **Repository:** `CG-AppBuilder-MCP`
- **Commit:** `51a0f7e7`
- **Service:** `services/cursor-platform-intelligence-mcp`
- **Connector:** `docs/platform-registry/chatgpt-platform-intelligence-connector-v1.json` (10 ChatGPT-facing tools including the two Bible tools)
- **OAuth scope:** `bible.read`

## Verification

- `npm run test:platform-intelligence-contract` — PASS
- `npm run test:application-bible-contract` — PASS
- TypeScript build — PASS

## Remaining operator step

Deploy **capital-glass-platform-intelligence-mcp** on Railway so production serves the new tools. Re-authorize the ChatGPT connector if `bible.read` scope is required.
