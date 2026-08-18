# Claude Start Package — START HERE

**Published:** `Z:\Capital-Glass-Dev\Claude Start Package`  
**Goal:** Claude joins Capital Glass **fully integrated** — knowledge + **full auth + CLI** to act on your behalf

---

## Upload these 8 files to Claude Project

| File | Why |
| --- | --- |
| `CLAUDE_ESTATE_AWARENESS_PACK_v1.md` | What the estate is |
| `CLAUDE_WSL_EXECUTION_POLICY.md` | WSL bash — not PowerShell |
| `CLAUDE_MCP_AND_PROTOCOL_GUIDE_V1.md` | MCP tiers + protocols |
| `CLAUDE_PARALLEL_OPERATION_GUIDE_V1.md` | Running alongside Cursor |
| **`CLAUDE_AUTH_AND_CREDENTIALS_GUIDE_V1.md`** | **Doppler, gh, az — how auth works** |
| **`CLAUDE_CLI_OPERATOR_REFERENCE_V1.md`** | **Every CLI command Claude needs** |
| **`CLAUDE_CODE_MCP_WIRING_V1.md`** | **Live MCP in Claude Code** |
| **`CLAUDE_OPERATOR_DAILY_PREFLIGHT_V1.md`** | **Preflight before acting for you** |

Then **paste** `CLAUDE_CUSTOM_INSTRUCTIONS.txt` into Project custom instructions.

**Master index:** `CLAUDE_FULL_OPERATOR_INDEX.md`  
**Checklist:** `CLAUDE_SETUP_CHECKLIST.md`

---

## Operator setup (live auth — not uploaded)

```bash
# WSL
doppler login && gh auth login
cd ~/repos/CG-AppBuilder-MCP && npm run wsl:mcp:repair -- --json
curl -fsS http://127.0.0.1:3001/health
```

```powershell
# Windows — start MCP API
& "Z:\Capital-Glass-Dev\Cursor-MCP-Kit\Start-CgMcpForCursor.ps1"
```

Wire **Claude Code** MCP from `~/.cursor/mcp.json` — see `CLAUDE_CODE_MCP_WIRING_V1.md`.

---

## One-line model

```text
Claude + Cursor → same platform (MCP + CLI + Hub + Git) → Claude acts with your Doppler/gh auth via Claude Code
```

---

## Machine indexes (optional upload)

| File | Role |
| --- | --- |
| `claude-full-integration-catalog-v1.json` | Integration metadata |
| `claude-cli-command-index-v1.json` | CLI lookup |
| `mcp-inventory.json` | MCP servers + env key names |
| `machines-wsl-paths-v1.json` | WSL repo paths |

---

## Refresh

Git source: `CapitalGlass-Cross-Agent/agent-onboarding/claude/` → republish to this Z: folder.
