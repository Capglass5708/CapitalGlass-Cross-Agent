# Claude Full Operator Index — Auth + CLI + MCP

**Folder:** `Z:\Capital-Glass-Dev\Claude Start Package`  
**Purpose:** Everything Claude needs to **act on Wesley's behalf** with platform auth and CLI

---

## Layer 1 — Knowledge (upload to Claude Project)

| # | File | Role |
| --- | --- | --- |
| 1 | `CLAUDE_ESTATE_AWARENESS_PACK_v1.md` | Estate map |
| 2 | `CLAUDE_WSL_EXECUTION_POLICY.md` | WSL-only execution |
| 3 | `CLAUDE_MCP_AND_PROTOCOL_GUIDE_V1.md` | MCP tiers + protocols |
| 4 | `CLAUDE_PARALLEL_OPERATION_GUIDE_V1.md` | Cursor parallel lanes |
| 5 | **`CLAUDE_AUTH_AND_CREDENTIALS_GUIDE_V1.md`** | **Doppler, gh, az, OAuth — no secrets** |
| 6 | **`CLAUDE_CLI_OPERATOR_REFERENCE_V1.md`** | **Full npm/gh CLI reference** |
| 7 | **`CLAUDE_CODE_MCP_WIRING_V1.md`** | **Wire live MCP in Claude Code** |
| 8 | **`CLAUDE_OPERATOR_DAILY_PREFLIGHT_V1.md`** | **2-min preflight before acting** |

**Paste:** `CLAUDE_CUSTOM_INSTRUCTIONS.txt`

---

## Layer 2 — Machine indexes (optional upload)

| File | Role |
| --- | --- |
| `claude-full-integration-catalog-v1.json` | Integration metadata |
| `claude-cli-command-index-v1.json` | CLI command lookup |
| `mcp-inventory.json` | MCP server + env key names |
| `machines-wsl-paths-v1.json` | WSL repo paths |

---

## Layer 3 — Live connection (operator — not uploaded)

| Step | Action |
| --- | --- |
| A | `doppler login` + `gh auth login` in WSL |
| B | Start PM2: `Start-CgMcpForCursor.ps1` (Windows) |
| C | `npm run wsl:mcp:repair -- --json` |
| D | Wire Claude Code MCP from `~/.cursor/mcp.json` |
| E | Daily: `CLAUDE_OPERATOR_DAILY_PREFLIGHT_V1.md` |

---

## Quick start order

1. Read **`START_HERE.md`**
2. Complete **`CLAUDE_SETUP_CHECKLIST.md`**
3. Operator runs auth + MCP wiring (**layers 2–3**)
4. Claude runs daily preflight before material work
5. Use **`CLAUDE_CLI_OPERATOR_REFERENCE_V1.md`** during missions

---

## What Claude can do when fully wired

| Capability | Via |
| --- | --- |
| Read estate status | Hub scout, ledger, Luna |
| Plan / investigate | Luna, Failure Intelligence, app MCPs |
| GitHub PRs / CI | GitHub MCP + `gh` |
| Deploy gates / health | Diagnostic MCP, app gates |
| Cross-app wiring | Suite Wiring MCP |
| Secrets **names** | Doppler MCP |
| SharePoint / M365 ops | SharePoint MCP |
| Office IT planning | Office Admin MCP (read-only) |
| Multi-step waves | WaveRunner CLI |
| Session receipts | Auto v3.2 closeout |

**Cannot via MCP alone:** execute Office Admin Windows scripts, read vault contents, bypass branch protection.

---

## Engineering still pending (not blocking knowledge pack)

- `clientSurface=CLAUDE` in platform closeout schema
- `agent:client:preflight -- --client=CLAUDE` CLI
- WSL-native MCP bridge v1.2 (peer desk)

See `CAPITAL_GLASS_CLAUDE_FULL_ESTATE_PLATFORM_INTEGRATION_V1.md`.
