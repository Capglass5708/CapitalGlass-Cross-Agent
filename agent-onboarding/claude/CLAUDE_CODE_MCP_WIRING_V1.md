# Claude Code — MCP Wiring Guide v1

**Work package:** `claude-full-estate-platform-integration-v1`  
**Goal:** Claude Code gets the **same MCP servers** Cursor uses — full auth via Doppler-backed launchers  
**Inventory authority:** `mcp-inventory.json` (copy in this folder + `Z:\Capital-Glass-Dev\Cursor-MCP-Kit\`)

---

## 1. Architecture

```text
Claude Code (WSL)
    │
    ├── ~/.cursor/mcp.json          ← WSL MCP server launchers
    ├── ~/.cursor/integrations.config.json
    └── Doppler CLI + gh/az sessions
            │
            ▼
    PM2 mcp-api :3001 (Windows host, reachable from WSL)
            │
            ▼
    GitHub / SharePoint / App Builder / Diagnostic / …
```

Claude Project uploads = **knowledge**. Claude Code MCP = **live tools**.

---

## 2. Operator setup sequence (once per machine)

### Step A — WSL foundation

```bash
test -d ~/repos/CG-AppBuilder-MCP && echo REPOS_OK || echo CLONE_REPOS_FIRST
doppler login
gh auth login
```

### Step B — Start MCP API backend (Windows)

```powershell
& "Z:\Capital-Glass-Dev\Cursor-MCP-Kit\Start-CgMcpForCursor.ps1"
```

Verify from WSL:

```bash
curl -fsS http://127.0.0.1:3001/health
```

### Step C — Repair/generate WSL MCP config

```bash
cd ~/repos/CG-AppBuilder-MCP
npm run wsl:mcp:repair -- --json
npm run wsl:mcp:verify -- --json
```

This writes **`~/.cursor/mcp.json`** with Node launchers pointing at repo scripts — same pattern as Cursor Remote-WSL.

### Step D — Wire Claude Code to MCP

In **Claude Code settings**, add MCP servers using the same entries as `~/.cursor/mcp.json`.

If Claude Code supports importing Cursor config, point at:

```text
/home/<user>/.cursor/mcp.json
```

Otherwise manually add each server from **`mcp-inventory.json`** in this folder:

| Server ID | Type | Notes |
| --- | --- | --- |
| `cg-app-builder-mcp` | stdio node launcher | Needs mcp-api :3001 |
| `cg-diagnostic` | stdio | Env contracts, health |
| `cg-suite-wiring` | stdio | Cross-app bridges |
| `office-admin-mcp` | stdio | Read-only IT knowledge |
| `failure-intelligence-mcp` | stdio | Playbooks |
| `agent-loop` | stdio + Doppler | Procedures |
| `github` | stdio + Doppler PAT | PR/issue ops |
| `doppler` | stdio | Secret **names** only |
| `sharepoint` | stdio remote | Document/PO workflows |
| `railway` | stdio | Deploy ops |
| `cloudflare` | stdio remote | DNS/workers |
| `supabase` | HTTP hosted | OAuth in client |
| `supabase-mcp-control` | HTTP hosted | OAuth |
| App-local MCPs | per repo | Hub, PO, Documents, etc. |

**Excluded on WSL:** `bluebeam-revu` (Windows only)

### Step E — OAuth plugins

Enable in Claude Code if supported (mirror Cursor):

- **Supabase** — two project refs in `machines.json` / inventory
- **Vercel** — marketplace plugin
- **Azure** — requires `az login`

### Step F — Readiness gate

```bash
cd ~/repos/CG-AppBuilder-MCP
npm run mcp:doctor
doppler run --project cg-mcp --config dev -- npm run integrations:preflight
```

Windows parity check:

```powershell
& "Z:\Capital-Glass-Dev\Cursor-MCP-Kit\Get-McpKitReadiness.ps1"
```

---

## 3. Launcher paths (WSL)

Launchers live under **`~/repos/CG-AppBuilder-MCP/scripts/`** and app repos — resolved by `wsl:mcp:repair`.

Do **not** hand-edit secrets into `mcp.json`. Launchers merge Doppler at spawn.

**Windows-only sync** (feeds Doppler → Windows integrations — not copied to WSL):

```powershell
cd C:\Developer\repos\CG-AppBuilder-MCP
npm run integrations:sync-doppler
```

---

## 4. Daily reconnect (after reboot)

```powershell
# Windows
& "Z:\Capital-Glass-Dev\Cursor-MCP-Kit\Start-CgMcpForCursor.ps1"
```

```bash
# WSL
curl -fsS http://127.0.0.1:3001/health
cd ~/repos/CG-AppBuilder-MCP && npm run wsl:mcp:verify -- --json
# Restart Claude Code if MCP shows disconnected
```

---

## 5. Troubleshooting

| Issue | Action |
| --- | --- |
| Server missing in Claude Code | Re-run `wsl:mcp:repair`; compare to `mcp-inventory.json` |
| Auth errors on spawn | `doppler login`; check secret **names** exist in correct project |
| cg-app-mcp fails | mcp-api down — start PM2 on Windows |
| SharePoint MCP fail | Verify `cg-documents` secrets; run Document Center health scripts |
| Stale OAuth | Re-auth in Claude Code; Cloudflare: `npm run mcp:cloudflare:heal` |

Restore backup:

```bash
ls ~/.cursor/backups/mcp.json.*.bak
```

---

## 6. Security

- Never upload `integrations.env`, `.env`, or Doppler downloads to Claude Project
- Never paste tokens in Claude chat — use MCP or `doppler run`
- Claude Code MCP config is **local machine only** — not published to Z:

---

## 7. Related docs in this pack

| Doc | Topic |
| --- | --- |
| `CLAUDE_AUTH_AND_CREDENTIALS_GUIDE_V1.md` | Doppler projects, CLI auth |
| `CLAUDE_CLI_OPERATOR_REFERENCE_V1.md` | npm/gh/doppler commands |
| `CLAUDE_MCP_AND_PROTOCOL_GUIDE_V1.md` | When to call which MCP |
| `mcp-inventory.json` | Server list + required env key names |
