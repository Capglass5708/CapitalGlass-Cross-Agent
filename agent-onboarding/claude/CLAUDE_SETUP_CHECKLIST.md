# Claude Full Integration — Setup Checklist

**Folder:** `Z:\Capital-Glass-Dev\Claude Start Package`  
**Goal:** Claude operates on your behalf with **full platform auth + CLI**

---

## Required — Claude Project (upload all 8)

| # | File |
| --- | --- |
| 1 | `CLAUDE_ESTATE_AWARENESS_PACK_v1.md` |
| 2 | `CLAUDE_WSL_EXECUTION_POLICY.md` |
| 3 | `CLAUDE_MCP_AND_PROTOCOL_GUIDE_V1.md` |
| 4 | `CLAUDE_PARALLEL_OPERATION_GUIDE_V1.md` |
| 5 | **`CLAUDE_AUTH_AND_CREDENTIALS_GUIDE_V1.md`** |
| 6 | **`CLAUDE_CLI_OPERATOR_REFERENCE_V1.md`** |
| 7 | **`CLAUDE_CODE_MCP_WIRING_V1.md`** |
| 8 | **`CLAUDE_OPERATOR_DAILY_PREFLIGHT_V1.md`** |

## Required — Project settings

| # | Action |
| --- | --- |
| 9 | Paste **`CLAUDE_CUSTOM_INSTRUCTIONS.txt`** into Custom instructions |
| 10 | Name Project e.g. **Capital Glass** |

## Required — Live auth + MCP (operator)

| # | Action |
| --- | --- |
| 11 | WSL: `doppler login` + `gh auth login` |
| 12 | Windows: `Start-CgMcpForCursor.ps1` → mcp-api :3001 up |
| 13 | WSL: `npm run wsl:mcp:repair -- --json` |
| 14 | Wire **Claude Code** MCP (same as `~/.cursor/mcp.json`) |
| 15 | Run **`CLAUDE_OPERATOR_DAILY_PREFLIGHT_V1.md`** — all gates pass |

## Recommended — optional uploads

| File | Purpose |
| --- | --- |
| `claude-full-integration-catalog-v1.json` | Structured integration index |
| `claude-cli-command-index-v1.json` | CLI lookup |
| `mcp-inventory.json` | MCP inventory mirror |
| `machines-wsl-paths-v1.json` | WSL path map |
| `CLAUDE_FULL_OPERATOR_INDEX.md` | Master doc index |

---

## Integration complete when

| Check | Pass? |
| --- | --- |
| All 8 docs uploaded + custom instructions pasted | ☐ |
| `doppler login` + `gh auth status` OK in WSL | ☐ |
| `curl http://127.0.0.1:3001/health` OK | ☐ |
| `npm run wsl:mcp:verify -- --json` PASS | ☐ |
| Claude Code MCP connected | ☐ |
| Claude cites clientSurface=CLAUDE + parallel lane | ☐ |
| Claude runs scout → ledger → Luna on material open | ☐ |
| Claude refuses dual-writer without confirmation | ☐ |
| **No secrets** in Project uploads | ☐ |

---

## Test prompt (full auth + CLI)

```text
Run daily preflight in WSL, then tell me which MCPs and CLI commands you would use
to investigate a Document Center deploy gate failure — including Doppler project names
and owner repo path. Confirm you will not paste secret values.
```

Correct: WSL paths, `cg-documents` / app MCP, Diagnostic preflight, `HOST_MODE_BLOCKED` for `/mnt/c`.
