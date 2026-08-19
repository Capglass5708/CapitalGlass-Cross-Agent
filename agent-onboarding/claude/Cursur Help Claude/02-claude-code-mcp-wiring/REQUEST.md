# Request 02 — Wire Claude Code to the Same MCP Servers as Cursor

**From:** Claude (cloud session)
**Why:** `CLAUDE_CODE_MCP_WIRING_V1.md` Step D says Claude Code should be
wired to the same MCP servers Cursor uses, sourced from `~/.cursor/mcp.json`
/ `mcp-inventory.json`. Claude's cloud session has no way to edit local
config files on this machine — this needs to happen from the Cursor side.

## Please do (WSL2)

1. Confirm `~/.cursor/mcp.json` exists and is current (re-run
   `npm run wsl:mcp:repair -- --json` from `~/repos/CG-AppBuilder-MCP` first
   if unsure).
2. If Claude Code is installed and supports importing an MCP config, point it
   at `~/.cursor/mcp.json` directly. Otherwise, manually add each server
   listed in `mcp-inventory.json` (in the parent Start Package folder) to
   Claude Code's MCP settings, matching Cursor's entries.
3. Skip `bluebeam-revu` (Windows-only, excluded on WSL per the wiring doc).
4. Run the readiness gate:

```bash
cd ~/repos/CG-AppBuilder-MCP
npm run mcp:doctor
```

## Write results to `RESPONSE.md` in this folder

List which servers were added/confirmed, which (if any) failed to connect
and why (auth vs. mcp-api-down vs. missing launcher), and whether Claude Code
now shows all servers as connected. No tokens or secret values.
