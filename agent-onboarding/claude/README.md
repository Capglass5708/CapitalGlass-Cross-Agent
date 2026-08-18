# Capital Glass — Claude Start Package

**Work packages:** `claude-estate-awareness-v1` + `claude-full-estate-platform-integration-v1`  
**Published:** `Z:\Capital-Glass-Dev\Claude Start Package`  
**Purpose:** Claude operates on Wesley's behalf with **full platform auth + CLI + MCP**

## Required Claude Project setup (8 uploads + paste)

See **`START_HERE.md`** and **`CLAUDE_FULL_OPERATOR_INDEX.md`**

| Layer | Files |
| --- | --- |
| Estate + WSL + parallel | Awareness, WSL policy, MCP/protocol, parallel guide |
| **Auth + CLI + live ops** | Auth guide, CLI reference, MCP wiring, daily preflight |
| Paste | `CLAUDE_CUSTOM_INSTRUCTIONS.txt` |

## Operator live connection (not uploaded)

1. `doppler login` + `gh auth login` (WSL)
2. `Start-CgMcpForCursor.ps1` (Windows)
3. `npm run wsl:mcp:repair -- --json`
4. Wire Claude Code MCP from `~/.cursor/mcp.json`

## Machine indexes (optional)

- `mcp-inventory.json` — MCP servers + env key **names**
- `claude-cli-command-index-v1.json` — CLI lookup
- `machines-wsl-paths-v1.json` — WSL repo paths

## Git source

`CapitalGlass-Cross-Agent/agent-onboarding/claude/`

## Status

| Layer | Status |
| --- | --- |
| 8-file knowledge pack | **Ready on Z:** |
| Auth + CLI docs | **Ready on Z:** |
| Live MCP in Claude Code | **Operator wiring** |
| Platform `clientSurface` receipts | Phase 1 engineering |
